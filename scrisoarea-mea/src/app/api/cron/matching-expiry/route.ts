import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { log } from "@/lib/logger"

export async function GET() {
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
