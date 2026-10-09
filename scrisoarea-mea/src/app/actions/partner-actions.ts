"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { saveFile } from "@/lib/storage"
import { amountExceedsMaxMessage, LetterModeration, canPartnerEdit } from "@/lib/letter-moderation"
import {
    itemsFromPartnerForm,
    serializeWishlistItems,
    sumSubmittedEstimates,
} from "@/lib/letter-items"

async function requirePartner() {
    const session = await getSession()
    if (!session || session.role !== "PARTNER" || !session.institutionId) {
        throw new Error("Unauthorized")
    }
    if (!session.emailVerified) {
        throw new Error("Email neverificat.")
    }
    const institution = await prisma.institution.findUnique({
        where: { id: session.institutionId },
        select: { verified: true },
    })
    if (!institution?.verified) {
        throw new Error("Instituția nu este încă aprobată de administrator.")
    }
    return session as typeof session & { institutionId: string }
}

async function resolveMedia(formData: FormData): Promise<{ mediaUrl: string; mediaType: "IMAGE" | "VIDEO" }> {
    const mediaUrlParam = formData.get("mediaUrl") as string | null
    const mediaTypeParam = formData.get("mediaType") as "IMAGE" | "VIDEO" | null

    let mediaUrl = "https://placehold.co/600x800"
    let mediaType: "IMAGE" | "VIDEO" = "IMAGE"

    if (mediaUrlParam) {
        mediaUrl = mediaUrlParam
        if (mediaTypeParam) mediaType = mediaTypeParam

        if (mediaType === "VIDEO") {
            try {
                const response = await fetch(mediaUrl)
                if (response.ok) {
                    const size = Number(response.headers.get("content-length"))
                    if (size > 4.5 * 1024 * 1024) {
                        const blob = await response.blob()
                        const fileBuffer = Buffer.from(await blob.arrayBuffer())
                        const fileName = mediaUrl.split("/").pop() || "video.mp4"
                        const fileToCompress = new File([new Uint8Array(fileBuffer)], fileName, {
                            type: "video/mp4",
                        })
                        const { compressVideo } = await import("@/lib/video")
                        const compressedBuffer = await compressVideo(fileToCompress)
                        const compressedFile = new File(
                            [new Uint8Array(compressedBuffer)],
                            fileName,
                            { type: "video/mp4" }
                        )
                        mediaUrl = await saveFile(compressedFile)

                        if (mediaUrlParam.includes("public.blob.vercel-storage.com")) {
                            try {
                                const { del } = await import("@vercel/blob")
                                await del(mediaUrlParam)
                            } catch (e) {
                                console.error("Failed to delete original blob", e)
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error processing video from URL:", e)
            }
        }
        return { mediaUrl, mediaType }
    }

    const file = formData.get("file") as File | null
    if (file && file.size > 0) {
        if (file.size > 100 * 1024 * 1024) {
            throw new Error("Fișierul este prea mare (maxim 100MB pentru upload, va fi comprimat).")
        }

        if (file.type.startsWith("image/")) {
            if (file.size > 4.5 * 1024 * 1024) throw new Error("Imaginea este prea mare (maxim 4.5MB).")
            mediaType = "IMAGE"
            mediaUrl = await saveFile(file)
        } else if (file.type.startsWith("video/")) {
            mediaType = "VIDEO"
            let fileToUpload = file
            if (file.size > 4.5 * 1024 * 1024) {
                try {
                    const { compressVideo } = await import("@/lib/video")
                    const compressedBuffer = await compressVideo(file)
                    if (compressedBuffer.byteLength > 4.5 * 1024 * 1024) {
                        throw new Error(
                            "Video-ul este prea mare chiar și după compresie. Te rugăm să încarci un video mai scurt."
                        )
                    }
                    fileToUpload = new File([new Uint8Array(compressedBuffer)], file.name, {
                        type: "video/mp4",
                    })
                } catch (e: any) {
                    console.error("Compression failed:", e)
                    throw new Error(`Compresia video a eșuat: ${e.message}`)
                }
            }
            mediaUrl = await saveFile(fileToUpload)
        } else {
            throw new Error("Tipul de fișier nu este suportat.")
        }
    }

    return { mediaUrl, mediaType }
}

export async function createScrisoare(formData: FormData) {
    const session = await requirePartner()

    const rawItems = JSON.parse((formData.get("items") as string) || "[]")
    const items = itemsFromPartnerForm(rawItems)

    const campaignIdRaw = formData.get("campaignId") as string
    const campaignId = campaignIdRaw && campaignIdRaw !== "NONE" ? campaignIdRaw : undefined
    const limit = campaignId ? 1500 : 500

    const actionType = formData.get("actionType") as string
    const moderationStatus =
        actionType === "submit" ? LetterModeration.PENDING_REVIEW : LetterModeration.DRAFT

    const submittedTotal = sumSubmittedEstimates(items)
    if (submittedTotal > limit) {
        return { error: amountExceedsMaxMessage(limit) }
    }
    if (items.length < 1 && actionType === "submit") {
        return { error: "Adaugă cel puțin un obiect solicitat." }
    }

    const { mediaUrl, mediaType } = await resolveMedia(formData)

    const publicCode = `REQ-${Date.now().toString().slice(-6)}`
    const childName = (formData.get("childFirstName") as string).trim()
    const age = (formData.get("childAge") as string).trim()
    const slugBase = `${childName}-${age}-ani`.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const suffix = Math.random().toString(36).substring(2, 6)
    const slug = `${slugBase}-${suffix}`
    const partnerNotes = String(formData.get("partnerNotes") || "").trim() || null

    await prisma.scrisoare.create({
        data: {
            publicCode,
            slug,
            institutionId: session.institutionId,
            campaignId,
            childFirstName: childName,
            childLastName: "P.",
            childAge: Number(age),
            childGender: formData.get("childGender") as string,
            category: formData.get("category") as string,
            childStory: formData.get("childStory") as string,
            originalImgUrl: mediaUrl,
            mediaType,
            wishList: items.map((i) => i.name).join(", "),
            items: serializeWishlistItems(items),
            // Placeholder until admin sets approvedTargetAmount — not shown publicly until approved
            targetAmount: submittedTotal || 1,
            submittedTargetAmount: submittedTotal,
            approvedTargetAmount: null,
            partnerNotes,
            moderationStatus,
            status: "NOU",
        },
    })

    if (actionType === "submit") {
        redirect("/partner?submitted=1")
    }
    redirect("/partner")
}

export async function updateScrisoare(id: string, formData: FormData) {
    const session = await requirePartner()

    const letter = await prisma.scrisoare.findUnique({ where: { id } })
    if (!letter || letter.institutionId !== session.institutionId) {
        throw new Error("Nu aveți permisiunea de a modifica această scrisoare.")
    }
    if (!canPartnerEdit(letter.moderationStatus)) {
        throw new Error("Doar ciornele și scrisorile respinse pot fi editate.")
    }

    const rawItems = JSON.parse((formData.get("items") as string) || "[]")
    const items = itemsFromPartnerForm(rawItems)

    const campaignIdRaw = formData.get("campaignId") as string
    const campaignId = campaignIdRaw && campaignIdRaw !== "NONE" ? campaignIdRaw : null
    const limit = campaignId ? 1500 : 500

    const actionType = formData.get("actionType") as string
    const moderationStatus =
        actionType === "submit" ? LetterModeration.PENDING_REVIEW : LetterModeration.DRAFT

    const submittedTotal = sumSubmittedEstimates(items)
    if (submittedTotal > limit) {
        return { error: amountExceedsMaxMessage(limit) }
    }
    if (items.length < 1 && actionType === "submit") {
        return { error: "Adaugă cel puțin un obiect solicitat." }
    }

    const mediaUrlParam = formData.get("mediaUrl") as string | null
    let mediaUpdate: { originalImgUrl?: string; mediaType?: "IMAGE" | "VIDEO" } = {}
    if (mediaUrlParam || formData.get("file")) {
        const resolved = await resolveMedia(formData)
        mediaUpdate = { originalImgUrl: resolved.mediaUrl, mediaType: resolved.mediaType }
    }

    const partnerNotes = String(formData.get("partnerNotes") || "").trim() || null
    const childName = (formData.get("childFirstName") as string).trim()
    const age = Number(formData.get("childAge"))

    await prisma.scrisoare.update({
        where: { id },
        data: {
            campaignId,
            childFirstName: childName,
            childAge: age,
            childGender: formData.get("childGender") as string,
            category: formData.get("category") as string,
            childStory: formData.get("childStory") as string,
            wishList: items.map((i) => i.name).join(", "),
            items: serializeWishlistItems(items),
            targetAmount: submittedTotal || 1,
            submittedTargetAmount: submittedTotal,
            // Clear previous admin pricing on resubmit — requires fresh review
            approvedTargetAmount: null,
            partnerNotes,
            moderationStatus,
            status: "NOU",
            rejectionReason: moderationStatus === LetterModeration.PENDING_REVIEW ? null : letter.rejectionReason,
            rejectedAt: moderationStatus === LetterModeration.PENDING_REVIEW ? null : letter.rejectedAt,
            rejectedById: moderationStatus === LetterModeration.PENDING_REVIEW ? null : letter.rejectedById,
            ...mediaUpdate,
        },
    })

    revalidatePath("/partner")
    revalidatePath("/admin/scrisori")

    if (actionType === "submit") {
        redirect("/partner?submitted=1")
    }
    redirect(`/partner/scrisori/${id}`)
}

export async function submitScrisoare(id: string) {
    const session = await requirePartner()

    const letter = await prisma.scrisoare.findUnique({ where: { id } })
    if (!letter) throw new Error("Scrisoare inexistentă")

    if (letter.institutionId !== session.institutionId) {
        throw new Error("Nu aveți permisiunea de a modifica această scrisoare.")
    }

    if (!canPartnerEdit(letter.moderationStatus)) {
        throw new Error("Această scrisoare nu poate fi retrimisă spre verificare.")
    }

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: LetterModeration.PENDING_REVIEW,
            approvedTargetAmount: null,
            rejectionReason: null,
            rejectedAt: null,
            rejectedById: null,
            status: "NOU",
        },
    })

    revalidatePath("/partner")
    revalidatePath("/admin/scrisori")
    redirect("/partner?submitted=1")
}
