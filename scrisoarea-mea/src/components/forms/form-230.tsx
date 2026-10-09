"use client"

import { useState, useRef } from "react"
import { submitForm230 } from "@/app/actions/tax-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad, SignaturePadRef } from "@/components/ui/signature-pad"
import { validateCNP } from "@/lib/validations/ro-tax"
import { LegalLink } from "@/components/legal/legal-dialog"

const FISCAL_YEAR =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_FORM_230_FISCAL_YEAR
        ? process.env.NEXT_PUBLIC_FORM_230_FISCAL_YEAR
        : String(new Date().getFullYear() - 1)

export default function Form230() {
    const [loading, setLoading] = useState(false)
    const [cnpError, setCnpError] = useState("")
    const [optionTwoYears, setOptionTwoYears] = useState(false)
    const [shareData, setShareData] = useState(true)
    const [consentTerms, setConsentTerms] = useState(false)
    const [consentPrivacy, setConsentPrivacy] = useState(false)
    const sigRef = useRef<SignaturePadRef>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setCnpError("")

        const formData = new FormData(e.currentTarget)
        const cnp = String(formData.get("cnp") || "")

        if (!validateCNP(cnp)) {
            setCnpError("CNP-ul introdus nu este valid.")
            setLoading(false)
            return
        }

        if (sigRef.current?.isEmpty()) {
            alert("Te rugăm să semnezi formularul.")
            setLoading(false)
            return
        }

        if (!consentTerms || !consentPrivacy) {
            alert("Te rugăm să accepți termenii și prelucrarea datelor.")
            setLoading(false)
            return
        }

        const sigData = sigRef.current?.toDataURL()
        if (sigData) formData.append("signature", sigData)
        formData.set("optionTwoYears", optionTwoYears ? "on" : "")
        formData.set("shareDataWithBeneficiary", shareData ? "on" : "")
        formData.set("consentTerms", consentTerms ? "on" : "")
        formData.set("consentPrivacy", consentPrivacy ? "on" : "")

        try {
            await submitForm230(formData)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            if (message === "NEXT_REDIRECT" || message.includes("NEXT_REDIRECT")) return
            alert("Eroare: " + message)
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-900">
                Formular ANAF <strong>230</strong> (cod <strong>14.13.04.13</strong>), OPANAF
                103/22.01.2025 — anul fiscal al veniturilor: <strong>{FISCAL_YEAR}</strong>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                    I. Date de identificare a contribuabilului
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="lastName">Nume</Label>
                        <Input id="lastName" name="lastName" required autoComplete="family-name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fatherInitial">Inițiala tatălui</Label>
                        <Input
                            id="fatherInitial"
                            name="fatherInitial"
                            required
                            maxLength={1}
                            className="uppercase"
                            placeholder="A"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="firstName">Prenume</Label>
                    <Input id="firstName" name="firstName" required autoComplete="given-name" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cnp">Cod numeric personal (CNP)</Label>
                    <Input
                        id="cnp"
                        name="cnp"
                        required
                        maxLength={13}
                        inputMode="numeric"
                        className={cnpError ? "border-red-500" : ""}
                    />
                    {cnpError && <p className="text-xs text-red-500">{cnpError}</p>}
                </div>

                <input
                    type="text"
                    name="_hp"
                    className="absolute -left-[9999px] opacity-0"
                    tabIndex={-1}
                    autoComplete="off"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" name="phone" type="tel" autoComplete="tel" />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="street">Stradă</Label>
                        <Input id="street" name="street" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="streetNumber">Număr</Label>
                        <Input id="streetNumber" name="streetNumber" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="bloc">Bloc</Label>
                        <Input id="bloc" name="bloc" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scara">Scară</Label>
                        <Input id="scara" name="scara" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="etaj">Etaj</Label>
                        <Input id="etaj" name="etaj" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apartament">Ap.</Label>
                        <Input id="apartament" name="apartament" />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="city">Localitate</Label>
                        <Input id="city" name="city" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="county">Județ / Sector</Label>
                        <Input id="county" name="county" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="postalCode">Cod poștal</Label>
                        <Input id="postalCode" name="postalCode" maxLength={6} />
                    </div>
                </div>
            </div>

            <div className="space-y-3 border-t pt-4">
                <h2 className="text-lg font-semibold text-slate-900">II. Destinația sumei</h2>
                <p className="text-sm text-slate-600">
                    Se completează automat opțiunea „Susținerea unei entități nonprofit” pentru
                    Asociația pentru visuri și oportunități (CUI{" "}
                    {process.env.NEXT_PUBLIC_ASSOCIATION_CUI || "55406686"}).
                </p>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                    <Checkbox
                        checked={optionTwoYears}
                        onCheckedChange={(v) => setOptionTwoYears(v === true)}
                    />
                    <span>
                        Opțiune privind distribuirea sumei pentru o perioadă de <strong>2 ani</strong>
                    </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                    <Checkbox checked={shareData} onCheckedChange={(v) => setShareData(v === true)} />
                    <span>
                        Sunt de acord ca datele mele de identificare să fie transmise entității
                        beneficiare
                    </span>
                </label>
            </div>

            <div className="space-y-2 border-t pt-4">
                <Label>Semnătură contribuabil</Label>
                <SignaturePad ref={sigRef} />
                <p className="text-xs text-slate-500">
                    Semnează în careul de mai sus (mouse sau ecran tactil).
                </p>
            </div>

            <div className="space-y-4 border-t pt-4">
                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="terms"
                        checked={consentTerms}
                        onCheckedChange={(v) => setConsentTerms(v === true)}
                    />
                    <label htmlFor="terms" className="text-sm leading-snug">
                        Confirm corectitudinea datelor și sunt de acord cu{" "}
                        <LegalLink doc="termeni" className="text-indigo-600 underline">
                            Termenii și Condițiile
                        </LegalLink>
                        .
                    </label>
                </div>
                <div className="flex items-start space-x-2">
                    <Checkbox
                        id="privacy"
                        checked={consentPrivacy}
                        onCheckedChange={(v) => setConsentPrivacy(v === true)}
                    />
                    <label htmlFor="privacy" className="text-sm leading-snug">
                        Sunt de acord cu prelucrarea datelor personale (GDPR) pentru generarea și
                        depunerea Formularului 230.
                    </label>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-indigo-600 py-6 text-lg text-white hover:bg-indigo-700"
                disabled={loading}
            >
                {loading ? "Se generează Formularul 230..." : "Generează Formularul 230"}
            </Button>
        </form>
    )
}
