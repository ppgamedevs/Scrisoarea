"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Building2 } from "lucide-react"

export default function PartnerLoginPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleLogin(formData: FormData) {
        const emailInput = formData.get('email') as string
        const passwordInput = formData.get('password') as string

        setError(null)

        startTransition(async () => {
            try {
                // Pass 'PARTNER' as the portal
                await login(emailInput, passwordInput, 'PARTNER')
                router.push('/partner')
            } catch (err) {
                console.error(err)
                const message = err instanceof Error ? err.message : "A apărut o eroare la logare."
                if (message.includes("Nu aveti acces")) {
                    setError("Acest cont nu are drepturi de Partener.")
                } else {
                    setError(message)
                }
                toast.error(message)
            }
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Autentificare Partener</h1>
                <p className="text-slate-500 mb-8">Autentificare pentru instituții și asociații partenere.</p>

                <form action={handleLogin} className="space-y-4">
                    <div className="text-left">
                        <label className="text-sm font-medium mb-1 block">Email Instituțional</label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="contact@ong.ro"
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

                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isPending}>
                        {isPending ? "Se verifică..." : "Accesează Portalul"}
                    </Button>

                    <div className="text-center mt-4">
                        <p className="text-xs text-slate-400">
                            Demo: partner@speranta.ro / parola123
                        </p>
                    </div>
                </form>
            </div>
        </main>
    )
}
