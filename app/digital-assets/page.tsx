"use client"

import React from "react"
import { DigitalAssetCard } from "@/components/digital-asset-card"
import { digitalAssets } from "@/lib/digital-assets-data"
import { AppLayout } from "@/components/app-layout"
import { Database, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DigitalAssetsPage() {
  // Split assets into two categories
  const imageAssets = digitalAssets.filter(asset =>
    asset.name.includes("形象") || asset.name.includes("数字人")
  )
  const voiceAssets = digitalAssets.filter(asset =>
    asset.name.includes("声音") || asset.name.includes("语音")
  )
  const otherAssets = digitalAssets.filter(asset =>
    !imageAssets.includes(asset) && !voiceAssets.includes(asset)
  )

  return (
    <AppLayout title="数字资产" description="从口播创作到网感码编加工，全流程创作闭环">
      <div className="space-y-8">
        {/* Feature Banner */}
        <div className="bg-gradient-to-br from-[#FF6600]/5 via-[#FF8533]/3 to-white rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-2 text-[#FF6600] mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI+多场景快速出片</span>
          </div>
          <p className="text-muted-foreground">
            打造专属数字分身，让AI为你创作
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Clone Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">克隆形象</h2>
              <Link href="/digital-assets/manage">
                <Button variant="outline" size="sm" className="hover:border-[#FF6600] hover:text-[#FF6600]">
                  资产管理
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  上传1-4分钟的视频，AI将自动提取你的面部特征、表情和姿态，生成高度逼真的数字分身。
                </p>
                <div className="space-y-2">
                  {imageAssets.length > 0 ? (
                    imageAssets.map((asset) => (
                      <DigitalAssetCard key={asset.id} asset={asset} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">暂无克隆形象资产</p>
                    </div>
                  )}
                </div>
                <Link href="/digital-human/clone-image" className="block">
                  <Button className="w-full bg-gradient-to-r from-[#FF6600] to-[#FF8533] hover:shadow-md text-white">
                    立即使用
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Clone Voice */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">克隆声音</h2>
              <Link href="/digital-assets/manage">
                <Button variant="outline" size="sm" className="hover:border-[#FF6600] hover:text-[#FF6600]">
                  资产管理
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  上传音频样本，AI将智能分析你的音色、语调和语速特征，生成专属的AI语音模型。
                </p>
                <div className="space-y-2">
                  {voiceAssets.length > 0 ? (
                    voiceAssets.map((asset) => (
                      <DigitalAssetCard key={asset.id} asset={asset} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">暂无克隆声音资产</p>
                    </div>
                  )}
                </div>
                <Link href="/digital-human/clone-voice" className="block">
                  <Button className="w-full bg-gradient-to-r from-[#FF6600] to-[#FF8533] hover:shadow-md text-white">
                    立即使用
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other Assets */}
        {otherAssets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">其他数字资产</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherAssets.map((asset) => (
                <DigitalAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

