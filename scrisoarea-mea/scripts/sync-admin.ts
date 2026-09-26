/**
 * Upserts the ADMIN user from ADMIN_EMAIL + ADMIN_PASSWORD env vars.
 * Usage: npm run db:sync-admin
 */
import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { hash } from "bcryptjs"

// Same resolution as src/lib/prisma.ts — local sqlite by default
const url = process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db"
const adapter = new PrismaLibSQL({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim()
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
        throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env / .env.local")
    }

    const passwordHash = await hash(password, 10)

    await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            role: "ADMIN",
        },
        create: {
            email,
            passwordHash,
            role: "ADMIN",
            firstName: "Admin",
            lastName: "Vise",
        },
    })

    console.log(`Admin synced from env: ${email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
