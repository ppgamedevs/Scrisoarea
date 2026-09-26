import { Resend } from "resend"

type AuthEmailKind = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "PARTNER_VERIFICATION"

function requireEmailConfig() {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    const from = process.env.EMAIL_FROM?.trim()
    const appUrl =
        process.env.BETTER_AUTH_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim()

    if (!apiKey) {
        const msg = "RESEND_API_KEY is missing. Authentication emails cannot be sent."
        console.error(`[AUTH EMAIL] ${msg}`)
        throw new Error(msg)
    }

    // Resend keys are typically `re_...` and much longer than a placeholder.
    if (apiKey.length < 20 || !apiKey.startsWith("re_")) {
        const msg =
            "RESEND_API_KEY looks invalid (expected a Resend key starting with re_). Authentication emails cannot be sent."
        console.error(`[AUTH EMAIL] ${msg}`)
        throw new Error(msg)
    }

    if (!from) {
        const msg =
            "EMAIL_FROM is missing. Set it to: Visuri pe hartie <cont@YOUR_VERIFIED_DOMAIN>"
        console.error(`[AUTH EMAIL] ${msg}`)
        throw new Error(msg)
    }

    if (/@(gmail|yahoo|hotmail|outlook)\./i.test(from)) {
        const msg =
            "EMAIL_FROM must use a Resend-verified domain, not a consumer mailbox (Gmail/Yahoo/etc)."
        console.error(`[AUTH EMAIL] ${msg}`)
        throw new Error(msg)
    }

    if (!appUrl) {
        console.warn(
            "[AUTH EMAIL] NEXT_PUBLIC_APP_URL / BETTER_AUTH_URL is missing; verification links may be wrong."
        )
    }

    if (!process.env.BETTER_AUTH_SECRET?.trim()) {
        console.warn("[AUTH EMAIL] BETTER_AUTH_SECRET is missing.")
    }

    return { apiKey, from }
}

function getResendClient() {
    const { apiKey } = requireEmailConfig()
    return new Resend(apiKey)
}

function buttonHtml(url: string, label: string) {
    return `<p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${label}</a></p>`
}

function fallbackLinkHtml(url: string) {
    return `<p style="color:#64748b;font-size:13px;word-break:break-all">Dacă butonul nu funcționează, copiază acest link în browser:<br/><a href="${url}">${url}</a></p>`
}

async function sendViaResend({
    to,
    subject,
    html,
    kind,
}: {
    to: string
    subject: string
    html: string
    kind: AuthEmailKind | string
}) {
    const { from } = requireEmailConfig()
    const resend = getResendClient()

    if (process.env.NODE_ENV !== "production") {
        console.log(`[AUTH EMAIL] Sending ${kind} to ${to}`)
    }

    const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
    })

    if (error) {
        console.error(`[AUTH EMAIL] Resend rejected ${kind} for ${to}:`, error)
        throw new Error(
            typeof error === "object" && error && "message" in error
                ? String((error as { message: string }).message)
                : `Resend failed to send ${kind}`
        )
    }

    if (process.env.NODE_ENV !== "production") {
        console.log(`[AUTH EMAIL] Accepted by Resend`, {
            id: data?.id,
            to,
            kind,
        })
    }

    return data
}

/**
 * Donor / generic email verification — uses Better Auth verification URL as-is.
 */
export async function sendVerificationEmail({
    to,
    url,
    name,
}: {
    to: string
    url: string
    name?: string
}) {
    if (process.env.NODE_ENV !== "production") {
        console.log("[AUTH EMAIL] Verification requested")
    }

    const greeting = name ? `Salut, ${name},` : "Salut,"
    const subject = "Confirmă adresa de email – Visuri pe hartie"
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">
        <p>${greeting}</p>
        <p>Pentru a activa contul tău Visuri pe hartie, confirmă adresa de email folosind butonul de mai jos.</p>
        ${buttonHtml(url, "Confirmă adresa de email")}
        ${fallbackLinkHtml(url)}
        <p style="color:#64748b;font-size:14px">Linkul expiră în curând. Dacă nu ai creat acest cont, ignoră acest mesaj.</p>
      </div>`

    return sendViaResend({ to, subject, html, kind: "EMAIL_VERIFICATION" })
}

/**
 * Partner institution email verification.
 */
export async function sendPartnerVerificationEmail({
    to,
    url,
    name,
}: {
    to: string
    url: string
    name?: string
}) {
    if (process.env.NODE_ENV !== "production") {
        console.log("[AUTH EMAIL] Partner verification requested")
    }

    const greeting = name ? `Salut, ${name},` : "Salut,"
    const subject = "Confirmă contul instituției – Visuri pe hartie"
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">
        <p>${greeting}</p>
        <p>Confirmă adresa de email a contului instituției pentru Portal Instituții.</p>
        <p><strong>Important:</strong> confirmarea emailului nu înseamnă aprobarea instituției.
        După verificare, echipa Visuri pe hartie va analiza datele organizației înainte ca aceasta să poată publica scrisori.</p>
        ${buttonHtml(url, "Confirmă adresa de email")}
        ${fallbackLinkHtml(url)}
        <p style="color:#64748b;font-size:14px">Linkul expiră în curând.</p>
      </div>`

    return sendViaResend({ to, subject, html, kind: "PARTNER_VERIFICATION" })
}

