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
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                <h3 className="text-xl font-medium text-green-900 mb-2">Obiectiv Îndeplinit!</h3>
                <p className="text-green-700">Acest copil va primi cadoul dorit mulțumită donatorilor. Nu mai sunt necesare fonduri.</p>
            </div>
        )
    }

    return (
        <div className="bg-white border text-neutral-900 border-neutral-200 shadow-xl rounded-xl p-8 space-y-6">
            <div>
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-1">Donează acum</p>
                <div className="text-3xl font-bold text-neutral-900 mb-2">
                    Rămas: {formatCurrency(remainingAmount)}
                </div>
                <p className="text-xs text-neutral-400">
                    *Suma include rezervările active ale altor donatori.
                </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
                {presets.map(p => (
                    <Button
                        key={p}
                        variant={Number(customAmount) === p ? "default" : "outline"}
                        onClick={() => handlePreset(p)}
                    >
                        {p} RON
                    </Button>
                ))}
                {/* "Full Amount" button if not in presets */}
                {remainingAmount > 0 && !presets.includes(remainingAmount) && (
                    <Button
                        variant={Number(customAmount) === remainingAmount ? "default" : "outline"}
                        onClick={() => handlePreset(remainingAmount)}
                    >
                        Integral
                    </Button>
                )}
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Altă sumă (RON)</label>
                <Input
                    type="number"
                    placeholder="Introdu suma..."
                    value={customAmount}
                    onChange={handleInputChange}
                    min={5}
                    max={remainingAmount}
                />
            </div>

            {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    ⚠ {error}
                </div>
            )}

            <Button
                className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleDonate}
                disabled={loading || !customAmount || Number(customAmount) < 5}
            >
                {loading ? "Se procesează..." : "Continuă către plată"}
            </Button>

            <p className="text-xs text-neutral-400 text-center">
                Plată securizată prin Stripe. Nu stocăm datele cardului.
            </p>
        </div>
    )
}
