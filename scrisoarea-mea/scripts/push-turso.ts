import { createClient } from "@libsql/client"
import { execFileSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import path from "path"

function loadEnvFile(filePath: string) {
    if (!existsSync(filePath)) return
    const text = readFileSync(filePath, "utf8")
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eq = trimmed.indexOf("=")
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        if (!process.env[key]) process.env[key] = value
    }
}

loadEnvFile(path.join(process.cwd(), ".env.local"))
loadEnvFile(path.join(process.cwd(), ".env"))

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required to push the schema.")
}

const tursoUrl: string = url
const tursoToken: string = authToken

const sql = execFileSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["prisma", "migrate", "diff", "--from-empty", "--to-schema-datamodel", "prisma/schema.prisma", "--script"],
    { encoding: "utf8", cwd: process.cwd(), shell: process.platform === "win32" }
)

async function main() {
    const client = createClient({ url: tursoUrl, authToken: tursoToken })
    await client.executeMultiple(sql)
    console.log("Schema applied to Turso.")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
