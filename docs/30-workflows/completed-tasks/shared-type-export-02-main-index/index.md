# SHARED-TYPE-EXPORT-02: @repo/shared Community型エクスポート（メインindex）

## タスク概要

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | SHARED-TYPE-EXPORT-02                               |
| タスク名     | @repo/shared Community型エクスポート（メインindex） |
| 分類         | リファクタリング                                    |
| 対象機能     | @repo/shared パッケージ                             |
| 優先度       | 高                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 完了                                                |
| 発見元       | Phase 12 (CONV-08-05)                               |
| 発見日       | 2026-01-13                                          |
| 作成日       | 2026-01-14                                          |
| 前提タスク   | SHARED-TYPE-EXPORT-01                               |
| 後続タスク   | SHARED-TYPE-EXPORT-03                               |

---

## 背景・問題点

### 背景

Part 1（SHARED-TYPE-EXPORT-01）で `services/graph/index.ts` からの型エクスポートを整理した後、パッケージのメインエントリポイント（`index.ts`）からも型をエクスポートする必要がある。

### 問題点

`apps/desktop` では以下のようにインポートしている:

```typescript
import {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";
```

しかし、`@repo/shared` のメイン `index.ts` からこれらの型がエクスポートされていない。

### 放置した場合の影響

- Part 1だけでは問題が解決しない
- パッケージ利用者が深いパスでインポートする必要がある
- `import from "@repo/shared"` が機能しない

---

## 目的・ゴール

### 目的

`@repo/shared` のメインエントリポイントからCommunity関連型をエクスポートする。

### 最終ゴール

以下のインポートが機能する状態:

```typescript
import {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";
```

---

## スコープ

### 含むもの

- `packages/shared/index.ts` の更新
- `services/graph` からの型エクスポート追加
- `types/rag/branded` からのID型エクスポート確認

### 含まないもの

- 型定義自体の変更（Part 1で完了）
- デスクトップアプリ側の修正（Part 3で実施）
- 新しいテストファイルの作成（既存テストで十分）

---

## Phase一覧

| Phase | 名称                 | ステータス | 概要                         |
| ----- | -------------------- | ---------- | ---------------------------- |
| 1     | 要件定義             | 完了       | エクスポート要件の明確化     |
| 2     | 設計                 | 完了       | エクスポート文の設計         |
| 3     | 設計レビューゲート   | 完了       | 循環参照・重複チェック       |
| 4     | テスト作成           | 完了       | 型エクスポートテスト（Red）  |
| 5     | 実装                 | 完了       | index.tsの更新（Green）      |
| 6     | テスト拡充           | 該当なし   | 型エクスポートのみのため省略 |
| 7     | テストカバレッジ確認 | 該当なし   | 型エクスポートのみのため省略 |
| 8     | リファクタリング     | 該当なし   | 型エクスポートのみのため省略 |
| 9     | 品質保証             | 完了       | 型チェック・ビルド確認       |
| 10    | 最終レビューゲート   | 完了       | 全体品質確認                 |
| 11    | 手動テスト検証       | 完了       | インポート動作確認           |
| 12    | ドキュメント更新     | 完了       | 仕様書更新・未タスク検出     |
| 13    | PR作成               | 未実施     | /ai:diff-to-pr でPR作成      |

---

## 参照資料

| 参照資料                | パス                                                                         | 内容                               |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| モノレポアーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン             |
| 元タスク指示書          | `docs/30-workflows/unassigned-task/task-shared-community-types-export-02.md` | 元のタスク要件                     |
| Part 1タスク            | SHARED-TYPE-EXPORT-01                                                        | 前提タスク                         |
| メインindex.ts          | `packages/shared/index.ts`                                                   | 更新対象ファイル                   |
| services/graph/index.ts | `packages/shared/src/services/graph/index.ts`                                | エクスポート元（Part 1で整備済み） |
| types/rag/branded.ts    | `packages/shared/src/types/rag/branded.ts`                                   | ID型定義                           |

---

## 成果物一覧

| Phase | 成果物                               | 配置先                                         |
| ----- | ------------------------------------ | ---------------------------------------------- |
| 1     | 要件定義書                           | `outputs/phase-1/requirements.md`              |
| 2     | 設計書                               | `outputs/phase-2/design.md`                    |
| 3     | 設計レビュー結果                     | `outputs/phase-3/review-result.md`             |
| 4     | テスト設計書                         | `outputs/phase-4/test-design.md`               |
| 5     | **packages/shared/index.ts（更新）** | **プロジェクトディレクトリ**                   |
| 9     | 品質検証結果                         | `outputs/phase-9/quality-report.md`            |
| 10    | 最終レビュー結果                     | `outputs/phase-10/final-review.md`             |
| 11    | 手動テスト結果                       | `outputs/phase-11/manual-test-result.md`       |
| 12    | 実装ガイド                           | `outputs/phase-12/implementation-guide.md`     |
| 12    | ドキュメント更新記録                 | `outputs/phase-12/documentation-update-log.md` |
| 12    | 未タスク検出レポート                 | `outputs/phase-12/unassigned-task-report.md`   |
| 13    | PR URL                               | GitHub PR                                      |

---

## 依存関係

```
SHARED-TYPE-EXPORT-01（Part 1: 型整理）
    ↓
SHARED-TYPE-EXPORT-02（本タスク: メインindex）
    ↓
SHARED-TYPE-EXPORT-03（Part 3: 型チェック検証）
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-14 | 初版作成 |
