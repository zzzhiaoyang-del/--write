"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Heart, Star, MessageCircle } from "lucide-react"

const hotVideos = [
  { id: 1, title: "与魔音放一起开始（上）", platform: "抖音", likes: "1.2w", stars: "1.0w", comments: "1.5w" },
  { id: 2, title: "爆款带货技巧分享", platform: "抖音", likes: "8.9w", stars: "6.5w", comments: "3.2w" },
  { id: 3, title: "直播间话术模板", platform: "快手", likes: "5.6w", stars: "4.3w", comments: "2.1w" },
  { id: 4, title: "短视频剪辑教程", platform: "抖音", likes: "12.3w", stars: "8.9w", comments: "5.6w" },
  { id: 5, title: "流量密码解析", platform: "抖音", likes: "15.7w", stars: "11.2w", comments: "7.8w" },
  { id: 6, title: "变现实战案例", platform: "快手", likes: "9.4w", stars: "7.1w", comments: "4.5w" },
]

const popularContent = [
  { id: 1, title: "爆款视频标题示例 1", platform: "抖音", likes: "12.3w", stars: "8.9w" },
  { id: 2, title: "爆款视频标题示例 2", platform: "快手", likes: "10.5w", stars: "7.2w" },
  { id: 3, title: "爆款视频标题示例 3", platform: "抖音", likes: "15.8w", stars: "11.3w" },
]

export default function InspirationPage() {
  return (
    <AppLayout title="灵感库" description="全网热点秒级捕捉">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="col-span-2 space-y-6">
          {/* 爆款库 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-foreground text-lg font-bold">爆款库</h3>
              <span className="text-muted-foreground text-sm">解析爆款内容在直播间、视频流量一键抓取</span>
            </div>
            <div className="space-y-3">
              {popularContent.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-border rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-medium">{item.title}</div>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                      <span>{item.platform}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span className="text-[#FF6600] font-semibold">{item.likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span className="text-[#FF6600] font-semibold">{item.stars}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 下发库 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-foreground text-lg font-bold">下发库</h3>
              <span className="text-muted-foreground text-sm">批量发送数据至直播间，流量持续自动变现</span>
            </div>
            <div className="text-muted-foreground mb-3">今日待下发：3 条脚本</div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF6600] to-[#FF8533] w-3/5"></div>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 p-1 bg-white border border-border rounded-full shadow-sm">
              <button className="px-4 py-2 rounded-full text-sm bg-[#FF6600] text-white font-medium">
                按视频
              </button>
              <button className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground">
                按用户
              </button>
            </div>
            <select className="bg-white border border-border text-muted-foreground rounded-full px-4 py-2 text-sm shadow-sm">
              <option>全部</option>
              <option>今日</option>
              <option>昨日</option>
              <option>7日</option>
            </select>
          </div>

          {/* Sort Tags */}
          <div className="flex gap-2 flex-wrap">
            {['评论数', '收藏数', '转发数'].map((sort) => (
              <span
                key={sort}
                className="px-3 py-1.5 bg-white border border-border text-muted-foreground rounded-full text-xs cursor-pointer hover:border-[#FF6600] hover:text-[#FF6600] transition-colors"
              >
                {sort}
              </span>
            ))}
          </div>

          {/* Video List */}
          <div className="space-y-2">
            {hotVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer bg-white border border-border/30"
              >
                <div className="w-10 h-10 bg-border rounded flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground text-sm truncate font-medium">{video.title}</div>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="text-muted-foreground">{video.platform}</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[#FF6600] font-semibold">{video.likes}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[#FF6600] font-semibold">{video.stars}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[#FF6600] font-semibold">{video.comments}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

