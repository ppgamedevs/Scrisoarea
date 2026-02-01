import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export default async function UpdatesPage() {
    const updates = await prisma.update.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
        include: { scrisoare: { include: { institution: true } } },
        take: 50
    })

    return (
        <main className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Jurnal de Activitate</h1>
                    <p className="text-slate-500">Fluxul live al dorințelor îndeplinite și al progresului logistic.</p>
                </div>

                <div className="space-y-6 relative border-l-2 border-slate-200 ml-4 md:ml-0 md:pl-8">
                    {updates.map((update: any) => (
                        <div key={update.id} className="relative pl-6 md:pl-0">
                            {/* Dot */}
                            <div className="absolute -left-[31px] md:-left-[41px] top-6 w-4 h-4 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10"></div>

                            <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary" className="text-xs font-mono mb-2">
                                        {update.createdAt.toLocaleDateString('ro-RO')}
                                    </Badge>
                                    <Badge variant="outline" className={
                                        update.type === 'PROOF' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            update.type === 'STATUS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-slate-100 text-slate-600'
                                    }>
                                        {update.type}
                                    </Badge>
                                </div>

                                <h3 className="font-bold text-lg mb-2 text-slate-900">{update.title}</h3>
                                <p className="text-slate-600 mb-4">{update.body}</p>

                                {update.scrisoare && (
                                    <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase tracking-wide">Caz asociat</span>
                                            <span className="font-medium">{update.scrisoare.childFirstName}, {update.scrisoare.childAge} ani</span>
                                        </div>
                                        <Button asChild size="sm" variant="ghost" className="h-8">
                                            <Link href={`/scrisori/${update.scrisoare.slug || update.scrisoare.id}`}>
                                                Vezi <ExternalLink className="w-3 h-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {updates.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            Niciun update momentan.
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
