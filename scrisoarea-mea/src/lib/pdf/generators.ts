import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function generateForm230(data: {
    firstName: string,
    lastName: string,
    cnp: string,
    email: string,
    address?: string,
    city?: string,
    county?: string,
    signatureBase64: string
}) {
    // In a real app, I'd load a PDF template.
    // For this MVP, I'll create a simple PDF from scratch or overlay on a blank page if template assumes strict layout.
    // Since I don't have a template file (Form 230 PDF requires strict positioning), I will generate a generic "Cerere 230" document that *looks* like a request, 
    // or ideally, I'd need the PDF template asset to fill form fields.
    // Given the constraints, I will create a clean document containing all necessary legal info.
    // User Constraint: "Create a clean, branded PDF... containing user identity fields, NGO details... signature image embedded".

    // I won't try to replicate the official ANAF PDF pixel-perfect without a template. 
    // I'll make a generated document that IS the request.

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontSize = 12

    // Helper for text
    const drawText = (text: string, x: number, y: number, options: any = {}) => {
        page.drawText(text, { x, y, size: fontSize, font, ...options })
    }

    // Title
    page.drawText('CERERE', { x: 50, y: height - 50, size: 18, font: fontBold })
    page.drawText('privind destinatia sumei reprezentand pana la 3,5% din impozitul anual (Formuar 230)', { x: 50, y: height - 75, size: 10, font })
    page.drawText('Anul fiscal: 2025 (pentru venituri 2026)', { x: 50, y: height - 90, size: 10, font }) // Just example year handling

    let y = height - 150

    // I. Contribuabil
    page.drawText('I. DATELE DE IDENTIFICARE ALE CONTRIBUABILULUI', { x: 50, y, size: 14, font: fontBold })
    y -= 30
    drawText(`Nume: ${data.lastName}`, 50, y)
    y -= 20
    drawText(`Prenume: ${data.firstName}`, 50, y)
    y -= 20
    drawText(`CNP: ${data.cnp}`, 50, y)
    y -= 20
    drawText(`Adresa: ${data.address || '-'}`, 50, y)
    y -= 20
    drawText(`Localitate: ${data.city || '-'}, Judet: ${data.county || '-'}`, 50, y)
    y -= 20
    drawText(`Email: ${data.email}`, 50, y)

    y -= 50

    // II. NGO Destination
    page.drawText('II. DESTINATIA SUMEI (3.5%)', { x: 50, y, size: 14, font: fontBold })
    y -= 30
    drawText('Beneficiar: ASOCIATIA VISE PE HARTIE', 50, y, { font: fontBold })
    y -= 20
    drawText('Cod de Identificare Fiscala: 49767355', 50, y)
    y -= 20
    drawText('Cont IBAN: RO01BTRLRONCRT0000000000', 50, y)
    y -= 20
    drawText('Banca: Banca Transilvania', 50, y)

    y -= 50

    // Signature
    page.drawText('Semnatura Contribuabil:', { x: 50, y, size: 12, font: fontBold })

    // Embed signature
    if (data.signatureBase64) {
        try {
            const signatureImage = await pdfDoc.embedPng(data.signatureBase64)
            const sigDims = signatureImage.scale(0.5)
            page.drawImage(signatureImage, {
                x: 50,
                y: y - 60,
                width: sigDims.width,
                height: sigDims.height,
            })
        } catch (e) {
            // If png fails, try resizing or just ignore
            console.error(e)
        }
    }

    // Footer
    drawText('Acest document serveste ca imputernicire pentru depunerea formularului 230.', 50, 50, { size: 8, color: rgb(0.5, 0.5, 0.5) })

    return await pdfDoc.save()
}

export async function generateContract177(data: {
    companyName: string,
    cui: string,
    regCom?: string,
    contactName: string,
    amount: number,
    signatureBase64: string
}) {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Simple Contract Text
    page.drawText('CONTRACT DE SPONSORIZARE', { x: 200, y: height - 50, size: 18 })

    // Mock content
    page.drawText(`Intre ASOCIATIA VISE PE HARTIE si ${data.companyName}`, { x: 50, y: height - 100, size: 12, font })
    page.drawText(`CUI: ${data.cui}`, { x: 50, y: height - 120, size: 12, font })

    page.drawText(`Obiectul contractului: Sponsorizare in suma de ${data.amount} RON via Formular 177.`, { x: 50, y: height - 160, size: 12, font })

    // Embed Sig
    if (data.signatureBase64) {
        try {
            const signatureImage = await pdfDoc.embedPng(data.signatureBase64)
            const sigDims = signatureImage.scale(0.5)
            page.drawImage(signatureImage, {
                x: 350,
                y: height - 400,
                width: sigDims.width,
                height: sigDims.height,
            })
        } catch (e) { }
    }

    return await pdfDoc.save()
}
