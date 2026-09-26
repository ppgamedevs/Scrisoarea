import { pageMetadata } from "@/lib/seo/metadata"

export const metadata = pageMetadata({
    title: "Procese: de la scrisoare la livrare",
    description:
        "Fluxul operațional Visuri pe hârtie: înregistrare partener, moderare, donație, achiziție și dovadă de predare.",
    path: "/procese",
    keywords: ["proces donație", "moderare scrisori"],
})

export default function ProcesePage() {
    return (
        <main className="min-h-screen bg-white py-12 px-4">
            <div className="container mx-auto max-w-3xl prose prose-slate">
                <h1 className="text-3xl font-bold mb-8">Procese Operaționale</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">1. Înregistrare Partener (Onboarding)</h2>
                    <ul className="list-disc pl-5">
                        <li>Instituția aplică prin formularul dedicat.</li>
                        <li>Echipa Visuri pe hartie verifică CUI-ul și statutul juridic în ANAF.</li>
                        <li>Se semnează contractul de colaborare și GDPR.</li>
                        <li>Partenerul primește acces în Dashboard.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">2. Moderarea Scrisorii</h2>
                    <ul className="list-disc pl-5">
                        <li>Asistentul social încarcă povestea și necesarul.</li>
                        <li>Status inițial: <code>PENDING_MODERATION</code>.</li>
                        <li>Moderator Visuri pe hartie verifică textul și costurile estimate.</li>
                        <li>Dacă e aprobată, scrisoarea devine <code>ACTIV</code> și apare pe site.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">3. Donația / Rezervarea</h2>
                    <p>Există două rute de finanțare:</p>
                    <ul>
                        <li><strong>Donație Online:</strong> Banii se strâng într-un cont colector. Când se atinge suma (Status: <code>FINANTAT</code>), asociația comandă produsele.</li>
                        <li><strong>Îndeplinire Personală:</strong> Donatorul rezervă cazul (Status: <code>REZERVAT</code>). Are 5 zile să confirme expedierea. Dacă nu confirmă, cazul redevine <code>ACTIV</code>.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">4. Livrare și Confirmare</h2>
                    <ul className="list-disc pl-5">
                        <li>Partenerul primește produsele.</li>
                        <li>Produsele sunt predate copilului.</li>
                        <li>Partenerul face o poză cu predarea (fără față dacă necesar).</li>
                        <li>Poza se încarcă în platformă (Status: <code>INCHIS</code>).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">5. Închiderea Cazului</h2>
                    <p>Odată ce dovada este aprobată de moderatori, cazul este marcat definitiv ca <code>LIVRAT/INCHIS</code>, iar donatorii primesc notificarea de succes.</p>
                </section>
            </div>
        </main>
    )
}
