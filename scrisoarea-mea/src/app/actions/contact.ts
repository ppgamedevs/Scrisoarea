"use server"

import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "contact@scrisoareamea.ro"

export async function submitContactForm(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
        return { ok: false, error: "Toate câmpurile sunt obligatorii." }
    }

    try {
        await prisma.contactSubmission.create({
            data: { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }
        })
    } catch (e) {
        console.error("Contact submission save failed", e)
        return { ok: false, error: "Eroare la salvare. Încercați din nou." }
    }

    try {
        await sendEmail({
            to: CONTACT_EMAIL,
            template: "CONTACT_FORM",
            data: { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }
        })
    } catch (e) {
        console.error("Contact email send failed", e)
        // Submission is saved; email may be retried later
    }

    return { ok: true }
}
