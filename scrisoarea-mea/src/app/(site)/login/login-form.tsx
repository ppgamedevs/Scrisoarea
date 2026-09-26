"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function DonorLoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get("returnTo")
    const [pending, startTransition] = useTransition()
    const [resendPending, setResendPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [needsVerification, setNeedsVerification] = useState(false)
    const [email, setEmail] = useState("")
    const lastResendAt = useRef(0)

    function safeReturn(path: string | null) {
        if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
            return "/profil"
        }
        return path
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setNeedsVerification(false)
        const form = new FormData(e.currentTarget)
        const emailValue = String(form.get("email") || "")
            .trim()
            .toLowerCase()
        const password = String(form.get("password") || "")
        setEmail(emailValue)

        startTransition(async () => {
            const { error: err } = await authClient.signIn.email({
                email: emailValue,
                password,
                callbackURL: safeReturn(returnTo),
            })

            if (err) {
                if (err.status === 403 || err.message?.toLowerCase().includes("verif")) {
                    setNeedsVerification(true)
                    setError(
                        "Adresa de email nu este confirmată. Verifică emailul pentru a activa contul."
                    )
                } else {
                    setError("Email sau parolă incorectă.")
                }
                return
            }

            toast.success("Autentificare reușită")
            router.push(safeReturn(returnTo))
            router.refresh()
        })
    }

    async function resend() {
        if (!email) return
        const now = Date.now()
        if (now - lastResendAt.current < 30_000) {
            toast.error("Așteaptă 30 de secunde înainte de a retrimite emailul.")
            return
        }
        setResendPending(true)
        try {
            const { error: err } = await authClient.sendVerificationEmail({
                email,
                callbackURL: "/profil",
            })
            if (err) {
                toast.error(err.message || "Nu am putut retrimite emailul.")
                return
            }
            lastResendAt.current = Date.now()
            toast.success("Email de confirmare retrimis.")
        } finally {
            setResendPending(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--pastel-sage)]/30 px-4 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Intră în cont</h1>
                    <p className="text-slate-500 text-sm mt-1">Cont donator / sponsor</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            disabled={pending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Parolă</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            minLength={8}
                            disabled={pending}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 space-y-2">
                            <p>{error}</p>
                            {needsVerification && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={resend}
                                    disabled={resendPending}
                                >
                                    {resendPending ? "Se trimite..." : "Retrimite emailul de confirmare"}
                                </Button>
                            )}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "Se autentifică..." : "Intră în cont"}
                    </Button>
                </form>

                <div className="text-sm text-slate-600 space-y-2">
                    <p>
                        <Link href="/forgot-password" className="text-teal-700 hover:underline">
                            Ai uitat parola?
                        </Link>
                    </p>
                    <p>
                        Nu ai cont?{" "}
                        <Link href="/register" className="text-teal-700 font-medium hover:underline">
                            Creează unul
                        </Link>
                    </p>
                    <p className="pt-2 border-t">
                        Ești instituție?{" "}
                        <Link href="/partner/login" className="text-slate-800 hover:underline">
                            Portal Instituții
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
