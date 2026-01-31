import Stripe from 'stripe'

// Fallback to a dummy key to prevent build/runtime crash when env is missing
const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build'

export const stripe = new Stripe(apiKey, {
    apiVersion: '2023-10-16' as any,
    appInfo: {
        name: 'Scrisoarea Mea',
        version: '0.1.0'
    },
    typescript: true,
})
