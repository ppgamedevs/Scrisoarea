import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default async function ImpactDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const letter = await prisma.scrisoare.findUnique({
        where: { id },
        include: {
            proofs: { where: { moderationStatus: 'APPROVED' } },
            institution: true
        }
    })

    if (!letter || !letter.proofApproved || letter.proofs.length === 0) notFound()

    const proof = letter.proofs[0]
    const items = letter.items ? JSON.parse(letter.items) : []

    // For MVP, handling simpler wishlist text fallback
    const itemsList = items.length > 0 ? items.map((i: any) => i.name).join(", ") : letter.wishList

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
                {/* Media Side */}
                <div className="bg-black flex items-center justify-center relative aspect-square md:aspect-auto">
                    {proof.type === 'VIDEO' ? (
                        <video src={proof.url} controls className="max-w-full max-h-[80vh] w-full" autoPlay muted />
                    ) : (
                        <img src={proof.url} alt="Proof" className="object-contain max-h-[80vh] w-full" />
                    )}
                </div>

                {/* Info Side */}
                <div className="p-8 space-y-6 flex flex-col h-full">
                    <div>
                        <Link href="/impact" className="text-sm text-slate-500 hover:underline mb-4 block">&larr; Înapoi la galerie</Link>
                        <div className="flex gap-2 mb-2">
                            <Badge className="bg-green-100 text-green-800 border-none">Livrare Confirmată</Badge>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{letter.childFirstName}</h1>
                        <p className="text-slate-500">{letter.institution.county}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded text-sm">
                            <h3 className="font-bold mb-1">Obiecte livrate</h3>
                            <p className="text-slate-700">{itemsList}</p>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Valoare totală</span>
                            <span className="font-mono font-bold">{formatCurrency(Number(letter.targetAmount))}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t text-xs text-slate-400">
                        <p>Dovadă verificată de Asociația Scrisoarea Mea.</p>
                        <p>Partener logistic: {letter.institution.name}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
