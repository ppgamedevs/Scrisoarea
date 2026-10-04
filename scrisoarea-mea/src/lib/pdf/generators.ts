import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import {
    generateOfficialForm230,
    type Form230Input,
    getForm230FiscalYear,
} from "@/lib/pdf/form230"

export type { Form230Input }
export { getForm230FiscalYear }

/** Official ANAF Form 230 (OPANAF 103/2025) via template overlay. */
export async function generateForm230(data: Form230Input) {
    return generateOfficialForm230(data)
}

export async function generateContract177(data: {
    companyName: string
    cui: string
    regCom?: string
    contactName: string
    amount: number
    signatureBase64: string
}) {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const margin = 50
    const cuiAssoc = process.env.NEXT_PUBLIC_ASSOCIATION_CUI || "55406686"
    const today = new Date().toLocaleDateString("ro-RO")

    const safe = (t: string) =>
        t
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ș|ş/gi, "s")
            .replace(/ț|ţ/gi, "t")

    page.drawText(safe("CONTRACT DE SPONSORIZARE"), {
        x: margin,
        y: height - 52,
        size: 16,
        font: fontBold,
    })
    const dateLabel = safe(`Data: ${today}`)
    page.drawText(dateLabel, {
        x: width - margin - font.widthOfTextAtSize(dateLabel, 10),
        y: height - 52,
        size: 10,
        font,
    })

    let y = height - 100
    page.drawText(
        safe(
            `Intre Asociatia pentru visuri si oportunitati (CUI ${cuiAssoc}) si ${data.companyName}`
        ),
        { x: margin, y, size: 11, font }
    )
    y -= 22
    page.drawText(safe(`CUI societate: ${data.cui}`), { x: margin, y, size: 11, font })
    y -= 22
    if (data.regCom) {
        page.drawText(safe(`Reg. Com.: ${data.regCom}`), { x: margin, y, size: 11, font })
        y -= 22
    }
    page.drawText(safe(`Reprezentant: ${data.contactName}`), { x: margin, y, size: 11, font })
    y -= 22
    page.drawText(
        safe(`Obiectul contractului: sponsorizare in suma de ${data.amount} RON (Formular 177).`),
        { x: margin, y, size: 11, font }
    )

    if (data.signatureBase64) {
        try {
            const raw = data.signatureBase64.includes(",")
                ? data.signatureBase64.split(",")[1]
                : data.signatureBase64
            const bytes = Buffer.from(raw, "base64")
            let img
            try {
                img = await pdfDoc.embedPng(bytes)
            } catch {
                img = await pdfDoc.embedJpg(bytes)
            }
            page.drawImage(img, { x: margin, y: 120, width: 180, height: 60 })
            page.drawText(safe("Semnatura reprezentant:"), {
                x: margin,
                y: 190,
                size: 11,
                font: fontBold,
            })
        } catch {
            /* ignore */
        }
    }

    page.drawText(safe("Document generat de Visuri pe hartie."), {
        x: margin,
        y: 40,
        size: 8,
        font,
        color: rgb(0.45, 0.45, 0.45),
    })

    return pdfDoc.save()
}
