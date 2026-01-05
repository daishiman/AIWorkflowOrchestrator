# Phase 8: 手動テスト実施ガイド

**タスクID**: CONV-04-02
**フェーズ**: Phase 8 - 手動テスト検証
**作成日**: 2025-12-25

---

## 📋 テスト概要

自動テストでは検証できない実環境でのデータベーススキーマ動作を手動で確認します。

### テスト対象

- **スキーマファイル**: files.ts, conversions.ts, extracted-metadata.ts, relations.ts
- **マイグレーション**: `0003_create_files_conversions_tables.sql`
- **テストツール**: Drizzle Studio

---

## 🔧 事前準備

### 1. ビルドとマイグレーション準備

```bash
# Worktreeディレクトリに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20251225-183416/packages/shared

# TypeScriptビルド
pnpm build

# Drizzle Studioインストール確認
pnpm list drizzle-kit
```

### 2. テスト用データベース準備

```bash
# テスト用の一時的なSQLiteデータベースを作成
export DATABASE_URL="file:./test.db"

# または既存のDBを使用する場合
# export DATABASE_URL="file:../../apps/desktop/local.db"
```

### 3. マイグレーション実行

```bash
# マイグレーション生成確認
pnpm db:generate

# マイグレーション適用
pnpm db:migrate

# 結果確認
ls -la drizzle/migrations/
```

---

## 🧪 テストケース詳細

### テストケース1: filesテーブル挿入

**目的**: filesテーブルに正常にレコードを挿入できるか確認

**前提条件**:

- マイグレーション実行済み
- Drizzle Studio起動済み

**実行手順**:

1. Drizzle Studioで `files` テーブルを開く
2. 「Add Row」ボタンをクリック
3. 以下の値を入力:
   ```
   id: 01JGXXX... (自動生成されたULID)
   name: test-document.md
   path: /test/documents/test-document.md
   mimeType: text/markdown
   category: document
   size: 1024
   hash: a1b2c3d4e5f6... (64文字のSHA-256ハッシュ)
   encoding: utf-8
   lastModified: (現在時刻のUnixタイムスタンプ)
   metadata: {}
   createdAt: (自動生成)
   updatedAt: (自動生成)
   deletedAt: (NULL)
   ```
4. 「Save」をクリック

**期待結果**:

- ✅ レコードが正常に挿入される
- ✅ idが自動生成される
- ✅ createdAt, updatedAtが自動設定される

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース2: conversionsテーブル挿入

**目的**: conversionsテーブルに正常にレコードを挿入できるか確認

**前提条件**:

- filesテーブルにレコードが存在する

**実行手順**:

1. Drizzle Studioで `conversions` テーブルを開く
2. 「Add Row」ボタンをクリック
3. 以下の値を入力:
   ```
   id: 01JGYYY... (自動生成されたULID)
   fileId: (テストケース1で作成したfilesのid)
   status: pending
   converterId: markdown-converter-v1
   inputHash: abc123... (64文字のSHA-256ハッシュ)
   outputHash: (NULL)
   duration: (NULL)
   inputSize: 1024
   outputSize: (NULL)
   error: (NULL)
   errorDetails: (NULL)
   createdAt: (自動生成)
   updatedAt: (自動生成)
   ```
4. 「Save」をクリック

**期待結果**:

- ✅ レコードが正常に挿入される
- ✅ 外部キー制約が機能している

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース3: extractedMetadataテーブル挿入

**目的**: extractedMetadataテーブルに正常にレコードを挿入できるか確認

**前提条件**:

- conversionsテーブルにレコードが存在する

**実行手順**:

1. Drizzle Studioで `extracted_metadata` テーブルを開く
2. 「Add Row」ボタンをクリック
3. 以下の値を入力:
   ```
   id: 01JGZZZ... (自動生成されたULID)
   conversionId: (テストケース2で作成したconversionsのid)
   title: テストドキュメント
   author: AI Team
   language: ja
   wordCount: 500
   lineCount: 100
   charCount: 1500
   codeBlocks: 3
   headers: ["# タイトル", "## セクション1"]
   links: ["https://example.com"]
   custom: {"tags": ["test"]}
   createdAt: (自動生成)
   updatedAt: (自動生成)
   ```
4. 「Save」をクリック

**期待結果**:

- ✅ レコードが正常に挿入される
- ✅ JSON型カラム（headers, links, custom）が正しく格納される

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース4: ユニーク制約

**目的**: filesテーブルのhashカラムのユニーク制約が機能するか確認

**前提条件**:

- filesテーブルにレコードが存在する

**実行手順**:

1. テストケース1と同じhash値を持つ別のfilesレコードを挿入しようとする
2. 「Save」をクリック

**期待結果**:

