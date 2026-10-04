"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { submitDirectSponsorship } from "@/app/actions/sponsorship-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad"
import { validateCUI } from "@/lib/validations/ro-tax"
import { normalizeCuiInput } from "@/lib/validations/cui"

type TaxRegime = "PROFIT_TAX" | "MICROENTERPRISE" | "UNKNOWN"

export default function DirectSponsorshipForm() {
    const [loading, setLoading] = useState(false)
    const [cuiError, setCuiError] = useState("")
    const [taxRegime, setTaxRegime] = useState<TaxRegime>("PROFIT_TAX")
    const [consentTerms, setConsentTerms] = useState(false)
    const [consentPrivacy, setConsentPrivacy] = useState(false)
    const [showCalc, setShowCalc] = useState(false)
    const [turnover, setTurnover] = useState("")
    const [profitTax, setProfitTax] = useState("")
    const [alreadyUsed, setAlreadyUsed] = useState("")
    const sigRef = useRef<SignaturePadRef>(null)

    const estimate = useMemo(() => {
        const t = Number(turnover) || 0
        const p = Number(profitTax) || 0
        const used = Number(alreadyUsed) || 0
        const turnoverLimit = t * 0.0075
        const profitTaxLimit = p * 0.2
        const gross = Math.min(turnoverLimit, profitTaxLimit)
        return Math.max(0, gross - used)
    }, [turnover, profitTax, alreadyUsed])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setCuiError("")

        const formData = new FormData(e.currentTarget)
        const cui = normalizeCuiInput(String(formData.get("companyCif") || ""))
        if (!validateCUI(cui)) {
            setCuiError("CUI-ul introdus nu este valid.")
            setLoading(false)
            return
        }
        formData.set("companyCif", cui)
        formData.set("taxRegime", taxRegime)

        if (sigRef.current?.isEmpty()) {
            toast.error("Te rugăm să semnezi contractul.")
            setLoading(false)
            return
        }
        if (!consentTerms || !consentPrivacy) {
            toast.error("Acceptă termenii și prelucrarea datelor.")
            setLoading(false)
            return
        }

        const sig = sigRef.current?.toDataURL()
        if (sig) formData.set("signature", sig)
        formData.set("consentTerms", consentTerms ? "on" : "")
        formData.set("consentPrivacy", consentPrivacy ? "on" : "")

        try {
            await submitDirectSponsorship(formData)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            if (message.includes("NEXT_REDIRECT")) return
            toast.error(message)
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
            <div>
                <h2 className="text-xl font-semibold text-slate-900">Sponsorizare directă</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Compania semnează contractul de sponsorizare și virează suma direct către
                    Asociația Visuri pe hârtie.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="companyName">Denumire companie</Label>
                <Input id="companyName" name="companyName" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="companyCif">CUI</Label>
                    <Input
                        id="companyCif"
                        name="companyCif"
                        required
                        placeholder="RO12345678 sau 12345678"
                        className={cuiError ? "border-red-500" : ""}
                    />
                    {cuiError && <p className="text-xs text-red-500">{cuiError}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="regCom">Reg. Com. (opțional)</Label>
                    <Input id="regCom" name="regCom" placeholder="J40/..." />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Regimul fiscal al companiei</Label>
                <div className="space-y-2 text-sm">
                    {(
                        [
                            ["PROFIT_TAX", "Plătitor de impozit pe profit"],
                            ["MICROENTERPRISE", "Microîntreprindere"],
                            ["UNKNOWN", "Nu știu"],
                        ] as const
                    ).map(([value, label]) => (
                        <label key={value} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="taxRegimeRadio"
                                checked={taxRegime === value}
                                onChange={() => setTaxRegime(value)}
                            />
                            {label}
                        </label>
                    ))}
                </div>
                {taxRegime === "MICROENTERPRISE" && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        Începând cu anul fiscal 2024, facilitatea de scădere/redirecționare a
                        sponsorizării din impozitul pe veniturile microîntreprinderilor a fost
                        eliminată. Poți face în continuare o sponsorizare, însă aceasta nu
                        beneficiază de mecanismul fiscal prezentat pentru impozitul pe profit.
                    </p>
                )}
                {taxRegime === "UNKNOWN" && (
                    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                        Verifică regimul fiscal împreună cu contabilul companiei înainte de a
                        folosi facilitatea fiscală.
                    </p>
                )}
            </div>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
                <legend className="px-1 text-sm font-semibold text-slate-800">
                    Domiciliu fiscal
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="street">Stradă</Label>
                        <Input id="street" name="street" required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="streetNumber">Număr</Label>
                        <Input id="streetNumber" name="streetNumber" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                        <Label htmlFor="building">Bloc</Label>
                        <Input id="building" name="building" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="entrance">Scară</Label>
                        <Input id="entrance" name="entrance" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="floor">Etaj</Label>
                        <Input id="floor" name="floor" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="apartment">Ap.</Label>
                        <Input id="apartment" name="apartment" />
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="city">Localitate</Label>
                        <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="county">Județ / Sector</Label>
                        <Input id="county" name="county" required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="postalCode">Cod poștal</Label>
                        <Input id="postalCode" name="postalCode" />
                    </div>
                </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="representativeName">Reprezentant legal</Label>
                    <Input id="representativeName" name="representativeName" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="representativeRole">Funcție (opțional)</Label>
                    <Input id="representativeRole" name="representativeRole" placeholder="Administrator" />
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" name="phone" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="sponsorshipAmount">Suma sponsorizată (RON)</Label>
                <Input
                    id="sponsorshipAmount"
                    name="sponsorshipAmount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="Ex: 5000"
                />
                <p className="text-xs text-slate-500">
                    Introdu suma pe care compania dorește să o sponsorizeze.
                </p>
                <p className="text-xs text-slate-600">
                    Pentru companiile plătitoare de impozit pe profit, suma care poate fi scăzută
                    din impozitul datorat este limitată la valoarea minimă dintre 0,75% din cifra
                    de afaceri și 20% din impozitul pe profit datorat.
                </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <button
                    type="button"
                    className="text-sm font-medium text-blue-700 underline"
                    onClick={() => setShowCalc((v) => !v)}
                >
                    {showCalc ? "Ascunde calculatorul opțional" : "Calculator plafon fiscal (opțional)"}
                </button>
                {showCalc && (
                    <div className="mt-3 space-y-3">
                        <p className="text-xs text-slate-600">
                            Aceasta este doar o estimare. Valoarea finală trebuie confirmată de
                            contabilul companiei. Nu constituie consultanță fiscală.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                                <Label>Cifră de afaceri</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={turnover}
                                    onChange={(e) => setTurnover(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Impozit pe profit datorat</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={profitTax}
                                    onChange={(e) => setProfitTax(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Sponsorizări deja folosite</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={alreadyUsed}
                                    onChange={(e) => setAlreadyUsed(e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                            Plafon fiscal estimat: {estimate.toFixed(2)} RON
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-950">
                Companiile plătitoare de impozit pe profit care efectuează sponsorizări au
                obligații declarative, inclusiv raportarea beneficiarilor prin Formularul 107,
                conform legislației fiscale aplicabile. Visuri pe hârtie nu depune Formularul 107
                în locul companiei.
            </div>

            <div className="space-y-2">
                <Label>Semnătură reprezentant</Label>
                <SignaturePad ref={sigRef} />
            </div>

            <div className="space-y-3 border-t pt-4">
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                        checked={consentTerms}
                        onCheckedChange={(v) => setConsentTerms(v === true)}
                    />
                    <span>
                        Sunt de acord cu{" "}
                        <a href="/termeni" className="text-blue-600 underline">
                            Termenii
                        </a>{" "}
                        contractului de sponsorizare.
                    </span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                        checked={consentPrivacy}
                        onCheckedChange={(v) => setConsentPrivacy(v === true)}
                    />
                    <span>Sunt de acord cu prelucrarea datelor (GDPR).</span>
                </label>
            </div>

            <input type="text" name="_hp" className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" />

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 py-6 text-lg text-white hover:bg-blue-800"
            >
                {loading ? "Se generează contractul..." : "Generează contractul de sponsorizare"}
            </Button>
        </form>
    )
}
