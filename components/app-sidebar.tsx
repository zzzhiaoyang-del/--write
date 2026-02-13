"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Lightbulb,
  Grid3x3,
  Image,
  Users,
  DollarSign,
  HelpCircle,
  FileText,
  LayoutGrid,
  User,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/inspiration", label: "灵感库", icon: Lightbulb },
  { href: "/marketplace", label: "智能广场", icon: Grid3x3 },
  { href: "/digital-assets", label: "数字资产", icon: Image },
  { href: "/my-agents", label: "我的AI员工", icon: Users },
  { href: "/pricing", label: "定价", icon: DollarSign },
  { href: "/help", label: "帮助中心", icon: HelpCircle },
]

const bottomMenuItems = [
  { href: "/works", label: "作品管理", icon: FileText, disabled: true },
  { href: "/matrix", label: "矩阵管理", icon: LayoutGrid, disabled: true },
  { href: "/profile", label: "用户中心", icon: User },
  { href: "/account", label: "账号管理", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8">
        <Link href="/" className="flex items-center">
          <span className="text-[32px] font-black text-[#FF6600] tracking-tight leading-none">
            陛然
            <span className="relative">
              AI
              <sup className="absolute -top-1 -right-3 text-[14px] font-bold text-[#FF6600]">®</sup>
            </span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-[#FF6600]/5 text-foreground border-l-4 border-[#FF6600] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-[#FF6600]" : "text-muted-foreground")} />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Bottom Menu */}
        <div className="space-y-1">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  item.disabled && "opacity-40 cursor-not-allowed",
                  !item.disabled && isActive
                    ? "bg-[#FF6600]/5 text-foreground border-l-4 border-[#FF6600] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-[#FF6600]" : "text-muted-foreground")} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">© 陛然 AI 2026</p>
        <Link href="https://biran.ai" className="text-xs text-muted-foreground hover:text-[#FF6600] transition-colors">
          陛然官网
        </Link>
      </div>
    </aside>
  )
}
