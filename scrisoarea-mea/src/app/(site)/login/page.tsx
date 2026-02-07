"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/app/actions/auth-actions"
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
        const passwordInput = formData.get('password') as string
        setError(null)

        startTransition(async () => {
            try {
                const role = await login(emailInput, passwordInput, 'DONOR')

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
                <h1 className="text-2xl font-bold mb-2">Autentificare Donator</h1>
                <p className="text-slate-500 mb-8">Intră în cont pentru a susține cauzele preferate.</p>

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

                    <div className="text-left">
                        <label className="text-sm font-medium mb-1 block">Parola</label>
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
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
                        {isPending ? "Se verifică..." : "Autentificare"}
                    </Button>
                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-400 mb-2">
                            Demo: donator / parola123
                        </p>
                        <p className="text-sm text-slate-600">
                            Nu ai cont? <a href="/register" className="text-blue-600 font-medium hover:underline">Înregistrează-te</a>
                        </p>
                    </div>
                    <div className="border-t pt-4 mt-6">
                        <p className="text-xs text-slate-500 mb-2">Ești reprezentant ONG sau Instituție?</p>
                        <a href="/partner/login" className="block w-full py-2 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200">
                            Accesează Portalul Partenerilor
                        </a>
                    </div>
                </form>
            </div>
        </main>
    )
}
