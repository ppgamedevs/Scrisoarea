"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateScrisoare } from "@/app/actions/partner-actions"
import { amountExceedsMaxMessage } from "@/lib/letter-moderation"
import { uploadLetterFile } from "@/lib/upload-letter-media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ImageIcon } from "lucide-react"
import type { WishlistItem } from "@/lib/letter-items"

interface CampaignSummary {
    id: string
    title: string
    slug: string
}

type InitialLetter = {
    id: string
    childFirstName: string
    childAge: number
    childGender: string | null
    category: string
    childStory: string | null
    partnerNotes: string | null
    campaignId: string | null
    originalImgUrl: string
    items: WishlistItem[]
}

export default function EditScrisoareForm({
    campaigns,
    letter,
}: {
    campaigns: CampaignSummary[]
    letter: InitialLetter
}) {
    const [items, setItems] = useState(
        letter.items.map((i) => ({
            name: i.name,
            size: i.size,
            estimatedValue: i.submittedEstimatedPrice,
            quantity: i.quantity,
        }))
    )
    const [loading, setLoading] = useState(false)
    const [campaignId, setCampaignId] = useState<string>(letter.campaignId || "NONE")
    const [previewUrl, setPreviewUrl] = useState<string | null>(letter.originalImgUrl)
    const [fileType, setFileType] = useState<"image" | "video" | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const total = items.reduce((acc, i) => acc + Number(i.estimatedValue || 0), 0)
    const limit = campaignId && campaignId !== "NONE" ? 1500 : 500

    const addItem = () => {
        if (items.length < 5) setItems([...items, { name: "", size: "", estimatedValue: 0, quantity: 1 }])
    }

    const updateItem = (index: number, field: string, val: unknown) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: val }
        setItems(newItems)
        if (field === "estimatedValue") {
            const nextTotal = newItems.reduce((acc, i) => acc + Number(i.estimatedValue || 0), 0)
            if (nextTotal > limit) {
                toast.warning(amountExceedsMaxMessage(limit), { id: "amount-limit" })
            }
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isVideo = file.type.startsWith("video/")
        const sizeLimit = isVideo ? 100 * 1024 * 1024 : 4.5 * 1024 * 1024

        if (file.size > sizeLimit) {
            alert(`Fișierul este prea mare. Maxim ${isVideo ? "100MB" : "4.5MB"}.`)
            e.target.value = ""
            return
        }

        if (file.type.startsWith("image/")) setFileType("image")
        else if (file.type.startsWith("video/")) setFileType("video")
        else {
            alert("Te rugăm să încarci doar imagini sau video.")
            e.target.value = ""
            return
        }

        setPreviewUrl(URL.createObjectURL(file))
        setSelectedFile(file)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (total > limit) {
            toast.warning(amountExceedsMaxMessage(limit), { id: "amount-limit" })
            return
        }
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const submitButton = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
        const actionType = submitButton.value || "draft"

        formData.append("items", JSON.stringify(items))
        formData.append("actionType", actionType)

        if (campaignId && campaignId !== "NONE") {
            formData.set("campaignId", campaignId)
        } else {
            formData.set("campaignId", "NONE")
        }

        try {
            if (selectedFile) {
                const isVideo = selectedFile.type.startsWith("video/")
                formData.set("mediaType", isVideo ? "VIDEO" : "IMAGE")
                formData.append("mediaUrl", await uploadLetterFile(selectedFile))
            }

            const result = await updateScrisoare(letter.id, formData)
            if (result?.error) {
                toast.warning(result.error, { id: "amount-limit" })
                setLoading(false)
                return
            }
        } catch (err: any) {
            if (
                err.message === "NEXT_REDIRECT" ||
                err.message?.includes("NEXT_REDIRECT") ||
                err.digest?.includes("NEXT_REDIRECT")
            ) {
                return
            }
            console.error(err)
            const raw = typeof err?.message === "string" ? err.message : ""
            const safe = raw.startsWith("0:") || raw.includes('{"digest"') || raw.includes('{"a":')
                ? "A apărut o eroare. Verifică suma și încearcă din nou."
                : raw || "A apărut o eroare."
            toast.error(safe)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-bold">Editează / Retrimite Scrisoarea</h2>
            <p className="text-sm text-slate-500">
                După retrimitere, statusul revine la „în verificare” și necesită din nou aprobarea
                administratorului. Nu poți seta suma publică finală.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            <div className="space-y-2 bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <Label className="text-purple-900 font-semibold">
                                    Campanie Specială (Opțional)
                                </Label>
                                <Select onValueChange={setCampaignId} value={campaignId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selectează o campanie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">Nicio campanie (Standard)</SelectItem>
                                        {campaigns.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prenume Copil (sau Pseudonim)</Label>
                                    <Input
                                        name="childFirstName"
                                        required
                                        defaultValue={letter.childFirstName}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vârstă (Ani)</Label>
                                    <Input
                                        name="childAge"
                                        type="number"
                                        required
                                        defaultValue={letter.childAge}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Gen</Label>
                                    <Select name="childGender" defaultValue={letter.childGender || "N"}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="F">Fată</SelectItem>
                                            <SelectItem value="M">Băiat</SelectItem>
                                            <SelectItem value="N">Neutru/Grup</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Categorie Principală</Label>
                                    <Select name="category" defaultValue={letter.category}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EDUCATIE">Educație</SelectItem>
                                            <SelectItem value="IMBRACAMINTE">Îmbrăcăminte</SelectItem>
                                            <SelectItem value="JUCARII">Jucării</SelectItem>
                                            <SelectItem value="SPORT">Sport</SelectItem>
                                            <SelectItem value="ARTISTIC">Artistic</SelectItem>
                                            <SelectItem value="PROVIZII">Alimente/Igienă</SelectItem>
                                            <SelectItem value="ALTCEVA">Altceva</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Povestea Copilului / Text scrisoare</Label>
                                <Textarea
                                    name="childStory"
                                    required
                                    className="h-32"
                                    defaultValue={letter.childStory || ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Note pentru administrator (opțional)</Label>
                                <Textarea
                                    name="partnerNotes"
                                    className="h-20"
                                    defaultValue={letter.partnerNotes || ""}
                                />
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4 bg-slate-50">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Obiecte Dorite (Max 5)</h3>
                                <div
                                    className={`text-sm font-bold ${total > limit ? "text-red-600" : "text-slate-900"}`}
                                >
                                    Estimare: {total} / {limit} RON
                                </div>
                            </div>
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label className="text-xs">Obiect</Label>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => updateItem(idx, "name", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-20">
                                        <Label className="text-xs">Mărime</Label>
                                        <Input
                                            value={item.size}
                                            onChange={(e) => updateItem(idx, "size", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <Label className="text-xs">Est. preț</Label>
                                        <Input
                                            type="number"
                                            value={item.estimatedValue}
                                            onChange={(e) =>
                                                updateItem(idx, "estimatedValue", e.target.value)
                                            }
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>
                            ))}
                            {items.length < 5 && (
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    + Adaugă Obiect
                                </Button>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6 space-y-4 h-fit">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">
                                Media
                            </h3>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center relative">
                                <input
                                    type="file"
                                    accept="image/*,video/mp4,video/quicktime"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                />
                                {previewUrl ? (
                                    fileType === "video" ? (
                                        <video
                                            src={previewUrl}
                                            controls
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    )
                                ) : (
                                    <div className="py-8 flex flex-col items-center gap-2 text-slate-400">
                                        <ImageIcon className="w-6 h-6" />
                                        <span className="text-sm">Încarcă Poză sau Video</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="sticky top-6 flex flex-col gap-3">
                            <Button
                                type="submit"
                                value="submit"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? "Se salvează..." : "Retrimite spre Aprobare"}
                            </Button>
                            <Button type="submit" value="draft" variant="outline" disabled={loading}>
                                Salvează ca Ciornă
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
