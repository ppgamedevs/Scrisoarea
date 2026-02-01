export const metadata = {
    title: "Siguranță și Protecția Datelor | Scrisoarea Mea",
    description: "Politici explicite privind protecția identității copiilor, moderarea conținutului și securitatea datelor.",
}

export default function SigurantaPage() {
    return (
        <main className="min-h-screen bg-white py-12 px-4">
            <div className="container mx-auto max-w-3xl prose prose-slate">
                <h1 className="text-3xl font-bold mb-8">Politici de Siguranță și Protecție</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Principiul "Safety First"</h2>
                    <p>Securitatea fizică și emoțională a copiilor este prioritară în fața oricărui obiectiv de marketing sau fundraising. Nu exploatăm imagini cu copii plângând și nu expunem locații exacte.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Ce date publicăm</h2>
                    <ul className="list-disc pl-5">
                        <li>Prenumele copilului (sau pseudonim, dacă este solicitat).</li>
                        <li>Vârsta și localitatea generală (Județ/Oraș).</li>
                        <li>Povestea trunchiată pentru a elimina elemente de identificare precisă (școala exactă, strada).</li>
                        <li>Nevoia materială specifică (mărime haine, tip rechizite).</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Ce NU publicăm</h2>
                    <ul className="list-disc pl-5">
                        <li>Numele de familie al copilului.</li>
                        <li>Adresa de domiciliu sau a centrului de plasament.</li>
                        <li>Diagnostic medical detaliat și invaziv fără acord.</li>
                        <li>Date de contact ale minorilor.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Moderarea Media</h2>
                    <p>Fiecare fotografie încărcată trece prin două filtre:</p>
                    <ol className="list-decimal pl-5">
                        <li><strong>Automat:</strong> Verificare pentru conținut neadecvat.</li>
                        <li><strong>Uman:</strong> Un moderator verifică dacă imaginea respectă demnitatea copilului. Dacă fața este vizibilă fără acord GDPR semnat, aceasta este blurată sau respinsă.</li>
                    </ol>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Raportare Abuz</h2>
                    <p>Pentru orice suspiciune legată de veridicitatea unui caz sau siguranța datelor, vă rugăm să ne contactați de urgență la <a href="mailto:safety@scrisoareamea.ro">safety@scrisoareamea.ro</a>.</p>
                </section>
            </div>
        </main>
    )
}
