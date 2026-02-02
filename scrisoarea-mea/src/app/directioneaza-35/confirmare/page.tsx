import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function ConfirmarePage({ searchParams }: { searchParams: { id?: string } }) {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900">Mulțumim.<br />Asta a fost tot.</h1>

                <p className="text-slate-600 text-lg leading-relaxed">
                    Datele tale au fost înregistrate cu succes. <br />
                    Noi vom genera formularul și îl vom depune la ANAF în termenul legal.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-sm text-slate-500 space-y-2">
                    <p><strong>Ce urmează?</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Echipa noastră verifică datele.</li>
                        <li>Depunem formularul prin SPV.</li>
                        <li>Vei primi o confirmare pe email când procesul este finalizat (opțional).</li>
                    </ul>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button asChild className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/">Înapoi la site</Link>
                    </Button>
                    <p className="text-xs text-slate-400">
                        Sperăm să rămâi alături de noi.
                    </p>
                </div>
            </div>
        </main>
    )
}
