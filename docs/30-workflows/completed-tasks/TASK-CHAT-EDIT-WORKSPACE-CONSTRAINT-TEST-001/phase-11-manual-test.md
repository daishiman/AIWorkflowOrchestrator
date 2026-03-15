# Phase 11: 手動テスト検証

## メタ情報

| 項目          | 値                                           |
| ------------- | -------------------------------------------- |
| Phase         | 11                                           |
| 機能名        | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日        | 2026-03-14                                   |
| 前Phase成果物 | outputs/phase-10/final-review-report.md      |
| 成果物        | outputs/phase-11/manual-test-result.md       |

## 目的

`chatEditHandlers.ts` の workspacePath 制約ガードに対して追加した TC-WS-01〜06 テストが
正常に通過し、既存テストへの影響がないことを確認する。

本タスクはテストコード追加中心だが、ユーザー要求（画面検証を実施）に従い、
関連 UI の代表状態をスクリーンショットで再確認する。

## 実行タスク

| #    | タスク                 | 目的                                                       |
| ---- | ---------------------- | ---------------------------------------------------------- |
| 11-1 | 新規テストの実行確認   | TC-WS-01〜06 が全て PASS すること                          |
| 11-2 | 既存テストへの影響確認 | 既存 chatEditHandlers 系テストへリグレッションがないこと   |
| 11-3 | カバレッジ確認         | workspacePath 制約ガードのブランチカバレッジ充足           |
| 11-4 | 画面証跡確認           | workspace chat edit の代表状態を screenshot で検証すること |

- Task 11-1: 新規テストを実行し、TC-WS-01〜06 の全 PASS を確認する
- Task 11-2: 既存テストへの影響を確認し、リグレッション 0 件を確認する
- Task 11-3: カバレッジを確認し、基準値以上を満たす
- Task 11-4: current build から representative screenshot を取得し、証跡を保存する

## 参照資料

依存Phase: Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 10

### 前Phase成果物

- `outputs/phase-10/final-review-report.md` — 最終レビュー結果

### システム仕様（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` — IPC セキュリティ原則
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` — `chat-edit:*` IPC 契約
- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` — workspacePath 境界検証仕様
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md` — 親タスクと関連未タスクの追跡

### テスト対象ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts` — 実装本体
- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` — 新規テスト

## 実行手順

### Task 11-1: 新規テストの実行確認

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

期待結果:

| TC       | テストケース              | 期待                     |
| -------- | ------------------------- | ------------------------ |
| TC-WS-01 | workspace 内ファイル      | success: true            |
| TC-WS-02 | workspace 外ファイル      | PERMISSION_DENIED        |
| TC-WS-03 | workspacePath 未指定      | isAllowedPath 未呼び出し |
| TC-WS-04 | パストラバーサル攻撃      | PERMISSION_DENIED        |
| TC-WS-05 | 複数コンテキスト（1つ外） | PERMISSION_DENIED        |
| TC-WS-06 | 空コンテキスト配列        | isAllowedPath 未呼び出し |

### Task 11-2: 既存テストへの影響確認

```bash
cd apps/desktop && pnpm exec vitest run \
  src/main/ipc/__tests__/chatEditHandlers.selection.test.ts \
  src/main/ipc/__tests__/chatEditHandlers.security.test.ts \
  src/main/ipc/__tests__/chatEditHandlers.test.ts \
  src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

期待結果: 4 files / 44 tests PASS（既存 chatEditHandlers 系のリグレッションなし）

### Task 11-3: カバレッジ確認

```bash
cd apps/desktop && pnpm exec vitest run --coverage src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

カバレッジ基準:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 11-4: 画面証跡（スクリーンショット）確認

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop exec node scripts/capture-task-ai-runtime-chat-edit-phase11.mjs
```

期待結果:

- `outputs/phase-11/screenshots/TC-11-01..05-*.png` が生成される
- `outputs/phase-11/screenshots/workspace-chat-edit-screenshot-metadata.json` が生成される
- 本 workflow 配下へ証跡を配置し、`manual-test-result.md` と同期する

## 統合テスト連携【必須】

本タスクはバックエンド/テスト中心だが、今回の再監査ではユーザー要求により画面検証を実施した。
そのため以下の方針で手動テストを実施する:

- Electron アプリの手動起動: **実施**（current build を用いた capture）
- スクリーンショット取得: **実施**（TC-11-01〜05）
- DevTools 確認: **任意**（本タスクでは screenshot + automated tests で判定）

## 画面カバレッジマトリクス

| テストケース | 状態                      | 証跡                                                                                                 |
| ------------ | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| TC-WS-01     | workspace 内ファイル PASS | `screenshots/TC-11-01-chat-edit-selection.png`, `screenshots/TC-11-02-chat-edit-generating.png`      |
| TC-WS-02     | workspace 外ファイル拒否  | `screenshots/TC-11-05-chat-edit-blocked.png`                                                         |
| TC-WS-03     | workspacePath 未指定      | `screenshots/TC-11-01-chat-edit-selection.png`（補助: NON_VISUAL で `isAllowedPath` 未呼び出し確認） |
| TC-WS-04     | パストラバーサル拒否      | `screenshots/TC-11-03-chat-edit-diff-preview.png`                                                    |
| TC-WS-05     | 複数 context 部分拒否     | `screenshots/TC-11-04-chat-edit-handoff.png`                                                         |
| TC-WS-06     | 空配列 context            | `screenshots/TC-11-02-chat-edit-generating.png`（補助: NON_VISUAL で空配列入力の正常完了確認）       |

## 多角的チェック観点（AI が判断）

| 観点           | チェック内容                                                          |
| -------------- | --------------------------------------------------------------------- |
| セキュリティ   | パストラバーサル攻撃（TC-WS-04）が PERMISSION_DENIED で拒否されること |
| 境界値         | workspacePath 未指定・空配列でガードがバイパスされないこと            |
| リグレッション | 既存の chatEditHandlers テストが PASS のままであること                |
| カバレッジ     | ブランチカバレッジが基準を満たしていること                            |

## 成果物

- `outputs/phase-11/manual-test-result.md` — テスト実行結果レポート

## 完了条件

- [x] TC-WS-01〜06 が全て PASS していること
- [x] 既存テストへのリグレッションがないこと（chatEditHandlers 系 44 tests PASS）
- [x] カバレッジ基準（Line 80%以上、Branch 60%以上）を満たしていること
- [x] `outputs/phase-11/screenshots/` 配下に screenshot 証跡が配置されていること
- [x] `outputs/phase-11/manual-test-result.md` に実行結果が記録されていること
- [x] 本 Phase 内の全タスクを 100% 実行完了していること

## サブタスク管理

| ID   | タスク                 | 状態      |
| ---- | ---------------------- | --------- |
| 11-1 | 新規テストの実行確認   | completed |
| 11-2 | 既存テストへの影響確認 | completed |
| 11-3 | カバレッジ確認         | completed |
| 11-4 | 画面証跡確認           | completed |

## タスク 100% 実行確認【必須】

Phase 11 完了前に以下を確認すること:

- [x] Task 11-1: 新規テスト実行 → 全 PASS 確認
- [x] Task 11-2: 既存テスト（chatEditHandlers系） → 全 PASS 確認
- [x] Task 11-3: カバレッジ → 基準充足確認
- [x] Task 11-4: 画面証跡（TC-11-01〜05）取得・配置確認
- [x] 成果物ファイル `outputs/phase-11/manual-test-result.md` が作成されていること

## 次の Phase

Phase 12: ドキュメント更新 (`phase-12-documentation.md`)
