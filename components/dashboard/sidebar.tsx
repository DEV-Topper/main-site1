"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ShoppingBag,
  ShoppingBasket,
  Wallet,
  ArrowLeftRight,
  UsersRound,
  Headset,
  Handshake,
} from "lucide-react"
import SignOutButton from "./signout-button"

const menuItems = [
  { icon: ShoppingBasket, label: "Purchases", href: "/purchases" },
  { icon: Wallet, label: "Add Funds", href: "/add-funds" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
  { icon: UsersRound, label: "Referrals", href: "/referrals" },
  { icon: Headset, label: "Support", href: "https://t.me/desocialplugsupport" },
  { icon: Handshake, label: "Join Our Community", href: "https://t.me/desocialplug" },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="h-full bg-[#1a49ee] flex flex-col">
      {/* Profile section */}
      <div className="p-6 flex items-center justify-between border-b border-blue-600">
        <div className="flex items-center gap-3">
          <Image
            src="/image/DeSocial Plug A23.png"
            width={120}
            height={70}
            alt="Logo"
            className="w-auto h-11 object-contain"
          />
        </div>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard link */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-blue-500 text-white"
              : "text-blue-100 hover:bg-blue-700 hover:text-white"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Other menu items */}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-blue-100 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-blue-600">
        <SignOutButton onClose={onClose} />
      </div>
    </div>
  )
}
