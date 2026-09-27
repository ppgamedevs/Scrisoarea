import { FAQ_ITEMS } from "@/lib/constants"
import { categoryLabel } from "./categories"
import {
    LEGAL_NAME,
    SITE_CITY,
    SITE_COUNTRY,
    SITE_CUI,
    SITE_DESCRIPTION,
    SITE_EMAIL,
    SITE_NAME,
    SITE_NAME_DIACRITICS,
    SITE_URL,
    SOCIAL_LINKS,
    absoluteUrl,
} from "./site"

export const BASE_URL = SITE_URL

export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": ["NGO", "Organization"],
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME_DIACRITICS,
        alternateName: [SITE_NAME, LEGAL_NAME, "visuripehartie.ro"],
        legalName: LEGAL_NAME,
        url: SITE_URL,
        logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/brand/visuri-pe-hartie-logo.png"),
        },
        image: absoluteUrl("/brand/visuri-pe-hartie-logo.png"),
        description: SITE_DESCRIPTION,
        taxID: SITE_CUI,
        email: SITE_EMAIL,
        foundingLocation: {
            "@type": "Place",
            address: {
                "@type": "PostalAddress",
                addressLocality: SITE_CITY,
                addressCountry: SITE_COUNTRY,
            },
        },
        address: {
            "@type": "PostalAddress",
            addressLocality: SITE_CITY,
            addressCountry: SITE_COUNTRY,
        },
        areaServed: {
            "@type": "Country",
            name: "România",
        },
        knowsLanguage: "ro",
        nonprofitStatus: "NonprofitType",
        contactPoint: [
            {
                "@type": "ContactPoint",
                email: SITE_EMAIL,
                contactType: "customer support",
                availableLanguage: ["Romanian", "ro"],
                areaServed: "RO",
            },
        ],
        sameAs: SOCIAL_LINKS,
        slogan: "Fii motivul zâmbetului lor.",
    }
}

export function generateWebsiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME_DIACRITICS,
        alternateName: [SITE_NAME, "visuripehartie.ro"],
        url: SITE_URL,
        inLanguage: "ro-RO",
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/scrisori?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
        })),
    }
}

export function generateFaqSchema(items: { q: string; a: string }[] = FAQ_ITEMS) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        })),
    }
}

export function generateHowToSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Cum donezi pe Visuri pe hârtie",
        description:
            "Pașii prin care o scrisoare a unui copil din România este verificată, finanțată și livrată, cu dovadă.",
        inLanguage: "ro-RO",
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "Instituția încarcă scrisoarea",
                text: "Un ONG, o școală sau un centru de zi verificat încarcă scrisoarea și lista de obiecte.",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "Echipa verifică cazul",
                text: "Nu publicăm scrisori până nu validăm juridic partenerul și autenticitatea nevoii.",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "Donezi online sau trimiți pachetul",
                text: "Alegi o scrisoare, donezi în RON sau rezervi livrarea fizică către instituție, nu către adresa copilului.",
            },
            {
                "@type": "HowToStep",
                position: 4,
                name: "Primești dovada",
                text: "Partenerul încarcă foto sau video de la predare. Dovada este moderată înainte de publicare.",
            },
        ],
    }
}

export function generateLetterSchema(letter: {
    childFirstName: string
    childAge: number
    childStory?: string | null
    category: string
    slug?: string | null
    id: string
    createdAt: Date
    updatedAt: Date
    status: string
    targetAmount?: unknown
    collectedAmount?: unknown
    institution?: { publicName?: string | null; name?: string | null; county?: string | null; city?: string | null }
}) {
    const path = `/scrisori/${letter.slug || letter.id}`
    const url = absoluteUrl(path)
    const orgName = letter.institution?.publicName || letter.institution?.name || "Instituție verificată"
    const location = [letter.institution?.city, letter.institution?.county].filter(Boolean).join(", ")
    const headline = `Donează pentru ${letter.childFirstName}, ${letter.childAge} ani${location ? ` din ${location}` : ""}`

    return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${url}#letter`,
        headline,
        name: `Dorința lui ${letter.childFirstName} — ${categoryLabel(letter.category)}`,
        description:
            letter.childStory?.slice(0, 240) ||
            `Scrisoare verificată pe Visuri pe hârtie: ajută-l pe ${letter.childFirstName} (${letter.childAge} ani) cu ${categoryLabel(letter.category).toLowerCase()}.`,
        inLanguage: "ro-RO",
        datePublished: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt,
        dateModified: letter.updatedAt instanceof Date ? letter.updatedAt.toISOString() : letter.updatedAt,
        url,
        isAccessibleForFree: true,
        genre: categoryLabel(letter.category),
        about: {
            "@type": "Thing",
            name: `Ajutor pentru ${letter.childFirstName}`,
        },
        author: {
            "@type": "Organization",
            name: orgName,
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
        },
        recipient: {
            "@type": "Person",
            givenName: letter.childFirstName,
            description: `Copil de ${letter.childAge} ani. Publicăm doar prenumele, fără adresă privată.`,
        },
        speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: ["h1", "[data-seo-summary]"],
        },
        offers: {
            "@type": "Offer",
            priceCurrency: "RON",
            price: String(letter.targetAmount ?? 0),
            availability:
                letter.status === "ACTIV" || letter.status === "NOU"
                    ? "https://schema.org/InStock"
                    : "https://schema.org/SoldOut",
            url,
        },
    }
}

export function generateItemListSchema(
    name: string,
    items: { name: string; url: string }[],
    url: string
) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        url: absoluteUrl(url),
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
        })),
    }
}

export function generateCollectionPageSchema(title: string, description: string, path: string) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: absoluteUrl(path),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "ro-RO",
    }
}
