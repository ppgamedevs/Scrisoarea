import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { isVideoProof } from "@/lib/proof-media"
import { saveFile } from "@/lib/storage"

const IMAGE_LIMIT = 4.5 * 1024 * 1024
const VIDEO_LIMIT = 100 * 1024 * 1024

export async function POST(request: Request) {
    const session = await getSession()
    if (!session || session.role !== "PARTNER" || !session.institutionId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session.emailVerified) {
        return NextResponse.json({ error: "Email neverificat." }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof File) || file.size <= 0) {
        return NextResponse.json({ error: "Încarcă o poză sau un video." }, { status: 400 })
    }

    const isVideo = isVideoProof(file.type, file.name)
    const isImage = !isVideo && (file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|avif)$/i.test(file.name))
    if (!isVideo && !isImage) {
        return NextResponse.json({ error: "Sunt acceptate doar poze sau video." }, { status: 400 })
    }

    const limit = isVideo ? VIDEO_LIMIT : IMAGE_LIMIT
    if (file.size > limit) {
        return NextResponse.json(
            { error: isVideo ? "Video-ul este prea mare (maxim 100MB)." : "Imaginea este prea mare (maxim 4.5MB)." },
            { status: 400 }
        )
    }

    const url = await saveFile(file)
    if (!url || url.includes("placehold.co") || url.includes("text=Error") || url.includes("No+Storage")) {
        return NextResponse.json({ error: "Fișierul nu a putut fi salvat." }, { status: 500 })
    }

    return NextResponse.json({ url })
}
