-- ============================================================
-- avatars Storage バケット作成
-- ============================================================
-- 作成日: 2025-12-10
-- 目的: ユーザーアバター画像の保存
-- ============================================================

-- 既存のポリシーを削除（冪等性のため）
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;

-- avatarsバケットを作成（公開バケット）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLSポリシー
-- ============================================================

-- アップロードポリシー（認証ユーザーは自分のフォルダにアップロード可能）
-- フォルダ構造: avatars/{user_id}/filename.jpg
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 読み取りポリシー（全員が閲覧可能 - 公開バケット）
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 更新ポリシー（自分のアバターのみ更新可能）
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 削除ポリシー（自分のアバターのみ削除可能）
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
