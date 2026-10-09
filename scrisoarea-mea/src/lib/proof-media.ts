export const MAX_PROOF_IMAGES = 3
export const MAX_PROOF_VIDEOS = 1

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".ogg", ".ogv"]

export function isActiveProof(status?: string | null) {
    return status === "PENDING" || status === "APPROVED"
}

export function isVideoProof(type?: string | null, urlOrName?: string | null) {
    const normalized = (type || "").trim().toUpperCase()
    if (normalized === "VIDEO" || normalized.startsWith("VIDEO/")) return true

    const path = (urlOrName || "").split("?")[0].split("#")[0].toLowerCase()
    return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))
}

export function proofMediaType(file: { type?: string | null; name?: string | null }): "VIDEO" | "PHOTO" {
    return isVideoProof(file.type, file.name) ? "VIDEO" : "PHOTO"
}
