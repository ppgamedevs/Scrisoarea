import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const p = new PrismaClient({ adapter: new PrismaLibSQL({ url: "file:./prisma/dev.db" }) })

async function main() {
    // Letters already in public lifecycle but missing approval metadata
    const r = await p.scrisoare.updateMany({
        where: {
            moderationStatus: "draft",
            status: { in: ["ACTIV", "FINANTAT", "IN_ACHIZITIE", "LIVRAT", "INCHIS"] },
        },
        data: {
            moderationStatus: "approved",
            approvedAt: new Date(),
        },
    })
    console.log("promoted to approved:", r.count)

    const needTarget = await p.scrisoare.findMany({
        where: { moderationStatus: "approved", approvedTargetAmount: null },
    })
    for (const l of needTarget) {
        const amount = Number(l.targetAmount)
        const capped = Math.min(Math.max(amount, 1), 500)
        await p.scrisoare.update({
            where: { id: l.id },
            data: {
                approvedTargetAmount: capped,
                targetAmount: capped,
            },
        })
    }
    console.log("set approvedTargetAmount:", needTarget.length)
}

main().finally(() => p.$disconnect())
