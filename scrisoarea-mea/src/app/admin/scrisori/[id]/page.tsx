import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { parseWishlistItems, sumSubmittedEstimates } from "@/lib/letter-items"
import AdminLetterModerationForm from "./moderation-form"

export default async function AdminScrisoareDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const letter = await prisma.scrisoare.findUnique({
        where: { id },
        include: { institution: true },
    })

    if (!letter) notFound()

    const items = parseWishlistItems(letter.items)
    const submittedTarget =
        Number(letter.submittedTargetAmount) || sumSubmittedEstimates(items)

    return (
        <AdminLetterModerationForm
            letter={{
                id: letter.id,
                childFirstName: letter.childFirstName,
                childAge: letter.childAge,
                childStory: letter.childStory,
                category: letter.category,
                partnerNotes: letter.partnerNotes,
                adminNotes: letter.adminNotes,
                originalImgUrl: letter.originalImgUrl,
                mediaType: letter.mediaType,
                publicCode: letter.publicCode,
                moderationStatus: letter.moderationStatus,
                submittedTargetAmount: submittedTarget,
                approvedTargetAmount:
                    letter.approvedTargetAmount != null
                        ? Number(letter.approvedTargetAmount)
                        : null,
                createdAt: letter.createdAt.toISOString(),
                items,
                institution: {
                    name: letter.institution.name,
                    cui: letter.institution.cui,
                    contactName: letter.institution.contactName,
                    contactEmail: letter.institution.contactEmail,
                },
            }}
        />
    )
}
