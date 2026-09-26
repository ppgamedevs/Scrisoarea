"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth-client"

export default function DonorRegisterPage() {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [terms, setTerms] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const form = new FormData(e.currentTarget)
        const firstName = String(form.get("firstName") || "").trim()
        const lastName = String(form.get("lastName") || "").trim()
        const email = String(form.get("email") || "")
            .trim()
            .toLowerCase()
        const password = String(form.get("password") || "")
        const confirmPassword = String(form.get("confirmPassword") || "")

        if (!firstName || !lastName) {
            setError("Prenumele și numele sunt obligatorii.")
            return
        }
        if (password.length < 8) {
            setError("Parola trebuie să aibă cel puțin 8 caractere.")
            return
        }
        if (password !== confirmPassword) {
            setError("Parolele nu coincid.")
            return
        }
        if (!terms) {
            setError("Trebuie să accepți Termenii și Politica de Confidențialitate.")
            return
        }

        startTransition(async () => {
            const { error: err } = await authClient.signUp.email({
                email,
                password,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                callbackURL: "/profil",
            })

            if (err) {
                if (err.message?.toLowerCase().includes("exist") || err.status === 422) {
                    setError("Există deja un cont cu acest email.")
                } else if (
                    err.message?.toLowerCase().includes("resend") ||
                    err.message?.toLowerCase().includes("email") ||
                    err.message?.toLowerCase().includes("missing")
                ) {
                    setError(
                        "Contul nu a putut fi finalizat deoarece emailul de confirmare nu a putut fi trimis. Încearcă din nou mai târziu."
                    )
                } else {
                    setError(err.message || "Înregistrarea a eșuat.")
                }
                return
            }

            toast.success("Cont creat. Verifică emailul pentru confirmare.")
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--pastel-sage)]/30 px-4 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Creează cont de donator</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Pentru a dona și a urmări impactul pe care îl creezi.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Prenume</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                autoComplete="given-name"
                                required
                                disabled={pending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Nume</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                autoComplete="family-name"
                                required
                                disabled={pending}
                            />
                        </div>
                    </div>
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
                            autoComplete="new-password"
                            required
                            minLength={8}
                            disabled={pending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmă parola</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            disabled={pending}
                        />
                    </div>

                    <label className="flex items-start gap-3 text-sm text-slate-600">
                        <Checkbox
                            checked={terms}
                            onCheckedChange={(v) => setTerms(v === true)}
                            disabled={pending}
                        />
                        <span>
                            Sunt de acord cu{" "}
                            <Link href="/termeni" className="underline">
                                Termenii și Condițiile
                            </Link>{" "}
                            și{" "}
                            <Link href="/confidentialitate" className="underline">
                                Politica de Confidențialitate
                            </Link>
                            .
                        </span>
                    </label>

                    {error && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={pending || !terms}>
                        {pending ? "Se creează contul..." : "Creează cont"}
                    </Button>
                </form>

                <p className="text-sm text-slate-600">
                    Ai deja cont?{" "}
                    <Link href="/login" className="text-teal-700 font-medium hover:underline">
                        Intră în cont
                    </Link>
                </p>
            </div>
        </main>
    )
}
