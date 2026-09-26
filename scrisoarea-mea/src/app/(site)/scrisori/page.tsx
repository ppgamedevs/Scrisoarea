import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LetterFilters } from "@/components/letters/letter-filters"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"
import { LetterModeration, publicWishlistWhere } from "@/lib/letter-moderation"

export default async function ScrisoriPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams

    // Parse Filters
    const q = typeof params.q === 'string' ? params.q : undefined
    const category = typeof params.category === 'string' && params.category !== 'all' ? params.category : undefined
    const status = typeof params.status === 'string' && params.status !== 'all' ? params.status : undefined

    // Always require admin approval for public wishlist
    const where: any = {
        ...publicWishlistWhere,
    }

    if (status) {
        where.status = status
        where.moderationStatus = LetterModeration.APPROVED
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
        <main className="min-h-screen bg-[var(--pastel-sage)]/30 pb-20">
            <div className="bg-[var(--pastel-cream)] border-b py-12 px-4 mb-8">
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
                        {letters.map((l: any) => (
                            <ScrisoareCard key={l.id} letter={l} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
