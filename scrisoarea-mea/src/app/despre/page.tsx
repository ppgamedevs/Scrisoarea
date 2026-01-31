import { TEAM_MEMBERS } from "@/lib/constants"
import { Users2, Target, Heart, Scale } from "lucide-react"

export default function DesprePage() {
    return (
        <main className="min-h-screen bg-white">
            <section className="bg-slate-50 py-20 px-4 border-b">
                <div className="container mx-auto max-w-4xl text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Despre Noi</h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                        Scrisoarea Mea este o platformă tehnologică non-profit care conectează direct dorințele copiilor din medii vulnerabile cu donatorii care le pot îndeplini, eliminând intermediarii și opacitatea.
                    </p>
                </div>
            </section>

            <section className="py-20 px-4 container mx-auto max-w-5xl">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Misiunea Noastră</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Credem că filantropia modernă trebuie să fie transparentă, eficientă și demnă. Nu folosim imagini dramatice pentru a stârni mila. Ne concentrăm pe demnitatea beneficiarilor și pe bucuria simplă a unei dorințe îndeplinite.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Scopul nostru este să digitalizăm procesul de ajutorare pentru centrele de plasament și asociațiile partenere, reducând birocrația și timpul de așteptare.
                        </p>
                    </div>
                    <div className="bg-slate-100 p-8 rounded-2xl grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <Target className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-bold">Eficiență</h3>
                            <p className="text-xs text-slate-500 mt-1">Fonduri direcționate 100%.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <Users2 className="w-8 h-8 text-emerald-600 mb-3" />
                            <h3 className="font-bold">Comunitate</h3>
                            <p className="text-xs text-slate-500 mt-1">Conexiune umană, nu tranzacțională.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <Scale className="w-8 h-8 text-purple-600 mb-3" />
                            <h3 className="font-bold">Etică</h3>
                            <p className="text-xs text-slate-500 mt-1">Respect pentru demnitatea copilului.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <Heart className="w-8 h-8 text-red-600 mb-3" />
                            <h3 className="font-bold">Impact</h3>
                            <p className="text-xs text-slate-500 mt-1">Rezultate măsurabile imediat.</p>
                        </div>
                    </div>
                </div>

                <div className="mb-24">
                    <h2 className="text-3xl font-bold mb-12 text-center">Echipa</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {TEAM_MEMBERS.map((m, idx) => (
                            <div key={idx} className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-slate-400">
                                    {m.name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-lg">{m.name}</h3>
                                <p className="text-sm text-slate-500">{m.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
