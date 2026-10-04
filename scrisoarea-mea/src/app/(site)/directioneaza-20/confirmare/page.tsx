import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileCheck } from "lucide-react"
import prisma from "@/lib/prisma"
import { formatIbanDisplay } from "@/lib/sponsorship/beneficiary"

export default async function Confirmare20Page({
    searchParams,
}: {
    searchParams: Promise<{ id?: string; flow?: string }>
}) {
    const { id, flow } = await searchParams

    const record = id
        ? await prisma.companySponsorshipRequest.findUnique({ where: { id } })
        : null

    const is177 = flow === "177" || record?.flowType === "FORM_177"
    const amount = Number(
        record?.requestedRedirectAmount ?? record?.sponsorshipAmount ?? 0
    )
    const iban = record?.beneficiaryIban
        ? formatIbanDisplay(record.beneficiaryIban)
        : ""

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FileCheck className="h-10 w-10" />
                </div>

                {is177 ? (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Documentele sunt pregătite pentru verificare
                        </h1>
                        <p className="text-slate-600">
                            Formularul 177 trebuie verificat de contabil și depus electronic prin
                            sistemele ANAF de către companie sau împuternicitul acesteia.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-slate-900">Contract semnat</h1>
                        <p className="text-slate-600">
                            Contractul de sponsorizare a fost generat. Compania efectuează plata
                            direct către asociație conform contractului.
                        </p>
                    </>
                )}

                {record && (
                    <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-sm text-slate-700">
                        {record.contractNumber && (
                            <p>
                                <strong>Nr. contract:</strong> {record.contractNumber}
                            </p>
                        )}
                        <p>
                            <strong>Beneficiar:</strong> {record.beneficiaryName}
                        </p>
                        <p>
                            <strong>Sumă:</strong> {amount.toFixed(2)} RON
                        </p>
                        {iban && (
                            <p>
                                <strong>IBAN:</strong> {iban}
                            </p>
                        )}
                        {!is177 && record.contractNumber && (
                            <p>
                                <strong>Referință plată:</strong> Sponsorizare contract{" "}
                                {record.contractNumber}
                            </p>
                        )}
                        {is177 && (
                            <p>
                                <strong>An fiscal:</strong> {record.fiscalYear}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                    {record?.contractPdfUrl && (
                        <Button asChild variant="outline" className="w-full py-6 text-lg">
                            <a
                                href={record.contractPdfUrl}
                                download={`${record.contractNumber || "contract"}.pdf`}
                            >
                                Descarcă contractul PDF
                            </a>
                        </Button>
                    )}
                    {is177 && record?.draft177PdfUrl && (
                        <Button
                            asChild
                            variant="outline"
                            className="w-full border-amber-200 bg-amber-50 py-6 text-lg text-amber-900"
                        >
                            <a
                                href={record.draft177PdfUrl}
                                download={`Draft_Formular_177_${record.fiscalYear}.pdf`}
                            >
                                Descarcă Draft Formular 177
                            </a>
                        </Button>
                    )}
                    {record?.email && record.contractPdfUrl && (
                        <Button asChild variant="ghost" className="w-full">
                            <a
                                href={`mailto:${record.email}?subject=${encodeURIComponent(
                                    `Contract sponsorizare ${record.contractNumber || ""}`
                                )}&body=${encodeURIComponent(
                                    `Atașează / descarcă contractul: ${record.contractPdfUrl}`
                                )}`}
                            >
                                Trimite contractul contabilului
                            </a>
                        </Button>
                    )}
                    <Button asChild className="w-full bg-slate-900 py-6 text-lg hover:bg-slate-800">
                        <Link href="/">Înapoi la site</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}
