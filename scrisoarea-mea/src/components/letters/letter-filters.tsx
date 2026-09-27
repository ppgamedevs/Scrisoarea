"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export function LetterFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get("q") || "")
    const [category, setCategory] = useState(searchParams.get("category") || "all")
    const [status, setStatus] = useState(searchParams.get("status") || "all") // Default all public

    // Chips state for quick selection
    const activeFiltersCount = [q, category !== 'all', status !== 'all'].filter(Boolean).length

    function applyFilters(newParams?: any) {
        const params = new URLSearchParams(searchParams.toString())

        // Merge state or overrides
        const finalQ = newParams?.q !== undefined ? newParams.q : q
        const finalCat = newParams?.category !== undefined ? newParams.category : category
        const finalStatus = newParams?.status !== undefined ? newParams.status : status

        if (finalCat && finalCat !== "all") {
            const slugMap: Record<string, string> = {
                EDUCATIE: "educatie",
                RECHIZITE: "educatie",
                IMBRACAMINTE: "imbracaminte",
                HAINE: "imbracaminte",
                JUCARII: "jucarii",
                SPORT: "sport",
                ARTISTIC: "artistic",
                PROVIZII: "provizii",
                MEDICAL: "medical",
                ALTCEVA: "altele",
            }
            router.push(`/scrisori/categorie/${slugMap[finalCat] || finalCat.toLowerCase()}`)
            return
        }

        if (finalQ) params.set("q", finalQ); else params.delete("q")
        if (finalStatus && finalStatus !== "all") params.set("status", finalStatus); else params.delete("status")
        params.delete("category")

        const query = params.toString()
        router.push(query ? `/scrisori?${query}` : "/scrisori")
    }

    // Effect to sync local state with URL if URL changes externally (e.g. back button)
    useEffect(() => {
        setQ(searchParams.get("q") || "")
        setCategory(searchParams.get("category") || "all")
        setStatus(searchParams.get("status") || "all")
    }, [searchParams])


    function handleQuickChip(type: string, value: string) {
        if (type === 'status') {
            setStatus(value)
            applyFilters({ status: value })
        }
    }

    function reset() {
        setQ("")
        setCategory("all")
        setStatus("all")
        router.push("/scrisori")
    }

    return (
        <div className="bg-[var(--pastel-cream)] rounded-xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
            <div className="p-4 border-b bg-[var(--pastel-sage)]/30 flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold uppercase text-slate-500 mr-2">Filtre Rapide:</span>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => handleQuickChip('status', 'NOU')}>Noi</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => handleQuickChip('status', 'ACTIV')}>Active</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-slate-100" onClick={() => handleQuickChip('status', 'FINANTAT')}>Aproape Complet</Badge>

                {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={reset} className="ml-auto text-xs min-h-[44px] px-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <X className="w-3 h-3 mr-1" /> Resetează
                    </Button>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <Input
                        placeholder="Caută (nume, obiect, oraș)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                <Select value={category} onValueChange={(v) => { setCategory(v); applyFilters({ category: v }) }}>
                    <SelectTrigger><SelectValue placeholder="Categorie" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toate categoriile</SelectItem>
                        <SelectItem value="EDUCATIE">Educație</SelectItem>
                        <SelectItem value="IMBRACAMINTE">Îmbrăcăminte</SelectItem>
                        <SelectItem value="JUCARII">Jucării</SelectItem>
                        <SelectItem value="SPORT">Sport</SelectItem>
                        <SelectItem value="ARTISTIC">Artistic</SelectItem>
                        <SelectItem value="PROVIZII">Alimente/Igienă</SelectItem>
                        <SelectItem value="MEDICAL">Medical</SelectItem>
                        <SelectItem value="ALTCEVA">Altele</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={status} onValueChange={(v) => { setStatus(v); applyFilters({ status: v }) }}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Status: Oricare</SelectItem>
                        <SelectItem value="NOU">Nou (Nefinanțat)</SelectItem>
                        <SelectItem value="ACTIV">Activ (Parțial)</SelectItem>
                        <SelectItem value="FINANTAT">Finanțat (În așteptare livrare)</SelectItem>
                        <SelectItem value="INCHIS">Închis (Livrat)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
