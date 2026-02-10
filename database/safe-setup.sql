-- ============================================
-- 安全的数据库设置脚本（避免重复创建错误）
-- ============================================

-- 1. 为 digital_humans 表添加缺失的字段
ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS xfyun_task_id TEXT;

ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS clone_type TEXT CHECK (clone_type IN ('video', 'image'));

CREATE INDEX IF NOT EXISTS idx_digital_humans_clone_type ON digital_humans(clone_type);

-- 2. 创建 video_works 表（如果不存在）
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

-- 3. 为 video_works 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_video_works_user_id ON video_works(user_id);
CREATE INDEX IF NOT EXISTS idx_video_works_avatar_id ON video_works(avatar_id);
CREATE INDEX IF NOT EXISTS idx_video_works_task_id ON video_works(task_id);
CREATE INDEX IF NOT EXISTS idx_video_works_status ON video_works(status);
CREATE INDEX IF NOT EXISTS idx_video_works_created_at ON video_works(created_at DESC);

-- 4. 启用 RLS（如果尚未启用）
ALTER TABLE video_works ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧的 RLS 策略（如果存在）
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own video works" ON video_works;
    DROP POLICY IF EXISTS "Users can insert their own video works" ON video_works;
    DROP POLICY IF EXISTS "Users can update their own video works" ON video_works;
    DROP POLICY IF EXISTS "Users can delete their own video works" ON video_works;
EXCEPTION
    WHEN undefined_object THEN
        -- 策略不存在，忽略错误
        NULL;
END $$;

-- 6. 创建新的 RLS 策略
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

-- 7. 创建或替换更新时间触发器函数
CREATE OR REPLACE FUNCTION update_video_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 删除旧触发器（如果存在）并创建新的
DROP TRIGGER IF EXISTS update_video_works_updated_at ON video_works;
CREATE TRIGGER update_video_works_updated_at
  BEFORE UPDATE ON video_works
  FOR EACH ROW
  EXECUTE FUNCTION update_video_works_updated_at();

-- ============================================
-- 完成！显示成功消息
-- ============================================
SELECT '✅ 数据库设置完成！' as status;
