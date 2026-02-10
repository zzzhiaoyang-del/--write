/**
 * 百度智能云 API 鉴权工具
 *
 * 修改点：
 * 1. 从讯飞的 HMAC-SHA256 签名改为百度的 AccessToken 机制
 * 2. AccessToken 有效期 30 天，建议缓存使用
 */

// AccessToken 缓存
let cachedAccessToken: string | null = null
let tokenExpireTime: number = 0

/**
 * 获取百度 AccessToken
 *
 * @returns AccessToken 字符串
 */
export async function getBaiduAccessToken(): Promise<string> {
  // 如果缓存的 token 还未过期，直接返回
  if (cachedAccessToken && Date.now() < tokenExpireTime) {
    return cachedAccessToken
  }

  const apiKey = process.env.BAIDU_API_KEY
  const secretKey = process.env.BAIDU_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw new Error('百度 API Key 或 Secret Key 未配置')
  }

  try {
    // 百度 OAuth 2.0 获取 AccessToken
    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`获取 AccessToken 失败: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`获取 AccessToken 失败: ${data.error_description}`)
    }

    // 缓存 token，提前 5 分钟过期以避免边界情况
    cachedAccessToken = data.access_token
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000

    return cachedAccessToken
  } catch (error) {
    console.error('获取百度 AccessToken 失败:', error)
    throw error
  }
}

/**
 * 清除 AccessToken 缓存（用于测试或强制刷新）
 */
export function clearAccessTokenCache() {
  cachedAccessToken = null
  tokenExpireTime = 0
}
