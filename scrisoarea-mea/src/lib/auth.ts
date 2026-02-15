import { Lucia } from "lucia"
import { PrismaAdapter } from "@lucia-auth/adapter-prisma"
import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { compare, hash } from "bcryptjs"

const adapter = new PrismaAdapter(prisma.session, prisma.user)

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
            role: attributes.role as 'ADMIN' | 'PARTNER' | 'DONOR' | 'SPONSOR',
            institutionId: attributes.institutionId
        }
    }
})

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia
        DatabaseUserAttributes: DatabaseUserAttributes
    }
}

interface DatabaseUserAttributes {
    email: string
    role: string // Should be enum in DB but string in runtime if we cast
    institutionId?: string
}

export type UserSession = {
    id: string
    email: string
    role: 'ADMIN' | 'PARTNER' | 'DONOR' | 'SPONSOR'
    institutionId?: string
}

export const validateRequest = async (): Promise<{ user: UserSession; session: import("lucia").Session } | { user: null; session: null }> => {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null
    if (!sessionId) {
        return {
            user: null,
            session: null
        }
    }

    const result = await lucia.validateSession(sessionId)
    // next.js throws when you attempt to set cookie when rendering page
    try {
        if (result.session && result.session.fresh) {
            const sessionCookie = lucia.createSessionCookie(result.session.id)
            const cookieStore = await cookies()
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        }
        if (!result.session) {
            const sessionCookie = lucia.createBlankSessionCookie()
            const cookieStore = await cookies()
            cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        }
    } catch { }
    return result as any
}

export const getSession = async (): Promise<UserSession | null> => {
    const { user } = await validateRequest()
    return user
}

export async function login(email: string, password?: string, portal: 'ADMIN' | 'PARTNER' | 'DONOR' | 'SPONSOR' = 'DONOR') {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error("Email sau parola incorecta.")

    if (!password) {
        throw new Error("Parola este obligatorie.")
    }

    const validPassword = await compare(password, user.passwordHash)
    if (!validPassword) throw new Error("Email sau parola incorecta.")

    // Check Portal Access
    if (portal === 'ADMIN' && user.role !== 'ADMIN') throw new Error("Nu aveti acces la panoul de administrare.")
    if (portal === 'PARTNER' && user.role !== 'PARTNER') throw new Error("Nu aveti acces la panoul de partener.")
    if (portal === 'DONOR') {
        const allowed = user.role === 'DONOR' || user.role === 'SPONSOR' || user.role === 'ADMIN'
        if (!allowed) throw new Error("Contul nu are acces de donator.")
    }

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    const cookieStore = await cookies()
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return user.role as 'ADMIN' | 'PARTNER' | 'DONOR' | 'SPONSOR'
}


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
    role?: 'ADMIN' | 'PARTNER' | 'DONOR' | 'SPONSOR'
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
    const passwordHash = await hash(password, 10)

    // 3. Create User (Unverified)
    const newUser = await prisma.user.create({
        data: {
            email,
            passwordHash,
            firstName,
            lastName,
            role: role, // Prisma expects string-able enum, string works if it matches
            institutionId
        }
    })

    // 4. Generate & Send Verification Code (No Session Created Yet)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    await prisma.emailVerificationCode.create({
        data: {
            code,
            userId: newUser.id,
            email,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
    })

    const { sendEmail } = await import("@/lib/email")
    await sendEmail({
        to: email,
        template: 'VERIFICATION_CODE',
        data: { code }
    })

    return newUser
}

export async function verifyEmailCode(email: string, code: string) {
    const verification = await prisma.emailVerificationCode.findFirst({
        where: { email, code },
        include: { user: true }
    })

    if (!verification) {
        throw new Error("Cod invalid.")
    }

    if (verification.expiresAt < new Date()) {
        throw new Error("Cod expirat.")
    }

    // Activate User
    await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: new Date() }
    })

    // Cleanup codes
    await prisma.emailVerificationCode.deleteMany({
        where: { userId: verification.userId }
    })

    // Create Session
    const session = await lucia.createSession(verification.userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    const cookieStore = await cookies()
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return session
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
