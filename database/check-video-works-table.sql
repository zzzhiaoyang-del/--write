-- 检查 video_works 表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'video_works'
) AS table_exists;

-- 如果表存在，显示表结构
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'video_works'
ORDER BY ordinal_position;

-- 检查 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'video_works';
