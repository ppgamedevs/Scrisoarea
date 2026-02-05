import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { log } from "@/lib/logger"

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET
    if (secret && request.headers.get('Authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.matchingRule.updateMany({
        where: {
            active: true,
            endsAt: { lt: new Date() }
        },
        data: { active: false }
    })

    if (result.count > 0) {
        log(`Cron: Disabled ${result.count} expired matching rules.`, 'INFO')
    }

    return NextResponse.json({ processed: result.count })
}
