import { readFileSync, existsSync } from "fs"
import path from "path"
import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, rgb, type PDFFont } from "pdf-lib"
import {
    SPONSORSHIP_PURPOSE,
    formatIbanDisplay,
    type SponsorshipBeneficiary,
} from "@/lib/sponsorship/beneficiary"

export type SponsorshipContractInput = {
    contractNumber: string
    contractDate: Date
    companyName: string
    companyCif: string
    regCom?: string
    representativeName: string
    representativeRole?: string
    email: string
    phone?: string
    county: string
    city: string
    street: string
    streetNumber: string
    building?: string
    entrance?: string
    floor?: string
    apartment?: string
    postalCode?: string
    amountRon: number
    signatureBase64: string
    beneficiary: SponsorshipBeneficiary
    durationMonths?: number
}

function fontPath(name: string) {
    const candidates = [
        path.join(process.cwd(), "private/fonts", name),
        path.join(process.cwd(), "scrisoarea-mea/private/fonts", name),
    ]
    for (const p of candidates) if (existsSync(p)) return p
    throw new Error(`Missing font ${name}`)
}

async function loadFonts(pdf: PDFDocument) {
    pdf.registerFontkit(fontkit)
    const regular = await pdf.embedFont(readFileSync(fontPath("NotoSans-Regular.ttf")))
    const bold = await pdf.embedFont(readFileSync(fontPath("NotoSans-Bold.ttf")))
    return { regular, bold }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let line = ""
    for (const word of words) {
        const next = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
            line = next
        } else {
            if (line) lines.push(line)
            line = word
        }
    }
    if (line) lines.push(line)
    return lines
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

function addressLine(data: SponsorshipContractInput) {
    const parts = [
        `str. ${data.street} nr. ${data.streetNumber}`,
        data.building ? `bl. ${data.building}` : null,
        data.entrance ? `sc. ${data.entrance}` : null,
        data.floor ? `et. ${data.floor}` : null,
        data.apartment ? `ap. ${data.apartment}` : null,
        data.postalCode ? `cod poștal ${data.postalCode}` : null,
        `${data.city}, jud. ${data.county}`,
    ]
    return parts.filter(Boolean).join(", ")
}

/**
 * Contract de sponsorizare conform Legii 32/1994.
 */
