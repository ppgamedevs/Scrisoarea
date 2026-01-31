import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function PartnerDashboard() {
    const session = await getSession()
    if (!session?.institutionId) return <div>Nu ai instituție asignată.</div>

    const letters = await prisma.scrisoare.findMany({
        where: { institutionId: session.institutionId },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Scrisorile Instituției</h1>
                <Button asChild><Link href="/partner/scrisori/new">+ Adaugă Scrisoare</Link></Button>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                        <tr>
                            <th className="p-4">Copil</th>
                            <th className="p-4">Categorie</th>
                            <th className="p-4">Total Necesar</th>
                            <th className="p-4">Moderare</th>
                            <th className="p-4">Public</th>
                            <th className="p-4">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {letters.map(l => {
                            const showUploadProof = ['FINANTAT', 'LIVRAT', 'IN_ACHIZITIE'].includes(l.status) && !l.proofApproved
                            const isClosed = l.proofApproved || l.status === 'INCHIS'
                            const isRejected = l.moderationStatus === 'REJECTED'

                            return (
                                <tr key={l.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium">{l.childFirstName}, {l.childAge} ani</td>
                                    <td className="p-4">{l.category}</td>
                                    <td className="p-4 font-mono">{formatCurrency(Number(l.targetAmount))}</td>
                                    <td className="p-4">
                                        {isRejected ? (
                                            <Badge variant="destructive">Respins</Badge>
                                        ) : isClosed ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 border-none">Închis</Badge>
                                        ) : (
                                            <Badge variant="secondary">{l.moderationStatus}</Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs uppercase tracking-wide">{l.status}</td>
                                    <td className="p-4 flex gap-2 items-center">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/partner/scrisori/${l.id}`}>Detalii</Link>
                                        </Button>

                                        {showUploadProof && (
                                            <Button size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                <Link href={`/partner/scrisori/${l.id}/proof`}>Încarcă Dovada</Link>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {letters.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Nu ai adăugat nicio scrisoare.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
