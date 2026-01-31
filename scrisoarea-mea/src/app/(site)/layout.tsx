import { SiteHeader, SiteFooter } from "@/components/layout/site-chrome"
import { CookieBanner } from "@/components/layout/cookie-banner"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <CookieBanner />
        </div>
    )
}

