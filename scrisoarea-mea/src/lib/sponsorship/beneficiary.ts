/**
 * Server-side beneficiary / sponsorship configuration.
 * Never hard-code production association details in React components.
 */

function env(key: string, fallback = "") {
    return (process.env[key] || fallback).trim()
}

export type SponsorshipBeneficiary = {
    name: string
    cif: string
    iban: string
    bank: string
    address: string
    street: string
    streetNumber: string
    building: string
    entrance: string
    floor: string
    apartment: string
    city: string
    county: string
    postalCode: string
    representative: string
    representativeRole: string
    anafRegistryConfirmed: boolean
}

export function getSponsorshipBeneficiary(): SponsorshipBeneficiary {
    const cif =
        env("SPONSORSHIP_BENEFICIARY_CIF") ||
        env("NEXT_PUBLIC_ASSOCIATION_CUI") ||
        "55406686"
    const name =
        env("SPONSORSHIP_BENEFICIARY_NAME") ||
        env("ASSOCIATION_LEGAL_NAME") ||
        "Asociatia pentru visuri si oportunitati"
    const iban =
        env("SPONSORSHIP_BENEFICIARY_IBAN") ||
        env("ASSOCIATION_IBAN") ||
        "RO22RNCB0280187121730001"

    const registryRaw = env("BENEFICIARY_ANAF_REGISTRY_CONFIRMED", "false").toLowerCase()
    const anafRegistryConfirmed = registryRaw === "true" || registryRaw === "1"

    return {
        name,
        cif: cif.replace(/^RO/i, ""),
        iban: iban.replace(/\s+/g, "").toUpperCase(),
        bank: env("SPONSORSHIP_BENEFICIARY_BANK", "BCR"),
        address: env(
            "SPONSORSHIP_BENEFICIARY_ADDRESS",
            "Romania"
        ),
        street: env("SPONSORSHIP_BENEFICIARY_STREET", ""),
        streetNumber: env("SPONSORSHIP_BENEFICIARY_STREET_NUMBER", ""),
        building: env("SPONSORSHIP_BENEFICIARY_BUILDING", ""),
        entrance: env("SPONSORSHIP_BENEFICIARY_ENTRANCE", ""),
        floor: env("SPONSORSHIP_BENEFICIARY_FLOOR", ""),
        apartment: env("SPONSORSHIP_BENEFICIARY_APARTMENT", ""),
        city: env("SPONSORSHIP_BENEFICIARY_CITY", ""),
        county: env("SPONSORSHIP_BENEFICIARY_COUNTY", ""),
        postalCode: env("SPONSORSHIP_BENEFICIARY_POSTAL_CODE", ""),
        representative: env(
            "SPONSORSHIP_BENEFICIARY_REPRESENTATIVE",
            "Reprezentant legal"
        ),
        representativeRole: env(
            "SPONSORSHIP_BENEFICIARY_REPRESENTATIVE_ROLE",
            "Presedinte"
        ),
        anafRegistryConfirmed,
    }
}

export function formatIbanDisplay(iban: string) {
    return iban.replace(/\s+/g, "").toUpperCase().replace(/(.{4})/g, "$1 ").trim()
}

export function getDefaultSponsorshipFiscalYear(): number {
    const raw = env("SPONSORSHIP_FISCAL_YEAR") || env("FORM_177_FISCAL_YEAR")
    if (raw) {
        const y = Number(raw)
        if (Number.isInteger(y) && y >= 2000 && y <= 2100) return y
    }
    // Default: previous calendar year (profit tax redirection typically for closed year)
    return new Date().getFullYear() - 1
}

export const SPONSORSHIP_PURPOSE =
    "Sustinerea activitatilor fara scop lucrativ ale Asociatiei Visuri pe hartie, inclusiv activitati sociale, umanitare si de sprijin destinate copiilor din medii vulnerabile."
