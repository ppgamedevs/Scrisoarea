import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getStripe, isStripeConfigured } from "@/lib/stripe"
import { syncCheckoutSession } from "@/lib/donations"

export const dynamic = "force-dynamic"

export const metadata = {
    robots: { index: false, follow: false },
    title: "Donație confirmată",
}

export default async function DonatieConfirmarePage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>
}) {
    const { session_id: sessionId } = await searchParams
    let donation = null
    let paid = false

    if (sessionId && isStripeConfigured()) {
        try {
            const session = await getStripe().checkout.sessions.retrieve(sessionId)
            paid = session.payment_status === "paid"
            donation = await syncCheckoutSession(session)
        } catch (error) {
            console.error("[stripe] confirm page failed", error)
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 fill-rose-500" />
                </div>

                {paid && donation ? (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900">Mulțumim.<br />Cadoul merge mai departe.</h1>
                        <div className="py-4">
                            <p className="text-slate-600 text-lg">
                                Donația de <strong>{formatCurrency(Number(donation.amount))}</strong>
                                {donation.scrisoare ? (
                                    <> pentru <strong> {donation.scrisoare.childFirstName}</strong></>
                                ) : null}{" "}
                                a fost înregistrată.
                            </p>
                            {donation.isAnonymous ? (
                                <p className="text-sm text-slate-500 mt-3">
                                    Donația rămâne anonimă. Nu publicăm numele tău.
                                </p>
                            ) : null}
                            <p className="text-sm text-slate-400 mt-2">ID Tranzacție: {donation.id.slice(0, 8)}</p>
                        </div>
                        {donation.donorEmail.includes("@") ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500">
                                Vei primi un email cu detaliile tranzacției.
                            </div>
                        ) : null}
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900">Plata nu este confirmată încă</h1>
                        <p className="text-slate-600 text-lg">
                            Dacă ai închis pagina Stripe înainte de plată, nu s-a retras nicio sumă. Poți reveni la scrisoare și încerca din nou.
                        </p>
                    </>
                )}

                <div className="pt-4 flex flex-col gap-3">
                    <Button asChild className="w-full py-6 text-lg bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">
                        <Link href="/scrisori">Găsește o altă poveste</Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href="/">Mergi acasă</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
