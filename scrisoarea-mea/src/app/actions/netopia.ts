"use server"

import prisma from "@/lib/prisma"
import { createNetopiaRequest } from "@/lib/netopia"
import { redirect } from "next/navigation"

export async function initiateNetopiaPayment(formData: FormData) {
    const amount = Number(formData.get('amount'))
    const email = formData.get('email') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const scrisoareId = formData.get('scrisoareId') as string | null
    const isAnonymous = formData.get('isAnonymous') === 'on'

    if (!amount || amount < 1) throw new Error("Suma invalidă")
    if (!email) throw new Error("Email necesar")

    // Create Donation Record
    const donation = await prisma.donation.create({
        data: {
            amount,
            donorEmail: email,
            donorName: isAnonymous ? 'Anonim' : `${firstName} ${lastName}`.trim(),
            isAnonymous,
            status: 'PENDING', // Waiting for Netopia IPN
            scrisoareId: scrisoareId || undefined,
            netopiaStatus: 'NEW'
        }
    })

    // Generate Netopia Request
    try {
        const request = await createNetopiaRequest(
            donation.id, // Use Donation ID as Order ID
            amount,
            email,
            firstName,
            lastName
        )

        // We can't redirect with POST data easily in a server action.
        // We need to return the form data to the client to submit, or submit it via a client component.
        // Returning the data to the client to render a hidden form and auto-submit is the standard way.
        return {
            success: true,
            url: request.url,
            env_key: request.env_key,
            data: request.data
        }

    } catch (e: any) {
        console.error("Netopia Error:", e)
        // If it fails, mark donation as failed or delete?
        // Keep it for debugging or user retry
        return { success: false, error: e.message }
    }
}
