/**
 * Align production Turso schema with current Prisma models.
 * Safe additive migration (keeps existing data).
 */
import { createClient } from "@libsql/client"
import { randomBytes } from "crypto"
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

function cuidLike() {
    return `c${randomBytes(12).toString("hex")}`
}

async function columnNames(client: ReturnType<typeof createClient>, table: string) {
    const cols = await client.execute(`PRAGMA table_info(${table})`)
    return new Set(cols.rows.map((r) => String(r.name)))
}

async function tableExists(client: ReturnType<typeof createClient>, table: string) {
    const r = await client.execute({
        sql: "SELECT 1 AS ok FROM sqlite_master WHERE type='table' AND name=? LIMIT 1",
        args: [table],
    })
    return r.rows.length > 0
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
        return
    }
    await client.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
    console.log(`added ${table}.${column}`)
}

async function main() {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!url || !authToken || authToken === "[SENSITIVE]") {
        throw new Error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN required")
    }

    const client = createClient({ url, authToken })
    console.log("Connected to", url.slice(0, 40))

    // --- Scrisoare moderation/pricing columns ---
    await addColumnIfMissing(
        client,
        "Scrisoare",
        "submittedTargetAmount",
        "submittedTargetAmount DECIMAL NOT NULL DEFAULT 0"
    )
    await addColumnIfMissing(
        client,
        "Scrisoare",
        "approvedTargetAmount",
        "approvedTargetAmount DECIMAL"
    )
    await addColumnIfMissing(client, "Scrisoare", "partnerNotes", "partnerNotes TEXT")
    await addColumnIfMissing(client, "Scrisoare", "adminNotes", "adminNotes TEXT")
    await addColumnIfMissing(client, "Scrisoare", "approvedAt", "approvedAt DATETIME")
    await addColumnIfMissing(client, "Scrisoare", "approvedById", "approvedById TEXT")
    await addColumnIfMissing(client, "Scrisoare", "rejectedAt", "rejectedAt DATETIME")
    await addColumnIfMissing(client, "Scrisoare", "rejectedById", "rejectedById TEXT")

    await client.execute(`
      UPDATE Scrisoare
      SET submittedTargetAmount = targetAmount
      WHERE submittedTargetAmount = 0 OR submittedTargetAmount IS NULL
    `)
    console.log("backfilled submittedTargetAmount from targetAmount")

    // --- Better Auth: user columns ---
    await addColumnIfMissing(client, "user", "name", "name TEXT NOT NULL DEFAULT ''")
    await addColumnIfMissing(client, "user", "image", "image TEXT")

    await client.execute(`
      UPDATE user
      SET name = TRIM(COALESCE(firstName, '') || ' ' || COALESCE(lastName, ''))
      WHERE name IS NULL OR name = ''
    `)
    await client.execute(`
      UPDATE user
      SET name = substr(email, 1, instr(email, '@') - 1)
      WHERE name IS NULL OR name = ''
    `)
    console.log("backfilled user.name")

    // emailVerified was DateTime in Lucia; Better Auth expects boolean 0/1.
    // Recreate as integer boolean while preserving "verified if not null".
    const userCols = await columnNames(client, "user")
    if (userCols.has("emailVerified")) {
        // Check whether values look like dates (non 0/1)
        const sample = await client.execute(
            "SELECT typeof(emailVerified) AS t, emailVerified AS v FROM user LIMIT 5"
        )
        console.log("emailVerified samples:", JSON.stringify(sample.rows))

        await client.execute("ALTER TABLE user ADD COLUMN emailVerified_ba INTEGER NOT NULL DEFAULT 0")
        await client.execute(`
          UPDATE user
          SET emailVerified_ba = CASE
            WHEN emailVerified IS NULL THEN 0
            WHEN emailVerified = 0 THEN 0
            WHEN emailVerified = 1 THEN 1
            ELSE 1
          END
        `)
        // Rebuild user table without old emailVerified / passwordHash later after account migration
        console.log("prepared emailVerified_ba")
    }

    // --- Account table + migrate passwordHash ---
    if (!(await tableExists(client, "account"))) {
        await client.execute(`
          CREATE TABLE account (
            id TEXT PRIMARY KEY NOT NULL,
            accountId TEXT NOT NULL,
            providerId TEXT NOT NULL,
            userId TEXT NOT NULL,
            accessToken TEXT,
            refreshToken TEXT,
            idToken TEXT,
            accessTokenExpiresAt DATETIME,
            refreshTokenExpiresAt DATETIME,
            scope TEXT,
            password TEXT,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
          )
        `)
        await client.execute("CREATE INDEX account_userId_idx ON account(userId)")
        console.log("created account")
    }

    const usersWithPassword = await client.execute(
        "SELECT id, email, passwordHash FROM user WHERE passwordHash IS NOT NULL AND passwordHash != ''"
    )
    for (const row of usersWithPassword.rows) {
        const userId = String(row.id)
        const existing = await client.execute({
            sql: "SELECT id FROM account WHERE userId = ? AND providerId = 'credential' LIMIT 1",
            args: [userId],
        })
        if (existing.rows.length) continue
        const now = new Date().toISOString()
        await client.execute({
            sql: `INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
                  VALUES (?, ?, 'credential', ?, ?, ?, ?)`,
            args: [cuidLike(), String(row.email), userId, String(row.passwordHash), now, now],
        })
    }
    console.log(`migrated ${usersWithPassword.rows.length} credential accounts`)

    // --- Verification table ---
    if (!(await tableExists(client, "verification"))) {
        await client.execute(`
          CREATE TABLE verification (
            id TEXT PRIMARY KEY NOT NULL,
            identifier TEXT NOT NULL,
            value TEXT NOT NULL,
            expiresAt DATETIME NOT NULL,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
          )
        `)
        await client.execute("CREATE INDEX verification_identifier_idx ON verification(identifier)")
        console.log("created verification")
    }

    // --- Rebuild session for Better Auth ---
    const sessionCols = await columnNames(client, "session")
    if (!sessionCols.has("token")) {
        await client.execute("DROP TABLE IF EXISTS session")
        await client.execute(`
          CREATE TABLE session (
            id TEXT PRIMARY KEY NOT NULL,
            expiresAt DATETIME NOT NULL,
            token TEXT NOT NULL UNIQUE,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            ipAddress TEXT,
            userAgent TEXT,
            userId TEXT NOT NULL
          )
        `)
        await client.execute("CREATE INDEX session_userId_idx ON session(userId)")
        console.log("recreated session for Better Auth")
    } else {
        console.log("session already has token")
    }

    // --- Rebuild user table to finalize Better Auth columns ---
    // Drop passwordHash, replace emailVerified with boolean
    const finalCols = await columnNames(client, "user")
    if (finalCols.has("passwordHash") || finalCols.has("emailVerified_ba")) {
        await client.execute("BEGIN")
        try {
            await client.execute(`
              CREATE TABLE user_new (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                emailVerified INTEGER NOT NULL DEFAULT 0,
                image TEXT,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL,
                role TEXT NOT NULL DEFAULT 'DONOR',
                firstName TEXT,
                lastName TEXT,
                lastLoginAt DATETIME,
                institutionId TEXT
              )
            `)
            await client.execute(`
              INSERT INTO user_new (
                id, name, email, emailVerified, image, createdAt, updatedAt,
                role, firstName, lastName, lastLoginAt, institutionId
              )
              SELECT
                id,
                COALESCE(NULLIF(name, ''), email),
                email,
                COALESCE(emailVerified_ba, CASE WHEN emailVerified IS NOT NULL AND emailVerified != 0 THEN 1 ELSE 0 END, 0),
                image,
                createdAt,
                updatedAt,
                COALESCE(role, 'DONOR'),
                firstName,
                lastName,
                lastLoginAt,
                institutionId
              FROM user
            `)
            await client.execute("DROP TABLE user")
            await client.execute("ALTER TABLE user_new RENAME TO user")
            await client.execute("CREATE INDEX IF NOT EXISTS user_role_idx ON user(role)")
            await client.execute("COMMIT")
            console.log("rebuilt user table for Better Auth")
        } catch (e) {
            await client.execute("ROLLBACK")
            throw e
        }
    }

    // Final check
    const scrisoareCols = await columnNames(client, "Scrisoare")
    const userFinal = await columnNames(client, "user")
    const sessionFinal = await columnNames(client, "session")
    console.log("Scrisoare has submittedTargetAmount:", scrisoareCols.has("submittedTargetAmount"))
    console.log("user cols:", [...userFinal].join(", "))
    console.log("session cols:", [...sessionFinal].join(", "))
    console.log("DONE")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
