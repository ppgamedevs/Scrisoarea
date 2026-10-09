import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadProofForm } from "./upload-proof-form"

export default async function UploadProofPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (session?.role !== "PARTNER") redirect("/login")

    const letter = await prisma.scrisoare.findUnique({
        where: { id },
        include: { proofs: { orderBy: { createdAt: "asc" } } },
    })

    if (!letter || letter.institutionId !== session.institutionId) notFound()

    if (letter.proofApproved) {
        return <div className="p-10 text-center">Dovezile au fost aprobate pentru această scrisoare.</div>
    }

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
                            <li>Un videoclip opțional și maximum 3 imagini</li>
                        </ul>
                    </div>

                    <UploadProofForm
                        scrisoareId={id}
                        proofs={letter.proofs.map((proof) => ({
                            id: proof.id,
                            url: proof.url,
                            type: proof.type,
                            moderationStatus: proof.moderationStatus,
                            rejectReason: proof.rejectReason,
                            createdAt: proof.createdAt.toISOString(),
                        }))}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
