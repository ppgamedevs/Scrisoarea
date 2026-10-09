export async function uploadLetterFile(file: File): Promise<string> {
    try {
        const { upload } = await import("@vercel/blob/client")
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
        const blob = await upload(`letters/${crypto.randomUUID()}-${safeName}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
        })
        return blob.url
    } catch {
        const body = new FormData()
        body.set("file", file)
        const response = await fetch("/api/media/upload", { method: "POST", body })
        const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null
        if (!response.ok || !data?.url) {
            throw new Error(data?.error || "Fișierul nu a putut fi salvat.")
        }
        return data.url
    }
}
