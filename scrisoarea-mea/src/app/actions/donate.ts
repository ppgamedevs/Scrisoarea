"use server"

import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth"

export async function createReservationAndCheckout(scrisoareId: string, amount: number) {
    // Validate basic input
    if (amount < 5) throw new Error("Suma minimă este 5 RON.")

    const userSession = await getSession()
    let sessionUrl = ''

    // Transaction: Check availability -> Lock funds -> Create Intent
    await prisma.$transaction(async (tx) => {
        const letter = await tx.scrisoare.findUniqueOrThrow({ where: { id: scrisoareId } })

        // Calculate REAL remaining (Target - Paid - Pending Reservations)
        const activeReservations = await tx.reservation.findMany({
            where: {
                scrisoareId,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            }
        })

        const reservedTotal = activeReservations.reduce((acc, r) => acc + Number(r.amount), 0)
        const currentPaid = Number(letter.collectedAmount)
        const target = Number(letter.targetAmount)

        const remaining = target - (currentPaid + reservedTotal)

        // Check if overfunding
        // We allow a small epsilon for floating point, but strict is better.
        if (amount > remaining) {
            throw new Error(`Suma depășește necesarul rămas (${remaining} RON).`)
        }

        // Create Metadata Reservation
        const reservation = await tx.reservation.create({
            data: {
                amount,
                scrisoareId,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 20 * 60 * 1000) // 20 mins lock
            }
        })

        return reservation
    }).then(async (reservation) => {
        // 2. Create Stripe Checkout Session
        const sessionPayload: any = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'ron',
                        product_data: {
                            name: `Donație: Dorința #${scrisoareId.substring(0, 8)}`,
                            description: `Suma rezervată: ${amount} RON. Mulțumim!`
                        },
                        unit_amount: Math.round(amount * 100), // bani
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donatie/success?reservationId=${reservation.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/donatie/cancel?reservationId=${reservation.id}`,
            metadata: {
                reservationId: reservation.id,
                scrisoareId: scrisoareId,
                userId: userSession?.id || null
            }
        }

        // Prefill email if logged in
        if (userSession?.email) {
            sessionPayload.customer_email = userSession.email
        }

        const session = await stripe.checkout.sessions.create(sessionPayload)

        // 3. Update Reservation with Session ID
        await prisma.reservation.update({
            where: { id: reservation.id },
            data: { stripeSessionId: session.id }
        })

        sessionUrl = session.url!
    })

    // Redirect user
    if (sessionUrl) {
        redirect(sessionUrl)
    }
}
