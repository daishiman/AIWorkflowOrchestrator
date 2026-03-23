# UT-SC-02-002: execute() の terminal_handoff 未分岐修正

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-SC-02-002                                                             |
| 機能名     | UT-SC-02-002-execute-terminal-handoff                                    |
| ステータス | completed                                                                |
| 作成日     | 2026-03-23                                                               |
| 元タスク   | TASK-SC-02-RUNTIME-POLICY-CLOSURE                                        |
| GitHub     | [#1472](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1472) |

## 概要

`RuntimeSkillCreatorFacade.execute()` が `terminal_handoff` 判定時に早期リターンせず、認証情報がない状態で `SkillExecutor.execute()` を呼び出すセキュリティリスクを修正する。`plan()` / `improve()` と同一パターンの terminal_handoff 分岐を追加する。

## スコープ

### 含む

- `RuntimeSkillCreatorExecuteResponse` Union型の定義追加（`packages/shared/src/types/skillCreator.ts`）
- `execute()` メソッドへの `terminal_handoff` 早期リターン分岐追加
- `void decision;` パターンの除去
- 既存テストの矛盾修正と terminal_handoff テストケース追加
- `plan()` / `improve()` / `execute()` の分岐パターン統一

### 含まない

- Renderer 側 UI 変更
- IPC ハンドラの型定義変更（`creatorHandlers.ts` / `skill-creator-api.ts` — 未タスク化対象）
- RuntimePolicyResolver の内部ロジック変更
- TerminalHandoffBuilder の変更

## 受入基準

| ID   | 基準                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| AC-1 | `execute()` が `terminal_handoff` 判定時に `SkillExecutor.execute()` を呼ばない                                 |
| AC-2 | `execute()` が `terminal_handoff` 時に `{ type: "terminal_handoff", bundle: TerminalHandoffBundle }` を返却する |
| AC-3 | `RuntimeSkillCreatorExecuteResponse` Union型が定義されている                                                    |
| AC-4 | `void decision;` が除去されている                                                                               |
| AC-5 | 3メソッド（plan/improve/execute）の terminal_handoff パターンが統一されている                                   |
| AC-6 | 関連テストが全て PASS する                                                                                      |

## Phase 構成

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | completed  |
| 2     | 設計             | completed  |
| 3     | 設計レビュー     | completed  |
| 4     | テスト作成       | completed  |
| 5     | 実装             | completed  |
| 6     | テスト拡充       | completed  |
| 7     | カバレッジ確認   | completed  |
| 8     | リファクタリング | completed  |
| 9     | 品質検証         | completed  |
| 10    | 最終レビュー     | completed  |
| 11    | 手動テスト       | completed  |
| 12    | ドキュメント     | completed  |
| 13    | PR作成           | completed  |

## 参照資料

| 資料名                    | パス                                                                                 | 説明                                  |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 修正対象ファイル（execute() L93-128） |
| skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                                          | Union型追加対象（L335-369）           |
| テストファイル            | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | テスト修正対象                        |
| 元タスク仕様書            | `docs/30-workflows/unassigned-task/UT-SC-02-002.md`                                  | 元の未タスク指示書                    |
| 親タスク設計書            | `docs/30-workflows/completed-tasks/w1b-sc-runtime-policy-closure/phase-02-design.md` | plan/improve の設計パターン           |
| P62                       | `.claude/rules/06-known-pitfalls.md#P62`                                             | DEFAULT_CONFIG fallback 禁止          |
