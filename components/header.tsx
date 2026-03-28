"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

const NAV = [
  { label: "Home", href: "home" },
  { label: "About", href: "about" },
  { label: "Features", href: "features" },
  { label: "How it works", href: "how-it-works" },
  { label: "FAQ", href: "faq" },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
      return true
    }
    return false
  }

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault()

    // If href is "home" or empty, scroll to top
    if (href === "home" || href === "") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      setOpen(false)
      return
    }

    // If we are NOT on the home page, navigate to it with the section hash
    if (pathname !== "/") {
      router.push(`/#${href}`)
      setOpen(false)
      return
    }

    // Already on home page — perform smooth scroll to section
    const scrolled = scrollToSection(href)
    
    // If section not found, try to find it after a short delay (for dynamic content)
    if (!scrolled) {
      setTimeout(() => {
        scrollToSection(href)
      }, 100)
    }

    setOpen(false)
  }

  // Handle initial load with hash in URL
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const hash = window.location.hash.substring(1)
      setTimeout(() => {
        scrollToSection(hash)
      }, 100)
    }
  }, [pathname])

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex h-16 items-center justify-between">
            {/* Logo with scroll to top */}
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="cursor-pointer"
            >
              <Image
                src="/image/DeSocial Plug AW2.png"
                alt="Logo"
                width={160}
                height={70}
                className="w-auto h-12 object-contain"
              />
            </a>

            {/* Nav Links */}
            <nav aria-label="Primary" className="flex gap-10">
              {NAV.map(({ label, href }) => (
                <a
                  key={label}
                  href={`#${href}`}
                  onClick={(e) => handleScroll(e, href)}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 py-1.5 rounded-full"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-4 py-1.5">
                  Signup
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 lg:hidden">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
                setOpen(false)
              }}
              className="cursor-pointer"
            >
              <Image
                src="/image/DeSocial Plug AW2.png"
                alt="Logo"
                width={120}
                height={36}
                className="w-auto h-8 object-contain"
              />
            </a>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                className="rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-300",
          open ? "opacity-60 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        style={{ background: "rgba(10, 40, 255, 0.6)" }}
      />

      {/* Mobile Drawer — slides from LEFT */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 max-w-full transform transition-transform duration-300 shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col bg-[#1a49ee] text-white">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
                setOpen(false)
              }}
              className="cursor-pointer"
            >
              <Image
                src="/image/DeSocial Plug A23.png"
                width={120}
                height={36}
                alt="Logo"
                className="w-auto h-8 object-contain"
              />
            </a>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="p-2 rounded-md hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-4">
              {NAV.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={`#${href}`}
                    onClick={(e) => handleScroll(e, href)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-white/95 hover:bg-white/10 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Drawer Footer */}
          <div className="px-4 pb-8">
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <button className="w-full rounded-full border border-white/40 bg-white/6 px-4 py-2 text-white hover:bg-white/10">
                  Login
                </button>
              </Link>

              <Link href="/register" className="flex-1">
                <button className="w-full rounded-full bg-white px-4 py-2 font-semibold text-blue-600 hover:opacity-95">
                  Signup
                </button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}