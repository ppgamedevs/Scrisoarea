import { pageMetadata } from "@/lib/seo/metadata"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const campaign = await prisma.campaign.findUnique({ where: { slug } })
    if (!campaign) return { title: "Campanie inexistentă" }
    return pageMetadata({
        title: campaign.title,
        description: campaign.descriptionShort || `Campanie Visuri pe hârtie: ${campaign.title}. Donații verificate, matching posibil.`,
        path: `/campaign/${slug}`,
        keywords: [campaign.title, "campanie donații", "matching"],
    })
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const campaign = await prisma.campaign.findUnique({
        where: { slug: slug },
        include: {
            matchingRules: { include: { sponsor: true } },
            scrisori: {
                where: {
                    moderationStatus: 'approved',
                    status: { in: ['ACTIV', 'FINANTAT'] },
                },
                include: { institution: true, campaign: true }
            }
        }
    })

    if (!campaign) notFound()

    const activeRule = campaign.matchingRules.find((r: any) => r.active)

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            <section className="bg-white border-b py-20 px-6 text-center space-y-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full uppercase tracking-wider">
                        Campanie Activă
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">{campaign.title}</h1>
                    <p className="text-xl text-neutral-500 max-w-2xl mx-auto">{campaign.descriptionShort}</p>

                    {activeRule && (
                        <div className="bg-purple-50 inline-block p-4 rounded-xl border border-purple-100 text-purple-900 mx-auto mt-4">
                            <p className="font-bold flex items-center justify-center gap-2">
                                <span>⚡ Matching 1:1</span>
                                <span>•</span>
                                <span>{activeRule.sponsor.name}</span>
                            </p>
                            <p className="text-sm opacity-80 mt-1">Sponsorul dublează donațiile pentru scrisorile din această campanie.</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="container mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold mb-8">Scrisori în Campanie ({campaign.scrisori.length})</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaign.scrisori.map((letter: any) => (
                        <div key={letter.id} className="h-full">
                            <ScrisoareCard letter={letter} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
