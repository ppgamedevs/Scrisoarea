import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileCheck } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function Confirmare20Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const { id } = await searchParams

    // Fetch contract URL if ID exists
    let contractUrl = null
    if (id) {
        const req = await prisma.taxRedirectionRequest.findUnique({
            where: { id },
            select: { contractUrl: true }
        })
        contractUrl = req?.contractUrl
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900">Contract Generat!</h1>

                <p className="text-slate-600 text-lg leading-relaxed">
                    Datele companiei au fost salvate. Contractul de sponsorizare a fost generat automat.
                </p>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-left text-sm text-amber-800 space-y-2">
                    <p><strong>Următorul pas (Critic):</strong></p>
                    <p>
                        Pentru ca direcționarea să fie validă, trebuie să depuneți Declarația 177 în SPV și să efectuați plata sponsorizării până la termenul legal.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    {contractUrl && (
                        <Button asChild variant="outline" className="w-full py-6 text-lg border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                            <a href={contractUrl} download="Contract_Sponsorizare.pdf">⬇ Descarcă Contractul PDF</a>
                        </Button>
                    )}

                    <Button asChild className="w-full py-6 text-lg bg-slate-900 hover:bg-slate-800 mt-2">
                        <Link href="/">Înapoi la site</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
