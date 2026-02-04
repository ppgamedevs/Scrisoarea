export default function ConfidentialitatePage() {
    return (
        <main className="min-h-screen bg-white py-20 px-4">
            <div className="container mx-auto max-w-3xl prose prose-slate">
                <h1>Politica de Confidențialitate (GDPR)</h1>

                <h3>1. Operator de date</h3>
                <p>Asociația Vise pe hârtie, cu sediul în București, este operatorul datelor dumneavoastră cu caracter personal.</p>

                <h3>2. Ce date colectăm</h3>
                <ul>
                    <li>Date de identificare (Nume, Prenume) - doar pentru donatori</li>
                    <li>Date de contact (Email) - pentru confirmarea donațiilor și raportare</li>
                    <li>Date financiare - procesate exclusiv prin Stripe (noi nu stocăm datele cardului)</li>
                </ul>

                <h3>3. Scopul prelucrării</h3>
                <p>Folosim aceste date strict pentru:</p>
                <ul>
                    <li>Procesarea donațiilor</li>
                    <li>Emiterea documentelor fiscale</li>
                    <li>Raportarea impactului (fără a face datele publice)</li>
                </ul>

                <h3>4. Drepturile dumneavoastră</h3>
                <p>Aveți dreptul la informare, acces, rectificare și ștergere a datelor ("dreptul de a fi uitat"). Pentru exercitarea acestor drepturi, contactați-ne la contact@scrisoareamea.ro.</p>
            </div>
        </main>
    )
}
