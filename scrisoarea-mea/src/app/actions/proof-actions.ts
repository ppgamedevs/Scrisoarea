"use server"

import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { isVideoProof, MAX_PROOF_IMAGES, MAX_PROOF_VIDEOS, proofMediaType } from "@/lib/proof-media"
import { saveFile } from "@/lib/storage"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const IMAGE_LIMIT = 4.5 * 1024 * 1024

async function syncLetterAfterReview(scrisoareId: string) {
    const proofs = await prisma.proofMedia.findMany({
        where: { scrisoareId },
        select: { moderationStatus: true },
    })
    const pending = proofs.some((proof) => proof.moderationStatus === "PENDING")
    const approved = proofs.some((proof) => proof.moderationStatus === "APPROVED")
    if (pending || !approved) return

    await prisma.scrisoare.update({
        where: { id: scrisoareId },
        data: {
            proofApproved: true,
            status: "INCHIS",
            moderationStatus: "fulfilled",
        },
    })
    revalidatePath("/impact")
    revalidatePath(`/impact/${scrisoareId}`)
}

function storedProofUrl(value: string) {
    if (value.startsWith("/uploads/")) return true
    try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
    } catch {
        return false
    }
}

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
    if (letter.proofApproved) throw new Error("Dovada a fost deja aprobată pentru această scrisoare.")

    const providedUrl = String(formData.get("mediaUrl") || "").trim()
    const providedType = String(formData.get("mediaType") || "").trim()
    const file = formData.get("proofFile")

    let url = ""
    let type: "VIDEO" | "PHOTO" = "PHOTO"

    if (providedUrl && storedProofUrl(providedUrl)) {
        url = providedUrl
        type = isVideoProof(providedType, providedUrl) ? "VIDEO" : "PHOTO"
    } else if (file instanceof File && file.size > 0) {
        const isVideo = proofMediaType(file) === "VIDEO"
        const isImage = file.type.startsWith("image/") || (!isVideo && /\.(jpe?g|png|gif|webp|avif)$/i.test(file.name))
        if (!isVideo && !isImage) throw new Error("Sunt acceptate doar poze sau video.")
        if (!isVideo && file.size > IMAGE_LIMIT) {
            throw new Error("Fișierul este prea mare. Încearcă o poză sub 4.5MB sau un video mai scurt.")
        }
        if (isVideo && file.size > IMAGE_LIMIT) {
            throw new Error("Video-ul este prea mare pentru încărcarea directă. Încearcă un fișier mai scurt.")
        }
        type = isVideo ? "VIDEO" : "PHOTO"
        url = await saveFile(file)
    } else {
        throw new Error("Încarcă o poză sau un video.")
    }

    if (!url || url.includes("placehold.co") || url.includes("text=Error") || url.includes("No+Storage")) {
        throw new Error("Dovada nu a putut fi salvată. Încearcă din nou.")
    }

    const active = await prisma.proofMedia.findMany({
        where: { scrisoareId, moderationStatus: { in: ["PENDING", "APPROVED"] } },
        select: { type: true, url: true },
    })
    const activeVideos = active.filter((proof) => isVideoProof(proof.type, proof.url)).length
    const activeImages = active.length - activeVideos
    if (type === "VIDEO" && activeVideos >= MAX_PROOF_VIDEOS) {
        throw new Error("Poți încărca un singur videoclip.")
    }
    if (type === "PHOTO" && activeImages >= MAX_PROOF_IMAGES) {
        throw new Error("Poți încărca maximum 3 imagini.")
    }

    await prisma.proofMedia.create({
        data: {
            scrisoareId,
            url,
            type,
            moderationStatus: "PENDING",
        },
    })

    revalidatePath(`/partner/scrisori/${scrisoareId}`)
    revalidatePath(`/partner/scrisori/${scrisoareId}/proof`)
    revalidatePath("/admin/proofs")
    redirect(`/partner/scrisori/${scrisoareId}/proof`)
}

export async function approveProof(proofId: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    const proof = await prisma.proofMedia.update({
        where: { id: proofId },
        data: { moderationStatus: "APPROVED" },
    })
    await syncLetterAfterReview(proof.scrisoareId)

    revalidatePath("/admin/proofs")
    revalidatePath(`/partner/scrisori/${proof.scrisoareId}/proof`)
}

export async function rejectProof(proofId: string, reason: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    const proof = await prisma.proofMedia.update({
        where: { id: proofId },
        data: {
            moderationStatus: "REJECTED",
            rejectReason: reason,
        },
    })
    await syncLetterAfterReview(proof.scrisoareId)

    revalidatePath("/admin/proofs")
    revalidatePath(`/partner/scrisori/${proof.scrisoareId}/proof`)
}
