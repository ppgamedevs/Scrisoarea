import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadProofAction } from "@/app/actions/proof-actions"

export default async function UploadProofPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (session?.role !== 'PARTNER') redirect('/login')

    const letter = await prisma.scrisoare.findUnique({
        where: { id },
        include: { proofs: true }
    })

    if (!letter || letter.institutionId !== session.institutionId) notFound()

    // Validation: Only if Finantat/Inchis/Livrat
    const allowedStatuses = ['FINANTAT', 'IN_ACHIZITIE', 'LIVRAT', 'INCHIS', 'COMPLETED']
    // Or if fulfillment claim exists and is COMPLETED/SHIPPED (logic handled in details usually, here we trust link access)

    // Check if already approved
    if (letter.proofApproved) {
        return <div className="p-10 text-center">Dovada a fost deja aprobată pentru această scrisoare.</div>
    }

    const pendingProof = letter.proofs.find(p => p.moderationStatus === 'PENDING')

    return (
        <div className="max-w-xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Încarcă Dovada Îndeplinirii</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 text-blue-800 p-4 rounded text-sm space-y-2">
                        <p className="font-bold">Reguli Obligatorii:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Fără fața copilului (blurată sau cadru doar pe mâini/spate)</li>
                            <li>Fără nume de familie vizibile</li>
                            <li>Fără adrese vizibile pe pachete</li>
                            <li>Focus pe cadoul primit și bucuria gestului</li>
                            <li>Video max 60 secunde</li>
                        </ul>
                    </div>

                    {pendingProof ? (
                        <div className="bg-amber-50 text-amber-900 p-6 text-center border border-amber-200 rounded">
                            <h3 className="font-bold mb-2">Dovadă în moderare</h3>
                            <p>Ai încărcat deja o dovadă pe {pendingProof.createdAt.toLocaleDateString()}. Adminii o verifică.</p>
                        </div>
                    ) : (
                        <form action={async (formData) => {
                            "use server"
                            await uploadProofAction(id, formData)
                        }} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Fișieră Foto/Video</Label>
                                <Input type="file" name="proofFile" accept="image/*,video/*" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Descriere scurtă (Opțional)</Label>
                                <Input name="description" placeholder="Ex: Copilul a primit ghiozdanul..." maxLength={120} />
                            </div>

                            <Button type="submit" className="w-full">Trimite Dovada</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
