import { MousePointerClick, MessageSquareText, FileCheck } from "lucide-react"

const steps = [
  {
    icon: MousePointerClick,
    title: "选择 AI 员工",
    description: "根据你的需求，从智能广场选择合适的 AI 专业员工",
  },
  {
    icon: MessageSquareText,
    title: "输入你的需求",
    description: "用自然语言描述你想要完成的任务和具体要求",
  },
  {
    icon: FileCheck,
    title: "生成可用结果",
    description: "AI 员工立即开始工作，生成可直接使用的专业内容",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">三步开始使用</h2>
          <p className="mt-4 text-muted-foreground">
            简单三步，让 AI 员工立刻为你工作
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-border" />
              )}
              
              <div className="relative bg-card rounded-2xl p-8 text-center border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
