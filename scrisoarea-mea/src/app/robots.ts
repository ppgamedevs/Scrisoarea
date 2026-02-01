import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scrisoareamea.ro'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/partner/',
                '/api/',
                '/private/',
                '/login',
                // We keep transparenta/tranzactii allowed as it builds broad trust, 
                // but we might want to prevent abuse of query params later via canonicals or headers.
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
