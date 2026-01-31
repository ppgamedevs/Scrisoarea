import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

async function seedCampaigns() {
    console.log("Seeding Campaigns & Matching...")

    // 1. Create Sponsor
    const sponsor = await prisma.sponsor.create({
        data: {
            name: "Fundația Dedeman",
            website: "https://dedeman.ro",
            logoUrl: "https://placehold.co/200x100?text=Dedeman"
        }
    })

    // 2. Create Campaign
    const campaign = await prisma.campaign.create({
        data: {
            slug: "bucuria-craciunului-2025",
            title: "Bucuria Crăciunului 2025",
            descriptionShort: "Dublăm bucuria pentru copiii din centrele partenere.",
            startsAt: new Date(),
            status: "ACTIVE"
        }
    })

    // 3. Create Matching Rule (1:1 up to 10k RON total, max 500 per tx)
    await prisma.matchingRule.create({
        data: {
            sponsorId: sponsor.id,
            campaignId: campaign.id,
            matchType: "PERCENT_100",
            maxMatchTotal: 10000,
            maxMatchPerDonation: 500,
            active: true,
            startsAt: new Date()
        }
    })

    // 4. Assign some letters to Campaign
    // Find first 3 letters
    const letters = await prisma.scrisoare.findMany({ take: 3 })
    for (const l of letters) {
        await prisma.scrisoare.update({
            where: { id: l.id },
            data: { campaignId: campaign.id }
        })
    }

    console.log("Seeding Campaigns Done.")
}

seedCampaigns()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
