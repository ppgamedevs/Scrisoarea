import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { canPartnerEdit } from "@/lib/letter-moderation"
import { parseWishlistItems } from "@/lib/letter-items"
import EditScrisoareForm from "./edit-letter-form"

export default async function EditScrisoarePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== "PARTNER" || !session.institutionId) {
        redirect("/login?callbackUrl=/partner")
    }

    const letter = await prisma.scrisoare.findUnique({ where: { id } })
    if (!letter || letter.institutionId !== session.institutionId) notFound()
    if (!canPartnerEdit(letter.moderationStatus)) {
        redirect(`/partner/scrisori/${id}`)
    }

    const campaigns = await prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, title: true, slug: true },
    })

    return (
        <div className="container mx-auto py-8">
            <Link
                href={`/partner/scrisori/${id}`}
                className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Înapoi
            </Link>
            <EditScrisoareForm
                campaigns={campaigns}
                letter={{
                    id: letter.id,
                    childFirstName: letter.childFirstName,
                    childAge: letter.childAge,
                    childGender: letter.childGender,
                    category: letter.category,
                    childStory: letter.childStory,
                    partnerNotes: letter.partnerNotes,
                    campaignId: letter.campaignId,
                    originalImgUrl: letter.originalImgUrl,
                    items: parseWishlistItems(letter.items),
                }}
            />
        </div>
    )
}
