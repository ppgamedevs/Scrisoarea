"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updatePartnerProfile } from "@/lib/admin-actions" // Will create this
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function PartnerEditForm({ partner }: { partner: any }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await updatePartnerProfile(partner.id, formData)
            toast.success("Profil actualizat!")
            router.refresh()
        } catch (e) {
            toast.error("Eroare la actualizare.")
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nume Public (Display)</label>
                    <Input name="publicName" defaultValue={partner.publicName || partner.name} required />
                    <p className="text-xs text-slate-500">Numele afișat donatorilor.</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Slug (URL)</label>
                    <Input name="slug" defaultValue={partner.slug || ''} placeholder="ex: fundatia-speranta" required />
                    <p className="text-xs text-slate-500">scrisoareamea.ro/partener/slug</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Descriere Publică</label>
                <Textarea name="descriptionPublic" defaultValue={partner.descriptionPublic || ''} className="min-h-[120px]" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input name="website" defaultValue={partner.website || ''} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Logo URL</label>
                    <Input name="logoUrl" defaultValue={partner.logoUrl || ''} placeholder="https://..." />
                </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Se salvează...' : 'Salvează Profil Public'}
                </Button>
            </div>
        </form>
    )
}
