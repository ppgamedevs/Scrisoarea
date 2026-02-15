"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

import { initiateNetopiaPayment } from "@/app/actions/netopia"
import { useEffect, useRef } from "react"

export default function DonationModule({
    scrisoareId,
    remainingAmount,
    isFullyFunded,
    userEmail,
    userRole
}: {
    scrisoareId: string,
    remainingAmount: number,
    isFullyFunded: boolean,
    userEmail?: string | null,
    userRole?: string | null
}) {
    const [customAmount, setCustomAmount] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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

            // Netopia Flow
            if (!firstName || !lastName || !email) throw new Error("Te rugăm să completezi datele de contact pentru facturare.")

            const formData = new FormData()
            formData.append('amount', amount.toString())
            formData.append('firstName', firstName)
            formData.append('lastName', lastName)
            formData.append('email', email)
            formData.append('scrisoareId', scrisoareId)

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

    // Double Check: Partners should not see this.
    if (userRole === 'PARTNER') {
        return null;
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

            {/* Netopia Fields (Always Visible) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
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

            {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2 items-center">
                    <span>⚠</span> {error}
                </div>
            )}

            <Button
                className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-200 rounded-xl transition-all hover:scale-[1.02]"
                onClick={handleDonate}
                disabled={loading || !customAmount || Number(customAmount) < 5}
            >
                {loading ? "Se procesează..." : "Donează și adu bucurie ✨"}
            </Button>

            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <span className="text-green-500">🔒</span> Plată securizată prin Netopia Payments.
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
