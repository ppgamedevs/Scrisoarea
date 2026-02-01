import { MetadataRoute } from 'next'
import prisma from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scrisoareamea.ro'

    // Core pages
    const routes = [
        '',
        '/scrisori',
        '/impact',
        '/cum-functioneaza',
        '/protectia-copiilor',
        '/verificare-institutii',
        '/transparenta',
        '/transparenta/tranzactii',
        '/despre',
        '/contact',
        '/termeni',
        '/confidentialitate',
        '/cookies',
        '/fapte',
        '/siguranta',
        '/procese',
        '/intrebari',
        '/update-uri'
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic Letters (Public statuses only)
    const letters = await prisma.scrisoare.findMany({
        where: {
            status: { in: ['NOU', 'ACTIV', 'FINANTAT', 'IN_ACHIZITIE', 'LIVRAT', 'INCHIS'] }
        },
        select: { slug: true, id: true, updatedAt: true },
        take: 5000 // Limit for MVP
    })

    const letterRoutes = letters.map(l => ({
        url: `${baseUrl}/scrisori/${l.slug || l.id}`,
        lastModified: l.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Campaigns
    const campaigns = await prisma.campaign.findMany({
        select: { slug: true, createdAt: true },
        take: 100
    })

    const campaignRoutes = campaigns.map(c => ({
        url: `${baseUrl}/campaign/${c.slug}`,
        lastModified: c.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...letterRoutes, ...campaignRoutes]
}
