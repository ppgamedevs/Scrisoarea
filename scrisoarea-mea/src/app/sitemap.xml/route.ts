import { buildSitemapXml, sitemapXmlResponse } from "@/lib/seo/sitemap-data"

export const dynamic = "force-static"
export const revalidate = 3600

export async function GET() {
    return sitemapXmlResponse(await buildSitemapXml())
}
