# 🔍 数字人克隆功能检查清单

按照这个清单逐项检查，打勾表示完成。

---

## ✅ 第一步：Supabase Storage 配置

- [ ] 已登录 Supabase 控制台 (https://supabase.com)
- [ ] 已进入项目 `rsudtvmqwuyawhvyyvce`
- [ ] 已点击左侧 "Storage" 菜单
- [ ] 已创建存储桶 `digital-human-videos`
- [ ] 已勾选 "Public bucket"（公开访问）
- [ ] 已保存设置

**验证方法**：在 Storage 页面应该能看到 `digital-human-videos` 存储桶，并且显示为 Public。

---

## ✅ 第二步：数据库表结构

- [ ] 已打开 Supabase SQL Editor
- [ ] 已运行表结构检查 SQL
- [ ] 已运行创建表的 SQL（如果表不存在）
- [ ] SQL 执行成功，没有错误

**验证方法**：运行以下命令，应该显示表结构
```bash
npx tsx scripts/check-database.ts
```

---

## ✅ 第三步：启动项目并登录

- [ ] 已运行 `npm run dev`
- [ ] 服务器已启动（显示 Local: http://localhost:3000）
- [ ] 已在浏览器打开 http://localhost:3000
- [ ] 已按 F12 打开开发者工具
- [ ] 已登录应用（或注册新账号）
- [ ] 已在 Console 验证登录状态

**验证方法**：在 Console 运行
```javascript
fetch('/api/digital-human/list').then(r => r.json()).then(console.log)
```
应该返回 `{ humans: [...] }` 而不是 `{ error: '未登录' }`

---

## ✅ 第四步：测试创建数字人

- [ ] 已准备测试视频（< 10MB）
- [ ] 已访问 http://localhost:3000/digital-human
- [ ] 已打开 Network 标签
- [ ] 已上传视频
- [ ] 已填写名称和分类
- [ ] 已点击提交
- [ ] upload 请求返回 200 OK
- [ ] clone 请求返回 200 OK
- [ ] 页面自动跳转到列表页

**验证方法**：在 Network 标签中，两个请求都应该是绿色的 200 状态。

---

## ✅ 第五步：查看数字人列表

- [ ] 已自动跳转到 /digital-human/list
- [ ] 能看到刚创建的数字人卡片
- [ ] 状态显示为"处理中"
- [ ] 等待 2-5 分钟
- [ ] 状态自动更新为"已完成"
- [ ] 能看到生成的视频

**验证方法**：运行
```bash
npx tsx scripts/check-database.ts
```
应该显示至少 1 条记录。

---

## ✅ 第六步：验证 D-ID API

- [ ] 已运行 `node scripts/test-did-api.js`
- [ ] API Key 显示有效
- [ ] 剩余积分 > 0

**验证方法**：运行
```bash
node scripts/test-did-api.js
```
应该显示 `✅ D-ID API 正常` 和剩余积分数量。

---

## 🎯 完成标准

当以上所有项目都打勾后，你的数字人克隆功能应该完全正常！

如果某一步失败，请参考 [详细修复指南](./STEP-BY-STEP-FIX.md) 中对应的章节。

---

## 🚨 快速诊断命令

如果遇到问题，运行以下命令：

```bash
# 快速诊断
node scripts/quick-diagnosis.js

# 测试 D-ID API
node scripts/test-did-api.js

# 检查数据库
npx tsx scripts/check-database.ts
```

---

**提示**：建议按顺序完成每一步，不要跳过任何步骤！