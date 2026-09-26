import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermeniPage() {
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
                    <h1>Termeni și Condiții</h1>
                    <p className="lead">Platforma „Visuri pe hartie”</p>
                    <p><strong>Ultima actualizare:</strong> 5 februarie 2026</p>

                    <h3>1. Despre platformă</h3>
                    <p>Visuri pe hartie este o platformă online care ajută la îndeplinirea unor dorințe concrete ale copiilor aflați în centre de plasament sau alte forme de protecție, prin intermediul unor scrisori reale, publicate de instituții partenere verificate.</p>
                    <p>Platforma oferă infrastructura necesară pentru:</p>
                    <ul>
                        <li>publicarea dorințelor,</li>
                        <li>colectarea donațiilor,</li>
                        <li>îndeplinirea personală a dorințelor,</li>
                        <li>redirecționarea procentelor din impozit (3,5% și sponsorizări),</li>
                        <li>afișarea dovezilor de livrare și a impactului.</li>
                    </ul>
                    <p>Platforma nu este un magazin online și nu comercializează bunuri sau servicii.</p>

                    <h3>2. Acceptarea termenilor</h3>
                    <p>Prin utilizarea platformei Visuri pe hartie, prin navigare, completarea formularelor sau efectuarea unei donații, confirmați că ați citit, înțeles și acceptat acești Termeni și Condiții.</p>
                    <p>Dacă nu sunteți de acord cu acești termeni, vă rugăm să nu utilizați platforma.</p>

                    <h3>3. Principii fundamentale</h3>
                    <p>Platforma funcționează pe baza unor principii clare:</p>
                    <ul>
                        <li><strong>Protecția copiilor:</strong> copiii nu au conturi și nu pot fi contactați direct.</li>
                        <li><strong>Fără comision din donații:</strong> 100% din donațiile pentru dorințe sunt direcționate către îndeplinirea acestora.</li>
                        <li><strong>Transparență:</strong> progresul, livrarea și impactul sunt vizibile public, într-o formă moderată.</li>
                        <li><strong>Respect și demnitate:</strong> nu folosim limbaj emoțional manipulativ și nu expunem copii sau situații sensibile.</li>
                    </ul>

                    <h3>4. Utilizatori</h3>
                    <p>Platforma poate fi utilizată de:</p>
                    <ul>
                        <li>Vizitatori, care pot accesa conținutul public;</li>
                        <li>Donatori, cu sau fără cont;</li>
                        <li>Instituții partenere, care pot publica scrisori și dovezi, doar după verificare;</li>
                        <li>Operatorii platformei, care asigură moderarea și funcționarea corectă.</li>
                    </ul>

                    <h3>5. Scrisorile și conținutul publicat</h3>
                    <p>Scrisorile sunt publicate exclusiv de instituții partenere verificate.</p>
                    <p>Fiecare scrisoare:</p>
                    <ul>
                        <li>reprezintă o dorință concretă;</li>
                        <li>are o valoare maximă implicită de 500 lei;</li>
                        <li>poate include o fotografie sau un scurt clip video moderat;</li>
                        <li>este verificată înainte de publicare.</li>
                    </ul>
                    <p>În cadrul unor campanii sponsorizate, valoarea maximă poate fi mai mare, iar acest lucru este afișat clar.</p>

                    <h3>6. Donații</h3>
                    <p>Donațiile efectuate prin platformă sunt:</p>
                    <ul>
                        <li>voluntare;</li>
                        <li>nerambursabile;</li>
                        <li>direcționate exclusiv către scopul afișat.</li>
                    </ul>
                    <p>Visuri pe hartie nu reține comisioane din donațiile pentru dorințe.</p>
                    <p>Contribuțiile pentru susținerea funcționării platformei (ex. „Susține platforma”) sunt opționale și clar separate de donațiile către copii.</p>

                    <h3>7. Îndeplinirea personală a dorințelor</h3>
                    <p>În anumite cazuri, utilizatorii pot alege să îndeplinească personal o dorință, trimițând direct cadoul.</p>
                    <p>Această opțiune:</p>
                    <ul>
                        <li>este supusă unor reguli clare;</li>
                        <li>presupune furnizarea unei dovezi de livrare;</li>
                        <li>poate fi limitată sau suspendată în funcție de contextul operațional.</li>
                    </ul>

                    <h3>8. Dovezi de livrare și impact</h3>
                    <p>Pentru marcarea unei dorințe ca îndeplinită, instituțiile partenere trebuie să furnizeze o dovadă (foto sau video), care:</p>
                    <ul>
                        <li>nu arată fața copilului;</li>
                        <li>nu conține date personale;</li>
                        <li>este moderată înainte de publicare.</li>
                    </ul>
                    <p>Platforma își rezervă dreptul de a respinge sau elimina dovezi care nu respectă aceste reguli.</p>

                    <h3>9. Redirecționarea impozitului (3,5% și sponsorizări)</h3>
                    <p>Platforma permite completarea și semnarea electronică a documentelor pentru:</p>
                    <ul>
                        <li>redirecționarea a 3,5% din impozit (persoane fizice);</li>
                        <li>sponsorizări conform legislației fiscale (firme, PFA).</li>
                    </ul>
                    <p>Platforma:</p>
                    <ul>
                        <li>nu este un serviciu ANAF;</li>
                        <li>nu garantează depunerea automată în Spațiul Privat Virtual (SPV);</li>
                        <li>pregătește documentele pentru depunere de către operatorii autorizați ai ONG-ului.</li>
                    </ul>

                    <h3>10. Date personale</h3>
                    <p>Datele personale sunt prelucrate conform <Link href="/confidentialitate">Politicii de Confidențialitate</Link>.</p>
                    <p>Principii esențiale:</p>
                    <ul>
                        <li>colectăm doar datele strict necesare;</li>
                        <li>datele sensibile sunt protejate și mascate;</li>
                        <li>nu vindem și nu cedăm datele către terți în scopuri comerciale.</li>
                    </ul>

                    <h3>11. Limitarea răspunderii</h3>
                    <p>Platforma depune eforturi rezonabile pentru funcționarea corectă, însă:</p>
                    <ul>
                        <li>nu poate garanta lipsa totală a erorilor tehnice;</li>
                        <li>nu răspunde pentru întârzieri cauzate de terți (curieri, instituții publice);</li>
                        <li>nu este responsabilă pentru utilizarea necorespunzătoare a platformei de către utilizatori.</li>
                    </ul>

                    <h3>12. Suspendarea accesului</h3>
                    <p>Ne rezervăm dreptul de a suspenda sau restricționa accesul unui utilizator ori de a elimina conținut, în cazul unor suspiciuni rezonabile de abuz, fraudă sau încălcare a acestor Termeni.</p>

                    <h3>13. Modificarea termenilor</h3>
                    <p>Acești Termeni pot fi actualizați periodic. Versiunea actualizată va fi publicată pe această pagină, cu menționarea datei ultimei modificări.</p>

                    <h3>14. Contact</h3>
                    <p>Pentru întrebări sau clarificări, ne puteți contacta la:<br />
                        📧 <a href="mailto:contact@visuripehartie.ro">contact@visuripehartie.ro</a></p>
                </article>
            </div>
        </main>
    )
}

