import prisma from "@/lib/prisma"

/**
 * Generate unique contract number SP-YYYY-000001 under concurrency.
 */
export async function allocateContractNumber(year: number): Promise<string> {
    const row = await prisma.$transaction(async (tx) => {
        const existing = await tx.contractNumberSequence.findUnique({ where: { year } })
        if (!existing) {
            return tx.contractNumberSequence.create({
                data: { year, lastSeq: 1 },
            })
        }
        return tx.contractNumberSequence.update({
            where: { year },
            data: { lastSeq: { increment: 1 } },
        })
    })
    return `SP-${year}-${String(row.lastSeq).padStart(6, "0")}`
}
