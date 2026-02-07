"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner" // Assuming sonner is available based on package.json

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleLogin(formData: FormData) {
        const emailInput = formData.get('email') as string
        setError(null)

        startTransition(async () => {
            try {
                const role = await login(emailInput)

                if (role === 'ADMIN') router.push('/admin')
                else if (role === 'PARTNER') router.push('/partner')
                else router.push('/profil')
            } catch (err) {
                console.error(err)
                const message = err instanceof Error ? err.message : "A apărut o eroare la logare."
                setError(message)
                toast.error(message)
            }
        })
    }

    return (
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-2">Accesează Platforma</h1>
                <p className="text-slate-500 mb-8">Introdu adresa de email pentru a te loga ca Donator, Partener sau Administrator.</p>

                <form action={handleLogin} className="space-y-4">
                    <div className="text-left">
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="nume@exemplu.ro"
                            required
                            disabled={isPending}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Se verifică..." : "Trimite Link de Acces (Simulat)"}
                    </Button>
                    <p className="text-xs text-slate-400 mt-4">
                        * În varianta demo, logarea este instantanee pe baza emailului introdus.
                    </p>
                </form>
            </div>
        </main>
    )
}
