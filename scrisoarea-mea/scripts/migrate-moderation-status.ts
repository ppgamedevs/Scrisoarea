import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSQL({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
    const map: [string, string][] = [
        ["DRAFT", "draft"],
        ["SUBMITTED", "pending_review"],
        ["APPROVED", "approved"],
        ["REJECTED", "rejected"],
    ]
    for (const [from, to] of map) {
        const r = await prisma.scrisoare.updateMany({
            where: { moderationStatus: from },
            data: { moderationStatus: to },
        })
        console.log(`${from} -> ${to}: ${r.count}`)
    }

    const letters = await prisma.scrisoare.findMany({
        where: { submittedTargetAmount: 0 },
    })
    for (const l of letters) {
        await prisma.scrisoare.update({
            where: { id: l.id },
            data: {
                submittedTargetAmount: l.targetAmount,
                approvedTargetAmount:
                    l.moderationStatus === "approved" ? l.targetAmount : l.approvedTargetAmount,
            },
        })
    }
    console.log(`backfilled ${letters.length}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
