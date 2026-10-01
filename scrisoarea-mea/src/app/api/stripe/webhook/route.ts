import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { abandonCheckout, failPendingDonation, syncCheckoutSession } from "@/lib/donations"
import { syncMonthlyCheckout, syncMonthlySubscriptionRecord } from "@/lib/monthly-subscription"
import { getStripe, isStripeConfigured } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
    if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Webhook neconfigurat" }, { status: 500 })
    }

    const signature = request.headers.get("stripe-signature")
    if (!signature) {
        return NextResponse.json({ error: "Lipsește semnătura" }, { status: 400 })
    }

    const payload = await request.text()
    let event: Stripe.Event
    try {
        event = getStripe().webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.error("[stripe] invalid webhook signature", error)
        return NextResponse.json({ error: "Semnătură invalidă" }, { status: 400 })
    }

    try {
        if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
        ) {
            const session = event.data.object as Stripe.Checkout.Session
            if (session.mode === "subscription" || session.metadata?.kind === "monthly_support") {
                await syncMonthlyCheckout(session)
            } else {
                await syncCheckoutSession(session)
            }
        } else if (
            event.type === "customer.subscription.updated" ||
            event.type === "customer.subscription.deleted"
        ) {
            await syncMonthlySubscriptionRecord(event.data.object as Stripe.Subscription)
        } else if (event.type === "checkout.session.expired") {
            const donationId = (event.data.object as Stripe.Checkout.Session).metadata?.donationId
            if (donationId) await abandonCheckout(donationId)
        } else if (event.type === "checkout.session.async_payment_failed") {
            const donationId = (event.data.object as Stripe.Checkout.Session).metadata?.donationId
            if (donationId) await failPendingDonation(donationId)
        }
    } catch (error) {
        console.error("[stripe] webhook handler failed", error)
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
