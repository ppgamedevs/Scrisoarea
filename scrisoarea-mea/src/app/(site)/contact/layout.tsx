import { pageMetadata } from "@/lib/seo/metadata"

export const metadata = pageMetadata({
    title: "Contact Visuri pe hârtie",
    description: "Scrie echipei Visuri pe hârtie. Răspundem donatorilor, partenerilor și presei. visuripehartie.ro",
    path: "/contact",
    keywords: ["contact ONG", "contact@visuripehartie.ro"],
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children
}
