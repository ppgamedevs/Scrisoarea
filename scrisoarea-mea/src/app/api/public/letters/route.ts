import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"
import { SITE_URL } from "@/lib/seo/site"

// Cache for 10 mins
export const revalidate = 600

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'

    if (!checkRateLimit(ip + '_letters_api')) {
        return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 })
    }

    const { LetterModeration, publicTargetAmount } = await import("@/lib/letter-moderation")

    const letters = await prisma.scrisoare.findMany({
        where: {
            moderationStatus: LetterModeration.APPROVED,
            status: 'ACTIV',
        },
        select: {
            id: true,
            slug: true,
            status: true,
            category: true,
            childFirstName: true,
            childAge: true,
            targetAmount: true,
            approvedTargetAmount: true,
            collectedAmount: true,
            createdAt: true,
            institution: {
                select: { county: true, city: true }
            }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
    })

    const transformed = letters.map(l => ({
        id: l.id,
        url: `${SITE_URL}/scrisori/${l.slug || l.id}`,
        pseudonim: l.childFirstName,
        age: l.childAge,
        category: l.category,
        location: {
            county: l.institution.county,
            city: l.institution.city
        },
        financial: {
            target: publicTargetAmount(l),
            collected: Number(l.collectedAmount),
            currency: 'RON'
        },
        date_published: l.createdAt
    }))

    return NextResponse.json({
        meta: {
            page,
            limit,
            count: transformed.length
        },
        data: transformed
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60'
        }
    })
}
