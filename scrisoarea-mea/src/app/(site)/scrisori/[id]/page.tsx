import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import DonationModule from "@/components/donation-module"
import FulfillmentModule from "@/components/fulfillment-module"
import { Badge } from "@/components/ui/badge"
import { Metadata } from 'next'
import { generateLetterSchema, BASE_URL } from "@/lib/seo/jsonld"
import { Sparkles, PlayCircle, Heart } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const letter = await prisma.scrisoare.findFirst({
        where: { id: id.length < 20 ? undefined : id, slug: id.length < 20 ? id : undefined }
    })

    if (!letter) return { title: 'Dorință Inexistentă' }

    const percent = Math.min(100, Math.round((Number(letter.collectedAmount) / Number(letter.targetAmount)) * 100))
    const ogUrl = `${BASE_URL}/og?title=${encodeURIComponent(`Dorința lui ${letter.childFirstName}`)}&subtitle=${encodeURIComponent(letter.childStory?.substring(0, 50) || '')}&label=Ajutor&progress=${percent}`

    return {
        title: `Fii erou pentru ${letter.childFirstName} | Scrisoare`,
        description: `Citește povestea lui ${letter.childFirstName} (${letter.childAge} ani) și ajută-l să primească ${letter.category.toLowerCase()}. Gestul tău aduce bucurie pură.`,
        openGraph: {
            images: [ogUrl]
        }
    }
}

