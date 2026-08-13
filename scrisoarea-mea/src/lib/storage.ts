import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { put } from "@vercel/blob"

function blobPathname(file: File): string {
    const ext = path.extname(file.name) || ".bin"
    const safeExt = ext.slice(0, 12).toLowerCase()
    return `uploads/${randomUUID()}${safeExt}`
}

/**
 * Saves a file. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise local disk.
 */
export async function saveFile(file: File): Promise<string> {
    try {
        if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
            const blob = await put(blobPathname(file), file, {
                access: 'public',
                addRandomSuffix: false,
            })
            return blob.url
        } else if (process.env.VERCEL) {
            console.warn("Vercel Blob not configured. Returning placeholder.")
            return "https://placehold.co/600x800?text=No+Storage+Configured"
        } else {
            return await saveFileLocal(file)
        }
    } catch (error) {
        console.error("Error saving file:", error)
        return "https://placehold.co/600x800?text=Error+Saving+File"
    }
}

async function saveFileLocal(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || ".jpg"
    const filename = `${randomUUID()}${ext}`

    const uploadDir = path.join(process.cwd(), "public/uploads")
    try {
        await fs.access(uploadDir)
    } catch {
        await fs.mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    return `/uploads/${filename}`
}
