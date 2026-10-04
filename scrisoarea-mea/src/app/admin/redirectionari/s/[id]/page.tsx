import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatIbanDisplay } from "@/lib/sponsorship/beneficiary"

export default async function AdminCompanySponsorshipPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getSession()
    if (session?.role !== "ADMIN") redirect("/login")

    const { id } = await params
    const req = await prisma.companySponsorshipRequest.findUnique({ where: { id } })
    if (!req) notFound()

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{req.companyName}</h1>
                    <p className="text-sm text-slate-500">
                        {req.flowType} · {req.contractNumber || "fără nr. contract"}
                    </p>
                </div>
                <Badge>{req.status}</Badge>
            </div>

            <div className="space-y-2 rounded-xl border bg-white p-6 text-sm">
                <p>
                    <strong>CIF:</strong> {req.companyCif}
                </p>
                <p>
                    <strong>Regim fiscal:</strong> {req.taxRegime}
                </p>
                <p>
                    <strong>An fiscal:</strong> {req.fiscalYear}
                </p>
                <p>
                    <strong>Reprezentant:</strong> {req.representativeName}
                    {req.representativeRole ? ` (${req.representativeRole})` : ""}
                </p>
                <p>
                    <strong>Email:</strong> {req.email}
                </p>
                <p>
                    <strong>Adresă fiscală:</strong> str. {req.street} nr. {req.streetNumber},{" "}
                    {req.city}, {req.county}
                </p>
                <p>
                    <strong>Sumă:</strong>{" "}
                    {Number(req.sponsorshipAmount || req.requestedRedirectAmount || 0).toFixed(2)}{" "}
                    RON
                </p>
                {req.beneficiaryIban && (
                    <p>
                        <strong>IBAN beneficiar:</strong> {formatIbanDisplay(req.beneficiaryIban)}
                    </p>
                )}
                {req.flowType === "FORM_177" && (
                    <>
                        <p>
                            <strong>Maxim redirecționabil:</strong>{" "}
                            {Number(req.maximumRedirectableAmount || 0).toFixed(2)}
                        </p>
                        <p>
                            <strong>Anterior 177:</strong>{" "}
                            {Number(req.previouslyRedirectedAmount || 0).toFixed(2)}
                        </p>
                        <p>
                            <strong>Rămas:</strong>{" "}
                            {Number(req.remainingRedirectableAmount || 0).toFixed(2)}
                        </p>
                        <p>
                            <strong>Consimțământ divulgare ANAF:</strong>{" "}
                            {req.disclosureConsent ? "Da" : "Nu"}
                        </p>
                    </>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {req.contractPdfUrl && (
                    <Button asChild variant="outline">
                        <a href={req.contractPdfUrl} download>
                            Contract PDF
                        </a>
                    </Button>
                )}
                {req.draft177PdfUrl && (
                    <Button asChild variant="outline">
                        <a href={req.draft177PdfUrl} download>
                            Draft Formular 177
                        </a>
                    </Button>
                )}
                <Button asChild variant="ghost">
                    <Link href="/admin/redirectionari">Înapoi</Link>
                </Button>
            </div>
        </div>
    )
}
