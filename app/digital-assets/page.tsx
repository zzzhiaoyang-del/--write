"use client"

import React from "react"
import { DigitalAssetCard } from "@/components/digital-asset-card"
import { digitalAssets } from "@/lib/digital-assets-data"
import { Footer } from "@/components/footer"
import { Database, Sparkles } from "lucide-react"

export default function DigitalAssetsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">数字资产</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            从口播创作到网感码编加工，全流程创作闭环。打造专属数字分身，让AI为你创作。
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">AI+多场景快速出片</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">自由创作</h2>
          <p className="text-muted-foreground">
            选择你需要的数字资产类型，开始创作你的专属内容
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {digitalAssets.map((asset) => (
            <DigitalAssetCard key={asset.id} asset={asset} />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 p-8 rounded-2xl bg-muted/30 border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4">
            数字资产功能说明
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">克隆形象</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                上传1-4分钟的视频，AI将自动提取你的面部特征、表情和姿态，生成高度逼真的数字分身。支持多种应用场景，让你的数字人成为内容创作的得力助手。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">克隆声音</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                上传音频样本，AI将智能分析你的音色、语调和语速特征，生成专属的AI语音模型。支持多语言合成，让你的声音突破时间和空间的限制。
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
