import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
    const session = await getSession()
    if (session?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 })

    const donations = await prisma.donation.findMany({
        where: { status: 'SUCCEEDED' },
        include: { sponsor: true },
        orderBy: { createdAt: 'desc' }
    })

    const csvHeader = "ID,Date,Amount,MatchedAmount,TotalCredited,Sponsor,ScrisoareID,Status\n"
    const csvRows = donations.map(d => {
        return [
            d.id,
            d.createdAt.toISOString(),
            d.amount,
            d.matchedAmount,
            d.totalCreditedAmount,
            d.sponsor?.name || 'N/A',
            d.scrisoareId,

            d.status
        ].join(",")
    }).join("\n")

    return new NextResponse(csvHeader + csvRows, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="donations-export.csv"'
        }
    })
}
