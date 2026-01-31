import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { submitScrisoare } from "@/app/actions/partner-actions"
import { Badge } from "@/components/ui/badge"

export default async function PartnerScrisoareDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session?.institutionId) redirect('/partner')

    const letter = await prisma.scrisoare.findUnique({
        where: { id }
    })

    if (!letter || letter.institutionId !== session.institutionId) notFound()

    const items = letter.items ? JSON.parse(letter.items) : []

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{letter.childFirstName}</h1>
                    <Badge variant={letter.moderationStatus === 'DRAFT' ? 'secondary' : 'default'}>
                        {letter.moderationStatus}
                    </Badge>
                </div>
                {letter.moderationStatus === 'DRAFT' && (
                    <form action={async () => {
                        "use server"
                        await submitScrisoare(letter.id)
                    }}>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            Trimite spre Aprobare
                        </Button>
                    </form>
                )}
            </div>

            {letter.moderationStatus === 'REJECTED' && (
                <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200">
                    <strong>Motiv respingere:</strong> {letter.rejectionReason}
                    <div className="mt-2 text-sm">Editează scrisoarea pentru a corecta problemele și trimite din nou.</div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow space-y-4">
                    <h3 className="font-bold border-b pb-2">Detalii Obiecte</h3>
                    <ul className="space-y-4">
                        {items.map((i: any, dx: number) => (
                            <li key={dx} className="flex justify-between text-sm">
                                <span>{i.name} {i.size && `(${i.size})`}</span>
                                <span className="font-mono">{i.estimatedValue} RON</span>
                            </li>
                        ))}
                        <li className="font-bold pt-2 border-t flex justify-between">
                            <span>Total</span>
                            <span>{letter.targetAmount.toString()} RON</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold">Povestea</h3>
                    <p className="text-slate-600 italic whitespace-pre-line">{letter.childStory}</p>
                </div>
            </div>
        </div>
    )
}
