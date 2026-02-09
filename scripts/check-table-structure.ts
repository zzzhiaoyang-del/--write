/**
 * 检查数据库表结构
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rsudtvmqwuyawhvyyvce.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdWR0dm1xd3V5YXdodnl5dmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTg2NDYsImV4cCI6MjA4NTc3NDY0Nn0.Q2jLdR7C2u3ugRzNWaMC2KJEUOKTEp0V0yWbPCYJe2g'

async function checkTableStructure() {
  console.log('🔍 检查 digital_humans 表结构...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // 尝试查询表（即使是空的也能看到表是否存在）
    const { error } = await supabase
      .from('digital_humans')
      .select('id')
      .limit(1)

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ 表不存在！')
        console.log('\n你需要在 Supabase 控制台创建表:')
        console.log('1. 打开 Supabase SQL Editor')
        console.log('2. 运行 database/create-digital-humans-table.sql 中的 SQL')
        return false
      } else {
        console.log('❌ 查询错误:', error.message)
        return false
      }
    }

    console.log('✅ 表存在！')
    console.log('\n表结构正常，但是没有数据。')
    console.log('\n可能的原因:')
    console.log('1. 你在网页上看到的是浏览器缓存的旧数据')
    console.log('2. 创建数字人时数据库写入失败了')
    console.log('3. 表被清空了')

    return true

  } catch (error) {
    console.error('❌ 错误:', error)
    return false
  }
}

checkTableStructure()
