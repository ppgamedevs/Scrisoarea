import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProofPreview } from "@/components/admin/proof-preview"
import { isVideoProof } from "@/lib/proof-media"
import { approveProof, rejectProof } from "@/app/actions/proof-actions"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminProofsPage() {
    const proofs = await prisma.proofMedia.findMany({
        where: { moderationStatus: "PENDING" },
        include: { scrisoare: { include: { institution: true } } },
        orderBy: { createdAt: "asc" },
    })

    const groups = new Map<string, typeof proofs>()
    for (const proof of proofs) {
        const list = groups.get(proof.scrisoareId) || []
        list.push(proof)
        groups.set(proof.scrisoareId, list)
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dovezi în Așteptare ({proofs.length})</h1>

            <div className="grid gap-8">
                {[...groups.values()].map((items) => {
                    const letter = items[0].scrisoare
                    return (
                        <section key={letter.id} className="space-y-4">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {letter.childFirstName} — {letter.institution.name}
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    {items.length} {items.length === 1 ? "fișier de verificat" : "fișiere de verificat"} ·{" "}
                                    <Link href={`/admin/scrisori/${letter.id}`} className="underline text-blue-600">
                                        Vezi scrisoarea
                                    </Link>
                                </p>
                            </div>
                            {items.map((proof) => {
                                const video = isVideoProof(proof.type, proof.url)
                                return (
                                    <div key={proof.id} className="bg-white p-6 rounded shadow border flex flex-col xl:flex-row gap-6 items-start">
                                        <ProofPreview url={proof.url} type={proof.type} />
                                        <div className="flex-1 space-y-2">
                                            <h3 className="font-bold">{video ? "Video" : "Imagine"}</h3>
                                            <p className="text-sm text-neutral-500">
                                                Încărcat: {proof.createdAt.toLocaleString("ro-RO")}
                                            </p>
                                        </div>
                                        <div className="w-full lg:w-64 space-y-3 lg:border-l lg:pl-6">
                                            <form action={async () => {
                                                "use server"
                                                await approveProof(proof.id)
                                            }}>
                                                <Button className="w-full bg-green-600 hover:bg-green-700">Aprobă</Button>
                                            </form>
                                            <form action={async (formData) => {
                                                "use server"
                                                const reason = formData.get("reason") as string
                                                await rejectProof(proof.id, reason)
                                            }}>
                                                <div className="flex gap-2">
                                                    <Input name="reason" placeholder="Motiv refuz..." required className="h-8 text-xs" />
                                                    <Button variant="destructive" size="sm">Refuz</Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )
                            })}
                        </section>
                    )
                })}
            </div>

            {proofs.length === 0 && (
                <div className="text-center p-10 text-neutral-500">Nu sunt dovezi de moderat.</div>
            )}
        </div>
    )
}
