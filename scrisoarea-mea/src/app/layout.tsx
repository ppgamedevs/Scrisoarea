import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Nu limităm zoom-ul — utilizatorul poate apropia cât are nevoie (accesibilitate)
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://scrisoarea-mea.ro'),
  title: {
    default: 'Visuri pe hartie | Platformă de caritate transparentă',
    template: '%s | Visuri pe hartie'
  },
  description: 'Îndeplinește dorința unui copil. Platformă verificată, 100% transparentă, fără comisioane.',
  applicationName: 'Visuri pe hartie',
  icons: {
    icon: '/brand/visuri-pe-hartie-logo.png',
    apple: '/brand/visuri-pe-hartie-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    siteName: 'Visuri pe hartie',
    title: 'Visuri pe hartie | Platformă de caritate transparentă',
    description: 'Îndeplinește dorința unui copil. Platformă verificată, 100% transparentă, fără comisioane.',
    images: [
      {
        url: '/brand/visuri-pe-hartie-logo.png',
        width: 1024,
        height: 347,
        alt: 'Visuri pe hartie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visuri pe hartie',
    description: 'Îndeplinește dorința unui copil. Platformă verificată, 100% transparentă, fără comisioane.',
    images: ['/brand/visuri-pe-hartie-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={inter.className} suppressHydrationWarning>
        <GoogleAnalytics />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
