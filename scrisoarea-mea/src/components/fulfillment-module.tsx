"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFulfillmentClaim, submitAwb } from "@/app/actions/fulfill"

type ClaimState = 'NONE' | 'PENDING_MY_SESSION' | 'PENDING_OTHERS' | 'SHIPPED'

// We pass the current active claim if it exists
export default function FulfillmentModule({
    scrisoareId,
    activeClaim
}: {
    scrisoareId: string
    activeClaim: any
}) {
    const [view, setView] = useState<'INITIAL' | 'EMAIL_FORM' | 'INSTRUCTIONS' | 'AWB_FORM' | 'CONFIRMATION'>('INITIAL')
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')

    const [awb, setAwb] = useState('')
    const [provider, setProvider] = useState('')

    // State initialization logic
    if (view === 'INITIAL') {
        if (activeClaim) {
            // If this user JUST created it in this session, we might want to show Instructions.
            // But since this is a server render reload, we don't know if "I" am the user without Auth.
            // For MVP, if there is a PENDING claim, we show "Locked" message to everyone.
            // Unless we store a cookie "my_claim_id".
            // USER Prompt Requirement: "After claim created: show shipping instructions...".
            // This implies the user doesn't leave the page. We can manage state locally after success.
        }
    }

    const [claimId, setClaimId] = useState<string | null>(null)

    const handleCreateClaim = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await createFulfillmentClaim(scrisoareId, email)
            if (res.claimId) setClaimId(res.claimId)
            setView('INSTRUCTIONS') // Proceed to instructions
        } catch (e: any) {
            setError(e.message)
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
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">În curs de livrare</h3>
                    <p className="text-amber-800 text-sm">
                        Un donator a preluat această dorință și pachetul este pe drum.
                    </p>
                </div>
            )
        }

        // If PENDING (Reserved 48h)
        // If we are in the "Just Created" flow (view=INSTRUCTIONS), we show the form.
        // If just visiting, we show "Locked".
        if (view === 'INITIAL') {
            return (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-center">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Rezervat temporar</h3>
                    <p className="text-amber-800 text-sm">
                        Un donator s-a angajat să îndeplinească această dorință. <br />
                        Dacă nu confirmă livrarea în 48h, cererea va reveni publică.
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
                    <Button onClick={() => setView('EMAIL_FORM')} className="w-full bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 py-6 text-lg transition-colors font-bold">
                        Vreau să pregătesc cadoul
                    </Button>
                    <p className="text-xs text-slate-400 mt-2">
                        Ai la dispoziție 48h să confirmi expedierea.
                    </p>
                </div>
            </div>
        )
    }

    // 3. Email Form
    if (view === 'EMAIL_FORM') {
        return (
            <div className="bg-white border p-8 rounded-xl space-y-4">
                <h3 className="font-bold">Pasul 1: Date de contact</h3>
                <p className="text-sm text-neutral-500">Avem nevoie de email-ul tău pentru a-ți trimite instrucțiunile și reminder pentru AWB.</p>

                <div className="space-y-2">
                    <Label>Adresa de Email</Label>
                    <Input
                        placeholder="nume@exemplu.ro"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setView('INITIAL')} disabled={loading}>Anulează</Button>
                    <Button onClick={handleCreateClaim} disabled={loading || !email.includes('@')} className="flex-1">
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
                <div className="bg-green-50 text-green-800 p-4 rounded mb-4">
                    ✅ <strong>Dorința e rezervată pt tine!</strong> Ai 48 de ore la dispoziție.
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold border-b pb-2">📦 Instrucțiuni de livrare</h4>
                    <div className="text-sm space-y-2 text-neutral-700">
                        <p>1. Pregătește pachetul cu obiectele: <strong>(Vezi lista din stânga)</strong>.</p>
                        <p>2. Nu include datele tale personale sau scrisori în pachet.</p>
                        <p>3. Expediază prin orice curier la adresa:</p>
                        <div className="bg-neutral-100 p-3 rounded font-mono text-xs select-all">
                            Asociația Scrisoarea Mea - Centru Logistic<br />
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
                <p className="text-green-800">AM înregistrat AWB-ul. Vom urmări livrarea și te vom notifica când ajunge la destinație.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
                    Înapoi la scrisoare
                </Button>
            </div>
        )
    }

    return null
}
