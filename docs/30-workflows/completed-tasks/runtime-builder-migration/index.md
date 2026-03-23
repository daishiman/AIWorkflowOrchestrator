# UT-RUNTIME-BUILDER-MIGRATION-001: buildForSurface() 統一メソッド追加

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001                           |
| Issue      | #1461                                                      |
| 由来       | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計 GAP |
| ステータス | 実装完了                                                   |
| 優先度     | high（Consumer Adapter 実装の前提）                        |
| 作成日     | 2026-03-23                                                 |

---

## 目的

`TerminalHandoffBuilder` に `buildForSurface(request, surfaceType, reason)` 統一メソッドを追加し、旧メソッドに `@deprecated` タグを付与する。

---

## Phase 一覧

| Phase | 名称             | 仕様書                      | ステータス |
| ----- | ---------------- | --------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md]   | 完了       |
| 2     | 設計             | [phase-2-design.md]         | 完了       |
| 3     | 設計レビュー     | [phase-3-design-review.md]  | PASS       |
| 4     | テスト作成       | [phase-4-test-creation.md]  | 完了       |
| 5     | 実装             | [phase-5-implementation.md] | 完了       |
| 6     | テスト拡充       | [phase-6-test-expansion.md] | 完了       |
| 7     | カバレッジ確認   | [phase-7-coverage.md]       | 完了       |
| 8     | リファクタリング | [phase-8-refactoring.md]    | 完了       |
| 9     | 品質検証         | [phase-9-quality.md]        | 完了       |
| 10    | 最終レビュー     | [phase-10-final-review.md]  | PASS       |
| 11    | 手動テスト       | [phase-11-manual-test.md]   | 完了       |
| 12    | ドキュメント     | [phase-12-documentation.md] | 完了       |
| 13    | 完了             | [phase-13-completion.md]    | 完了       |

---

## 変更対象ファイル

| ファイル                              | 変更種別 |
| ------------------------------------- | -------- |
| `runtime/TerminalHandoffBuilder.ts`   | 修正     |
| `chat-edit/TerminalHandoffBuilder.ts` | 修正     |
| `ipc/chatEditHandlers.ts`             | 修正     |
| `ipc/agentHandlers.ts`                | 修正     |
| `ipc/skillHandlers.ts`                | 修正     |
| `RuntimeSkillCreatorFacade.ts`        | 修正     |
| `TerminalHandoffBuilder.test.ts`      | 修正     |
| `llm-workspace-chat-edit.md`          | 修正     |

---

## 受入基準

- [x] AC-1: `buildForSurface()` メソッドが実装されている
- [x] AC-2: 旧メソッドに `@deprecated` が付与されている（runtime:3件、chat-edit:1件）
- [x] AC-3: unit test が 28 件作成されている（基準12件以上）
- [x] AC-4: 呼び出し元4箇所が全て移行されている
- [x] AC-5: `llm-workspace-chat-edit.md` が更新されている
- [x] AC-6: 未知 surfaceType でエラーが throw される（never型 exhaustive check）

---

## 参照資料

| 資料                       | パス                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 未タスク指示書             | `docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-MIGRATION-001.md`                                                         |
| Phase 2 設計書（親タスク） | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md`  |
| 契約マトリクス（親タスク） | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md` |
| llm-workspace-chat-edit.md | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                                  |
