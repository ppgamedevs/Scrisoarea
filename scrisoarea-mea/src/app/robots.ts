import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo/site"

const DISALLOW = [
    "/admin/",
    "/partner/",
    "/api/",
    "/private/",
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
    "/profil",
    "/donatie/cancel",
    "/donatie/success",
]

const AI_BOTS = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "anthropic-ai",
    "PerplexityBot",
    "Google-Extended",
    "GoogleOther",
    "Applebot",
    "Applebot-Extended",
    "Bingbot",
    "Bytespider",
    "CCBot",
    "meta-externalagent",
    "Amazonbot",
    "cohere-ai",
    "YouBot",
]

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/llms.txt", "/llms-full.txt"],
                disallow: DISALLOW,
            },
            ...AI_BOTS.map((userAgent) => ({
                userAgent,
                allow: ["/", "/llms.txt", "/llms-full.txt", "/scrisori", "/fapte", "/api/public/"],
                disallow: DISALLOW,
            })),
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
