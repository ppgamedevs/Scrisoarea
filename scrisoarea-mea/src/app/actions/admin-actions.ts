"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export async function approveScrisoare(id: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: 'APPROVED',
            status: 'ACTIV' // Make public immediately
        }
    })

    revalidatePath('/admin/scrisori')
    redirect('/admin/scrisori')
}

export async function rejectScrisoare(id: string, reason: string) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    await prisma.scrisoare.update({
        where: { id },
        data: {
            moderationStatus: 'REJECTED',
            rejectionReason: reason
        }
    })

    revalidatePath('/admin/scrisori')
    redirect('/admin/scrisori')
}
