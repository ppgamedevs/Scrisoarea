/**
 * Creates/resets ADMIN from ADMIN_EMAIL + ADMIN_PASSWORD using Better Auth.
 * Usage: npm run db:sync-admin
 *
 * Setting ADMIN_* on Vercel alone does NOT create a login — run this against the
 * production Turso DB (with TURSO_* + BETTER_AUTH_SECRET + ADMIN_* in the env file).
 *
 * Lucia password hashes are not usable — this recreates the admin credential account.
 */
import { auth } from "../src/lib/auth"
import { prisma } from "../src/lib/prisma"

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
        throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env")
    }
    if (password.length < 8) {
        throw new Error("ADMIN_PASSWORD must be at least 8 characters")
    }
    if (!process.env.BETTER_AUTH_SECRET) {
        throw new Error("Set BETTER_AUTH_SECRET in .env (e.g. openssl rand -base64 32)")
    }
    if (!process.env.TURSO_DATABASE_URL) {
        console.warn("TURSO_DATABASE_URL is not set — syncing against local sqlite.")
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        await prisma.session.deleteMany({ where: { userId: existing.id } })
        await prisma.account.deleteMany({ where: { userId: existing.id } })
        await prisma.user.delete({ where: { id: existing.id } })
    }

    // signUp may try to send a verification email; ignore delivery failures —
    // we force emailVerified + ADMIN role immediately after.
    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Admin",
                firstName: "Admin",
                lastName: "Visuri",
            },
        })
    } catch (e) {
        const created = await prisma.user.findUnique({ where: { email } })
        if (!created) throw e
        console.warn("signUpEmail reported an error (often email send); user exists, continuing…")
    }

    await prisma.user.update({
        where: { email },
        data: {
            role: "ADMIN",
            emailVerified: true,
            firstName: "Admin",
            lastName: "Visuri",
            name: "Admin",
        },
    })

    console.log(`Admin synced via Better Auth: ${email}`)
    console.log("You can now sign in at /admin/login with ADMIN_EMAIL / ADMIN_PASSWORD.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
