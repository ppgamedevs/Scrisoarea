"use client"

import { useActionState } from "react"
import { register } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const initialState = {
    error: '',
}

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, initialState)

    return (
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Înregistrare Donator</h1>
                    <p className="text-slate-500 text-sm mt-2">Creează un cont pentru a urmări donațiile tale.</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Prenume</Label>
                            <Input id="firstName" name="firstName" placeholder="Ion" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Nume</Label>
                            <Input id="lastName" name="lastName" placeholder="Popescu" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="ion@exemplu.ro" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Parolă</Label>
                        <Input id="password" name="password" type="password" required minLength={6} placeholder="******" />
                        <p className="text-xs text-slate-400">Minim 6 caractere.</p>
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                            {state.error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Se creează contul..." : "Creează Cont"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    Ai deja cont? <Link href="/login" className="text-blue-600 hover:underline font-medium">Autentifică-te</Link>
                </div>
            </div>
        </main>
    )
}
