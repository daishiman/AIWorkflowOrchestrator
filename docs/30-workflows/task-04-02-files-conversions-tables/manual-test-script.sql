-- Phase 8: 手動テストSQLスクリプト
-- CONV-04-02 - files/conversions/extractedMetadata テーブルテスト

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

-- 確認
SELECT 'TC1: filesテーブル挿入' as test_case, COUNT(*) as count FROM files;
SELECT * FROM files WHERE id = '01TEST-FILE-001';

-- ====================================================================
-- テストケース2: conversionsテーブル挿入
-- ====================================================================
INSERT INTO conversions (
  id, file_id, status, converter_id, input_hash,
  input_size, created_at, updated_at
) VALUES (
  '01TEST-CONV-001',
  '01TEST-FILE-001',  -- TC1で作成したfileId
  'pending',
  'markdown-converter-v1',
  'abc123def456abc123def456abc123def456abc123def456abc123def456abc123',
  1024,
  1735131520,
  1735131520
);

-- 確認
SELECT 'TC2: conversionsテーブル挿入' as test_case, COUNT(*) as count FROM conversions;
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
  '01TEST-CONV-001',  -- TC2で作成したconversionId
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

-- 確認
SELECT 'TC3: extractedMetadataテーブル挿入' as test_case, COUNT(*) as count FROM extracted_metadata;
SELECT * FROM extracted_metadata WHERE id = '01TEST-META-001';

-- ====================================================================
-- テストケース4: ユニーク制約テスト
-- ====================================================================
-- 同じhash値で重複挿入を試みる（エラーになるはず）
INSERT INTO files (
  id, name, path, mime_type, category, size, hash, encoding,
  last_modified, metadata, created_at, updated_at
) VALUES (
  '01TEST-FILE-002',
  'duplicate-file.md',
  '/test/duplicate.md',
  'text/markdown',
  'document',
  2048,
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',  -- 同じhash
  'utf-8',
  1735131520,
  '{}',
  1735131520,
  1735131520
);
-- 期待: UNIQUE constraint failed: files.hash エラー

-- ====================================================================
-- テストケース5: 外部キー制約テスト
-- ====================================================================
-- 存在しないfileIdで挿入を試みる（エラーになるはず）
INSERT INTO conversions (
  id, file_id, status, converter_id, input_hash,
  created_at, updated_at
) VALUES (
  '01TEST-CONV-002',
  'NON-EXISTENT-FILE-ID',  -- 存在しないfileId
  'pending',
  'test-converter',
  'xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789',
  1735131520,
  1735131520
);
-- 期待: FOREIGN KEY constraint failed エラー

-- ====================================================================
-- テストケース6: CASCADE DELETE テスト
-- ====================================================================
-- 事前確認
SELECT 'Before CASCADE DELETE' as status;
SELECT 'files count:' as label, COUNT(*) as count FROM files;
SELECT 'conversions count:' as label, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata count:' as label, COUNT(*) as count FROM extracted_metadata;

-- filesレコードを削除（関連レコードもCASCADE DELETEされるはず）
DELETE FROM files WHERE id = '01TEST-FILE-001';

-- 事後確認
SELECT 'After CASCADE DELETE' as status;
SELECT 'files count:' as label, COUNT(*) as count FROM files;
SELECT 'conversions count:' as label, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata count:' as label, COUNT(*) as count FROM extracted_metadata;
-- 期待: conversions と extracted_metadata も削除されている（count = 0）

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
-- 期待: レコードが存在し、deleted_at が設定されている

-- ====================================================================
-- クリーンアップ
-- ====================================================================
DELETE FROM files WHERE id LIKE '01TEST-%';

-- 最終確認
SELECT 'Cleanup completed' as status;
SELECT 'files count:' as label, COUNT(*) as count FROM files;
SELECT 'conversions count:' as label, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata count:' as label, COUNT(*) as count FROM extracted_metadata;
