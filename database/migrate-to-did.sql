-- 迁移到 D-ID API 的数据库更新脚本
-- 执行日期: 2026-02-10

-- 1. 为 digital_humans 表添加 presenter_id 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'digital_humans' AND column_name = 'presenter_id'
  ) THEN
    ALTER TABLE digital_humans ADD COLUMN presenter_id TEXT;
    COMMENT ON COLUMN digital_humans.presenter_id IS 'D-ID presenter ID（数字人ID）';
  END IF;
END $$;

-- 2. 为 video_works 表添加 presenter_id 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'video_works' AND column_name = 'presenter_id'
  ) THEN
    ALTER TABLE video_works ADD COLUMN presenter_id TEXT;
    COMMENT ON COLUMN video_works.presenter_id IS 'D-ID presenter ID（数字人ID）';
  END IF;
END $$;

-- 3. 确保 did_talk_id 字段存在（应该已经存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'digital_humans' AND column_name = 'did_talk_id'
  ) THEN
    ALTER TABLE digital_humans ADD COLUMN did_talk_id TEXT;
    COMMENT ON COLUMN digital_humans.did_talk_id IS 'D-ID talk/clip ID（任务ID）';
  END IF;
END $$;

-- 4. 为 digital_humans 表添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_digital_humans_did_talk_id ON digital_humans(did_talk_id);
CREATE INDEX IF NOT EXISTS idx_digital_humans_presenter_id ON digital_humans(presenter_id);

-- 5. 为 video_works 表添加索引
CREATE INDEX IF NOT EXISTS idx_video_works_presenter_id ON video_works(presenter_id);

-- 6. 更新表注释
COMMENT ON TABLE digital_humans IS '数字人克隆记录表（支持 D-ID API）';
COMMENT ON TABLE video_works IS '数字人视频作品表（支持 D-ID API）';

-- 7. 数据迁移说明
-- 注意：原有的 xfyun_task_id 字段保留用于向后兼容
-- 新的 D-ID 任务将使用 did_talk_id 字段
-- 如果需要清理旧数据，请手动执行以下命令（谨慎操作）：
-- UPDATE digital_humans SET xfyun_task_id = NULL WHERE clone_type IN ('image', 'video');

-- 完成
SELECT 'D-ID API 数据库迁移完成' AS status;
