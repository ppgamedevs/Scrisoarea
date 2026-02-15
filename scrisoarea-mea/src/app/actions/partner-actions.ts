"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

import { saveFile } from "@/lib/storage"

export async function createScrisoare(formData: FormData) {
    const session = await getSession()
    if (!session || session.role !== 'PARTNER' || !session.institutionId) throw new Error("Unauthorized")

    const itemsJson = formData.get('items') as string
    const items = JSON.parse(itemsJson)

    // Handle Campaign & Limits
    const campaignIdRaw = formData.get('campaignId') as string
    const campaignId = campaignIdRaw && campaignIdRaw !== 'NONE' ? campaignIdRaw : undefined
    const limit = campaignId ? 1500 : 500

    // Handle Submission Status
    const actionType = formData.get('actionType') as string // 'draft' | 'submit'
    const status = actionType === 'submit' ? 'SUBMITTED' : 'DRAFT'

    // Calculate total
    const total = items.reduce((acc: number, item: any) => acc + Number(item.estimatedValue || 0), 0)

    if (total > limit) throw new Error(`Suma totală depășește limita de ${limit} RON pentru tipul de cerere selectat.`)

    // Handle File Upload
    // Handle File Upload (Client-side URL or Server-side File)
    const mediaUrlParam = formData.get('mediaUrl') as string | null
    const mediaTypeParam = formData.get('mediaType') as 'IMAGE' | 'VIDEO' | null

    let mediaUrl = "https://placehold.co/600x800" // Default fallback
    let mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'

    if (mediaUrlParam) {
        // Client-side uploaded file
        mediaUrl = mediaUrlParam
        if (mediaTypeParam) mediaType = mediaTypeParam

        // If it's a video from Blob (URL), we might need to compress it if it's large
        if (mediaType === 'VIDEO') {
            try {
                const response = await fetch(mediaUrl)
                if (response.ok) {
                    const size = Number(response.headers.get('content-length'))
                    if (size > 4.5 * 1024 * 1024) {
                        // Download and Compress
                        const blob = await response.blob()
                        const fileBuffer = Buffer.from(await blob.arrayBuffer())

                        // Create a "File" to pass to compressor (compressVideo expects File)
                        const fileName = mediaUrl.split('/').pop() || 'video.mp4'
                        const fileToCompress = new File([new Uint8Array(fileBuffer)], fileName, { type: 'video/mp4' })

                        const { compressVideo } = await import('@/lib/video')
                        const compressedBuffer = await compressVideo(fileToCompress)

                        // Re-upload compressed
                        const compressedFile = new File([new Uint8Array(compressedBuffer)], fileName, { type: 'video/mp4' })
                        const newUrl = await saveFile(compressedFile)

                        // Update URL
                        mediaUrl = newUrl

                        // Try to delete old blob if it was Vercel Blob
                        if (mediaUrlParam.includes('public.blob.vercel-storage.com')) {
                            try {
                                const { del } = await import('@vercel/blob')
                                await del(mediaUrlParam)
                            } catch (e) { console.error("Failed to delete original blob", e) }
                        }
                    }
                }
            } catch (e) {
                console.error("Error processing video from URL:", e)
            }
        }
    } else {
        // Fallback: Server-side file upload
        const file = formData.get('file') as File | null
        if (file && file.size > 0) {
            // New limit: 100MB before compression
            if (file.size > 100 * 1024 * 1024) {
                throw new Error("Fișierul este prea mare (maxim 100MB pentru upload, va fi comprimat).")
            }

            if (file.type.startsWith('image/')) {
                if (file.size > 4.5 * 1024 * 1024) throw new Error("Imaginea este prea mare (maxim 4.5MB).")
                mediaType = 'IMAGE'
                mediaUrl = await saveFile(file)
            } else if (file.type.startsWith('video/')) {
                mediaType = 'VIDEO'

                let fileToUpload = file
                // If video > 4.5MB, compress it
                if (file.size > 4.5 * 1024 * 1024) {
                    try {
                        const { compressVideo } = await import('@/lib/video') // Dynamic import to avoid load issues if ffmpeg missing
                        const compressedBuffer = await compressVideo(file)

                        // Check compressed size
                        if (compressedBuffer.byteLength > 4.5 * 1024 * 1024) {
                            throw new Error("Video-ul este prea mare chiar și după compresie. Te rugăm să încarci un video mai scurt.")
                        }

                        // Create a new file-like object or pass buffer to saveFile (need to check saveFile signature)
                        // saveFile likely takes File or Blob. We might need to adjust saveFile or create a File object.
                        // Node.js File object is tricky. let's see saveFile.
                        // For now assume saveFile can take a buffer or we convert.
                        // Actually saveFile in next.js server actions usually expects File. 
                        // We can create a new File from buffer if Node version supports it, or modify saveFile.

                        // Let's modify logic to pass buffer if needed, OR construct a File.
                        fileToUpload = new File([new Uint8Array(compressedBuffer)], file.name, { type: 'video/mp4' })

                    } catch (e: any) {
                        console.error("Compression failed:", e)
                        throw new Error(`Compresia video a eșuat: ${e.message}`)
                    }
                }

                mediaUrl = await saveFile(fileToUpload)
            } else {
                throw new Error("Tipul de fișier nu este suportat.")
            }
        }
    }

    // Random simple public code
    const publicCode = `REQ-${Date.now().toString().slice(-6)}`

    // Generate slug (Clean URL: firstname-age-XXXX)
    const childName = (formData.get('childFirstName') as string).trim()
    const age = (formData.get('childAge') as string).trim()
    const slugBase = `${childName}-${age}-ani`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    // Short 4-char suffix
    const suffix = Math.random().toString(36).substring(2, 6)
    const slug = `${slugBase}-${suffix}`

    const newLetter = await prisma.scrisoare.create({
        data: {
            publicCode,
            slug,
            institutionId: session.institutionId,
            campaignId: campaignId,
            childFirstName: childName,
            childLastName: 'P.', // Hidden
            childAge: Number(age),
            childGender: formData.get('childGender') as string,
            category: formData.get('category') as string,
            childStory: formData.get('childStory') as string,
            originalImgUrl: mediaUrl,
            mediaType: mediaType,
            wishList: items.map((i: any) => i.name).join(", "), // Fallback
            items: itemsJson,
            targetAmount: total,
            moderationStatus: status, // DRAFT or SUBMITTED
            status: 'NOU'
        }
    })

    redirect(`/partner`)
}

export async function submitScrisoare(id: string) {
    // Check ownership
    const session = await getSession()
    if (!session || session.role !== 'PARTNER' || !session.institutionId) throw new Error("Unauthorized")

    const letter = await prisma.scrisoare.findUnique({ where: { id } })
    if (!letter) throw new Error("Scrisoare inexistentă")

    if (letter.institutionId !== session.institutionId) {
        throw new Error("Nu aveți permisiunea de a modifica această scrisoare.")
    }

    await prisma.scrisoare.update({
        where: { id },
        data: { moderationStatus: 'SUBMITTED' }
    })
    revalidatePath('/partner')
    revalidatePath('/admin/scrisori')
}
