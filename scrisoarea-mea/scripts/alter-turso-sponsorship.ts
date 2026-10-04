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
    console.error("Missing Turso credentials")
    process.exit(1)
}

const c = createClient({ url, authToken: tok })

const stmts = [
    `CREATE TABLE IF NOT EXISTS ContractNumberSequence (
      year INTEGER PRIMARY KEY NOT NULL,
      lastSeq INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS CompanySponsorshipRequest (
      id TEXT PRIMARY KEY NOT NULL,
      flowType TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      fiscalYear INTEGER NOT NULL,
      companyName TEXT NOT NULL,
      companyCif TEXT NOT NULL,
      regCom TEXT,
      taxRegime TEXT NOT NULL DEFAULT 'UNKNOWN',
      representativeName TEXT NOT NULL,
      representativeRole TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      county TEXT NOT NULL,
      city TEXT NOT NULL,
      street TEXT NOT NULL,
      streetNumber TEXT NOT NULL,
      building TEXT,
      entrance TEXT,
      floor TEXT,
      apartment TEXT,
      postalCode TEXT,
      sponsorshipAmount DECIMAL,
      maximumRedirectableAmount DECIMAL,
      previouslyRedirectedAmount DECIMAL,
      remainingRedirectableAmount DECIMAL,
      requestedRedirectAmount DECIMAL,
      periodStart DATETIME,
      periodEnd DATETIME,
      contractNumber TEXT,
      contractDate DATETIME,
      contractPdfUrl TEXT,
      draft177PdfUrl TEXT,
      disclosureConsent INTEGER NOT NULL DEFAULT 0,
      beneficiaryName TEXT,
      beneficiaryCif TEXT,
      beneficiaryIban TEXT,
      signatureUrl TEXT,
      consentTerms INTEGER NOT NULL DEFAULT 0,
      consentPrivacy INTEGER NOT NULL DEFAULT 0,
      profitTaxConfirm INTEGER NOT NULL DEFAULT 0,
      anafNotes TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS CompanySponsorshipRequest_contractNumber_key ON CompanySponsorshipRequest(contractNumber)`,
    `CREATE INDEX IF NOT EXISTS CompanySponsorshipRequest_flowType_idx ON CompanySponsorshipRequest(flowType)`,
    `CREATE INDEX IF NOT EXISTS CompanySponsorshipRequest_status_idx ON CompanySponsorshipRequest(status)`,
    `CREATE INDEX IF NOT EXISTS CompanySponsorshipRequest_fiscalYear_idx ON CompanySponsorshipRequest(fiscalYear)`,
    `CREATE INDEX IF NOT EXISTS CompanySponsorshipRequest_email_idx ON CompanySponsorshipRequest(email)`,
    `CREATE INDEX IF NOT EXISTS CompanySponsorshipRequest_companyCif_idx ON CompanySponsorshipRequest(companyCif)`,
    `CREATE INDEX IF NOT EXISTS CompanySponsorshipRequest_createdAt_idx ON CompanySponsorshipRequest(createdAt)`,
]

async function main() {
    for (const s of stmts) {
        try {
            await c.execute(s)
            console.log("ok", s.slice(0, 60).replace(/\s+/g, " "))
        } catch (e: unknown) {
            console.log("skip", e instanceof Error ? e.message : e)
        }
    }
}

main()
