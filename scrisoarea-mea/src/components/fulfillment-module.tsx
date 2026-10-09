"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFulfillmentClaim, submitAwb } from "@/app/actions/fulfill"

type ActiveClaim = {
    status: string
    id?: string
    expiresAt?: string
} | null

function formatCountdown(expiresAt: string, now: number) {
    const remaining = new Date(expiresAt).getTime() - now
    if (remaining <= 0) return "00:00"
    const totalMinutes = Math.ceil(remaining / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

function ReservationCountdown({ expiresAt }: { expiresAt: string }) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000)
        return () => window.clearInterval(id)
    }, [])

    return (
        <div className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">Timp rămas</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums tracking-tight text-green-950" suppressHydrationWarning>
                {formatCountdown(expiresAt, now)}
            </p>
            <p className="mt-1 text-xs text-green-700">ore : minute</p>
        </div>
    )
}

export default function FulfillmentModule({
    scrisoareId,
    activeClaim,
    isLoggedIn = false,
    loginHref = "/login",
    registerHref = "/register",
    userEmail,
    shipment = null,
}: {
    scrisoareId: string
    activeClaim: ActiveClaim
    isLoggedIn?: boolean
    loginHref?: string
    registerHref?: string
    userEmail?: string | null
    shipment?: { provider: string; awb: string } | null
}) {
    const router = useRouter()
    const ownsReservation = activeClaim?.status === "PENDING" && Boolean(activeClaim.expiresAt && activeClaim.id)
    const [view, setView] = useState<'INITIAL' | 'LOGIN_REQUIRED' | 'EMAIL_FORM' | 'INSTRUCTIONS' | 'AWB_FORM' | 'CONFIRMATION'>(
        ownsReservation ? "INSTRUCTIONS" : "INITIAL"
    )
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState(userEmail || "")
    const [error, setError] = useState('')

    const [awb, setAwb] = useState('')
    const [provider, setProvider] = useState('')
    const [claimId, setClaimId] = useState<string | null>(ownsReservation ? activeClaim?.id || null : null)
    const [expiresAt, setExpiresAt] = useState<string | null>(ownsReservation ? activeClaim?.expiresAt || null : null)

    const handleCreateClaim = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await createFulfillmentClaim(scrisoareId)
            if (res.claimId) setClaimId(res.claimId)
            if (res.expiresAt) setExpiresAt(res.expiresAt)
            setView('INSTRUCTIONS')
            router.refresh()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Rezervarea nu a putut fi creată.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitAwb = async () => {
        if (!claimId) return
        setLoading(true)
        try {
            await submitAwb(claimId, awb, provider)
            setView('CONFIRMATION')
        } catch (e: any) {
            alert("Eroare: " + e.message)
        } finally {
            setLoading(false)
        }
    }

    // --- RENDERING ---

    // 1. If Locked by someone else (or me after refresh without cookie)
    if (activeClaim) {
        if (activeClaim.status === 'SHIPPED' || activeClaim.status === 'COMPLETED') {
            return (
                <div className="bg-sky-50 border border-sky-200 p-6 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-sky-950 mb-2">În curs de livrare</h3>
                    <p className="text-sky-900 text-sm">
                        Un donator a preluat această dorință și pachetul este pe drum.
                    </p>
                    {shipment ? (
                        <p className="mt-4 text-sm text-sky-950">
                            Curier: <span className="font-semibold">{shipment.provider}</span>
                            {" · "}
                            AWB: <span className="font-semibold">{shipment.awb}</span>
                        </p>
                    ) : null}
                </div>
            )
        }

        // If PENDING (Reserved 72h)
        // If we are in the "Just Created" flow (view=INSTRUCTIONS), we show the form.
        // If just visiting, we show "Locked".
        if (view === 'INITIAL') {
            return (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Rezervat temporar</h3>
                    <p className="text-amber-800 text-sm">
                        Un donator s-a angajat să îndeplinească această dorință. <br />
                        Dacă nu livrează cadourile în 72h, cererea va reveni publică.
                    </p>
                </div>
            )
        }
    }

    // 2. Initial View (No Claims)
    if (view === 'INITIAL') {
        return (
            <div className="bg-white border text-slate-800 border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-8 space-y-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                        <span>🎁</span> Pregătești tu pachetul?
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Poți cumpăra și expedia personal cadoul. Îți vom oferi adresa centrului partener și instrucțiuni pas cu pas. Este o experiență magică!
                    </p>
                    <Button onClick={() => setView(isLoggedIn ? 'EMAIL_FORM' : 'LOGIN_REQUIRED')} className="w-full text-lg h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-200 rounded-xl transition-all hover:scale-[1.02]">
                        Vreau să pregătesc cadoul ✨
                    </Button>
                    <p className="text-xs text-slate-400 mt-2">
                        Ai la dispoziție 72h să livrezi cadourile.
                    </p>
                </div>
            </div>
        )
    }

    if (view === 'LOGIN_REQUIRED') {
        return (
            <div className="bg-white border text-slate-800 border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-8 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl ring-8 ring-teal-50/70">
                    🎁
                </div>
                <h3 className="text-xl font-bold text-slate-900">Autentificare necesară</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Trebuie să te autentifici cu succes pentru a putea pregăti acest cadou.
                </p>
                <div className="mt-6 space-y-3">
                    <Button asChild className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-base text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-blue-600">
                        <Link href={loginHref}>Intră în cont</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-12 w-full rounded-xl border-slate-200 text-base text-slate-800 hover:bg-slate-50">
                        <Link href={registerHref}>Cont nou</Link>
                    </Button>
                    <Button variant="ghost" onClick={() => setView('INITIAL')} className="h-11 w-full rounded-xl text-slate-500 hover:text-slate-800">
                        Înapoi
                    </Button>
                </div>
            </div>
        )
    }

    // 3. Email Form
    if (view === 'EMAIL_FORM') {
        return (
            <div className="bg-white border p-8 rounded-xl space-y-4">
                <h3 className="font-bold">Pasul 1: Date de contact</h3>
                <p className="text-sm text-neutral-500">Rezervarea rămâne legată de contul cu care ești autentificat.</p>

                <div className="space-y-2">
                    <Label>Adresa de Email</Label>
                    <Input
                        placeholder="nume@exemplu.ro"
                        value={email}
                        readOnly={Boolean(userEmail)}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setView('INITIAL')} disabled={loading}>Anulează</Button>
                    <Button onClick={handleCreateClaim} disabled={loading || (!userEmail && !email.includes('@'))} className="flex-1">
                        {loading ? 'Se procesează...' : 'Rezervă Dorința'}
                    </Button>
                </div>
            </div>
        )
    }

    // 4. Instructions & AWB Form (Combined for flow)
    if (view === 'INSTRUCTIONS') {
        return (
            <div className="bg-white border border-indigo-100 p-8 rounded-xl space-y-6">
                <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-4">
                    <p>✅ <strong>Dorința e rezervată pt tine!</strong> Ai 72 de ore la dispoziție să livrezi cadourile.</p>
                    {expiresAt ? <ReservationCountdown expiresAt={expiresAt} /> : null}
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold border-b pb-2">📦 Instrucțiuni de livrare</h4>
                    <div className="text-sm space-y-2 text-neutral-700">
                        <p>1. Pregătește pachetul cu obiectele: <strong>(Vezi lista din stânga)</strong>.</p>
                        <p>2. Nu include datele tale personale sau scrisori în pachet.</p>
                        <p>3. Expediază prin orice curier la adresa:</p>
                        <div className="bg-neutral-100 p-3 rounded font-mono text-xs select-all">
                            Asociația pentru visuri și oportunități - Centru Logistic<br />
                            Str. Exemplului Nr. 10, Sector 1, București<br />
                            Tel: 0700 000 000<br />
                            COD Scrisoare: {scrisoareId.slice(0, 8)} (Scrie pe cutie!)
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-bold">📤 Confirmă expedierea (AWB)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Firma Curier</Label>
                            <Input placeholder="ex: Fan Courier" value={provider} onChange={e => setProvider(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Număr AWB</Label>
                            <Input placeholder="ex: 123456789" value={awb} onChange={e => setAwb(e.target.value)} />
                        </div>
                    </div>
                    {/* File upload skipped for MVP text-only inputs requested in prompt logic first? 
                       Prompt said: "AWB form submits awbNumber or file". I'll use text for speed and reliability in Action.
                   */}

                    <Button onClick={handleSubmitAwb} className="w-full" disabled={!awb || !provider || loading}>
                        {loading ? 'Confirmare...' : 'Confirmă expedierea'}
                    </Button>
                </div>
            </div>
        )
    }

    if (view === 'CONFIRMATION') {
        return (
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center">
                <h3 className="text-2xl mb-2">🎉 Mulțumim!</h3>
                <p className="text-green-800">Am înregistrat AWB-ul. Vom urmări livrarea și te vom notifica când ajunge la destinație.</p>
                {provider && awb ? (
                    <p className="mt-4 text-sm text-green-950">
                        Curier: <span className="font-semibold">{provider}</span>
                        {" · "}
                        AWB: <span className="font-semibold">{awb}</span>
                    </p>
                ) : null}
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
                    Înapoi la scrisoare
                </Button>
            </div>
        )
    }

    return null
}
