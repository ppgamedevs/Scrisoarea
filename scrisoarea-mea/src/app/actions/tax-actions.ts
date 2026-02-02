"use server"

import { generateForm230, generateContract177 } from "@/lib/pdf/generators"
import prisma from "@/lib/prisma"
import { validateCNP, validateCUI } from "@/lib/validations/ro-tax"
import { randomUUID } from "crypto"
import { redirect } from "next/navigation"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

// In a real production app, we would upload to S3/R2.
// For MVP, we will store Base64 in DB (not recommended for large scale but allowed here for simplicity)
// OR simpler: just store the signature in DB, and regenerate PDF on fly/cache it.
// The Schema has `pdfUrl`. I'll simulate "upload" by base64-encoding the PDF data text into a Data URI 
// (Database storage might be heavy for full PDF, but let's assume "Asset Storage" abstraction).
// Actually, storing 100kb PDF in Postgres Text is... okay for MVP. I'll do that or just store sig and gen on demand.
// Logic: Generate PDF, Convert to Base64, Store in `pdfUrl` (Data URI).

export async function submitForm230(formData: FormData) {
    // 1. Honeypot Check
    if (formData.get('_hp')) {
        throw new Error("Spam detected.") // Silent fail? Or error. Error is fine for now.
    }

    // 2. Rate Limit
    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
        throw new Error("Prea multe cereri. Încearcă mai târziu.")
    }

    const raw = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        cnp: formData.get('cnp') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        county: formData.get('county') as string,
        city: formData.get('city') as string,
        address: formData.get('address') as string,
        signatureBase64: formData.get('signature') as string,
        consentTerms: formData.get('consentTerms') === 'on',
        consentPrivacy: formData.get('consentPrivacy') === 'on'
    }

    if (!validateCNP(raw.cnp)) throw new Error("CNP Invalid")
    if (!raw.signatureBase64) throw new Error("Semnatura lipseste")
    if (!raw.consentTerms || !raw.consentPrivacy) throw new Error("Consimtamant necesar")

    // Generate PDF
    const pdfBytes = await generateForm230({
        ...raw
    })

    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`

    // Create DB Record
    const record = await prisma.taxRedirectionRequest.create({
        data: {
            type: 'INDIVIDUAL_230',
            year: new Date().getFullYear(), // Current Tax Year Logic (usually previous year's income, so maybe 2025 for 2024 income. I'll just use current calendar year for record keeping)
            email: raw.email,
            phone: raw.phone,
            firstName: raw.firstName,
            lastName: raw.lastName,
            cnp: raw.cnp, // Plain as per current instructions (encrypted ideally)
            county: raw.county,
            city: raw.city,
            address: raw.address,
            signatureUrl: raw.signatureBase64, // Storing base64 sig directly
            pdfUrl: pdfDataUrl,
            status: 'SUBMITTED',
            consentTerms: true,
            consentPrivacy: true
        }
    })

    redirect('/directioneaza-35/confirmare?id=' + record.id)
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
