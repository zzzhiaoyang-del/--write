-- ============================================
-- 完整的数据库设置脚本
-- 包含所有必需的表和字段
-- ============================================

-- 1. 为 digital_humans 表添加缺失的字段
ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS xfyun_task_id TEXT;

ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS clone_type TEXT CHECK (clone_type IN ('video', 'image'));

CREATE INDEX IF NOT EXISTS idx_digital_humans_clone_type ON digital_humans(clone_type);

-- 2. 创建 video_works 表（视频作品表）
CREATE TABLE IF NOT EXISTS video_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  voice TEXT NOT NULL DEFAULT 'female-1',
  speed DECIMAL(3,2) DEFAULT 1.0,
  volume DECIMAL(3,2) DEFAULT 1.0,
  pitch DECIMAL(3,2) DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  video_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 为 video_works 创建索引
CREATE INDEX IF NOT EXISTS idx_video_works_user_id ON video_works(user_id);
CREATE INDEX IF NOT EXISTS idx_video_works_avatar_id ON video_works(avatar_id);
CREATE INDEX IF NOT EXISTS idx_video_works_task_id ON video_works(task_id);
CREATE INDEX IF NOT EXISTS idx_video_works_status ON video_works(status);
CREATE INDEX IF NOT EXISTS idx_video_works_created_at ON video_works(created_at DESC);

-- 4. 启用 video_works 的 RLS (Row Level Security)
ALTER TABLE video_works ENABLE ROW LEVEL SECURITY;

-- 5. 创建 video_works 的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own video works" ON video_works;
DROP POLICY IF EXISTS "Users can insert their own video works" ON video_works;
DROP POLICY IF EXISTS "Users can update their own video works" ON video_works;
DROP POLICY IF EXISTS "Users can delete their own video works" ON video_works;

CREATE POLICY "Users can view their own video works"
  ON video_works
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video works"
  ON video_works
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video works"
  ON video_works
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video works"
  ON video_works
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. 创建 video_works 的更新时间触发器
CREATE OR REPLACE FUNCTION update_video_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_video_works_updated_at ON video_works;
CREATE TRIGGER update_video_works_updated_at
  BEFORE UPDATE ON video_works
  FOR EACH ROW
  EXECUTE FUNCTION update_video_works_updated_at();

-- ============================================
-- 验证表结构
-- ============================================

-- 验证 digital_humans 表
SELECT 'digital_humans 表字段:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'digital_humans'
ORDER BY ordinal_position;

-- 验证 video_works 表
SELECT 'video_works 表字段:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'video_works'
ORDER BY ordinal_position;

-- ============================================
-- 完成！
-- ============================================
