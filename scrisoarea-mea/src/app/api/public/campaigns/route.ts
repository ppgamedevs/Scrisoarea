import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Cache for 1 hour
export const revalidate = 3600

export async function GET() {
    const campaigns = await prisma.campaign.findMany({
        where: { status: 'ACTIVE' },
        select: {
            slug: true,
            title: true,
            startsAt: true,
            endsAt: true,
            matchingRules: {
                where: { active: true },
                select: {
                    sponsor: { select: { name: true } },
                    matchType: true
                }
            }
        }
    })

    return NextResponse.json({
        data: campaigns.map(c => ({
            name: c.title,
            url: `https://scrisoareamea.ro/campaign/${c.slug}`,
            dates: {
                start: c.startsAt,
                end: c.endsAt
            },
            active_matching: c.matchingRules.length > 0 ? {
                sponsor: c.matchingRules[0].sponsor.name,
                type: c.matchingRules[0].matchType
            } : null
        }))
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600'
        }
    })
}
