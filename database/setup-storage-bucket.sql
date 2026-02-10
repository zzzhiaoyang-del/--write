-- ============================================
-- Supabase 存储桶设置脚本
-- 用于存储数字人生成的视频文件
-- ============================================

-- 1. 创建存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-videos', 'avatar-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;

-- 3. 创建新策略：允许认证用户上传
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar-videos');

-- 4. 创建新策略：允许所有人查看（因为桶是公开的）
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatar-videos');

-- 5. 创建新策略：用户可以删除自己的视频
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatar-videos' AND owner = auth.uid());

-- 6. 创建新策略：用户可以更新自己的视频
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatar-videos' AND owner = auth.uid());

-- ============================================
-- 完成！
-- ============================================
SELECT '✅ 存储桶设置完成！' as status;
