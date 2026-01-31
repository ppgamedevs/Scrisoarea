"use server"

import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

export async function createReservationAndCheckout(scrisoareId: string, amount: number) {
    // Validate basic input
    if (amount < 5) throw new Error("Suma minimă este 5 RON.")

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
        // We update this with session ID later or create it now with temp ID?
        // Better to generate a UUID first or use a temp placeholder.
        // Actually we can create the Checkout Session first? No, we need to hold the lock.
        // If we create Checkout Session in the transaction it takes time (HTTP request), slowing down DB lock.
        // Ideally: Create Reservation (PENDING) -> Return ID -> (Outside Transaction) Create Stripe Session -> Update Reservation.
        // BUT: If step 2 fails, we have a zombie reservation for 20 mins. acceptable for MVP.

        const reservation = await tx.reservation.create({
            data: {
                amount,
                scrisoareId,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 20 * 60 * 1000) // 20 mins lock
            }
        })

        // Create Stripe Session (we do this INSIDE actions normally, but strict DB transaction is better kept short)
        // For MVP simplicy, we'll do it sequentially in this wrapper function, but outside the prisma transaction 
        // to avoid timeout on DB lock if Stripe is slow. 
        // Wait, the block above IS the transaction. So we need to return the reservation and do stripe after.

        return reservation
    }).then(async (reservation) => {
        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'ron',
                        product_data: {
                            name: 'Donatie Scrisoare',
                            description: `Suma rezervata: ${amount} RON`
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
                scrisoareId: scrisoareId
            }
        })

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
