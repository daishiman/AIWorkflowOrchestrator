# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| Phase名    | ドキュメント更新        |
| 前提Phase  | Phase 11（手動テスト）  |
| 後続Phase  | Phase 13（PR作成）      |
| ステータス | 未実施                  |
| 作成日     | 2026-01-10              |
| 機能名     | community-summarization |

---

## 目的

実装ガイド作成・システムドキュメント更新・未タスク検出を行う。

## 背景

Phase 11までで機能実装が完了したため、ドキュメントを更新し、技術的負債を可視化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（Part 1: 概念的説明）

**目的**: 中学生にもわかる概念的な説明を作成

**実行手順**:

1. コミュニティ要約の概念を説明:
   - 比喩を使った説明（例: 「地図の凡例のようなもの」）
   - なぜ必要なのかの説明
2. 全体アーキテクチャを図解:
   ```
   コミュニティ検出 → 要約生成 → 埋め込み生成 → 検索
         ↓              ↓            ↓           ↓
     Leiden        LLM呼び出し   Embedding    Vector検索
   ```
3. データフローを説明

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1セクション）

---

### タスク2: 実装ガイド作成（Part 2: 技術的詳細）

**目的**: 技術的な実装詳細を文書化

**実行手順**:

1. 各層の実装詳細を記述:
   - ICommunitySummarizer インターフェース
   - CommunitySummarizer 実装
   - プロンプト設計
   - 型定義
2. コード例と設計意図を説明:
   ```typescript
   // なぜResult型を使うのか
   async summarize(...): Promise<Result<CommunitySummary, Error>> {
     // Result型により、呼び出し側でエラーハンドリングを強制できる
   }
   ```
3. 用語集を作成:
   - CommunitySummary（コミュニティサマリー）: コミュニティの要約情報
   - Leiden Algorithm（ライデンアルゴリズム）: コミュニティ検出アルゴリズム
   - Semantic Search（セマンティックサーチ）: 意味的類似性による検索

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 2セクション）

---

### タスク3: システムドキュメント更新

**目的**: 既存ドキュメントへの反映

**実行手順**:

1. aiworkflow-requirements の更新:
   - `interfaces-rag-community-detection.md` に要約機能の参照を追加
   - `architecture-rag.md` にコミュニティ要約の説明を追加
2. 更新記録を作成:
   | 更新ファイル | 更新内容 |
   | ------------ | -------- |
   | ... | ... |
3. Single Source of Truth原則に従い、概要のみ記載

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

### タスク4: 未タスク検出

**目的**: 技術的負債の可視化と継続的改善

**実行手順**:

1. 各Phase成果物から未完了事項を検出:
   ```bash
   grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/graph/
   ```
2. レビュー結果からMINOR判定の指摘事項を抽出:
   - Phase 3レビュー結果
   - Phase 10レビュー結果
3. 手動テスト結果からスコープ外の発見事項を抽出
4. 未タスクレポートを作成

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

---

### タスク5: 未タスク指示書の作成（該当する場合）

**目的**: 検出された未タスクの指示書を作成

**実行手順**:

1. 未タスクレポートから指示書作成対象を特定
2. 各未タスクに対して指示書を作成:
   - `docs/30-workflows/unassigned-task/task-XX-YY-*.md`
3. 作成した指示書をリスト化

**期待される成果物**:

- `docs/30-workflows/unassigned-task/` 配下に未タスク指示書（該当する場合）

---

## 参照資料

| 参照資料                | パス                                                 | 内容             |
| ----------------------- | ---------------------------------------------------- | ---------------- |
| Phase 3成果物           | `outputs/phase-3/`                                   | 設計レビュー結果 |
| Phase 10成果物          | `outputs/phase-10/`                                  | 最終レビュー結果 |
| Phase 11成果物          | `outputs/phase-11/`                                  | 手動テスト結果   |
| 実装コード              | `packages/shared/src/services/graph/`                | 実装ファイル     |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/references/` | システム仕様     |

---

## 成果物

| 成果物               | パス                                           | 内容                |
| -------------------- | ---------------------------------------------- | ------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 概念説明 + 技術詳細 |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | 更新履歴            |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | 技術的負債一覧      |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`           | 該当する場合のみ    |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] 用語集が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 12ステータスを更新

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-13-pr-creation.md`
