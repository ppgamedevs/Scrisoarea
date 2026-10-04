"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import DirectSponsorshipForm from "@/components/forms/direct-sponsorship-form"
import Form177PrepForm from "@/components/forms/form-177-prep"

type Flow = "choose" | "direct" | "177"

export default function Directioneaza20Client({
    beneficiaryName,
    anafRegistryConfirmed,
}: {
    beneficiaryName: string
    anafRegistryConfirmed: boolean
}) {
    const [flow, setFlow] = useState<Flow>("choose")

    return (
        <main className="min-h-screen bg-slate-50">
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-16 text-white">
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="absolute left-4 top-0 hidden pt-8 md:block md:pt-10">
                        <Link
                            href="/"
                            className="inline-flex items-center text-blue-300 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi acasă
                        </Link>
                    </div>
                    <h1 className="mt-8 text-4xl font-bold tracking-tight md:mt-0 md:text-5xl">
                        Transformă o parte din impozitul companiei în impact real
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
                        Companiile pot susține Visuri pe hârtie prin sponsorizare directă sau, dacă
                        sunt eligibile, prin mecanismul de redirecționare a impozitului pe profit.
                    </p>
                </div>
            </section>

            <section className="container relative z-20 mx-auto -mt-8 mb-10 max-w-3xl px-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                    <p>
                        Suma eligibilă fiscal este limitată la valoarea minimă dintre{" "}
                        <strong>0,75% din cifra de afaceri</strong> și{" "}
                        <strong>20% din impozitul pe profit datorat</strong>.
                    </p>
                    <p className="mt-2 text-slate-600">
                        Facilitatea fiscală prezentată se adresează în principal companiilor
                        plătitoare de impozit pe profit. Regimul fiscal al companiei trebuie
                        confirmat împreună cu contabilul acesteia.
                    </p>
                    <p className="mt-2 text-slate-600">
                        Pentru aplicarea facilității fiscale, beneficiarul trebuie să fie înscris
                        în Registrul entităților/unităților de cult pentru care se acordă deduceri
                        fiscale, în condițiile legii.
                        {anafRegistryConfirmed ? (
                            <span className="mt-1 block text-emerald-700">
                                Beneficiarul este configurat ca eligibil pentru deducere fiscală
                                (registru ANAF confirmat în setări).
                            </span>
                        ) : (
                            <span className="mt-1 block text-amber-800">
                                Eligibilitatea fiscală a beneficiarului este în curs de confirmare.
                            </span>
                        )}
                    </p>
                </div>
            </section>

            {flow === "choose" && (
                <section className="container mx-auto mb-16 max-w-4xl px-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setFlow("direct")}
                            className="rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
                        >
                            <h2 className="text-xl font-semibold text-slate-900">
                                Vreau să fac o sponsorizare directă
                            </h2>
                            <p className="mt-3 text-sm text-slate-600">
                                Compania semnează contractul de sponsorizare și virează suma direct
                                către Asociația Visuri pe hârtie.
                            </p>
                            <span className="mt-6 inline-block text-sm font-semibold text-blue-700">
                                Generează contract →
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFlow("177")}
                            className="rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md"
                        >
                            <h2 className="text-xl font-semibold text-slate-900">
                                Vreau să solicit redirecționarea prin Formularul 177
                            </h2>
                            <p className="mt-3 text-sm text-slate-600">
                                Compania solicită ANAF să redirecționeze către asociație suma
                                eligibilă rămasă neutilizată din impozitul pe profit.
                            </p>
                            <span className="mt-6 inline-block text-sm font-semibold text-slate-800">
                                Pregătește Formularul 177 →
                            </span>
                        </button>
                    </div>
                    <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-slate-500">
                        Informațiile de pe această pagină au caracter informativ și nu înlocuiesc
                        consultanța fiscală. Eligibilitatea și suma disponibilă trebuie verificate
                        împreună cu contabilul sau consultantul fiscal al companiei.
                    </p>
                </section>
            )}

            {flow !== "choose" && (
                <section className="container mx-auto mb-20 px-4">
                    <button
                        type="button"
                        onClick={() => setFlow("choose")}
                        className="mb-4 text-sm text-blue-700 underline"
                    >
                        ← Înapoi la alegerea tipului de sprijin
                    </button>
                    {flow === "direct" && <DirectSponsorshipForm />}
                    {flow === "177" && <Form177PrepForm beneficiaryName={beneficiaryName} />}
                </section>
            )}
        </main>
    )
}
