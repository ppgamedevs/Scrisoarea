
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Building2, BadgeCheck, FileCheck } from "lucide-react"

export default function SponsorInfoPage() {
    return (
        <main className="min-h-screen bg-[var(--pastel-blue)]/10 font-sans">
            <div className="container mx-auto px-4 py-20 max-w-5xl text-center">
                <BadgeCheck className="w-16 h-16 mx-auto mb-6 text-purple-600" />
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                    Devino <span className="text-purple-600">Sponsor</span> și dublează bucuria
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Companiile pot susține asociația prin sponsorizare directă sau, dacă sunt eligibile, prin redirecționarea impozitului pe profit (Formular 177).
                    Fără costuri extra, doar impact real.
                </p>

                <div className="grid md:grid-cols-3 gap-8 text-left mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Matching 1:1</h3>
                        <p className="text-slate-600">
                            Poți seta reguli automate de matching. Pentru fiecare leu donat de o persoană fizică, compania ta donează încă unul, dublând impactul.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Vizibilitate Brand</h3>
                        <p className="text-slate-600">
                            Logo-ul companiei apare pe scrisorile susținute și în secțiunea de parteneri. Arată comunității că îți pasă.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                            <FileCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Deductibilitate</h3>
                        <p className="text-slate-600">
                            Primești automat contractul de sponsorizare și toate documentele necesare pentru deducerea fiscală.
                        </p>
                    </div>
                </div>

                <div className="bg-[var(--pastel-yellow)]/20 p-8 rounded-3xl border border-amber-100 inline-block max-w-3xl">
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Ești gata să te implici?</h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="text-lg px-8 py-6 h-auto bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200">
                            <Link href="/sponsor/devino-sponsor">Completează Datele Firmei</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                            <Link href="/contact">Contactează-ne</Link>
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-amber-800/70">
                        Procesul durează sub 2 minute. Ai nevoie doar de CUI-ul firmei.
                    </p>
                </div>
            </div>
        </main>
    )
}
