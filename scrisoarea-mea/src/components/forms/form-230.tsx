"use client"

import { useState, useRef } from "react"
import { submitForm230 } from "@/app/actions/tax-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad"
import { validateCNP } from "@/lib/validations/ro-tax"

export default function Form230() {
    const [loading, setLoading] = useState(false)
    const [cnpError, setCnpError] = useState('')
    const sigRef = useRef<SignaturePadRef>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setCnpError('')

        const formData = new FormData(e.currentTarget)
        const cnp = formData.get('cnp') as string

        if (!validateCNP(cnp)) {
            setCnpError('CNP-ul introdus nu este valid.')
            setLoading(false)
            return
        }

        if (sigRef.current?.isEmpty()) {
            alert("Te rugăm să semnezi formularul.")
            setLoading(false)
            return
        }

        // Append signature
        const sigData = sigRef.current?.toDataURL()
        if (sigData) formData.append('signature', sigData)

        try {
            await submitForm230(formData)
        } catch (err: any) {
            if (err.message === 'NEXT_REDIRECT' || err.message?.includes('NEXT_REDIRECT')) return
            alert("Eroare: " + err.message)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nume de familie</Label>
                        <Input name="lastName" required placeholder="Popescu" />
                    </div>
                    <div className="space-y-2">
                        <Label>Prenume</Label>
                        <Input name="firstName" required placeholder="Andrei" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>CNP</Label>
                    <Input name="cnp" required maxLength={13} placeholder="1900101..." className={cnpError ? "border-red-500" : ""} />
                    {cnpError && <p className="text-red-500 text-xs">{cnpError}</p>}
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        🔒 Datele sunt transmise securizat și procesate conform politicii GDPR.
                    </p>
                </div>

                {/* Honeypot */}
                <input type="text" name="_hp" className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" />

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" required placeholder="contact@email.com" />
                </div>

                <div className="space-y-2">
                    <Label>Telefon (Opțional)</Label>
                    <Input name="phone" type="tel" />
                </div>

                <div className="space-y-2">
                    <Label>Adresă de domiciliu</Label>
                    <Input name="county" required placeholder="Județ" className="mb-2" />
                    <Input name="city" required placeholder="Localitate" className="mb-2" />
                    <Input name="address" required placeholder="Strada, Număr, Bloc..." />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Semnătură</Label>
                <SignaturePad ref={sigRef} />
                <p className="text-xs text-slate-500">Semnează în careul de mai sus folosind mouse-ul sau degetul.</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-2">
                    <Checkbox name="consentTerms" required id="terms" />
                    <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sunt de acord cu <a href="/termeni" className="text-indigo-600 underline">Termenii și Condițiile</a> și confirm corectitudinea datelor.
                    </label>
                </div>
                <div className="flex items-start space-x-2">
                    <Checkbox name="consentPrivacy" required id="privacy" />
                    <label htmlFor="privacy" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sunt de acord cu prelucrarea datelor personale (GDPR) în scopul generării și depunerii Formularului 230.
                    </label>
                </div>
            </div>

            <Button type="submit" className="w-full text-lg py-6 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                {loading ? "Se generează..." : "Generează și Depune Cererea"}
            </Button>
        </form>
    )
}
