import prisma from "@/lib/prisma"

export async function getDonorDashboardData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) return null

    // Fetch donations by email since there is no direct relation in schema yet
    const donations = await prisma.donation.findMany({
        where: {
            donorEmail: { equals: user.email, mode: 'insensitive' },
            status: 'SUCCEEDED' // Only confirmed donations
        },
        include: {
            scrisoare: {
                include: {
                    institution: true,
                    updates: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Calculate aggregated stats
    const totalDonated = donations.reduce((acc, donation) => {
        return acc + Number(donation.amount)
    }, 0)

    const uniqueChildrenIds = new Set(donations.map(d => d.scrisoareId))
    const uniqueChildrenSupported = uniqueChildrenIds.size

    // Group by child for "Impact Gallery"
    // We want to show distinct children helped, with latest updates
    const impactByChildMap = new Map()

    donations.forEach(donation => {
        if (!donation.scrisoare) return

        const existing = impactByChildMap.get(donation.scrisoareId)
        if (!existing) {
            impactByChildMap.set(donation.scrisoareId, {
                childName: donation.scrisoare.childFirstName,
                age: donation.scrisoare.childAge,
                imageUrl: donation.scrisoare.originalImgUrl,
                status: donation.scrisoare.status,
                moderationStatus: donation.scrisoare.moderationStatus,
                totalGivenToThisChild: Number(donation.amount),
                lastDonationDate: donation.createdAt,
                slug: donation.scrisoare.slug,
                updates: donation.scrisoare.updates,
                category: donation.scrisoare.category
            })
        } else {
            existing.totalGivenToThisChild += Number(donation.amount)
            if (donation.createdAt > existing.lastDonationDate) {
                existing.lastDonationDate = donation.createdAt
            }
        }
    })

    const impactGallery = Array.from(impactByChildMap.values())
        .sort((a, b) => b.lastDonationDate.getTime() - a.lastDonationDate.getTime())

    // Determine "Badge" level
    let badge = "Susținător"
    if (totalDonated > 500) badge = "Erou Local"
    if (totalDonated > 2000) badge = "Înger Păzitor"
    if (totalDonated > 5000) badge = "Legendă"

    return {
        user,
        stats: {
            totalDonated,
            uniqueChildrenSupported,
            badge,
            donationCount: donations.length
        },
        impactGallery,
        recentDonations: donations.slice(0, 10).map(d => ({
            id: d.id,
            amount: Number(d.amount),
            date: d.createdAt,
            childName: d.scrisoare?.childFirstName || "Donație Generală",
            status: d.status,
            letterSlug: d.scrisoare?.slug || ""
        }))
    }
}
