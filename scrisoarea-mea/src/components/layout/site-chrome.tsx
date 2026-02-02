import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { User, LogOut } from "lucide-react"

export async function SiteHeader() {
    const session = await getSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
                    <span className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-lg text-lg">S</span>
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
                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profil" className="text-sm font-medium flex items-center gap-2 text-slate-700 hover:text-blue-600 bg-slate-50 px-3 py-1.5 rounded-full border">
                                <User className="w-4 h-4" />
                                <span className="max-w-[100px] truncate">{session.email.split('@')[0]}</span>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block">
                            Intră în cont
                        </Link>
                    )}

                    <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-none rounded-full px-6">
                        <Link href="/scrisori">Donează Acum</Link>
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
                    <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
                        <span className="bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded text-xs">S</span>
                        Scrisoarea Mea
                    </h3>
                    <p className="leading-relaxed text-slate-500">
                        Platforma tehnologică 100% transparentă care conectează direct donatorii cu nevoile verificate ale copiilor din medii vulnerabile. Fără comisioane. Fără intermediari.
                    </p>
                    <div className="text-xs text-slate-400 space-y-1 mt-4">
                        <p><strong>Asociația Scrisoarea Mea</strong></p>
                        <p>CUI: RO12345678 (Demo)</p>
                        <p>București, România</p>
                        <p>contact@scrisoareamea.ro</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Navigare</h4>
                    <ul className="space-y-3">
                        <li><Link href="/cum-functioneaza" className="hover:text-blue-600 transition-colors">Cum funcționează</Link></li>
                        <li><Link href="/scrisori" className="hover:text-blue-600 transition-colors">Toate Scrisorile</Link></li>
                        <li><Link href="/directioneaza-35" className="text-indigo-600 font-semibold hover:underline">Redirecționează 3.5%</Link></li>
                        <li><Link href="/directioneaza-20" className="text-blue-600 font-semibold hover:underline">Sponsorizează 20%</Link></li>
                        <li><Link href="/impact" className="hover:text-blue-600 transition-colors">Dovezi de Impact</Link></li>
                        <li><Link href="/transparenta" className="hover:text-blue-600 transition-colors">Rapoarte Financiare</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Resurse & Siguranță</h4>
                    <ul className="space-y-3">
                        <li><Link href="/fapte" className="hover:text-blue-600 transition-colors">Fapte și Cifre</Link></li>
                        <li><Link href="/siguranta" className="hover:text-blue-600 transition-colors">Siguranță și GDPR</Link></li>
                        <li><Link href="/procese" className="hover:text-blue-600 transition-colors">Procese Operaționale</Link></li>
                        <li><Link href="/intrebari" className="hover:text-blue-600 transition-colors">Întrebări Frecvente</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                    <ul className="space-y-3">
                        <li><Link href="/termeni" className="hover:text-blue-600 transition-colors">Termeni și Condiții</Link></li>
                        <li><Link href="/confidentialitate" className="hover:text-blue-600 transition-colors">Politica de Confidențialitate</Link></li>
                        <li><Link href="/cookies" className="hover:text-blue-600 transition-colors">Politica Cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                <p>&copy; {new Date().getFullYear()} Asociația Scrisoarea Mea. Cod Open Source.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link href="/admin" className="hover:text-slate-900">Acces Admin</Link>
                    <Link href="/partener/login" className="hover:text-slate-900">Acces Parteneri</Link>
                </div>
            </div>
        </footer>
    )
}
