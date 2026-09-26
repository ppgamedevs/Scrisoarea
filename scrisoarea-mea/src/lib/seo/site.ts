export const SITE_URL = (
    process.env.NEXT_PUBLIC_APP_URL || "https://www.visuripehartie.ro"
).replace(/\/$/, "")

export const SITE_NAME = "Visuri pe hartie"
export const SITE_NAME_DIACRITICS = "Visuri pe hârtie"
export const LEGAL_NAME = "Asociația pentru visuri și oportunități"
export const SITE_TAGLINE = "Platformă de caritate verificată din România. 100% transparentă, fără comisioane."
export const SITE_DESCRIPTION =
    "Donează pentru copii din România prin scrisori verificate. Visuri pe hârtie conectează donatori cu ONG-uri și școli auditate. Fără comisioane, cu dovadă foto sau video după livrare."
export const SITE_LOCALE = "ro_RO"
export const SITE_LANGUAGE = "ro"
export const SITE_COUNTRY = "RO"
export const SITE_CITY = "București"
export const SITE_CUI = process.env.NEXT_PUBLIC_ASSOCIATION_CUI || "55406686"
export const SITE_EMAIL = process.env.CONTACT_EMAIL || "contact@visuripehartie.ro"
export const SITE_SAFETY_EMAIL = process.env.SAFETY_EMAIL || "safety@visuripehartie.ro"
export const SITE_TWITTER = process.env.NEXT_PUBLIC_SOCIAL_TWITTER || undefined

export function absoluteUrl(path = ""): string {
    if (!path) return SITE_URL
    if (path.startsWith("http://") || path.startsWith("https://")) return path
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function ogImageUrl(title: string, subtitle = "", label = "Visuri pe hartie") {
    const params = new URLSearchParams({
        title,
        subtitle,
        label,
    })
    return absoluteUrl(`/og?${params.toString()}`)
}

export const SOCIAL_LINKS = [
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
    process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
    process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
    process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
    SITE_TWITTER,
].filter((url): url is string => Boolean(url))

export const INDEXABLE_ROUTES = [
    { path: "/", title: "Acasă", priority: 1, changeFrequency: "daily" as const },
    { path: "/scrisori", title: "Scrisori verificate", priority: 0.95, changeFrequency: "hourly" as const },
    { path: "/cum-functioneaza", title: "Cum funcționează", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/intrebari", title: "Întrebări frecvente", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/impact", title: "Impact și dovezi", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/fapte", title: "Fapte și statistici", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/despre", title: "Despre noi", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/directioneaza-35", title: "Redirecționează 3,5%", priority: 0.85, changeFrequency: "yearly" as const },
    { path: "/directioneaza-20", title: "Sponsorizare 20%", priority: 0.8, changeFrequency: "yearly" as const },
    { path: "/donatie-lunara", title: "Donație lunară", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/protectia-copiilor", title: "Protecția copiilor", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/verificare-institutii", title: "Verificarea instituțiilor", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/siguranta", title: "Siguranță", priority: 0.65, changeFrequency: "yearly" as const },
    { path: "/procese", title: "Procese interne", priority: 0.6, changeFrequency: "yearly" as const },
    { path: "/transparenta", title: "Transparență", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/transparenta/tranzactii", title: "Tranzacții publice", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/update-uri", title: "Actualizări", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/contact", title: "Contact", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/termeni", title: "Termeni", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/confidentialitate", title: "Confidențialitate", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/cookies", title: "Cookie-uri", priority: 0.2, changeFrequency: "yearly" as const },
]
