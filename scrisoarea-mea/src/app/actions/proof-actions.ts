"use server"

import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function uploadProofAction(scrisoareId: string, formData: FormData) {
    const session = await getSession()
    if (session?.role !== "PARTNER" || !session.institutionId) throw new Error("Unauthorized")
    if (!session.emailVerified) throw new Error("Email neverificat.")

    const letter = await prisma.scrisoare.findUnique({ where: { id: scrisoareId } })
    if (!letter || letter.institutionId !== session.institutionId) {
        throw new Error("Nu aveți acces la această scrisoare.")
    }

    const institution = await prisma.institution.findUnique({
        where: { id: session.institutionId },
        select: { verified: true },
    })
    if (!institution?.verified) throw new Error("Instituția nu este aprobată.")

    // Mock Upload Logic for MVP
    const file = formData.get("proofFile") as File
    const type = file.type.startsWith("video") ? "VIDEO" : "PHOTO"

    const mockUrl =
        type === "VIDEO"
            ? "https://www.w3schools.com/html/mov_bbb.mp4"
            : "https://placehold.co/800x600/png?text=Dovada+Foto"

    await prisma.proofMedia.create({
        data: {
            scrisoareId,
            url: mockUrl,
            type,
            moderationStatus: "PENDING",
        },
    })

    revalidatePath(`/partner/scrisori/${scrisoareId}`)
    redirect(`/partner/scrisori/${scrisoareId}`)
}

export async function approveProof(proofId: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    // Atomic update: Approve proof AND Close letter
    await prisma.$transaction(async (tx) => {
        const proof = await tx.proofMedia.update({
            where: { id: proofId },
            data: { moderationStatus: 'APPROVED' }
        })

        await tx.scrisoare.update({
            where: { id: proof.scrisoareId },
            data: {
                proofApproved: true,
                status: 'INCHIS',
                moderationStatus: 'fulfilled',
            }
        })
    })

    revalidatePath('/admin/proofs')
}

export async function rejectProof(proofId: string, reason: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    await prisma.proofMedia.update({
        where: { id: proofId },
        data: {
            moderationStatus: 'REJECTED',
            rejectReason: reason
        }
    })

    revalidatePath('/admin/proofs')
}
