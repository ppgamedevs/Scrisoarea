import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency, calculateAgeBucket } from "@/lib/utils"
// import { FAQ_ITEMS } from "@/lib/constants" // Defined in Step 861, reusing logic but customizing list for prompt
// Actually, let's redefine specific FAQs for this refined request inside the component to be precise.
import { CheckCircle2, Shield, Eye, TrendingUp, FileText, BarChart3, ArrowRight } from "lucide-react"

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
        where: { status: 'ACTIV' }, // 'ACTIV' means verified and ready for funding in our logic
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
    { q: "Cum știu că ajunge?", a: "Fiecare cerere închisă trebuie să aibă o dovadă foto/video a predării încărcată de instituția parteneră și verificată de noi." },
    { q: "De ce nu apar detalii despre copii?", a: "Protejăm identitatea beneficiarilor. Folosim prenume sau pseudonime și nu publicăm niciodată adrese exacte sau imagini sensibile." },
    { q: "Cum funcționează îndeplinirea personală?", a: "Puteți rezerva o scrisoare și trimite pachetul fizic la sediul asociației partenere. Detaliile de livrare se primesc după rezervare." },
    { q: "Ce înseamnă matching?", a: "Un sponsor corporate dublează donațiile individuale pentru anumite campanii, mărind impactul fiecărui leu donat." },
    { q: "Pot dona lunar?", a: "Da. Puteți activa o contribuție recurentă care susține costurile operaționale ale platformei și fondul de urgență." },
    { q: "Ce se întâmplă dacă o cerere este rezervată?", a: "Ea devine indisponibilă altor donatori timp de 5 zile. Dacă pachetul nu este confirmat expediat, revine în lista publică." },
    { q: "Cum verificați instituțiile?", a: "Solicităm CUI, statut și istoric. Validăm persoanele de contact și monitorizăm constant rata de succes a livrărilor." },
    { q: "Cum pot deveni partener?", a: "Accesând secțiunea Contact sau Parteneri din meniu și completând formularul de acreditare." }
]

export default async function HomePage() {
    const stats = await getStats()
    const letters = await getFeaturedLetters()
    const updates = await getLatestUpdates()

    return (
        <main className="bg-white">
            {/* Hero */}
            <section className="relative pt-24 pb-20 px-4 text-center border-b">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                        Dorințe concrete. <br />
                        <span className="text-slate-400">Proces verificabil.</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Un sistem unde donațiile sunt transparente, scrisorile sunt reale, iar dovezile îndeplinirii sunt garantate.
                    </p>

                    {/* Trust Microcopy */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600 font-medium py-2">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Scrisori verificate</div>
                        <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" /> Progres vizibil</div>
                        <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600" /> Dovada livrării</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                        <Button asChild size="lg" className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                            <Link href="/scrisori">Vezi Scrisorile</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base rounded-full">
                            <Link href="/cum-functioneaza">Cum funcționează</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Metrics Strip */}
            <section className="py-8 bg-slate-50 border-b text-center">
                <div className="container mx-auto grid grid-cols-3 gap-8 text-slate-900">
                    <div>
                        <span className="block text-2xl font-bold">{stats.active}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500">Scrisori Active</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-emerald-600">{stats.fulfilled}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500">Dorințe Îndeplinite</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-blue-600">{formatCurrency(stats.raised)}</span>
                        <span className="text-xs uppercase tracking-wider text-slate-500">Direcționat</span>
                    </div>
                </div>
            </section>

            {/* Highlights Cards */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <Link href="/scrisori" className="group">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-all h-full">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Cazuri Individuale</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Explorează scrisorile copiilor. Fiecare caz are propriul progres financiar și necesar logistic.</p>
                        </div>
                    </Link>

                    <Link href="/update-uri" className="group">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-all h-full">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Progres & Update-uri</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Urmărește fluxul live al acțiunilor: finanțări, livrări și dovezi încărcate de parteneri.</p>
                        </div>
                    </Link>

                    <Link href="/transparenta" className="group">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-all h-full">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Transparență Totală</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">Accesează registrul public de tranzacții și rapoartele de activitate ale platformei.</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Recent Updates Feed (Mini) */}
            {updates.length > 0 && (
                <section className="py-16 bg-slate-50 border-y">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold">Activitate Recentă</h2>
                            <Link href="/update-uri" className="text-sm font-medium hover:underline text-blue-600">Vezi tot fluxul &rarr;</Link>
                        </div>
                        <div className="grid md:grid-cols-1 gap-4 max-w-3xl mx-auto">
                            {updates.map(u => (
                                <div key={u.id} className="bg-white p-4 rounded-lg border shadow-sm flex gap-4 items-start">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${u.type === 'PROOF' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{u.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{u.body}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">{u.createdAt.toLocaleDateString()} • {u.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}


            {/* Featured Letters with Better Cards */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Urgențe și Cazuri Noi</h2>
                        <p className="text-slate-500">Scrisori care au nevoie de ajutor acum.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {letters.map(l => {
                            const percent = Math.min(100, Math.round((Number(l.collectedAmount) / Number(l.targetAmount)) * 100))
                            return (
                                <Link href={`/scrisori/${l.slug || l.id}`} key={l.id} className="group block h-full">
                                    <article className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all h-full flex flex-col relative">
                                        <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                                            <img src={l.originalImgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                                            {l.campaign && (
                                                <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                                                    Matching Activ
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg">{l.childFirstName}, {calculateAgeBucket(l.childAge)} ani</h3>
                                                    <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{l.category}</span>
                                                </div>
                                                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{l.childStory || "Povestea copilului..."}</p>

                                                {/* Progress Bar */}
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                                                    <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <div className="flex justify-between text-xs font-medium text-slate-500">
                                                    <span>{formatCurrency(Number(l.collectedAmount))}</span>
                                                    <span>din {formatCurrency(Number(l.targetAmount))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            )
                        })}
                    </div>

                    <div className="text-center mt-12">
                        <Button asChild variant="outline" size="lg" className="rounded-full">
                            <Link href="/scrisori">Vezi toate cazurile</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Recurring Donation Block (Placeholder) */}
            <section className="py-20 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl space-y-8">
                    <span className="inline-block bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                        Sustine Platforma
                    </span>
                    <h2 className="text-3xl font-bold">Devino donator recurent</h2>
                    <p className="text-slate-300">
                        Contribuția ta lunară asigură continuitatea platformei și acoperă cazurile urgente care nu sunt finanțate la timp.
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-white h-12">10 Lei/lună</Button>
                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-white h-12 bg-slate-800">25 Lei/lună</Button>
                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-white h-12">50 Lei/lună</Button>
                    </div>

                    <Button size="lg" className="h-14 px-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-lg shadow-emerald-900/20">
                        Activează Donația
                    </Button>
                    <p className="text-xs text-slate-500">Serviciu securizat prin Stripe. Poți anula oricând.</p>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold mb-12 text-center">Întrebări Frecvente</h2>
                    <div className="space-y-4">
                        {FAQ_ITEMS_REFINED.map((item, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="font-bold text-lg mb-2 text-slate-900">{item.q}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
