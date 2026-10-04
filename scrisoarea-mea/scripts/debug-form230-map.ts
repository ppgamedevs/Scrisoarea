import { readFileSync, writeFileSync } from "fs"
import {
    PDFDocument,
    PDFName,
    StandardFonts,
    rgb,
    PDFDict,
    PDFArray,
} from "pdf-lib"

async function main() {
    const templateBytes = readFileSync("private/forms/formular-230-OPANAF-103-2025.pdf")
    const pdf = await PDFDocument.load(templateBytes, { ignoreEncryption: true })
    const form = pdf.getForm()
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    // Try filling text fields
    const year = form.getTextField("form1[0].#subform[0].TextField13[0]")
    year.setText("2025")
    year.setFontSize(12)

    const cnp = form.getTextField("form1[0].#subform[0].TextField2[0]")
    cnp.setText("1850315410026")
    cnp.setFontSize(10)

    // Checkboxes - mark destination for nonprofit
    for (const name of [
        "form1[0].#subform[0].#field[40]",
        "form1[0].#subform[0].#field[43]",
        "form1[0].#subform[0].#field[46]",
        "form1[0].#subform[0].CheckBox1[0]",
    ]) {
        try {
            form.getCheckBox(name).check()
            console.log("checked", name)
        } catch (e) {
            console.log("checkbox fail", name, (e as Error).message)
        }
    }

    // Overlay labels on every button field to discover mapping
    const page = pdf.getPage(0)
    const fields = form.getFields()
    for (const field of fields) {
        if (!field.getName().startsWith("form1[0]") || field.getName().startsWith("1.")) continue
        const widgets = field.acroField.getWidgets()
        if (!widgets[0]) continue
        const r = widgets[0].getRectangle()
        const short = field.getName().replace("form1[0].#subform[0].", "")
        page.drawText(short.slice(0, 18), {
            x: r.x + 1,
            y: r.y + 2,
            size: 6,
            font,
            color: rgb(1, 0, 0),
        })
        // Also try draw a thin border
        page.drawRectangle({
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            borderColor: rgb(0, 0, 1),
            borderWidth: 0.5,
            opacity: 0.3,
        })
    }

    // Try setting button captions for identity-looking fields
    const buttonMap: Record<string, string> = {
        "form1[0].#subform[0].#field[3]": "NUME_TEST",
        "form1[0].#subform[0].#field[4]": "PRENUME_TEST",
        "form1[0].#subform[0].#field[6]": "I",
        "form1[0].#subform[0].#field[5]": "STRADA_TEST",
    }
    for (const [name, value] of Object.entries(buttonMap)) {
        try {
            const btn = form.getButton(name)
            btn.setText(value)
            console.log("button set", name)
        } catch (e) {
            console.log("button fail", name, (e as Error).message)
        }
    }

    form.updateFieldAppearances(font)
    const out = await pdf.save({ updateFieldAppearances: true })
    writeFileSync("private/forms/form230-debug-map.pdf", out)
    console.log("Wrote private/forms/form230-debug-map.pdf")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
