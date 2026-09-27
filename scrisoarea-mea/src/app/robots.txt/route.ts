import { SITE_URL } from "@/lib/seo/site"

export const dynamic = "force-static"

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

function block(userAgent: string, extraAllow: string[] = []) {
    const allow = ["/", "/robots.txt", "/sitemap.xml", "/sitemaps.xml", "/llms.txt", "/llms-full.txt", ...extraAllow]
    return [
        `User-Agent: ${userAgent}`,
        ...allow.map((path) => `Allow: ${path}`),
        ...DISALLOW.map((path) => `Disallow: ${path}`),
    ].join("\n")
}

export function GET() {
    const host = SITE_URL.replace(/^https?:\/\//, "")
    const body = [
        block("*"),
        "",
        ...AI_BOTS.flatMap((bot) => [block(bot, ["/scrisori", "/fapte", "/api/public/"]), ""]),
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        `Sitemap: ${SITE_URL}/sitemaps.xml`,
        `Host: ${host}`,
        "",
    ].join("\n")

    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
        },
    })
}
