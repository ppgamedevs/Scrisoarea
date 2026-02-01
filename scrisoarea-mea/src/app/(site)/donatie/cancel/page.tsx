import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CancelPage({ searchParams }: { searchParams: { reservationId: string } }) {
    const { reservationId } = searchParams

    if (reservationId) {
        // Release logic
        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: 'CANCELLED' } // or just delete logic?
        }).catch(() => { }) // ignore if not found
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
