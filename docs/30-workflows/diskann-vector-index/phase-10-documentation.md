# Phase 10: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 10                   |
| Phase名    | ドキュメント更新     |
| 前提Phase  | Phase 9              |
| 後続Phase  | Phase 11             |
| ステータス | 未実施               |
| 作成日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

実装内容に基づいてドキュメントを更新し、仕様書・APIドキュメントを最新状態に保つ。

## 背景

実装完了後、ドキュメントを更新することで、他の開発者やユーザーが機能を理解・利用できるようにする。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: api-documentation-best-practices

**パス**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**Trigger条件**: APIドキュメント更新が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- APIドキュメント更新

---

## 参照資料

| 参照資料       | パス                      | 内容            |
| -------------- | ------------------------- | --------------- |
| Phase 1 成果物 | `outputs/phase-1/`        | 要件定義書      |
| Phase 2 成果物 | `outputs/phase-2/`        | 設計書・API仕様 |
| Phase 5 成果物 | `outputs/phase-5/`        | 実装サマリー    |
| 実装コード     | `packages/shared/src/db/` | 全実装ファイル  |

---

## 成果物

| 成果物               | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| ドキュメント更新記録 | `outputs/phase-10/documentation-update-log.md` | 更新内容の記録 |

---

## 完了条件

- [ ] APIドキュメントが更新されている
- [ ] 使用例が記載されている
- [ ] 型定義が文書化されている
- [ ] マイグレーションガイドが作成されている
- [ ] README（該当する場合）が更新されている

---

## 依存関係

- **前提**: Phase 1, 2, 5 が完了していること
- **後続**: Phase 11 へ進む

---

## ドキュメント更新項目

### 1. APIドキュメント

#### embeddingsスキーマ

````typescript
/**
 * 埋め込みテーブルスキーマ
 *
 * @description
 * チャンクに対するベクトル埋め込みを保存するテーブル。
 * libSQLのDiskANNベクトルインデックスを使用した高速な類似度検索をサポート。
 *
 * @example
 * ```typescript
 * import { embeddings } from '@repo/shared/db/schema';
 * ```
 */
````

#### ベクトル検索関数

````typescript
/**
 * コサイン類似度によるベクトル検索
 *
 * @param db - LibSQLデータベースインスタンス
 * @param queryVector - クエリベクトル（Float32Array）
 * @param options - 検索オプション
 * @returns 類似度順でソートされた検索結果
 *
 * @example
 * ```typescript
 * const results = await searchByVector(db, queryVector, {
 *   limit: 10,
 *   minSimilarity: 0.7,
 * });
 * ```
 */
````

### 2. 使用例

- [ ] 基本的な埋め込み挿入の例
- [ ] バッチ挿入の例
- [ ] 各種検索メソッドの例
- [ ] フィルタリングオプションの例

### 3. 型定義ドキュメント

- [ ] VectorIndexConfig
- [ ] VectorSearchResult
- [ ] VectorSearchOptions

### 4. マイグレーションガイド

- [ ] マイグレーション実行手順
- [ ] ロールバック手順
- [ ] トラブルシューティング

### 5. 更新が必要なドキュメント

| ドキュメント                | 更新内容                         |
| --------------------------- | -------------------------------- |
| `docs/00-requirements/`     | ベクトル検索仕様の反映           |
| `packages/shared/README.md` | 新機能の説明追加（該当する場合） |
| JSDocs                      | 全パブリック関数にコメント追加   |

---

## システム仕様更新フロー（aiworkflow-requirements）

実装によりシステム仕様に変更が必要な場合、以下の手順で更新を行ってください。

### 更新判定

| 変更種別         | 更新対象                                                              |
| ---------------- | --------------------------------------------------------------------- |
| データベース     | `.claude/skills/aiworkflow-requirements/references/database-*.md`     |
| API              | `.claude/skills/aiworkflow-requirements/references/api-*.md`          |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`   |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md` |

### 今回の更新対象（該当する場合）

- [ ] `database-architecture.md` - embeddingsテーブル追加
- [ ] `database-implementation.md` - ベクトル検索実装パターン追加
- [ ] `interfaces-rag.md` - VectorSearch関連インターフェース追加
- [ ] `architecture-rag.md` - DiskANNインデックス構成追加

### 更新手順

```bash
# 1. 該当ファイルを編集
# .claude/skills/aiworkflow-requirements/references/{{該当ファイル}}.md

# 2. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs

# 3. 変更履歴に追記（該当ファイル内のChangelogセクション）
```

### 参照

- See [spec-update-workflow.md](../../.claude/skills/task-specification-creator/references/spec-update-workflow.md)

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill api-documentation-best-practices --result {{success|failure|partial}} --phase 10

# Phase 1〜9で使用した全スキルのフィードバックを集計
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --workflow docs/30-workflows/diskann-vector-index --summary
```

### 記録内容

| スキル                           | 結果 | 備考 |
| -------------------------------- | ---- | ---- |
| api-documentation-best-practices |      |      |

### Phase 1〜9 使用スキルサマリー

| Phase | スキル                                                 | 結果 |
| ----- | ------------------------------------------------------ | ---- |
| 1     | acceptance-criteria-writing, functional-non-functional |      |
| 2     | schema-def, api-documentation-best-practices           |      |
| 3     | code-smell-detection                                   |      |
| 4     | tdd-principles, test-doubles                           |      |
| 5     | tdd-principles, type-safety-patterns                   |      |
| 6     | refactoring-patterns, clean-code-practices             |      |
| 7     | code-quality, security-config-review, performance      |      |
| 8     | code-smell-detection                                   |      |
| 9     | manual-testing                                         |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-11-pr-creation.md`
