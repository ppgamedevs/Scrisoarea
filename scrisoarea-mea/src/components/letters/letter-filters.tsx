"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function LetterFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get("q") || "")
    const [county, setCounty] = useState(searchParams.get("county") || "all")
    const [category, setCategory] = useState(searchParams.get("category") || "all")
    const [status, setStatus] = useState(searchParams.get("status") || "all")

    function applyFilters() {
        const params = new URLSearchParams()
        if (q) params.set("q", q)
        if (county && county !== "all") params.set("county", county)
        if (category && category !== "all") params.set("category", category)
        if (status && status !== "all") params.set("status", status)

        router.push(`/scrisori?${params.toString()}`)
    }

    function reset() {
        setQ("")
        setCounty("all")
        setCategory("all")
        setStatus("all")
        router.push("/scrisori")
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 mb-8">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-500">Filtrează Scrisorile</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <Input
                        placeholder="Caută (nume/obiect)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Categorie" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toate categoriile</SelectItem>
                        <SelectItem value="HAINE">Haine & Încălțăminte</SelectItem>
                        <SelectItem value="RECHIZITE">Rechizite Școlare</SelectItem>
                        <SelectItem value="JUCARII">Jucării</SelectItem>
                        <SelectItem value="MEDICAL">Medical</SelectItem>
                        <SelectItem value="ALTCEVA">Altele</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Oricare</SelectItem>
                        <SelectItem value="ACTIV">Active (Neîndeplinite)</SelectItem>
                        <SelectItem value="FINANTAT">Finanțate</SelectItem>
                        <SelectItem value="INCHIS">Închise (Livrate)</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Button className="flex-1 bg-slate-900 text-white" onClick={applyFilters}>Aplică</Button>
                    <Button variant="outline" onClick={reset}>Reset</Button>
                </div>
            </div>
        </div>
    )
}
