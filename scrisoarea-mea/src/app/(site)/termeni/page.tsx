import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LegalDocument } from "@/components/legal/legal-documents"
import { pageMetadata } from "@/lib/seo/metadata"

export const metadata = pageMetadata({
    title: "Termeni și Condiții",
    description: "Termenii și condițiile de utilizare a platformei Visuri pe hartie.",
    path: "/termeni",
})

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
                <LegalDocument doc="termeni" />
            </div>
        </main>
    )
}
