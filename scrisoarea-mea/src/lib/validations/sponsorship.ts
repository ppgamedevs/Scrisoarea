import { z } from "zod"
import { normalizeCuiInput } from "@/lib/validations/cui"
import { validateCUI } from "@/lib/validations/ro-tax"

const cuiSchema = z
    .string()
    .min(2)
    .transform((v) => normalizeCuiInput(v))
    .refine((v) => validateCUI(v), { message: "CUI invalid" })

const fiscalAddressSchema = z.object({
    county: z.string().min(1, "Județul este obligatoriu"),
    city: z.string().min(1, "Localitatea este obligatorie"),
    street: z.string().min(1, "Strada este obligatorie"),
    streetNumber: z.string().min(1, "Numărul este obligatoriu"),
    building: z.string().optional(),
    entrance: z.string().optional(),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    postalCode: z.string().optional(),
})

export const taxRegimeSchema = z.enum(["PROFIT_TAX", "MICROENTERPRISE", "UNKNOWN"])

export const directSponsorshipSchema = z
    .object({
        companyName: z.string().min(2, "Denumirea companiei este obligatorie"),
        companyCif: cuiSchema,
        regCom: z.string().optional(),
        taxRegime: taxRegimeSchema,
        representativeName: z.string().min(2, "Reprezentantul legal este obligatoriu"),
        representativeRole: z.string().optional(),
        email: z.string().email("Email invalid"),
        phone: z.string().optional(),
        sponsorshipAmount: z.coerce.number().positive("Suma trebuie să fie mai mare ca 0"),
        signatureBase64: z.string().min(20, "Semnătura este obligatorie"),
        consentTerms: z
            .boolean()
            .refine((v) => v === true, { message: "Acceptarea termenilor este obligatorie" }),
        consentPrivacy: z
            .boolean()
            .refine((v) => v === true, { message: "Consimțământul GDPR este obligatoriu" }),
    })
    .merge(fiscalAddressSchema)

export const form177Schema = z
    .object({
        fiscalYear: z.coerce.number().int().min(2024).max(2100),
        companyName: z.string().min(2),
        companyCif: cuiSchema,
        regCom: z.string().optional(),
        taxRegime: z.literal("PROFIT_TAX"),
        representativeName: z.string().min(2),
        representativeRole: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        fax: z.string().optional(),
        maximumRedirectableAmount: z.coerce.number().positive(),
        previouslyRedirectedAmount: z.coerce.number().min(0),
        requestedRedirectAmount: z.coerce.number().positive(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        disclosureConsent: z.boolean(),
        profitTaxConfirm: z
            .boolean()
            .refine((v) => v === true, {
                message: "Confirmarea regimului de impozit pe profit este obligatorie",
            }),
        signatureBase64: z.string().min(20, "Semnătura este obligatorie"),
        consentTerms: z
            .boolean()
            .refine((v) => v === true, { message: "Acceptarea termenilor este obligatorie" }),
        consentPrivacy: z
            .boolean()
            .refine((v) => v === true, { message: "Consimțământul GDPR este obligatoriu" }),
    })
    .merge(fiscalAddressSchema)
    .superRefine((data, ctx) => {
        const remaining = Math.max(
            0,
            data.maximumRedirectableAmount - data.previouslyRedirectedAmount
        )
        if (data.requestedRedirectAmount > remaining) {
            ctx.addIssue({
                code: "custom",
                path: ["requestedRedirectAmount"],
                message: `Suma solicitată nu poate depăși suma rămasă (${remaining.toFixed(2)} RON)`,
            })
        }
    })

export type DirectSponsorshipInput = z.infer<typeof directSponsorshipSchema>
export type Form177Input = z.infer<typeof form177Schema>
