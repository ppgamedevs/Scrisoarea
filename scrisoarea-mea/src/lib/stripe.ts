import Stripe from "stripe"

let client: Stripe | null = null

export function isStripeConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
        throw new Error("STRIPE_SECRET_KEY lipsește")
    }
    if (!client) {
        client = new Stripe(key, { typescript: true })
    }
    return client
}
