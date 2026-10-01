import { createClient } from "@libsql/client"
import { existsSync, readFileSync } from "fs"
import path from "path"

function loadEnvFile(filePath) {
    if (!existsSync(filePath)) return
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eq = trimmed.indexOf("=")
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        process.env[key] = value
    }
}

loadEnvFile(path.join(process.cwd(), ".env.production.local"))

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
})

const letters = await db.execute(`
  SELECT s.id, s.publicCode, s.slug, s.childFirstName, s.childAge, s.category, s.status,
         s.moderationStatus, s.targetAmount, s.approvedTargetAmount, s.collectedAmount,
         s.childStory, s.wishList, s.originalImgUrl, i.publicName, i.name, i.slug AS instSlug, i.id AS institutionId
  FROM Scrisoare s
  LEFT JOIN Institution i ON i.id = s.institutionId
  ORDER BY s.createdAt DESC
`)

const institutions = await db.execute(`
  SELECT id, name, publicName, slug, verified, county, city FROM Institution
`)

console.log(JSON.stringify({
    institutions: institutions.rows,
    letters: letters.rows.map((r) => ({
        id: r.id,
        publicCode: r.publicCode,
        slug: r.slug,
        name: r.childFirstName,
        age: r.childAge,
        category: r.category,
        status: r.status,
        moderation: r.moderationStatus,
        target: String(r.targetAmount),
        approved: r.approvedTargetAmount == null ? null : String(r.approvedTargetAmount),
        collected: String(r.collectedAmount),
        story: r.childStory,
        items: r.wishList,
        image: r.originalImgUrl,
        institution: r.publicName || r.name,
        institutionId: r.institutionId,
        instSlug: r.instSlug,
    })),
}, null, 2))
