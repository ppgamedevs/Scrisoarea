import type { MetadataRoute } from "next"
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_DIACRITICS } from "@/lib/seo/site"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_NAME_DIACRITICS,
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: "/",
        display: "standalone",
        background_color: "#fffaf3",
        theme_color: "#0f766e",
        lang: "ro",
        icons: [
            {
                src: "/brand/visuri-pe-hartie-logo.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/brand/visuri-pe-hartie-logo.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    }
}
