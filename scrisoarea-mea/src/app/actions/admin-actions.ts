"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import {
    amountExceedsMaxMessage,
    LetterModeration,
    MAX_APPROVED_TARGET_RON,
    MIN_APPROVED_TARGET_RON,
    validateApproval,
} from "@/lib/letter-moderation"
import {
    parseWishlistItems,
    serializeWishlistItems,
    sumAdminApprovedPrices,
    sumSubmittedEstimates,
    type WishlistItem,
} from "@/lib/letter-items"

async function requireAdmin() {
    const session = await getSession()
    if (session?.role !== "ADMIN") throw new Error("Unauthorized")
    return session
}

function parseItemsFromForm(formData: FormData): WishlistItem[] {
    const raw = formData.get("items") as string
    return parseWishlistItems(raw)
}

function parseApprovedTarget(formData: FormData): number | null {
    const raw = formData.get("approvedTargetAmount")
    if (raw === null || raw === undefined || String(raw).trim() === "") return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
}

export async function saveLetterModeration(id: string, formData: FormData) {
    await requireAdmin()

    const childFirstName = String(formData.get("childFirstName") || "").trim()
    const childAge = Number(formData.get("childAge"))
    const childStory = String(formData.get("childStory") || "").trim()
    const category = String(formData.get("category") || "ALTCEVA")
    const adminNotes = String(formData.get("adminNotes") || "").trim() || null
    const items = parseItemsFromForm(formData)
    let approvedTarget = parseApprovedTarget(formData)

    const adminSum = sumAdminApprovedPrices(items)
    if ((approvedTarget == null || approvedTarget === 0) && adminSum > 0) {
        approvedTarget = Math.min(adminSum, MAX_APPROVED_TARGET_RON)
    }

    if (approvedTarget != null) {
        if (approvedTarget < MIN_APPROVED_TARGET_RON) {
            return { error: `Suma țintă trebuie să fie cel puțin ${MIN_APPROVED_TARGET_RON} lei.` }
        }
        if (approvedTarget > MAX_APPROVED_TARGET_RON) {
            return { error: amountExceedsMaxMessage(MAX_APPROVED_TARGET_RON) }
        }
    }

    await prisma.scrisoare.update({
        where: { id },
        data: {
            childFirstName: childFirstName || undefined,
            childAge: Number.isFinite(childAge) ? childAge : undefined,
            childStory,
            category,
            adminNotes,
            items: serializeWishlistItems(items),
            wishList: items.map((i) => i.name).join(", "),
            submittedTargetAmount: sumSubmittedEstimates(items),
            approvedTargetAmount: approvedTarget,
            ...(approvedTarget != null ? { targetAmount: approvedTarget } : {}),
        },
    })

    revalidatePath(`/admin/scrisori/${id}`)
    revalidatePath("/admin/scrisori")
}

export async function approveScrisoare(id: string, formData?: FormData) {
    const session = await requireAdmin()

    if (formData) {
        const saved = await saveLetterModeration(id, formData)
        if (saved?.error) return saved
    }

    const letter = await prisma.scrisoare.findUnique({ where: { id } })
    if (!letter) throw new Error("Scrisoare inexistentă")

    const items = parseWishlistItems(letter.items)
    const approvedTarget =
        letter.approvedTargetAmount != null ? Number(letter.approvedTargetAmount) : null

    const error = validateApproval({
        childStory: letter.childStory,
        itemsCount: items.length,
        approvedTargetAmount: approvedTarget,
    })
    if (error) return { error }

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: LetterModeration.APPROVED,
            status: "ACTIV",
            targetAmount: approvedTarget!,
            approvedTargetAmount: approvedTarget!,
            approvedAt: new Date(),
            approvedById: session.id,
            rejectionReason: null,
            rejectedAt: null,
            rejectedById: null,
        },
    })

    revalidatePath("/admin/scrisori")
    revalidatePath("/scrisori")
    revalidatePath(`/scrisori/${letter.slug}`)
    redirect("/admin/scrisori?tab=pending_review")
}

export async function rejectScrisoare(id: string, reason: string) {
    const session = await requireAdmin()
    const trimmed = reason?.trim()
    if (!trimmed) throw new Error("Motivul respingerii este obligatoriu.")

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: LetterModeration.REJECTED,
            rejectionReason: trimmed,
            rejectedAt: new Date(),
            rejectedById: session.id,
            status: "NOU",
        },
    })

    revalidatePath("/admin/scrisori")
    redirect("/admin/scrisori?tab=rejected")
}

export async function archiveScrisoare(id: string) {
    await requireAdmin()

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: LetterModeration.ARCHIVED,
        },
    })

    revalidatePath("/admin/scrisori")
    redirect("/admin/scrisori?tab=archived")
}

export async function markLetterFulfilled(id: string) {
    await requireAdmin()

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: LetterModeration.FULFILLED,
            status: "INCHIS",
            proofApproved: true,
        },
    })

    revalidatePath("/admin/scrisori")
    revalidatePath("/impact")
}
