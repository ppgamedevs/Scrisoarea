"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updatePartnerProfile(partnerId: string, formData: FormData) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') throw new Error("Unauthorized")

    const publicName = formData.get('publicName') as string
    const slug = formData.get('slug') as string
    const descriptionPublic = formData.get('descriptionPublic') as string
    const website = formData.get('website') as string
    const logoUrl = formData.get('logoUrl') as string

    await prisma.institution.update({
        where: { id: partnerId },
        data: {
            publicName,
            slug,
            descriptionPublic,
            website,
            logoUrl
        }
    })

    revalidatePath(`/admin/partners/${partnerId}`)
    revalidatePath(`/partener/${slug}`)
}
