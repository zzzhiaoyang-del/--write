import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = {
  product: {
    title: "产品",
    links: [
      { label: "智能广场", href: "/marketplace" },
      { label: "AI员工", href: "/my-agents" },
      { label: "定价方案", href: "/pricing" },
    ],
  },
  support: {
    title: "支持",
    links: [
      { label: "帮助中心", href: "#" },
      { label: "使用教程", href: "#" },
      { label: "联系我们", href: "#" },
    ],
  },
  company: {
    title: "关于",
    links: [
      { label: "关于我们", href: "#" },
      { label: "服务条款", href: "#" },
      { label: "隐私政策", href: "#" },
    ],
  },
}

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">秒懂AI</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              让每个人都拥有一支可以随时调用的 AI 数字员工团队。
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 秒懂AI超级员工. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              服务条款
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
