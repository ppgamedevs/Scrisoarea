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

    function accept() {
        localStorage.setItem("cookie_consent", "true")
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 md:p-6 shadow-2xl z-50 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-300 md:max-w-2xl">
                    <p>
                        Folosim cookie-uri esențiale pentru a asigura buna funcționare a platformei.
                        Continuarea navigării implică acceptul <Link href="/cookies" className="underline hover:text-white">Politicii de Cookies</Link>.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={() => setVisible(false)} className="flex-1 md:flex-none border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
                        Închide
                    </Button>
                    <Button size="sm" onClick={accept} className="flex-1 md:flex-none bg-white text-slate-900 hover:bg-slate-100">
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    )
}
