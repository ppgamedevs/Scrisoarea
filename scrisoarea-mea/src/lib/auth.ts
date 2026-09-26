import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
    sendPartnerVerificationEmail,
    sendPasswordResetEmail,
    sendVerificationEmail,
} from "@/lib/email"

const appUrl =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "sqlite",
    }),
    baseURL: appUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "DONOR",
                input: false,
            },
            firstName: {
                type: "string",
                required: false,
                input: true,
            },
            lastName: {
                type: "string",
                required: false,
                input: true,
            },
            institutionId: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            // Await so Resend failures surface instead of silent void drops
            await sendPasswordResetEmail({
                to: user.email,
                url,
                name: user.name,
            })
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            if (process.env.NODE_ENV !== "production") {
                console.log("[AUTH EMAIL] Verification requested")
            }
            const role = (user as { role?: string }).role
            // Use Better Auth URL as-is — do not invent tokens/codes
            if (role === "PARTNER") {
                await sendPartnerVerificationEmail({
                    to: user.email,
                    url,
                    name: user.name,
                })
            } else {
                await sendVerificationEmail({
                    to: user.email,
                    url,
                    name: user.name,
                })
            }
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const firstName = (user as { firstName?: string }).firstName
                    const lastName = (user as { lastName?: string }).lastName
                    const nameFromParts = [firstName, lastName].filter(Boolean).join(" ").trim()

                    // Partner registration creates the Institution row first (contactEmail = user email).
                    // Resolve role before emailVerification.sendOnSignUp so the correct template is used.
                    const pendingInstitution = await prisma.institution.findFirst({
                        where: {
                            contactEmail: user.email,
                            verified: false,
                        },
                        orderBy: { createdAt: "desc" },
                        select: { id: true },
                    })

                    return {
                        data: {
                            ...user,
                            name: user.name?.trim() || nameFromParts || user.email.split("@")[0],
                            role: pendingInstitution ? "PARTNER" : (user as { role?: string }).role || "DONOR",
                            institutionId:
                                pendingInstitution?.id ||
                                (user as { institutionId?: string | null }).institutionId ||
                                null,
                        },
                    }
                },
            },
        },
    },
    plugins: [nextCookies()],
})

export type SessionUser = {
    id: string
    email: string
    name: string
    emailVerified: boolean
    role: "DONOR" | "PARTNER" | "SPONSOR" | "ADMIN"
    firstName?: string | null
    lastName?: string | null
    institutionId?: string | null
    image?: string | null
}

/** @deprecated Prefer SessionUser */
export type UserSession = SessionUser

function mapUser(user: Record<string, unknown>): SessionUser {
    return {
        id: String(user.id),
        email: String(user.email),
        name: String(user.name || ""),
        emailVerified: Boolean(user.emailVerified),
        role: (user.role as SessionUser["role"]) || "DONOR",
        firstName: (user.firstName as string | null | undefined) ?? null,
        lastName: (user.lastName as string | null | undefined) ?? null,
        institutionId: (user.institutionId as string | null | undefined) ?? null,
        image: (user.image as string | null | undefined) ?? null,
    }
}

export async function getSession(): Promise<SessionUser | null> {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session?.user) return null
    return mapUser(session.user as unknown as Record<string, unknown>)
}

export async function requireUser(loginPath = "/login"): Promise<SessionUser> {
    const user = await getSession()
    if (!user) redirect(loginPath)
    return user
}

export async function requireDonor(): Promise<SessionUser> {
    const user = await requireUser("/login")
    if (user.role !== "DONOR" && user.role !== "SPONSOR") {
        redirect("/")
    }
    if (!user.emailVerified) redirect("/verify-email")
    return user
}

export async function requirePartner(): Promise<SessionUser> {
    const user = await requireUser("/partner/login")
    if (user.role !== "PARTNER") redirect("/partner/login")
    if (!user.emailVerified) redirect("/verify-email?portal=partner")
    return user
}

export async function requireVerifiedPartner(): Promise<SessionUser> {
    const user = await requirePartner()
    if (!user.institutionId) redirect("/partner/pending-approval")

    const institution = await prisma.institution.findUnique({
        where: { id: user.institutionId },
        select: { verified: true },
    })
    if (!institution?.verified) redirect("/partner/pending-approval")
    return user
}

export async function requireAdmin(): Promise<SessionUser> {
    const user = await requireUser("/admin/login")
    if (user.role !== "ADMIN") redirect("/admin/login?error=AccessDenied")
    return user
}

export function safeReturnTo(value: string | null | undefined, fallback: string): string {
    if (!value) return fallback
    if (!value.startsWith("/")) return fallback
    if (value.startsWith("//")) return fallback
    if (value.includes("://")) return fallback
    return value
}
