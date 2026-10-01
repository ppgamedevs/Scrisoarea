import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { getStripe, isStripeConfigured } from "@/lib/stripe"
import { syncMonthlyCheckout } from "@/lib/monthly-subscription"
import { openMonthlyPortal } from "@/app/actions/subscribe"

export const dynamic = "force-dynamic"

export const metadata = {
    robots: { index: false, follow: false },
    title: "Donație lunară activă",
}

export default async function DonatieLunaraConfirmarePage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>
}) {
    const { session_id: sessionId } = await searchParams
    let active = false
    let amount = 0
    let email = ""

    if (sessionId && isStripeConfigured()) {
        try {
            const session = await getStripe().checkout.sessions.retrieve(sessionId)
            const saved = await syncMonthlyCheckout(session)
            active = saved?.status === "ACTIVE"
            amount = Number(saved?.amount || 0)
            email = saved?.donorEmail || ""
        } catch (error) {
            console.error("[stripe] monthly confirm failed", error)
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-10 h-10 fill-rose-500" />
                </div>
                {active ? (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900">Abonamentul lunar este activ.</h1>
                        <p className="text-slate-600 text-lg">
                            {formatCurrency(amount)} se reînnoiesc în fiecare lună și susțin funcționarea platformei, nu o scrisoare anume.
                        </p>
                        {email.includes("@") ? (
                            <p className="text-sm text-slate-500">Confirmarea ajunge la {email}. Nu publicăm numele tău.</p>
                        ) : (
                            <p className="text-sm text-slate-500">Nu publicăm numele tău.</p>
                        )}
                        {sessionId ? (
                            <form action={openMonthlyPortal}>
                                <input type="hidden" name="sessionId" value={sessionId} />
                                <Button type="submit" variant="outline" className="rounded-full">
                                    Gestionează sau oprește abonamentul
                                </Button>
                            </form>
                        ) : null}
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900">Abonamentul nu este confirmat încă</h1>
                        <p className="text-slate-600 text-lg">
                            Dacă ai închis pagina Stripe înainte de plată, nu s-a activat nicio contribuție lunară.
                        </p>
                    </>
                )}
                <div className="pt-2 flex flex-col gap-3">
                    <Button asChild className="w-full py-6 text-lg bg-slate-900 hover:bg-slate-800 text-white">
                        <Link href="/scrisori">Vezi dorințele copiilor</Link>
                    </Button>
                    <Button asChild variant="ghost">
                        <Link href="/">Mergi acasă</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
