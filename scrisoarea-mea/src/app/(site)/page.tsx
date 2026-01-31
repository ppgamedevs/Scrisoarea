import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, calculateAgeBucket } from "@/lib/utils"
import { FAQ_ITEMS } from "@/lib/constants"
import { CheckCircle2, Shield, HeartHandshake, Eye } from "lucide-react"

async function getStats() {
    const activeLetters = await prisma.scrisoare.count({ where: { status: 'ACTIV' } })
    const fulfilledLetters = await prisma.scrisoare.count({ where: { status: 'INCHIS' } })
    const donations = await prisma.donation.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } })
    return {
        active: activeLetters,
        fulfilled: fulfilledLetters,
        raised: Number(donations._sum.amount || 0)
    }
}

async function getFeaturedLetters() {
    return prisma.scrisoare.findMany({
        where: { status: 'ACTIV' },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { institution: true }
    })
}

async function getFeaturedImpact() {
    return prisma.scrisoare.findMany({
        where: {
            status: 'INCHIS',
            proofApproved: true
        },
        take: 3,
        include: {
            proofs: { where: { moderationStatus: 'APPROVED' }, take: 1 },
            institution: true
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export default async function HomePage() {
    const stats = await getStats()
    const letters = await getFeaturedLetters()
    const impactStories = await getFeaturedImpact()

    return (
        <main className="bg-white">
            {/* Hero */}
            <section className="relative pt-24 pb-20 px-4 text-center border-b">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                        Transformă o scrisoare <br />
                        <span className="text-slate-400">în realitate.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Platforma transparentă unde dorințele copiilor din medii vulnerabile sunt verificate, finanțate și dovedite îndeplinite.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button asChild size="lg" className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                            <Link href="/scrisori">Vezi Scrisorile</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base rounded-full">
                            <Link href="/cum-functioneaza">Cum funcționează</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <section className="py-12 border-b bg-slate-50/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center divide-x divide-slate-200">
                        <div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.active}</div>
                            <div className="text-xs uppercase tracking-widest text-slate-500 font-medium">Scrisori Active</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.fulfilled}</div>
                            <div className="text-xs uppercase tracking-widest text-slate-500 font-medium">Dorințe Îndeplinite</div>
                        </div>
                        <div className="col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{formatCurrency(stats.raised)}</div>
                            <div className="text-xs uppercase tracking-widest text-slate-500 font-medium">Suma Direcționată</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="py-24 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Un proces construit pe încredere</h2>
                        <p className="text-slate-500">Eliminăm intermediarii și incertitudinea din procesul de donație.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg">1. Verificare Riguroasă</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Instituțiile partenere sunt verificate juridic. Fiecare scrisoare este validată de asistenți sociali înainte de a ajunge pe site.
                            </p>
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg">2. Contribuție Transparentă</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Finanțezi exact obiectele cerute. Nu există comisioane ascunse. Vezi în timp real progresul fiecărei scrisori.
                            </p>
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg">3. Dovada Livrării</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Ciclul se închide doar când partenerul încarcă dovada foto/video a predării cadoului, vizibilă în secțiunea Impact.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Letters */}
            <section className="py-24 bg-slate-50 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Scrisori recente</h2>
                            <p className="text-slate-500">Ajută astăzi la îndeplinirea unei dorințe.</p>
                        </div>
                        <Link href="/scrisori" className="text-sm font-medium hover:underline text-slate-900 hidden sm:block">Vezi toate &rarr;</Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {letters.map(l => (
                            <Link href={`/scrisori/${l.slug || l.id}`} key={l.id} className="group block h-full">
                                <article className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                                    <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                                        <img src={l.originalImgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pt-12">
                                            <p className="text-white font-bold text-lg">{l.childFirstName}, {calculateAgeBucket(l.childAge)} ani</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <Badge variant="outline" className="mb-2">{l.category}</Badge>
                                            <p className="text-slate-600 text-sm line-clamp-2">{l.childStory || "O poveste specială..."}</p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm">
                                            <span className="text-slate-500">{l.institution.county}</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(Number(l.targetAmount))}</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-8 text-center sm:hidden">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/scrisori">Vezi toate scrisorile</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Impact Preview */}
            {impactStories.length > 0 && (
                <section className="py-24 bg-white border-b">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Momente de fericire</h2>
                            <p className="text-slate-500">Dovezi recente ale impactului comunității.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {impactStories.map(l => {
                                const proof = l.proofs[0]
                                if (!proof) return null
                                return (
                                    <Link key={l.id} href={`/impact/${l.id}`} className="group">
                                        <div className="aspect-video bg-neutral-900 rounded-xl overflow-hidden relative">
                                            {proof.type === 'VIDEO' ? (
                                                <div className="w-full h-full flex items-center justify-center text-white text-4xl group-hover:scale-110 transition-transform">▶</div>
                                            ) : (
                                                <img src={proof.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Proof" />
                                            )}
                                            <div className="absolute bottom-4 left-4 text-white font-bold">{l.childFirstName}</div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="text-center mt-12">
                            <Button asChild variant="outline" className="rounded-full">
                                <Link href="/impact">Vezi galeria de impact</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* FAQ */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold mb-12 text-center">Întrebări Frecvente</h2>
                    <div className="space-y-6">
                        {FAQ_ITEMS.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-lg border shadow-sm">
                                <h3 className="font-bold text-lg mb-2 text-slate-900">{item.q}</h3>
                                <p className="text-slate-600">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold">Vrei să ajuți concret?</h2>
                    <p className="text-slate-300 text-lg">
                        Mii de dorințe așteaptă să devină realitate. Alege o scrisoare și schimbă o viață astăzi.
                    </p>
                    <Button asChild size="lg" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold">
                        <Link href="/scrisori">Găsește o Scrisoare</Link>
                    </Button>
                </div>
            </section>
        </main>
    )
}
