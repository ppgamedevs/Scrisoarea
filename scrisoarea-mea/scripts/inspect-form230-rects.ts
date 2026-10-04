import { readFileSync, writeFileSync } from "fs"
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFNumber, PDFString, PDFHexString } from "pdf-lib"

function asText(v: unknown): string {
    if (!v) return ""
    if (v instanceof PDFString || v instanceof PDFHexString) return v.decodeText()
    return String(v)
}

async function main() {
    const bytes = readFileSync("private/forms/formular-230-OPANAF-103-2025.pdf")
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const form = pdf.getForm()
    const out: any[] = []

    for (const field of form.getFields()) {
        const name = field.getName()
        const acro = field.acroField
        const widgets = acro.getWidgets()
        const rects = widgets.map((w) => {
            const rect = w.getRectangle()
            return rect
        })
        let maxLen: number | undefined
        try {
            // @ts-expect-error
            maxLen = field.getMaxLength?.()
        } catch {
            /* */
        }
        out.push({
            type: field.constructor.name,
            name,
            maxLen,
            widgets: rects.length,
            rects,
        })
    }

    writeFileSync("private/forms/form230-fields.json", JSON.stringify(out, null, 2))
    console.log("Wrote private/forms/form230-fields.json")
    console.log(JSON.stringify(out.slice(0, 25), null, 2))
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
