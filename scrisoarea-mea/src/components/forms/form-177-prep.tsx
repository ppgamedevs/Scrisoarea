"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { submitForm177Prep } from "@/app/actions/sponsorship-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad"
import { validateCUI } from "@/lib/validations/ro-tax"
import { normalizeCuiInput } from "@/lib/validations/cui"

const DEFAULT_YEAR =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_FORM_177_FISCAL_YEAR
        ? process.env.NEXT_PUBLIC_FORM_177_FISCAL_YEAR
        : String(new Date().getFullYear() - 1)

export default function Form177PrepForm({
    beneficiaryName,
}: {
    beneficiaryName: string
}) {
    const [loading, setLoading] = useState(false)
    const [cuiError, setCuiError] = useState("")
    const [maxAmount, setMaxAmount] = useState("")
    const [prevAmount, setPrevAmount] = useState("0")
    const [requested, setRequested] = useState("")
    const [profitTaxConfirm, setProfitTaxConfirm] = useState(false)
    const [disclosureConsent, setDisclosureConsent] = useState(false)
    const [consentTerms, setConsentTerms] = useState(false)
    const [consentPrivacy, setConsentPrivacy] = useState(false)
    const sigRef = useRef<SignaturePadRef>(null)

    const remaining = useMemo(() => {
        const max = Number(maxAmount) || 0
        const prev = Number(prevAmount) || 0
        return Math.max(0, max - prev)
    }, [maxAmount, prevAmount])

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
        formData.set("taxRegime", "PROFIT_TAX")

        if (!profitTaxConfirm) {
            toast.error("Confirmă eligibilitatea pentru impozit pe profit.")
            setLoading(false)
            return
        }
        if (sigRef.current?.isEmpty()) {
            toast.error("Te rugăm să semnezi.")
            setLoading(false)
            return
        }
        if (!consentTerms || !consentPrivacy) {
            toast.error("Acceptă termenii și prelucrarea datelor.")
            setLoading(false)
            return
        }

        const req = Number(requested)
        if (req > remaining) {
            toast.error(`Suma solicitată nu poate depăși ${remaining.toFixed(2)} RON.`)
            setLoading(false)
            return
        }

        const sig = sigRef.current?.toDataURL()
        if (sig) formData.set("signature", sig)
        formData.set("profitTaxConfirm", profitTaxConfirm ? "on" : "")
        formData.set("disclosureConsent", disclosureConsent ? "on" : "")
        formData.set("consentTerms", consentTerms ? "on" : "")
        formData.set("consentPrivacy", consentPrivacy ? "on" : "")

        try {
            await submitForm177Prep(formData)
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
                <h2 className="text-xl font-semibold text-slate-900">
                    Formular 177 — Draft pentru verificare
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Cerere privind redirecționarea impozitului pe profit (OPANAF 3562/2024).
                    Documentul generat este un draft pentru verificare — nu un pachet electronic
                    validat ANAF.
                </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                Verifică suma disponibilă împreună cu contabilul companiei. Formularul 177 se
                depune electronic de către companie sau de către persoana împuternicită, prin
                mijloacele electronice puse la dispoziție de ANAF.
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <Checkbox
                    checked={profitTaxConfirm}
                    onCheckedChange={(v) => setProfitTaxConfirm(v === true)}
                />
                <span>
                    Confirm că societatea este plătitoare de impozit pe profit și că suma
                    solicitată reprezintă o parte eligibilă rămasă pentru redirecționare potrivit
                    legii.
                </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fiscalYear">Anul fiscal</Label>
                    <Input
                        id="fiscalYear"
                        name="fiscalYear"
                        type="number"
                        required
                        defaultValue={DEFAULT_YEAR}
                        min={2024}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyCif">CIF / CUI</Label>
                    <Input
                        id="companyCif"
                        name="companyCif"
                        required
                        className={cuiError ? "border-red-500" : ""}
                    />
                    {cuiError && <p className="text-xs text-red-500">{cuiError}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="companyName">Denumire</Label>
                <Input id="companyName" name="companyName" required />
            </div>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
                <legend className="px-1 text-sm font-semibold">Domiciliu fiscal</legend>
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
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" name="phone" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="fax">Fax</Label>
                        <Input id="fax" name="fax" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="representativeName">Reprezentant</Label>
                    <Input id="representativeName" name="representativeName" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="representativeRole">Funcție</Label>
                    <Input id="representativeRole" name="representativeRole" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="regCom">Reg. Com. (opțional, pentru contract)</Label>
                <Input id="regCom" name="regCom" />
            </div>

            <fieldset className="space-y-3 rounded-xl border border-slate-100 p-4">
                <legend className="px-1 text-sm font-semibold">Sume Formular 177</legend>
                <div className="space-y-2">
                    <Label htmlFor="maximumRedirectableAmount">
                        Suma maximă care poate fi redirecționată potrivit legii
                    </Label>
                    <Input
                        id="maximumRedirectableAmount"
                        name="maximumRedirectableAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="previouslyRedirectedAmount">
                        Suma redirecționată prin formularele 177 depuse anterior
                    </Label>
                    <Input
                        id="previouslyRedirectedAmount"
                        name="previouslyRedirectedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={prevAmount}
                        onChange={(e) => setPrevAmount(e.target.value)}
                    />
                </div>
                <p className="text-sm text-slate-700">
                    Suma rămasă de redirecționat: <strong>{remaining.toFixed(2)} RON</strong>
                </p>
                <div className="space-y-2">
                    <Label htmlFor="requestedRedirectAmount">Suma solicitată acum</Label>
                    <Input
                        id="requestedRedirectAmount"
                        name="requestedRedirectAmount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={remaining || undefined}
                        required
                        value={requested}
                        onChange={(e) => setRequested(e.target.value)}
                    />
                </div>
            </fieldset>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                Beneficiar precompletat: <strong>{beneficiaryName}</strong> — 1. Sponsorizare către
                entități persoane juridice fără scop lucrativ. Se generează automat un contract de
                sponsorizare (obligatoriu pentru Formularul 177) cu număr și dată.
            </div>

            <label className="flex items-start gap-2 text-sm">
                <Checkbox
                    checked={disclosureConsent}
                    onCheckedChange={(v) => setDisclosureConsent(v === true)}
                />
                <span>
                    Sunt de acord ca ANAF să comunice Asociației Visuri pe hârtie denumirea și
                    codul de identificare fiscală al companiei, precum și suma redirecționată.
                    (opțional)
                </span>
            </label>

            <div className="space-y-2">
                <Label>Semnătură contribuabil</Label>
                <SignaturePad ref={sigRef} />
            </div>

            <div className="space-y-3 border-t pt-4">
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                        checked={consentTerms}
                        onCheckedChange={(v) => setConsentTerms(v === true)}
                    />
                    <span>Accept termenii contractului de sponsorizare.</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox
                        checked={consentPrivacy}
                        onCheckedChange={(v) => setConsentPrivacy(v === true)}
                    />
                    <span>Accept prelucrarea datelor (GDPR).</span>
                </label>
            </div>

            <input type="text" name="_hp" className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" />

            <Button
                type="submit"
                disabled={loading || !profitTaxConfirm}
                className="w-full bg-slate-900 py-6 text-lg text-white hover:bg-slate-800"
            >
                {loading ? "Se pregătesc documentele..." : "Pregătește contract + Draft Formular 177"}
            </Button>
        </form>
    )
}
