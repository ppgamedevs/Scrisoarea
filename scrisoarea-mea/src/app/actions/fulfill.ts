"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// 1. Create a claim to fulfill the wish (Lock it for 48h)
export async function createFulfillmentClaim(scrisoareId: string, email: string) {
    if (!email || !email.includes('@')) {
        throw new Error("Adresa de email invalidă.")
    }

    // Atomic check: Is it already claimed or fully funded?
    // We capture result here
    const result = await prisma.$transaction(async (tx) => {
        const letter = await tx.scrisoare.findUniqueOrThrow({ where: { id: scrisoareId } })

        // Check active claims
        const activeClaim = await tx.fulfillmentClaim.findFirst({
            where: {
                scrisoareId,
                status: { in: ['PENDING', 'SHIPPED', 'COMPLETED'] },
                // Don't count EXPIRED or CANCELED
                expiresAt: { gt: new Date() } // Should we respect expiration? Yes if pending.
                // Logic: If there is a PENDING claim that is NOT expired, lock it.
                // If there is a SHIPPED/COMPLETED claim, it is permanently locked anyway.
            }
        })

        if (activeClaim) {
            if (['SHIPPED', 'COMPLETED'].includes(activeClaim.status)) {
                throw new Error("Această dorință este deja în curs de îndeplinire.")
            }
            if (activeClaim.status === 'PENDING' && activeClaim.expiresAt > new Date()) {
                throw new Error("Cineva tocmai a preluat această dorință (rezervată temp).")
            }
        }

        if (Number(letter.collectedAmount) >= Number(letter.targetAmount) || ['FINANTAT', 'INCHIS', 'LIVRAT'].includes(letter.status)) {
            throw new Error("Această cerere este deja finanțată.")
        }

        const claim = await tx.fulfillmentClaim.create({
            data: {
                scrisoareId,
                donorEmail: email,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
            }
        })

        return { success: true, claimId: claim.id }
    })

    revalidatePath(`/scrisori/${scrisoareId}`)
    return result
}

// 2. Upload AWB (Confirm shipping)
export async function submitAwb(claimId: string, awbNumber: string, awbProvider: string) {
    if (!awbNumber) throw new Error("Lipseste AWB.")

    await prisma.fulfillmentClaim.update({
        where: { id: claimId },
        data: {
            awbNumber,
            awbProvider,
            status: 'SHIPPED',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
    })

    revalidatePath('/scrisori')
}
