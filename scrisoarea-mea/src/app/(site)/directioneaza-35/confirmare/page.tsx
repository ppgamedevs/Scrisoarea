import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function ConfirmarePage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const { id } = await searchParams

    let pdfUrl: string | null = null
    let year: number | null = null
    if (id) {
        const req = await prisma.taxRedirectionRequest.findUnique({
            where: { id },
            select: { pdfUrl: true, year: true, type: true },
        })
        if (req?.type === "INDIVIDUAL_230") {
            pdfUrl = req.pdfUrl
            year = req.year
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-10 w-10" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900">
                    Mulțumim.
                    <br />
                    Formularul 230 a fost generat.
                </h1>

                <p className="text-lg leading-relaxed text-slate-600">
                    Datele tale au fost înregistrate. Poți descărca formularul oficial ANAF 230
                    {year ? ` pentru anul ${year}` : ""}.
                </p>

                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-sm text-slate-500">
                    <p>
                        <strong>Ce urmează?</strong>
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>Descarcă și păstrează PDF-ul generat.</li>
                        <li>Echipa noastră verifică datele și poate depune formularul prin SPV.</li>
                        <li>Poți primi confirmare pe email când procesul este finalizat (opțional).</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    {pdfUrl && (
                        <Button
                            asChild
                            variant="outline"
                            className="w-full border-indigo-200 bg-indigo-50 py-6 text-lg text-indigo-700 hover:bg-indigo-100"
                        >
                            <a
                                href={pdfUrl}
                                download={`Formular_230_${year || "ANAF"}.pdf`}
                            >
                                Descarcă Formularul 230 (PDF)
                            </a>
                        </Button>
                    )}
                    <Button asChild className="w-full bg-indigo-600 py-6 text-lg text-white hover:bg-indigo-700">
                        <Link href="/">Înapoi la site</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
