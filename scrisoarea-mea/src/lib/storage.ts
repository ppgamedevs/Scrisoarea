import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { put } from "@vercel/blob"

/**
 * Saves a file. Tries Vercel Blob first (if env var present), falls back to local FS.
 * @param file The file object
 * @returns The public URL path to the file
 */
export async function saveFile(file: File): Promise<string> {
    try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(file.name, file, { access: 'public' })
            return blob.url
        } else if (process.env.VERCEL) {
            // On Vercel but no Blob token => fallback to placeholder
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

/**
 * Saves a file to the local filesystem (public/uploads folder).
 * @param file The file object (Blob/File from FormData)
 * @returns The public URL path to the file (e.g., "/uploads/myfile.jpg")
 */
async function saveFileLocal(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || ".jpg"
    const filename = `${randomUUID()}${ext}`

    // Ensure directory exists
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
