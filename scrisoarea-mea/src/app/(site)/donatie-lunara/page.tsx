import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export const metadata = {
    title: "Donație lunară",
    description: "Susține lunar Vise pe hârtie și ajută copiii să își îndeplinească dorințele.",
}

export default function DonatieLunaraPage() {
    return (
        <main className="min-h-screen bg-[var(--pastel-cream)] py-20 px-4">
            <div className="container mx-auto max-w-2xl text-center space-y-8">
                <span className="inline-flex items-center gap-2 bg-[var(--pastel-lavender)] text-slate-700 px-4 py-1.5 rounded-full text-sm font-bold">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Devino Eroul Nostru
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Donație lunară</h1>
                <p className="text-slate-600 text-lg leading-relaxed">
                    Contribuția ta lunară ne ajută să găsim copiii, să verificăm poveștile și să livrăm bucurie constant. 
                    În curând vei putea seta o donație recurentă direct aici (10, 25 sau 50 lei/lună). Până atunci, 
                    poți alege o dorință de pe site și să o îndeplinești cu o singură donație.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12">
                        <Link href="/scrisori">Găsește o dorință</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 h-12">
                        <Link href="/contact">Contactează-ne</Link>
                    </Button>
                </div>
                <p className="text-sm text-slate-500">Securizat prin Stripe • Transparență totală</p>
            </div>
        </main>
    )
}
