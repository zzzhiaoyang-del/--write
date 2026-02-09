/**
 * 测试 Vercel 环境的数据库写入权限
 * 这个脚本会尝试直接写入数据库
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rsudtvmqwuyawhvyyvce.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdWR0dm1xd3V5YXdodnl5dmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTg2NDYsImV4cCI6MjA4NTc3NDY0Nn0.Q2jLdR7C2u3ugRzNWaMC2KJEUOKTEp0V0yWbPCYJe2g'

async function testDatabaseWrite() {
  console.log('🔍 测试数据库写入权限...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 测试 1: 尝试写入一条测试记录（不需要用户认证）
  console.log('测试 1: 尝试直接写入（会失败，因为需要 user_id）')

  const testData = {
    user_id: '00000000-0000-0000-0000-000000000000', // 假的 UUID
    name: '测试记录',
    category: 'test',
    avatar_id: 'test_123',
    video_url: 'https://example.com/test.mp4',
    status: 'completed',
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('digital_humans')
    .insert(testData)
    .select()

  if (error) {
    console.log('❌ 写入失败（预期的）')
    console.log('错误信息:', error.message)
    console.log('错误代码:', error.code)

    if (error.message.includes('RLS') || error.message.includes('policy')) {
      console.log('\n✅ 这是 RLS 策略导致的，说明表配置正确')
      console.log('   需要用户登录才能写入数据')
    } else if (error.message.includes('foreign key')) {
      console.log('\n✅ 这是外键约束导致的，说明表结构正确')
      console.log('   user_id 必须是真实的用户 ID')
    } else {
      console.log('\n⚠️  未知错误，可能需要检查表配置')
    }
  } else {
    console.log('✅ 写入成功（不应该发生）')
    console.log('数据:', data)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 结论:')
  console.log('1. 如果看到 RLS 或 policy 错误 → 表配置正确，需要用户登录')
  console.log('2. 如果看到 foreign key 错误 → 表结构正确，需要真实用户 ID')
  console.log('3. 如果写入成功 → RLS 未启用，有安全风险')
  console.log('\n💡 Vercel 环境的问题可能是:')
  console.log('   - 用户认证在 Vercel 上不工作')
  console.log('   - 或者 clone API 的错误处理有问题')
}

testDatabaseWrite()
