"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type DigitalAsset } from "@/lib/digital-assets-data"
import {
  UserCircle,
  Radio,
  ArrowRight,
  CheckCircle2,
  FolderOpen,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCircle,
  Radio,
}

interface DigitalAssetCardProps {
  asset: DigitalAsset
}

export function DigitalAssetCard({ asset }: DigitalAssetCardProps) {
  const IconComponent = iconMap[asset.icon] || UserCircle

  return (
    <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
      <CardContent className="p-6 flex-1">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
            <IconComponent className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {asset.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {asset.description}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {asset.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 flex flex-col gap-2">
        <Link href={asset.href} className="w-full">
          <Button
            className="w-full group/btn bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!asset.isAvailable}
          >
            立即使用
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/digital-human/list" className="w-full">
          <Button
            variant="outline"
            className="w-full group/btn"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            资产管理
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
