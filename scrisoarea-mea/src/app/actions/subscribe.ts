"use server"

import { SITE_URL } from "@/lib/seo/site"
import { getStripe, isStripeConfigured } from "@/lib/stripe"
import { ensureMonthlyPrice, isMonthlyAmount } from "@/lib/monthly-subscription"

type StartResult = { success: true; url: string } | { success: false; error: string }

export async function startMonthlySubscription(amount: number): Promise<StartResult> {
    if (!isStripeConfigured()) {
        return { success: false, error: "Plățile cu cardul nu sunt disponibile momentan." }
    }
    if (!isMonthlyAmount(amount)) {
        return { success: false, error: "Alege 10, 25 sau 50 lei pe lună." }
    }

    try {
        const priceId = await ensureMonthlyPrice(amount)
        const checkout = await getStripe().checkout.sessions.create({
            mode: "subscription",
            locale: "ro",
            billing_address_collection: "auto",
            phone_number_collection: { enabled: false },
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: {
                kind: "monthly_support",
                amount: String(amount),
            },
            subscription_data: {
                description: "Donație lunară pentru funcționarea Visuri pe hârtie",
                metadata: {
                    kind: "monthly_support",
                    amount: String(amount),
                },
            },
            custom_text: {
                submit: {
                    message: "Abonament lunar, separat de donația pentru o scrisoare. Îl poți opri oricând.",
                },
            },
            success_url: `${SITE_URL}/donatie-lunara/confirmare?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${SITE_URL}/donatie-lunara?suma=${amount}`,
        })

        if (!checkout.url) {
            return { success: false, error: "Abonamentul nu a putut fi inițiat. Încearcă din nou." }
        }
        return { success: true, url: checkout.url }
    } catch (error) {
        console.error("[stripe] monthly subscription failed", error)
        return { success: false, error: "Abonamentul nu a putut fi inițiat. Încearcă din nou." }
    }
}

export async function openMonthlyPortal(formData: FormData) {
    const sessionId = String(formData.get("sessionId") || "")
    if (!sessionId || !isStripeConfigured()) return

    const stripe = getStripe()
    const checkout = await stripe.checkout.sessions.retrieve(sessionId)
    const customerId = typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id
    if (!customerId) return

    const configs = await stripe.billingPortal.configurations.list({ limit: 1, active: true })
    let configuration = configs.data[0]?.id
    if (!configuration) {
        const created = await stripe.billingPortal.configurations.create({
            features: {
                subscription_cancel: { enabled: true, mode: "at_period_end" },
                payment_method_update: { enabled: true },
                invoice_history: { enabled: true },
            },
        })
        configuration = created.id
    }

    const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        configuration,
        return_url: `${SITE_URL}/donatie-lunara`,
    })
    const { redirect } = await import("next/navigation")
    redirect(portal.url)
}