/**
 * Password reset — uses Better Auth reset URL as-is.
 */
export async function sendPasswordResetEmail({
    to,
    url,
    name,
}: {
    to: string
    url: string
    name?: string
}) {
    if (process.env.NODE_ENV !== "production") {
        console.log("[AUTH EMAIL] Password reset requested")
    }

    const greeting = name ? `Salut, ${name},` : "Salut,"
    const subject = "Resetează parola – Visuri pe hartie"
    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a;max-width:560px">
        <p>${greeting}</p>
        <p>Ai solicitat resetarea parolei. Apasă butonul de mai jos pentru a alege o parolă nouă.</p>
        ${buttonHtml(url, "Resetează parola")}
        ${fallbackLinkHtml(url)}
        <p style="color:#64748b;font-size:14px">Dacă nu ai cerut resetarea, ignoră acest email. Linkul este valabil o perioadă limitată.</p>
      </div>`

    return sendViaResend({ to, subject, html, kind: "PASSWORD_RESET" })
}

/** @deprecated Use sendVerificationEmail / sendPasswordResetEmail */
export async function sendAuthEmail({
    to,
    kind,
    url,
    name,
}: {
    to: string
    kind: "DONOR_VERIFY" | "PARTNER_VERIFY" | "PASSWORD_RESET"
    url: string
    name?: string
}) {
    if (kind === "PASSWORD_RESET") {
        return sendPasswordResetEmail({ to, url, name })
    }
    if (kind === "PARTNER_VERIFY") {
        return sendPartnerVerificationEmail({ to, url, name })
    }
    return sendVerificationEmail({ to, url, name })
}

export type EmailTemplate =
    | "DONATION_SUCCESS"
    | "MATCHING_APPLIED"
    | "SCRISOARE_APPROVED"
    | "SCRISOARE_REJECTED"
    | "PROOF_REJECTED"
    | "ADMIN_NEW_PARTNER"
    | "ADMIN_NEW_SCRISOARE"
    | "CONTACT_FORM"
    | "DONATION_CONFIRMATION"

interface EmailData {
    to: string
    template: EmailTemplate
    data: Record<string, unknown>
}

export async function sendEmail({ to, template, data }: EmailData) {
    let subject = ""
    let html = ""

    switch (template) {
        case "DONATION_CONFIRMATION":
            subject = "Confirmare donație - Visuri pe hartie"
            html = `
                <div style="font-family: sans-serif;">
                    <h2>Mulțumim pentru donație!</h2>
                    <p>Detaliile tranzacției tale:</p>
                    <ul>
                        <li><strong>Sumă:</strong> ${data.amount} RON</li>
                        <li><strong>Data:</strong> ${data.date}</li>
                        <li><strong>Număr tranzacție:</strong> ${data.transactionId}</li>
                    </ul>
                    <p>Îți mulțumim că ești alături de noi!</p>
                </div>
            `
            break
        case "DONATION_SUCCESS":
            subject = "Mulțumim pentru donație - Visuri pe hartie"
            html = `<p>Salut,</p><p>Îți mulțumim pentru donația de ${data.amount} RON pentru ${data.childName}.</p>`
            break
        case "MATCHING_APPLIED":
            subject = "Veste bună! Donația ta a fost dublată"
            html = `<p>Salut,</p><p>Donația ta pentru ${data.childName} a fost dublată de ${data.sponsorName}.</p>`
            break
        case "SCRISOARE_APPROVED":
            subject = "Scrisoare Aprobată"
            html = `<p>Scrisoarea pentru ${data.childName} a fost aprobată și este acum publică.</p>`
            break
        case "SCRISOARE_REJECTED":
            subject = "Scrisoare Respinsă - Necesită modificări"
            html = `<p>Scrisoarea pentru ${data.childName} a fost respinsă. Motiv: ${data.reason}</p>`
            break
        case "CONTACT_FORM":
            subject = `[Contact] ${data.subject}`
            html = `<p><strong>De la:</strong> ${data.name} &lt;${data.email}&gt;</p><p><strong>Subiect:</strong> ${data.subject}</p><p><strong>Mesaj:</strong></p><p>${String(data.message || "").replace(/\n/g, "<br>")}</p>`
            break
        case "ADMIN_NEW_PARTNER":
            subject = "Instituție nouă de verificat"
            html = `<p>O instituție nouă așteaptă aprobare: <strong>${data.name}</strong> (${data.email}).</p>`
            break
        default:
            return
    }

    if (!subject || !html) return

    await sendViaResend({ to, subject, html, kind: template })
}
