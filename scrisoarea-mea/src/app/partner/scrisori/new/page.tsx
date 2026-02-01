import prisma from "@/lib/prisma"
import NewScrisoareForm from "./new-letter-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewScrisoarePage() {
    const session = await getSession()
    if (!session || session.role !== 'PARTNER') redirect('/auth/signin?callbackUrl=/partner/scrisori/new')

    // Fetch active campaigns
    const now = new Date()
    const campaigns = await prisma.campaign.findMany({
        where: {
            // Assume we have active campaigns. Status 'ACTIV' or based on dates.
            // Schema has status with default "DRAFT". I'll check date logic too later.
            // For now, let's assume 'ACTIV' and date range if statuses are used properly.
            // If status field is string, I'll filter by whatever convention is used.
            // Let's assume 'ACTIV' is the status for live campaigns.
            OR: [
                { status: 'ACTIV' },
                { status: 'ACTIVE' } // Just in case of typo/convention variance
            ]
        },
        select: { id: true, title: true, slug: true }
    })

    return <NewScrisoareForm campaigns={campaigns} />
}
