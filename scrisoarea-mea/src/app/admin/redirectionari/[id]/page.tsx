import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default async function AdminRedirectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (session?.role !== 'ADMIN') redirect('/auth/signin')

    const { id } = await params
    const req = await prisma.taxRedirectionRequest.findUnique({
        where: { id }
    })

    if (!req) notFound()

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Detalii Cerere #{req.id.slice(0, 8)}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/redirectionari">Înapoi</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <h3 className="font-bold border-b pb-2">Identitate</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tip:</span>
                            <span className="font-medium">{req.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Nume / Companie:</span>
                            <span className="font-medium">{req.type === 'COMPANY_177' ? req.companyName : `${req.lastName} ${req.firstName}`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">CNP / CUI:</span>
                            <span className="font-medium font-mono bg-slate-100 px-1 rounded">{req.cnp || req.cui}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-medium">{req.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Telefon:</span>
                            <span className="font-medium">{req.phone || '-'}</span>
                        </div>
                        {req.type === 'INDIVIDUAL_230' && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Adresa:</span>
                                <span className="font-medium text-right max-w-[200px]">{req.address}, {req.city}, {req.county}</span>
                            </div>
                        )}
                        {req.type === 'COMPANY_177' && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Suma:</span>
                                <span className="font-medium text-right">{req.amountRON?.toString()} RON</span>
                            </div>
                        )}
                        {req.type === 'COMPANY_177' && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Reprezentant:</span>
                                <span className="font-medium text-right">{req.contactName}</span>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="font-bold border-b pb-2">Status & Documente</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Status Curent:</span>
                            <span className="font-bold">{req.status}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {req.pdfUrl && (
                                <a href={req.pdfUrl} download={`Formular_${req.type}_${req.year}.pdf`} className="text-blue-600 hover:underline text-sm flex gap-2 items-center">
                                    📄 Descarcă Formular Generat
                                </a>
                            )}
                            {req.contractUrl && (
                                <a href={req.contractUrl} download={`Contract_${req.companyName}.pdf`} className="text-blue-600 hover:underline text-sm flex gap-2 items-center">
                                    📄 Descarcă Contract Sponsorizare (177)
                                </a>
                            )}
                        </div>

                        {req.signatureUrl && (
                            <div className="mt-4 border p-2 bg-slate-50">
                                <p className="text-xs text-slate-400 mb-2">Semnătură:</p>
                                <img src={req.signatureUrl} alt="Semnatura" className="max-h-24 object-contain" />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
