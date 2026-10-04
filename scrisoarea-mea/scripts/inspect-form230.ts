import { readFileSync } from "fs"
import { PDFDocument } from "pdf-lib"

async function main() {
    const bytes = readFileSync("private/forms/formular-230-OPANAF-103-2025.pdf")
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
    console.log("pages:", pdf.getPageCount())
    const form = pdf.getForm()
    const fields = form.getFields()
    console.log("fieldCount:", fields.length)
    for (const f of fields) {
        const type = f.constructor.name
        const name = f.getName()
        let extra = ""
        try {
            // @ts-expect-error optional
            if (typeof f.getText === "function") extra = ` text="${f.getText()}"`
        } catch {
            /* ignore */
        }
        console.log(`- ${type}: ${name}${extra}`)
    }
    const page = pdf.getPage(0)
    const { width, height } = page.getSize()
    console.log("page0 size:", width, height)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
