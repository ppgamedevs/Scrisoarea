import { headers } from 'next/headers'

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://scrisoarea-mea.ro'

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Asociația Vise pe hârtie',
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'contact@scrisoareamea.ro',
            contactType: 'customer support'
        },
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Bucuresti',
            addressCountry: 'RO'
        },
        sameAs: (process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM)
            ? [
                ...(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ? [process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK] : []),
                ...(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ? [process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM] : [])
            ].filter(Boolean)
            : []
    }
}

export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Vise pe hârtie',
        url: BASE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE_URL}/scrisori?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    }
}

export function generateBreadcrumbSchema(items: { name: string, url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.url}`
        }))
    }
}

export function generateLetterSchema(letter: any) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork', // Using CreativeWork for broad compatibility, or 'SocialMediaPosting' but CreativeWork is safer for "Donation Request/Story"
        headline: `Scrisoare verificată: ${letter.childFirstName}`,
        name: `Dorința lui ${letter.childFirstName}`,
        description: `Ajută la îndeplinirea dorinței pentru ${letter.childFirstName} (${letter.category}). Verificat de Vise pe hârtie.`,
        datePublished: letter.createdAt.toISOString(),
        dateModified: letter.updatedAt.toISOString(),
        url: `${BASE_URL}/scrisori/${letter.slug || letter.id}`,
        author: {
            '@type': 'Organization',
            name: letter.institution?.name || 'Instituție Verificată'
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/scrisori/${letter.slug || letter.id}`
        },
        offers: {
            '@type': 'Offer',
            price: letter.targetAmount,
            priceCurrency: 'RON',
            availability: letter.status === 'ACTIV' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
        }
    }
}

export function generateCollectionPageSchema(title: string, description: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: description,
        url: BASE_URL
    }
}
