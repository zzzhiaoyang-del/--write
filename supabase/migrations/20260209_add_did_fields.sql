-- 添加 D-ID 集成所需的字段
-- 在 Supabase 控制台的 SQL Editor 中运行此脚本

-- 1. 添加 did_talk_id 字段（用于存储 D-ID talk ID）
ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS did_talk_id TEXT;

-- 2. 添加 result_url 字段（用于存储生成的视频URL）
ALTER TABLE digital_humans
ADD COLUMN IF NOT EXISTS result_url TEXT;

-- 3. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_digital_humans_did_talk_id
ON digital_humans(did_talk_id);

CREATE INDEX IF NOT EXISTS idx_digital_humans_status
ON digital_humans(status);

-- 4. 添加 failed 状态（如果还没有）
-- 注意：如果表已经有状态约束，可能需要先删除约束再重新创建
-- 这里假设没有约束，如果有错误，请手动在 Supabase 控制台调整

COMMENT ON COLUMN digital_humans.did_talk_id IS 'D-ID API 返回的 talk ID，用于状态轮询';
COMMENT ON COLUMN digital_humans.result_url IS 'D-ID 生成的视频URL';
