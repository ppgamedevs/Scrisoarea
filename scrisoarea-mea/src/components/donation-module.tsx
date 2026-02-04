"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { createReservationAndCheckout } from "@/app/actions/donate"

export default function DonationModule({
    scrisoareId,
    remainingAmount,
    isFullyFunded
}: {
    scrisoareId: string,
    remainingAmount: number,
    isFullyFunded: boolean
}) {
    const [customAmount, setCustomAmount] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Presets: 50, 100, 200, but filter out if > remaining
    const presets = [50, 100, 200].filter(p => p <= remainingAmount)

    const handleDonate = async () => {
        setLoading(true)
        setError('')
        try {
            const amount = Number(customAmount)
            if (!amount || amount < 5) throw new Error("Minim 5 RON")
            if (amount > remainingAmount) throw new Error("Suma depășește necesarul.")

            await createReservationAndCheckout(scrisoareId, amount)
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
        // Auto-cap visual logic? Or just validate on submit? 
        // User asked for "input input with auto-cap"
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
                {/* "Full Amount" button if not in presets */}
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
                        className="pl-8 text-lg"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">RON</span>
                </div>
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
                {loading ? "Se procesează..." : "Trimite Cadoul Acum ✨"}
            </Button>

            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <span className="text-green-500">🔒</span> Plată 100% securizată prin Stripe.
            </p>
        </div>
    )
}
