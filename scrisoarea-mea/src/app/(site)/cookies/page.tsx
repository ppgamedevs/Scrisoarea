import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-white py-12 px-4 md:py-20">
            <div className="container mx-auto max-w-3xl">
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild className="-ml-3 text-slate-500 hover:text-slate-900">
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Înapoi la prima pagină
                        </Link>
                    </Button>
                </div>

                <article className="prose prose-slate max-w-none">
                    <h1>Politica de Cookies</h1>
                    <p className="lead">Platforma „Visuri pe hartie”</p>
                    <p><strong>Ultima actualizare:</strong> 5 februarie 2026</p>

                    <h3>1. Ce sunt cookie-urile</h3>
                    <p>Cookie-urile sunt fișiere mici de text stocate pe dispozitivul dumneavoastră (computer, telefon, tabletă) atunci când vizitați un site web.</p>
                    <p>Acestea ajută site-ul să funcționeze corect, să fie sigur și să ofere o experiență mai bună utilizatorilor.</p>

                    <h3>2. De ce folosim cookie-uri</h3>
                    <p>Platforma Visuri pe hartie folosește cookie-uri exclusiv pentru:</p>
                    <ul>
                        <li>funcționarea corectă a site-ului;</li>
                        <li>reținerea preferințelor de consimțământ;</li>
                        <li>securitate și prevenirea abuzurilor;</li>
                        <li>funcționalități esențiale (autentificare, formulare, sesiuni).</li>
                    </ul>
                    <p>Nu folosim cookie-uri pentru publicitate agresivă sau tracking comercial.</p>

                    <h3>3. Tipuri de cookie-uri utilizate</h3>

                    <h4>3.1. Cookie-uri strict necesare</h4>
                    <p>Aceste cookie-uri sunt esențiale pentru funcționarea platformei și nu pot fi dezactivate.</p>
                    <p>Exemple:</p>
                    <ul>
                        <li>cookie-uri de sesiune;</li>
                        <li>cookie-uri de autentificare;</li>
                        <li>cookie-uri de securitate;</li>
                        <li>cookie-uri pentru prevenirea abuzurilor.</li>
                    </ul>
                    <p>Fără acestea, platforma nu poate funcționa corect.</p>

                    <h4>3.2. Cookie-uri funcționale (opționale)</h4>
                    <p>Aceste cookie-uri ajută la îmbunătățirea experienței utilizatorului, de exemplu:</p>
                    <ul>
                        <li>reținerea preferințelor (limbă, consimțământ cookie);</li>
                        <li>funcții de confort.</li>
                    </ul>
                    <p>Aceste cookie-uri sunt utilizate doar dacă vă exprimați consimțământul.</p>

                    <h4>3.3. Cookie-uri de analiză</h4>
                    <p>În prezent, Visuri pe hartie nu utilizează cookie-uri de analiză invazive (ex. tracking publicitar).</p>
                    <p>Dacă, în viitor, vor fi introduse instrumente de analiză statistică, acestea vor fi:</p>
                    <ul>
                        <li>limitate;</li>
                        <li>anonimizate;</li>
                        <li>activate doar cu consimțământ explicit.</li>
                    </ul>

                    <h3>4. Cookie-uri terțe</h3>
                    <p>Anumite funcționalități pot implica furnizori terți, de exemplu:</p>
                    <ul>
                        <li>procesatori de plăți (ex. Netopia);</li>
                        <li>servicii de hosting;</li>
                        <li>servicii de email.</li>
                    </ul>
                    <p>Acești furnizori pot utiliza cookie-uri proprii, în conformitate cu politicile lor de confidențialitate.</p>

                    <h3>5. Consimțământul dumneavoastră</h3>
                    <p>La prima vizită pe platformă, vi se solicită acordul printr-un banner de cookie-uri.</p>
                    <p>Aveți următoarele opțiuni:</p>
                    <ul>
                        <li>Acceptă tot</li>
                        <li>Doar necesare</li>
                    </ul>
                    <p>Preferința dumneavoastră este salvată și poate fi modificată ulterior prin setările browserului sau prin ștergerea cookie-urilor.</p>

                    <h3>6. Cum puteți controla cookie-urile</h3>
                    <p>Puteți:</p>
                    <ul>
                        <li>șterge cookie-urile existente;</li>
                        <li>bloca cookie-urile viitoare;</li>
                        <li>seta notificări privind utilizarea cookie-urilor,</li>
                    </ul>
                    <p>direct din setările browserului dumneavoastră.</p>
                    <p>Rețineți că dezactivarea cookie-urilor strict necesare poate afecta funcționarea platformei.</p>

                    <h3>7. Protecția datelor</h3>
                    <p>Cookie-urile utilizate nu colectează informații care să vă identifice direct și sunt gestionate conform Politicii de Confidențialitate a platformei.</p>

                    <h3>8. Modificarea politicii</h3>
                    <p>Această Politică de Cookies poate fi actualizată periodic.</p>
                    <p>Orice modificare va fi publicată pe această pagină, cu actualizarea datei.</p>

                    <h3>9. Contact</h3>
                    <p>Pentru întrebări legate de utilizarea cookie-urilor, ne puteți contacta la:<br />
                        📧 <a href="mailto:contact@visuripehartie.ro">contact@visuripehartie.ro</a></p>
                </article>
            </div>
        </main>
    )
}
