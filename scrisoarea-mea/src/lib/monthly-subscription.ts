import type Stripe from "stripe"
import prisma from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { isMonthlyAmount, type MonthlyAmount } from "@/lib/monthly-amounts"

export { MONTHLY_AMOUNTS, isMonthlyAmount } from "@/lib/monthly-amounts"
export type { MonthlyAmount } from "@/lib/monthly-amounts"

function priceLookupKey(amount: MonthlyAmount) {
    return `visuri_monthly_${amount}`
}

export async function ensureMonthlyPrice(amount: MonthlyAmount) {
    const stripe = getStripe()
    const lookupKey = priceLookupKey(amount)
    const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
    const found = existing.data[0]
    if (found) return found.id

    const created = await stripe.prices.create({
        currency: "ron",
        unit_amount: amount * 100,
        recurring: { interval: "month" },
        lookup_key: lookupKey,
        transfer_lookup_key: true,
        nickname: `${amount} lei / lună`,
        product_data: {
            name: "Donație lunară — Visuri pe hârtie",
        },
    })
    return created.id
}

function subscriptionIdOf(session: Stripe.Checkout.Session) {
    if (typeof session.subscription === "string") return session.subscription
    return session.subscription?.id ?? null
}

function customerIdOf(session: Stripe.Checkout.Session) {
    if (typeof session.customer === "string") return session.customer
    return session.customer?.id ?? null
}

function mapSubscriptionStatus(status: string | null | undefined, paid: boolean) {
    if (status === "active" || status === "trialing" || (paid && !status)) return "ACTIVE"
    if (status === "past_due" || status === "unpaid") return "PAST_DUE"
    if (status === "canceled") return "CANCELED"
    if (paid) return "ACTIVE"
    return "INCOMPLETE"
}

export async function syncMonthlyCheckout(session: Stripe.Checkout.Session) {
    if (session.mode !== "subscription" && session.metadata?.kind !== "monthly_support") return null

    const stripeSubscriptionId = subscriptionIdOf(session)
    let subscriptionStatus: string | null = null
    let amount = Number(session.metadata?.amount || 0)
    if (stripeSubscriptionId) {
        const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId)
        subscriptionStatus = subscription.status
        const unit = subscription.items.data[0]?.price.unit_amount
        if (unit) amount = unit / 100
    }
    if (!amount && session.amount_total) amount = session.amount_total / 100
    if (!isMonthlyAmount(amount)) return null

    const paid = session.payment_status === "paid" || session.status === "complete"
    const data = {
        stripeCustomerId: customerIdOf(session),
        stripeSubscriptionId,
        amount,
        currency: "RON",
        donorEmail: session.customer_details?.email || session.customer_email || "",
        status: mapSubscriptionStatus(subscriptionStatus, paid),
    }

    return prisma.monthlySubscription.upsert({
        where: { stripeSessionId: session.id },
        create: { ...data, stripeSessionId: session.id },
        update: data,
    })
}

export async function syncMonthlySubscriptionRecord(subscription: Stripe.Subscription) {
    if (subscription.metadata?.kind !== "monthly_support") return null
    const unit = subscription.items.data[0]?.price.unit_amount
    const amount = unit ? unit / 100 : Number(subscription.metadata.amount || 0)
    const status = mapSubscriptionStatus(subscription.status, subscription.status === "active")
    const existing = await prisma.monthlySubscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
    })
    if (!existing) {
        if (!isMonthlyAmount(amount)) return null
        return prisma.monthlySubscription.create({
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
                amount,
                currency: "RON",
                status,
            },
        })
    }
    return prisma.monthlySubscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status },
    })
}
