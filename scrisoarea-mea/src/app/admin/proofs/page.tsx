import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { approveProof, rejectProof } from "@/app/actions/proof-actions"
import Link from "next/link"

export default async function AdminProofsPage() {
    const proofs = await prisma.proofMedia.findMany({
        where: { moderationStatus: 'PENDING' },
        include: { scrisoare: { include: { institution: true } } },
        orderBy: { createdAt: 'asc' }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dovezi în Așteptare ({proofs.length})</h1>

            <div className="grid gap-6">
                {proofs.map(proof => (
                    <div key={proof.id} className="bg-white p-6 rounded shadow border flex gap-6 items-start">
                        {/* Preview */}
                        <div className="w-48 aspect-video bg-neutral-900 rounded flex items-center justify-center text-white overflow-hidden">
                            {proof.type === 'VIDEO' ? (
                                <video src={proof.url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={proof.url} alt="Proof" className="w-full h-full object-cover" />
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2">
                            <h3 className="font-bold text-lg">{proof.scrisoare.childFirstName} - {proof.scrisoare.institution.name}</h3>
                            <p className="text-sm text-neutral-500">Încărcat: {proof.createdAt.toLocaleDateString()}</p>
                            <div className="text-sm bg-neutral-50 p-2 rounded">
                                Scrisoare: <Link href={`/admin/scrisori/${proof.scrisoareId}`} className="underline text-blue-600">Vezi detalii</Link>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-64 space-y-3 border-l pl-6">
                            <form action={async () => {
                                "use server"
                                await approveProof(proof.id)
                            }}>
                                <Button className="w-full bg-green-600 hover:bg-green-700">Aprobă & Închide</Button>
                            </form>

                            <form action={async (formData) => {
                                "use server"
                                const reason = formData.get('reason') as string
                                await rejectProof(proof.id, reason)
                            }}>
                                <div className="flex gap-2">
                                    <Input name="reason" placeholder="Motiv refuz..." required className="h-8 text-xs" />
                                    <Button variant="destructive" size="sm">Refuz</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ))}
            </div>

            {proofs.length === 0 && (
                <div className="text-center p-10 text-neutral-500">Nu sunt dovezi de moderat.</div>
            )}
        </div>
    )
}
