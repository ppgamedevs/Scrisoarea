import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Nu limităm zoom-ul — utilizatorul poate apropia cât are nevoie (accesibilitate)
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://scrisoarea-mea.ro'),
  title: {
    default: 'Vise pe hârtie | Platformă de caritate transparentă',
    template: '%s | Vise pe hârtie'
  },
  description: 'Îndeplinește dorința unui copil. Platformă verificată, 100% transparentă, fără comisioane.',
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    siteName: 'Vise pe hârtie',
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
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
