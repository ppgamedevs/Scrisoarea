import type { MetadataRoute } from "next"
import prisma from "@/lib/prisma"
import { LetterModeration } from "@/lib/letter-moderation"
import { LETTER_CATEGORIES, slugifyRo } from "@/lib/seo/categories"
import { INDEXABLE_ROUTES, SITE_URL } from "@/lib/seo/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = INDEXABLE_ROUTES.map((route) => ({
        url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = LETTER_CATEGORIES.map((category) => ({
        url: `${SITE_URL}/scrisori/categorie/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.85,
    }))

    const letters = await prisma.scrisoare.findMany({
        where: {
            moderationStatus: {
                in: [LetterModeration.APPROVED, LetterModeration.FULFILLED, "APPROVED", "fulfilled"],
            },
        },
        select: { slug: true, id: true, updatedAt: true },
        take: 10000,
    })

    const letterRoutes: MetadataRoute.Sitemap = letters.map((letter) => ({
        url: `${SITE_URL}/scrisori/${letter.slug || letter.id}`,
        lastModified: letter.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }))

    const campaigns = await prisma.campaign.findMany({
        select: { slug: true, createdAt: true },
        take: 200,
    })

    const campaignRoutes: MetadataRoute.Sitemap = campaigns.map((campaign) => ({
        url: `${SITE_URL}/campaign/${campaign.slug}`,
        lastModified: campaign.createdAt,
        changeFrequency: "weekly",
        priority: 0.65,
    }))

    const partners = await prisma.institution.findMany({
        where: { slug: { not: null }, verified: true },
        select: { slug: true, updatedAt: true },
        take: 500,
    })

    const partnerRoutes: MetadataRoute.Sitemap = partners
        .filter((partner): partner is { slug: string; updatedAt: Date } => Boolean(partner.slug))
        .map((partner) => ({
            url: `${SITE_URL}/partener/${partner.slug}`,
            lastModified: partner.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }))

    const countyRows = await prisma.institution.findMany({
        where: {
            scrisori: {
                some: {
                    moderationStatus: { in: [LetterModeration.APPROVED, "APPROVED"] },
                },
            },
        },
        select: { county: true },
    })
    const countySlugs = [...new Set(countyRows.map((row) => slugifyRo(row.county)).filter(Boolean))]

    const countyRoutes: MetadataRoute.Sitemap = countySlugs.map((slug) => ({
        url: `${SITE_URL}/scrisori/judet/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }))

    return [
        ...staticRoutes,
        ...categoryRoutes,
        ...countyRoutes,
        ...letterRoutes,
        ...campaignRoutes,
        ...partnerRoutes,
    ]
}
