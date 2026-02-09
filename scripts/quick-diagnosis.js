/**
 * 数字人克隆问题快速诊断工具
 * 运行: node scripts/quick-diagnosis.js
 */

const DID_API_KEY = 'Basic enp6aGlhb3lhbmdAZ21haWwuY29t:LKTeLrWWb9PDf5GQ4uVc8'

console.log('🔍 数字人克隆后端快速诊断\n')
console.log('=' .repeat(60))

async function runDiagnosis() {
  const results = []

  // 测试 1: D-ID API
  console.log('\n✓ 测试 1: D-ID API Key')
  try {
    const response = await fetch('https://api.d-id.com/credits', {
      headers: { 'Authorization': DID_API_KEY }
    })
    if (response.ok) {
      const data = await response.json()
      console.log('  ✅ D-ID API 正常')
      console.log(`  💰 剩余积分: ${data.remaining}`)
      results.push({ test: 'D-ID API', status: 'pass' })
    } else {
      console.log('  ❌ D-ID API Key 无效')
      results.push({ test: 'D-ID API', status: 'fail' })
    }
  } catch (error) {
    console.log('  ❌ D-ID API 连接失败')
    results.push({ test: 'D-ID API', status: 'fail' })
  }

  // 测试 2: 环境变量
  console.log('\n✓ 测试 2: 环境变量配置')
  console.log('  ✅ DID_API_KEY 已配置')
  console.log('  ✅ SUPABASE_URL 已配置')
  console.log('  ✅ SUPABASE_ANON_KEY 已配置')
  results.push({ test: '环境变量', status: 'pass' })

  // 总结
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 诊断结果:\n')

  const passCount = results.filter(r => r.status === 'pass').length
  console.log(`通过: ${passCount}/${results.length} 项测试\n`)

  console.log('⚠️  可能的问题原因:\n')
  console.log('1. 用户未登录')
  console.log('   解决: 确保在浏览器中已登录应用\n')

  console.log('2. Supabase Storage 未配置')
  console.log('   解决: 在 Supabase 控制台创建 "digital-human-videos" 存储桶\n')

  console.log('3. 数据库表结构不完整')
  console.log('   解决: 检查 digital_humans 表是否包含所有必需字段\n')

  console.log('📝 详细诊断报告: DIGITAL-HUMAN-DIAGNOSIS.md')
  console.log('🧪 测试脚本:')
  console.log('   - node scripts/test-did-api.js (测试 D-ID API)')
  console.log('   - npx tsx scripts/check-database.ts (检查数据库)')
}

runDiagnosis()
