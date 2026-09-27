import type { Metadata } from "next"
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_NAME_DIACRITICS, SITE_URL, absoluteUrl, ogImageUrl } from "./site"

type PageSeoInput = {
    title: string
    description: string
    path: string
    keywords?: string[]
    image?: string
    noIndex?: boolean
    type?: "website" | "article"
}

export function pageMetadata({
    title,
    description,
    path,
    keywords = [],
    image,
    noIndex = false,
    type = "website",
}: PageSeoInput): Metadata {
    const url = absoluteUrl(path)
    const og = image || ogImageUrl(title, description.slice(0, 80))

    return {
        title,
        description,
        keywords: [
            SITE_NAME,
            SITE_NAME_DIACRITICS,
            "donație copii România",
            "caritate transparentă",
            "scrisori Moș Crăciun",
            ...keywords,
        ],
        alternates: {
            canonical: url,
            languages: {
                "ro-RO": url,
                ro: url,
            },
        },
        openGraph: {
            type,
            locale: SITE_LOCALE,
            url,
            siteName: SITE_NAME,
            title,
            description,
            images: [{ url: og, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [og],
        },
        robots: noIndex
            ? { index: false, follow: false }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-image-preview": "large",
                      "max-snippet": -1,
                      "max-video-preview": -1,
                  },
              },
    }
}

const homeSeo = pageMetadata({
    title: `${SITE_NAME_DIACRITICS} | Donații verificate pentru copii din România`,
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: [
        "Visuri pe hârtie",
        "visuripehartie.ro",
        "donație ONG România",
        "redirecționare 3.5%",
        "formular 230",
        "scrisoare copii",
    ],
})

export const defaultMetadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    ...homeSeo,
    title: {
        default: `${SITE_NAME_DIACRITICS} | Donații verificate pentru copii din România`,
        template: `%s | ${SITE_NAME}`,
    },
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "nonprofit",
    classification: "Charity, Nonprofit, Child welfare, Romania",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false, email: false, address: false },
    icons: {
        icon: "/brand/visuri-pe-hartie-logo.png",
        apple: "/brand/visuri-pe-hartie-logo.png",
    },
    manifest: "/manifest.webmanifest",
}
