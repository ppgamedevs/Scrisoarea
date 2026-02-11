import Link from "next/link"
import Image from "next/image"
import { getSession } from "@/lib/auth"
import { HeaderNavClient } from "@/components/layout/header-nav-client"
import { Button } from "@/components/ui/button"

export async function SiteHeader() {
    const session = await getSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/50 backdrop-blur-md overflow-hidden">
            <div className="container mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
                <Link href="/" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-0 shrink-0 min-h-[44px] -ml-1 sm:ml-0">
                    <div className="overflow-hidden w-20 sm:w-28 h-[72px] sm:h-[400px] flex-shrink-0 -mr-2 sm:-mr-3">
                        <Image src="/logo.svg" alt="Vise pe hârtie" width={400} height={400} className="object-contain object-left h-[72px] sm:h-[400px] w-auto -translate-y-2 sm:-translate-y-3" priority />
                    </div>
                    <span className="self-center ml-0">Vise pe hârtie</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2 md:gap-6 flex-1 justify-end min-w-0">
                    <HeaderNavClient session={session ? { email: session.email, role: session.role } : null} />
                </div>
            </div>
        </header>
    )
}

export function SiteFooter() {
    return (
        <footer className="bg-[var(--pastel-sage)]/50 border-t pt-16 pb-12 text-slate-600 text-sm">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">
                <div className="space-y-4">
                    <Link href="/" className="group block">
                        <h3 className="font-bold text-[var(--brand)] text-lg mb-2 flex items-center gap-0">
                            <div className="overflow-hidden w-24 h-20 flex-shrink-0 -mr-2 relative">
                                <Image
                                    src="/logo.svg"
                                    alt="Vise pe hârtie"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <span className="self-center mt-2">Vise pe hârtie</span>
                        </h3>
                    </Link>
                    <p className="leading-relaxed text-slate-500">
                        Platforma tehnologică 100% transparentă care conectează direct donatorii cu nevoile verificate ale copiilor din medii vulnerabile. Fără comisioane. Fără intermediari.
                    </p>
                    <div className="text-xs text-slate-400 space-y-1 mt-4">
                        <p><strong>Asociația Vise pe hârtie</strong></p>
                        <p>CUI: {process.env.NEXT_PUBLIC_ASSOCIATION_CUI || "—"}</p>
                        <p>București, România</p>
                        <p>contact@scrisoareamea.ro</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Navigare</h4>
                    <ul className="space-y-3">
                        <li><Link href="/cum-functioneaza" className="hover:text-teal-600 transition-colors inline-block py-2">Cum funcționează</Link></li>
                        <li><Link href="/scrisori" className="hover:text-teal-600 transition-colors inline-block py-2">Toate Scrisorile</Link></li>
                        <li><Link href="/directioneaza-35" className="text-[var(--brand)] font-semibold hover:underline inline-block py-2">Redirecționează 3.5%</Link></li>
                        <li><Link href="/directioneaza-20" className="text-[var(--brand)] font-semibold hover:underline inline-block py-2">Sponsorizează 20%</Link></li>
                        <li><Link href="/impact" className="hover:text-teal-600 transition-colors inline-block py-2">Dovezi de Impact</Link></li>
                        <li><Link href="/transparenta" className="hover:text-teal-600 transition-colors inline-block py-2">Rapoarte Financiare</Link></li>
                        <li><Link href="/contact" className="hover:text-teal-600 transition-colors inline-block py-2">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Resurse & Siguranță</h4>
                    <ul className="space-y-3">
                        <li><Link href="/fapte" className="hover:text-teal-600 transition-colors inline-block py-2">Fapte și Cifre</Link></li>
                        <li><Link href="/siguranta" className="hover:text-teal-600 transition-colors inline-block py-2">Siguranță și GDPR</Link></li>
                        <li><Link href="/procese" className="hover:text-teal-600 transition-colors inline-block py-2">Procese Operaționale</Link></li>
                        <li><Link href="/intrebari" className="hover:text-teal-600 transition-colors inline-block py-2">Întrebări Frecvente</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                    <ul className="space-y-3">
                        <li><Link href="/termeni" className="hover:text-teal-600 transition-colors inline-block py-2">Termeni și Condiții</Link></li>
                        <li><Link href="/confidentialitate" className="hover:text-teal-600 transition-colors inline-block py-2">Politica de Confidențialitate</Link></li>
                        <li><Link href="/cookies" className="hover:text-teal-600 transition-colors inline-block py-2">Politica Cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 border-t pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-6">
                <div className="flex flex-col gap-2">
                    <p>&copy; {new Date().getFullYear()} Asociația Vise pe hârtie. Cod Open Source.</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="opacity-70">Plăți securizate prin</span>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/Skrill_logo.svg" alt="Skrill" className="h-5 w-auto opacity-70 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                    <Button asChild variant="outline" size="sm" className="h-10 px-4">
                        <Link href="/admin">Acces Admin</Link>
                    </Button>
                    <Button asChild size="sm" className="h-10 px-4 bg-slate-800 hover:bg-slate-900">
                        <Link href="/partner">Acces Parteneri</Link>
                    </Button>
                </div>
            </div>
        </footer>
    )
}
