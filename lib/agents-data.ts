export interface FormField {
  id: string
  label: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox"
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  description?: string
}

export interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

export interface AIAgent {
  id: string
  name: string
  description: string
  shortDescription: string
  category: string
  tags: string[]
  usageCount: number
  icon: string
  capabilities: string[]
  limitations: string[]
  targetUsers: string[]
  examplePrompts: string[]
  // 是否使用多步骤表单模式（实用工具类使用简单模式）
  useFormMode?: boolean
  formSteps?: FormStep[]
}

export const categories = [
  { id: "all", name: "全部", icon: "Grid" },
  { id: "boss", name: "老板必用", icon: "Crown" },
  { id: "private", name: "私域变现", icon: "Users" },
  { id: "public", name: "公域获客", icon: "Globe" },
  { id: "tools", name: "实用工具", icon: "Wrench" },
]

export const agents: AIAgent[] = [
  // 老板必用
  {
    id: "ip-positioning-expert",
    name: "IP账号定位专家",
    description: "从个人优势、市场需求、竞争分析三个维度，帮助你找到最适合的IP账号定位和差异化方向，打造个人品牌。",
    shortDescription: "精准分析，打造专属IP定位",
    category: "boss",
    tags: ["IP", "定位", "人设"],
    usageCount: 0,
    icon: "Target",
    capabilities: [
      "分析个人优势与资源",
      "评估市场需求与竞争",
      "制定差异化IP定位策略",
      "设计账号人设与调性"
    ],
    limitations: [
      "需要真实的个人信息输入",
      "定位需要长期验证和调整"
    ],
    targetUsers: ["企业老板", "创业者", "个人IP打造者"],
    examplePrompts: [
      "我是餐饮老板，想打造个人IP，帮我分析适合的定位",
      "我有10年行业经验，怎么在抖音做差异化IP？",
      "分析一下知识付费赛道，给我一个IP定位建议"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "basic-info",
        title: "基础信息",
        description: "告诉我们关于你的基本情况",
        fields: [
          { id: "industry", label: "你所在的行业", type: "text", placeholder: "如：餐饮、教育、电商...", required: true },
          { id: "experience", label: "从业年限", type: "select", options: [
            { value: "1-3", label: "1-3年" },
            { value: "3-5", label: "3-5年" },
            { value: "5-10", label: "5-10年" },
            { value: "10+", label: "10年以上" }
          ], required: true },
          { id: "advantages", label: "你的个人优势", type: "textarea", placeholder: "描述你的专业技能、资源、人脉等优势...", required: true }
        ]
      },
      {
        id: "target-platform",
        title: "目标平台",
        description: "选择你想要发展的平台",
        fields: [
          { id: "platform", label: "主要平台", type: "radio", options: [
            { value: "douyin", label: "抖音" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "kuaishou", label: "快手" },
            { value: "video-account", label: "视频号" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-platform", label: "自定义平台名称", type: "text", placeholder: "请输入平台名称...", description: "如果选择了'其他'，请在此填写平台名称（如：B站、知乎、今日头条、百家号等）" },
          { id: "content-type", label: "内容形式偏好", type: "checkbox", options: [
            { value: "short-video", label: "短视频" },
            { value: "live", label: "直播" },
            { value: "graphic", label: "图文" }
          ] }
        ]
      },
      {
        id: "goal",
        title: "目标期望",
        description: "你希望通过IP实现什么目标",
        fields: [
          { id: "target-audience", label: "目标客群", type: "text", placeholder: "如：25-35岁职场女性、创业者、宝妈...", required: true },
          { id: "main-goal", label: "主要目标", type: "select", options: [
            { value: "brand", label: "打造个人品牌" },
            { value: "sales", label: "带货变现" },
            { value: "leads", label: "获取客户" },
            { value: "influence", label: "提升行业影响力" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-goal", label: "自定义目标", type: "text", placeholder: "请输入您的目标...", description: "如果选择了'其他'，请在此填写您的具体目标" },
          { id: "competitors", label: "对标账号（选填）", type: "textarea", placeholder: "列出1-3个你想对标的账号..." }
        ]
      }
    ]
  },
  {
    id: "short-video-topic-expert",
    name: "短视频选题专家",
    description: "基于平台热门趋势和用户画像，智能分析并生成短视频高潜力选题，帮助创作者快速找到流量密码。",
    shortDescription: "智能分析趋势，生成爆款短视频选题",
    category: "boss",
    tags: ["短视频", "选题", "流量"],
    usageCount: 0,
    icon: "Video",
    capabilities: [
      "分析抖音/快手热门话题趋势",
      "根据账号定位推荐选题方向",
      "生成多角度选题建议",
      "预测选题爆款潜力"
    ],
    limitations: [
      "无法保证100%爆款",
      "需要结合自身账号特点调整"
    ],
    targetUsers: ["短视频创作者", "MCN机构", "企业新媒体"],
    examplePrompts: [
      "我是美食博主，帮我生成5个适合夏季的短视频选题",
      "分析最近抖音上的热门话题，给我推荐3个可以蹭热度的选题",
      "我的账号主要做职场内容，有什么容易出爆款的选题角度？"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "account-info",
        title: "账号信息",
        fields: [
          { id: "niche", label: "账号领域", type: "text", placeholder: "如：美食、职场、母婴...", required: true },
          { id: "platform", label: "平台", type: "radio", options: [
            { value: "douyin", label: "抖音" },
            { value: "kuaishou", label: "快手" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "video-account", label: "视频号" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-platform", label: "自定义平台名称", type: "text", placeholder: "请输入平台名称...", description: "如果选择了'其他'，请在此填写平台名称（如：B站、知乎、今日头条、百家号等）" }
        ]
      },
      {
        id: "topic-preference",
        title: "选题偏好",
        fields: [
          { id: "topic-count", label: "生成选题数量", type: "select", options: [
            { value: "3", label: "3个选题" },
            { value: "5", label: "5个选题" },
            { value: "10", label: "10个选题" }
          ], required: true },
          { id: "topic-style", label: "选题风格", type: "checkbox", options: [
            { value: "hot", label: "蹭热点" },
            { value: "educational", label: "知识干货" },
            { value: "story", label: "故事型" },
            { value: "controversial", label: "争议话题" }
          ] },
          { id: "extra-requirements", label: "其他要求", type: "textarea", placeholder: "如：适合夏季、需要有反转..." }
        ]
      }
    ]
  },
  {
    id: "topic-expert",
    name: "AI爆款选题专家",
    description: "基于平台热门趋势和用户画像，智能分析并生成高潜力爆款选题。结合数据洞察，帮助内容创作者快速找到流量密码。",
    shortDescription: "智能分析热门趋势，生成高潜力爆款选题",
    category: "boss",
    tags: ["选题", "爆款", "流量"],
    usageCount: 0,
    icon: "Lightbulb",
    capabilities: [
      "分析平台热门话题趋势",
      "根据账号定位推荐选题方向",
      "生成多角度选题建议",
      "预测选题爆款潜力"
    ],
    limitations: [
      "无法保证100%爆款",
      "需要结合自身账号特点调整"
    ],
    targetUsers: ["自媒体博主", "内容运营", "MCN机构"],
    examplePrompts: [
      "我是美食博主，帮我生成5个适合夏季的爆款选题",
      "分析最近小红书上的热门话题，给我推荐3个可以蹭热度的选题",
      "我的账号主要做职场内容，有什么容易出爆款的选题角度？"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "account-info",
        title: "账号信息",
        fields: [
          { id: "niche", label: "内容领域", type: "text", placeholder: "如：美食、职场、母婴...", required: true },
          { id: "platform", label: "平台", type: "radio", options: [
            { value: "douyin", label: "抖音" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "kuaishou", label: "快手" },
            { value: "video-account", label: "视频号" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-platform", label: "自定义平台名称", type: "text", placeholder: "请输入平台名称...", description: "如果选择了'其他'，请在此填写平台名称（如：B站、知乎、今日头条、百家号等）" }
        ]
      },
      {
        id: "topic-requirements",
        title: "选题要求",
        fields: [
          { id: "topic-count", label: "生成数量", type: "select", options: [
            { value: "5", label: "5个选题" },
            { value: "10", label: "10个选题" },
            { value: "20", label: "20个选题" }
          ], required: true },
          { id: "hot-topic", label: "是否需要结合热点", type: "radio", options: [
            { value: "yes", label: "是，结合当前热点" },
            { value: "no", label: "否，独立选题" }
          ], required: true },
          { id: "style", label: "选题风格偏好", type: "checkbox", options: [
            { value: "practical", label: "实用干货" },
            { value: "emotional", label: "情感共鸣" },
            { value: "story", label: "故事叙事" },
            { value: "controversial", label: "观点争议" }
          ] }
        ]
      }
    ]
  },
  {
    id: "live-script-generator",
    name: "AI直播脚本生成器",
    description: "专业的直播脚本创作助手，从开场到成交，从话术到节奏，帮你快速产出高转化直播脚本。",
    shortDescription: "一键生成高转化直播脚本",
    category: "boss",
    tags: ["直播", "脚本", "带货"],
    usageCount: 0,
    icon: "Radio",
    capabilities: [
      "生成完整直播脚本",
      "设计开场吸引话术",
      "撰写产品讲解文案",
      "优化成交逼单话术"
    ],
    limitations: [
      "需要明确直播类型和产品",
      "话术需根据个人风格调整"
    ],
    targetUsers: ["直播带货主播", "电商老板", "MCN机构"],
    examplePrompts: [
      "帮我写一个2小时的美妆直播脚本",
      "设计一个能快速留人的直播开场话术",
      "写一个高转化的产品逼单话术"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "live-type",
        title: "直播类型",
        fields: [
          { id: "live-category", label: "直播类型", type: "radio", options: [
            { value: "product", label: "带货直播" },
            { value: "knowledge", label: "知识分享" },
            { value: "entertainment", label: "娱乐互动" },
            { value: "service", label: "服务咨询" }
          ], required: true },
          { id: "duration", label: "直播时长", type: "select", options: [
            { value: "1h", label: "1小时" },
            { value: "2h", label: "2小时" },
            { value: "3h", label: "3小时" },
            { value: "4h+", label: "4小时以上" }
          ], required: true }
        ]
      },
      {
        id: "product-info",
        title: "产品/内容信息",
        fields: [
          { id: "product-name", label: "主推产品/主题", type: "text", placeholder: "如：护肤品、课程、服务...", required: true },
          { id: "product-features", label: "核心卖点", type: "textarea", placeholder: "描述产品的主要卖点和优势...", required: true },
          { id: "price-range", label: "价格区间", type: "text", placeholder: "如：99-299元" }
        ]
      },
      {
        id: "script-requirements",
        title: "脚本要求",
        fields: [
          { id: "include-sections", label: "需要包含的环节", type: "checkbox", options: [
            { value: "opening", label: "开场话术" },
            { value: "product-intro", label: "产品讲解" },
            { value: "qa", label: "互动问答" },
            { value: "closing", label: "逼单话术" }
          ] },
          { id: "style", label: "话术风格", type: "radio", options: [
            { value: "professional", label: "专业权威" },
            { value: "friendly", label: "亲切友好" },
            { value: "energetic", label: "热情活力" }
          ] }
        ]
      }
    ]
  },
  {
    id: "douyin-account-analyzer",
    name: "抖音博主账号拆解",
    description: "深度拆解抖音头部博主账号，分析其定位、内容策略、涨粉路径，为你提供可复制的运营方法论。",
    shortDescription: "拆解头部博主，学习爆款方法论",
    category: "boss",
    tags: ["抖音", "账号分析", "对标"],
    usageCount: 0,
    icon: "Search",
    capabilities: [
      "分析账号定位与人设",
      "拆解内容选题规律",
      "总结涨粉爆款公式",
      "提供可复制的策略"
    ],
    limitations: [
      "需要提供账号信息",
      "策略需结合自身情况调整"
    ],
    targetUsers: ["抖音运营", "MCN机构", "品牌方"],
    examplePrompts: [
      "帮我拆解这个百万粉丝美食博主的账号",
      "分析这个知识博主是怎么做到快速涨粉的",
      "对比分析这3个同类型账号的运营差异"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "douyin-url",
        title: "输入链接",
        description: "输入抖音博主主页或视频链接，AI将自动抓取并分析",
        fields: [
          { id: "url", label: "抖音链接", type: "text", placeholder: "粘贴抖音博主主页链接或视频链接...", required: true, description: "支持抖音博主主页、视频详情页等链接" }
        ]
      }
    ]
  },
  {
    id: "video-batch-rewrite",
    name: "短视频批量二改助手",
    description: "智能改写短视频文案内容，支持批量处理，去重降重风格化一键完成，让每条内容都是原创。",
    shortDescription: "批量二改视频文案，高效生产原创内容",
    category: "boss",
    tags: ["二改", "去重", "批量"],
    usageCount: 0,
    icon: "RefreshCw",
    capabilities: [
      "批量改写视频文案",
      "智能去重保持原意",
      "多种风格转换",
      "提升原创度评分"
    ],
    limitations: [
      "需要保持核心卖点",
      "部分创意需人工优化"
    ],
    targetUsers: ["矩阵运营", "MCN机构", "电商团队"],
    examplePrompts: [
      "帮我把这10条视频文案批量二改",
      "这篇爆款文案降重到30%以下",
      "把这段口播稿改成更有网感的风格"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "original-content",
        title: "原始内容",
        fields: [
          { id: "content", label: "需要二改的文案", type: "textarea", placeholder: "粘贴需要二改的视频文案内容...", required: true }
        ]
      },
      {
        id: "rewrite-settings",
        title: "二改设置",
        fields: [
          { id: "versions", label: "生成版本数", type: "select", options: [
            { value: "3", label: "3个版本" },
            { value: "5", label: "5个版本" },
            { value: "10", label: "10个版本" }
          ], required: true },
          { id: "style", label: "风格调整", type: "checkbox", options: [
            { value: "casual", label: "口语化" },
            { value: "professional", label: "专业化" },
            { value: "humorous", label: "幽默风趣" },
            { value: "emotional", label: "情感共鸣" }
          ] },
          { id: "keep-core", label: "保留核心卖点", type: "radio", options: [
            { value: "yes", label: "是" },
            { value: "no", label: "可以调整" }
          ], required: true }
        ]
      }
    ]
  },
  {
    id: "xiaohongshu-account-analyst",
    name: "小红书账号分析师",
    description: "深度分析小红书账号数据和内容表现，发现增长机会，提供数据驱动的运营优化建议。",
    shortDescription: "数据驱动，优化小红书账号运营",
    category: "boss",
    tags: ["小红书", "数据分析", "运营"],
    usageCount: 0,
    icon: "LineChart",
    capabilities: [
      "分析账号数据表现",
      "识别爆款笔记规律",
      "诊断账号问题",
      "提供优化建议"
    ],
    limitations: [
      "需要提供真实数据",
      "历史数据越多分析越准"
    ],
    targetUsers: ["小红书博主", "品牌运营", "MCN机构"],
    examplePrompts: [
      "分析我最近10条笔记的数据，找出爆款规律",
      "我的账号流量下滑了，帮我诊断问题",
      "对比分析这3个竞品账号的运营策略"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "account-info",
        title: "账号信息",
        fields: [
          { id: "account-name", label: "小红书账号名称", type: "text", placeholder: "输入你的小红书账号名称", required: true },
          { id: "niche", label: "账号领域", type: "text", placeholder: "如：美妆、穿搭、母婴...", required: true },
          { id: "followers", label: "当前粉丝数", type: "select", options: [
            { value: "0-1k", label: "0-1000" },
            { value: "1k-1w", label: "1000-1万" },
            { value: "1w-10w", label: "1万-10万" },
            { value: "10w+", label: "10万以上" }
          ], required: true }
        ]
      },
      {
        id: "analysis-type",
        title: "分析需求",
        fields: [
          { id: "analysis-focus", label: "分析重点", type: "checkbox", options: [
            { value: "content", label: "内容表现分析" },
            { value: "growth", label: "涨粉诊断" },
            { value: "engagement", label: "互动率优化" },
            { value: "monetization", label: "变现建议" }
          ], required: true },
          { id: "problem", label: "当前遇到的问题", type: "textarea", placeholder: "描述你目前遇到的运营问题..." }
        ]
      }
    ]
  },

  // 私域变现
  {
    id: "circle-marketing-master",
    name: "发圈营销大师",
    description: "专业的朋友圈营销文案生成器，从痛点挖掘到卖点提炼，帮你写出高转化的发圈文案。",
    shortDescription: "专业发圈文案，提升朋友圈转化",
    category: "private",
    tags: ["朋友圈", "营销", "文案"],
    usageCount: 0,
    icon: "Megaphone",
    capabilities: [
      "挖掘用户痛点与需求",
      "提炼产品核心卖点",
      "生成高转化发圈文案",
      "设计朋友圈内容节奏"
    ],
    limitations: [
      "需要提供产品详细信息",
      "避免过度营销引起反感"
    ],
    targetUsers: ["微商", "私域运营", "销售"],
    examplePrompts: [
      "帮我为这款护肤品写一条种草发圈文案",
      "设计5条不同角度的朋友圈营销文案",
      "写一个能引起共鸣的产品故事文案"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "product-info",
        title: "产品信息",
        fields: [
          { id: "product-name", label: "产品/服务名称", type: "text", placeholder: "如：XX护肤品、XX课程...", required: true },
          { id: "product-features", label: "核心卖点", type: "textarea", placeholder: "描述产品的主要特点和优势...", required: true },
          { id: "price", label: "价格", type: "text", placeholder: "如：99元、199元/月" }
        ]
      },
      {
        id: "copy-settings",
        title: "文案设置",
        fields: [
          { id: "count", label: "生成数量", type: "select", options: [
            { value: "1", label: "1条" },
            { value: "3", label: "3条" },
            { value: "5", label: "5条" }
          ], required: true },
          { id: "style", label: "文案风格", type: "radio", options: [
            { value: "story", label: "故事型" },
            { value: "benefit", label: "利益型" },
            { value: "pain", label: "痛点型" },
            { value: "social-proof", label: "社会证明" }
          ], required: true },
          { id: "target-audience", label: "目标人群", type: "text", placeholder: "如：25-35岁女性、宝妈..." }
        ]
      }
    ]
  },
  {
    id: "circle-copy-rewriter",
    name: "发圈文案二创助手",
    description: "智能改写朋友圈文案，让你的发圈内容更有新意，避免重复单调，提升好友互动率。",
    shortDescription: "一键二创发圈文案，告别重复内容",
    category: "private",
    tags: ["二创", "朋友圈", "改写"],
    usageCount: 0,
    icon: "Edit",
    capabilities: [
      "智能改写保持原意",
      "多种风格转换",
      "增加互动元素",
      "优化表达方式"
    ],
    limitations: [
      "需要保持核心信息",
      "避免过度改写失去重点"
    ],
    targetUsers: ["微商", "私域运营", "社群运营"],
    examplePrompts: [
      "帮我把这段发圈文案改写成更有趣的风格",
      "这条文案我发过了，帮我二创一版新的",
      "把这段硬广改成软植入的风格"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "original-copy",
        title: "原始文案",
        fields: [
          { id: "original", label: "原始文案内容", type: "textarea", placeholder: "粘贴你想要二创的发圈文案...", required: true }
        ]
      },
      {
        id: "rewrite-settings",
        title: "二创设置",
        fields: [
          { id: "count", label: "生成版本数", type: "select", options: [
            { value: "3", label: "3个版本" },
            { value: "5", label: "5个版本" },
            { value: "10", label: "10个版本" }
          ], required: true },
          { id: "style-change", label: "风格调整", type: "checkbox", options: [
            { value: "casual", label: "更口语化" },
            { value: "funny", label: "更有趣" },
            { value: "soft", label: "软植入" },
            { value: "emotional", label: "情感化" }
          ] },
          { id: "keep-core", label: "保留核心信息", type: "radio", options: [
            { value: "yes", label: "是" },
            { value: "no", label: "可以调整" }
          ] }
        ]
      }
    ]
  },
  {
    id: "circle-clone",
    name: "朋友圈分身术",
    description: "基于一条原始文案，智能生成多条风格各异的朋友圈内容，让你的朋友圈更加丰富多元。",
    shortDescription: "一条变多条，朋友圈内容倍增",
    category: "private",
    tags: ["分身", "批量", "朋友圈"],
    usageCount: 0,
    icon: "Copy",
    capabilities: [
      "一键生成多条文案",
      "保持核心信息一致",
      "多种表达风格",
      "适配不同发布时间"
    ],
    limitations: [
      "需要明确核心卖点",
      "建议间隔发布避免刷屏"
    ],
    targetUsers: ["微商", "销售", "私域运营"],
    examplePrompts: [
      "帮我把这条产品文案分身成5条不同风格的",
      "根据这个主题，生成一周的朋友圈内容",
      "把这条案例分享改写成3种不同角度"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "base-copy",
        title: "基础文案",
        fields: [
          { id: "original", label: "原始文案", type: "textarea", placeholder: "粘贴你想要分身的原始文案...", required: true },
          { id: "core-point", label: "核心卖点", type: "text", placeholder: "这条文案的核心信息是什么？", required: true }
        ]
      },
      {
        id: "clone-settings",
        title: "分身设置",
        fields: [
          { id: "count", label: "生成数量", type: "select", options: [
            { value: "3", label: "3条" },
            { value: "5", label: "5条" },
            { value: "7", label: "7条（一周用量）" },
            { value: "10", label: "10条" }
          ], required: true },
          { id: "styles", label: "风格多样性", type: "checkbox", options: [
            { value: "story", label: "故事型" },
            { value: "qa", label: "问答型" },
            { value: "list", label: "清单型" },
            { value: "emotional", label: "情感型" },
            { value: "benefit", label: "利益型" }
          ] }
        ]
      }
    ]
  },
  {
    id: "private-sales-coach",
    name: "私域成交话术教练",
    description: "专业的私域销售话术指导，从破冰到成交，帮你设计高转化的一对一沟通话术。",
    shortDescription: "一对一话术指导，提升私域成交率",
    category: "private",
    tags: ["话术", "成交", "销售"],
    usageCount: 0,
    icon: "MessageSquare",
    capabilities: [
      "设计破冰话术",
      "挖掘客户需求",
      "处理客户异议",
      "设计逼单话术"
    ],
    limitations: [
      "需要了解产品和客户",
      "话术需根据场景调整"
    ],
    targetUsers: ["销售", "微商", "私域运营"],
    examplePrompts: [
      "客户说太贵了，怎么回复？",
      "设计一套从加好友到成交的完整话术",
      "客户已读不回，怎么跟进？"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "business-info",
        title: "业务信息",
        fields: [
          { id: "product", label: "产品/服务", type: "text", placeholder: "你销售的产品或服务是什么？", required: true },
          { id: "price", label: "价格范围", type: "text", placeholder: "如：99元、199-999元" },
          { id: "target", label: "目标客户", type: "text", placeholder: "如：宝妈、职场女性..." }
        ]
      },
      {
        id: "scenario",
        title: "场景需求",
        fields: [
          { id: "scenario-type", label: "话术场景", type: "radio", options: [
            { value: "icebreak", label: "破冰话术" },
            { value: "inquiry", label: "需求挖掘" },
            { value: "objection", label: "异议处理" },
            { value: "closing", label: "逼单成交" },
            { value: "followup", label: "跟进维护" }
          ], required: true },
          { id: "specific-problem", label: "具体问题", type: "textarea", placeholder: "描述你遇到的具体销售问题..." }
        ]
      }
    ]
  },
  {
    id: "private-content-planner",
    name: "私域内容日历规划师",
    description: "帮你规划私域内容发布日历，从日常分享到节日营销，让你的私域运营更有节奏。",
    shortDescription: "规划私域内容日历，运营更有节奏",
    category: "private",
    tags: ["内容规划", "日历", "私域"],
    usageCount: 0,
    icon: "Calendar",
    capabilities: [
      "制定内容发布计划",
      "设计节日营销内容",
      "规划日常分享节奏",
      "提供内容灵感"
    ],
    limitations: [
      "需要了解业务类型",
      "计划需根据实际调整"
    ],
    targetUsers: ["私域运营", "社群运营", "微商"],
    examplePrompts: [
      "帮我规划下个月的朋友圈发布日历",
      "设计一套双11私域营销内容计划",
      "我是做美妆的，帮我规划一周的内容"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "business-info",
        title: "业务信息",
        fields: [
          { id: "industry", label: "所在行业", type: "text", placeholder: "如：美妆、教育、母婴...", required: true },
          { id: "products", label: "主要产品/服务", type: "textarea", placeholder: "简要描述你的产品或服务..." }
        ]
      },
      {
        id: "plan-settings",
        title: "规划设置",
        fields: [
          { id: "duration", label: "规划周期", type: "radio", options: [
            { value: "week", label: "一周" },
            { value: "month", label: "一个月" },
            { value: "quarter", label: "一个季度" }
          ], required: true },
          { id: "frequency", label: "发布频率", type: "select", options: [
            { value: "1", label: "每天1条" },
            { value: "2", label: "每天2条" },
            { value: "3", label: "每天3条" }
          ], required: true },
          { id: "content-types", label: "内容类型", type: "checkbox", options: [
            { value: "product", label: "产品种草" },
            { value: "case", label: "客户案例" },
            { value: "life", label: "生活日常" },
            { value: "value", label: "价值分享" },
            { value: "promo", label: "活动促销" }
          ] }
        ]
      }
    ]
  },

  // 公域获客
  {
    id: "persona-video-rewriter",
    name: "人设短视频二创大师",
    description: "专业的人设短视频二创工具，帮你将爆款人设视频改编成符合你风格的原创内容，保持人设一致性。",
    shortDescription: "人设视频二创，打造专属内容",
    category: "public",
    tags: ["人设", "二创", "短视频"],
    usageCount: 0,
    icon: "UserCircle",
    capabilities: [
      "分析原视频人设特点",
      "保持人设一致性改编",
      "生成多版本二创内容",
      "优化表达更有个人风格"
    ],
    limitations: [
      "需要明确你的人设定位",
      "需要提供原视频内容"
    ],
    targetUsers: ["IP打造者", "短视频创作者", "MCN机构"],
    examplePrompts: [
      "帮我把这个老板人设视频改编成我的风格",
      "这个知识博主的视频很火，帮我二创",
      "保持我的专家人设，二创这段爆款内容"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "original-content",
        title: "原始内容",
        fields: [
          { id: "original-script", label: "原视频文案/脚本", type: "textarea", placeholder: "粘贴你想要二创的原视频文案...", required: true }
        ]
      },
      {
        id: "persona-settings",
        title: "人设设定",
        fields: [
          { id: "your-persona", label: "你的人设定位", type: "text", placeholder: "如：行业专家、创业老板、职场导师...", required: true },
          { id: "tone", label: "表达风格", type: "radio", options: [
            { value: "professional", label: "专业权威" },
            { value: "friendly", label: "亲切接地气" },
            { value: "humorous", label: "幽默风趣" },
            { value: "inspirational", label: "励志激励" }
          ], required: true },
          { id: "versions", label: "生成版本数", type: "select", options: [
            { value: "3", label: "3个版本" },
            { value: "5", label: "5个版本" }
          ], required: true }
        ]
      }
    ]
  },
  {
    id: "hot-video-rewriter",
    name: "爆款短视频二创",
    description: "智能分析爆款短视频的成功元素，帮你快速二创出同样有爆款潜力的原创内容。",
    shortDescription: "二创爆款视频，复制成功公式",
    category: "public",
    tags: ["爆款", "二创", "短视频"],
    usageCount: 0,
    icon: "Flame",
    capabilities: [
      "分析爆款视频成功元素",
      "提取可复制的框架",
      "生成多角度二创版本",
      "保持原创性避免抄袭"
    ],
    limitations: [
      "需要提供原视频内容",
      "需要结合自身账号调整"
    ],
    targetUsers: ["短视频创作者", "MCN机构", "新媒体运营"],
    examplePrompts: [
      "这个视频播放量500万，帮我二创",
      "分析这个爆款视频的成功元素并二创",
      "把这个爆款改编成适合我账号的版本"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "original-video",
        title: "原视频内容",
        fields: [
          { id: "script", label: "爆款视频文案", type: "textarea", placeholder: "粘贴爆款视频的文案内容...", required: true },
          { id: "video-type", label: "视频类型", type: "radio", options: [
            { value: "knowledge", label: "知识干货" },
            { value: "story", label: "故事剧情" },
            { value: "product", label: "产品种草" },
            { value: "entertainment", label: "搞笑娱乐" }
          ], required: true }
        ]
      },
      {
        id: "rewrite-settings",
        title: "二创设置",
        fields: [
          { id: "your-niche", label: "你的账号领域", type: "text", placeholder: "如：美食、职场、母婴...", required: true },
          { id: "versions", label: "生成版本数", type: "select", options: [
            { value: "3", label: "3个版本" },
            { value: "5", label: "5个版本" },
            { value: "10", label: "10个版本" }
          ], required: true },
          { id: "keep-structure", label: "保留原视频结构", type: "radio", options: [
            { value: "yes", label: "是，保留框架" },
            { value: "no", label: "否，可以调整" }
          ] }
        ]
      }
    ]
  },
  {
    id: "live-traffic-script",
    name: "直播引流品爆单话术",
    description: "专业的直播引流品话术生成器，帮你设计高转化的引流品讲解话术，快速成交引流品带动直播间人气。",
    shortDescription: "引流品话术，快速成交爆单",
    category: "public",
    tags: ["直播", "引流品", "话术"],
    usageCount: 0,
    icon: "ShoppingBag",
    capabilities: [
      "设计引流品讲解话术",
      "优化价格锚点策略",
      "提升紧迫感话术",
      "设计限时限量话术"
    ],
    limitations: [
      "需要提供产品信息",
      "话术需根据直播风格调整"
    ],
    targetUsers: ["直播带货主播", "电商运营", "MCN机构"],
    examplePrompts: [
      "帮我设计一个9.9元引流品的爆单话术",
      "这个福利品怎么讲才能快速成交？",
      "设计一套引流品到利润品的过渡话术"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "product-info",
        title: "引流品信息",
        fields: [
          { id: "product-name", label: "引流品名称", type: "text", placeholder: "如：XX护肤小样、XX体验装...", required: true },
          { id: "price", label: "引流价格", type: "text", placeholder: "如：9.9元、19.9元", required: true },
          { id: "original-price", label: "原价/市场价", type: "text", placeholder: "如：99元、199元" },
          { id: "quantity", label: "限量数量", type: "text", placeholder: "如：100份、500份" }
        ]
      },
      {
        id: "script-settings",
        title: "话术设置",
        fields: [
          { id: "urgency-level", label: "紧迫感强度", type: "radio", options: [
            { value: "mild", label: "温和引导" },
            { value: "medium", label: "适度紧迫" },
            { value: "strong", label: "强烈紧迫" }
          ], required: true },
          { id: "include-sections", label: "包含环节", type: "checkbox", options: [
            { value: "value", label: "价值塑造" },
            { value: "anchor", label: "价格锚点" },
            { value: "urgency", label: "限时限量" },
            { value: "action", label: "行动号召" }
          ] }
        ]
      }
    ]
  },
  {
    id: "hotspot-topic-assistant",
    name: "热点借势选题助手",
    description: "实时追踪热点话题，帮你快速找到与自身内容的结合点，蹭热度不生硬。",
    shortDescription: "追踪热点，快速借势创作",
    category: "public",
    tags: ["热点", "借势", "选题"],
    usageCount: 0,
    icon: "TrendingUp",
    capabilities: [
      "分析当前热点话题",
      "找到内容结合点",
      "生成借势选题",
      "避免敏感风险"
    ],
    limitations: [
      "热点时效性强",
      "需要快速执行"
    ],
    targetUsers: ["新媒体运营", "内容创作者", "品牌方"],
    examplePrompts: [
      "最近有什么热点可以蹭？我是美食博主",
      "帮我分析这个热点怎么和我的内容结合",
      "生成3个借势热点的选题角度"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "account-info",
        title: "账号信息",
        fields: [
          { id: "niche", label: "你的内容领域", type: "text", placeholder: "如：美食、职场、母婴...", required: true },
          { id: "platform", label: "主要平台", type: "radio", options: [
            { value: "douyin", label: "抖音" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "weibo", label: "微博" },
            { value: "wechat", label: "公众号" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-platform", label: "自定义平台名称", type: "text", placeholder: "请输入平台名称...", description: "如果选择了'其他'，请在此填写平台名称（如：B站、知乎、今日头条、百家号等）" }
        ]
      },
      {
        id: "hotspot-settings",
        title: "热点需求",
        fields: [
          { id: "hotspot-type", label: "热点类型偏好", type: "checkbox", options: [
            { value: "entertainment", label: "娱乐热点" },
            { value: "social", label: "社会话题" },
            { value: "festival", label: "节日节点" },
            { value: "industry", label: "行业动态" }
          ] },
          { id: "topic-count", label: "生成选题数量", type: "select", options: [
            { value: "3", label: "3个选题" },
            { value: "5", label: "5个选题" },
            { value: "10", label: "10个选题" }
          ], required: true }
        ]
      }
    ]
  },
  {
    id: "title-optimizer",
    name: "标题优化专家",
    description: "基于爆款标题公式和平台算法特点，智能优化标题点击率。让你的内容从标题开始就赢在起跑线。",
    shortDescription: "优化标题，提升点击率",
    category: "public",
    tags: ["标题", "点击率", "优化"],
    usageCount: 0,
    icon: "Zap",
    capabilities: [
      "分析标题问题",
      "优化标题点击率",
      "适配不同平台特点",
      "提供多版本选择"
    ],
    limitations: [
      "标题需符合平台规范",
      "避免过度标题党"
    ],
    targetUsers: ["内容创作者", "新媒体运营", "编辑"],
    examplePrompts: [
      "帮我优化这个标题，让它更有点击欲望",
      "根据小红书的特点，改写这个标题",
      "这个标题哪里有问题？帮我诊断"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "original-title",
        title: "原标题",
        fields: [
          { id: "title", label: "需要优化的标题", type: "text", placeholder: "输入你想优化的标题...", required: true },
          { id: "content-summary", label: "内容简介", type: "textarea", placeholder: "简要描述这篇内容是关于什么的..." }
        ]
      },
      {
        id: "optimization-settings",
        title: "优化设置",
        fields: [
          { id: "platform", label: "目标平台", type: "radio", options: [
            { value: "douyin", label: "抖音" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "weixin", label: "公众号" },
            { value: "general", label: "通用" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-platform", label: "自定义平台名称", type: "text", placeholder: "请输入平台名称...", description: "如果选择了'其他'，请在此填写平台名称（如：B站、知乎、今日头条、百家号等）" },
          { id: "versions", label: "生成版本数", type: "select", options: [
            { value: "5", label: "5个标题" },
            { value: "10", label: "10个标题" }
          ], required: true },
          { id: "style", label: "标题风格", type: "checkbox", options: [
            { value: "curiosity", label: "引发好奇" },
            { value: "benefit", label: "利益导向" },
            { value: "number", label: "数字列表" },
            { value: "question", label: "疑问句式" }
          ] }
        ]
      }
    ]
  },

  // 实用工具
  {
    id: "hot-video-follow",
    name: "爆款跟拍",
    description: "智能分析爆款视频的拍摄框架和节奏，帮你快速理解爆款的成功要素，输出可直接跟拍的脚本。",
    shortDescription: "分析爆款，输出跟拍脚本",
    category: "tools",
    tags: ["爆款", "跟拍", "脚本"],
    usageCount: 0,
    icon: "Camera",
    capabilities: [
      "分析爆款视频结构",
      "提取拍摄框架",
      "输出跟拍脚本",
      "标注拍摄要点"
    ],
    limitations: [
      "需要提供原视频内容",
      "执行拍摄需自行完成"
    ],
    targetUsers: ["短视频创作者", "MCN机构", "新媒体运营"],
    examplePrompts: [
      "这个爆款视频的拍摄框架是什么？",
      "帮我分析这个视频，输出跟拍脚本",
      "把这个爆款拆解成我可以跟拍的版本"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "platform-account",
        title: "平台与账号信息",
        fields: [
          { id: "platform", label: "平台", type: "radio", options: [
            { value: "douyin", label: "抖音" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "video-account", label: "视频号" },
            { value: "kuaishou", label: "快手" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "custom-platform", label: "自定义平台名称", type: "text", placeholder: "请输入平台名称...", description: "如果选择了'其他'，请在此填写平台名称" },
          { id: "industry", label: "行业/赛道", type: "text", placeholder: "如：美妆、母婴、职场、美食...", required: true },
          { id: "products", label: "产品/服务", type: "text", placeholder: "描述你的主要产品或服务...", required: true },
          { id: "account-stage", label: "账号阶段", type: "radio", options: [
            { value: "new", label: "新号起步" },
            { value: "growth", label: "成长期" },
            { value: "stable", label: "稳定期" }
          ], required: true },
          { id: "target-audience", label: "目标人群", type: "text", placeholder: "如：25-35岁职场女性、宝妈、企业主...", required: true }
        ]
      },
      {
        id: "shooting-conditions",
        title: "拍摄条件",
        fields: [
          { id: "shooting-scene", label: "拍摄场景", type: "radio", options: [
            { value: "indoor", label: "室内" },
            { value: "outdoor", label: "户外" },
            { value: "office", label: "办公室" },
            { value: "factory", label: "工厂" },
            { value: "store", label: "门店" },
            { value: "other", label: "其他" }
          ], required: true },
          { id: "people-count", label: "拍摄人数", type: "radio", options: [
            { value: "1", label: "1人" },
            { value: "2", label: "2人" },
            { value: "3+", label: "3人以上" }
          ], required: true },
          { id: "real-person", label: "是否真人出镜", type: "radio", options: [
            { value: "yes", label: "是" },
            { value: "no", label: "否" }
          ], required: true },
          { id: "equipment", label: "拍摄设备", type: "radio", options: [
            { value: "phone", label: "手机" },
            { value: "camera", label: "专业相机" },
            { value: "other", label: "其他" }
          ], required: true }
        ]
      },
      {
        id: "content-goals",
        title: "内容目标",
        fields: [
          { id: "duration", label: "视频时长目标", type: "radio", options: [
            { value: "15s", label: "15秒内" },
            { value: "30s", label: "30秒" },
            { value: "1min", label: "1分钟" },
            { value: "3min", label: "3分钟" }
          ], required: true },
          { id: "conversion-goal", label: "核心转化目标", type: "radio", options: [
            { value: "fans", label: "涨粉" },
            { value: "private", label: "引流私域" },
            { value: "sales", label: "直接成交" },
            { value: "brand", label: "品牌曝光" }
          ], required: true },
          { id: "expression-level", label: "老板表达能力", type: "radio", options: [
            { value: "beginner", label: "新手" },
            { value: "normal", label: "一般" },
            { value: "skilled", label: "熟练" }
          ], required: true }
        ]
      }
    ]
  },
  {
    id: "video-to-text",
    name: "视频转文案",
    description: "智能提取视频中的口播内容，转换为可编辑的文字文案，方便二次创作和内容复用。",
    shortDescription: "提取视频口播，转为文字文案",
    category: "tools",
    tags: ["视频", "转文案", "提取"],
    usageCount: 0,
    icon: "FileVideo",
    capabilities: [
      "提取视频口播内容",
      "转换为文字文案",
      "自动分段排版",
      "支持多平台视频"
    ],
    limitations: [
      "需要提供视频链接或内容",
      "语音识别准确率依赖视频质量"
    ],
    targetUsers: ["内容创作者", "新媒体运营", "文案编辑"],
    examplePrompts: [
      "帮我把这个视频的口播转成文案",
      "提取这个抖音视频的文字内容",
      "把这段视频内容转成可编辑的文字"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "video-content",
        title: "视频内容",
        fields: [
          { id: "video-link", label: "视频链接", type: "text", placeholder: "粘贴视频链接（抖音/小红书/视频号等）..." },
          { id: "video-content", label: "视频文字内容", type: "textarea", placeholder: "或直接粘贴视频中的口播文字内容...", description: "视频链接和文字内容至少填写一项" }
        ]
      },
      {
        id: "conversion-settings",
        title: "转换设置",
        fields: [
          { id: "use-scene", label: "使用场景", type: "radio", options: [
            { value: "moments", label: "朋友圈" },
            { value: "xiaohongshu", label: "小红书" },
            { value: "private", label: "私域成交" },
            { value: "general", label: "通用文案" }
          ], required: true },
          { id: "output-style", label: "输出风格", type: "radio", options: [
            { value: "concise", label: "简洁精炼" },
            { value: "detailed", label: "详细完整" },
            { value: "casual", label: "口语化" },
            { value: "professional", label: "专业化" }
          ], required: true },
          { id: "keep-structure", label: "保留原视频结构", type: "radio", options: [
            { value: "yes", label: "是" },
            { value: "no", label: "否" }
          ], required: true }
        ]
      }
    ]
  },
  {
    id: "video-download",
    name: "视频下载",
    description: "支持多平台无水印视频下载，快速获取优质素材，方便学习和二次创作。",
    shortDescription: "多平台无水印视频下载",
    category: "tools",
    tags: ["下载", "无水印", "素材"],
    usageCount: 0,
    icon: "Download",
    capabilities: [
      "支持抖音、快手等平台",
      "无水印高清下载",
      "快速获取素材",
      "支持批量下载"
    ],
    limitations: [
      "仅供学习研究使用",
      "请尊重原创版权"
    ],
    targetUsers: ["内容创作者", "新媒体运营", "学习者"],
    examplePrompts: [
      "帮我下载这个抖音视频",
      "获取这个视频的无水印版本",
      "下载这个快手视频素材"
    ],
    useFormMode: false
  },
  {
    id: "teleprompter",
    name: "提词器",
    description: "专业的直播/录制提词器工具，支持自定义滚动速度、字体大小，让你的口播更加流畅自然。",
    shortDescription: "专业提词器，口播更流畅",
    category: "tools",
    tags: ["提词器", "直播", "口播"],
    usageCount: 0,
    icon: "ScrollText",
    capabilities: [
      "自定义滚动速度",
      "调整字体大小",
      "支持暂停继续",
      "镜像模式支持"
    ],
    limitations: [
      "需要提前准备好文案",
      "建议提前练习"
    ],
    targetUsers: ["直播主播", "短视频创作者", "演讲者"],
    examplePrompts: [
      "打开提词器，设置慢速滚动",
      "调整字体大小为大号",
      "开启镜像模式"
    ],
    useFormMode: true,
    formSteps: [
      {
        id: "script-content",
        title: "文案内容",
        fields: [
          { id: "script", label: "文案内容", type: "textarea", placeholder: "粘贴或输入你想要优化的文案内容...", required: true },
          { id: "use-scene", label: "使用场景", type: "radio", options: [
            { value: "live", label: "直播口播" },
            { value: "short-video", label: "短视频拍摄" },
            { value: "speech", label: "演讲" },
            { value: "other", label: "其他" }
          ], required: true }
        ]
      },
      {
        id: "optimization-settings",
        title: "优化设置",
        fields: [
          { id: "speaking-speed", label: "口播速度", type: "radio", options: [
            { value: "slow", label: "慢速" },
            { value: "normal", label: "正常" },
            { value: "fast", label: "快速" }
          ], required: true },
          { id: "emphasis-points", label: "需要强调的重点", type: "text", placeholder: "如：产品优势、价格优惠、行动号召..." },
          { id: "tone", label: "语气风格", type: "radio", options: [
            { value: "friendly", label: "亲切自然" },
            { value: "professional", label: "专业严谨" },
            { value: "passionate", label: "激情澎湃" },
            { value: "casual", label: "轻松幽默" }
          ], required: true }
        ]
      }
    ]
  },
]

export function getAgentById(id: string): AIAgent | undefined {
  return agents.find(agent => agent.id === id)
}

export function getAgentsByCategory(category: string): AIAgent[] {
  if (category === "all") return agents
  return agents.filter(agent => agent.category === category)
}

export function formatUsageCount(count: number): string {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + "万"
  }
  return count.toString()
}
