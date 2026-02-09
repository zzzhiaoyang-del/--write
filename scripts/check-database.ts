/**
 * 检查数据库中的数字人记录
 * 运行: node --loader tsx scripts/check-database.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rsudtvmqwuyawhvyyvce.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdWR0dm1xd3V5YXdodnl5dmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTg2NDYsImV4cCI6MjA4NTc3NDY0Nn0.Q2jLdR7C2u3ugRzNWaMC2KJEUOKTEp0V0yWbPCYJe2g'

async function checkDatabase() {
  console.log('🔍 检查数据库中的数字人记录...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // 查询所有数字人记录
    const { data, error } = await supabase
      .from('digital_humans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 数据库查询失败:', error)
      return
    }

    console.log(`✅ 成功查询数据库`)
    console.log(`找到 ${data?.length || 0} 条数字人记录\n`)

    if (data && data.length > 0) {
      console.log('数字人列表:')
      data.forEach((human, index) => {
        console.log(`\n${index + 1}. ${human.name}`)
        console.log(`   ID: ${human.id}`)
        console.log(`   状态: ${human.status}`)
        console.log(`   分类: ${human.category}`)
        console.log(`   Avatar ID: ${human.avatar_id}`)
        console.log(`   D-ID Talk ID: ${human.did_talk_id || '无'}`)
        console.log(`   视频 URL: ${human.video_url || '无'}`)
        console.log(`   结果 URL: ${human.result_url || '无'}`)
        console.log(`   创建时间: ${human.created_at}`)
      })

      // 统计状态
      const statusCount = data.reduce((acc, human) => {
        acc[human.status] = (acc[human.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log('\n状态统计:')
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`)
      })
    } else {
      console.log('数据库中没有数字人记录')
    }

  } catch (error) {
    console.error('❌ 错误:', error)
  }
}

checkDatabase()