export async function generateSponsorshipContract(
    data: SponsorshipContractInput
): Promise<Uint8Array> {
    const pdf = await PDFDocument.create()
    const { regular, bold } = await loadFonts(pdf)
    const page = pdf.addPage([595.28, 841.89])
    const margin = 50
    const maxW = 595.28 - margin * 2
    let y = 800
    const b = data.beneficiary
    const dateStr = data.contractDate.toLocaleDateString("ro-RO")
    const duration = data.durationMonths ?? 12

    const draw = (text: string, opts?: { size?: number; font?: PDFFont; gap?: number }) => {
        const size = opts?.size ?? 10
        const font = opts?.font ?? regular
        const lines = wrapText(text, font, size, maxW)
        for (const line of lines) {
            if (y < 60) {
                // new page handled simply by reducing — for long contracts add page
            }
            page.drawText(line, { x: margin, y, size, font, color: rgb(0.05, 0.05, 0.08) })
            y -= size + 3
        }
        y -= opts?.gap ?? 6
    }

    page.drawText("CONTRACT DE SPONSORIZARE", {
        x: margin,
        y,
        size: 16,
        font: bold,
        color: rgb(0.05, 0.05, 0.08),
    })
    y -= 22
    draw(`Nr. ${data.contractNumber}  ·  Data: ${dateStr}`, { size: 11, font: bold })
    draw(
        "Încheiat în temeiul Legii nr. 32/1994 privind sponsorizarea, cu modificările și completările ulterioare, și al Codului fiscal (art. 25), după caz.",
        { size: 9 }
    )

    draw("Art. 1 – Părțile", { font: bold, size: 11 })
    draw(
        `1.1. Sponsorul: ${data.companyName}, CUI ${data.companyCif}${
            data.regCom ? `, Reg. Com. ${data.regCom}` : ""
        }, cu sediul fiscal la ${addressLine(data)}, reprezentată de ${data.representativeName}${
            data.representativeRole ? `, în calitate de ${data.representativeRole}` : ""
        }, e-mail ${data.email}${data.phone ? `, telefon ${data.phone}` : ""}.`
    )
    draw(
        `1.2. Beneficiarul: ${b.name}, CIF ${b.cif}, IBAN ${formatIbanDisplay(b.iban)}${
            b.bank ? `, banca ${b.bank}` : ""
        }${b.address ? `, adresa ${b.address}` : ""}, reprezentată de ${b.representative}, ${
            b.representativeRole
        }.`
    )

    draw("Art. 2 – Obiectul contractului", { font: bold, size: 11 })
    draw(
        `2.1. Sponsorul se obligă să acorde Beneficiarului o sponsorizare în sumă de ${data.amountRon.toFixed(
            2
        )} RON (lei), cu următorul scop: ${SPONSORSHIP_PURPOSE}`
    )
    draw(
        "2.2. Sponsorizarea nu constituie contrapartidă pentru servicii de publicitate comercială și nu transformă prezentul contract într-un contract de prestări servicii publicitare."
    )

    draw("Art. 3 – Durata", { font: bold, size: 11 })
    draw(
        `3.1. Prezentul contract produce efecte de la data semnării pe o durată de ${duration} luni, dacă părțile nu convin altfel în scris.`
    )

    draw("Art. 4 – Drepturile și obligațiile Sponsorului", { font: bold, size: 11 })
    draw(
        "4.1. Sponsorul are dreptul de a primi, la cerere, informații privind utilizarea sumelor sponsorizate, în limitele legii și ale politicilor Beneficiarului."
    )
    draw(
        `4.2. Sponsorul se obligă să vireze suma de ${data.amountRon.toFixed(
            2
        )} RON în contul IBAN ${formatIbanDisplay(b.iban)}, cu mențiunea de plată: „Sponsorizare contract ${
            data.contractNumber
        }”.`
    )
    draw(
        "4.3. Sponsorul răspunde pentru corectitudinea datelor furnizate și pentru respectarea obligațiilor declarative fiscale care îi revin (inclusiv, după caz, Formularul 107)."
    )

    draw("Art. 5 – Drepturile și obligațiile Beneficiarului", { font: bold, size: 11 })
    draw(
        "5.1. Beneficiarul are dreptul de a folosi suma sponsorizată exclusiv în scopul prevăzut la Art. 2."
    )
    draw(
        "5.2. Beneficiarul se obligă să utilizeze fondurile cu diligență, să țină evidența contabilă conform legii și să nu ofere Sponsorului avantaje comerciale interzise de Legea 32/1994."
    )
    draw(
        "5.3. Beneficiarul poate menționa public sprijinul primit, fără a transforma sponsorizarea într-o campanie publicitară contra cost."
    )

    draw("Art. 6 – Plata", { font: bold, size: 11 })
    draw(
        `6.1. Plata se efectuează de către Sponsor direct către Beneficiar, în contul ${formatIbanDisplay(
            b.iban
        )}, referință: Sponsorizare contract ${data.contractNumber}.`
    )
    draw(
        "6.2. ANAF nu efectuează plata acestei sponsorizări directe; eventualele mecanisme de redirecționare fiscală (Formular 177) constituie proceduri distincte."
    )

    draw("Art. 7 – Dispoziții finale", { font: bold, size: 11 })
    draw(
        "7.1. Prezentul contract reprezintă întreaga înțelegere a părților cu privire la obiectul său și poate fi modificat doar prin act adițional scris."
    )
    draw(
        "7.2. Litigiile se soluționează pe cale amiabilă sau, în caz contrar, de instanțele competente din România."
    )
    draw(`7.3. Întocmit în două exemplare, câte unul pentru fiecare parte, la data de ${dateStr}.`)

    y -= 10
    page.drawText("Semnătură Sponsor", {
        x: margin,
        y,
        size: 10,
        font: bold,
    })
    page.drawText("Semnătură Beneficiar", {
        x: 320,
        y,
        size: 10,
        font: bold,
    })
    y -= 8

    if (data.signatureBase64) {
        try {
            const img = await embedSignature(pdf, data.signatureBase64)
            const box = { x: margin, y: y - 50, w: 180, h: 48 }
            const scale = Math.min(box.w / img.width, box.h / img.height)
            page.drawImage(img, {
                x: box.x,
                y: box.y,
                width: img.width * scale,
                height: img.height * scale,
            })
        } catch (e) {
            console.error("[sponsorship-contract] signature embed failed", e)
        }
    }

    page.drawText(data.representativeName, {
        x: margin,
        y: y - 60,
        size: 9,
        font: regular,
    })
    page.drawText(`${b.representative} (${b.representativeRole})`, {
        x: 320,
        y: y - 60,
        size: 9,
        font: regular,
    })

    return pdf.save()
}
