import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { publicWishlistWhere, publicTargetAmount } from "@/lib/letter-moderation"

export type LetterFilter = {
    category?: string
    ageRange?: string
    county?: string
    status?: 'nou' | 'aproape_complet'
    page?: number
}

const PAGE_SIZE = 12

export async function getLetters(filter: LetterFilter) {
    const { category, ageRange, county, page = 1 } = filter
    const where: Prisma.ScrisoareWhereInput = {
        ...publicWishlistWhere,
    }
    if (category) where.category = category
    if (county) where.institution = { county: { equals: county } }
    if (ageRange) {
        const [min, max] = ageRange.split('-').map(Number)
        if (!isNaN(min)) {
            where.childAge = { gte: min }
            if (!isNaN(max)) where.childAge.lte = max
            else where.childAge.gte = 18
        }
    }

    const skip = (page - 1) * PAGE_SIZE

    const [letters, total] = await Promise.all([
        prisma.scrisoare.findMany({
            where,
            include: {
                institution: { select: { county: true } },
                reservations: { where: { status: 'PENDING', expiresAt: { gt: new Date() } } },
                fulfillmentClaims: {
                    where: {
                        status: { in: ['PENDING', 'SHIPPED', 'COMPLETED'] },
                        expiresAt: { gt: new Date() }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: PAGE_SIZE
        }),
        prisma.scrisoare.count({ where })
    ])

    const processed = letters.map(letter => {
        const reserved = letter.reservations.reduce((acc, r) => acc + Number(r.amount), 0)
        const paid = Number(letter.collectedAmount)
        const target = publicTargetAmount(letter)
        const total = paid + reserved

        // Active claim check
        const hasActiveClaim = letter.fulfillmentClaims.length > 0

        return {
            ...letter,
            targetAmount: target,
            collectedAmount: paid,
            reservedAmount: reserved,
            remainingAmount: Math.max(0, target - total),
            percentage: Math.min(100, Math.round((total / target) * 100)),
            hasActiveClaim
        }
    })

    return { data: processed, total }
}

export type LetterWithMeta = Awaited<ReturnType<typeof getLetters>>['data'][0]
