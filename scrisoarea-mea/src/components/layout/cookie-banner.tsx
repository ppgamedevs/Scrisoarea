"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"

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
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 md:p-6 shadow-2xl z-50 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-slate-300 md:max-w-2xl">
                    <p className="font-bold text-white mb-1">Politica de Cookie-uri</p>
                    <p>
                        Folosim cookie-uri pentru a analiza traficul și a îmbunătăți experiența utilizatorilor.
                        Poți alege să accepți toate cookie-urile sau doar pe cele strict necesare funcționării site-ului.
                        Mai multe detalii în <Link href="/cookies" className="underline hover:text-white">Politica de Cookies</Link>.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                    <Button variant="outline" size="sm" onClick={acceptMinimal} className="flex-1 md:flex-none border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
                        Doar Necesare
                    </Button>
                    <Button size="sm" onClick={acceptAll} className="flex-1 md:flex-none bg-emerald-600 text-white hover:bg-emerald-700 border-none">
                        Acceptă Tot
                    </Button>
                </div>
            </div>
        </div>
    )
}
