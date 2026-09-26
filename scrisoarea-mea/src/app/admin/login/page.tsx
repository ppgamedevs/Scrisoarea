"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleLogin(formData: FormData) {
        const emailInput = formData.get('email') as string
        const passwordInput = formData.get('password') as string

        setError(null)

        startTransition(async () => {
            try {
                // Pass 'ADMIN' as the portal
                await login(emailInput, passwordInput, 'ADMIN')
                router.push('/admin')
            } catch (err) {
                console.error(err)
                const message = err instanceof Error ? err.message : "A apărut o eroare la logare."
                if (message.includes("Nu aveti acces")) {
                    setError("Acest cont nu are drepturi de Administrator.")
                } else {
                    setError(message)
                }
                toast.error(message)
            }
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="bg-white p-8 rounded-xl shadow-xl border max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-3 rounded-full">
                        <ShieldCheck className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Autentificare Admin</h1>
                <p className="text-slate-500 mb-8">Acces restricționat.</p>

                <form action={handleLogin} className="space-y-4">
                    <div className="text-left">
                        <label className="text-sm font-medium mb-1 block">Email Admin</label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="admin@example.com"
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

                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isPending}>
                        {isPending ? "Se verifică..." : "Autentificare Admin"}
                    </Button>
                </form>
            </div>
        </main>
    )
}
