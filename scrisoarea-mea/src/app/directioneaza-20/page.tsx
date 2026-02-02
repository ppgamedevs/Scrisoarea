import Form177 from "@/components/forms/form-177"

export default function Directioneaza20Page() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Transformă Impozitul Companiei în Fapte Bune.
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        Redirecționează până la 20% din impozitul pe profit sau venit prin Formularul 177.
                        Cost zero pentru companie. Impact maxim pentru comunitate.
                    </p>
                    <div className="flex justify-center gap-8 text-blue-200 text-sm font-semibold tracking-wider uppercase">
                        <span>🏢 Pentru Firme</span>
                        <span>📄 Contract Instant</span>
                        <span>🤝 Transparent</span>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 -mt-10 mb-20 relative z-20">
                <div className="max-w-4xl mx-auto">
                    <Form177 />
                </div>
            </section>

            <section className="py-16 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Procesul pe scurt</h2>
                    <ul className="text-left space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200 inline-block mx-auto">
                        <li className="flex gap-3">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <span className="text-slate-700">Completezi datele companiei și suma estimată.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <span className="text-slate-700">Primești automat Contractul de Sponsorizare și instrucțiunile.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                            <span className="text-slate-700">Contabilul tău sau noi depunem Declarația 177 în SPV pentru a direcționa suma.</span>
                        </li>
                    </ul>
                </div>
            </section>
        </main>
    )
}
