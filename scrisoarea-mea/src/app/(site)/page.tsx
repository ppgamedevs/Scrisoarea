import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
// import { FAQ_ITEMS } from "@/lib/constants"
import { CheckCircle2, Heart, Sparkles, TrendingUp, FileText, BarChart3, ArrowRight } from "lucide-react"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"

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
        include: { institution: true, campaign: true }
    })
}

async function getLatestUpdates() {
    return prisma.update.findMany({
        where: { isPublic: true },
        take: 5,
        orderBy: { createdAt: 'desc' }
    })
}

const FAQ_ITEMS_REFINED = [
    { q: "Ajunge cadoul la copil?", a: "Absolut! Partenerii noștri (asociații verificate) încarcă o poză sau un video când înmânează cadoul tău. Vei primi notificarea pe email." },
    { q: "Sunt datele copiilor sigure?", a: "Da. Folosim doar prenumele și nu publicăm niciodată locația exactă. Siguranța lor este prioritatea noastră zero." },
    { q: "Pot cumpăra eu cadoul?", a: "Sigur! Poți rezerva o dorință și să trimiți pachetul personal. Noi îți dăm detaliile de livrare imediat după rezervare." },
    { q: "Ce este un 'Matching'?", a: "E magie! ✨ O companie sponsor alege să dubleze donațiile. Dacă tu donezi 50 lei, ei pun încă 50 lei." },
    { q: "Pot ajuta lunar?", a: "Chiar ne-ar ajuta enorm. O sumă mică lunară ne permite să funcționăm și să acoperim urgențele." },
    { q: "Ce fac dacă am o întrebare?", a: "Scrie-ne oricând. Suntem doar doi oameni, dar răspundem cât de repede putem!" }
]

export default async function HomePage() {
    const session = await getSession()
    const stats = await getStats()
    const letters = await getFeaturedLetters()
    const updates = await getLatestUpdates()

    return (
        <main className="bg-[var(--pastel-sage)]/30">
            {/* Hero */}
            <section className="relative pt-24 pb-20 px-4 text-center border-b bg-[var(--pastel-cream)]">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pastel-lavender)] text-slate-700 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Fă o faptă bună azi</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                        Fii motivul <br />
                        <span className="text-blue-600">zâmbetului lor.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
                        Citește scrisorile copiilor către Moș Crăciun sau Iepuraș și ajută-i să primească exact ce își doresc. Simplu, direct și verificat.
                    </p>

                    {/* Trust Microcopy */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600 font-medium py-2">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Copii verificati</div>
                        <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> 100% Impact</div>
                        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Transparență totală</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button asChild size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-200 transition-all hover:scale-105">
                            <Link href="/scrisori">Găsește o dorință 🎁</Link>
                        </Button>
                        <Button asChild size="lg" variant="ghost" className="h-14 px-8 text-lg rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Link href="/cum-functioneaza">Cum funcționează?</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Metrics Strip */}
            <section className="py-10 bg-[var(--pastel-blue)]/50 border-b border-slate-100 text-center shadow-sm z-10 relative">
                <div className="container mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-slate-900">
                    <div>
                        <span className="block text-2xl sm:text-3xl font-black text-slate-800">{stats.active}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Dorințe Așteaptă</span>
                    </div>
                    <div>
                        <span className="block text-2xl sm:text-3xl font-black text-emerald-500">{stats.fulfilled}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Vise Împlinite</span>
                    </div>
                    <div>
                        <span className="block text-2xl sm:text-3xl font-black text-blue-600">{formatCurrency(stats.raised)}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Donați cu Drag</span>
                    </div>
                </div>
            </section>

            {/* Featured Letters */}
            <section className="py-24 container mx-auto px-4">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Urgențe și Povesti Noi</h2>
                    <p className="text-slate-500 text-lg">Câteva dintre scrisorile care au nevoie de ajutor chiar acum. Alege o poveste care rezonează cu tine.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {letters.map((l: any) => (
                        <div key={l.id} className="h-full">
                            <ScrisoareCard letter={l} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <Button asChild variant="outline" size="lg" className="rounded-full border-slate-300 text-slate-700 hover:border-slate-800 hover:bg-slate-50 px-8 h-12">
                        <Link href="/scrisori">Vezi toate dorințele &rarr;</Link>
                    </Button>
                </div>
            </section>

            {session?.role !== 'PARTNER' && (
                <section className="py-24 relative overflow-hidden">
                    {/* Background Blobs for depth */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--pastel-blue)] rounded-full blur-3xl mix-blend-multiply"></div>
                        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[var(--pastel-pink)] rounded-full blur-3xl mix-blend-multiply"></div>
                    </div>

                    <div className="container mx-auto px-4 max-w-4xl relative z-10">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 md:p-12 text-center">
                            <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-sm font-bold border border-rose-100 mb-6">
                                <Heart className="w-4 h-4 fill-rose-600" />
                                Devino Eroul Nostru
                            </span>

                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                                Ajută-ne să ținem <span className="text-blue-600">lumina aprinsă.</span>
                            </h2>

                            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                                Suntem o echipă mică cu vise mari. Contribuția ta lunară ne asigură continuitatea și ne ajută să găsim copiii, să verificăm poveștile și să livrăm bucurie constant, lună de lună.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                                <Button asChild variant="outline" className="h-16 text-lg font-bold border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-2xl group">
                                    <Link href="/donatie-lunara">
                                        <span className="group-hover:scale-110 transition-transform">10 Lei</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-16 text-lg font-bold border-2 border-blue-100 bg-blue-50/50 text-blue-800 hover:border-blue-600 hover:bg-blue-100 transition-all rounded-2xl scale-105 shadow-sm group">
                                    <Link href="/donatie-lunara">
                                        <span className="group-hover:scale-110 transition-transform">25 Lei</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-16 text-lg font-bold border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all rounded-2xl group">
                                    <Link href="/donatie-lunara">
                                        <span className="group-hover:scale-110 transition-transform">50 Lei</span>
                                    </Link>
                                </Button>
                            </div>

                            <div>
                                <Button asChild size="lg" className="h-14 px-10 text-lg bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all hover:-translate-y-1">
                                    <Link href="/donatie-lunara">Activează Donația Lunară</Link>
                                </Button>
                                <p className="text-xs text-slate-400 mt-4 font-medium">✨ Securizat prin Netopia • Poți anula oricând</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Trust/FAQ */}
            <section className="py-24 bg-[var(--pastel-cream)]">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 text-slate-900">Totul e simplu și curat</h2>
                        <p className="text-slate-500">Răspundem la ce contează.</p>
                    </div>

                    <div className="grid gap-6">
                        {FAQ_ITEMS_REFINED.map((item, idx) => (
                            <div key={idx} className="bg-[var(--pastel-sage)]/40 p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                <h3 className="font-bold text-lg mb-2 text-slate-900 flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">?</span> {item.q}
                                </h3>
                                <p className="text-slate-600 leading-relaxed pl-6">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
