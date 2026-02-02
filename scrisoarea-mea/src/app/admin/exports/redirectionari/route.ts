import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getSession()
    if (session?.role !== 'ADMIN') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const requests = await prisma.taxRedirectionRequest.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const csvHeader = "ID,Data,Tip,Status,Nume/Firma,Email,Telefon,CNP/CUI,Suma,Oras,Judet\n"
    const csvRows = requests.map(req => {
        const name = req.type === 'COMPANY_177' ? req.companyName : `${req.lastName} ${req.firstName}`
        const identifier = req.type === 'COMPANY_177' ? req.cui : req.cnp
        const city = req.city || ''
        const county = req.county || ''
        // Escape commas
        const safeName = `"${name?.replace(/"/g, '""') || ''}"`
        const safeCity = `"${city.replace(/"/g, '""')}"`

        return [
            req.id,
            req.createdAt.toISOString(),
            req.type,
            req.status,
            safeName,
            req.email,
            req.phone || '',
            identifier || '',
            req.amountRON || 0,
            safeCity,
            county
        ].join(',')
    }).join('\n')

    const csv = csvHeader + csvRows

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="redirectionari_${new Date().toISOString().slice(0, 10)}.csv"`
        }
    })
}
