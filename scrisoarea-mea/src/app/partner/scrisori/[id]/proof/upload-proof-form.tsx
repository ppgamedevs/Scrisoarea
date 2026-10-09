"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadProofAction } from "@/app/actions/proof-actions"
import { isActiveProof, isVideoProof, MAX_PROOF_IMAGES, proofMediaType } from "@/lib/proof-media"

const IMAGE_LIMIT = 4.5 * 1024 * 1024
const VIDEO_LIMIT = 100 * 1024 * 1024

export type ExistingProof = {
    id: string
    url: string
    type: string
    moderationStatus: string
    rejectReason: string | null
    createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
    PENDING: "În moderare",
    APPROVED: "Aprobată",
    REJECTED: "Respinsă",
}

function statusLabel(status: string) {
    return STATUS_LABEL[status] || status
}

export function UploadProofForm({
    scrisoareId,
    proofs,
}: {
    scrisoareId: string
    proofs: ExistingProof[]
}) {
    const router = useRouter()
    const [pending, setPending] = useState(false)
    const [error, setError] = useState("")
    const [addingImage, setAddingImage] = useState(false)

    function refreshAfterUpload() {
        setError("")
        setAddingImage(false)
        setPending(false)
        router.refresh()
    }

    const active = proofs.filter((proof) => isActiveProof(proof.moderationStatus))
    const activeVideo = active.find((proof) => isVideoProof(proof.type, proof.url))
    const activeImages = active.filter((proof) => !isVideoProof(proof.type, proof.url))
    const showFirstImage = activeImages.length === 0
    const showExtraImage = addingImage && activeImages.length > 0 && activeImages.length < MAX_PROOF_IMAGES

    async function uploadFile(file: File) {
        setError("")
        const isVideo = proofMediaType(file) === "VIDEO"
        const isImage = !isVideo && (file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|avif)$/i.test(file.name))
        if (!isVideo && !isImage) {
            setError("Sunt acceptate doar poze sau video.")
            return
        }
        if (isVideo && activeVideo) {
            setError("Poți încărca un singur videoclip.")
            return
        }
        if (isImage && activeImages.length >= MAX_PROOF_IMAGES) {
            setError("Poți încărca maximum 3 imagini.")
            return
        }
        if (isImage && file.size > IMAGE_LIMIT) {
            setError("Imaginea este prea mare (maxim 4.5MB).")
            return
        }
        if (isVideo && file.size > VIDEO_LIMIT) {
            setError("Video-ul este prea mare (maxim 100MB).")
            return
        }

        setPending(true)
        try {
            const payload = new FormData()
            payload.set("mediaType", proofMediaType(file))

            try {
                const { upload } = await import("@vercel/blob/client")
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
                const blob = await upload(`proofs/${crypto.randomUUID()}-${safeName}`, file, {
                    access: "public",
                    handleUploadUrl: "/api/upload",
                })
                payload.set("mediaUrl", blob.url)
            } catch {
                const body = new FormData()
                body.set("file", file)
                const response = await fetch("/api/proofs/upload", { method: "POST", body })
                const data = (await response.json().catch(() => null)) as { url?: string; type?: string; error?: string } | null
                if (!response.ok || !data?.url) {
                    throw new Error(data?.error || "Dovada nu a putut fi salvată. Vercel Blob nu este configurat local.")
                }
                payload.set("mediaUrl", data.url)
                if (data.type === "VIDEO" || data.type === "PHOTO") {
                    payload.set("mediaType", data.type)
                }
            }

            await uploadProofAction(scrisoareId, payload)
            refreshAfterUpload()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : ""
            const digest = typeof err === "object" && err && "digest" in err ? String(err.digest) : ""
            if (message.includes("NEXT_REDIRECT") || digest.includes("NEXT_REDIRECT")) {
                refreshAfterUpload()
                return
            }
            setError(message || "Dovada nu a putut fi încărcată.")
            setPending(false)
        }
    }

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <div>
                    <Label>Videoclip (opțional)</Label>
                    <p className="text-xs text-slate-500">Maximum un videoclip.</p>
                </div>
                {activeVideo ? (
                    <ProofTile proof={activeVideo} />
                ) : (
                    <Input
                        type="file"
                        accept="video/*,.mp4,.webm,.mov,.m4v"
                        disabled={pending}
                        onChange={(event) => {
                            const file = event.target.files?.[0]
                            event.target.value = ""
                            if (file) void uploadFile(file)
                        }}
                    />
                )}
            </section>

            <section className="space-y-3">
                <div>
                    <Label>Imagini</Label>
                    <p className="text-xs text-slate-500">Maximum 3 imagini. Poza următoare se adaugă după prima încărcare.</p>
                </div>
                {activeImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {activeImages.map((proof) => (
                            <ProofTile key={proof.id} proof={proof} />
                        ))}
                    </div>
                )}
                {showFirstImage && (
                    <Input
                        type="file"
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
                        disabled={pending}
                        onChange={(event) => {
                            const file = event.target.files?.[0]
                            event.target.value = ""
                            if (file) void uploadFile(file)
                        }}
                    />
                )}
                {activeImages.length >= 1 && activeImages.length < MAX_PROOF_IMAGES && !addingImage && (
                    <Button type="button" variant="outline" disabled={pending} onClick={() => setAddingImage(true)}>
                        <Plus className="h-4 w-4" /> Adaugă imagine
                    </Button>
                )}
                {showExtraImage && (
                    <Input
                        type="file"
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
                        disabled={pending}
                        onChange={(event) => {
                            const file = event.target.files?.[0]
                            event.target.value = ""
                            if (file) void uploadFile(file)
                        }}
                    />
                )}
                {activeImages.length >= MAX_PROOF_IMAGES && (
                    <p className="text-sm text-slate-500">Ai încărcat numărul maxim de imagini.</p>
                )}
            </section>

            {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded p-3">{error}</p>
            )}
            {pending && <p className="text-sm text-slate-500">Se încarcă...</p>}
        </div>
    )
}

function ProofTile({ proof }: { proof: ExistingProof }) {
    const video = isVideoProof(proof.type, proof.url)
    return (
        <div className="space-y-1">
            <div className="aspect-video overflow-hidden rounded-lg bg-neutral-950">
                {video ? (
                    <video src={proof.url} className="h-full w-full object-contain" muted />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proof.url} alt="Dovadă încărcată" className="h-full w-full object-cover" />
                )}
            </div>
            <p className="text-xs text-slate-500">{statusLabel(proof.moderationStatus)}</p>
        </div>
    )
}
