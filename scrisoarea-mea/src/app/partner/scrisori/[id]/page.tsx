import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { submitScrisoare } from "@/app/actions/partner-actions"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    MODERATION_LABELS,
    canPartnerEdit,
    isDraft,
    isRejected,
    normalizeModerationStatus,
} from "@/lib/letter-moderation"
import { parseWishlistItems } from "@/lib/letter-items"
import { formatCurrency } from "@/lib/utils"

export default async function PartnerScrisoareDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getSession()
    if (!session?.institutionId) redirect("/partner")

    const letter = await prisma.scrisoare.findUnique({
        where: { id },
    })

    if (!letter || letter.institutionId !== session.institutionId) notFound()

    const items = parseWishlistItems(letter.items)
    const status = normalizeModerationStatus(letter.moderationStatus)
    const editable = canPartnerEdit(letter.moderationStatus)

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{letter.childFirstName}</h1>
                    <Badge variant={isDraft(letter.moderationStatus) ? "secondary" : "default"}>
                        {MODERATION_LABELS[status] || status}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    {editable && (
                        <Button asChild variant="outline">
                            <Link href={`/partner/scrisori/${letter.id}/edit`}>Editează</Link>
                        </Button>
                    )}
                    {(isDraft(letter.moderationStatus) || isRejected(letter.moderationStatus)) && (
                        <form
                            action={async () => {
                                "use server"
                                await submitScrisoare(letter.id)
                            }}
                        >
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                                Trimite spre Aprobare
                            </Button>
                        </form>
                    )}
                </div>
            </div>

            {isRejected(letter.moderationStatus) && (
                <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200">
                    <strong>Motiv respingere:</strong> {letter.rejectionReason}
                    <div className="mt-2 text-sm">
                        Editează scrisoarea pentru a corecta problemele și trimite din nou. Va trece
                        din nou prin verificare.
                    </div>
                </div>
            )}

            {status === "pending_review" && (
                <div className="bg-blue-50 text-blue-900 p-4 rounded border border-blue-200 text-sm">
                    Scrisoarea așteaptă verificarea administratorului. Nu este vizibilă public.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow space-y-4">
                    <h3 className="font-bold border-b pb-2">Detalii Obiecte</h3>
                    <ul className="space-y-4">
                        {items.map((i, dx) => (
                            <li key={dx} className="flex justify-between text-sm">
                                <span>
                                    {i.name} {i.size && `(${i.size})`}
                                </span>
                                <span className="font-mono">
                                    est. {i.submittedEstimatedPrice} RON
                                </span>
                            </li>
                        ))}
                        <li className="font-bold pt-2 border-t flex justify-between">
                            <span>Estimare totală</span>
                            <span>
                                {formatCurrency(
                                    Number(letter.submittedTargetAmount || letter.targetAmount)
                                )}
                            </span>
                        </li>
                        {letter.approvedTargetAmount != null && (
                            <li className="text-emerald-700 text-sm flex justify-between">
                                <span>Țintă aprobată (admin)</span>
                                <span className="font-mono">
                                    {formatCurrency(Number(letter.approvedTargetAmount))}
                                </span>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold">Povestea</h3>
                    <p className="text-slate-600 italic whitespace-pre-line">{letter.childStory}</p>
                    {letter.partnerNotes && (
                        <div className="text-sm bg-slate-50 p-3 rounded border">
                            <strong>Note pentru administrator:</strong> {letter.partnerNotes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
