import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, calculateAgeBucket } from "@/lib/utils"

export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const campaign = await prisma.campaign.findUnique({
        where: { slug: slug },
        include: {
            matchingRules: { include: { sponsor: true } },
            scrisori: {
                where: { status: { in: ['NOU', 'ACTIV', 'FINANTAT'] } }, // Show these public statuses
                include: { institution: true }
            }
        }
    })

    if (!campaign) notFound()

    const activeRule = campaign.matchingRules.find(r => r.active)

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
                    {campaign.scrisori.map(letter => (
                        <div key={letter.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 bg-neutral-100 relative">
                                <img src={letter.originalImgUrl} className="w-full h-full object-cover opacity-90" alt="Cover" />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/90 text-black hover:bg-white">{letter.category}</Badge>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold">{letter.childFirstName}, {calculateAgeBucket(letter.childAge)} ani</h3>
                                    <p className="text-sm text-neutral-500">{letter.institution.county}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                                    <span className="font-mono font-bold text-lg">{formatCurrency(Number(letter.targetAmount))}</span>
                                    <Button asChild size="sm">
                                        <Link href={`/scrisori/${letter.slug || letter.id}`}>Vezi Povestea</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
