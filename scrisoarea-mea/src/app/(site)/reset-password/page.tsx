"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

function ResetPasswordInner() {
    const params = useSearchParams()
    const token = params.get("token") || ""
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        const form = new FormData(e.currentTarget)
        const password = String(form.get("password") || "")
        const confirmPassword = String(form.get("confirmPassword") || "")

        if (password.length < 8) {
            setError("Parola trebuie să aibă cel puțin 8 caractere.")
            return
        }
        if (password !== confirmPassword) {
            setError("Parolele nu coincid.")
            return
        }
        if (!token) {
            setError("Link invalid sau expirat.")
            return
        }

        startTransition(async () => {
            const { error: err } = await authClient.resetPassword({
                newPassword: password,
                token,
            })
            if (err) {
                setError(err.message || "Link invalid sau expirat.")
                return
            }
            toast.success("Parola a fost actualizată.")
            router.push("/login")
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--pastel-sage)]/30 px-4 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Parolă nouă</h1>
                    <p className="text-sm text-slate-500 mt-1">Alege o parolă nouă pentru contul tău.</p>
                </div>

                {!token ? (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-4 space-y-3">
                        <p>Link invalid sau expirat.</p>
                        <Button asChild variant="outline">
                            <Link href="/forgot-password">Solicită un link nou</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Parolă nouă</Label>
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
                            <Label htmlFor="confirmPassword">Confirmă parola nouă</Label>
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
                        {error && (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? "Se salvează..." : "Salvează parola"}
                        </Button>
                    </form>
                )}
            </div>
        </main>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Se încarcă...</div>}>
            <ResetPasswordInner />
        </Suspense>
    )
}
