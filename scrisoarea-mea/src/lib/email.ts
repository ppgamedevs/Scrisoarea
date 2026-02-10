import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.EMAIL_FROM || "Vise pe hârtie <onboarding@resend.dev>"

export type EmailTemplate =
    | 'DONATION_SUCCESS'
    | 'MATCHING_APPLIED'
    | 'SCRISOARE_APPROVED'
    | 'SCRISOARE_REJECTED'
    | 'PROOF_REJECTED'
    | 'ADMIN_NEW_PARTNER'
    | 'ADMIN_NEW_SCRISOARE'
    | 'CONTACT_FORM'
    | 'VERIFICATION_CODE'

interface EmailData {
    to: string
    template: EmailTemplate
    data: any
}

export async function sendEmail({ to, template, data }: EmailData) {
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
        case 'CONTACT_FORM':
            subject = `[Contact] ${data.subject}`
            html = `<p><strong>De la:</strong> ${data.name} &lt;${data.email}&gt;</p><p><strong>Subiect:</strong> ${data.subject}</p><p><strong>Mesaj:</strong></p><p>${(data.message || '').replace(/\n/g, '<br>')}</p>`
            break
        case 'VERIFICATION_CODE':
            subject = "Codul tău de verificare - Scrisoarea Mea"
            html = `<p>Salut,</p><p>Codul tău de verificare este: <strong>${data.code}</strong></p><p>Introdu acest cod în pagina de înregistrare pentru a confirma contul.</p>`
            break
    }

    if (!subject || !html) return

    if (resend) {
        try {
            await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
        } catch (e) {
            console.error("Email send failed", e)
            throw e
        }
    } else {
        console.log(`[EMAIL] No RESEND_API_KEY; would send ${template} to ${to}:`, subject)
    }
}
