"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
    const [pending, startTransition] = useTransition()
    const [done, setDone] = useState(false)

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const email = String(new FormData(e.currentTarget).get("email") || "")
            .trim()
            .toLowerCase()

        startTransition(async () => {
            await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            })
            // Always generic — do not reveal account existence
            setDone(true)
            toast.success("Cerere înregistrată")
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--pastel-sage)]/30 px-4 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Ai uitat parola?</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Introdu emailul și îți trimitem un link de resetare.
                    </p>
                </div>

                {done ? (
                    <div className="text-sm text-slate-700 bg-slate-50 border rounded-lg p-4 space-y-3">
                        <p>
                            Dacă există un cont asociat acestei adrese, vei primi un email cu
                            instrucțiuni pentru resetarea parolei.
                        </p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Înapoi la login</Link>
                        </Button>
                    </div>
                ) : (
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
                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? "Se trimite..." : "Trimite linkul de resetare"}
                        </Button>
                    </form>
                )}
            </div>
        </main>
    )
}
