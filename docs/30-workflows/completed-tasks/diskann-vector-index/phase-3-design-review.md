# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 3                    |
| Phase名    | 設計レビューゲート   |
| 前提Phase  | Phase 2              |
| 後続Phase  | Phase 4              |
| ステータス | 完了                 |
| 作成日     | 2026-01-04           |
| 完了日     | 2026-01-04           |
| 機能名     | diskann-vector-index |

---

## 目的

Phase 1（要件定義）とPhase 2（設計）の成果物をレビューし、次のPhaseに進む準備ができているかを検証する。

## 背景

TDDサイクル（Phase 4-6）に入る前に、要件と設計の妥当性を確認し、手戻りを防止する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: code-smell-detection

**パス**: `.claude/skills/code-smell-detection/SKILL.md`

**Trigger条件**: 設計の問題点を検出する必要がある場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 設計レビュー結果

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料                   | パス                                                                           | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| データベースアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/database-architecture.md`   | DB設計方針・テーブル構成       |
| データベース実装           | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM実装パターン        |
| RAGアーキテクチャ          | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`        | RAGシステム全体設計            |
| RAGインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`          | 埋め込み・検索インターフェース |

### Phase成果物

| 参照資料       | パス                                                                   | 内容                     |
| -------------- | ---------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物 | `outputs/phase-1/`                                                     | 要件定義書・受け入れ基準 |
| Phase 2 成果物 | `outputs/phase-2/`                                                     | 設計書・API仕様          |
| 元タスク仕様   | `docs/30-workflows/unassigned-task/task-04-04-diskann-vector-index.md` | 完了条件                 |

---

## 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー結果と判定 |

---

## 完了条件

- [x] 要件定義（Phase 1）のレビューが完了している
  - 機能要件の網羅性
  - 非機能要件の妥当性
  - 受け入れ基準の明確性
- [x] 設計（Phase 2）のレビューが完了している
  - スキーマ設計の妥当性
  - API設計の整合性
  - 既存システムとの互換性
- [x] レビュー結果が記録されている
- [x] 次のPhaseへの進行判定がされている

---

## 依存関係

- **前提**: Phase 1, Phase 2 が完了していること
- **後続**: Phase 4 へ進む

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## レビュー観点

### 1. 要件レビュー

- [ ] 全ての機能要件が元タスク仕様書に準拠しているか
- [ ] 非機能要件（パフォーマンス目標）が妥当か
- [ ] 依存タスク（CONV-04-03）との整合性があるか

### 2. スキーマ設計レビュー

- [ ] embeddingsテーブルが元仕様に準拠しているか
- [ ] 外部キー制約（chunks.id）が正しいか
- [ ] インデックス（chunk_id, model_id）が適切か
- [ ] タイムスタンプ処理が既存パターンと一致しているか

### 3. ベクトルインデックス設計レビュー

- [ ] VectorIndexConfigが柔軟性を持っているか
- [ ] デフォルト値（1536次元、cosine）が適切か
- [ ] libSQL仕様に準拠しているか

### 4. API設計レビュー

- [ ] VectorSearchResult/VectorSearchOptionsが必要十分か
- [ ] 3種類の検索関数が揃っているか
- [ ] Float32Array変換関数が往復変換可能か
- [ ] バッチ挿入関数が設計されているか

### 5. マイグレーション設計レビュー

- [ ] CREATE TABLE文が正しいか
- [ ] ベクトルインデックスのSQLが正しいか
- [ ] 既存マイグレーションとの整合性があるか

---

## スキルフィードバック記録

Phase完了後、使用したスキルへのフィードバックを記録してください:

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill code-smell-detection --result {{success|failure|partial}} --phase 3
```

### 記録内容

| スキル               | 結果    | 備考                                                          |
| -------------------- | ------- | ------------------------------------------------------------- |
| code-smell-detection | success | Phase 1-2の全成果物をレビュー、全観点でPASS判定、指摘事項なし |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/diskann-vector-index/phase-4-test-creation.md`
