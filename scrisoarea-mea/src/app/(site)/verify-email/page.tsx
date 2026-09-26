"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

function maskEmail(email: string) {
    const [user, domain] = email.split("@")
    if (!user || !domain) return email
    const visible = user.slice(0, 2)
    return `${visible}${"*".repeat(Math.max(2, user.length - 2))}@${domain}`
}

function VerifyEmailInner() {
    const params = useSearchParams()
    const email = params.get("email") || ""
    const portal = params.get("portal")
    const error = params.get("error")
    const [pending, startTransition] = useTransition()
    const lastSentAt = useRef(0)
    const loginHref = portal === "partner" ? "/partner/login" : "/login"
    const callbackURL = portal === "partner" ? "/partner/pending-approval" : "/profil"

    function resend() {
        if (!email) {
            toast.error("Email lipsă. Revino la înregistrare.")
            return
        }

        const now = Date.now()
        if (now - lastSentAt.current < 30_000) {
            toast.error("Așteaptă 30 de secunde înainte de a retrimite emailul.")
            return
        }

        startTransition(async () => {
            const { error: err } = await authClient.sendVerificationEmail({
                email,
                callbackURL,
            })
            if (err) {
                toast.error(err.message || "Nu am putut retrimite emailul.")
                return
            }
            lastSentAt.current = Date.now()
            toast.success("Email de confirmare retrimis.")
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--pastel-sage)]/30 px-4 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-lg w-full space-y-5 text-center">
                <h1 className="text-2xl font-bold">Verifică adresa de email</h1>
                <p className="text-slate-600">
                    Ți-am trimis un email de confirmare. Accesează linkul din email pentru a-ți
                    activa contul.
                </p>
                {email && (
                    <p className="text-sm text-slate-500">
                        Trimis către <strong>{maskEmail(email)}</strong>
                    </p>
                )}

                {error === "expired" && (
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        Linkul de confirmare a expirat. Solicită unul nou mai jos.
                    </p>
                )}
                {error === "invalid" && (
                    <p className="text-sm text-red-800 bg-red-50 border border-red-100 rounded-lg p-3">
                        Link invalid. Solicită un email nou de confirmare.
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    <Button onClick={resend} disabled={pending || !email}>
                        {pending ? "Se trimite..." : "Retrimite emailul"}
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={loginHref}>Înapoi la autentificare</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Se încarcă...</div>}>
            <VerifyEmailInner />
        </Suspense>
    )
}
