import { readFileSync, existsSync } from "fs"
import path from "path"
import {
    PDFDocument,
    StandardFonts,
    rgb,
    degrees,
} from "pdf-lib"
import {
    formatIbanDisplay,
    type SponsorshipBeneficiary,
} from "@/lib/sponsorship/beneficiary"

export type Form177DraftInput = {
    fiscalYear: number
    periodStart?: Date | null
    periodEnd?: Date | null
    companyCif: string
    companyName: string
    county: string
    city: string
    street: string
    streetNumber: string
    building?: string
    entrance?: string
    apartment?: string
    postalCode?: string
    phone?: string
    fax?: string
    email: string
    maximumRedirectableAmount: number
    previouslyRedirectedAmount: number
    remainingRedirectableAmount: number
    requestedRedirectAmount: number
    contractNumber: string
    contractDate: Date
    disclosureConsent: boolean
    signatureBase64: string
    beneficiary: SponsorshipBeneficiary
}

function resolveTemplate() {
    const candidates = [
        path.join(process.cwd(), "private/forms/formular-177-OPANAF-3562-2024.pdf"),
        path.join(process.cwd(), "public/forms/formular-177-OPANAF-3562-2024.pdf"),
    ]
    for (const p of candidates) if (existsSync(p)) return p
    throw new Error("Official Form 177 template missing (OPANAF 3562/2024)")
}

function setText(form: ReturnType<PDFDocument["getForm"]>, name: string, value: string) {
    try {
        const field = form.getTextField(name)
        field.setText(value)
        field.setFontSize(9)
    } catch {
        /* field missing or not a text field */
    }
}

function tryCheck(form: ReturnType<PDFDocument["getForm"]>, name: string, on: boolean) {
    try {
        const box = form.getCheckBox(name)
        if (on) box.check()
        else box.uncheck()
    } catch {
        /* ignore */
    }
}

async function embedSignature(pdf: PDFDocument, signatureBase64: string) {
    const raw = signatureBase64.includes(",")
        ? signatureBase64.split(",")[1]
        : signatureBase64
    const bytes = Buffer.from(raw, "base64")
    try {
        return await pdf.embedPng(bytes)
    } catch {
        return await pdf.embedJpg(bytes)
    }
}

/**
 * Fill official ANAF Form 177 (OPANAF 3562/2024) template.
 * Output is explicitly a DRAFT for accountant verification — not an ANAF-valid submission package.
 */
export async function generateForm177Draft(data: Form177DraftInput): Promise<Uint8Array> {
    const template = readFileSync(resolveTemplate())
    const pdf = await PDFDocument.load(template, { ignoreEncryption: true })
    const form = pdf.getForm()
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const page = pdf.getPage(0)
    const b = data.beneficiary

    // Fiscal year
    setText(form, "form1[0].#subform[0].TextField7[0]", String(data.fiscalYear))

    // Taxpayer identification (best-effort AcroForm mapping)
    setText(form, "form1[0].#subform[0].cif_nr[0]", data.companyCif)
    setText(form, "form1[0].#subform[0].TextField2[0]", data.companyName)
    setText(form, "form1[0].#subform[0].TextField8[0]", data.county)
    setText(form, "form1[0].#subform[0].TextField3[0]", data.city)
    setText(form, "form1[0].#subform[0].TextField3[1]", data.street)
    setText(form, "form1[0].#subform[0].TextField3[2]", data.streetNumber)
    if (data.building) setText(form, "form1[0].#subform[0].TextField3[3]", data.building)
    if (data.entrance) setText(form, "form1[0].#subform[0].TextField3[4]", data.entrance)
    if (data.apartment) setText(form, "form1[0].#subform[0].TextField3[5]", data.apartment)
    if (data.postalCode) setText(form, "form1[0].#subform[0].TextField3[6]", data.postalCode)
    if (data.phone) setText(form, "form1[0].#subform[0].TextField3[7]", data.phone)
    if (data.fax) setText(form, "form1[0].#subform[0].TextField3[8]", data.fax)
    setText(form, "form1[0].#subform[0].TextField3[9]", data.email)

    const ascii = (t: string) =>
        t
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ș|ş/gi, (m) => (m === m.toUpperCase() ? "S" : "s"))
            .replace(/ț|ţ/gi, (m) => (m === m.toUpperCase() ? "T" : "t"))

    // Amounts — overlay (AcroForm amount widgets are mostly buttons)
    const amountY = 400
    page.drawText(
        ascii(`Suma maxima: ${data.maximumRedirectableAmount.toFixed(2)} RON`),
        { x: 50, y: amountY, size: 9, font, color: rgb(0, 0, 0) }
    )
    page.drawText(
        ascii(
            `Suma redirectionata anterior (177): ${data.previouslyRedirectedAmount.toFixed(2)} RON`
        ),
        { x: 50, y: amountY - 14, size: 9, font, color: rgb(0, 0, 0) }
    )
    page.drawText(
        ascii(`Suma ramasa: ${data.remainingRedirectableAmount.toFixed(2)} RON`),
        { x: 50, y: amountY - 28, size: 9, font, color: rgb(0, 0, 0) }
    )
    page.drawText(
        ascii(`Suma solicitata: ${data.requestedRedirectAmount.toFixed(2)} RON`),
        { x: 50, y: amountY - 42, size: 9, font, color: rgb(0, 0, 0) }
    )

    page.drawText(ascii(`Beneficiar: ${b.name}  CIF ${b.cif}`), {
        x: 50,
        y: amountY - 70,
        size: 9,
        font,
    })
    page.drawText(ascii(`IBAN: ${formatIbanDisplay(b.iban)}`), {
        x: 50,
        y: amountY - 84,
        size: 9,
        font,
    })
    page.drawText(
        ascii(
            `Contract: ${data.contractNumber} din ${data.contractDate.toLocaleDateString("ro-RO")}`
        ),
        { x: 50, y: amountY - 98, size: 9, font }
    )

    tryCheck(form, "form1[0].#subform[0].CheckBox1[0]", data.disclosureConsent)

    if (data.signatureBase64) {
        try {
            const img = await embedSignature(pdf, data.signatureBase64)
            const box = { x: 80, y: 90, w: 160, h: 36 }
            const scale = Math.min(box.w / img.width, box.h / img.height)
            page.drawImage(img, {
                x: box.x,
                y: box.y,
                width: img.width * scale,
                height: img.height * scale,
            })
        } catch (e) {
            console.error("[form177] signature embed failed", e)
        }
    }

    // Draft watermark — not an ANAF-valid electronic package
    const { width, height } = page.getSize()
    page.drawText("DRAFT FORMULAR 177 — PENTRU VERIFICARE", {
        x: 80,
        y: height - 36,
        size: 11,
        font,
        color: rgb(0.75, 0.1, 0.1),
    })
    page.drawText("Nu este pachet electronic validat ANAF. Depunerea se face de companie/imputernicit.", {
        x: 50,
        y: 28,
        size: 8,
        font,
        color: rgb(0.5, 0.1, 0.1),
    })
    page.drawText("DRAFT", {
        x: width / 2 - 40,
        y: height / 2,
        size: 48,
        font,
        color: rgb(0.9, 0.82, 0.82),
        rotate: degrees(35),
    })

    try {
        form.updateFieldAppearances(font)
    } catch {
        /* some widgets reject appearance updates */
    }

    // Keep main form page + drop pure instruction pages if many
    const count = pdf.getPageCount()
    if (count > 2) {
        for (let i = count - 1; i >= 2; i--) pdf.removePage(i)
    }

    return pdf.save({ updateFieldAppearances: false })
}
