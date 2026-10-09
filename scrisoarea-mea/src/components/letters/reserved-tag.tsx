"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function ReservedHoursTag({ expiresAt }: { expiresAt: string }) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 30_000)
        return () => window.clearInterval(id)
    }, [])

    const remaining = new Date(expiresAt).getTime() - now
    if (remaining <= 0) return null

    const hours = Math.max(1, Math.ceil(remaining / 3_600_000))

    return (
        <Badge className="border-none bg-amber-100 text-amber-900 hover:bg-amber-100">
            Rezervat · {hours}h
        </Badge>
    )
}

export function InDeliveryTag() {
    return (
        <Badge className="border-none bg-sky-100 text-sky-900 hover:bg-sky-100">
            În curs de livrare
        </Badge>
    )
}
