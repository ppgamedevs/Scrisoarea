import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// Cron Job to expire old claims
export async function GET() {
    try {
        const now = new Date()

        // Find expired PENDING claims
        const expired = await prisma.fulfillmentClaim.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: now }
            },
            data: {
                status: 'EXPIRED'
            }
        })

        return NextResponse.json({
            success: true,
            message: `Expired ${expired.count} claims.`
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
