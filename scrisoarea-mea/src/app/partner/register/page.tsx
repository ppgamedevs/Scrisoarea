"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { registerPartnerInstitution } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LegalLink } from "@/components/legal/legal-dialog"

type ActionState = { error?: string } | null

const INSTITUTION_TYPES = [
    { value: "ORFELINAT", label: "Orfelinat" },
    { value: "CASA_DE_COPII", label: "Casă de copii" },
    { value: "CENTRU_PLASAMENT", label: "Centru de plasament" },
    { value: "ONG", label: "ONG" },
    { value: "FUNDATIE", label: "Fundație" },
    { value: "ALTUL", label: "Alt tip" },
] as const

export default function PartnerRegisterPage() {
    const [state, formAction, isPending] = useActionState(
        registerPartnerInstitution as (
            prev: ActionState,
            formData: FormData
        ) => Promise<ActionState>,
        null as ActionState
    )
    const [institutionType, setInstitutionType] = useState("")
    const [confirmRepresentation, setConfirmRepresentation] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--pastel-sage)]/30 px-4 py-16">
            <div className="w-full max-w-2xl space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Înregistrează instituția</h1>
                    <p className="text-slate-500 text-sm">
                        Cont pentru orfelinate, case de copii, centre de plasament și organizații
                        partenere. Nu este înregistrare de donator.
                    </p>
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        Ești donator?{" "}
                        <Link href="/register" className="text-teal-700 font-medium hover:underline">
                            Creează un cont de donator
                        </Link>
                        .
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-900">Cont</CardTitle>
                            <CardDescription>
                                Emailul și parola pentru accesul în portalul instituției.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Parolă</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmă parola</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-900">Reprezentant</CardTitle>
                            <CardDescription>
                                Persoana care reprezintă instituția în relația cu platforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Prenume</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        autoComplete="given-name"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Nume</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        autoComplete="family-name"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="representativeRole">Funcție / rol</Label>
                                <Input
                                    id="representativeRole"
                                    name="representativeRole"
                                    placeholder="Ex: Director, Consilier"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-900">Instituție</CardTitle>
                            <CardDescription>
                                Datele instituției partenere. Verificarea se face de către
                                administratori.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="institutionName">Denumire instituție</Label>
                                <Input
                                    id="institutionName"
                                    name="institutionName"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institutionType">Tip instituție</Label>
                                <input type="hidden" name="institutionType" value={institutionType} />
                                <Select
                                    value={institutionType}
                                    onValueChange={setInstitutionType}
                                    required
                                    disabled={isPending}
                                >
                                    <SelectTrigger id="institutionType">
                                        <SelectValue placeholder="Selectează tipul" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INSTITUTION_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cui">CUI / CIF (opțional)</Label>
                                <Input id="cui" name="cui" disabled={isPending} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="county">Județ</Label>
                                    <Input
                                        id="county"
                                        name="county"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Localitate</Label>
                                    <Input
                                        id="city"
                                        name="city"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresă</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website (opțional)</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    placeholder="https://"
                                    disabled={isPending}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
                        <label className="flex items-start gap-3 text-sm text-slate-600">
                            <Checkbox
                                checked={confirmRepresentation}
                                onCheckedChange={(v) => setConfirmRepresentation(v === true)}
                                disabled={isPending}
                            />
                            {confirmRepresentation && (
                                <input type="hidden" name="confirmRepresentation" value="on" />
                            )}
                            <span>
                                Confirm că sunt reprezentant autorizat al instituției și că
                                informațiile furnizate sunt corecte.
                            </span>
                        </label>
                        <label className="flex items-start gap-3 text-sm text-slate-600">
                            <Checkbox
                                checked={acceptTerms}
                                onCheckedChange={(v) => setAcceptTerms(v === true)}
                                disabled={isPending}
                            />
                            {acceptTerms && (
                                <input type="hidden" name="acceptTerms" value="on" />
                            )}
                            <span>
                                Accept{" "}
                                <LegalLink doc="termeni" className="text-teal-700 hover:underline">
                                    Termenii și Condițiile
                                </LegalLink>{" "}
                                și{" "}
                                <LegalLink doc="confidentialitate" className="text-teal-700 hover:underline">
                                    Politica de Confidențialitate
                                </LegalLink>
                                .
                            </span>
                        </label>

                        {state?.error && (
                            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
                                {state.error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                isPending ||
                                !confirmRepresentation ||
                                !acceptTerms ||
                                !institutionType
                            }
                        >
                            {isPending ? "Se înregistrează..." : "Trimite cererea de înregistrare"}
                        </Button>
                    </div>
                </form>

                <p className="text-sm text-slate-600 text-center">
                    Ai deja cont de instituție?{" "}
                    <Link
                        href="/partner/login"
                        className="text-teal-700 font-medium hover:underline"
                    >
                        Autentifică-te
                    </Link>
                </p>
            </div>
        </main>
    )
}
