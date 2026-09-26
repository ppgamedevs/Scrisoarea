"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

function AccessDeniedMessage() {
    return (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
            Acces interzis. Acest cont nu are drepturi de administrator.
        </div>
    )
}

function AdminLoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(
        searchParams.get("error") === "AccessDenied"
            ? "Acces interzis. Acest cont nu are drepturi de administrator."
            : null
    )
    const [accessDenied, setAccessDenied] = useState(
        searchParams.get("error") === "AccessDenied"
    )

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setAccessDenied(false)
        const form = new FormData(e.currentTarget)
        const email = String(form.get("email") || "")
            .trim()
            .toLowerCase()
        const password = String(form.get("password") || "")

        startTransition(async () => {
            const { error: err } = await authClient.signIn.email({
                email,
                password,
                callbackURL: "/admin",
            })

            if (err) {
                if (err.status === 403 || err.message?.toLowerCase().includes("verif")) {
                    setError(
                        "Adresa de email nu este confirmată. Verifică emailul pentru a activa contul."
                    )
                } else {
                    setError("Email sau parolă incorectă.")
                }
                return
            }

            const sessionRes = await authClient.getSession()
            const role = sessionRes.data?.user?.role

            if (role !== "ADMIN") {
                await authClient.signOut()
                setAccessDenied(true)
                setError("Acces interzis. Acest cont nu are drepturi de administrator.")
                return
            }

            toast.success("Autentificare reușită")
            router.push("/admin")
            router.refresh()
        })
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Autentificare Admin</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Acces restricționat pentru administratori.
                    </p>
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

                    {(error || accessDenied) &&
                        (accessDenied ? (
                            <AccessDeniedMessage />
                        ) : (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
                                {error}
                            </div>
                        ))}

                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "Se autentifică..." : "Intră în panoul admin"}
                    </Button>
                </form>
            </div>
        </main>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full text-slate-500 text-sm">
                        Se încarcă...
                    </div>
                </main>
            }
        >
            <AdminLoginForm />
        </Suspense>
    )
}
