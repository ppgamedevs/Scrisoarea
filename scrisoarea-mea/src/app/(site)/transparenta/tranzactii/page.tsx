import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function TransactionsLedgerPage() {
    const transactions = await prisma.donation.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        where: { status: 'SUCCEEDED' },
        include: { scrisoare: true } // to link to letter
    })

    return (
        <main className="min-h-screen bg-slate-50 py-20 text-slate-900">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Registru Tranzacții</h1>
                        <p className="text-slate-500">Ultimele 100 donații confirmate.</p>
                    </div>
                    <Link href="/transparenta" className="text-sm font-medium hover:underline">Inapoi la statistici</Link>
                </div>

                <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                            <tr>
                                <th className="p-4 font-medium">ID Tranzacție</th>
                                <th className="p-4 font-medium">Dată</th>
                                <th className="p-4 font-medium text-right">Sumă</th>
                                <th className="p-4 font-medium">Destinație (Scrisoare)</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-xs text-slate-400">
                                        {tx.id.substring(0, 8)}...
                                    </td>
                                    <td className="p-4">
                                        {tx.createdAt.toLocaleDateString('ro-RO')} {tx.createdAt.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-4 text-right font-medium">
                                        {formatCurrency(Number(tx.amount))}
                                    </td>
                                    <td className="p-4">
                                        {tx.scrisoare ? (
                                            <Link href={`/scrisori/${tx.scrisoare.publicCode || tx.scrisoare.id}`} className="text-blue-600 hover:underline">
                                                {tx.scrisoare.childFirstName} ({tx.scrisoare.publicCode})
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400">Arhivată</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Reușit</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
