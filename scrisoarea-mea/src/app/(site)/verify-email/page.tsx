"use client"

import { useActionState, Suspense } from "react"
import { verify } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"

const initialState = {
    error: '',
}

function VerifyForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const [state, formAction, isPending] = useActionState(verify, initialState)

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Verificare Email</h1>
                <p className="text-slate-500 text-sm mt-2">
                    Am trimis un cod de 6 cifre la <span className="font-semibold">{email}</span>.
                    <br />Te rugăm să îl introduci mai jos.
                </p>
            </div>

            <form action={formAction} className="space-y-4">
                <input type="hidden" name="email" value={email} />

                <div className="space-y-2 text-left">
                    <Label htmlFor="code">Cod Verificare</Label>
                    <Input
                        id="code"
                        name="code"
                        placeholder="123456"
                        required
                        maxLength={6}
                        className="text-center tracking-widest text-lg"
                    />
                </div>

                {state?.error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                        {state.error}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Se verifică..." : "Verifică"}
                </Button>
            </form>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-50 px-4 py-12">
            <Suspense fallback={<div className="text-center">Se încarcă...</div>}>
                <VerifyForm />
            </Suspense>
        </main>
    )
}
