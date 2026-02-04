
// Mock implementation using console for MVP since we don't have a real Resend key in dev
// In production, uncomment and use 'resend' package.

// import { Resend } from 'resend'
// const resend = new Resend(process.env.RESEND_API_KEY)

export type EmailTemplate =
    | 'DONATION_SUCCESS'
    | 'MATCHING_APPLIED'
    | 'SCRISOARE_APPROVED'
    | 'SCRISOARE_REJECTED'
    | 'PROOF_REJECTED'
    | 'ADMIN_NEW_PARTNER'
    | 'ADMIN_NEW_SCRISOARE'

interface EmailData {
    to: string
    template: EmailTemplate
    data: any
}

export async function sendEmail({ to, template, data }: EmailData) {
    console.log(`[EMAIL MOCK] Sending ${template} to ${to}`, data)

    // Safety check for test environment
    if (!process.env.RESEND_API_KEY) return

    let subject = ""
    let html = ""

    switch (template) {
        case 'DONATION_SUCCESS':
            subject = "Mulțumim pentru donație - Vise pe hârtie"
            html = `<p>Salut,</p><p>Îți mulțumim pentru donația de ${data.amount} RON pentru ${data.childName}.</p>`
            break
        case 'MATCHING_APPLIED':
            subject = "Veste bună! Donația ta a fost dublată"
            html = `<p>Salut,</p><p>Donația ta pentru ${data.childName} a fost dublată de ${data.sponsorName}.</p>`
            break
        case 'SCRISOARE_APPROVED':
            subject = "Scrisoare Aprobată"
            html = `<p>Scrisoarea pentru ${data.childName} a fost aprobată și este acum publică.</p>`
            break
        case 'SCRISOARE_REJECTED':
            subject = "Scrisoare Respinsă - Necesită modificări"
            html = `<p>Scrisoarea pentru ${data.childName} a fost respinsă. Motiv: ${data.reason}</p>`
            break
        // ... add others
    }

    try {
        // await resend.emails.send({
        //     from: 'Vise pe hârtie <no-reply@scrisoarea-mea.ro>',
        //     to,
        //     subject,
        //     html
        // })
    } catch (e) {
        console.error("Email send failed", e)
    }
}
