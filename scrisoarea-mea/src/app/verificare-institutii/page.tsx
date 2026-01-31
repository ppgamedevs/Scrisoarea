import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react"

export default function VerificareInstitutiiPage() {
    return (
        <main className="min-h-screen bg-neutral-50 py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
                    <h1 className="text-4xl font-bold text-neutral-900">Standarde de Verificare</h1>
                    <p className="text-lg text-neutral-500">
                        Colaborăm doar cu entități juridice care pot dovedi transparență și responsabilitate legală.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl">1. Verificare Juridică</h3>
                        <p className="text-neutral-600">
                            Solicităm certificatul de înregistrare fiscală (CIF/CUI) și statutul asociației. Verificăm prezența în Registrul Asociațiilor și Fundațiilor și lipsa datoriilor fiscale majore.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl">2. Identitate Reprezentant</h3>
                        <p className="text-neutral-600">
                            Fiecare cont de partener este legat de o persoană fizică reală (Director sau Asistent Social), a cărei identitate este confirmată. Nu acceptăm conturi generice anonime.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-xl">3. Monitorizare Continuă</h3>
                        <p className="text-neutral-600">
                            Monitorizăm rata de confirmare a livrărilor. Partenerii care nu încarcă dovezile la timp sau încalcă regulile de protecție a datelor sunt suspendați automat.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
