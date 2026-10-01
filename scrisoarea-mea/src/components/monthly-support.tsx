"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startMonthlySubscription } from "@/app/actions/subscribe"
import { MONTHLY_AMOUNTS, type MonthlyAmount } from "@/lib/monthly-amounts"

export function MonthlySupportCard({ initialAmount = 25 }: { initialAmount?: number }) {
    const [amount, setAmount] = useState<MonthlyAmount>(
        MONTHLY_AMOUNTS.includes(initialAmount as MonthlyAmount) ? (initialAmount as MonthlyAmount) : 25
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const start = async () => {
        setLoading(true)
        setError("")
        const result = await startMonthlySubscription(amount)
        if (!result.success) {
            setError(result.error)
            setLoading(false)
            return
        }
        window.location.assign(result.url)
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 md:p-12 text-center">
            <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-sm font-bold border border-rose-100 mb-6">
                <Heart className="w-4 h-4 fill-rose-600" />
                Devino Eroul Nostru
            </span>

            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Ajută-ne să ținem <span className="text-blue-600">lumina aprinsă.</span>
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                Suntem o echipă mică cu visuri mari. Contribuția ta lunară ne asigură continuitatea și ne ajută să găsim copiii, să verificăm poveștile și să livrăm bucurie constant, lună de lună.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                {MONTHLY_AMOUNTS.map((value) => {
                    const selected = amount === value
                    return (
                        <Button
                            key={value}
                            type="button"
                            variant="outline"
                            onClick={() => setAmount(value)}
                            className={
                                selected
                                    ? "h-16 text-lg font-bold border-2 border-blue-100 bg-blue-50/50 text-blue-800 hover:border-blue-600 hover:bg-blue-100 transition-all rounded-2xl scale-105 shadow-sm"
                                    : "h-16 text-lg font-bold border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-2xl"
                            }
                        >
                            {value} Lei
                        </Button>
                    )
                })}
            </div>

            <div>
                <Button
                    type="button"
                    size="lg"
                    disabled={loading}
                    onClick={start}
                    className="h-14 px-10 text-lg bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all hover:-translate-y-1"
                >
                    {loading ? "Se deschide Stripe..." : "Activează Donația Lunară"}
                </Button>
                <p className="text-xs text-slate-400 mt-4 font-medium">
                    Abonament lunar, separat de donația pentru o scrisoare. Îl poți opri oricând.
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">✨ Securizat prin Stripe • Poți dona și anonim</p>
                {error ? <p className="text-sm text-rose-600 mt-3">{error}</p> : null}
            </div>
        </div>
    )
}
