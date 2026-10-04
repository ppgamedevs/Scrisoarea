import { readFileSync, existsSync } from "fs"
import path from "path"
import {
    PDFDocument,
    StandardFonts,
    rgb,
    type PDFFont,
    type PDFPage,
} from "pdf-lib"

export type Form230Input = {
    lastName: string
    fatherInitial: string
    firstName: string
    cnp: string
    email: string
    phone?: string
    street: string
    streetNumber: string
    bloc?: string
    scara?: string
    etaj?: string
    apartament?: string
    county: string
    city: string
    postalCode?: string
    fax?: string
    signatureBase64: string
    /** Share identification data with beneficiary entity */
    shareDataWithBeneficiary?: boolean
    /** Distribute for 2 years option */
    optionTwoYears?: boolean
    percent?: number
    amountLei?: number
}

/** Official ANAF Form 230 field rects (page 0, pdf-lib coords, y from bottom). */
const F = {
    year: { x: 300.2, y: 721.4, w: 71.7, h: 19.6 },
    lastName: { x: 61.1, y: 666.6, w: 194.2, h: 14.4 },
    fatherInitial: { x: 292.1, y: 666.6, w: 25.5, h: 14.4 },
    cnp: { x: 330.1, y: 656.9, w: 240.2, h: 16.3 },
    firstName: { x: 61.2, y: 644.4, w: 256.4, h: 14.4 },
    email: { x: 360.6, y: 633.1, w: 208.0, h: 15.1 },
    street: { x: 61.2, y: 622.0, w: 188.4, h: 14.4 },
    streetNumber: { x: 285.4, y: 622.0, w: 32.3, h: 14.4 },
    phone: { x: 361.1, y: 606.2, w: 184.4, h: 15.1 },
    bloc: { x: 44.1, y: 599.4, w: 31.3, h: 14.4 },
    scara: { x: 104.3, y: 599.4, w: 18.2, h: 14.4 },
    etaj: { x: 144.2, y: 599.4, w: 20.2, h: 14.4 },
    apartament: { x: 182.4, y: 599.4, w: 18.4, h: 14.4 },
    county: { x: 251.9, y: 599.4, w: 65.7, h: 14.4 },
    city: { x: 64.9, y: 577.4, w: 147.4, h: 14.0 },
    postalCode: { x: 260.7, y: 577.3, w: 57.0, h: 13.8 },
    fax: { x: 360.6, y: 578.4, w: 185.4, h: 14.9 },
    // Section II – nonprofit
    entityCui: { x: 238.8, y: 393.9, w: 114.6, h: 13.5 },
    entityName: { x: 176.8, y: 371.8, w: 390.6, h: 14.5 },
    iban: { x: 99.8, y: 349.7, w: 296.9, h: 14.5 },
    percent: { x: 119.0, y: 327.1, w: 79.0, h: 14.5 },
    amount: { x: 244.4, y: 327.4, w: 152.2, h: 14.5 },
    signature: { x: 137.8, y: 100.1, w: 134.1, h: 15.1 },
} as const

const CHECK = {
    scholarship: "form1[0].#subform[0].#field[40]",
    nonprofit: "form1[0].#subform[0].#field[43]",
    twoYears: "form1[0].#subform[0].#field[46]",
    shareData: "form1[0].#subform[0].CheckBox1[0]",
} as const

function pdfSafe(text: string) {
    return String(text ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ș|ş/gi, (m) => (m === m.toUpperCase() ? "S" : "s"))
        .replace(/ț|ţ/gi, (m) => (m === m.toUpperCase() ? "T" : "t"))
}

function fitText(text: string, font: PDFFont, size: number, maxWidth: number) {
    let t = pdfSafe(text)
    if (font.widthOfTextAtSize(t, size) <= maxWidth) return t
    while (t.length > 0 && font.widthOfTextAtSize(`${t}…`, size) > maxWidth) {
        t = t.slice(0, -1)
    }
    return t ? `${t}…` : ""
}

function drawInRect(
    page: PDFPage,
    font: PDFFont,
    rect: { x: number; y: number; w: number; h: number },
    text: string,
    size = 9
) {
    const value = fitText(text, font, size, rect.w - 4)
    if (!value) return
    const textHeight = size
    page.drawText(value, {
        x: rect.x + 2,
        y: rect.y + (rect.h - textHeight) / 2,
        size,
        font,
        color: rgb(0, 0, 0),
    })
}

function resolveTemplatePath() {
    const candidates = [
        path.join(process.cwd(), "private/forms/formular-230-OPANAF-103-2025.pdf"),
        path.join(process.cwd(), "public/forms/formular-230-OPANAF-103-2025.pdf"),
        path.join(process.cwd(), "scrisoarea-mea/private/forms/formular-230-OPANAF-103-2025.pdf"),
    ]
    for (const p of candidates) {
        if (existsSync(p)) return p
    }
    throw new Error(
        "Official Form 230 template missing. Expected private/forms/formular-230-OPANAF-103-2025.pdf"
    )
}

export function getForm230FiscalYear(): number {
    const raw = process.env.FORM_230_FISCAL_YEAR?.trim()
    const year = raw ? Number(raw) : new Date().getFullYear() - 1
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        throw new Error("FORM_230_FISCAL_YEAR must be a 4-digit year (e.g. 2025)")
    }
    return year
}

