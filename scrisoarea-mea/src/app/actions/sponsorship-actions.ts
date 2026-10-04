"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { getSponsorshipBeneficiary } from "@/lib/sponsorship/beneficiary"
import { allocateContractNumber } from "@/lib/sponsorship/contract-number"
import { generateSponsorshipContract } from "@/lib/pdf/sponsorship-contract"
import { generateForm177Draft } from "@/lib/pdf/form177"
import { saveBytes } from "@/lib/storage-bytes"
import {
    directSponsorshipSchema,
    form177Schema,
} from "@/lib/validations/sponsorship"

function str(formData: FormData, key: string) {
    return String(formData.get(key) || "").trim()
}

function boolOn(formData: FormData, key: string) {
    return formData.get(key) === "on" || formData.get(key) === "true"
}

async function guard(formData: FormData) {
    if (formData.get("_hp")) throw new Error("Spam detected.")
    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) throw new Error("Prea multe cereri. Încearcă mai târziu.")
}

export async function submitDirectSponsorship(formData: FormData) {
    await guard(formData)

    const parsed = directSponsorshipSchema.safeParse({
        companyName: str(formData, "companyName"),
        companyCif: str(formData, "companyCif"),
        regCom: str(formData, "regCom") || undefined,
        taxRegime: str(formData, "taxRegime") || "UNKNOWN",
        representativeName: str(formData, "representativeName"),
        representativeRole: str(formData, "representativeRole") || undefined,
        email: str(formData, "email").toLowerCase(),
        phone: str(formData, "phone") || undefined,
        county: str(formData, "county"),
        city: str(formData, "city"),
        street: str(formData, "street"),
        streetNumber: str(formData, "streetNumber"),
        building: str(formData, "building") || undefined,
        entrance: str(formData, "entrance") || undefined,
        floor: str(formData, "floor") || undefined,
        apartment: str(formData, "apartment") || undefined,
        postalCode: str(formData, "postalCode") || undefined,
        sponsorshipAmount: str(formData, "sponsorshipAmount"),
        signatureBase64: str(formData, "signature"),
        consentTerms: boolOn(formData, "consentTerms"),
        consentPrivacy: boolOn(formData, "consentPrivacy"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Date invalide")
    }

    const data = parsed.data
    const beneficiary = getSponsorshipBeneficiary()
    if (!beneficiary.iban || !beneficiary.name || !beneficiary.cif) {
        throw new Error("Configurația beneficiarului este incompletă. Contactați asociația.")
    }

    const contractYear = new Date().getFullYear()
    const contractNumber = await allocateContractNumber(contractYear)
    const contractDate = new Date()

    const pdfBytes = await generateSponsorshipContract({
        contractNumber,
        contractDate,
        companyName: data.companyName,
        companyCif: data.companyCif,
        regCom: data.regCom,
        representativeName: data.representativeName,
        representativeRole: data.representativeRole,
        email: data.email,
        phone: data.phone,
        county: data.county,
        city: data.city,
        street: data.street,
        streetNumber: data.streetNumber,
        building: data.building,
        entrance: data.entrance,
        floor: data.floor,
        apartment: data.apartment,
        postalCode: data.postalCode,
        amountRon: data.sponsorshipAmount,
        signatureBase64: data.signatureBase64,
        beneficiary,
    })

    const contractPdfUrl = await saveBytes(pdfBytes, {
        filename: `${contractNumber}.pdf`,
        contentType: "application/pdf",
        folder: "sponsorship-contracts",
    })

    const record = await prisma.companySponsorshipRequest.create({
        data: {
            flowType: "DIRECT_SPONSORSHIP",
            status: "READY_FOR_PAYMENT",
            fiscalYear: contractYear,
            companyName: data.companyName,
            companyCif: data.companyCif,
            regCom: data.regCom,
            taxRegime: data.taxRegime,
            representativeName: data.representativeName,
            representativeRole: data.representativeRole,
            email: data.email,
            phone: data.phone,
            county: data.county,
            city: data.city,
            street: data.street,
            streetNumber: data.streetNumber,
            building: data.building,
            entrance: data.entrance,
            floor: data.floor,
            apartment: data.apartment,
            postalCode: data.postalCode,
            sponsorshipAmount: data.sponsorshipAmount,
            contractNumber,
            contractDate,
            contractPdfUrl,
            beneficiaryName: beneficiary.name,
            beneficiaryCif: beneficiary.cif,
            beneficiaryIban: beneficiary.iban,
            signatureUrl: data.signatureBase64,
            consentTerms: true,
            consentPrivacy: true,
        },
    })

    redirect(`/directioneaza-20/confirmare?id=${record.id}&flow=direct`)
}

export async function submitForm177Prep(formData: FormData) {
    await guard(formData)

    const taxRegime = str(formData, "taxRegime")
    if (taxRegime === "MICROENTERPRISE") {
        throw new Error(
            "Formularul 177 (OPANAF 3562/2024) se referă la redirecționarea impozitului pe profit. Microîntreprinderile nu pot folosi acest flux."
        )
    }

    const parsed = form177Schema.safeParse({
        fiscalYear: str(formData, "fiscalYear"),
        companyName: str(formData, "companyName"),
        companyCif: str(formData, "companyCif"),
        regCom: str(formData, "regCom") || undefined,
        taxRegime: "PROFIT_TAX",
        representativeName: str(formData, "representativeName"),
        representativeRole: str(formData, "representativeRole") || undefined,
        email: str(formData, "email").toLowerCase(),
        phone: str(formData, "phone") || undefined,
        fax: str(formData, "fax") || undefined,
        county: str(formData, "county"),
        city: str(formData, "city"),
        street: str(formData, "street"),
        streetNumber: str(formData, "streetNumber"),
        building: str(formData, "building") || undefined,
        entrance: str(formData, "entrance") || undefined,
        floor: str(formData, "floor") || undefined,
        apartment: str(formData, "apartment") || undefined,
        postalCode: str(formData, "postalCode") || undefined,
        maximumRedirectableAmount: str(formData, "maximumRedirectableAmount"),
        previouslyRedirectedAmount: str(formData, "previouslyRedirectedAmount") || "0",
        requestedRedirectAmount: str(formData, "requestedRedirectAmount"),
        periodStart: str(formData, "periodStart") || undefined,
        periodEnd: str(formData, "periodEnd") || undefined,
        disclosureConsent: boolOn(formData, "disclosureConsent"),
        profitTaxConfirm: boolOn(formData, "profitTaxConfirm"),
        signatureBase64: str(formData, "signature"),
        consentTerms: boolOn(formData, "consentTerms"),
        consentPrivacy: boolOn(formData, "consentPrivacy"),
    })

    if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Date invalide")
    }

    const data = parsed.data
    const remaining = Math.max(
        0,
        data.maximumRedirectableAmount - data.previouslyRedirectedAmount
    )
    const beneficiary = getSponsorshipBeneficiary()
    if (!beneficiary.iban || !beneficiary.name || !beneficiary.cif) {
        throw new Error("Configurația beneficiarului este incompletă.")
    }

    const contractNumber = await allocateContractNumber(data.fiscalYear)
    const contractDate = new Date()

    const contractBytes = await generateSponsorshipContract({
        contractNumber,
        contractDate,
        companyName: data.companyName,
        companyCif: data.companyCif,
        regCom: data.regCom,
        representativeName: data.representativeName,
        representativeRole: data.representativeRole,
        email: data.email,
        phone: data.phone,
        county: data.county,
        city: data.city,
        street: data.street,
        streetNumber: data.streetNumber,
        building: data.building,
        entrance: data.entrance,
        floor: data.floor,
        apartment: data.apartment,
        postalCode: data.postalCode,
        amountRon: data.requestedRedirectAmount,
        signatureBase64: data.signatureBase64,
        beneficiary,
    })

    const draft177Bytes = await generateForm177Draft({
        fiscalYear: data.fiscalYear,
        periodStart: data.periodStart ? new Date(data.periodStart) : null,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
        companyCif: data.companyCif,
        companyName: data.companyName,
        county: data.county,
        city: data.city,
        street: data.street,
        streetNumber: data.streetNumber,
        building: data.building,
        entrance: data.entrance,
        apartment: data.apartment,
        postalCode: data.postalCode,
        phone: data.phone,
        fax: data.fax,
        email: data.email,
        maximumRedirectableAmount: data.maximumRedirectableAmount,
        previouslyRedirectedAmount: data.previouslyRedirectedAmount,
        remainingRedirectableAmount: remaining,
        requestedRedirectAmount: data.requestedRedirectAmount,
        contractNumber,
        contractDate,
        disclosureConsent: data.disclosureConsent,
        signatureBase64: data.signatureBase64,
        beneficiary,
    })

    const contractPdfUrl = await saveBytes(contractBytes, {
        filename: `${contractNumber}.pdf`,
        contentType: "application/pdf",
        folder: "sponsorship-contracts",
    })
    const draft177PdfUrl = await saveBytes(draft177Bytes, {
        filename: `Draft177-${contractNumber}.pdf`,
        contentType: "application/pdf",
        folder: "form177-drafts",
    })

    const record = await prisma.companySponsorshipRequest.create({
        data: {
            flowType: "FORM_177",
            status: "READY_FOR_ANAF",
            fiscalYear: data.fiscalYear,
            companyName: data.companyName,
            companyCif: data.companyCif,
            regCom: data.regCom,
            taxRegime: "PROFIT_TAX",
            representativeName: data.representativeName,
            representativeRole: data.representativeRole,
            email: data.email,
            phone: data.phone,
            county: data.county,
            city: data.city,
            street: data.street,
            streetNumber: data.streetNumber,
            building: data.building,
            entrance: data.entrance,
            floor: data.floor,
            apartment: data.apartment,
            postalCode: data.postalCode,
            sponsorshipAmount: data.requestedRedirectAmount,
            maximumRedirectableAmount: data.maximumRedirectableAmount,
            previouslyRedirectedAmount: data.previouslyRedirectedAmount,
            remainingRedirectableAmount: remaining,
            requestedRedirectAmount: data.requestedRedirectAmount,
            periodStart: data.periodStart ? new Date(data.periodStart) : null,
            periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
            contractNumber,
            contractDate,
            contractPdfUrl,
            draft177PdfUrl,
            disclosureConsent: data.disclosureConsent,
            profitTaxConfirm: true,
            beneficiaryName: beneficiary.name,
            beneficiaryCif: beneficiary.cif,
            beneficiaryIban: beneficiary.iban,
            signatureUrl: data.signatureBase64,
            consentTerms: true,
            consentPrivacy: true,
        },
    })

    redirect(`/directioneaza-20/confirmare?id=${record.id}&flow=177`)
}
