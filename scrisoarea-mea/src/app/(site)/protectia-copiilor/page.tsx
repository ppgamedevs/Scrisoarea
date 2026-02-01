export default function ProtectiaCopiilorPage() {
    return (
        <main className="min-h-screen bg-slate-50 py-20 text-slate-900">
            <div className="container mx-auto px-6 max-w-3xl">
                <header className="mb-12 border-b border-slate-200 pb-8">
                    <h1 className="text-3xl font-bold mb-4">Protecția Copiilor și Date Personale</h1>
                    <p className="text-lg text-slate-600">
                        Siguranța beneficiarilor este prioritatea zero. Nu facem compromisuri pentru marketing.
                    </p>
                </header>

                <div className="space-y-10">
                    <section>
                        <h2 className="text-xl font-bold mb-3">Date minime colectate</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Nu stocăm numele de familie ale copiilor în format public. În baza de date, identitatea completă este accesibilă doar administratorilor verificati și instituției partenere. Pseudonimele sunt folosite oriunde este posibil.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">Fără conturi pentru copii</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Copiii nu interacționează direct cu platforma. Toată activitatea este gestionată exclusiv de asistenții sociali sau reprezentanții legali ai instituțiilor partenere verificate.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">Fără contact direct</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Platforma nu facilitează și interzice strict contactul direct ne-mediat între donatori și beneficiari. Orice comunicare (ex: scrisori de mulțumire) este filtrată prin instituție.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">Moderare conținut media</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Orice fotografie sau video încărcat ca dovadă trece printr-un proces manual de aprobare. Respingem automat materialele care expun vulnerabilitatea copilului, locația exactă sau elemente de identificare sensibile.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3">Dreptul la ștergere (uitare)</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Orice reprezentant legal poate solicita ștergerea definitivă a datelor asociate unui beneficiar. Această acțiune este ireversibilă și se execută în maxim 48h de la solicitare.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}
