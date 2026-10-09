import type { Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { LegalDialogProvider } from "@/components/legal/legal-dialog"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { JsonLd } from "@/components/seo/json-ld"
import { defaultMetadata } from "@/lib/seo/metadata"
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/jsonld"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
}

export const metadata = {
    ...defaultMetadata,
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        other: {
            "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
        },
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ro">
            <body className={inter.className} suppressHydrationWarning>
                <LegalDialogProvider>
                    <JsonLd data={[generateOrganizationSchema(), generateWebsiteSchema()]} />
                    <GoogleAnalytics />
                    {children}
                    <Toaster position="top-center" richColors />
                </LegalDialogProvider>
            </body>
        </html>
    )
}
