import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default async function TransparentaPage() {
    // 1. Total Letters (Published)
    const totalLetters = await prisma.scrisoare.count({
        where: { status: { not: 'NOU' } } // Assume NOU is internal
    })

    // 2. Fulfilled (INCHIS)
    const fulfilledLetters = await prisma.scrisoare.count({
        where: { status: 'INCHIS' }
    })

    // 3. Total Raised
    const donations = await prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED' }
    })
    const totalRaised = Number(donations._sum.amount || 0)

    // 4. Calculations
    const rate = totalLetters > 0 ? Math.round((fulfilledLetters / totalLetters) * 100) : 0

    return (
        <main className="min-h-screen bg-slate-50 py-20 text-slate-900">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Transparență Radicală</h1>
                    <p className="text-xl text-slate-500">
                        Cifre reale, actualizate în timp real direct din baza de date. Fără cosmetizări.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <Card className="p-8 text-center space-y-2 border-slate-200 shadow-sm">
                        <div className="text-4xl font-bold text-slate-900">{totalLetters}</div>
                        <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Scrisori Publicate</div>
                    </Card>

                    <Card className="p-8 text-center space-y-2 border-slate-200 shadow-sm">
                        <div className="text-4xl font-bold text-emerald-600">{fulfilledLetters}</div>
                        <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Dorințe Îndeplinite</div>
                    </Card>

                    <Card className="p-8 text-center space-y-2 border-slate-200 shadow-sm">
                        <div className="text-4xl font-bold text-blue-600">{formatCurrency(totalRaised)}</div>
                        <div className="text-sm font-medium uppercase tracking-wider text-slate-500">Sume Direcționate</div>
                    </Card>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-12 text-center space-y-6">
                    <h2 className="text-2xl font-bold">Registrul Public de Tranzacții</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Pentru a elimina orice dubiu, publicăm lista tuturor tranzacțiilor procesate, parțial ononimizată pentru protecția datelor personale ale donatorilor.
                    </p>
                    <Link href="/transparenta/tranzactii" className="inline-block bg-slate-900 text-white px-8 py-3 rounded font-medium hover:bg-slate-800 transition-colors">
                        Vezi Tranzacțiile
                    </Link>
                </div>
            </div>
        </main>
    )
}
