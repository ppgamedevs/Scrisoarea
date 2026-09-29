/**
 * Add missing Institution columns (and any other critical gaps) on production Turso.
 */
import { createClient } from "@libsql/client"
import { existsSync, readFileSync } from "fs"

function loadEnv(path: string) {
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
        process.env[k] = v
    }
}

loadEnv(".env.vercel.production")
loadEnv(".env")

async function columnNames(client: ReturnType<typeof createClient>, table: string) {
    const cols = await client.execute(`PRAGMA table_info(${table})`)
    return new Set(cols.rows.map((r) => String(r.name)))
}

async function addColumnIfMissing(
    client: ReturnType<typeof createClient>,
    table: string,
    column: string,
    ddl: string
) {
    const cols = await columnNames(client, table)
    if (cols.has(column)) {
        console.log(`skip ${table}.${column}`)
        return false
    }
    await client.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
    console.log(`added ${table}.${column}`)
    return true
}

async function main() {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!url || !authToken || authToken === "[SENSITIVE]") {
        throw new Error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN required")
    }

    const client = createClient({ url, authToken })
    console.log("Connected to", url.slice(0, 45))

    const before = await columnNames(client, "Institution")
    console.log("Institution before:", [...before].join(", "))

    // Match prisma Institution model
    await addColumnIfMissing(client, "Institution", "institutionType", "institutionType TEXT NOT NULL DEFAULT 'ALTUL'")
    await addColumnIfMissing(client, "Institution", "slug", "slug TEXT")
    await addColumnIfMissing(client, "Institution", "publicName", "publicName TEXT")
    await addColumnIfMissing(client, "Institution", "descriptionPublic", "descriptionPublic TEXT")
    await addColumnIfMissing(client, "Institution", "logoUrl", "logoUrl TEXT")
    await addColumnIfMissing(client, "Institution", "website", "website TEXT")
    await addColumnIfMissing(client, "Institution", "verified", "verified INTEGER NOT NULL DEFAULT 0")
    await addColumnIfMissing(client, "Institution", "county", "county TEXT NOT NULL DEFAULT ''")
    await addColumnIfMissing(client, "Institution", "city", "city TEXT NOT NULL DEFAULT ''")
    await addColumnIfMissing(client, "Institution", "addressPrivate", "addressPrivate TEXT")
    await addColumnIfMissing(client, "Institution", "contactName", "contactName TEXT")
    await addColumnIfMissing(client, "Institution", "contactEmail", "contactEmail TEXT")
    await addColumnIfMissing(client, "Institution", "contactPhone", "contactPhone TEXT")
    await addColumnIfMissing(client, "Institution", "representativeRole", "representativeRole TEXT")
    await addColumnIfMissing(client, "Institution", "cui", "cui TEXT")
    await addColumnIfMissing(client, "Institution", "createdAt", "createdAt DATETIME")
    await addColumnIfMissing(client, "Institution", "updatedAt", "updatedAt DATETIME")

    // Backfill publicName from name where empty
    await client.execute(`
      UPDATE Institution
      SET publicName = name
      WHERE publicName IS NULL OR publicName = ''
    `)

    const after = await columnNames(client, "Institution")
    console.log("Institution after:", [...after].join(", "))
    console.log("DONE")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
