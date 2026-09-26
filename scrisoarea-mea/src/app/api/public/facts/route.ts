import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"

// Cache for 1 hour
export const revalidate = 3600

export async function GET() {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'

    // Loose rate limit for public APIs
    if (!checkRateLimit(ip + '_facts')) {
        return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 })
    }

    const totalDonations = await prisma.donation.aggregate({ _sum: { amount: true, matchedAmount: true }, where: { status: 'SUCCEEDED' } })
    const activeLetters = await prisma.scrisoare.count({
        where: { status: 'ACTIV', moderationStatus: 'approved' },
    })
    const fulfilledLetters = await prisma.scrisoare.count({
        where: {
            OR: [
                { moderationStatus: 'fulfilled' },
                { status: 'INCHIS', proofApproved: true },
            ],
        },
    })

    const raised = Number(totalDonations._sum.amount || 0) + Number(totalDonations._sum.matchedAmount || 0)

    const facts = {
        meta: {
            title: "Visuri pe hartie Public Stats",
            lastUpdated: new Date().toISOString(),
            license: "CC-BY-4.0",
            documentation: "https://scrisoareamea.ro/fapte"
        },
        data: {
            active_letters_count: activeLetters,
            fulfilled_wishes_count: fulfilledLetters,
            total_raised_ron: raised,
            currency: "RON"
        }
    }

    return NextResponse.json(facts, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
        }
    })
}
