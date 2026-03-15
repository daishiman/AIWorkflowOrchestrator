# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 7                                            |
| 機能名 | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日 | 2026-03-14                                   |

## 目的

Phase 6 で強化した TC-WS-01〜06 のカバレッジを計測し、プロジェクト基準（Branch 70%以上、Line/Function 80%以上）を満たすことを確認する。

## 実行タスク

- Task 7-1: カバレッジ計測コマンドを実行する
- Task 7-2: カバレッジレポートを確認し、数値を記録する
- Task 7-3: 基準充足を判定する
- Task 7-4: 未達時は Phase 6 に戻り既存TCを強化する

## 参照資料

依存Phase: Phase 5 / Phase 6

### 前Phaseの成果物

- `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-6-test-expansion.md`
- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`（TC-WS-01〜06）

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                              | 確認ポイント                                   |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| Workspace Chat Edit 仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | workspacePath ガード分岐と error code          |
| IPC 契約                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:send-with-context` request/response |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | sender 検証・workspace 境界                    |
| 品質基準                 | `.claude/rules/02-code-quality.md`                                                | Line/Branch/Function 基準                      |

### 実装参照ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`
- `apps/desktop/src/main/services/chat-edit/utils/PathValidator.ts`

## 実行手順

### Step 1: カバレッジ計測

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts --coverage
```

### Step 2: カバレッジ目標値

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 70%      | 80%      |
| Function Coverage | 80%      | 90%      |

### Step 3: 分岐マトリクス確認

| 分岐                                                 | カバーするテスト     |
| ---------------------------------------------------- | -------------------- |
| `workspacePath` truthy + string = true               | TC-WS-01, 02, 04, 05 |
| `workspacePath` truthy + string = false              | TC-WS-03, 06         |
| `isAllowedPath` = false → return `PERMISSION_DENIED` | TC-WS-02, 04, 05     |
| `isAllowedPath` = true → 継続                        | TC-WS-01             |

### Step 4: 未達時の戻り先判定

- Branch < 70% または Line/Function < 80% の場合は Phase 6 に戻る。
- 追加TCを増やす前に、TC-WS-01〜06 のアサーション不足を優先して補完する。

### Step 5: 全テストスイート確認

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/
```

## 統合テスト連携【必須】

カバレッジは単体対象で計測しつつ、全テストスイートでリグレッション 0 件を確認する。

## 多角的チェック観点（AIが判断）

| 観点     | チェック内容                                        |
| -------- | --------------------------------------------------- |
| P41      | カバレッジ集計条件の確認（関数/分岐の過小評価防止） |
| P40      | `apps/desktop` 起点でのコマンド実行                 |
| 分岐整合 | TC-ID と分岐表の 1:1 対応                           |
| 戻り条件 | 未達時の Phase 6 戻り条件が明確                     |

## 成果物

| 成果物         | パス                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| カバレッジ結果 | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/outputs/phase-7/coverage-report.md` |

## 完了条件（チェックリスト形式）

- [ ] カバレッジ計測コマンドが正常終了している
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 70%以上
- [ ] Function Coverage 80%以上
- [ ] 全テストスイート（`src/main/ipc/__tests__/`）が PASS
- [ ] 未達時の戻り判断が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| #   | タスク               | 状態     |
| --- | -------------------- | -------- |
| 7-1 | カバレッジ計測       | 実行予定 |
| 7-2 | レポート記録         | 実行予定 |
| 7-3 | 基準充足判定         | 実行予定 |
| 7-4 | 未達時のPhase 6戻り  | 条件付き |
| 7-5 | 全テストスイート確認 | 実行予定 |

## タスク100%実行確認【必須】

Phase 7 完了の定義: TC-WS-01〜06 スコープで基準を満たし、リグレッションがないこと。

## 次のPhase

Phase 8: リファクタリング
→ `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-8-refactoring.md`
