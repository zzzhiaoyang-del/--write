export interface DigitalAsset {
  id: string
  name: string
  description: string
  icon: string
  href: string
  category: string
  isAvailable: boolean
  features: string[]
}

export const digitalAssets: DigitalAsset[] = [
  {
    id: "clone-avatar",
    name: "克隆形象",
    description: "上传视频一键打造专属数字分身，生成AI数字人形象",
    icon: "UserCircle",
    href: "/digital-assets/clone-avatar",
    category: "digital-human",
    isAvailable: true,
    features: [
      "上传10s-5min视频",
      "自动生成数字人形象",
      "保持人物表情和姿态",
      "支持多种应用场景"
    ]
  },
  {
    id: "clone-voice",
    name: "克隆声音",
    description: "上传音频快速克隆专属声音，打造个性化AI语音助手",
    icon: "Radio",
    href: "/digital-assets/clone-voice",
    category: "voice",
    isAvailable: true,
    features: [
      "上传音频样本",
      "AI智能声音克隆",
      "高度还原音色特征",
      "支持多语言合成"
    ]
  }
]

export function getDigitalAssetById(id: string) {
  return digitalAssets.find(asset => asset.id === id)
}
