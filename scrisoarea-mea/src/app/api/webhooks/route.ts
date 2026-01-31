import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const body = await req.text()
    // Manual header parsing because Next.js headers() is read-only sometimes? 
    // Standard way in Route Handlers:
    const signature = req.headers.get('stripe-signature') as string

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const session = event.data.object as any

    if (event.type === 'checkout.session.completed') {
        const reservationId = session.metadata?.reservationId
        const scrisoareId = session.metadata?.scrisoareId

        if (!reservationId || !scrisoareId) {
            return new NextResponse('Missing metadata', { status: 400 })
        }

        // Atomic Update: Mark Reserved -> Sold (Donation)
        await prisma.$transaction(async (tx) => {
            // 1. Find Reservation
            const reservation = await tx.reservation.findUnique({
                where: { id: reservationId }
            })

            // Idempotency: If already CONSUMED or missing, ignore
            if (!reservation || reservation.status === 'CONSUMED') {
                return
            }

            // 2. Mark Reservation Consumed
            await tx.reservation.update({
                where: { id: reservationId },
                data: { status: 'CONSUMED' }
            })

            // 3. Create Donation
            await tx.donation.create({
                data: {
                    scrisoareId,
                    amount: reservation.amount,
                    stripeSessionId: session.id,
                    stripePaymentIntentId: session.payment_intent as string,
                    donorEmail: session.customer_details?.email || 'anonim@scrisoarea.ro',
                    donorName: session.customer_details?.name,
                    status: 'SUCCEEDED'
                }
            })

            // 4. Update Letter Stats
            // We increment collectedAmount directly. 
            // Note: Prisma decimal math might need converting.
            const letter = await tx.scrisoare.findUniqueOrThrow({ where: { id: scrisoareId } })
            const newCollected = Number(letter.collectedAmount) + Number(reservation.amount)
            const target = Number(letter.targetAmount)

            let newStatus = letter.status
            if (newCollected >= target) {
                newStatus = 'FINANTAT'
            }

            await tx.scrisoare.update({
                where: { id: scrisoareId },
                data: {
                    collectedAmount: newCollected,
                    status: newStatus
                }
            })
        })
    }

    return new NextResponse(null, { status: 200 })
}
