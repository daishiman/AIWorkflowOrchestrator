# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 6                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

Phase 5 で定義した TC-WS-01〜06 の品質を強化し、workspacePath 制約ガードの分岐網羅を安定化する。
本タスクの正規スコープは **TC-WS-01〜06 の完遂** であり、追加ケースは必要時に未タスク化して管理する。

## 実行タスク

- Task 6-1: カバレッジ不足箇所を分析する
- Task 6-2: TC-WS-01〜06 のアサーションを強化して不足分岐を補う
- Task 6-3: テストを再実行して Green を確認する
- Task 6-4: 追加検証が必要な論点は未タスクとして切り出す

## 参照資料

依存Phase: Phase 5

### 前Phase成果物

- `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-5-implementation.md`
- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                                          | 確認ポイント                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Workspace Chat Edit 仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                | workspacePath 未指定/null/空文字時の扱い |
| LLM インターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                         | `SendWithContextRequest` 互換性          |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                             | `PERMISSION_DENIED` と runtime 分岐境界  |
| 実装履歴                 | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md` | 親タスク由来の未タスク連鎖を確認         |

### 実装参照ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`
- `apps/desktop/src/main/services/chat-edit/utils/PathValidator.ts`

## 実行手順

### Step 1: カバレッジ不足箇所の分析

`chatEditHandlers.ts` L159-173 の条件分岐を整理し、TC-WS-01〜06 に紐づける。

| 分岐                                          | カバーする既存TC     |
| --------------------------------------------- | -------------------- |
| `workspacePath` truthy + string = true        | TC-WS-01, 02, 04, 05 |
| `workspacePath` truthy + string = false       | TC-WS-03, 06         |
| `isAllowedPath` = false → `PERMISSION_DENIED` | TC-WS-02, 04, 05     |
| `isAllowedPath` = true → 継続                 | TC-WS-01             |

### Step 2: TC-WS-01〜06 のアサーションを強化

追加の TC-ID は増やさず、既存ケースに以下の検証を追加する。

- TC-WS-02/04/05: `error.code`, `error.message`, `retryable` を明示検証
- TC-WS-03/06: `isAllowedPath` 未呼び出し + `RuntimeResolver.resolve()` 呼び出し有無を検証
- TC-WS-01: 正常応答で `isAllowedPath` 引数が期待通りかを検証

### Step 3: テスト再実行

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

期待値: TC-WS-01〜06 が全 PASS。

### Step 4: スコープ外論点の切り出し

`workspacePath` 空文字・空白文字・非 string のような主スコープ外の論点は **未タスク化** する。

## 統合テスト連携【必須】

TC-WS-01〜06 は既存テストと同一の `beforeEach` / `afterEach` 構造を共有するため、状態リークの有無を再確認する。

## 多角的チェック観点（AIが判断）

| 観点     | チェック内容                                                                                  |
| -------- | --------------------------------------------------------------------------------------------- |
| P42      | 空文字/空白/非 string の扱いを今回スコープか未タスク化かで明示する                            |
| 型安全   | `workspacePath` の型境界をテスト説明と実装契約で一致させる                                    |
| 分岐網羅 | `args.workspacePath && typeof args.workspacePath === "string"` の真偽を既存TCで説明可能にする |
| P9       | `vi.clearAllMocks()` と handler unregister の徹底                                             |

## 成果物

| 成果物               | パス                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| 拡充後テストファイル | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`                |
| 論点整理メモ         | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/outputs/phase-6/test-expansion.md` |

## 完了条件（チェックリスト形式）

- [ ] TC-WS-01〜06 のアサーション強化が反映されている
- [ ] 6 テストが全て PASS すること
- [ ] `chatEditHandlers.ts` L159 の分岐説明が TC マトリクスで一貫していること
- [ ] スコープ外論点の扱い（未タスク化 or 対応不要）が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| #   | タスク                   | 状態     |
| --- | ------------------------ | -------- |
| 6-1 | カバレッジ不足箇所の分析 | 実行予定 |
| 6-2 | 既存TCのアサーション強化 | 実行予定 |
| 6-3 | テスト再実行             | 実行予定 |
| 6-4 | スコープ外論点の切り出し | 条件付き |

## タスク100%実行確認【必須】

Phase 6 完了の定義: TC-WS-01〜06 を維持したまま、分岐網羅と判定根拠が一貫していること。

## 次のPhase

Phase 7: カバレッジ確認（基準充足チェック）
→ `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-7-coverage-check.md`
