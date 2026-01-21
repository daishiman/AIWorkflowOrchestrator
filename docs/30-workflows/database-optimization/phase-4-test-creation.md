# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 4                     |
| Phase名    | テスト作成            |
| 前提Phase  | Phase 3               |
| 後続Phase  | Phase 5               |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | database-optimization |

---

## 目的

TDDのRed段階として、スキーマ最適化の期待動作を検証するテストを実装前に作成し、全テストが失敗状態であることを確認する。

## 背景

スキーマ変更は実装の影響範囲が大きいため、事前にテストケースを明文化して期待動作を固定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト方針の策定

**目的**: テストの範囲と観点を明確化する

**実行手順**:

1. テスト対象を整理する
   - インデックス追加の有無
   - onDelete方針の動作
   - CHECK制約の検証
   - message_count運用判断に必要な性能測定
2. テストデータセットのサイズと作成方法を定義する
3. テスト方針を `outputs/phase-4/test-specification.md` に記録する

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: テストコードの作成

**目的**: スキーマ最適化の検証テストを実装する

**実行手順**:

1. `packages/shared/src/db/__tests__/chat-history-optimization.test.ts` を作成する
2. 主要テストケースを実装する
   - PRAGMA index_listでインデックス存在を確認
   - EXPLAIN QUERY PLANでIndex Scanを確認
   - 無効なrole挿入時の制約エラー確認
   - セッション削除時の孤立メッセージ検出
3. テストコードをコミット対象に含める

**期待される成果物**:

- `packages/shared/src/db/__tests__/chat-history-optimization.test.ts`

---

### タスク3: テスト実行とRed確認

**目的**: 全テストが失敗することを確認する

**実行手順**:

1. テストを実行する
   ```bash
   pnpm --filter @repo/shared test -- chat-history-optimization.test.ts
   ```
2. 期待どおり失敗していることを確認する
3. 結果を `outputs/phase-4/test-red-status.md` に記録する

**期待される成果物**:

- `outputs/phase-4/test-red-status.md`

---

## 参照資料

**システム仕様（aiworkflow-requirements）**

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                 |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| データベーススキーマ設計     | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | 既存インデックス     |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 削除・更新ルール     |
| 非機能要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | テスト方針と性能基準 |

**Phase 1-3成果物**

| 参照資料           | パス                                            | 内容         |
| ------------------ | ----------------------------------------------- | ------------ |
| 要件定義           | `outputs/phase-1/requirements-definition.md`    | 課題整理     |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`        | 判定基準     |
| スキーマ最適化設計 | `outputs/phase-2/schema-optimization-design.md` | 追加対象一覧 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`       | 指摘一覧     |

---

## 成果物

| 成果物       | パス                                                                 | 内容                   |
| ------------ | -------------------------------------------------------------------- | ---------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`                              | テスト方針とケース一覧 |
| テストコード | `packages/shared/src/db/__tests__/chat-history-optimization.test.ts` | スキーマ最適化テスト   |
| Red状態確認  | `outputs/phase-4/test-red-status.md`                                 | 失敗確認記録           |

---

## 統合テスト連携（Phase 1〜11は必須）

- インデックス追加後のクエリプラン確認を統合テストに含める
- 削除フローで孤立メッセージが発生しないことを検証する

---

## 完了条件

- [ ] テスト方針が策定されている
- [ ] テストコードが作成されている
- [ ] 全テストが失敗状態である
- [ ] 参照仕様との整合が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/shared test -- chat-history-optimization.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## Phase 4 実行記録

### 実行タスク

- タスク1: テスト方針の策定
- タスク2: テストコードの作成
- タスク3: テスト実行とRed確認

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-5-implementation.md`
