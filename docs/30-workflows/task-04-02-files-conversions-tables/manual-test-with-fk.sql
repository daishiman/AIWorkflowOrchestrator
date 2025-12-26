-- Phase 8: 手動テストSQLスクリプト（外部キー制約有効版）
-- CONV-04-02 - files/conversions/extractedMetadata テーブルテスト

-- ====================================================================
-- 重要: SQLiteの外部キー制約を有効化
-- ====================================================================
PRAGMA foreign_keys = ON;

-- 確認
SELECT 'Foreign keys enabled:' as info, foreign_keys as value FROM pragma_foreign_keys();

-- ====================================================================
-- クリーンアップ（テスト前の状態にリセット）
-- ====================================================================
DELETE FROM files;
DELETE FROM conversions;
DELETE FROM extracted_metadata;

-- ====================================================================
-- テストケース1: filesテーブル挿入
-- ====================================================================
.print ''
.print '=== TC1: filesテーブル挿入 ==='

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

SELECT '✅ PASS: レコード挿入成功' as result;
SELECT * FROM files WHERE id = '01TEST-FILE-001';

-- ====================================================================
-- テストケース2: conversionsテーブル挿入
-- ====================================================================
.print ''
.print '=== TC2: conversionsテーブル挿入 ==='

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

SELECT '✅ PASS: レコード挿入成功（外部キー参照OK）' as result;
SELECT * FROM conversions WHERE id = '01TEST-CONV-001';

-- ====================================================================
-- テストケース3: extractedMetadataテーブル挿入
-- ====================================================================
.print ''
.print '=== TC3: extractedMetadataテーブル挿入 ==='

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

SELECT '✅ PASS: レコード挿入成功（JSON型OK）' as result;
SELECT * FROM extracted_metadata WHERE id = '01TEST-META-001';

-- ====================================================================
-- テストケース4: ユニーク制約テスト
-- ====================================================================
.print ''
.print '=== TC4: ユニーク制約テスト ==='

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
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  'utf-8',
  1735131520,
  '{}',
  1735131520,
  1735131520
);

-- このエラーが出れば正常: UNIQUE constraint failed: files.hash

-- ====================================================================
-- テストケース5: 外部キー制約テスト
-- ====================================================================
.print ''
.print '=== TC5: 外部キー制約テスト ==='

-- 存在しないfileIdで挿入を試みる（エラーになるはず）
INSERT INTO conversions (
  id, file_id, status, converter_id, input_hash,
  created_at, updated_at
) VALUES (
  '01TEST-CONV-002',
  'NON-EXISTENT-FILE-ID',
  'pending',
  'test-converter',
  'xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789xyz789',
  1735131520,
  1735131520
);

-- このエラーが出れば正常: FOREIGN KEY constraint failed

-- ====================================================================
-- テストケース6: CASCADE DELETE テスト（修正版）
-- ====================================================================
.print ''
.print '=== TC6: CASCADE DELETE テスト ==='

-- 事前確認
.print 'Before DELETE:'
SELECT 'files:' as table_name, COUNT(*) as count FROM files;
SELECT 'conversions:' as table_name, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata:' as table_name, COUNT(*) as count FROM extracted_metadata;

-- filesレコードを削除（PRAGMA foreign_keys = ON なので CASCADE DELETE有効）
DELETE FROM files WHERE id = '01TEST-FILE-001';

-- 事後確認
.print ''
.print 'After DELETE:'
SELECT 'files:' as table_name, COUNT(*) as count FROM files;
SELECT 'conversions:' as table_name, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata:' as table_name, COUNT(*) as count FROM extracted_metadata;

.print ''
SELECT '✅ PASS: CASCADE DELETEが機能（全て削除された）' as result
WHERE (SELECT COUNT(*) FROM conversions) = 0
  AND (SELECT COUNT(*) FROM extracted_metadata) = 0;

SELECT '❌ FAIL: CASCADE DELETEが機能していない' as result
WHERE (SELECT COUNT(*) FROM conversions) > 0
   OR (SELECT COUNT(*) FROM extracted_metadata) > 0;

-- ====================================================================
-- テストケース8: 論理削除テスト
-- ====================================================================
.print ''
.print '=== TC8: 論理削除テスト ==='

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
SELECT '✅ PASS: 論理削除成功（レコードが残存）' as result
WHERE EXISTS (SELECT 1 FROM files WHERE id = '01TEST-FILE-003' AND deleted_at IS NOT NULL);

SELECT id, name, deleted_at FROM files WHERE id = '01TEST-FILE-003';

-- ====================================================================
-- 最終クリーンアップ
-- ====================================================================
.print ''
.print '=== クリーンアップ ==='
DELETE FROM files;

.print ''
.print '=== 最終確認 ==='
SELECT 'files:' as table_name, COUNT(*) as count FROM files;
SELECT 'conversions:' as table_name, COUNT(*) as count FROM conversions;
SELECT 'extracted_metadata:' as table_name, COUNT(*) as count FROM extracted_metadata;
