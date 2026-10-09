"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { saveFile } from "@/lib/storage"

const IMAGE_LIMIT = 4.5 * 1024 * 1024
const POSITIONS = [1, 2, 3, 4, 5]

async function requireAdmin() {
    const session = await getSession()
    if (session?.role !== "ADMIN") throw new Error("Unauthorized")
    return session
}

function readText(formData: FormData, key: string) {
    return String(formData.get(key) || "").trim()
}

function readImage(formData: FormData, required: boolean) {
    const file = formData.get("image")
    if (!(file instanceof File) || file.size === 0) {
        if (required) return { error: "Poza este obligatorie." as const }
        return { file: null }
    }
    if (!file.type.startsWith("image/")) {
        return { error: "Încarcă o imagine." as const }
    }
    if (file.size > IMAGE_LIMIT) {
        return { error: "Imaginea este prea mare (maxim 4,5 MB)." as const }
    }
    return { file }
}

function savedImageUrl(url: string) {
    if (!url || url.includes("placehold.co") || url.includes("Error+Saving")) {
        return null
    }
    return url
}

function readPosition(formData: FormData) {
    const position = Number(formData.get("position"))
    if (!POSITIONS.includes(position)) return { error: "Alege o poziție între 1 și 5." as const }
    return { position }
}

function refreshTeamPages() {
    revalidatePath("/despre")
    revalidatePath("/admin/echipa")
}

export async function createTeamMember(formData: FormData) {
    await requireAdmin()
    const name = readText(formData, "name")
    const title = readText(formData, "title")
    if (!name || !title) return { error: "Completează numele și titlul." }

    const image = readImage(formData, true)
    if ("error" in image && image.error) return { error: image.error }
    if (!image.file) return { error: "Poza este obligatorie." }

    const imageUrl = savedImageUrl(await saveFile(image.file))
    if (!imageUrl) return { error: "Poza nu a putut fi salvată." }

    const positionResult = readPosition(formData)
    if ("error" in positionResult) return { error: positionResult.error }
    const position = positionResult.position

    const count = await prisma.teamMember.count()
    if (count >= POSITIONS.length) return { error: "Echipa are deja 5 membri." }

    const occupant = await prisma.teamMember.findFirst({ where: { sortOrder: position } })
    await prisma.$transaction(async (tx) => {
        if (occupant) {
            const used = new Set(
                (await tx.teamMember.findMany({ select: { sortOrder: true } })).map((member) => member.sortOrder)
            )
            const free = POSITIONS.find((slot) => slot !== position && !used.has(slot))
            if (free == null) throw new Error("Nu există o poziție liberă.")
            await tx.teamMember.update({ where: { id: occupant.id }, data: { sortOrder: free } })
        }
        await tx.teamMember.create({
            data: { name, title, imageUrl, sortOrder: position },
        })
    })

    refreshTeamPages()
    return { ok: "created" as const }
}

export async function updateTeamMember(id: string, formData: FormData) {
    await requireAdmin()
    const name = readText(formData, "name")
    const title = readText(formData, "title")
    if (!name || !title) return { error: "Completează numele și titlul." }

    const existing = await prisma.teamMember.findUnique({ where: { id } })
    if (!existing) return { error: "Membrul nu mai există." }

    const image = readImage(formData, false)
    if ("error" in image && image.error) return { error: image.error }

    let imageUrl = existing.imageUrl
    if (image.file) {
        const saved = savedImageUrl(await saveFile(image.file))
        if (!saved) return { error: "Poza nu a putut fi salvată." }
        imageUrl = saved
    }

    const positionResult = readPosition(formData)
    if ("error" in positionResult) return { error: positionResult.error }
    const position = positionResult.position

    const occupant = await prisma.teamMember.findFirst({
        where: { sortOrder: position, NOT: { id } },
    })
    await prisma.$transaction(async (tx) => {
        if (occupant) {
            await tx.teamMember.update({
                where: { id: occupant.id },
                data: { sortOrder: existing.sortOrder },
            })
        }
        await tx.teamMember.update({
            where: { id },
            data: { name, title, imageUrl, sortOrder: position },
        })
    })

    refreshTeamPages()
    return { ok: "updated" as const }
}

export async function deleteTeamMember(id: string) {
    await requireAdmin()
    await prisma.teamMember.delete({ where: { id } })
    refreshTeamPages()
    return { ok: "deleted" as const }
}
