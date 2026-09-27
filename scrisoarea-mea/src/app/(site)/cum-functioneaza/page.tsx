import { JsonLd } from "@/components/seo/json-ld"
import { generateHowToSchema } from "@/lib/seo/jsonld"
import { pageMetadata } from "@/lib/seo/metadata"

export const metadata = pageMetadata({
    title: "Cum funcționează donațiile verificate",
    description:
        "Patru pași: instituția încarcă scrisoarea, o verificăm, donezi, apoi vezi dovada predării. Fără comision din cadou. visuripehartie.ro",
    path: "/cum-functioneaza",
    keywords: ["cum donez", "transparență ONG", "dovadă livrare"],
})

export default function CumFunctioneazaPage() {
    return (
        <main className="min-h-screen bg-neutral-50 py-20">
            <JsonLd data={generateHowToSchema()} />
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">Un proces simplu, verificabil</h1>
                    <p className="text-xl text-neutral-500">
                        Transparența este fundația pe care construim. Iată cum funcționează Visuri pe hartie.
                    </p>
                </div>

                <div className="space-y-12">
                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">1</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Instituția încarcă scrisoarea</h3>
                            <p className="text-neutral-600">Partenerii noștri (asociații, centre de zi, școli speciale) identifică nevoile copiilor și încarcă scrisorile în platformă, împreună cu lista de obiecte necesare.</p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">2</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Verificăm partenerul</h3>
                            <p className="text-neutral-600">Nu acceptăm publicarea scrisorilor până nu validăm juridic instituția parteneră și nu verificăm autenticitatea cazurilor printr-un proces de moderare intern.</p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">3</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Comunitatea contribuie</h3>
                            <p className="text-neutral-600">Donatorii pot alege să finanțeze parțial, total, sau să trimită pachetul direct (pentru anumite cazuri). Sumele sunt 100% direcționate către achiziția bunurilor.</p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">4</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Instituția confirmă livrarea</h3>
                            <p className="text-neutral-600">Odată bunurile recepționate, instituția parteneră are obligația de a filma sau fotografia momentul predării cadoului.</p>
                        </div>
                    </div>

                    <div className="flex gap-6 items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">5</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Publicăm dovada</h3>
                            <p className="text-neutral-600">După anonimizare și moderare (pentru protecția identității), dovada video/foto apare în pagina Impact, închizând ciclul de încredere.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
