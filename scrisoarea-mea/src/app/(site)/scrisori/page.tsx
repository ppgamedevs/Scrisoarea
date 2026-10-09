import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LetterFilters } from "@/components/letters/letter-filters"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"
import { JsonLd } from "@/components/seo/json-ld"
import { Prisma } from "@prisma/client"
import { LetterModeration, publicWishlistWhere } from "@/lib/letter-moderation"
import { LETTER_CATEGORIES } from "@/lib/seo/categories"
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo/jsonld"
import { pageMetadata } from "@/lib/seo/metadata"
import { pendingReservationInclude } from "@/lib/letters"

export const revalidate = 600

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const q = typeof params.q === "string" ? params.q : undefined
    return pageMetadata({
        title: q ? `Căutare: ${q} — scrisori verificate` : "Scrisori verificate ale copiilor din România",
        description:
            "Alege o scrisoare verificată și îndeplinește o dorință concretă. Fără comision, cu dovadă după livrare. Publicăm doar prenumele copilului.",
        path: "/scrisori",
        keywords: ["scrisori copii", "donație verificată", "Moș Crăciun", "ONG România"],
        noIndex: Boolean(q),
    })
}

export default async function ScrisoriPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const q = typeof params.q === "string" ? params.q : undefined
    const category = typeof params.category === "string" && params.category !== "all" ? params.category : undefined
    const status = typeof params.status === "string" && params.status !== "all" ? params.status : undefined

    const where: Prisma.ScrisoareWhereInput = {
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
            { items: { contains: q } },
        ]
    }

    const letters = await prisma.scrisoare.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { institution: true, campaign: true, fulfillmentClaims: pendingReservationInclude() },
    })

    return (
        <main className="min-h-screen bg-[var(--pastel-sage)]/30 pb-20">
            <JsonLd
                data={[
                    generateCollectionPageSchema(
                        "Scrisori verificate",
                        "Dorințe ale copiilor din România, publicate doar după verificarea instituției.",
                        "/scrisori"
                    ),
                    generateBreadcrumbSchema([
                        { name: "Acasă", url: "/" },
                        { name: "Scrisori", url: "/scrisori" },
                    ]),
                    generateItemListSchema(
                        "Scrisori active",
                        letters.slice(0, 20).map((letter) => ({
                            name: `Dorința lui ${letter.childFirstName}`,
                            url: `/scrisori/${letter.slug || letter.id}`,
                        })),
                        "/scrisori"
                    ),
                ]}
            />
            <div className="bg-[var(--pastel-cream)] border-b py-12 px-4 mb-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Toate scrisorile verificate</h1>
                    <p className="text-slate-500 max-w-2xl">
                        Alege o poveste și ajută la îndeplinirea unei dorințe. Fiecare scrisoare este încărcată de un partener instituțional și aprobată înainte de publicare.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-6">
                        {LETTER_CATEGORIES.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/scrisori/categorie/${item.slug}`}
                                className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-800"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
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
                        {letters.map((letter) => (
                            <ScrisoareCard key={letter.id} letter={letter} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
