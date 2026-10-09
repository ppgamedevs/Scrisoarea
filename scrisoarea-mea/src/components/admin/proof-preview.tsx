"use client"

import { useRef, useState } from "react"
import { Dialog } from "radix-ui"
import { Play, X, ZoomIn } from "lucide-react"
import { isVideoProof } from "@/lib/proof-media"

function isPlaceholderProof(url: string) {
    return url.includes("placehold.co") || url.includes("w3schools.com")
}

export function ProofPreview({ url, type }: { url: string; type: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [open, setOpen] = useState(false)
    const [failed, setFailed] = useState(false)
    const [zoomed, setZoomed] = useState(false)
    const isVideo = isVideoProof(type, url)
    const placeholder = isPlaceholderProof(url)

    function onOpenChange(next: boolean) {
        if (!next) {
            videoRef.current?.pause()
            if (videoRef.current) videoRef.current.currentTime = 0
            setZoomed(false)
        }
        setOpen(next)
    }

    return (
        <div className="w-full max-w-2xl space-y-3">
            {placeholder && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
                    Fișierul original nu a fost salvat. Instituția trebuie să încarce dovada din nou.
                </p>
            )}

            <div className="min-h-80 rounded-lg bg-neutral-950 flex items-center justify-center p-3">
                {failed ? (
                    <p className="text-white text-sm px-4 text-center">
                        Fișierul nu s-a încărcat. Deschide originalul din linkul de mai jos.
                    </p>
                ) : isVideo ? (
                    <div className="relative w-full">
                        <video
                            src={url}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full max-h-[420px] bg-black"
                            onError={() => setFailed(true)}
                        />
                        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                            <Play className="h-3 w-3" /> Video
                        </span>
                    </div>
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={url}
                        alt="Dovadă încărcată"
                        className="max-h-[420px] w-full object-contain"
                        onError={() => setFailed(true)}
                    />
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onClick={() => onOpenChange(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                    {isVideo ? <Play className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                    Verifică dovada
                </button>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-700 underline"
                >
                    Deschide originalul
                </a>
            </div>

            <Dialog.Root open={open} onOpenChange={onOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[min(1100px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-neutral-950 text-white shadow-2xl">
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                            <div>
                                <Dialog.Title className="text-base font-semibold">
                                    {isVideo ? "Verifică video" : "Verifică imaginea"}
                                </Dialog.Title>
                                <Dialog.Description className="text-xs text-neutral-400">
                                    {isVideo
                                        ? "Redă clipul cu playerul de mai jos. Poți folosi ecran complet din controale."
                                        : "Click pe imagine pentru zoom. Deschide originalul dacă vrei fișierul întreg."}
                                </Dialog.Description>
                            </div>
                            <Dialog.Close className="rounded-md p-2 text-neutral-300 hover:bg-white/10 hover:text-white">
                                <X className="h-5 w-5" />
                                <span className="sr-only">Închide</span>
                            </Dialog.Close>
                        </div>

                        <div className="min-h-0 flex-1 overflow-auto p-4">
                            {failed ? (
                                <p className="py-16 text-center text-sm text-neutral-300">
                                    Fișierul nu s-a încărcat. Deschide originalul din linkul de mai jos.
                                </p>
                            ) : isVideo ? (
                                <video
                                    ref={videoRef}
                                    src={url}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="mx-auto max-h-[85vh] w-full bg-black"
                                    onError={() => setFailed(true)}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setZoomed((value) => !value)}
                                    className="mx-auto block cursor-zoom-in"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={url}
                                        alt="Dovadă încărcată, mărită"
                                        className={
                                            zoomed
                                                ? "max-w-none w-[150%] cursor-zoom-out"
                                                : "mx-auto max-h-[85vh] max-w-full object-contain cursor-zoom-in"
                                        }
                                        onError={() => setFailed(true)}
                                    />
                                </button>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-white/10 px-4 py-3">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-blue-300 underline"
                            >
                                Deschide originalul
                            </a>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}
