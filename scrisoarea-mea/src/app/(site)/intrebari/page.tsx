import { JsonLd } from "@/components/seo/json-ld"
import { FAQ_ITEMS } from "@/lib/constants"
import { generateFaqSchema } from "@/lib/seo/jsonld"
import { pageMetadata } from "@/lib/seo/metadata"

export const metadata = pageMetadata({
    title: "Întrebări frecvente despre donații și scrisori",
    description:
        "Răspunsuri clare: cum donezi, cum ajunge cadoul, cum se verifică cazurile, 3,5% și sponsorizare 20%. Visuri pe hârtie, visuripehartie.ro.",
    path: "/intrebari",
    keywords: ["FAQ donații", "formular 230", "cadou copil", "ONG verificat"],
})

const FAQ_INDEX = [
    {
        category: "Pentru Donatori",
        questions: [
            { q: "Pot deduce donația din impozit?", a: "Da, pentru companii (prin contract de sponsorizare) și parțial pentru persoane fizice dacă legislația permite redirecționarea." },
            { q: "Pot trimite produse folosite?", a: "În general nu, pentru a asigura demnitatea și calitatea, dar acceptăm electrocasnice funcționale verificate în cazuri speciale." },
            { q: "Primesc confirmare pe email?", a: "Da, la fiecare pas important: preluare plată, finanțare completă, livrare cadou." }
        ]
    },
    {
        category: "Despre Siguranță",
        questions: [
            { q: "Cum garantați că e un caz real?", a: "Lucrăm doar cu instituții juridice (ONG-uri, Școli) pe care le audităm contractual. Nu acceptăm cazuri 'de pe stradă' neverificate." },
            { q: "Unde ajung banii?", a: "Într-un cont dedicat al Asociației pentru visuri și oportunități, de unde se fac plățile direct către furnizorii de produse (magazine)." }
        ]
    },
    {
        category: "Logistică",
        questions: [
            { q: "Cât durează livrarea?", a: "În medie 3-7 zile de la finanțarea completă, în funcție de stocul magazinelor." },
            { q: "Cine plătește transportul?", a: "Costul transportului este inclus în marja operațională sau acoperit de sponsori logistici." }
        ]
    }
]

export default function IntrebariPage() {
    return (
        <main className="min-h-screen bg-white py-12 px-4">
            <JsonLd data={generateFaqSchema([...FAQ_ITEMS, ...FAQ_INDEX.flatMap((cat) => cat.questions)])} />
            <div className="container mx-auto max-w-3xl prose prose-slate">
                <h1 className="text-3xl font-bold mb-12">Index Întrebări Frecvente</h1>

                {FAQ_INDEX.map((cat, i) => (
                    <section key={i} className="mb-12">
                        <h2 className="text-2xl font-bold border-b pb-2 mb-6 text-slate-900">{cat.category}</h2>
                        <div className="space-y-8">
                            {cat.questions.map((item, j) => (
                                <div key={j}>
                                    <h3 className="font-bold text-lg text-slate-800 mt-0 mb-2">{item.q}</h3>
                                    <p className="text-slate-600 mb-0">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                <section className="bg-slate-50 p-6 rounded-lg mt-12 text-center">
                    <p className="font-medium">Nu ai găsit răspunsul?</p>
                    <p><a href="/contact">Contactează echipa de suport.</a></p>
                </section>
            </div>
        </main>
    )
}
