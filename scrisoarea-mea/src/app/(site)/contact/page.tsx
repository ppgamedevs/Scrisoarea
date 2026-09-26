"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"
import { submitContactForm } from "@/app/actions/contact"

export default function ContactPage() {
    const [pending, setPending] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setPending(true)
        const form = e.currentTarget
        const formData = new FormData(form)
        const result = await submitContactForm(formData)
        setPending(false)
        if (result.ok) {
            toast.success("Mesajul a fost trimis! Vă vom răspunde în 24h.")
            form.reset()
        } else {
            toast.error(result.error ?? "Eroare la trimitere.")
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 py-20 px-4">
            <div className="container mx-auto max-w-xl bg-white p-8 rounded-xl shadow-sm border">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Contact</h1>
                    <p className="text-slate-500">Suntem aici pentru întrebări, parteneriate sau feedback.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nume complet</label>
                        <Input name="name" required placeholder="Ex: Popescu Ion" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input name="email" type="email" required placeholder="email@exemplu.ro" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subiect</label>
                        <Input name="subject" required placeholder="Ex: Întrebare despre donații" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mesaj</label>
                        <Textarea name="message" required placeholder="Scrie mesajul tău aici..." className="min-h-[150px]" />
                    </div>

                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={pending}>
                        {pending ? "Se trimite..." : "Trimite Mesajul"}
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t text-center text-sm text-slate-500 space-y-2">
                    <p><strong>Email Direct:</strong> contact@visuripehartie.ro</p>
                    <p><strong>Program:</strong> Luni - Vineri, 09:00 - 17:00</p>
                </div>
            </div>
        </main>
    )
}
