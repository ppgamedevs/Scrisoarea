import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    },
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            role: attributes.role,
            institutionId: attributes.institutionId
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
    role: 'ADMIN' | 'PARTNER' | 'DONOR';
    institutionId?: string;
}

export type UserSession = {
    id: string
    email: string
    role: 'ADMIN' | 'PARTNER' | 'DONOR'
    institutionId?: string
}

export async function validateRequest() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
        return {
            user: null,
            session: null
        };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
    } catch { }
    return result;
}

// Backward compatibility or easier usage
export async function getSession(): Promise<UserSession | null> {
    const { user } = await validateRequest()
    if (!user) return null
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId
    }
}

export async function login(email: string, password?: string, portal: 'DONOR' | 'PARTNER' | 'ADMIN' = 'DONOR') {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error("Email sau parola incorecta.")

    // Verify Password if provided (for MVP transition allow empty/mock if we want, but better strictly check)
    // The previous implementation didn't check password. We should check it now if we have hash.
    // If user has no hash (old users?), we might have issues. But we seeded correctly.

    if (!password) {
        // For now, if no password provided (legacy calls?), we might throw or allow if only explicit dev mode.
        // But user asked for "Email + Password".
        throw new Error("Parola este obligatorie.")
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) throw new Error("Email sau parola incorecta.")

    // Check Portal Access
    if (portal === 'ADMIN' && user.role !== 'ADMIN') throw new Error("Nu aveti acces la panoul de administrare.")
    if (portal === 'PARTNER' && user.role !== 'PARTNER') throw new Error("Nu aveti acces la panoul de partener.")
    if (portal === 'DONOR' && user.role !== 'DONOR' && user.role !== 'ADMIN') {
        // Admins can probably login as donors or maybe not? 
        // User said: "portal donor accepta rol donor"
        // Strict mapping:
        if (user.role !== 'DONOR') throw new Error("Contul nu este de tip Donator.")
    }

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    const cookieStore = await cookies()
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return user.role
}

// ... (previous imports)

export async function registerUser({
    email,
    password,
    firstName,
    lastName,
    role = 'DONOR',
    institutionId
}: {
    email: string
    password?: string
    firstName?: string
    lastName?: string
    role?: 'DONOR' | 'PARTNER' | 'ADMIN'
    institutionId?: string
}) {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
        throw new Error("Există deja un cont cu acest email.")
    }

    // 2. Hash password
    if (!password || password.length < 6) {
        throw new Error("Parola trebuie să aibă cel puțin 6 caractere.")
    }
    const passwordHash = await bcrypt.hash(password, 10)

    // 3. Create User
    const newUser = await prisma.user.create({
        data: {
            email,
            passwordHash,
            firstName,
            lastName,
            role,
            institutionId
        }
    })

    // 4. Create Session (auto-login)
    const session = await lucia.createSession(newUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    const cookieStore = await cookies()
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return newUser
}

export async function logout() {
    const { session } = await validateRequest();
    if (!session) {
        return;
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    const cookieStore = await cookies()
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}
