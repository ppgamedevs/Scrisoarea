import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { approveScrisoare, rejectScrisoare } from "@/app/actions/admin-actions"
import { Input } from "@/components/ui/input"

export default async function AdminScrisoareDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const letter = await prisma.scrisoare.findUnique({
        where: { id },
        include: { institution: true }
    })

    if (!letter) notFound()
    const items = letter.items ? JSON.parse(letter.items) : []

    return (
        <div className="bg-white p-8 rounded-lg shadow max-w-4xl mx-auto grid grid-cols-2 gap-8">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">{letter.childFirstName}, {letter.childAge} ani</h1>
                <div className="bg-neutral-50 p-4 rounded text-sm space-y-2">
                    <p><strong>Instituție:</strong> {letter.institution.name} ({letter.institution.cui})</p>
                    <p><strong>Contact:</strong> {letter.institution.contactName} - {letter.institution.contactEmail}</p>
                    <p><strong>Public Code:</strong> {letter.publicCode}</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Poveste</h3>
                    <p className="text-neutral-700 italic border-l-4 border-neutral-200 pl-4">
                        {letter.childStory}
                    </p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Obiecte ({letter.targetAmount.toString()} RON)</h3>
                    <ul className="text-sm border rounded">
                        {items.map((i: any, dx: number) => (
                            <li key={dx} className="flex justify-between p-2 border-b last:border-0 bg-neutral-50 even:bg-white">
                                <span>{i.name}</span>
                                <span>{i.estimatedValue} RON</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="space-y-8 flex flex-col h-full">
                <div className="bg-neutral-900 aspect-[3/4] flex items-center justify-center text-white rounded-lg">
                    {/* Image Preview Proxy would go here */}
                    <img src={letter.originalImgUrl} className="max-h-full max-w-full" alt="Letter" />
                </div>

                <div className="bg-neutral-100 p-6 rounded-lg mt-auto space-y-4">
                    <h3 className="font-bold">Acțiuni Moderare</h3>
                    <div className="flex gap-4">
                        <form action={async () => {
                            "use server"
                            await approveScrisoare(letter.id)
                        }} className="flex-1">
                            <Button className="w-full bg-green-600 hover:bg-green-700">Aprobă & Publică</Button>
                        </form>
                    </div>

                    <form action={async (formData: FormData) => {
                        "use server"
                        const reason = formData.get('reason') as string
                        await rejectScrisoare(letter.id, reason)
                    }} className="pt-4 border-t border-neutral-200">
                        <label className="text-xs font-bold block mb-2">Motiv Refuz (dacă e cazul)</label>
                        <div className="flex gap-2">
                            <Input name="reason" placeholder="Ex: Text prea emoțional..." required />
                            <Button variant="destructive" type="submit">Respinge</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
