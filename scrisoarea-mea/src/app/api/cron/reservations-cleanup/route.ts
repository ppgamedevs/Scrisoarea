import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { log } from "@/lib/logger"

export async function GET() {
    // Basic security check (use CRON_SECRET in prod)
    // if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

    const result = await prisma.reservation.updateMany({
        where: {
            status: 'PENDING',
            expiresAt: { lt: new Date() }
        },
        data: { status: 'EXPIRED' }
    })

    if (result.count > 0) {
        log(`Cron: Cleaned ${result.count} expired reservations.`, 'INFO')
    }

    return NextResponse.json({ processed: result.count })
}
