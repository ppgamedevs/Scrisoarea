import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ScrisoareCard } from "@/components/ui/scrisoare-card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle2 } from "lucide-react"
import { Metadata } from 'next'
import { generateOrganizationSchema } from "@/lib/seo/jsonld"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const partner = await prisma.institution.findUnique({ where: { slug } })
    if (!partner) return { title: 'Partener Inexistent' }

    const name = partner.publicName || partner.name
    const { pageMetadata } = await import("@/lib/seo/metadata")
    return pageMetadata({
        title: `${name} — partener verificat`,
        description:
            partner.descriptionPublic?.substring(0, 160) ||
            `Profil oficial ${name} (${partner.city}, ${partner.county}). Instituție verificată pe visuripehartie.ro.`,
        path: `/partener/${slug}`,
        keywords: [name, partner.county, partner.city, "partener verificat"],
    })
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const partner = await prisma.institution.findUnique({
        where: { slug },
        include: {
            scrisori: {
                where: {
                    moderationStatus: 'approved',
                    status: { in: ['ACTIV', 'FINANTAT', 'IN_ACHIZITIE', 'LIVRAT'] },
                },
                orderBy: { createdAt: 'desc' },
                include: { institution: true, campaign: true }
            }
        }
    })

    if (!partner) notFound()

    const fulfilledCount = partner.scrisori.filter(s => s.status === 'INCHIS').length
    const jsonLd = {
        ...generateOrganizationSchema(),
        name: partner.publicName || partner.name,
        description: partner.descriptionPublic,
        url: partner.website
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center border text-slate-300 font-bold text-3xl overflow-hidden">
                            {partner.logoUrl ? <img src={partner.logoUrl} className="w-full h-full object-cover" alt="Logo" /> : (partner.publicName || partner.name).charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">{partner.publicName || partner.name}</h1>
                                {partner.verified && (
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none gap-1 pl-1 pr-2">
                                        <CheckCircle2 className="w-3 h-3" /> Partener Verificat
                                    </Badge>
                                )}
                            </div>
                            <p className="text-slate-500 mb-4 flex items-center gap-2">
                                <span>{partner.county}, {partner.city}</span>
                                {partner.website && (
                                    <>
                                        <span>•</span>
                                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-blue-600">
                                            {partner.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </>
                                )}
                            </p>
                            <p className="text-slate-700 max-w-2xl leading-relaxed">{partner.descriptionPublic || "Această instituție nu a adăugat încă o descriere publică."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats & Trust Block */}
            <div className="container mx-auto px-4 -mt-8 mb-12 relative z-10">
                <div className="bg-white rounded-xl shadow-sm border p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div>
                        <div className="text-sm text-slate-500 uppercase font-bold text-xs tracking-wider mb-1">Impact Total</div>
                        <div className="text-2xl font-bold">{partner.scrisori.length} Scrisori Publicate</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 uppercase font-bold text-xs tracking-wider mb-1">Dorințe Îndeplinite</div>
                        <div className="text-2xl font-bold text-emerald-600">{fulfilledCount} Visuri împlinite</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <strong>Instituție Verificată.</strong> <br />
                            Această organizație a fost auditată legal și operațional înainte de a primi dreptul de a publica cazuri.
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Letters */}
            <div className="container mx-auto px-4 pb-20">
                <h2 className="text-2xl font-bold mb-6">Cazuri Active ({partner.scrisori.length})</h2>
                {partner.scrisori.length === 0 ? (
                    <p className="text-slate-500 italic">Nu există scrisori active momentan.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {partner.scrisori.map(l => (
                            <ScrisoareCard key={l.id} letter={l} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
