import prisma from "@/lib/prisma"
import { LetterModeration } from "@/lib/letter-moderation"
import { LETTER_CATEGORIES, slugifyRo } from "@/lib/seo/categories"
import { INDEXABLE_ROUTES, SITE_URL } from "@/lib/seo/site"

const STATIC_LASTMOD = "2026-09-26"

type Entry = {
    path: string
    lastmod: string
    changefreq: string
    priority: string
}

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

function day(value?: Date | string | null) {
    if (!value) return STATIC_LASTMOD
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return STATIC_LASTMOD
    return date.toISOString().slice(0, 10)
}

function formatPriority(priority: number) {
    return priority >= 1 ? "1.0" : priority.toFixed(2)
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await fn()
    } catch {
        return fallback
    }
}

export async function buildSitemapEntries(): Promise<Entry[]> {
    const rows: Entry[] = INDEXABLE_ROUTES.map((route) => ({
        path: route.path,
        lastmod: STATIC_LASTMOD,
        changefreq: route.changeFrequency,
        priority: formatPriority(route.priority),
    }))

    for (const category of LETTER_CATEGORIES) {
        rows.push({
            path: `/scrisori/categorie/${category.slug}`,
            lastmod: STATIC_LASTMOD,
            changefreq: "daily",
            priority: "0.85",
        })
    }

    const [letters, campaigns, partners, countyRows] = await Promise.all([
        safeQuery(
            () =>
                prisma.scrisoare.findMany({
                    where: {
                        moderationStatus: {
                            in: [LetterModeration.APPROVED, LetterModeration.FULFILLED, "APPROVED"],
                        },
                    },
                    select: { slug: true, id: true, updatedAt: true },
                    take: 10000,
                }),
            []
        ),
        safeQuery(
            () =>
                prisma.campaign.findMany({
                    select: { slug: true, createdAt: true },
                    take: 200,
                }),
            []
        ),
        safeQuery(
            () =>
                prisma.institution.findMany({
                    where: { slug: { not: null }, verified: true },
                    select: { slug: true, updatedAt: true },
                    take: 500,
                }),
            []
        ),
        safeQuery(
            () =>
                prisma.institution.findMany({
                    where: {
                        scrisori: {
                            some: {
                                moderationStatus: { in: [LetterModeration.APPROVED, "APPROVED"] },
                            },
                        },
                    },
                    select: { county: true },
                }),
            []
        ),
    ])

    for (const letter of letters) {
        rows.push({
            path: `/scrisori/${letter.slug || letter.id}`,
            lastmod: day(letter.updatedAt),
            changefreq: "weekly",
            priority: "0.80",
        })
    }

    for (const campaign of campaigns) {
        rows.push({
            path: `/campaign/${campaign.slug}`,
            lastmod: day(campaign.createdAt),
            changefreq: "weekly",
            priority: "0.65",
        })
    }

    for (const partner of partners) {
        if (!partner.slug) continue
        rows.push({
            path: `/partener/${partner.slug}`,
            lastmod: day(partner.updatedAt),
            changefreq: "weekly",
            priority: "0.60",
        })
    }

    const countySlugs = [...new Set(countyRows.map((row) => slugifyRo(row.county)).filter(Boolean))]
    for (const slug of countySlugs) {
        rows.push({
            path: `/scrisori/judet/${slug}`,
            lastmod: STATIC_LASTMOD,
            changefreq: "weekly",
            priority: "0.70",
        })
    }

    return rows
}

export async function buildSitemapXml() {
    const rows = await buildSitemapEntries()
    const urls = rows
        .map((row) => {
            const loc = row.path === "/" ? SITE_URL : `${SITE_URL}${row.path}`
            return [
                "  <url>",
                `    <loc>${escapeXml(loc)}</loc>`,
                `    <lastmod>${row.lastmod}</lastmod>`,
                `    <changefreq>${row.changefreq}</changefreq>`,
                `    <priority>${row.priority}</priority>`,
                "  </url>",
            ].join("\n")
        })
        .join("\n")

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function sitemapXmlResponse(xml: string) {
    return new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
        },
    })
}
