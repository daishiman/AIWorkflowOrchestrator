# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| Phase名    | 設計レビューゲート              |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 2: 設計                   |
| 次Phase    | Phase 4: テスト設計             |
| ステータス | 完了                            |
| 作成日     | 2026-04-14                      |

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
`collaborative` モードとの整合性、タスクA依存関係の妥当性、型変更の影響範囲を重点的に確認する。

## 実行タスク

### Task 1: 設計整合性チェック（AC 対応確認）

| AC   | 設計での対応                                                             | 評価 |
| ---- | ------------------------------------------------------------------------ | ---- |
| AC-1 | `resourceLoader.loadAgent("extract-purpose")` の呼び出しが設計されている | OK   |
| AC-2 | `try/catch` + 後続フロー継続設計が明記されている                         | OK   |
| AC-3 | `loadAgent` 失敗時に `null` を返すフォールバックが設計されている         | OK   |
| AC-4 | `options.description` を `StructurePlanJson.description` に使用          | OK   |
| AC-5 | `runCollaborativeWorkflow` に変更なし、既存テストへの影響なし            | OK   |

### Task 2: collaborative モードとの整合性確認

- `runCollaborativeWorkflow` は独立して `Promise<void>` のまま変更しない
- `runCreateWorkflow` の戻り型変更は `createSkill()` 内の `case "create":` ブロックにのみ影響
- 既存の `collaborative` テストは `runCollaborativeWorkflow` のみを検証するため影響なし
- `createSkill()` のシグネチャ（`Promise<string>` 返却）は変更しないため外部 API に破壊的変更なし

### Task 3: リスク評価

| ID   | リスク                                               | 影響度 | 対策                                                            |
| ---- | ---------------------------------------------------- | ------ | --------------------------------------------------------------- |
| R-01 | `extract-purpose.md` が不在                          | 中     | `try/catch` でキャッチ → `null` 返却（フォールバック設計済み）  |
| R-02 | `plan-structure.md` が不在                           | 中     | 同上（R-01 と同じフォールバックで対応）                         |
| R-03 | `StructurePlanJson` 型が `@repo/shared/types` に不在 | 低     | SkillCreatorService.ts 内ローカル型として定義（後でshared昇格） |
| R-04 | タスクA未完了のまま `void structurePlan` が残存      | 低     | Phase 5 実装計画でタスクA完了確認を前提条件として明記           |

## ゲート判定

**判定**: PASS（MINOR 指摘あり、Phase 4 進行可）

### MINOR 指摘事項

1. `StructurePlanJson` の `purpose` フィールド: 将来の LLM 統合時に型が変わる可能性がある。
   → コメントに「将来 LLM 呼び出しに置換」と明記する

2. `void structurePlan` の暫定コード: タスクA完了前の暫定措置として技術的負債になりうる。
   → TODO コメントを付与し、タスクA完了後に接続することを明記する

## 参照資料

- `outputs/phase-2/design.md` — レビュー対象（設計書）
- `outputs/phase-1/requirements.md` — AC 確認基準
- `outputs/phase-3/review.md` — 本フェーズの詳細成果物

## 成果物

| 成果物    | パス                        |
| --------- | --------------------------- |
| review.md | `outputs/phase-3/review.md` |

## 完了条件

- [x] 全 AC（AC-1〜AC-5）が設計でカバーされていることを確認
- [x] collaborative モードへの影響がないことを確認
- [x] リスク台帳（R-01〜R-04）が作成されている
- [x] ゲート判定（PASS）が下されている

## 次 Phase

→ [Phase 4: テスト設計](./phase-4-test-creation.md)
