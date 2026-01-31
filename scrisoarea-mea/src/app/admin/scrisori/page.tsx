import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function AdminScrisoriPage() {
    const letters = await prisma.scrisoare.findMany({
        where: { moderationStatus: 'SUBMITTED' },
        include: { institution: true },
        orderBy: { createdAt: 'asc' }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Scrisori în Așteptare ({letters.length})</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 border-b">
                        <tr>
                            <th className="p-4">Dată</th>
                            <th className="p-4">Instituție</th>
                            <th className="p-4">Copil</th>
                            <th className="p-4">Suma</th>
                            <th className="p-4">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {letters.map(l => (
                            <tr key={l.id} className="border-b last:border-0 hover:bg-neutral-50 group">
                                <td className="p-4 text-neutral-500">{l.createdAt.toLocaleDateString('ro-RO')}</td>
                                <td className="p-4 font-medium">{l.institution.name}</td>
                                <td className="p-4">{l.childFirstName}, {l.childAge} ani</td>
                                <td className="p-4 font-mono">{formatCurrency(Number(l.targetAmount))}</td>
                                <td className="p-4">
                                    <Button asChild size="sm">
                                        <Link href={`/admin/scrisori/${l.id}`}>Verifică</Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {letters.length === 0 && (
                            <tr><td colSpan={5} className="p-10 text-center text-neutral-500">Nu sunt scrisori de moderat. 🎉</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
