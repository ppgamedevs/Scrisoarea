export default function Directioneaza35Page() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white py-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Redirecționează 3,5% din impozit.<br />
                        Gratuit. Simplu. De impact.
                    </h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
                        Nu te costă nimic să ajuți. Completează formularul online în 2 minute, iar noi ne ocupăm de depunere.
                        Banii tăi vor ajunge la copiii care au nevoie de sprijin.
                    </p>
                    <div className="flex justify-center gap-8 text-indigo-200 text-sm font-semibold tracking-wider uppercase">
                        <span>⏳ Durează 2 minute</span>
                        <span>🔒 Date Securizate</span>
                        <span>📄 100% Online</span>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 -mt-10 mb-20 relative z-20">
                <div className="max-w-4xl mx-auto">
                    import Form230 from "@/components/forms/form-230"
                    <Form230 />
                </div>
            </section>

            <section className="py-16 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Cum funcționează?</h2>
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        <div>
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                            <h3 className="font-semibold mb-2">Completezi</h3>
                            <p className="text-slate-500 text-sm">Introduci datele tale și semnezi direct pe ecran.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                            <h3 className="font-semibold mb-2">Generăm PDF</h3>
                            <p className="text-slate-500 text-sm">Platforma creează automat Formularul 230 valid.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                            <h3 className="font-semibold mb-2">Depunem Noi</h3>
                            <p className="text-slate-500 text-sm">Noi centralizăm și depunem formularele la ANAF.</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

import Form230 from "@/components/forms/form-230"
