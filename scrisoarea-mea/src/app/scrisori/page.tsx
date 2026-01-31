import { getLetters } from "@/lib/letters"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Category } from "@prisma/client"

// Server Component
export default async function ScrisoriPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Parse params
    const category = typeof searchParams.category === 'string' ? (searchParams.category as Category) : undefined
    const county = typeof searchParams.county === 'string' ? searchParams.county : undefined
    const age = typeof searchParams.age === 'string' ? searchParams.age : undefined
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1

    const { data: letters, total } = await getLetters({
        category,
        county,
        ageRange: age,
        page
    })

    // Basic Filter UI Helpers (Hardcoded for MVP)
    const categories = Object.values(Category)
    const counties = ["Bucuresti", "Iasi", "Cluj", "Timis"] // Should ideally come from DB GroupBy

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* Header / Filter Bar */}
            <div className="bg-white border-b py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-light text-neutral-900 mb-6">Scrisori Verificate</h1>

                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Filter Categories */}
                        <div className="flex gap-2">
                            <Link href="/scrisori">
                                <Button variant={!category ? "default" : "outline"} size="sm">Toate</Button>
                            </Link>
                            {categories.slice(0, 4).map(c => (
                                <Link key={c} href={`/scrisori?category=${c}`}>
                                    <Button variant={category === c ? "default" : "outline"} size="sm" className="capitalize">
                                        {c.toLowerCase()}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4 py-8">
                {letters.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        Nu am găsit scrisori conform filtrelor selectate.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {letters.map((letter) => (
                            <ScrisoareCard key={letter.id} letter={letter} />
                        ))}
                    </div>
                )}

                {/* Simple Pagination */}
                <div className="flex justify-center mt-12 gap-4">
                    {page > 1 && (
                        <Link href={`/scrisori?page=${page - 1}${category ? `&category=${category}` : ''}`}>
                            <Button variant="outline">Anterioara</Button>
                        </Link>
                    )}
                    <span className="py-2 text-sm text-neutral-500">Pagina {page}</span>
                    {letters.length === 12 && ( // Rough check for next page
                        <Link href={`/scrisori?page=${page + 1}${category ? `&category=${category}` : ''}`}>
                            <Button variant="outline">Urmatoarea</Button>
                        </Link>
                    )}
                </div>
            </div>
        </main>
    )
}
