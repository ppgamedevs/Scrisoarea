import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const p = new PrismaClient({ adapter: new PrismaLibSQL({ url: "file:./prisma/dev.db" }) })

async function main() {
    const rows = await p.scrisoare.groupBy({
        by: ["moderationStatus", "status"],
        _count: true,
    })
    console.log(JSON.stringify(rows, null, 2))
}

main().finally(() => p.$disconnect())
