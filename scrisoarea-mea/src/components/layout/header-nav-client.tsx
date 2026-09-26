"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Menu, X, LogOut, LayoutDashboard } from "lucide-react"
import { logout, logoutAdmin, logoutPartner } from "@/app/actions/auth-actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_LINKS = [
  { href: "/scrisori", label: "Scrisori" },
  { href: "/cum-functioneaza", label: "Cum funcționează" },
  { href: "/impact", label: "Impact" },
  { href: "/transparenta", label: "Transparență" },
  { href: "/despre", label: "Despre" },
]

type Session = {
  email: string
  role: "ADMIN" | "PARTNER" | "DONOR" | "SPONSOR"
} | null

export function HeaderNavClient({ session }: { session: Session }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const el = drawerRef.current
    if (!el) return
    const focusables = el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    first?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [open])

  async function handleLogout() {
    if (session?.role === "ADMIN") await logoutAdmin()
    else if (session?.role === "PARTNER") await logoutPartner()
    else await logout()
  }

  return (
    <>
      <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-slate-600">
        {NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="hover:text-teal-600 transition-colors py-2">
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden md:inline-flex items-center gap-2 text-slate-700 hover:text-teal-600 bg-slate-100/80 hover:bg-teal-50 px-4 py-2 rounded-full border border-slate-200/80 min-h-[44px] transition-colors"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="max-w-[120px] truncate">{session.email.split("@")[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Contul meu</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {session.role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}

              {session.role === "PARTNER" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/partner" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Portal Instituție
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/partner" className="cursor-pointer">
                      Scrisorile mele
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {(session.role === "DONOR" || session.role === "SPONSOR") && (
                <DropdownMenuItem asChild>
                  <Link href="/profil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profilul meu
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Ieșire din cont
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" className="text-slate-600 hover:text-teal-700 min-h-[44px]">
              <Link href="/partner/login">Portal Instituții</Link>
            </Button>
            <Button
              asChild
              className="bg-[var(--brand)] hover:bg-teal-600 text-[var(--brand-foreground)] shadow-md shadow-teal-900/15 rounded-full px-5 sm:px-6 min-h-[44px] font-semibold text-sm"
            >
              <Link href="/login">Intră în cont</Link>
            </Button>
          </div>
        )}

        <button
          type="button"
          aria-label="Deschide meniul"
          aria-expanded={open}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog" aria-label="Meniu navigare">
          <button
            type="button"
            aria-label="Închide meniul"
            className="absolute inset-0 bg-slate-800/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--pastel-cream)]/98 flex flex-col p-6 pt-8 border-l border-slate-200/80"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-slate-800 text-lg">Meniu</span>
              <button
                type="button"
                aria-label="Închide"
                className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="py-3 px-3 rounded-lg text-slate-700 hover:bg-slate-100 font-medium min-h-[44px] flex items-center"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-2">
              {session ? (
                <>
                  {session.role === "ADMIN" && (
                    <Link href="/admin" className="py-3 px-3 rounded-lg hover:bg-slate-100" onClick={() => setOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  {session.role === "PARTNER" && (
                    <Link href="/partner" className="py-3 px-3 rounded-lg hover:bg-slate-100" onClick={() => setOpen(false)}>
                      Portal Instituție
                    </Link>
                  )}
                  {(session.role === "DONOR" || session.role === "SPONSOR") && (
                    <Link href="/profil" className="py-3 px-3 rounded-lg hover:bg-slate-100" onClick={() => setOpen(false)}>
                      Profilul meu
                    </Link>
                  )}
                  <button
                    className="flex items-center gap-2 py-3 px-3 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium w-full text-left"
                    onClick={async () => {
                      await handleLogout()
                      setOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4" /> Ieșire din cont
                  </button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full min-h-[44px]">
                    <Link href="/partner/login" onClick={() => setOpen(false)}>
                      Portal Instituții
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-[var(--brand)] hover:bg-teal-600 text-[var(--brand-foreground)] rounded-full min-h-[44px] font-semibold"
                  >
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Intră în cont
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
