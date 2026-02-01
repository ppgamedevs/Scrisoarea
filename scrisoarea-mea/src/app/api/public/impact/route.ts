import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const revalidate = 600

export async function GET() {
    const closed = await prisma.scrisoare.findMany({
        where: {
            status: 'INCHIS',
            proofApproved: true
        },
        take: 20,
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            childFirstName: true,
            category: true,
            proofs: {
                where: { moderationStatus: 'APPROVED' },
                take: 1,
                select: { type: true, url: true } // In real world maybe verify url is public safe
            }
        }
    })

    const data = closed.filter(c => c.proofs.length > 0).map(c => ({
        beneficiary_name: c.childFirstName, // First name only safe
        category: c.category,
        proof_type: c.proofs[0].type,
        proof_url: c.proofs[0].url
    }))

    return NextResponse.json({ data }, {
        headers: {
            'Cache-Control': 'public, s-maxage=600'
        }
    })
}
