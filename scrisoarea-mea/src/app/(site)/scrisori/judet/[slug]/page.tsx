import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"
import { JsonLd } from "@/components/seo/json-ld"
import { LetterModeration, publicWishlistWhere } from "@/lib/letter-moderation"
import { slugifyRo } from "@/lib/seo/categories"
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo/jsonld"
import { pageMetadata } from "@/lib/seo/metadata"
import { pendingReservationInclude } from "@/lib/letters"

export const revalidate = 1800

export async function generateStaticParams() {
    try {
        const institutions = await prisma.institution.findMany({
            where: {
                scrisori: {
                    some: { moderationStatus: { in: [LetterModeration.APPROVED, "APPROVED"] } },
                },
            },
            select: { county: true },
        })
        const slugs = [...new Set(institutions.map((row) => slugifyRo(row.county)).filter(Boolean))]
        return slugs.map((slug) => ({ slug }))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const county = await findCountyName(slug)
    if (!county) return { title: "Județ inexistent" }
    return pageMetadata({
        title: `Scrisori verificate din județul ${county}`,
        description: `Donează pentru copii din județul ${county}. Scrisori încărcate de ONG-uri și școli verificate pe Visuri pe hârtie.`,
        path: `/scrisori/judet/${slug}`,
        keywords: [county, `donație copii ${county}`, `ONG ${county}`, "scrisori verificate"],
    })
}

async function findCountyName(slug: string) {
    const institutions = await prisma.institution.findMany({ select: { county: true } })
    return institutions.find((row) => slugifyRo(row.county) === slug)?.county
}

export default async function CountyLettersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const county = await findCountyName(slug)
    if (!county) notFound()

    const letters = await prisma.scrisoare.findMany({
        where: {
            ...publicWishlistWhere,
            institution: { county },
        },
        orderBy: { createdAt: "desc" },
        include: { institution: true, campaign: true, fulfillmentClaims: pendingReservationInclude() },
    })

    const path = `/scrisori/judet/${slug}`

    return (
        <main className="min-h-screen bg-[var(--pastel-sage)]/30 pb-20">
            <JsonLd
                data={[
                    generateCollectionPageSchema(
                        `Scrisori din județul ${county}`,
                        `Dorințe verificate ale copiilor ajutați de instituții din ${county}.`,
                        path
                    ),
                    generateBreadcrumbSchema([
                        { name: "Acasă", url: "/" },
                        { name: "Scrisori", url: "/scrisori" },
                        { name: county, url: path },
                    ]),
                    generateItemListSchema(
                        `Scrisori din ${county}`,
                        letters.map((letter) => ({
                            name: `Dorința lui ${letter.childFirstName}`,
                            url: `/scrisori/${letter.slug || letter.id}`,
                        })),
                        path
                    ),
                ]}
            />
            <div className="bg-[var(--pastel-cream)] border-b py-12 px-4 mb-8">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-sm text-slate-500 mb-2">
                        <Link href="/scrisori" className="hover:underline">Toate scrisorile</Link>
                        {" / "}
                        {county}
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">Scrisori verificate din județul {county}</h1>
                    <p className="text-slate-600 max-w-3xl">
                        Aceste scrisori sunt publicate de instituții partenere din {county}. Livrarea se face la sediul partenerului, nu la adresa copilului.
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-4">
                {letters.length === 0 ? (
                    <p className="text-center text-slate-500 py-16">Nu sunt scrisori publice din acest județ acum.</p>
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
