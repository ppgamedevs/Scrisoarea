import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PartnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session || session.role !== 'PARTNER') redirect('/login')

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span>🏢 Portal Parteneri</span>
                    <span className="text-sm font-normal text-slate-500">| {session.email}</span>
                </div>
                <nav className="flex gap-4">
                    <Link href="/partner" className="text-sm hover:underline">Scrisorile Tale</Link>
                    <Link href="/partner/scrisori/new" className="text-sm hover:underline">Adaugă Scrisoare</Link>
                </nav>
                <form action={async () => {
                    "use server"
                    // Can't import logout action here directly in layout usually, 
                    // but simpler for now just a link to public? 
                    // Best is a Client Component for Logout button.
                }}>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/api/auth/signout">Ieșire</Link>
                    </Button>
                </form>
            </header>
            <main className="p-6 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
