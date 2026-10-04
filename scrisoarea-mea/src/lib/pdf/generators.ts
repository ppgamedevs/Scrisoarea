import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"

/** Helvetica (WinAnsi) cannot render Romanian diacritics — normalize for PDF text. */
function pdfSafe(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ș|ş/g, "s")
        .replace(/ț|ţ/g, "t")
        .replace(/Ș|Ş/g, "S")
        .replace(/Ț|Ţ/g, "T")
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = pdfSafe(text).split(/\s+/)
    const lines: string[] = []
    let current = ""
    for (const word of words) {
        const next = current ? `${current} ${word}` : word
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
            current = next
        } else {
            if (current) lines.push(current)
            current = word
        }
    }
    if (current) lines.push(current)
    return lines
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

function drawSignatureBlock(
    page: PDFPage,
    signatureImage: Awaited<ReturnType<typeof embedSignature>> | null,
    x: number,
    yLabel: number
) {
    const fontSize = 11
    // Label above the signature area — never overlapping
    page.drawText(pdfSafe("Semnatura contribuabil:"), {
        x,
        y: yLabel,
        size: fontSize,
        color: rgb(0.15, 0.15, 0.15),
    })

    const boxTop = yLabel - 18
    const boxHeight = 70
    const boxWidth = 220
    const boxBottom = boxTop - boxHeight

    page.drawRectangle({
        x,
        y: boxBottom,
        width: boxWidth,
        height: boxHeight,
        borderColor: rgb(0.75, 0.75, 0.75),
        borderWidth: 1,
    })

    if (signatureImage) {
        const maxW = boxWidth - 16
        const maxH = boxHeight - 16
        const scale = Math.min(maxW / signatureImage.width, maxH / signatureImage.height, 1)
        const w = signatureImage.width * scale
        const h = signatureImage.height * scale
        page.drawImage(signatureImage, {
            x: x + (boxWidth - w) / 2,
            y: boxBottom + (boxHeight - h) / 2,
            width: w,
            height: h,
        })
    }

    return boxBottom
}

export async function generateForm230(data: {
    firstName: string
    lastName: string
    cnp: string
    email: string
    address?: string
    city?: string
    county?: string
    signatureBase64: string
}) {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const margin = 50
    const contentWidth = width - margin * 2
    const cui = process.env.NEXT_PUBLIC_ASSOCIATION_CUI || "55406686"
    const fiscalYear = new Date().getFullYear() - 1
    const today = new Date().toLocaleDateString("ro-RO")

    // --- Header: title left, date top-right ---
    page.drawText("CERERE", {
        x: margin,
        y: height - 52,
        size: 18,
        font: fontBold,
    })

    const dateLabel = pdfSafe(`Data: ${today}`)
    const dateWidth = font.widthOfTextAtSize(dateLabel, 10)
    page.drawText(dateLabel, {
        x: width - margin - dateWidth,
        y: height - 52,
        size: 10,
        font,
        color: rgb(0.25, 0.25, 0.25),
    })

    // Subtitle wrapped so it does not overflow the right edge
    const subtitleLines = wrapText(
        "privind destinatia sumei reprezentand pana la 3,5% din impozitul anual pe venit (Formular 230)",
        font,
        10,
        contentWidth
    )
    let y = height - 78
    for (const line of subtitleLines) {
        page.drawText(line, { x: margin, y, size: 10, font })
        y -= 14
    }

    page.drawText(pdfSafe(`Anul fiscal: ${fiscalYear}`), {
        x: margin,
        y,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
    })
    y -= 36

    // Divider
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
    })
    y -= 28

    const drawField = (label: string, value: string) => {
        page.drawText(pdfSafe(label), { x: margin, y, size: 11, font: fontBold })
        page.drawText(pdfSafe(value || "-"), { x: margin + 90, y, size: 11, font })
        y -= 20
    }

    page.drawText(pdfSafe("I. DATELE DE IDENTIFICARE ALE CONTRIBUABILULUI"), {
        x: margin,
        y,
        size: 12,
        font: fontBold,
    })
    y -= 26

    drawField("Nume:", data.lastName)
    drawField("Prenume:", data.firstName)
    drawField("CNP:", data.cnp)
    drawField("Adresa:", data.address || "-")
    drawField("Localitate:", data.city || "-")
    drawField("Judet:", data.county || "-")
    drawField("Email:", data.email)

    y -= 16
    page.drawText(pdfSafe("II. DESTINATIA SUMEI (3,5%)"), {
        x: margin,
        y,
        size: 12,
        font: fontBold,
    })
    y -= 26

    drawField("Beneficiar:", "Asociatia pentru visuri si oportunitati")
    drawField("CUI:", cui)
    drawField("IBAN:", process.env.ASSOCIATION_IBAN || "RO00XXXX0000000000000000")
    drawField("Banca:", process.env.ASSOCIATION_BANK || "—")

    y -= 24

    let signatureImage = null
    if (data.signatureBase64) {
        try {
            signatureImage = await embedSignature(pdfDoc, data.signatureBase64)
        } catch (e) {
            console.error("Failed to embed signature", e)
        }
    }

    // Keep signature block in the lower part of the page with clear spacing
    const labelY = Math.min(y, 200)
    drawSignatureBlock(page, signatureImage, margin, labelY)

    page.drawText(
        pdfSafe(
            "Acest document serveste ca imputernicire pentru depunerea formularului 230 la ANAF."
        ),
        {
            x: margin,
            y: 40,
            size: 8,
            font,
            color: rgb(0.45, 0.45, 0.45),
        }
    )

    return await pdfDoc.save()
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

    page.drawText(pdfSafe("CONTRACT DE SPONSORIZARE"), {
        x: margin,
        y: height - 52,
        size: 16,
        font: fontBold,
    })
    const dateLabel = pdfSafe(`Data: ${today}`)
    page.drawText(dateLabel, {
        x: width - margin - font.widthOfTextAtSize(dateLabel, 10),
        y: height - 52,
        size: 10,
        font,
    })

    let y = height - 100
    page.drawText(
        pdfSafe(
            `Intre Asociatia pentru visuri si oportunitati (CUI ${cuiAssoc}) si ${data.companyName}`
        ),
        { x: margin, y, size: 11, font }
    )
    y -= 22
    page.drawText(pdfSafe(`CUI societate: ${data.cui}`), { x: margin, y, size: 11, font })
    y -= 22
    if (data.regCom) {
        page.drawText(pdfSafe(`Reg. Com.: ${data.regCom}`), { x: margin, y, size: 11, font })
        y -= 22
    }
    page.drawText(pdfSafe(`Reprezentant: ${data.contactName}`), { x: margin, y, size: 11, font })
    y -= 22
    page.drawText(
        pdfSafe(
            `Obiectul contractului: sponsorizare in suma de ${data.amount} RON (Formular 177).`
        ),
        { x: margin, y, size: 11, font }
    )
    y -= 50

    let signatureImage = null
    if (data.signatureBase64) {
        try {
            signatureImage = await embedSignature(pdfDoc, data.signatureBase64)
        } catch {
            /* ignore */
        }
    }
    drawSignatureBlock(page, signatureImage, margin, Math.min(y, 220))

    return await pdfDoc.save()
}
