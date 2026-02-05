import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function ImpactPage() {
    // Fetch letters that have an approved proof
    const closedLetters = await prisma.scrisoare.findMany({
        where: {
            proofApproved: true,
            status: 'INCHIS'
        },
        include: {
            proofs: { where: { moderationStatus: 'APPROVED' }, take: 1 },
            institution: true
        },
        orderBy: { updatedAt: 'desc' }
    })

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Hero */}
            <section className="bg-white border-b py-20 px-6 text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Dovezi ale dorințelor îndeplinite</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Transparență totală. Fiecare cerere închisă include confirmarea livrării verificată de echipa noastră.
                </p>
            </section>

            {/* Grid */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {closedLetters.map(letter => {
                        const proof = letter.proofs[0]
                        if (!proof) return null

                        return (
                            <div key={letter.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-neutral-100 relative group">
                                    {/* Thumbnail */}
                                    {proof.type === 'VIDEO' ? (
                                        <div className="w-full h-full flex items-center justify-center bg-black text-white">
                                            <span className="text-4xl">▶</span>
                                        </div>
                                    ) : (
                                        <img src={proof.url} alt="Proof" className="w-full h-full object-cover" />
                                    )}

                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Link href={`/impact/${letter.id}`} className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-slate-100">
                                            Vezi Dovada
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{letter.childFirstName}</h3>
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Dorință Îndeplinită</Badge>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {letter.category} • {letter.institution.county}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Închis la {letter.updatedAt.toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}
