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

interface CampaignSummary {
    id: string
    title: string
    slug: string
}

export default function NewScrisoareForm({ campaigns }: { campaigns: CampaignSummary[] }) {
    const [items, setItems] = useState([{ name: '', size: '', estimatedValue: 0 }])
    const [loading, setLoading] = useState(false)
    const [campaignId, setCampaignId] = useState<string>("")

    const total = items.reduce((acc, i) => acc + Number(i.estimatedValue || 0), 0)
    const limit = campaignId ? 1500 : 500

    const addItem = () => {
        if (items.length < 5) setItems([...items, { name: '', size: '', estimatedValue: 0 }])
    }

    const updateItem = (index: number, field: string, val: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: val }
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.append('items', JSON.stringify(items))
        if (campaignId) formData.append('campaignId', campaignId)

        try {
            await createScrisoare(formData)
        } catch (err: any) {
            if (err.message === 'NEXT_REDIRECT' || err.message?.includes('NEXT_REDIRECT')) {
                // Ignore Next.js redirect "error"
                return
            }
            alert(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold">Adaugă Scrisoare Nouă</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                            <Input name="childFirstName" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Vârstă (Ani)</Label>
                            <Input name="childAge" type="number" required />
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <Label>Povestea Copilului</Label>
                        <Textarea name="childStory" placeholder="Descrie pe scurt situația..." required className="h-32" />
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
                            <div className="w-24">
                                <Label className="text-xs">Mărime (opt)</Label>
                                <Input value={item.size} onChange={e => updateItem(idx, 'size', e.target.value)} placeholder="Ex: 38" />
                            </div>
                            <div className="w-24">
                                <Label className="text-xs">Preț Est.</Label>
                                <Input type="number" value={item.estimatedValue} onChange={e => updateItem(idx, 'estimatedValue', e.target.value)} required min="1" />
                            </div>
                        </div>
                    ))}
                    {items.length < 5 && (
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Adaugă Linie</Button>
                    )}
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="ghost" type="button" onClick={() => window.history.back()}>Anulează</Button>
                    <Button type="submit" disabled={loading || total > limit}>Salvează Ciornă</Button>
                </div>
            </form>
        </div>
    )
}
