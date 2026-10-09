import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LegalDocument } from "@/components/legal/legal-documents"
import { pageMetadata } from "@/lib/seo/metadata"

export const metadata = pageMetadata({
    title: "Politica de Confidențialitate",
    description: "Cum prelucrează Visuri pe hartie datele personale, în conformitate cu GDPR.",
    path: "/confidentialitate",
})

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
                <LegalDocument doc="confidentialitate" />
            </div>
        </main>
    )
}
