import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConfidentialitatePage() {
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
                    <h1>Politica de Confidențialitate</h1>
                    <p className="lead">Platforma „Vise pe Hârtie”</p>
                    <p><strong>Ultima actualizare:</strong> 5 februarie 2026</p>

                    <h3>1. Introducere</h3>
                    <p>Protejarea datelor personale este o prioritate pentru Vise pe Hârtie.</p>
                    <p>Această Politică explică ce date colectăm, de ce le colectăm, cum le folosim și ce drepturi aveți în legătură cu datele dumneavoastră, în conformitate cu Regulamentul (UE) 2016/679 (GDPR).</p>
                    <p>Prin utilizarea platformei, confirmați că ați citit și înțeles această Politică.</p>

                    <h3>2. Cine suntem</h3>
                    <p>Vise pe Hârtie este o platformă online care facilitează îndeplinirea unor dorințe concrete ale copiilor aflați în sistemul de protecție, prin scrisori publicate de instituții partenere verificate.</p>
                    <p><strong>Operatorul de date este:</strong><br />
                        Asociația Vise pe Hârtie (denumire provizorie, dacă este cazul)<br />
                        Email: <a href="mailto:contact@visepehartie.ro">contact@visepehartie.ro</a></p>

                    <h3>3. Ce tipuri de date colectăm</h3>
                    <p>Colectăm doar datele strict necesare pentru funcționarea platformei.</p>

                    <h4>3.1. Date colectate de la vizitatori</h4>
                    <ul>
                        <li>adresa IP (în scopuri de securitate și prevenire abuz);</li>
                        <li>informații despre dispozitiv și browser (statistici tehnice de bază).</li>
                    </ul>

                    <h4>3.2. Date colectate de la donatori</h4>
                    <ul>
                        <li>adresă de email;</li>
                        <li>suma donată;</li>
                        <li>scrisoarea susținută (dacă este cazul);</li>
                        <li>date de plată procesate exclusiv de procesatori terți (ex. Netopia).</li>
                    </ul>
                    <p>Platforma nu stochează datele cardului.</p>
                    <p>Crearea unui cont de donator este opțională.</p>

                    <h4>3.3. Date pentru redirecționarea impozitului (3,5%)</h4>
                    <p>Pentru completarea formularului de redirecționare, colectăm:</p>
                    <ul>
                        <li>nume și prenume;</li>
                        <li>CNP (prelucrat în condiții de securitate ridicată);</li>
                        <li>adresă;</li>
                        <li>semnătură olografă digitalizată;</li>
                        <li>date de contact.</li>
                    </ul>
                    <p>CNP-ul este:</p>
                    <ul>
                        <li>validat;</li>
                        <li>mascat în interfața de administrare;</li>
                        <li>stocat securizat sau sub formă de hash, acolo unde este posibil.</li>
                    </ul>

                    <h4>3.4. Date pentru sponsorizări (20%)</h4>
                    <p>Pentru firme și PFA-uri:</p>
                    <ul>
                        <li>denumire firmă;</li>
                        <li>CUI;</li>
                        <li>date de contact;</li>
                        <li>valoarea sponsorizării;</li>
                        <li>semnătură (pentru documentele generate).</li>
                    </ul>

                    <h4>3.5. Date ale instituțiilor partenere</h4>
                    <ul>
                        <li>nume instituție;</li>
                        <li>descriere publică;</li>
                        <li>județ;</li>
                        <li>date de contact instituționale;</li>
                        <li>dovezi de livrare (foto/video, fără date personale ale copiilor).</li>
                    </ul>

                    <h3>4. Datele copiilor</h3>
                    <p>Vise pe Hârtie nu colectează și nu prelucrează date personale ale copiilor în mod direct.</p>
                    <ul>
                        <li>copiii nu au conturi;</li>
                        <li>nu pot fi contactați;</li>
                        <li>nu apar nume complete, sau date de identificare;</li>
                        <li>vârsta este afișată doar numeric (ex. „8 ani”).</li>
                    </ul>
                    <p>Orice conținut media este moderat înainte de publicare.</p>

                    <h3>5. Scopurile prelucrării datelor</h3>
                    <p>Datele sunt utilizate exclusiv pentru:</p>
                    <ul>
                        <li>funcționarea platformei;</li>
                        <li>procesarea donațiilor;</li>
                        <li>generarea documentelor fiscale;</li>
                        <li>comunicarea cu utilizatorii;</li>
                        <li>îndeplinirea obligațiilor legale;</li>
                        <li>securitate și prevenirea fraudei;</li>
                        <li>afișarea impactului într-o formă moderată.</li>
                    </ul>
                    <p>Nu folosim datele în scopuri comerciale sau de marketing agresiv.</p>

                    <h3>6. Temeiul legal al prelucrării</h3>
                    <p>Prelucrarea datelor se face în baza:</p>
                    <ul>
                        <li>consimțământului utilizatorului;</li>
                        <li>executării unui serviciu solicitat;</li>
                        <li>obligațiilor legale;</li>
                        <li>interesului legitim (securitate, prevenirea abuzurilor).</li>
                    </ul>

                    <h3>7. Stocarea și securitatea datelor</h3>
                    <p>Aplicăm măsuri tehnice și organizatorice adecvate, inclusiv:</p>
                    <ul>
                        <li>criptare;</li>
                        <li>mascarea datelor sensibile;</li>
                        <li>control strict al accesului;</li>
                        <li>jurnalizare a acțiunilor administrative.</li>
                    </ul>
                    <p>Datele sunt păstrate doar pe perioada necesară scopurilor declarate sau conform cerințelor legale.</p>

                    <h3>8. Partajarea datelor</h3>
                    <p>Datele pot fi partajate doar cu:</p>
                    <ul>
                        <li>procesatori de plăți (ex. Netopia);</li>
                        <li>furnizori de servicii tehnice (hosting, email);</li>
                        <li>autorități publice, dacă este impus de lege.</li>
                    </ul>
                    <p>Nu vindem și nu cedăm datele către terți în scopuri comerciale.</p>

                    <h3>9. Drepturile dumneavoastră</h3>
                    <p>Aveți următoarele drepturi:</p>
                    <ul>
                        <li>dreptul de acces;</li>
                        <li>dreptul la rectificare;</li>
                        <li>dreptul la ștergere (în limitele legii);</li>
                        <li>dreptul la restricționarea prelucrării;</li>
                        <li>dreptul la opoziție;</li>
                        <li>dreptul la portabilitatea datelor;</li>
                        <li>dreptul de a depune plângere la ANSPDCP.</li>
                    </ul>
                    <p>Pentru exercitarea drepturilor, ne puteți contacta la adresa de email de mai sus.</p>

                    <h3>10. Cookie-uri</h3>
                    <p>Platforma utilizează cookie-uri strict necesare pentru funcționare și, opțional, cookie-uri funcționale.</p>
                    <p>Pentru detalii, consultați <Link href="/cookies">Politica Cookies</Link>.</p>

                    <h3>11. Modificarea politicii</h3>
                    <p>Această Politică poate fi actualizată periodic. Orice modificare va fi publicată pe această pagină, cu actualizarea datei.</p>

                    <h3>12. Contact</h3>
                    <p>Pentru întrebări legate de confidențialitate sau protecția datelor, ne puteți contacta la:<br />
                        📧 <a href="mailto:contact@visepehartie.ro">contact@visepehartie.ro</a></p>
                </article>
            </div>
        </main>
    )
}
