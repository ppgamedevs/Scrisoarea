import { put } from "@vercel/blob"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"

/**
 * Persist binary content (PDF/PNG). Prefer Vercel Blob; fall back to local /public/uploads.
 * Returns a publicly reachable URL (or local /uploads path).
 */
export async function saveBytes(
    bytes: Uint8Array | Buffer,
    opts: { filename: string; contentType: string; folder?: string }
): Promise<string> {
    const folder = opts.folder || "sponsorship"
    const safeName = opts.filename.replace(/[^a-zA-Z0-9._-]/g, "_")
    const key = `${folder}/${randomUUID()}-${safeName}`
    const buffer = Buffer.from(bytes)

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
        const blob = await put(key, buffer, {
            access: "public",
            contentType: opts.contentType,
            addRandomSuffix: false,
        })
        return blob.url
    }

    if (process.env.VERCEL) {
        // No blob on Vercel — store data URL only as last resort for small PDFs
        const b64 = buffer.toString("base64")
        return `data:${opts.contentType};base64,${b64}`
    }

    const uploadDir = path.join(process.cwd(), "public/uploads", folder)
    await fs.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, `${randomUUID()}-${safeName}`)
    await fs.writeFile(filePath, buffer)
    return `/uploads/${folder}/${path.basename(filePath)}`
}
