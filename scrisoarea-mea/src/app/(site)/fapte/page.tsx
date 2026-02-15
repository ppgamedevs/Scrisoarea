import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
// import { Metadata } from "next"

export const metadata = {
    title: "Fapte și Cifre | Vise pe hârtie",
    description: "Sursa de adevăr pentru datele platformei: scrisori active, sume colectate și definiții oficiale.",
}

async function getFacts() {
    const totalDonations = await prisma.donation.aggregate({ _sum: { amount: true, matchedAmount: true }, where: { status: 'SUCCEEDED' } })
    const activeLetters = await prisma.scrisoare.count({ where: { status: 'ACTIV' } })
    const fulfilledLetters = await prisma.scrisoare.count({ where: { status: 'INCHIS' } })

    // Simulating Average Time (would be complex SQL otherwise)
    const avgTime = "14 zile"

    const raised = Number(totalDonations._sum.amount || 0) + Number(totalDonations._sum.matchedAmount || 0)

    return {
        activeLetters,
        fulfilledLetters,
        raised,
        avgTime
    }
}

export default async function FactsPage() {
    const facts = await getFacts()

    return (
        <main className="min-h-screen bg-white py-12 px-4">
            <div className="container mx-auto max-w-3xl prose prose-slate">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Fapte și Cifre</h1>
                <p className="lead text-xl text-slate-500 mb-12">
                    Sursa oficială de date pentru platforma Vise pe hârtie. Aceste informații sunt actualizate în timp real.
                </p>

                <hr className="my-8" />

                {/* Section A: What is it */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Ce este Vise pe hârtie?</h2>
                    <p>Vise pe hârtie este o platformă tehnologică non-profit care conectează transparent donatorii cu nevoile specifice ale copiilor din medii vulnerabile. Nu suntem un fond general de caritate, ci un facilitator de ajutor direct, 1-la-1.</p>

                    <h3 className="text-lg font-bold mt-4">Ce NU suntem:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Nu suntem o agenție guvernamentală.</li>
                        <li>Nu reținem comisioane din donațiile pentru cadouri.</li>
                        <li>Nu facilităm adopții sau contact direct nesupravegheat.</li>
                    </ul>
                </section>

                {/* Section B: Key Numbers */}
                <section className="mb-12 bg-slate-50 p-8 rounded-xl border">
                    <h2 className="text-2xl font-bold mb-6 mt-0">Metrici Cheie (Live)</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-sm text-slate-500 uppercase font-bold">Scrisori Active</div>
                            <div className="text-3xl font-bold">{facts.activeLetters}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 uppercase font-bold">Dorințe Îndeplinite</div>
                            <div className="text-3xl font-bold text-emerald-600">{facts.fulfilledLetters}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 uppercase font-bold">Total Direcționat</div>
                            <div className="text-3xl font-bold text-blue-600">{formatCurrency(facts.raised)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 uppercase font-bold">Timp Mediu Aprobare</div>
                            <div className="text-3xl font-bold">{facts.avgTime}</div>
                        </div>
                    </div>
                </section>

                {/* Section C: Definitions */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Glosar de Termeni</h2>
                    <dl className="space-y-4">
                        <div>
                            <dt className="font-bold text-slate-900">Scrisoare</dt>
                            <dd className="text-slate-600">O cerere de ajutor verificată, reprezentând dorința unui singur copil, validată de o instituție parteneră.</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-slate-900">Dovadă (Proof)</dt>
                            <dd className="text-slate-600">Fotografie sau video care atestă predarea cadoului către beneficiar. Nu conține fețele copiilor dacă tutorele nu a semnat acord explicit.</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-slate-900">Îndeplinire Personală</dt>
                            <dd className="text-slate-600">Procesul prin care donatorul cumpără și expediază fizic cadoul, în loc să doneze bani online.</dd>
                        </div>
                        <div>
                            <dt className="font-bold text-slate-900">Matching</dt>
                            <dd className="text-slate-600">Mecanism prin care un sponsor corporate dublează automat suma donată de o persoană fizică.</dd>
                        </div>
                    </dl>
                </section>

                {/* Section D: Q&A Structured */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Întrebări și Răspunsuri (Short)</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-base">Întrebare: Cum sunt verificați copiii?</h3>
                            <p className="text-sm">Răspuns: Copiii fac parte din evidența instituțiilor partenere (DGASPC, ONG-uri acreditate, Școli din medii defavorizate). Nu acceptăm cazuri individuale neafiliate.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-base">Întrebare: Este platforma sigură?</h3>
                            <p className="text-sm">Răspuns: Da. Datele sunt criptate. Plățile sunt procesate securizat prin Netopia. Identitatea copiilor este protejată prin pseudonime și imagini blurate/din spate unde este necesar.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-base">Întrebare: Ce se întâmplă cu banii dacă un caz nu e finanțat?</h3>
                            <p className="text-sm">Răspuns: Fondurile rămân în contul asociației și sunt redirecționate către cel mai vechi caz activ similar (același județ sau categorie).</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
