import prisma from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, calculateAgeBucket } from "@/lib/utils"
import { LetterFilters } from "@/components/letters/letter-filters"

export default async function ScrisoriPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams

    // Parse Filters
    const q = typeof params.q === 'string' ? params.q : undefined
    const category = typeof params.category === 'string' && params.category !== 'all' ? params.category : undefined
    const status = typeof params.status === 'string' && params.status !== 'all' ? params.status : undefined

    // Build Query
    const where: any = {
        // Default show public statuses if no status selected, usually standard listing
        // status: status ? status : { not: 'NOU' } // Let's respect user choice properly

        status: status
            ? status
            : { in: ['NOU', 'ACTIV', 'FINANTAT', 'IN_ACHIZITIE', 'LIVRAT', 'INCHIS'] } // Show all public statuses
    }

    if (category) where.category = category

    if (q) {
        where.OR = [
            { childFirstName: { contains: q } },
            { wishList: { contains: q } },
            { items: { contains: q } }
        ]
    }

    const letters = await prisma.scrisoare.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { institution: true, campaign: true }
    })

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b py-12 px-4 mb-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Toate Scrisorile</h1>
                    <p className="text-slate-500">Alege o poveste și ajută la îndeplinirea unei dorințe.</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <LetterFilters />

                {letters.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-xl text-slate-400 font-medium">Nu am găsit scrisori conform filtrelor tale.</p>
                        <Button variant="link" asChild className="mt-2"><Link href="/scrisori">Resetează filtrele</Link></Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {letters.map(l => (
                            <Link href={`/scrisori/${l.slug || l.id}`} key={l.id} className="group block h-full">
                                <article className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all h-full flex flex-col relative">
                                    {l.campaign && (
                                        <div className="absolute top-0 left-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 z-10 rounded-br-lg">
                                            Campanie: {l.campaign.title}
                                        </div>
                                    )}

                                    <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                                        <img src={l.originalImgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pt-12">
                                            <p className="text-white font-bold text-lg">{l.childFirstName}, {calculateAgeBucket(l.childAge)} ani</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <div className="flex gap-2 mb-2 flex-wrap">
                                                <Badge variant="outline">{l.category}</Badge>
                                                {l.status === 'FINANTAT' && <Badge className="bg-green-100 text-green-800 border-none">Finanțat</Badge>}
                                                {l.status === 'INCHIS' && <Badge className="bg-emerald-100 text-emerald-800 border-none">Închis</Badge>}
                                            </div>
                                            <p className="text-slate-600 text-sm line-clamp-2">{l.childStory || "O poveste specială..."}</p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm">
                                            <span className="text-slate-500 truncate max-w-[150px]">{l.institution.county}</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(Number(l.targetAmount))}</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
