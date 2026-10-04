"use server"

import { generateForm230, generateContract177, getForm230FiscalYear } from "@/lib/pdf/generators"
import prisma from "@/lib/prisma"
import { validateCNP, validateCUI } from "@/lib/validations/ro-tax"
import { redirect } from "next/navigation"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

function str(formData: FormData, key: string) {
    return String(formData.get(key) || "").trim()
}

export async function submitForm230(formData: FormData) {
    if (formData.get("_hp")) {
        throw new Error("Spam detected.")
    }

    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
        throw new Error("Prea multe cereri. Încearcă mai târziu.")
    }

    const raw = {
        firstName: str(formData, "firstName"),
        lastName: str(formData, "lastName"),
        fatherInitial: str(formData, "fatherInitial").slice(0, 1).toUpperCase(),
        cnp: str(formData, "cnp"),
        email: str(formData, "email").toLowerCase(),
        phone: str(formData, "phone") || undefined,
        street: str(formData, "street"),
        streetNumber: str(formData, "streetNumber"),
        bloc: str(formData, "bloc") || undefined,
        scara: str(formData, "scara") || undefined,
        etaj: str(formData, "etaj") || undefined,
        apartament: str(formData, "apartament") || undefined,
        county: str(formData, "county"),
        city: str(formData, "city"),
        postalCode: str(formData, "postalCode") || undefined,
        signatureBase64: str(formData, "signature"),
        optionTwoYears: formData.get("optionTwoYears") === "on",
        shareDataWithBeneficiary: formData.get("shareDataWithBeneficiary") === "on",
        consentTerms: formData.get("consentTerms") === "on",
        consentPrivacy: formData.get("consentPrivacy") === "on",
    }

    if (!raw.lastName || !raw.firstName || !raw.fatherInitial) {
        throw new Error("Completează numele, prenumele și inițiala tatălui.")
    }
    if (!raw.street || !raw.streetNumber || !raw.county || !raw.city) {
        throw new Error("Completează adresa (stradă, număr, localitate, județ).")
    }
    if (!validateCNP(raw.cnp)) throw new Error("CNP Invalid")
    if (!raw.signatureBase64) throw new Error("Semnatura lipseste")
    if (!raw.consentTerms || !raw.consentPrivacy) throw new Error("Consimtamant necesar")

    const fiscalYear = getForm230FiscalYear()

    const pdfBytes = await generateForm230({
        firstName: raw.firstName,
        lastName: raw.lastName,
        fatherInitial: raw.fatherInitial,
        cnp: raw.cnp,
        email: raw.email,
        phone: raw.phone,
        street: raw.street,
        streetNumber: raw.streetNumber,
        bloc: raw.bloc,
        scara: raw.scara,
        etaj: raw.etaj,
        apartament: raw.apartament,
        county: raw.county,
        city: raw.city,
        postalCode: raw.postalCode,
        signatureBase64: raw.signatureBase64,
        optionTwoYears: raw.optionTwoYears,
        shareDataWithBeneficiary: raw.shareDataWithBeneficiary,
    })

    const pdfBase64 = Buffer.from(pdfBytes).toString("base64")
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`

    const addressLine = [
        `str. ${raw.street} nr. ${raw.streetNumber}`,
        raw.bloc ? `bl. ${raw.bloc}` : null,
        raw.scara ? `sc. ${raw.scara}` : null,
        raw.etaj ? `et. ${raw.etaj}` : null,
        raw.apartament ? `ap. ${raw.apartament}` : null,
    ]
        .filter(Boolean)
        .join(", ")

    const record = await prisma.taxRedirectionRequest.create({
        data: {
            type: "INDIVIDUAL_230",
            year: fiscalYear,
            email: raw.email,
            phone: raw.phone,
            firstName: raw.firstName,
            lastName: raw.lastName,
            fatherInitial: raw.fatherInitial,
            cnp: raw.cnp,
            county: raw.county,
            city: raw.city,
            address: addressLine,
            street: raw.street,
            streetNumber: raw.streetNumber,
            bloc: raw.bloc,
            scara: raw.scara,
            etaj: raw.etaj,
            apartament: raw.apartament,
            postalCode: raw.postalCode,
            signatureUrl: raw.signatureBase64,
            pdfUrl: pdfDataUrl,
            status: "SUBMITTED",
            consentTerms: true,
            consentPrivacy: true,
        },
    })

    redirect("/directioneaza-35/confirmare?id=" + record.id)
}

export async function submitForm177(formData: FormData) {
    // 1. Honeypot
    if (formData.get('_hp')) throw new Error("Spam detected.")

    // 2. Rate Limit
    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) throw new Error("Prea multe cereri.")

    const raw = {
        companyName: formData.get('companyName') as string,
        cui: formData.get('cui') as string,
        regCom: formData.get('regCom') as string,
        contactName: formData.get('contactName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        amount: Number(formData.get('amount') || 0),
        signatureBase64: formData.get('signature') as string,
        consentTerms: formData.get('consentTerms') === 'on',
        consentPrivacy: formData.get('consentPrivacy') === 'on'
    }

    // Validate
    if (!validateCUI(raw.cui)) throw new Error("CUI Invalid")
    if (!raw.signatureBase64) throw new Error("Semnatura lipseste")
    if (raw.amount < 1) throw new Error("Suma invalida")

    // Generate Contract PDF
    const pdfBytes = await generateContract177({
        ...raw
    })
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`

    const record = await prisma.taxRedirectionRequest.create({
        data: {
            type: 'COMPANY_177',
            year: new Date().getFullYear(),
            email: raw.email,
            phone: raw.phone,
            companyName: raw.companyName,
            cui: raw.cui,
            regCom: raw.regCom,
            contactName: raw.contactName,
            amountRON: raw.amount,
            signatureUrl: raw.signatureBase64,
            contractUrl: pdfDataUrl, // Using contractUrl field
            status: 'SUBMITTED',
            consentTerms: true,
            consentPrivacy: true
        }
    })

    redirect('/directioneaza-20/confirmare?id=' + record.id)
}
