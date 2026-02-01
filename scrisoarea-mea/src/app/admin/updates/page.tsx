"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUpdate } from "@/lib/updates"
import { useState } from "react"
import { toast } from "sonner"

export default function AdminUpdatesPage() {
    const [pending, setPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setPending(true)
        const title = formData.get('title') as string
        const body = formData.get('body') as string
        const type = formData.get('type') as string
        const scrisoareId = formData.get('scrisoareId') as string

        try {
            await createUpdate({
                title,
                body,
                type,
                scrisoareId: scrisoareId || undefined
            })
            toast.success("Update creat!")
                ; (document.getElementById('update-form') as HTMLFormElement).reset()
        } catch (e) {
            toast.error("Eroare la creare update.")
        }
        setPending(false)
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Postează Update Public</h1>

            <div className="bg-white p-6 rounded shadow border">
                <form id="update-form" action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tip Update</label>
                            <Select name="type" required defaultValue="GENERAL">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GENERAL">General</SelectItem>
                                    <SelectItem value="STATUS">Status Caz</SelectItem>
                                    <SelectItem value="LOGISTIC">Logistic / Livrare</SelectItem>
                                    <SelectItem value="PROOF">Dovadă / Impact</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Scrisoare ID (Optional)</label>
                            <Input name="scrisoareId" placeholder="UUID..." />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Titlu (max 80)</label>
                        <Input name="title" required maxLength={80} placeholder="Ex: Livrări efectuate în Cluj" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Conținut (max 300 - Neutral)</label>
                        <Textarea name="body" required maxLength={300} placeholder="Descrie update-ul fără emoții..." className="min-h-[100px]" />
                    </div>

                    <Button type="submit" disabled={pending}>
                        {pending ? "Se postează..." : "Postează Update"}
                    </Button>
                </form>
            </div>
        </div>
    )
}
