/**
 * Sync ADMIN to production Turso with password Devine12.
 *
 *   npx vercel env pull .env.vercel.production --environment production --yes
 *   npx tsx scripts/sync-admin-prod.ts
 */
import { readFileSync, existsSync } from "fs"
import { createClient } from "@libsql/client"

function loadEnvFile(path: string) {
    if (!existsSync(path)) return
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith("#")) continue
        const i = t.indexOf("=")
        if (i === -1) continue
        const k = t.slice(0, i).trim()
        let v = t.slice(i + 1).trim()
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1)
        }
        if (v === "[SENSITIVE]") continue
        process.env[k] = v
    }
}

async function main() {
    loadEnvFile(".env")
    loadEnvFile(".env.vercel.production")

    const EMAIL = (process.env.ADMIN_EMAIL || "contact@visuripehartie.ro").trim().toLowerCase()
    const PASSWORD = "Devine12"

    process.env.ADMIN_EMAIL = EMAIL
    process.env.ADMIN_PASSWORD = PASSWORD

    if (!process.env.TURSO_DATABASE_URL?.startsWith("libsql://")) {
        throw new Error(
            "TURSO_DATABASE_URL missing. Run: npx vercel env pull .env.vercel.production --environment production --yes"
        )
    }
    if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET === "[SENSITIVE]") {
        throw new Error("BETTER_AUTH_SECRET missing from .env")
    }

    console.log("Target DB:", process.env.TURSO_DATABASE_URL.slice(0, 48))
    console.log("Admin email:", EMAIL)

    const { auth } = await import("../src/lib/auth")
    const { prisma } = await import("../src/lib/prisma")

    const existing = await prisma.user.findUnique({ where: { email: EMAIL } })
    if (existing) {
        await prisma.session.deleteMany({ where: { userId: existing.id } })
        await prisma.account.deleteMany({ where: { userId: existing.id } })
        await prisma.user.delete({ where: { id: existing.id } })
        console.log("Removed previous user/accounts/sessions")
    }

    try {
        await auth.api.signUpEmail({
            body: {
                email: EMAIL,
                password: PASSWORD,
                name: "Admin",
                firstName: "Admin",
                lastName: "Visuri",
            },
        })
    } catch (e) {
        const created = await prisma.user.findUnique({ where: { email: EMAIL } })
        if (!created) throw e
        console.warn("signUpEmail error (often email send); continuing…")
    }

    await prisma.user.update({
        where: { email: EMAIL },
        data: {
            role: "ADMIN",
            emailVerified: true,
            firstName: "Admin",
            lastName: "Visuri",
            name: "Admin",
        },
    })

    const client = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const check = await client.execute({
        sql: "SELECT email, role, emailVerified FROM user WHERE email = ?",
        args: [EMAIL],
    })
    console.log("Verified in Turso:", check.rows)
    console.log("DONE — login at /admin/login with", EMAIL, "/ Devine12")

    await prisma.$disconnect()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
