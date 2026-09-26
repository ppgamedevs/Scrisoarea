"use server"

import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function uploadProofAction(scrisoareId: string, formData: FormData) {
    const session = await getSession()
    if (session?.role !== 'PARTNER') throw new Error("Unauthorized")

    // Mock Upload Logic for MVP
    // Ideally: Upload to S3/Blob, get URL.
    // Here: Use a placeholder video/image based on input type.

    // Check file type (mock)
    const file = formData.get('proofFile') as File
    const type = file.type.startsWith('video') ? 'VIDEO' : 'PHOTO'

    // Mock URL - In real app, this is result of upload
    const mockUrl = type === 'VIDEO'
        ? 'https://www.w3schools.com/html/mov_bbb.mp4' // Public sample video
        : 'https://placehold.co/800x600/png?text=Dovada+Foto'

    await prisma.proofMedia.create({
        data: {
            scrisoareId,
            url: mockUrl,
            type,
            moderationStatus: 'PENDING'
        }
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
