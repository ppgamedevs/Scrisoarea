"use client"

import { createContext, useContext, useState } from "react"
import { Dialog } from "radix-ui"
import { X } from "lucide-react"
import { LEGAL_DOCS, LegalDoc, LegalDocument } from "@/components/legal/legal-documents"

const LegalDialogContext = createContext<{ openLegal: (doc: LegalDoc) => void } | null>(null)

export function useLegalDialog() {
    const context = useContext(LegalDialogContext)
    if (!context) throw new Error("useLegalDialog must be used inside LegalDialogProvider")
    return context
}

export function LegalDialogProvider({ children }: { children: React.ReactNode }) {
    const [doc, setDoc] = useState<LegalDoc | null>(null)

    return (
        <LegalDialogContext.Provider value={{ openLegal: setDoc }}>
            {children}
            <Dialog.Root open={doc !== null} onOpenChange={(open) => { if (!open) setDoc(null) }}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-900/50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] flex max-h-[85vh] w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                            <div>
                                <Dialog.Title className="text-lg font-semibold tracking-tight">
                                    {doc ? LEGAL_DOCS[doc].title : "Document"}
                                </Dialog.Title>
                                <Dialog.Description className="mt-1 text-sm text-slate-500">
                                    Platforma „Visuri pe hartie”
                                </Dialog.Description>
                            </div>
                            <Dialog.Close className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Închide">
                                <X className="h-4 w-4" />
                            </Dialog.Close>
                        </div>
                        <div key={doc ?? "closed"} className="overflow-y-auto px-6 py-6">
                            {doc ? <LegalDocument doc={doc} showTitle={false} onOpen={setDoc} /> : null}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </LegalDialogContext.Provider>
    )
}

export function LegalLink({
    doc,
    className,
    children,
}: {
    doc: LegalDoc
    className?: string
    children: React.ReactNode
}) {
    const { openLegal } = useLegalDialog()
    return (
        <button type="button" className={className} onClick={() => openLegal(doc)}>
            {children}
        </button>
    )
}
