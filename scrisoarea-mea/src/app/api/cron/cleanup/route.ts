import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
    // Simple check for cron key if needed, or leave public for MVP
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...

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