export function getAssociationForm230Defaults() {
    return {
        name:
            process.env.ASSOCIATION_LEGAL_NAME?.trim() ||
            "Asociatia pentru visuri si oportunitati",
        cui: process.env.NEXT_PUBLIC_ASSOCIATION_CUI?.trim() || "55406686",
        iban: process.env.ASSOCIATION_IBAN?.trim() || "",
        percent: Number(process.env.FORM_230_DEFAULT_PERCENT || "3.5"),
    }
}

async function embedSignature(pdfDoc: PDFDocument, signatureBase64: string) {
    const raw = signatureBase64.includes(",")
        ? signatureBase64.split(",")[1]
        : signatureBase64
    const bytes = Buffer.from(raw, "base64")
    try {
        return await pdfDoc.embedPng(bytes)
    } catch {
        return await pdfDoc.embedJpg(bytes)
    }
}

/**
 * Fill official ANAF Form 230 (OPANAF 103/22.01.2025) using the local PDF template.
 * Preserves official layout; overlays values at AcroForm field coordinates.
 */
export async function generateOfficialForm230(data: Form230Input): Promise<Uint8Array> {
    const templatePath = resolveTemplatePath()
    const templateBytes = readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true })
    const form = pdfDoc.getForm()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const page = pdfDoc.getPage(0)

    const fiscalYear = getForm230FiscalYear()
    const assoc = getAssociationForm230Defaults()
    const percent = data.percent ?? assoc.percent

    // Native AcroForm fields that accept text reliably
    try {
        const yearField = form.getTextField("form1[0].#subform[0].TextField13[0]")
        yearField.setText(String(fiscalYear))
        yearField.setFontSize(12)
    } catch {
        drawInRect(page, font, F.year, String(fiscalYear), 12)
    }

    try {
        const cnpField = form.getTextField("form1[0].#subform[0].TextField2[0]")
        cnpField.setText(data.cnp.slice(0, 13))
        cnpField.setFontSize(10)
    } catch {
        drawInRect(page, font, F.cnp, data.cnp, 10)
    }

    // Destination: nonprofit entity (not private scholarship)
    try {
        form.getCheckBox(CHECK.scholarship).uncheck()
    } catch {
        /* optional */
    }
    try {
        form.getCheckBox(CHECK.nonprofit).check()
    } catch {
        /* draw mark */
        page.drawText("X", {
            x: 216.6 + 2,
            y: 434.2 + 1,
            size: 10,
            font,
        })
    }
    if (data.optionTwoYears) {
        try {
            form.getCheckBox(CHECK.twoYears).check()
        } catch {
            page.drawText("X", { x: 322.8 + 2, y: 414.6 + 1, size: 10, font })
        }
    }
    if (data.shareDataWithBeneficiary !== false) {
        try {
            form.getCheckBox(CHECK.shareData).check()
        } catch {
            page.drawText("X", { x: 27.7 + 2, y: 304.5 + 1, size: 10, font })
        }
    }

    // Section I overlays (button fields are not fillable via pdf-lib)
    drawInRect(page, font, F.lastName, data.lastName)
    drawInRect(page, font, F.fatherInitial, (data.fatherInitial || "").slice(0, 1).toUpperCase())
    drawInRect(page, font, F.firstName, data.firstName)
    drawInRect(page, font, F.email, data.email)
    drawInRect(page, font, F.street, data.street)
    drawInRect(page, font, F.streetNumber, data.streetNumber)
    if (data.phone) drawInRect(page, font, F.phone, data.phone)
    if (data.bloc) drawInRect(page, font, F.bloc, data.bloc)
    if (data.scara) drawInRect(page, font, F.scara, data.scara)
    if (data.etaj) drawInRect(page, font, F.etaj, data.etaj)
    if (data.apartament) drawInRect(page, font, F.apartament, data.apartament)
    drawInRect(page, font, F.county, data.county)
    drawInRect(page, font, F.city, data.city)
    if (data.postalCode) drawInRect(page, font, F.postalCode, data.postalCode)
    if (data.fax) drawInRect(page, font, F.fax, data.fax)

    // Section II – association destination
    drawInRect(page, font, F.entityCui, assoc.cui)
    drawInRect(page, font, F.entityName, assoc.name)
    if (assoc.iban) drawInRect(page, font, F.iban, assoc.iban)
    drawInRect(page, font, F.percent, String(percent).replace(".", ","))
    if (data.amountLei != null && data.amountLei > 0) {
        drawInRect(page, font, F.amount, String(data.amountLei))
    }

    // Signature – larger area above the thin signature line field
    if (data.signatureBase64) {
        try {
            const img = await embedSignature(pdfDoc, data.signatureBase64)
            const box = {
                x: 50,
                y: 95,
                w: 200,
                h: 48,
            }
            const scale = Math.min(box.w / img.width, box.h / img.height)
            const w = img.width * scale
            const h = img.height * scale
            page.drawImage(img, {
                x: box.x,
                y: box.y,
                width: w,
                height: h,
            })
        } catch (e) {
            console.error("[Form230] signature embed failed", e)
        }
    }

    try {
        form.updateFieldAppearances(font)
    } catch {
        /* some ANAF widgets reject appearance updates */
    }

    // Keep only the main form page (page 0). Other pages are instructions / annex.
    const pageCount = pdfDoc.getPageCount()
    if (pageCount > 1) {
        for (let i = pageCount - 1; i >= 1; i--) {
            pdfDoc.removePage(i)
        }
    }

    return pdfDoc.save({ updateFieldAppearances: false })
}
