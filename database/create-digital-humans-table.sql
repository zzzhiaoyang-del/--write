-- ============================================
-- 数字人克隆功能 - 数据库表创建脚本
-- ============================================

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS digital_humans CASCADE;

-- 2. 创建 digital_humans 表
CREATE TABLE digital_humans (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 用户关联（引用 auth.users 表）
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  avatar_id TEXT NOT NULL,

  -- 视频相关
  video_url TEXT,
  result_url TEXT,

  -- 状态管理
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),

  -- D-ID API 相关
  did_talk_id TEXT,

  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引以提高查询性能
CREATE INDEX idx_digital_humans_user_id ON digital_humans(user_id);
CREATE INDEX idx_digital_humans_status ON digital_humans(status);
CREATE INDEX idx_digital_humans_created_at ON digital_humans(created_at DESC);

-- 4. 启用行级安全策略（RLS）
ALTER TABLE digital_humans ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own digital humans" ON digital_humans;
DROP POLICY IF EXISTS "Users can insert own digital humans" ON digital_humans;
DROP POLICY IF EXISTS "Users can update own digital humans" ON digital_humans;
DROP POLICY IF EXISTS "Users can delete own digital humans" ON digital_humans;

-- 6. 创建新的安全策略

-- 策略 1: 用户只能查看自己的数字人
CREATE POLICY "Users can view own digital humans"
  ON digital_humans
  FOR SELECT
  USING (auth.uid() = user_id);

-- 策略 2: 用户只能插入自己的数字人
CREATE POLICY "Users can insert own digital humans"
  ON digital_humans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略 3: 用户只能更新自己的数字人
CREATE POLICY "Users can update own digital humans"
  ON digital_humans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 策略 4: 用户只能删除自己的数字人
CREATE POLICY "Users can delete own digital humans"
  ON digital_humans
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器
DROP TRIGGER IF EXISTS update_digital_humans_updated_at ON digital_humans;
CREATE TRIGGER update_digital_humans_updated_at
  BEFORE UPDATE ON digital_humans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完成！
-- ============================================

-- 验证表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'digital_humans'
ORDER BY ordinal_position;
