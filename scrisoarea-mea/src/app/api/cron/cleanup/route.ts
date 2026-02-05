import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET
    if (secret && req.headers.get('Authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.reservation.updateMany({
        where: {
            status: 'PENDING',
            expiresAt: { lt: new Date() }
        },
        data: {
            status: 'EXPIRED'
        }
    })

    return NextResponse.json({ success: true, count: result.count })
}
