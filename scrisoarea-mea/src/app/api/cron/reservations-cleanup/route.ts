import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { log } from "@/lib/logger"

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET
    if (secret && request.headers.get('Authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
