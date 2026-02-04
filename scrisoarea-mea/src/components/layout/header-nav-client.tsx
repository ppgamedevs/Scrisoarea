"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/scrisori", label: "Scrisori" },
  { href: "/cum-functioneaza", label: "Cum funcționează" },
  { href: "/impact", label: "Impact" },
  { href: "/transparenta", label: "Transparență" },
  { href: "/despre", label: "Despre" },
]

type Session = { email: string } | null

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
      {/* Desktop nav + CTA (unchanged behaviour) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-slate-900 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {session ? (
          <Link
            href="/profil"
            className="hidden md:flex text-sm font-medium items-center gap-2 text-slate-700 hover:text-blue-600 bg-slate-50 px-3 py-1.5 rounded-full border min-h-[44px]"
          >
            <User className="w-4 h-4" />
            <span className="max-w-[100px] truncate">
              {session.email.split("@")[0]}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 hidden sm:block"
          >
            Intră în cont
          </Link>
        )}

        <Button
          asChild
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-none rounded-full px-6 min-h-[44px]"
        >
          <Link href="/scrisori">Donează Acum</Link>
        </Button>

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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl flex flex-col p-6 pt-8 animate-in slide-in-from-right duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-slate-900">Meniu</span>
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
                <Link
                  href="/profil"
                  className="md:hidden flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-100 py-3 px-3 rounded-lg min-h-[44px]"
                  onClick={() => setOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span className="truncate">{session.email.split("@")[0]}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="py-3 px-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100 min-h-[44px] flex items-center md:hidden"
                  onClick={() => setOpen(false)}
                >
                  Intră în cont
                </Link>
              )}
              <Button
                asChild
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full min-h-[44px] mt-2"
              >
                <Link href="/scrisori" onClick={() => setOpen(false)}>
                  Donează Acum
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
