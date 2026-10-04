import { writeFileSync, existsSync, readFileSync } from "fs"
import { generateOfficialForm230, getForm230FiscalYear } from "../src/lib/pdf/form230"

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
        if (v && v !== "[SENSITIVE]" && !process.env[k]) process.env[k] = v
    }
}

loadEnv(".env")

const pngB64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC"

async function main() {
    process.env.FORM_230_FISCAL_YEAR ||= "2026"
    process.env.ASSOCIATION_IBAN ||= "RO22RNCB0280187121730001"
    console.log("fiscalYear", getForm230FiscalYear())

    const bytes = await generateOfficialForm230({
        lastName: "Popescu",
        fatherInitial: "I",
        firstName: "Ion",
        cnp: "1900101123456",
        email: "ion@example.com",
        phone: "0722123456",
        street: "Victoriei",
        streetNumber: "10",
        bloc: "A",
        scara: "1",
        etaj: "2",
        apartament: "5",
        county: "Bucuresti",
        city: "Sector 1",
        postalCode: "010101",
        signatureBase64: `data:image/png;base64,${pngB64}`,
        optionTwoYears: true,
        shareDataWithBeneficiary: true,
    })

    writeFileSync("private/forms/_smoke-form230.pdf", bytes)
    console.log("wrote private/forms/_smoke-form230.pdf", bytes.length, "bytes")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
