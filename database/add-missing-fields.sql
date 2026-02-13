-- ============================================
-- 添加缺失的字段到 digital_humans 表
-- ============================================

-- 添加 xfyun_task_id 字段（用于存储百度/讯飞的任务 ID）
ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS xfyun_task_id TEXT;

-- 添加 clone_type 字段（用于区分克隆类型：video/image）
ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS clone_type TEXT CHECK (clone_type IN ('video', 'image'));

-- 为新字段创建索引
CREATE INDEX IF NOT EXISTS idx_digital_humans_clone_type ON digital_humans(clone_type);

-- 验证字段已添加
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'digital_humans'
  AND column_name IN ('xfyun_task_id', 'clone_type');
