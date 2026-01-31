"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/app/actions/auth-actions" // We need a server action wrapper
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async () => {
        setLoading(true)
        try {
            const role = await login(email)
            if (role === 'ADMIN') router.push('/admin')
            else if (role === 'PARTNER') router.push('/partner')
            else router.push('/')
        } catch (e) {
            alert("Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Autentificare (MVP)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-neutral-500">
                        Folosește <strong>admin@scrisoarea.ro</strong> sau <strong>partner@speranta.ro</strong>
                    </p>
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Button onClick={handleLogin} disabled={loading} className="w-full">
                        Intră în cont (Simulare)
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
