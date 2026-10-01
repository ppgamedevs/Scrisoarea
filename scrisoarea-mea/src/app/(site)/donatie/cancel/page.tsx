import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { abandonCheckout } from "@/lib/donations"
import { isStripeConfigured } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export const metadata = {
    robots: { index: false, follow: false },
    title: "Plată anulată",
}

export default async function CancelPage({
    searchParams,
}: {
    searchParams: Promise<{ reservationId?: string; donationId?: string }>
}) {
    const { reservationId, donationId } = await searchParams

    if (reservationId) {
        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: "CANCELLED" },
        }).catch(() => {})
    }

    let paidAfterReturn = false
    if (donationId && isStripeConfigured()) {
        try {
            const donation = await abandonCheckout(donationId)
            paidAfterReturn = donation?.status === "SUCCEEDED"
        } catch (error) {
            console.error("[stripe] cancel page failed", error)
        }
    }

    if (paidAfterReturn) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
                <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                    <h1 className="text-2xl text-neutral-900">Plata a fost înregistrată</h1>
                    <p className="text-neutral-500">
                        Donația era deja plătită, așa că am păstrat-o.
                    </p>
                    <Link href="/scrisori">
                        <Button className="w-full" size="lg">Vezi alte scrisori</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="text-6xl mb-4 text-neutral-300">✕</div>
                <h1 className="text-2xl text-neutral-900">Plată anulată</h1>
                <p className="text-neutral-500">
                    Nu ți-am luat banii. Dacă te răzgândești, scrisoarea este încă acolo.
                </p>
                <div className="pt-6">
                    <Link href="/scrisori">
                        <Button variant="outline" className="w-full" size="lg">Înapoi la scrisori</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
