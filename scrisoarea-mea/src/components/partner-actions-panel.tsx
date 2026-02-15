
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud, PenLine, CheckSquare, Clock } from "lucide-react"

interface PartnerActionsPanelProps {
    scrisoareId: string
    institutionSlug: string | null
    status: string
    moderationStatus: string
    proofApproved: boolean
}

export default function PartnerActionsPanel({
    scrisoareId,
    institutionSlug,
    status,
    moderationStatus,
    proofApproved
}: PartnerActionsPanelProps) {

    // Status mapping helpers
    const isDraft = status === 'NOU' || moderationStatus === 'DRAFT'
    const isApproved = moderationStatus === 'APPROVED'
    const isFunded = status === 'FINANTAT'
    const isShipped = status === 'LIVRAT'
    const isCompleted = status === 'FINALIZAT'

    return (
        <div className="bg-purple-50 text-purple-900 border border-purple-200 shadow-xl shadow-purple-100 rounded-2xl p-8 space-y-6">
            <div>
                <div className="flex items-center gap-2 text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">
                    <span className="p-1 bg-purple-200 rounded">PARTENER</span> Panou de Control
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-1">
                    Gestionare Scrisoare
                </h3>
                <p className="text-sm text-purple-700">
                    Ești autentificat ca partenerul care gestionează acest caz. Nu poți dona pentru propriile scrisori.
                </p>
            </div>

            <div className="space-y-3">
                {/* Status Indicator */}
                <div className="bg-white/50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                    <span className="text-sm font-medium">Status Curent:</span>
                    <span className="font-bold px-2 py-1 bg-purple-100 rounded text-xs uppercase">{status}</span>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {/* Edit Action - Only if not finalized/closed ideally, but for now allow always or check status */}
                    <Button asChild variant="outline" className="justify-start h-12 border-purple-200 hover:bg-purple-100 hover:text-purple-900">
                        <Link href={`/partner/scrisori/${scrisoareId}/edit`}>
                            <PenLine className="mr-2 h-4 w-4" />
                            Editează Scrisoarea
                        </Link>
                    </Button>

                    {/* Proof Upload - Essential for Funded letters */}
                    {isFunded && !isShipped && !isCompleted && (
                        <Button asChild className="justify-start h-12 bg-purple-600 hover:bg-purple-700 text-white">
                            <Link href={`/partner/scrisori/${scrisoareId}/proof`}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Încarcă Dovada (Foto/Video)
                            </Link>
                        </Button>
                    )}

                    {/* Example Fulfillment Actions */}
                    {status === 'IN_ACHIZITIE' && (
                        <div className="text-xs bg-amber-50 text-amber-800 p-3 rounded border border-amber-100 flex gap-2">
                            <Clock className="w-4 h-4" />
                            Un sponsor a rezervat fondurile. Așteptăm confirmarea plății.
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-purple-200">
                <Button asChild variant="ghost" size="sm" className="w-full text-purple-700 hover:bg-purple-100">
                    <Link href="/partner/dashboard">
                        Înapoi la Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}
