"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Menu, X, LogOut, LayoutDashboard, Sparkles } from "lucide-react"
import { logout } from "@/app/actions/auth-actions"
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
  role: 'ADMIN' | 'PARTNER' | 'DONOR' | 'SPONSOR'
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

  // Focus trap when drawer is open
  useEffect(() => {
    if (!open) return
    const el = drawerRef.current
    if (!el) return
    const focusables = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    )
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
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-slate-600">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-teal-600 transition-colors py-2"
          >
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
                <span className="max-w-[120px] truncate">
                  {session.email.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Contul meu ({session.role})</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {session.role === 'ADMIN' && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              )}

              {session.role === 'PARTNER' && (
                <DropdownMenuItem asChild>
                  <Link href="/partner" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Panou Partener</span>
                  </Link>
                </DropdownMenuItem>
              )}



              {session.role === 'DONOR' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil Donator</span>
                    </Link>
                  </DropdownMenuItem>

                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={async () => await logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Ieșire din cont</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            className="bg-[var(--brand)] hover:bg-teal-600 text-[var(--brand-foreground)] shadow-md shadow-teal-900/15 rounded-full px-5 sm:px-6 min-h-[44px] font-semibold text-sm"
          >
            <Link href="/login">Intră în cont</Link>
          </Button>
        )}

        {/* Mobile: hamburger */}
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

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Meniu navigare"
        >
          <button
            type="button"
            aria-label="Închide meniul"
            className="absolute inset-0 bg-slate-800/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--pastel-cream)]/98 shadow-2xl flex flex-col p-6 pt-8 animate-in slide-in-from-right duration-200 border-l border-slate-200/80"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-slate-800 text-lg">Meniu</span>
              <button
                type="button"
                aria-label="Închide"
                className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
                  className="py-3 px-3 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium min-h-[44px] flex items-center"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-2">
              {session ? (
                <div className="md:hidden flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 px-3 py-2">
                    <User className="w-4 h-4" />
                    <span>{session.email} ({session.role})</span>
                  </div>

                  {session.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 py-3 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}

                  {session.role === 'PARTNER' && (
                    <Link
                      href="/partner"
                      className="flex items-center gap-2 py-3 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Panou Partener
                    </Link>
                  )}



                  {session.role === 'DONOR' && (
                    <>
                      <Link
                        href="/profil"
                        className="flex items-center gap-2 py-3 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
                        onClick={() => setOpen(false)}
                      >
                        <User className="w-4 h-4" /> Profil Donator
                      </Link>

                    </>
                  )}

                  <button
                    className="flex items-center gap-2 py-3 px-3 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium w-full text-left"
                    onClick={async () => {
                      await logout()
                      setOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4" /> Ieșire din cont
                  </button>
                </div>
              ) : (
                <Button
                  asChild
                  className="w-full bg-[var(--brand)] hover:bg-teal-600 text-[var(--brand-foreground)] rounded-full min-h-[44px] font-semibold shadow-md"
                >
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Intră în cont
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
