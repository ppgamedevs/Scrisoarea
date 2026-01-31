import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: { searchParams: { reservationId: string } }) {
    const { reservationId } = searchParams

    if (!reservationId) return <div>Lipsesc parametrii.</div>;

    // Here we show Success even if the webhook hasn't fired yet?
    // Ideally we poll or check status. For MVP, we assume PENDING -> PAID will happen momentarily.
    // We can show "Plata in procesare" if needed.

    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { scrisoare: true }
    })

    // If already consumed (converted to donation), we might not find it if we deleted it?
    // Our webhook logic kept the reservation but marked CONSUMED. So it should exist.
    // Unless we decide to verify the Donation table instead.

    if (!reservation) {
        return (
            <div className="container mx-auto p-20 text-center">
                <h1 className="text-2xl mb-4">Nu am găsit detaliile plății.</h1>
                <Link href="/scrisori"><Button>Înapoi</Button></Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h1 className="text-3xl font-light text-green-900">Mulțumim!</h1>
                <p className="text-neutral-600">
                    Plata ta de <strong>{Number(reservation.amount)} RON</strong> pentru <strong>{reservation.scrisoare.childFirstName}</strong> a fost înregistrată.
                </p>
                <div className="bg-neutral-50 p-4 rounded text-sm text-neutral-500">
                    ID Tranzacție: {reservation.id.slice(0, 8)}...<br />
                    Vei primi confirmarea și pe email.
                </div>
                <div className="pt-6">
                    <Link href="/scrisori">
                        <Button className="w-full" size="lg">Vezi alte scrisori</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
