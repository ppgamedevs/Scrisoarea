import { existsSync, readFileSync } from "fs"
import { createClient } from "@libsql/client"

function loadEnv(p: string) {
    if (!existsSync(p)) return
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith("#")) continue
        const i = t.indexOf("=")
        if (i < 0) continue
        let k = t.slice(0, i).trim()
        let v = t.slice(i + 1).trim()
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1)
        }
        if (v && v !== "[SENSITIVE]") process.env[k] = v
    }
}

loadEnv(".env")
loadEnv(".env.vercel.production")

const url = process.env.TURSO_DATABASE_URL
const tok = process.env.TURSO_AUTH_TOKEN
if (!url || !tok) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN")
    process.exit(1)
}

const c = createClient({ url, authToken: tok })
const cols = [
    "fatherInitial",
    "street",
    "streetNumber",
    "bloc",
    "scara",
    "etaj",
    "apartament",
    "postalCode",
]

async function main() {
    for (const col of cols) {
        try {
            await c.execute(`ALTER TABLE TaxRedirectionRequest ADD COLUMN ${col} TEXT`)
            console.log("added", col)
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
            console.log("skip", col, msg.slice(0, 100))
        }
    }
}

main()