export default async function ScrisoarePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    let letter = await prisma.scrisoare.findFirst({
        where: { slug: id },
        include: {
            institution: true,
            reservations: { where: { status: 'PENDING', expiresAt: { gt: new Date() } } },
            fulfillmentClaims: {
                where: {
                    status: { in: ['PENDING', 'SHIPPED', 'COMPLETED'] },
                    expiresAt: { gt: new Date() }
                }
            },
            campaign: { include: { matchingRules: { include: { sponsor: true } } } },
            proofs: true
        }
    })

    if (!letter) {
        letter = await prisma.scrisoare.findFirst({
            where: { id },
            include: {
                institution: true,
                reservations: { where: { status: 'PENDING', expiresAt: { gt: new Date() } } },
                fulfillmentClaims: {
                    where: {
                        status: { in: ['PENDING', 'SHIPPED', 'COMPLETED'] },
                        expiresAt: { gt: new Date() }
                    }
                },
                campaign: { include: { matchingRules: { include: { sponsor: true } } } },
                proofs: true
            }
        })
    }

    if (!letter) notFound()

    const jsonLd = generateLetterSchema(letter)

    // Matching Logic (View Only)
    const now = new Date()
    const activeRule = letter.campaign?.matchingRules.find((r: any) =>
        r.active &&
        r.startsAt <= now &&
        (!r.endsAt || r.endsAt >= now) &&
        Number(r.currentMatchTotal) < Number(r.maxMatchTotal)
    )

    // Calc Logic
    const paid = Number(letter.collectedAmount)
    const reserved = letter.reservations.reduce((acc: number, r: any) => acc + Number(r.amount), 0)
    const target = Number(letter.targetAmount)

    const activeClaim = letter.fulfillmentClaims[0] || null

    const totalOccupied = paid + reserved
    const remaining = Math.max(0, target - totalOccupied)
    const percentage = Math.min(100, Math.round((totalOccupied / target) * 100))
    const isFullyFunded = totalOccupied >= target || letter.status === 'FINANTAT' || letter.status === 'INCHIS'
    const isDonationDisabled = ['IN_ACHIZITIE', 'LIVRAT', 'FINALIZAT', 'ANULAT', 'RESPINS', 'INCHIS'].includes(letter.status)
    const isVideo = letter.mediaType === 'VIDEO' // Assuming schema update propagated

    return (
        <main className="min-h-screen bg-slate-50 pb-20 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header Status Bar */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <Link href="/scrisori" className="group text-sm text-slate-500 hover:text-blue-600 mb-6 inline-flex items-center gap-1 transition-colors">
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Înapoi la toate dorințele
                </Link>

                <div className="mb-10 pb-8 border-b border-slate-200">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">{letter.category}</Badge>
                        {letter.status === 'FINANTAT' && <Badge className="bg-emerald-100 text-emerald-800 border-none flex gap-1 items-center"><Sparkles className="w-3 h-3" /> Finanțat</Badge>}
                        {letter.status === 'INCHIS' && <Badge className="bg-emerald-100 text-emerald-800 border-none">Livrat cu succes</Badge>}
                        {activeClaim && <Badge className="bg-amber-100 text-amber-800 border-none">În curs de îndeplinire</Badge>}
                        {activeRule && <Badge className="bg-purple-100 text-purple-800 border-none">⚡ Matching 1:1 Activ</Badge>}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        Dorința lui {letter.childFirstName}, <span className="text-slate-400 font-light">{letter.childAge} ani</span>
                    </h1>

                    <div className="flex items-center gap-2 text-slate-500 text-lg">
                        <span>adusă de</span>
                        <Link href={`/partener/${letter.institution.slug}`} className="font-medium text-blue-600 hover:underline decoration-blue-200 underline-offset-4">
                            {letter.institution.publicName || letter.institution.name}
                        </Link>
                        {letter.institution.verified && (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-[10px]" title="Verificat">✓</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column (Media & Story) */}
                    <div className="lg:col-span-7 space-y-10">
                        <section className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {isVideo ? (
                                <div className="aspect-[16/9] relative w-full bg-black rounded-xl overflow-hidden group">
                                    <video
                                        src={letter.originalImgUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                        poster={letter.originalImgUrl.replace('.mp4', '_thumb.jpg')} // basic fallback Assumption
                                    />
                                </div>
                            ) : (
                                <div className="aspect-[4/3] relative w-full flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden">
                                    <img src={letter.originalImgUrl} alt={`Scrisorica lui ${letter.childFirstName}`} className="w-full h-full object-contain" />
                                </div>
                            )}
                        </section>

                        <section className="prose prose-lg prose-slate max-w-none">
                            <h3 className="font-bold text-2xl text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-3xl">📖</span> Povestea lui {letter.childFirstName}
                            </h3>
                            <div className="bg-white p-8 rounded-2xl border border-blue-50/50 shadow-sm relative">
                                <span className="absolute top-4 left-4 text-6xl text-blue-100 font-serif leading-none select-none">“</span>
                                <p className="text-slate-700 italic relative z-10 leading-loose">
                                    {letter.childStory || "Povestea nu a fost încă transcrisă, dar nevoia este reală și verificată."}
                                </p>
                                <span className="absolute bottom-4 right-4 text-6xl text-blue-100 font-serif leading-none select-none rotate-180">“</span>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                                <span className="text-2xl">🎁</span> Ce își dorește
                            </h3>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-lg font-medium text-slate-900">{letter.wishList}</p>
                                        <p className="text-sm text-slate-500 mt-1">Estimare costuri necesare achiziției și livrării.</p>
                                    </div>
                                    <div className="text-right shrink-0 bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
                                        <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Valoare Necesară</div>
                                        <div className="text-2xl font-black text-slate-900">{formatCurrency(Number(letter.targetAmount))}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-blue-50 text-blue-900 p-6 rounded-2xl text-sm flex gap-4 items-start border border-blue-100">
                            <div className="p-2 bg-white rounded-full shadow-sm">🛡</div>
                            <div>
                                <strong className="block text-base mb-1">Impact Garantat</strong>
                                Noi nu facilităm contactul direct pentru a proteja copiii. Dar îți promitem transparență totală: vei vedea dovada foto/video a bucuriei create, încărcată de partenerul nostru acreditat.
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Action) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-4xl font-black text-slate-900">{formatCurrency(totalOccupied)}</span>
                                        <span className="text-sm font-medium text-slate-500 block mt-1">strânși din {formatCurrency(target)}</span>
                                    </div>
                                    {percentage >= 100 ? (
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                    ) : (
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
                                        </div>
                                    )}
                                </div>
                                <Progress value={percentage} className="h-3 mb-6 bg-slate-100" indicatorClassName={percentage >= 100 ? "bg-emerald-500" : "bg-blue-600"} />

                                {activeRule && (
                                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-6 text-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <Sparkles className="w-12 h-12 text-purple-900" />
                                        </div>
                                        <div className="font-bold text-purple-900 mb-1 flex items-center gap-2 relative z-10">
                                            <span>⚡ Matching Activ</span>
                                        </div>
                                        <p className="text-purple-800 relative z-10 leading-relaxed">
                                            Super-puterea ta e dublată! Pentru fiecare leu donat, <strong>{activeRule.sponsor.name}</strong> mai pune încă unul.
                                        </p>
                                    </div>
                                )}

                                {!isDonationDisabled && !isFullyFunded && (
                                    <div className="mb-6 pb-6 border-b border-slate-100">
                                        <FulfillmentModule
                                            scrisoareId={letter.id}
                                            activeClaim={activeClaim}
                                        />
                                    </div>
                                )}

                                {activeClaim ? (
                                    <div className="text-center text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <p className="font-medium">O familie minunată pregătește acest pachet.</p>
                                        <p className="opacity-80 mt-1">Donațiile sunt oprite temporar.</p>
                                    </div>
                                ) : (
                                    <>
                                        {isDonationDisabled ? (
                                            <div className="bg-slate-50 p-8 rounded-xl text-center text-slate-500 border border-slate-200">
                                                <Heart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                <p>Această dorință a fost îndeplinită sau închisă.</p>
                                            </div>
                                        ) : (
                                            <DonationModule
                                                scrisoareId={letter.id}
                                                remainingAmount={remaining}
                                                isFullyFunded={isFullyFunded}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            <p className="text-center text-xs text-slate-400 max-w-xs mx-auto">
                                Donațiile sunt procesate securizat. Nu percepem comisioane ascunse.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
