import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency, calculateAgeBucket } from "@/lib/utils"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import DonationModule from "@/components/donation-module"
import FulfillmentModule from "@/components/fulfillment-module"
import { Badge } from "@/components/ui/badge"

export default async function ScrisoareDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: slugOrId } = await params

    const letter = await prisma.scrisoare.findFirst({
        where: {
            OR: [
                { id: slugOrId },
                { slug: slugOrId }
            ]
        },
        include: {
            institution: true,
            reservations: { where: { status: 'PENDING', expiresAt: { gt: new Date() } } },
            fulfillmentClaims: {
                where: {
                    status: { in: ['PENDING', 'SHIPPED', 'COMPLETED'] },
                    expiresAt: { gt: new Date() }
                }
            },
            campaign: {
                include: {
                    matchingRules: {
                        include: { sponsor: true }
                    }
                }
            }
        }
    })

    if (!letter) notFound()

    // Matching Logic (View Only)
    const now = new Date()
    const activeRule = letter.campaign?.matchingRules.find(r =>
        r.active &&
        r.startsAt <= now &&
        (!r.endsAt || r.endsAt >= now) &&
        Number(r.currentMatchTotal) < Number(r.maxMatchTotal)
    )

    // Calc Logic
    const paid = Number(letter.collectedAmount)
    const reserved = letter.reservations.reduce((acc, r) => acc + Number(r.amount), 0)
    const target = Number(letter.targetAmount)

    const activeClaim = letter.fulfillmentClaims[0] || null

    const totalOccupied = paid + reserved
    const remaining = Math.max(0, target - totalOccupied)
    const percentage = Math.min(100, Math.round((totalOccupied / target) * 100))
    const isFullyFunded = totalOccupied >= target || letter.status === 'FINANTAT' || letter.status === 'INCHIS'
    const isDonationDisabled = ['IN_ACHIZITIE', 'LIVRAT', 'FINALIZAT', 'ANULAT', 'RESPINS', 'INCHIS'].includes(letter.status)

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
                <Link href="/scrisori" className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 inline-block">
                    &larr; Înapoi la listă
                </Link>

                <div className="mb-8 border-b pb-8">
                    <div className="flex gap-2 mb-4">
                        <Badge variant="outline" className="text-neutral-500">{letter.category}</Badge>
                        {letter.status === 'FINANTAT' && <Badge className="bg-green-100 text-green-800 border-none">Finanțat</Badge>}
                        {letter.status === 'INCHIS' && <Badge className="bg-emerald-100 text-emerald-800 border-none">Închis</Badge>}
                        {activeClaim && <Badge className="bg-amber-100 text-amber-800 border-none">În curs de îndeplinire</Badge>}
                        {activeRule && <Badge className="bg-purple-100 text-purple-800 border-none">Matching 1:1 Activ</Badge>}
                    </div>
                    <h1 className="text-4xl font-light text-neutral-900 mb-2">
                        {letter.childFirstName}, {calculateAgeBucket(letter.childAge)} ani
                    </h1>
// ... (rest of file content implied, only replaced Header and Logic)
                    // ... but replace_file_content needs contiguous block.

                    // I will try to target the exact block from finding `const letter` to `return (`.

                    // WAIT. I need to insert the Matching Info Box in the RIGHT COLUMN.
                    // So I should replace the Right Column rendering part too.

                    // Let's replace the whole component body for safety to inject data correctly.
                    // But that's large.

                    // Let's do 2 edits.
                    // 1. Fetch logic + Badge.
                    // 2. Right column info box.

                    // EDIT 1: Fetch + Badge.

                    <p className="text-xl text-neutral-500">
                        {letter.institution.county} • Centru Partener Verificat
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div className="aspect-[3/4] relative w-full flex items-center justify-center bg-white shadow-sm overflow-hidden rounded-lg">
                                {letter.originalImgUrl.includes('placehold') ? (
                                    <div className="text-neutral-300 text-center p-10">
                                        <span className="block text-4xl mb-2">✉</span>
                                        Imagine Scrisoare
                                    </div>
                                ) : (
                                    <img src={letter.originalImgUrl} alt="Scrisoare" className="object-contain w-full h-full" />
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-medium text-neutral-900 mb-4 border-l-4 border-blue-500 pl-3">
                                Lista de dorințe
                            </h3>
                            <div className="bg-white border rounded-lg overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                                        <tr>
                                            <th className="p-4 font-medium">Obiect</th>
                                            <th className="p-4 font-medium text-right">Valoare est.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="p-4 text-neutral-800">{letter.wishList}</td>
                                            <td className="p-4 text-right text-neutral-600">{formatCurrency(Number(letter.targetAmount))}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-neutral-50 font-medium">
                                        <tr>
                                            <td className="p-4">Total Necesar</td>
                                            <td className="p-4 text-right">{formatCurrency(Number(letter.targetAmount))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </section>

                        <section className="prose prose-neutral max-w-none">
                            <h3 className="text-lg font-medium">Povestea (Transcrisă)</h3>
                            <p className="text-neutral-600 italic">
                                "{letter.childStory || "Text indisponibil."}"
                            </p>
                        </section>

                        <div className="bg-blue-50 text-blue-800 p-6 rounded-lg text-sm flex gap-4 items-start">
                            <div className="text-2xl">🛡</div>
                            <div>
                                <strong>Siguranță garantată:</strong> Nu facilităm contactul direct. Identitatea donatorilor este protejată.
                                Dovada livrării va fi încărcată anonimizat după achiziție.
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-white p-6 border rounded-xl shadow-sm">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-2xl font-bold">{formatCurrency(totalOccupied)}</span>
                                    <span className="text-sm text-neutral-500 mb-1">din {formatCurrency(target)}</span>
                                </div>
                                <Progress value={percentage} className="h-2 mb-2" />
                                <div className="flex justify-between text-xs text-neutral-400">
                                    <span>{percentage}% acoperit</span>
                                </div>
                            </div>

                            {activeRule && (
                                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mb-4 text-sm">
                                    <div className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                                        <span>⚡ Matching Activ</span>
                                    </div>
                                    <p className="text-purple-800">
                                        Orice donație este dublată de <strong>{activeRule.sponsor.name}</strong> în limita bugetului disponibil.
                                    </p>
                                </div>
                            )}

                            {!isDonationDisabled && !isFullyFunded && (
                                <FulfillmentModule
                                    scrisoareId={letter.id}
                                    activeClaim={activeClaim}
                                />
                            )}

                            {activeClaim ? (
                                <div className="text-center text-sm text-neutral-500 bg-neutral-50 p-4 rounded">
                                    <p>Opțiunea de donație în bani este dezactivată deoarece există o cerere de îndeplinire în curs.</p>
                                </div>
                            ) : (
                                <>
                                    {isDonationDisabled ? (
                                        <div className="bg-neutral-100 p-8 rounded-xl text-center text-neutral-500">
                                            Această cerere nu mai acceptă donații (Status: {letter.status}).
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
                    </div>
                </div>
            </div>
        </main>
    )
}
