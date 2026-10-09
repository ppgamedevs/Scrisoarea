"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerSponsor } from "@/app/actions/sponsor-actions"
import { toast } from "sonner"
import { CheckCheck } from "lucide-react"
import { LegalLink } from "@/components/legal/legal-dialog"

export default function SponsorRegistrationPage() {
    return (
        <main className="min-h-screen bg-[var(--pastel-blue)]/5 py-12 px-4 md:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600 w-full" />
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600">
                            <CheckCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Înregistrare Sponsor</h1>
                        <p className="text-slate-500">
                            Completează datele firmei pentru a începe. Durează mai puțin de 2 minute.
                        </p>
                    </div>

                    <form action={registerSponsor}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Nume Companie *</Label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    placeholder="Ex: Compania Bunăvoință SRL"
                                    required
                                    className="bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cui">Cod Unic de Înregistrare (CUI) *</Label>
                                <Input
                                    id="cui"
                                    name="cui"
                                    placeholder="RO123456"
                                    required
                                    className="bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Adresă Sediu *</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    placeholder="Ex: Str. Speranței nr. 1, Brașov"
                                    required
                                    className="bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website Companie (Opțional)</Label>
                                <Input
                                    id="website"
                                    name="website"
                                    placeholder="https://compania-ta.ro"
                                    className="bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-4 flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="terms"
                                    required
                                    className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                                />
                                <Label htmlFor="terms" className="text-sm font-normal text-slate-600 cursor-pointer select-none">
                                    Sunt reprezentant legal al acestei companii și sunt de acord cu <LegalLink doc="termeni" className="text-purple-600 underline">Termenii și Condițiile</LegalLink> pentru sponsori.
                                </Label>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Button type="submit" size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-200 group">
                                Confirmă și Activează Contul
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Datele tale sunt prelucrate conform politicii GDPR.
                    </p>
                </div>
            </div>
        </main>
    )
}
