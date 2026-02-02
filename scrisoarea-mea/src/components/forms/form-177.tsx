"use client"

import { useState, useRef } from "react"
import { submitForm177 } from "@/app/actions/tax-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad"
import { validateCUI } from "@/lib/validations/ro-tax"

export default function Form177() {
    const [loading, setLoading] = useState(false)
    const [cuiError, setCuiError] = useState('')
    const sigRef = useRef<SignaturePadRef>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setCuiError('')

        const formData = new FormData(e.currentTarget)
        const cui = formData.get('cui') as string

        if (!validateCUI(cui)) {
            setCuiError('CUI-ul introdus nu este valid.')
            setLoading(false)
            return
        }

        if (sigRef.current?.isEmpty()) {
            alert("Te rugăm să semnezi formularul.")
            setLoading(false)
            return
        }

        const sigData = sigRef.current?.toDataURL()
        if (sigData) formData.append('signature', sigData)

        try {
            await submitForm177(formData)
        } catch (err: any) {
            if (err.message === 'NEXT_REDIRECT' || err.message?.includes('NEXT_REDIRECT')) return
            alert("Eroare: " + err.message)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Denumire Companie</Label>
                    <Input name="companyName" required placeholder="SC EXEMPLU SRL" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>CUI</Label>
                        <Input name="cui" required placeholder="RO123456" className={cuiError ? "border-red-500" : ""} />
                        {cuiError && <p className="text-red-500 text-xs">{cuiError}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Reg. Com. (Opțional)</Label>
                        <Input name="regCom" placeholder="J40/..." />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Reprezentant Legal</Label>
                    <Input name="contactName" required placeholder="Nume Prenume" />
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" required placeholder="contabilitate@firma.ro" />
                </div>
                <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input name="phone" />
                </div>

                <div className="space-y-2">
                    <Label>Suma Sponsorizată (RON)</Label>
                    <Input name="amount" type="number" required min="1" placeholder="Ex: 5000" />
                    <p className="text-xs text-slate-500">
                        20% din impozitul datorat (conform legii).
                    </p>
                </div>

                {/* Honeypot */}
                <input type="text" name="_hp" className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="space-y-2">
                <Label>Semnătură Contract</Label>
                <SignaturePad ref={sigRef} />
                <p className="text-xs text-slate-500">
                    Această semnătură va fi folosită pentru generarea contractului de sponsorizare.
                </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start space-x-2">
                    <Checkbox name="consentTerms" required id="terms" />
                    <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sunt de acord cu <a href="/termeni" className="text-blue-600 underline">Termenii Contractului de Sponsorizare</a>.
                    </label>
                </div>
                <div className="flex items-start space-x-2">
                    <Checkbox name="consentPrivacy" required id="privacy" />
                    <label htmlFor="privacy" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sunt de acord cu prelucrarea datelor.
                    </label>
                </div>
            </div>

            <Button type="submit" className="w-full text-lg py-6 bg-blue-700 hover:bg-blue-800 text-white" disabled={loading}>
                {loading ? "Se generează..." : "Generează Contract și Instructiuni"}
            </Button>

            <p className="text-xs text-center text-slate-400 mt-2">
                *Depunerea în SPV se va face ulterior de către ONG sau contabilul dvs.
            </p>
        </form>
    )
}
