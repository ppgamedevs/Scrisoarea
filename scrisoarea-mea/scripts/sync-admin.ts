/**
 * Creates/resets ADMIN from ADMIN_EMAIL + ADMIN_PASSWORD using Better Auth.
 * Usage: npm run db:sync-admin
 *
 * Lucia password hashes are not migrated — this recreates the admin credential account.
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

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        await prisma.session.deleteMany({ where: { userId: existing.id } })
        await prisma.account.deleteMany({ where: { userId: existing.id } })
        await prisma.user.delete({ where: { id: existing.id } })
    }

    await auth.api.signUpEmail({
        body: {
            email,
            password,
            name: "Admin Vise",
            firstName: "Admin",
            lastName: "Vise",
        },
    })

    await prisma.user.update({
        where: { email },
        data: {
            role: "ADMIN",
            emailVerified: true,
            firstName: "Admin",
            lastName: "Vise",
            name: "Admin Vise",
        },
    })

    console.log(`Admin synced via Better Auth: ${email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
