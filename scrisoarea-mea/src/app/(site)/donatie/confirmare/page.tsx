import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

export default async function DonatieConfirmarePage({ searchParams }: { searchParams: Promise<{ session_id?: string, donationId?: string }> }) {

    // In real app, verify session with Stripe via API or DB webhook result.
    // For MVP, if we tracked via DB using session_id in Donation model.

    let donation = null
    const { session_id, donationId } = await searchParams

    if (session_id) {
        donation = await prisma.donation.findUnique({
            where: { stripeSessionId: session_id },
            include: { scrisoare: true }
        })
    } else if (donationId) {
        donation = await prisma.donation.findUnique({
            where: { id: donationId },
            include: { scrisoare: true }
        })
    }

    // If not found (maybe webhook delay), we just show generic message or assume value from params if passed safely? No, safely is DB.
    // We assume webhook handled it or we just thank them.

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Heart className="w-10 h-10 fill-rose-500" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900">Mulțumim.<br />Cadoul merge mai departe.</h1>

                {donation ? (
                    <div className="py-4">
                        <p className="text-slate-600 text-lg">
                            Donația ta de <strong>{formatCurrency(Number(donation.amount))}</strong>
                            {donation.scrisoare ? (
                                <> pentru <strong> {donation.scrisoare.childFirstName}</strong></>
                            ) : (
                                <> efectuată cu succes</>
                            )} a fost confirmată.
                        </p>
                        <p className="text-sm text-slate-400 mt-2">ID Tranzacție: {donation.id.slice(0, 8)}</p>
                    </div>
                ) : (
                    <p className="text-slate-600 text-lg">
                        Plata a fost procesată cu succes. Îți mulțumim din suflet pentru generozitate.
                    </p>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500">
                    Vei primi în curând un email cu detaliile tranzacției.
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button asChild className="w-full py-6 text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">
                        <Link href="/scrisori">Găsește o altă poveste ✨</Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href="/">Mergi acasă</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
