import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"
import { JsonLd } from "@/components/seo/json-ld"
import { publicWishlistWhere } from "@/lib/letter-moderation"
import { LETTER_CATEGORIES, resolveCategory } from "@/lib/seo/categories"
import { generateBreadcrumbSchema, generateCollectionPageSchema, generateItemListSchema } from "@/lib/seo/jsonld"
import { pageMetadata } from "@/lib/seo/metadata"

export const revalidate = 1800

export function generateStaticParams() {
    return LETTER_CATEGORIES.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const category = resolveCategory(slug)
    if (!category) return { title: "Categorie inexistentă" }
    return pageMetadata({
        title: category.title,
        description: category.description,
        path: `/scrisori/categorie/${category.slug}`,
        keywords: category.keywords,
    })
}

export default async function CategoryLettersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const category = resolveCategory(slug)
    if (!category) notFound()

    const letters = await prisma.scrisoare.findMany({
        where: {
            ...publicWishlistWhere,
            category: category.value,
        },
        orderBy: { createdAt: "desc" },
        include: { institution: true, campaign: true },
    })

    return (
        <main className="min-h-screen bg-[var(--pastel-sage)]/30 pb-20">
            <JsonLd
                data={[
                    generateCollectionPageSchema(category.title, category.description, `/scrisori/categorie/${category.slug}`),
                    generateBreadcrumbSchema([
                        { name: "Acasă", url: "/" },
                        { name: "Scrisori", url: "/scrisori" },
                        { name: category.label, url: `/scrisori/categorie/${category.slug}` },
                    ]),
                    generateItemListSchema(
                        category.title,
                        letters.map((letter) => ({
                            name: `Dorința lui ${letter.childFirstName}`,
                            url: `/scrisori/${letter.slug || letter.id}`,
                        })),
                        `/scrisori/categorie/${category.slug}`
                    ),
                ]}
            />
            <div className="bg-[var(--pastel-cream)] border-b py-12 px-4 mb-8">
                <div className="container mx-auto max-w-5xl">
                    <p className="text-sm text-slate-500 mb-2">
                        <Link href="/scrisori" className="hover:underline">Toate scrisorile</Link>
                        {" / "}
                        {category.label}
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">{category.title}</h1>
                    <p className="text-slate-600 max-w-3xl">{category.description}</p>
                </div>
            </div>
            <div className="container mx-auto px-4">
                {letters.length === 0 ? (
                    <p className="text-center text-slate-500 py-16">Nu sunt scrisori publice în această categorie acum.</p>
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
