"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    approveScrisoare,
    rejectScrisoare,
    archiveScrisoare,
    saveLetterModeration,
} from "@/app/actions/admin-actions"
import {
    MAX_APPROVED_TARGET_RON,
    MIN_APPROVED_TARGET_RON,
    MODERATION_LABELS,
} from "@/lib/letter-moderation"
import { serializeWishlistItems, sumAdminApprovedPrices, type WishlistItem } from "@/lib/letter-items"
import { formatCurrency } from "@/lib/utils"

type InstitutionInfo = {
    name: string
    cui: string
    contactName: string | null
    contactEmail: string | null
}

type LetterProps = {
    id: string
    childFirstName: string
    childAge: number
    childStory: string | null
    category: string
    partnerNotes: string | null
    adminNotes: string | null
    originalImgUrl: string
    mediaType: string
    publicCode: string
    moderationStatus: string
    submittedTargetAmount: number
    approvedTargetAmount: number | null
    createdAt: string
    items: WishlistItem[]
    institution: InstitutionInfo
}

const CATEGORIES = [
    { value: "EDUCATIE", label: "Educație" },
    { value: "IMBRACAMINTE", label: "Îmbrăcăminte" },
    { value: "JUCARII", label: "Jucării" },
    { value: "SPORT", label: "Sport" },
    { value: "ARTISTIC", label: "Artistic" },
    { value: "PROVIZII", label: "Alimente/Igienă" },
    { value: "ALTCEVA", label: "Altceva" },
]