- ✅ エラーメッセージが表示される
- ✅ "UNIQUE constraint failed: files.hash" のようなエラー

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース5: 外部キー制約

**目的**: conversionsテーブルの外部キー制約が機能するか確認

**前提条件**:

- なし

**実行手順**:

1. 存在しないfileIdを持つconversionsレコードを挿入しようとする
   ```
   fileId: 99999999-non-existent-id
   ```
2. 「Save」をクリック

**期待結果**:

- ✅ エラーメッセージが表示される
- ✅ "FOREIGN KEY constraint failed" のようなエラー

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース6: CASCADE DELETE

**目的**: filesレコード削除時に関連レコードも削除されるか確認

**前提条件**:

- files → conversions → extractedMetadata の関連レコードが存在する

**実行手順**:

1. テストケース1で作成したfilesレコードのIDをメモ
2. 関連するconversionsレコードのIDをメモ
3. 関連するextractedMetadataレコードのIDをメモ
4. filesレコードを削除
5. conversionsテーブルとextractedMetadataテーブルを確認

**期待結果**:

- ✅ filesレコードが削除される
- ✅ 関連conversionsレコードも自動削除される
- ✅ 関連extractedMetadataレコードも自動削除される

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース7: JOINクエリ

**目的**: Drizzle ORMのリレーション定義が正しく機能するか確認

**前提条件**:

- 関連レコードが存在する

**実行手順**:

1. Drizzle Studioのクエリエディタまたはコンソールで以下を実行:

   ```typescript
   import { db } from "./src/db/client";
   import { files } from "./src/db/schema/files";
   import { conversions } from "./src/db/schema/conversions";
   import { eq } from "drizzle-orm";

   // ファイルと変換履歴をJOIN
   const result = await db.query.files.findFirst({
     where: eq(files.id, "test-file-id"),
     with: {
       conversions: true,
     },
   });

   console.log(result);
   ```

2. 結果を確認

**期待結果**:

- ✅ filesとconversionsが正しくJOINされる
- ✅ conversions配列にレコードが含まれる

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

### テストケース8: 論理削除

**目的**: deletedAtカラムによる論理削除が機能するか確認

**前提条件**:

- filesテーブルにレコードが存在する

**実行手順**:

1. filesレコードのdeletedAtフィールドを編集
2. 現在のUnixタイムスタンプを設定
3. 「Save」をクリック
4. レコードが残っていることを確認

**期待結果**:

- ✅ deletedAtが設定される
- ✅ レコードは物理的に削除されない
- ✅ アプリケーション層でのフィルタリングが必要

**実行結果**: [ ] PASS / [ ] FAIL

**備考**:

---

## 🚀 Drizzle Studio起動方法

### 方法1: package.jsonスクリプト

```bash
cd packages/shared
pnpm db:studio
```

### 方法2: 直接起動

```bash
npx drizzle-kit studio
```

### アクセス

ブラウザで以下にアクセス:

- URL: https://local.drizzle.studio
- または表示されるローカルURL

---

## 📝 テスト結果記録

### 実施者情報

| 項目         | 内容 |
| ------------ | ---- |
| 実施者       |      |
| 実施日時     |      |
| 環境         |      |
| データベース |      |

### テスト結果サマリー

| テストケース               | 結果                | 備考 |
| -------------------------- | ------------------- | ---- |
| TC1: files挿入             | [ ] PASS / [ ] FAIL |      |
| TC2: conversions挿入       | [ ] PASS / [ ] FAIL |      |
| TC3: extractedMetadata挿入 | [ ] PASS / [ ] FAIL |      |
| TC4: ユニーク制約          | [ ] PASS / [ ] FAIL |      |
| TC5: 外部キー制約          | [ ] PASS / [ ] FAIL |      |
| TC6: CASCADE DELETE        | [ ] PASS / [ ] FAIL |      |
| TC7: JOINクエリ            | [ ] PASS / [ ] FAIL |      |
| TC8: 論理削除              | [ ] PASS / [ ] FAIL |      |

### 総合判定

- [ ] **合格**: 全テストケースPASS
- [ ] **不合格**: 1件以上のFAILあり

### 検出された問題

| No  | テストケース | 問題内容 | 重要度 | 対応方針 |
| --- | ------------ | -------- | ------ | -------- |
|     |              |          |        |          |

---

## 📄 成果物

このガイドに基づいてテストを実施し、結果を以下のファイルに記録してください：

**`task-step08-manual-test-results.md`**

---

## ✅ 完了条件

- [ ] 全テストケース（8件）を実施
- [ ] 全テストケースがPASS
- [ ] テスト結果を記録
- [ ] 問題があれば修正または記録

---

**作成者**: Claude Sonnet 4.5
**レビュー**: 未実施
**承認**: 未実施
