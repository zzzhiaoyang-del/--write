"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { Check, X, Sparkles, Zap, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "免费版",
    description: "适合个人体验和轻度使用",
    price: "0",
    priceUnit: "/月",
    icon: Sparkles,
    popular: false,
    features: [
      { text: "可使用 3 个基础 AI 员工", included: true },
      { text: "每日 10 次使用额度", included: true },
      { text: "标准响应速度", included: true },
      { text: "基础历史记录", included: true },
      { text: "高级 AI 员工", included: false },
      { text: "优先响应", included: false },
      { text: "API 接口", included: false },
      { text: "专属客服", included: false },
    ],
    buttonText: "当前方案",
    buttonVariant: "outline" as const,
  },
  {
    id: "pro",
    name: "Pro 版",
    description: "适合内容创作者和运营人员",
    price: "99",
    priceUnit: "/月",
    icon: Zap,
    popular: true,
    features: [
      { text: "可使用全部 AI 员工", included: true },
      { text: "每日 200 次使用额度", included: true },
      { text: "优先响应速度", included: true },
      { text: "完整历史记录", included: true },
      { text: "高级 AI 员工", included: true },
      { text: "优先响应", included: true },
      { text: "API 接口", included: false },
      { text: "专属客服", included: false },
    ],
    buttonText: "升级 Pro",
    buttonVariant: "default" as const,
  },
  {
    id: "enterprise",
    name: "企业版",
    description: "适合团队和企业级使用",
    price: "联系我们",
    priceUnit: "",
    icon: Building2,
    popular: false,
    features: [
      { text: "可使用全部 AI 员工", included: true },
      { text: "无限使用额度", included: true },
      { text: "最高响应速度", included: true },
      { text: "完整历史记录", included: true },
      { text: "高级 AI 员工", included: true },
      { text: "优先响应", included: true },
      { text: "API 接口", included: true },
      { text: "专属客服支持", included: true },
    ],
    buttonText: "联系销售",
    buttonVariant: "outline" as const,
  },
]

const faqs = [
  {
    question: "免费版有什么限制？",
    answer: "免费版可以使用 3 个基础 AI 员工，每日有 10 次使用额度。适合个人体验和轻度使用场景。",
  },
  {
    question: "Pro 版的使用额度够用吗？",
    answer: "Pro 版每日 200 次使用额度，对于大多数内容创作者和运营人员来说完全够用。如果需要更多额度，可以考虑企业版。",
  },
  {
    question: "可以随时升级或降级吗？",
    answer: "可以。您可以随时升级到更高级的方案。降级会在当前计费周期结束后生效，不影响已付费期间的使用。",
  },
  {
    question: "企业版有什么特殊服务？",
    answer: "企业版提供无限使用额度、API 接口支持、专属客服、定制化需求等服务。具体内容可以联系我们的销售团队了解。",
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            选择适合你的方案
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            无论是个人体验还是团队协作，我们都有适合你的方案
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-muted rounded-lg">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBillingCycle("monthly")}
            >
              月付
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBillingCycle("yearly")}
            >
              年付
              <Badge className="ml-2 bg-primary/10 text-primary border-0">省 20%</Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-primary shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    最受欢迎
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price === "联系我们" ? "" : "¥"}
                    {plan.price === "联系我们"
                      ? plan.price
                      : billingCycle === "yearly"
                        ? Math.floor(Number(plan.price) * 0.8)
                        : plan.price}
                  </span>
                  {plan.priceUnit && (
                    <span className="text-muted-foreground">{plan.priceUnit}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-transparent"
                  )}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            功能对比
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-foreground">
                    功能
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-foreground">
                    免费版
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-primary">
                    Pro 版
                  </th>
                  <th className="text-center py-4 px-4 font-medium text-foreground">
                    企业版
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">
                    可用 AI 员工数量
                  </td>
                  <td className="py-4 px-4 text-center">3 个</td>
                  <td className="py-4 px-4 text-center text-primary font-medium">
                    全部
                  </td>
                  <td className="py-4 px-4 text-center">全部</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">每日使用次数</td>
                  <td className="py-4 px-4 text-center">10 次</td>
                  <td className="py-4 px-4 text-center text-primary font-medium">
                    200 次
                  </td>
                  <td className="py-4 px-4 text-center">无限</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">响应速度</td>
                  <td className="py-4 px-4 text-center">标准</td>
                  <td className="py-4 px-4 text-center text-primary font-medium">
                    优先
                  </td>
                  <td className="py-4 px-4 text-center">最高</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">历史记录</td>
                  <td className="py-4 px-4 text-center">7 天</td>
                  <td className="py-4 px-4 text-center text-primary font-medium">
                    永久
                  </td>
                  <td className="py-4 px-4 text-center">永久</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">API 接口</td>
                  <td className="py-4 px-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">专属客服</td>
                  <td className="py-4 px-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            常见问题
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
