import prisma from "@/lib/prisma"
import NewScrisoareForm from "./new-letter-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewScrisoarePage() {
    const session = await getSession()
    if (!session || session.role !== 'PARTNER') redirect('/login?callbackUrl=/partner/scrisori/new')

    const campaigns = await prisma.campaign.findMany({
        where: {
            status: 'ACTIVE'
        },
        select: { id: true, title: true, slug: true }
    })

    return (
        <div className="container mx-auto py-8">
            <Link href="/partner" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 group transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Înapoi la Dashboard
            </Link>
            <h1 className="text-2xl font-bold mb-6">Adaugă o Scrisorică Nouă</h1>
            <NewScrisoareForm campaigns={campaigns} />
        </div>
    )
}
