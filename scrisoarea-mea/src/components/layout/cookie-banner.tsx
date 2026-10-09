"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { LegalLink } from "@/components/legal/legal-dialog"

export function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent")
        if (!consent) {
            setVisible(true)
        }
    }, [])

    function acceptAll() {
        localStorage.setItem("cookie_consent", "all")
        setVisible(false)
        // Here we would ideally trigger GTM or Analytics consent update
    }

    function acceptMinimal() {
        localStorage.setItem("cookie_consent", "minimal")
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--pastel-lavender)] border-t border-slate-200 p-4 md:p-6 shadow-2xl z-50 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-slate-700 md:max-w-2xl">
                    <p className="font-bold text-slate-900 mb-1">Politica de Cookie-uri</p>
                    <p>
                        Folosim cookie-uri pentru a analiza traficul și a îmbunătăți experiența utilizatorilor.
                        Poți alege să accepți toate cookie-urile sau doar pe cele strict necesare funcționării site-ului.
                        Mai multe detalii în <LegalLink doc="cookies" className="underline hover:text-slate-900 font-medium">Politica de Cookies</LegalLink>.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                    <Button variant="outline" size="sm" onClick={acceptMinimal} className="flex-1 md:flex-none border-slate-400 text-slate-700 hover:bg-slate-100 min-h-[44px]">
                        Doar Necesare
                    </Button>
                    <Button size="sm" onClick={acceptAll} className="flex-1 md:flex-none bg-emerald-600 text-white hover:bg-emerald-700 border-none min-h-[44px]">
                        Acceptă Tot
                    </Button>
                </div>
            </div>
        </div>
    )
}
