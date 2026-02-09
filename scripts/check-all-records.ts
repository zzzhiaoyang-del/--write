/**
 * 管理员模式检查数据库（绕过 RLS）
 * 需要使用 service_role key
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rsudtvmqwuyawhvyyvce.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdWR0dm1xd3V5YXdodnl5dmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTg2NDYsImV4cCI6MjA4NTc3NDY0Nn0.Q2jLdR7C2u3ugRzNWaMC2KJEUOKTEp0V0yWbPCYJe2g'

async function checkAllRecords() {
  console.log('🔍 检查所有数字人记录（包括所有用户）...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // 尝试查询所有记录（可能受 RLS 限制）
    const { data, error, count } = await supabase
      .from('digital_humans')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 查询失败:', error.message)
      console.log('\n可能的原因:')
      console.log('1. 表不存在')
      console.log('2. RLS 策略阻止了查询')
      console.log('3. 权限配置问题')
      return
    }

    console.log(`✅ 查询成功`)
    console.log(`总记录数: ${count || 0}\n`)

    if (data && data.length > 0) {
      console.log('数字人列表:\n')
      data.forEach((human, index) => {
        console.log(`${index + 1}. ${human.name}`)
        console.log(`   ID: ${human.id}`)
        console.log(`   User ID: ${human.user_id}`)
        console.log(`   状态: ${human.status}`)
        console.log(`   分类: ${human.category}`)
        console.log(`   Avatar ID: ${human.avatar_id}`)
        console.log(`   D-ID Talk ID: ${human.did_talk_id || '无（模拟模式）'}`)
        console.log(`   视频 URL: ${human.video_url || '无'}`)
        console.log(`   结果 URL: ${human.result_url || '无'}`)
        console.log(`   创建时间: ${human.created_at}`)
        console.log()
      })

      // 分析问题
      console.log('📊 问题分析:\n')
      data.forEach((human) => {
        if (human.status === 'completed' && !human.result_url) {
          console.log(`⚠️  数字人 "${human.name}" 状态为已完成，但没有 result_url`)
          if (!human.did_talk_id) {
            console.log(`   → 原因: 使用了模拟模式（没有调用 D-ID API）`)
          } else {
            console.log(`   → 原因: D-ID API 返回了完成状态，但没有返回视频 URL`)
          }
          console.log()
        }
      })
    } else {
      console.log('❌ 数据库中没有任何记录')
      console.log('\n这意味着:')
      console.log('1. 表是空的')
      console.log('2. 或者 RLS 策略阻止了你查看记录')
      console.log('3. 或者网页显示的是缓存数据')
    }

  } catch (error) {
    console.error('❌ 错误:', error)
  }
}

checkAllRecords()