export default function AdminLetterModerationForm({ letter }: { letter: LetterProps }) {
    const [items, setItems] = useState<WishlistItem[]>(letter.items)
    const [childFirstName, setChildFirstName] = useState(letter.childFirstName)
    const [childAge, setChildAge] = useState(String(letter.childAge))
    const [childStory, setChildStory] = useState(letter.childStory || "")
    const [category, setCategory] = useState(letter.category)
    const [adminNotes, setAdminNotes] = useState(letter.adminNotes || "")
    const [approvedTarget, setApprovedTarget] = useState(
        letter.approvedTargetAmount != null ? String(letter.approvedTargetAmount) : ""
    )
    const [rejectReason, setRejectReason] = useState("")
    const [error, setError] = useState("")
    const [pending, startTransition] = useTransition()

    const adminItemsSum = useMemo(() => sumAdminApprovedPrices(items), [items])

    const buildFormData = () => {
        const fd = new FormData()
        fd.set("childFirstName", childFirstName)
        fd.set("childAge", childAge)
        fd.set("childStory", childStory)
        fd.set("category", category)
        fd.set("adminNotes", adminNotes)
        fd.set("approvedTargetAmount", approvedTarget)
        fd.set("items", serializeWishlistItems(items))
        return fd
    }

    const updateItem = (index: number, patch: Partial<WishlistItem>) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
    }

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index))
    }

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                name: "",
                size: "",
                quantity: 1,
                submittedEstimatedPrice: 0,
                adminApprovedPrice: null,
            },
        ])
    }

    const fillTargetFromItems = () => {
        if (adminItemsSum > 0) {
            setApprovedTarget(String(Math.min(adminItemsSum, MAX_APPROVED_TARGET_RON)))
        }
    }

    const run = (fn: () => Promise<void>) => {
        setError("")
        startTransition(async () => {
            try {
                await fn()
            } catch (e: any) {
                if (e?.digest?.includes("NEXT_REDIRECT") || e?.message === "NEXT_REDIRECT") return
                setError(e?.message || "A apărut o eroare.")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        Moderare: {letter.childFirstName}, {letter.childAge} ani
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Status: {MODERATION_LABELS[letter.moderationStatus] || letter.moderationStatus} ·{" "}
                        {letter.publicCode} · {new Date(letter.createdAt).toLocaleString("ro-RO")}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <div className="bg-neutral-50 p-4 rounded text-sm space-y-1">
                            <p>
                                <strong>Instituție:</strong> {letter.institution.name} (
                                {letter.institution.cui})
                            </p>
                            <p>
                                <strong>Contact:</strong> {letter.institution.contactName} —{" "}
                                {letter.institution.contactEmail}
                            </p>
                            {letter.partnerNotes && (
                                <p className="pt-2 border-t mt-2">
                                    <strong>Note partener:</strong> {letter.partnerNotes}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Pseudonim / prenume public</Label>
                                <Input
                                    value={childFirstName}
                                    onChange={(e) => setChildFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vârstă</Label>
                                <Input
                                    type="number"
                                    value={childAge}
                                    onChange={(e) => setChildAge(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Categorie</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Text scrisoare</Label>
                            <Textarea
                                value={childStory}
                                onChange={(e) => setChildStory(e.target.value)}
                                className="min-h-36"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Note interne admin</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Vizibile doar pentru administratori"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold">Obiecte solicitate</h3>
                            <span className="text-xs text-neutral-500">
                                Estimare instituție: {formatCurrency(letter.submittedTargetAmount)}
                            </span>
                        </div>

                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="border rounded-lg p-3 space-y-2 bg-neutral-50"
                            >
                                <div className="flex gap-2">
                                    <Input
                                        className="flex-1"
                                        placeholder="Obiect"
                                        value={item.name}
                                        onChange={(e) => updateItem(idx, { name: e.target.value })}
                                    />
                                    <Input
                                        className="w-20"
                                        placeholder="Mărime"
                                        value={item.size}
                                        onChange={(e) => updateItem(idx, { size: e.target.value })}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(idx)}
                                    >
                                        Șterge
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <Label className="text-xs text-neutral-500">
                                            Estimare instituție
                                        </Label>
                                        <Input
                                            type="number"
                                            value={item.submittedEstimatedPrice}
                                            onChange={(e) =>
                                                updateItem(idx, {
                                                    submittedEstimatedPrice: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-neutral-500">
                                            Preț aprobat admin (public)
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={item.adminApprovedPrice ?? ""}
                                            placeholder="—"
                                            onChange={(e) =>
                                                updateItem(idx, {
                                                    adminApprovedPrice:
                                                        e.target.value === ""
                                                            ? null
                                                            : Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            + Adaugă obiect
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-neutral-900 aspect-[3/4] flex items-center justify-center text-white rounded-lg overflow-hidden">
                        {letter.mediaType === "VIDEO" ? (
                            <video src={letter.originalImgUrl} controls className="max-h-full max-w-full" />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={letter.originalImgUrl}
                                className="max-h-full max-w-full object-contain"
                                alt="Letter"
                            />
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg space-y-4">
                        <h3 className="font-bold text-amber-950">Preț țintă admin (public)</h3>
                        <p className="text-xs text-amber-800">
                            Doar această sumă apare public. Maxim {MAX_APPROVED_TARGET_RON} RON.
                            Instituția nu poate modifica acest câmp.
                        </p>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Approved target amount (RON)</Label>
                                <Input
                                    type="number"
                                    min={MIN_APPROVED_TARGET_RON}
                                    max={MAX_APPROVED_TARGET_RON}
                                    value={approvedTarget}
                                    onChange={(e) => setApprovedTarget(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={fillTargetFromItems}
                                disabled={adminItemsSum <= 0}
                            >
                                Din obiecte ({adminItemsSum || 0})
                            </Button>
                        </div>
                    </div>

                    <div className="bg-neutral-100 p-6 rounded-lg space-y-3">
                        <h3 className="font-bold">Acțiuni</h3>
                        <Button
                            className="w-full"
                            variant="secondary"
                            disabled={pending}
                            onClick={() =>
                                run(async () => {
                                    await saveLetterModeration(letter.id, buildFormData())
                                })
                            }
                        >
                            Salvează modificările
                        </Button>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={pending}
                            onClick={() =>
                                run(async () => {
                                    await approveScrisoare(letter.id, buildFormData())
                                })
                            }
                        >
                            Aprobă & Publică
                        </Button>
                        <Button
                            className="w-full"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                                run(async () => {
                                    await archiveScrisoare(letter.id)
                                })
                            }
                        >
                            Arhivează
                        </Button>

                        <div className="pt-4 border-t space-y-2">
                            <Label className="text-xs">Motiv respingere (obligatoriu)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Ex: Text incomplet..."
                                />
                                <Button
                                    variant="destructive"
                                    disabled={pending || !rejectReason.trim()}
                                    onClick={() =>
                                        run(async () => {
                                            await rejectScrisoare(letter.id, rejectReason)
                                        })
                                    }
                                >
                                    Respinge
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
