import { validateCUI } from "@/lib/validations/ro-tax"

/** Strip RO prefix and non-digits; return digits-only CUI or null if invalid shape. */
export function normalizeCuiInput(raw: string): string {
    return String(raw || "")
        .trim()
        .replace(/^RO/i, "")
        .replace(/\s+/g, "")
}

/** Normalize + validate. Throws if invalid. Never invents a valid CUI from invalid input. */
export function normalizeAndValidateCui(raw: string): string {
    const digits = normalizeCuiInput(raw)
    if (!validateCUI(digits)) {
        throw new Error("CUI invalid")
    }
    return digits
}
