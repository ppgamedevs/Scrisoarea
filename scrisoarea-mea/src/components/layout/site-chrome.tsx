import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
                    Scrisoarea Mea
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="/scrisori" className="hover:text-slate-900 transition-colors">Scrisori</Link>
                    <Link href="/cum-functioneaza" className="hover:text-slate-900 transition-colors">Cum funcționează</Link>
                    <Link href="/impact" className="hover:text-slate-900 transition-colors">Impact</Link>
                    <Link href="/transparenta" className="hover:text-slate-900 transition-colors">Transparență</Link>
                    <Link href="/despre" className="hover:text-slate-900 transition-colors">Despre</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block">
                        Parteneri
                    </Link>
                    <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-none">
                        <Link href="/scrisori">Vezi Scrisorile</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export function SiteFooter() {
    return (
        <footer className="bg-slate-50 border-t pt-16 pb-12 text-slate-600 text-sm">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Scrisoarea Mea</h3>
                    <p className="leading-relaxed">
                        Platformă de transparență radicală pentru îndeplinirea dorințelor copiilor din medii vulnerabile.
                    </p>
                    <div className="text-xs text-slate-500 space-y-1 mt-4">
                        <p><strong>Asociația Scrisoarea Mea (Placeholder)</strong></p>
                        <p>CUI: XXXXXXXX</p>
                        <p>Reg. Com: J40/XXXX/YYYY</p>
                        <p>București, Sector 1, Str. Exemplului Nr. 1</p>
                        <p>Email: contact@scrisoareamea.ro</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Navigare Rapidă</h4>
                    <ul className="space-y-3">
                        <li><Link href="/cum-functioneaza" className="hover:underline">Cum funcționează</Link></li>
                        <li><Link href="/scrisori" className="hover:underline">Caută o scrisoare</Link></li>
                        <li><Link href="/impact" className="hover:underline">Impact și Dovezi</Link></li>
                        <li><Link href="/transparenta" className="hover:underline">Transparență Financiară</Link></li>
                        <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Încredere și Siguranță</h4>
                    <ul className="space-y-3">
                        <li><Link href="/protectia-copiilor" className="hover:underline">Protecția Copiilor</Link></li>
                        <li><Link href="/verificare-institutii" className="hover:underline">Verificare Instituții</Link></li>
                        <li><Link href="/despre" className="hover:underline">Despre Noi</Link></li>
                        <li><Link href="/faq" className="hover:underline">Întrebări Frecvente (FAQ)</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                    <ul className="space-y-3">
                        <li><Link href="/termeni" className="hover:underline">Termeni și Condiții</Link></li>
                        <li><Link href="/confidentialitate" className="hover:underline">Politica de Confidențialitate</Link></li>
                        <li><Link href="/cookies" className="hover:underline">Politica Cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                <p>&copy; {new Date().getFullYear()} Asociația Scrisoarea Mea. Toate drepturile rezervate.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <span>Proiect open-source pentru binele comun.</span>
                </div>
            </div>
        </footer>
    )
}
