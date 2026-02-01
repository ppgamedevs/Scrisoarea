"use server"

import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createUpdate(data: { title: string, body: string, type: string, scrisoareId?: string }) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    await prisma.update.create({
        data: {
            ...data,
            createdBy: session.id || 'ADMIN',
            isPublic: true
        }
    })

    revalidatePath('/update-uri')
    if (data.scrisoareId) revalidatePath(`/scrisori/${data.scrisoareId}`)
}


export async function getUpdates() {
    return prisma.update.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { scrisoare: { include: { institution: true } } }
    })
}
