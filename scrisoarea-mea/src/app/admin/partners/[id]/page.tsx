import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PartnerEditForm } from "@/components/admin/partner-edit-form"
import Link from "next/link"

export default async function AdminPartnerEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const partner = await prisma.institution.findUnique({
        where: { id }
    })

    if (!partner) notFound()

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/admin/partners" className="text-sm text-slate-500 hover:text-slate-900">&larr; Înapoi la listă</Link>
                    <h1 className="text-2xl font-bold mt-1">Editare Profil Public: {partner.name}</h1>
                </div>
                {partner.slug && (
                    <Link href={`/partener/${partner.slug}`} target="_blank" className="text-blue-600 text-sm hover:underline">
                        Vezi pagina live &rarr;
                    </Link>
                )}
            </div>

            <PartnerEditForm partner={partner} />
        </div>
    )
}
