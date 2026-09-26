export type WishlistItem = {
    name: string
    size: string
    quantity: number
    /** Institution-submitted estimate (never shown as the public target). */
    submittedEstimatedPrice: number
    /** Admin-controlled price shown publicly when set. */
    adminApprovedPrice: number | null
}

/** Accepts both new field names and legacy `estimatedValue`. */
export function parseWishlistItems(raw: string | null | undefined): WishlistItem[] {
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.map((item: Record<string, unknown>) => {
            const submitted = Number(
                item.submittedEstimatedPrice ?? item.estimatedValue ?? 0
            )
            const adminRaw = item.adminApprovedPrice
            const adminApprovedPrice =
                adminRaw === null || adminRaw === undefined || adminRaw === ""
                    ? null
                    : Number(adminRaw)

            return {
                name: String(item.name ?? "").trim(),
                size: String(item.size ?? "").trim(),
                quantity: Math.max(1, Number(item.quantity ?? 1) || 1),
                submittedEstimatedPrice: Number.isFinite(submitted) ? submitted : 0,
                adminApprovedPrice:
                    adminApprovedPrice != null && Number.isFinite(adminApprovedPrice)
                        ? adminApprovedPrice
                        : null,
            }
        }).filter((i) => i.name.length > 0)
    } catch {
        return []
    }
}

export function serializeWishlistItems(items: WishlistItem[]): string {
    return JSON.stringify(
        items.map((i) => ({
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            submittedEstimatedPrice: i.submittedEstimatedPrice,
            adminApprovedPrice: i.adminApprovedPrice,
            // Keep legacy key for older UI until fully migrated
            estimatedValue: i.submittedEstimatedPrice,
        }))
    )
}

export function sumSubmittedEstimates(items: WishlistItem[]): number {
    return items.reduce((acc, i) => acc + Number(i.submittedEstimatedPrice || 0) * (i.quantity || 1), 0)
}

export function sumAdminApprovedPrices(items: WishlistItem[]): number {
    return items.reduce((acc, i) => {
        const price = i.adminApprovedPrice
        if (price == null) return acc
        return acc + Number(price) * (i.quantity || 1)
    }, 0)
}

export function publicItemPrice(item: WishlistItem): number | null {
    if (item.adminApprovedPrice != null) return item.adminApprovedPrice
    return null
}

export function itemsFromPartnerForm(
    raw: Array<{ name?: string; size?: string; estimatedValue?: number | string; quantity?: number }>
): WishlistItem[] {
    return raw
        .map((item) => ({
            name: String(item.name ?? "").trim(),
            size: String(item.size ?? "").trim(),
            quantity: Math.max(1, Number(item.quantity ?? 1) || 1),
            submittedEstimatedPrice: Number(item.estimatedValue || 0),
            adminApprovedPrice: null as number | null,
        }))
        .filter((i) => i.name.length > 0)
}
