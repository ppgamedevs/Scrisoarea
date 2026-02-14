"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function registerSponsor(formData: FormData) {
    const session = await getSession()
    if (!session) throw new Error("Trebuie să fii autentificat.")

    const companyName = formData.get("companyName") as string
    const cui = formData.get("cui") as string
    const address = formData.get("address") as string
    const website = formData.get("website") as string
    const terms = formData.get("terms") === "on"

    if (!companyName || !cui || !address) {
        throw new Error("Toate câmpurile obligatorii trebuie completate.")
    }

    if (!terms) {
        throw new Error("Trebuie să accepți termenii și condițiile.")
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update User Role
            await tx.user.update({
                where: { id: session.id },
                data: { role: UserRole.SPONSOR }
            })

            // 2. Create Sponsor Profile
            // Upsert in case they retry
            await tx.sponsorProfile.upsert({
                where: { userId: session.id },
                create: {
                    userId: session.id,
                    companyName,
                    cui,
                    billingAddress: address,
                    website
                },
                update: {
                    companyName,
                    cui,
                    billingAddress: address,
                    website
                }
            })
        })
    } catch (e: any) {
        console.error("Sponsor Registration Error:", e)
        throw new Error("A apărut o eroare la salvarea datelor. Te rugăm să încerci din nou.")
    }

    revalidatePath("/", "layout")
    redirect("/sponsor/dashboard?welcome=true")
}
