-- Phase 8: 手動テストSQLスクリプト（Drizzle Studio用）
-- CONV-04-02 - files/conversions/extractedMetadata テーブルテスト
--
-- 使用方法:
-- 1. このファイルの内容をコピー
-- 2. Drizzle Studioの「Run」ボタンをクリック（または Cmd+Enter）
-- 3. 結果を確認

-- ====================================================================
-- 重要: SQLiteの外部キー制約を有効化
-- ====================================================================
PRAGMA foreign_keys = ON;

-- ====================================================================
-- クリーンアップ（テスト前の状態にリセット）
-- ====================================================================
DELETE FROM files;
DELETE FROM conversions;
DELETE FROM extracted_metadata;

-- ====================================================================
-- テストケース1: filesテーブル挿入
-- ====================================================================
INSERT INTO files (
  id, name, path, mime_type, category, size, hash, encoding,
  last_modified, metadata, created_at, updated_at
) VALUES (
  '01TEST-FILE-001',
  'test-document.md',
  '/test/documents/test-document.md',
  'text/markdown',
  'document',
  1024,
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  'utf-8',
  1735131520,
  '{}',
  1735131520,
  1735131520
);

-- TC1確認
SELECT 'TC1: filesテーブル挿入' as test_case, 'PASS' as result;
SELECT * FROM files WHERE id = '01TEST-FILE-001';

-- ====================================================================
-- テストケース2: conversionsテーブル挿入
-- ====================================================================
INSERT INTO conversions (
  id, file_id, status, converter_id, input_hash,
  input_size, created_at, updated_at
) VALUES (
  '01TEST-CONV-001',
  '01TEST-FILE-001',
  'pending',
  'markdown-converter-v1',
  'abc123def456abc123def456abc123def456abc123def456abc123def456abc123',
  1024,
  1735131520,
  1735131520
);

-- TC2確認
SELECT 'TC2: conversionsテーブル挿入' as test_case, 'PASS' as result;
SELECT * FROM conversions WHERE id = '01TEST-CONV-001';

-- ====================================================================
-- テストケース3: extractedMetadataテーブル挿入
-- ====================================================================
INSERT INTO extracted_metadata (
  id, conversion_id, title, author, language,
  word_count, line_count, char_count, code_blocks,
  headers, links, custom,
  created_at, updated_at
) VALUES (
  '01TEST-META-001',
  '01TEST-CONV-001',
  'テストドキュメント',
  'AI Team',
  'ja',
  500,
  100,
  1500,
  3,
  '["# タイトル", "## セクション1"]',
  '["https://example.com"]',
  '{"tags": ["test"], "priority": "high"}',
  1735131520,
  1735131520
);

-- TC3確認
SELECT 'TC3: extractedMetadataテーブル挿入' as test_case, 'PASS' as result;
SELECT * FROM extracted_metadata WHERE id = '01TEST-META-001';

-- ====================================================================
-- テストケース6: CASCADE DELETE テスト
-- ====================================================================
-- 事前確認
SELECT 'TC6: CASCADE DELETE - Before DELETE' as status;
SELECT 'files count' as label, COUNT(*) as count FROM files;
SELECT 'conversions count' as label, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata count' as label, COUNT(*) as count FROM extracted_metadata;

-- filesレコードを削除（PRAGMA foreign_keys = ON なので CASCADE DELETE有効）
DELETE FROM files WHERE id = '01TEST-FILE-001';

-- 事後確認
SELECT 'TC6: CASCADE DELETE - After DELETE' as status;
SELECT 'files count' as label, COUNT(*) as count FROM files;
SELECT 'conversions count' as label, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata count' as label, COUNT(*) as count FROM extracted_metadata;

-- 結果確認（全て0件ならPASS）
SELECT CASE
  WHEN (SELECT COUNT(*) FROM conversions) = 0 AND (SELECT COUNT(*) FROM extracted_metadata) = 0
  THEN '✅ PASS: CASCADE DELETEが機能（全て削除された）'
  ELSE '❌ FAIL: CASCADE DELETEが機能していない'
END as result;

-- ====================================================================
-- テストケース8: 論理削除テスト
-- ====================================================================
-- 新しいfilesレコードを作成
INSERT INTO files (
  id, name, path, mime_type, category, size, hash, encoding,
  last_modified, metadata, created_at, updated_at
) VALUES (
  '01TEST-FILE-003',
  'soft-delete-test.md',
  '/test/soft-delete.md',
  'text/markdown',
  'document',
  512,
  'xyz123xyz123xyz123xyz123xyz123xyz123xyz123xyz123xyz123xyz123xyz123',
  'utf-8',
  1735131520,
  '{}',
  1735131520,
  1735131520
);

-- 論理削除（deletedAtを設定）
UPDATE files
SET deleted_at = 1735131600, updated_at = 1735131600
WHERE id = '01TEST-FILE-003';

-- 確認（レコードは残っているはず）
SELECT 'TC8: 論理削除テスト' as test_case;
SELECT id, name, deleted_at FROM files WHERE id = '01TEST-FILE-003';
SELECT CASE
  WHEN deleted_at IS NOT NULL THEN '✅ PASS: 論理削除成功（レコードが残存）'
  ELSE '❌ FAIL: deleted_atが設定されていない'
END as result
FROM files WHERE id = '01TEST-FILE-003';

-- ====================================================================
-- 最終クリーンアップ
-- ====================================================================
DELETE FROM files;

-- 最終確認（全て0件ならクリーンアップ成功）
SELECT 'クリーンアップ完了' as status;
SELECT 'files count' as label, COUNT(*) as count FROM files;
SELECT 'conversions count' as label, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata count' as label, COUNT(*) as count FROM extracted_metadata;
