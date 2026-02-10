"use client"

import { useState } from "react"
import { createScrisoare } from "@/app/actions/partner-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video } from "lucide-react"

interface CampaignSummary {
    id: string
    title: string
    slug: string
}

export default function NewScrisoareForm({ campaigns }: { campaigns: CampaignSummary[] }) {
    const [items, setItems] = useState([{ name: '', size: '', estimatedValue: 0, quantity: 1 }]) // Added quantity default for potential future use, though not used in UI yet
    const [loading, setLoading] = useState(false)
    const [campaignId, setCampaignId] = useState<string>("")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null)

    const total = items.reduce((acc, i) => acc + Number(i.estimatedValue || 0), 0)
    const limit = campaignId && campaignId !== 'NONE' ? 1500 : 500

    const addItem = () => {
        if (items.length < 5) setItems([...items, { name: '', size: '', estimatedValue: 0, quantity: 1 }])
    }

    const updateItem = (index: number, field: string, val: any) => {
        const newItems = [...items]
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: val }
        setItems(newItems)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 4.5MB limit (Vercel Server Action Body Limit)
        if (file.size > 4.5 * 1024 * 1024) {
            alert("Fișierul este prea mare (maxim 4.5MB). Vă rugăm încărcați un fișier mai mic.")
            e.target.value = "" // Reset input
            return
        }

        if (file.type.startsWith('image/')) {
            setFileType('image')
        } else if (file.type.startsWith('video/')) {
            setFileType('video')
        } else {
            alert("Te rugăm să încarci doar imagini sau video.")
            e.target.value = ""
            return
        }

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const submitButton = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
        const actionType = submitButton.value || 'draft'

        formData.append('items', JSON.stringify(items))
        formData.append('actionType', actionType)

        if (campaignId && campaignId !== 'NONE') {
            formData.set('campaignId', campaignId)
        } else {
            formData.delete('campaignId')
        }

        try {
            await createScrisoare(formData)
            // Redirect is handled by server action
        } catch (err: any) {
            if (err.message === 'NEXT_REDIRECT' || err.message?.includes('NEXT_REDIRECT') || err.digest?.includes('NEXT_REDIRECT')) {
                return
            }
            console.error(err)
            alert(err.message || "A apărut o eroare.")
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-xl font-bold">Adaugă Scrisoare Nouă</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4">
                            {/* Campaign Selection */}
                            <div className="space-y-2 bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <Label className="text-purple-900 font-semibold">Campanie Specială (Opțional)</Label>
                                <Select onValueChange={setCampaignId} value={campaignId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Selectează o campanie (dacă se aplică)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">Nicio campanie (Standard)</SelectItem>
                                        {campaigns.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {campaignId && campaignId !== 'NONE' && (
                                    <p className="text-xs text-purple-700">
                                        ✨ Această campanie permite un buget extins de până la 1500 RON.
                                    </p>
                                )}
                                {(!campaignId || campaignId === 'NONE') && (
                                    <p className="text-xs text-slate-500">
                                        Scrisorile standard au o limită de 500 RON.
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prenume Copil (sau Pseudonim)</Label>
                                    <Input name="childFirstName" required placeholder="Ex: Andrei" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vârstă (Ani)</Label>
                                    <Input name="childAge" type="number" required placeholder="Ex: 8" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Gen</Label>
                                    <Select name="childGender" defaultValue="N">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="F">Fată</SelectItem>
                                            <SelectItem value="M">Băiat</SelectItem>
                                            <SelectItem value="N">Neutru/Grup</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Categorie Principală</Label>
                                    <Select name="category" defaultValue="ALTCEVA">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <Label>Povestea Copilului</Label>
                                <Textarea name="childStory" placeholder="Descrie pe scurt situația și de ce are nevoie..." required className="h-32" />
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4 bg-slate-50">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Obiecte Dorite (Max 5)</h3>
                                <div className={`text-sm font-bold ${total > limit ? 'text-red-600' : 'text-slate-900'}`}>
                                    Total: {total} / {limit} RON
                                </div>
                            </div>

                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label className="text-xs">Obiect</Label>
                                        <Input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required placeholder="Ex: Ghiozdan" />
                                    </div>
                                    <div className="w-20">
                                        <Label className="text-xs">Mărime</Label>
                                        <Input value={item.size} onChange={e => updateItem(idx, 'size', e.target.value)} placeholder="38" />
                                    </div>
                                    <div className="w-24">
                                        <Label className="text-xs">Preț (RON)</Label>
                                        <Input type="number" value={item.estimatedValue} onChange={e => updateItem(idx, 'estimatedValue', e.target.value)} required min="1" step="1" />
                                    </div>
                                </div>
                            ))}
                            {items.length < 5 && (
                                <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                                    + Adaugă Obiect
                                </Button>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar / Media Upload */}
                    <div className="space-y-6">
                        <Card className="p-6 space-y-4 h-fit">
                            <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">Media</h3>

                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                <Input
                                    type="file"
                                    name="file"
                                    accept="image/*,video/mp4,video/quicktime"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                />
                                {previewUrl ? (
                                    <div className="relative">
                                        {fileType === 'image' ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />
                                        ) : (
                                            <video src={previewUrl} controls className="w-full h-48 object-cover rounded-lg shadow-sm" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white text-xs font-medium pointer-events-none">
                                            Schimbă fișierul
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 flex flex-col items-center gap-2 text-slate-400">
                                        <div className="bg-slate-100 p-3 rounded-full mb-1">
                                            <ImageIcon className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">Încarcă Poză sau Video</span>
                                        <span className="text-xs">Click sau Drag & Drop</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                * O poză clară sau un scurt video cu copilul crește șansele de finanțare.
                                <br />
                                * Max 4.5MB.
                            </p>
                        </Card>

                        <div className="sticky top-6 flex flex-col gap-3">
                            <Button
                                type="submit"
                                value="submit"
                                size="lg"
                                className="w-full shadow-lg hover:shadow-xl transition-all"
                                disabled={loading || total > limit}
                            >
                                {loading ? 'Se salvează...' : 'Trimite spre Aprobare'}
                            </Button>
                            <Button
                                type="submit"
                                value="draft"
                                variant="outline"
                                className="w-full border-slate-300 text-slate-700"
                                disabled={loading}
                            >
                                Salvează ca Ciornă
                            </Button>
                            <Button variant="ghost" type="button" onClick={() => window.history.back()} className="w-full text-slate-500">
                                Anulează
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
