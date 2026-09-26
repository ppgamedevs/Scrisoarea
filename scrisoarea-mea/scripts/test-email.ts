/**
 * Dev-only Resend smoke test using the same config as auth emails.
 *
 * Usage:
 *   npm run email:test -- you@example.com
 */
import { Resend } from "resend"

async function main() {
    const to = process.argv[2]?.trim()
    if (!to || !to.includes("@")) {
        console.error("Usage: npm run email:test -- you@example.com")
        process.exit(1)
    }

    const apiKey = process.env.RESEND_API_KEY?.trim()
    const from = process.env.EMAIL_FROM?.trim()

    if (!apiKey) {
        console.error("RESEND_API_KEY is missing. Authentication emails cannot be sent.")
        process.exit(1)
    }
    if (apiKey.length < 20 || !apiKey.startsWith("re_")) {
        console.error(
            "RESEND_API_KEY looks invalid (expected a Resend key starting with re_)."
        )
        process.exit(1)
    }
    if (!from) {
        console.error(
            "EMAIL_FROM is missing. Expected format: Visuri pe hartie <cont@YOUR_VERIFIED_DOMAIN>"
        )
        process.exit(1)
    }
    if (/@(gmail|yahoo|hotmail|outlook)\./i.test(from)) {
        console.error(
            "EMAIL_FROM must use a Resend-verified domain, not Gmail/Yahoo/etc."
        )
        process.exit(1)
    }

    console.log("From:", from)
    console.log("To:", to)
    console.log("RESEND_API_KEY: set (hidden)")

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
        from,
        to,
        subject: "Test email – Visuri pe hartie",
        html: `
          <div style="font-family:system-ui,sans-serif;line-height:1.5">
            <p>Salut,</p>
            <p>Acesta este un email de test pentru configurația Resend folosită de autentificare.</p>
            <p>Dacă îl vezi, Resend acceptă mesajele din acest proiect.</p>
          </div>
        `,
    })

    if (error) {
        console.error("Resend API error:")
        console.error(JSON.stringify(error, null, 2))
        process.exit(1)
    }

    console.log("Email accepted by Resend")
    console.log("Resend message ID:", data?.id || "(none)")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
