"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTeamMember, deleteTeamMember, updateTeamMember } from "@/app/actions/team-actions"

const TEAM_TOAST_KEY = "team-toast"

const SUCCESS_MESSAGES = {
    created: "Membrul a fost adăugat.",
    updated: "Membrul a fost actualizat.",
    deleted: "Membrul a fost șters.",
}

function reloadWithSuccess(kind: keyof typeof SUCCESS_MESSAGES) {
    sessionStorage.setItem(TEAM_TOAST_KEY, SUCCESS_MESSAGES[kind])
    window.location.assign("/admin/echipa")
}

export function TeamToast() {
    useEffect(() => {
        const message = sessionStorage.getItem(TEAM_TOAST_KEY)
        if (!message) return
        sessionStorage.removeItem(TEAM_TOAST_KEY)
        toast.success(message, { position: "bottom-right" })
    }, [])
    return null
}

const POSITIONS = [1, 2, 3, 4, 5]

type Member = {
    id: string
    name: string
    title: string
    imageUrl: string | null
    sortOrder: number
}

export function TeamMemberForm({ member, defaultPosition = 5 }: { member?: Member; defaultPosition?: number }) {
    const [error, setError] = useState("")
    const [pending, setPending] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPending(true)
        setError("")
        const formData = new FormData(event.currentTarget)
        try {
            const result = member
                ? await updateTeamMember(member.id, formData)
                : await createTeamMember(formData)
            if (result && "error" in result && result.error) {
                setError(result.error)
                setPending(false)
                return
            }
            if (result && "ok" in result && (result.ok === "created" || result.ok === "updated")) {
                reloadWithSuccess(result.ok)
                return
            }
            setError("Nu am putut salva membrul.")
            setPending(false)
        } catch {
            setError("Nu am putut salva membrul.")
            setPending(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">{member ? "Editează membrul" : "Adaugă membru"}</h2>
            {member?.imageUrl ? (
                <img src={member.imageUrl} alt="" className="h-16 w-16 rounded-full object-cover bg-neutral-100" />
            ) : member ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-xl font-semibold text-neutral-500">
                    {member.name.charAt(0)}
                </div>
            ) : null}
            <div className="space-y-2">
                <Label htmlFor={member ? `name-${member.id}` : "name"}>Nume</Label>
                <Input id={member ? `name-${member.id}` : "name"} name="name" required defaultValue={member?.name} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={member ? `title-${member.id}` : "title"}>Titlu</Label>
                <Input id={member ? `title-${member.id}` : "title"} name="title" required defaultValue={member?.title} />
            </div>
            <div className="space-y-2">
                <Label htmlFor={member ? `position-${member.id}` : "position"}>Poziție pe pagină</Label>
                <select
                    id={member ? `position-${member.id}` : "position"}
                    name="position"
                    defaultValue={String(member?.sortOrder || defaultPosition)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    required
                >
                    {POSITIONS.map((position) => (
                        <option key={position} value={position}>
                            {position}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor={member ? `image-${member.id}` : "image"}>
                    Poză {member ? "(opțional, dacă vrei să o schimbi)" : ""}
                </Label>
                <Input
                    id={member ? `image-${member.id}` : "image"}
                    name="image"
                    type="file"
                    accept="image/*"
                    required={!member}
                />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                    {pending ? "Se salvează..." : member ? "Salvează" : "Adaugă"}
                </Button>
                <Button asChild type="button" variant="outline">
                    <Link href="/admin/echipa">Anulează</Link>
                </Button>
            </div>
        </form>
    )
}

export function DeleteTeamMemberButton({ id, name }: { id: string; name: string }) {
    const [pending, setPending] = useState(false)

    return (
        <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
                if (!window.confirm(`Ștergi pe ${name} din echipă?`)) return
                setPending(true)
                void deleteTeamMember(id)
                    .then((result) => {
                        if (result && "ok" in result && result.ok === "deleted") {
                            reloadWithSuccess(result.ok)
                            return
                        }
                        setPending(false)
                        toast.error("Nu am putut șterge membrul.", { position: "bottom-right" })
                    })
                    .catch(() => {
                        setPending(false)
                        toast.error("Nu am putut șterge membrul.", { position: "bottom-right" })
                    })
            }}
        >
            Șterge
        </Button>
    )
}
