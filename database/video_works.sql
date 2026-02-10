-- 创建视频作品表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_video_works_user_id ON video_works(user_id);
CREATE INDEX IF NOT EXISTS idx_video_works_avatar_id ON video_works(avatar_id);
CREATE INDEX IF NOT EXISTS idx_video_works_task_id ON video_works(task_id);
CREATE INDEX IF NOT EXISTS idx_video_works_status ON video_works(status);
CREATE INDEX IF NOT EXISTS idx_video_works_created_at ON video_works(created_at DESC);

-- 启用 RLS (Row Level Security)
ALTER TABLE video_works ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能访问自己的作品
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

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_video_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_works_updated_at
  BEFORE UPDATE ON video_works
  FOR EACH ROW
  EXECUTE FUNCTION update_video_works_updated_at();
