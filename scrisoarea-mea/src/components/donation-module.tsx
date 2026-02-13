"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

import { createReservationAndCheckout } from "@/app/actions/donate"
import { initiateNetopiaPayment } from "@/app/actions/netopia"
import { useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function DonationModule({
    scrisoareId,
    remainingAmount,
    isFullyFunded,
    userEmail
}: {
    scrisoareId: string,
    remainingAmount: number,
    isFullyFunded: boolean,
    userEmail?: string | null
}) {
    const [customAmount, setCustomAmount] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'netopia'>('netopia') // Default to Netopia

    // Donor Details for Netopia
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState(userEmail || '')

    // Netopia Form Data
    const [netopiaForm, setNetopiaForm] = useState<{ url: string, env_key: string, data: string } | null>(null)
    const netopiaFormRef = useRef<HTMLFormElement>(null)

    // Auto-submit Netopia form
    useEffect(() => {
        if (netopiaForm && netopiaFormRef.current) {
            netopiaFormRef.current.submit()
        }
    }, [netopiaForm])

    // Presets: 50, 100, 200, but filter out if > remaining
    const presets = [50, 100, 200].filter(p => p <= remainingAmount)

    const handleDonate = async () => {
        setLoading(true)
        setError('')
        try {
            const amount = Number(customAmount)
            if (!amount || amount < 5) throw new Error("Minim 5 RON")
            if (amount > remainingAmount) throw new Error("Suma depășește necesarul.")

            if (paymentMethod === 'stripe') {
                await createReservationAndCheckout(scrisoareId, amount)
            } else {
                // Netopia Flow
                if (!firstName || !lastName || !email) throw new Error("Te rugăm să completezi datele de contact pentru facturare.")

                const formData = new FormData()
                formData.append('amount', amount.toString())
                formData.append('firstName', firstName)
                formData.append('lastName', lastName)
                formData.append('email', email)
                formData.append('scrisoareId', scrisoareId)
                // Assuming implicit anonymous check or add checkbox later if needed

                const result = await initiateNetopiaPayment(formData)
                if (result.success && result.url && result.env_key && result.data) {
                    setNetopiaForm({
                        url: result.url,
                        env_key: result.env_key,
                        data: result.data
                    })
                } else {
                    throw new Error(result.error || "Eroare la inițierea plății Netopia.")
                }
            }
        } catch (e: any) {
            setError(e.message)
            setLoading(false)
        }
    }

    const handlePreset = (val: number) => {
        setCustomAmount(val.toString())
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = Number(e.target.value)
        if (val > remainingAmount) val = remainingAmount
        setCustomAmount(val.toString())
    }

    if (isFullyFunded) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center">
                <h3 className="text-xl font-bold text-emerald-800 mb-2">Dorință Împlinită! 🎉</h3>
                <p className="text-emerald-700">Acest copil va primi cadoul dorit mulțumită oamenilor cu suflet mare. Nu mai sunt necesare fonduri.</p>
            </div>
        )
    }

    return (
        <div className="bg-[var(--pastel-cream)] border text-slate-800 border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-8 space-y-6">
            <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Trimite un cadou</p>
                <div className="text-4xl font-black text-slate-900 mb-2">
                    {formatCurrency(remainingAmount)}
                </div>
                <p className="text-sm text-slate-500">
                    mai sunt necesari pentru a îndeplini complet această dorință.
                </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
                {presets.map(p => (
                    <Button
                        key={p}
                        variant={Number(customAmount) === p ? "default" : "outline"}
                        className={`min-h-[44px] ${Number(customAmount) === p ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50 hover:text-blue-600 border-slate-200"}`}
                        onClick={() => handlePreset(p)}
                    >
                        {p} LEI
                    </Button>
                ))}
                {remainingAmount > 0 && !presets.includes(remainingAmount) && (
                    <Button
                        variant={Number(customAmount) === remainingAmount ? "default" : "outline"}
                        className={`min-h-[44px] ${Number(customAmount) === remainingAmount ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50 hover:text-blue-600 border-slate-200"}`}
                        onClick={() => handlePreset(remainingAmount)}
                    >
                        Integral
                    </Button>
                )}
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Sau introdu o altă sumă</label>
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="Ex: 50"
                        value={customAmount}
                        onChange={handleInputChange}
                        min={5}
                        max={remainingAmount}
                        className="pr-12 text-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">RON</span>
                </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold text-slate-700">Metoda de plată</Label>
                <RadioGroup
                    defaultValue="netopia"
                    value={paymentMethod}
                    onValueChange={(v: string) => setPaymentMethod(v as 'stripe' | 'netopia')}
                    className="grid grid-cols-2 gap-4"
                >
                    <div>
                        <RadioGroupItem value="netopia" id="pm-netopia" className="peer sr-only" />
                        <Label
                            htmlFor="pm-netopia"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer"
                        >
                            <span className="mb-1 text-lg">💳</span>
                            Card (Netopia)
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="stripe" id="pm-stripe" className="peer sr-only" />
                        <Label
                            htmlFor="pm-stripe"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer"
                        >
                            <span className="mb-1 text-lg">🔒</span>
                            Stripe
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Netopia Extra Fields */}
            {paymentMethod === 'netopia' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-medium text-slate-700 mb-2">Detalii donator (necesare pentru facturare):</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="Prenume"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                        <Input
                            placeholder="Nume"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />
                    </div>
                    <Input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
            )}

            {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2 items-center">
                    <span>⚠</span> {error}
                </div>
            )}

            {!userEmail && paymentMethod === 'stripe' && (
                <div className="bg-blue-50/50 text-blue-800 text-xs p-3 rounded-xl border border-blue-100 flex gap-2 items-start">
                    <span className="mt-0.5">💡</span>
                    <p>
                        <Link href="/login" className="font-bold hover:underline">Loghează-te</Link> pentru a avea donația în istoricul tău.
                    </p>
                </div>
            )}

            <Button
                className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-200 rounded-xl transition-all hover:scale-[1.02]"
                onClick={handleDonate}
                disabled={loading || !customAmount || Number(customAmount) < 5}
            >
                {loading ? "Se procesează..." : "Trimite Cadoul Acum ✨"}
            </Button>

            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <span className="text-green-500">🔒</span> Plată securizată.
            </p>

            {/* Hidden Form for Netopia Auto-Submit */}
            {netopiaForm && (
                <form ref={netopiaFormRef} action={netopiaForm.url} method="POST">
                    <input type="hidden" name="env_key" value={netopiaForm.env_key} />
                    <input type="hidden" name="data" value={netopiaForm.data} />
                </form>
            )}
        </div>
    )
}
