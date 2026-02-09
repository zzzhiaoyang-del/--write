/**
 * 测试 D-ID API Key 是否有效
 * 运行: node scripts/test-did-api.js
 */

// D-ID API Key (从 .env.local 复制)
const DID_API_KEY = 'Basic enp6aGlhb3lhbmdAZ21haWwuY29t:LKTeLrWWb9PDf5GQ4uVc8'

async function testDIDApi() {
  console.log('🔍 测试 D-ID API Key...\n')

  try {
    // 测试 1: 获取账户信息
    console.log('测试 1: 获取账户余额信息...')
    const creditsResponse = await fetch('https://api.d-id.com/credits', {
      method: 'GET',
      headers: {
        'Authorization': DID_API_KEY,
      },
    })

    console.log(`状态码: ${creditsResponse.status}`)

    if (!creditsResponse.ok) {
      const errorText = await creditsResponse.text()
      console.error('❌ API Key 无效或已过期')
      console.error('错误详情:', errorText)
      return
    }

    const creditsData = await creditsResponse.json()
    console.log('✅ API Key 有效!')
    console.log('账户信息:', JSON.stringify(creditsData, null, 2))

    // 测试 2: 获取可用的演员列表
    console.log('\n测试 2: 获取可用的演员列表...')
    const actorsResponse = await fetch('https://api.d-id.com/actors', {
      method: 'GET',
      headers: {
        'Authorization': DID_API_KEY,
      },
    })

    if (actorsResponse.ok) {
      const actorsData = await actorsResponse.json()
      console.log('✅ 成功获取演员列表')
      console.log(`可用演员数量: ${actorsData.actors?.length || 0}`)
    }

    console.log('\n🎉 D-ID API 测试通过!')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

testDIDApi()
