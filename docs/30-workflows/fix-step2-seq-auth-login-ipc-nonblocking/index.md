# fix-step2-seq-auth-login-ipc-nonblocking - タスク実行仕様書

## ユーザーからの元の指示

Issue #1829 (TASK-FIX-AUTH-IPC-001) の実装。
auth:login IPC チャンネルの 500ms タイムアウト制約により OAuth フローが
完了前にタイムアウトエラーを起こす問題を fire-and-forget パターンで修正する。

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-FIX-AUTH-IPC-001                        |
| タスク名     | auth-login-ipc-nonblocking                   |
| 分類         | バグ修正                                     |
| 対象機能     | auth:login IPCハンドラー（非ブロッキング化） |
| 優先度       | 高                                           |
| 見積もり規模 | 小規模                                       |
| ステータス   | 完了（Phase 1-10）/ 未実施（Phase 11-13）    |
| 作成日       | 2026-04-01                                   |

## タスク概要

### 目的

`auth:login` IPC チャンネルに設定された 500ms タイムアウト制約のため、
OAuth フロー（ブラウザリダイレクト→コールバック待機→トークン検証）が完了前に
タイムアウトエラーを発生させていた問題を修正する。

`await authFlowOrchestrator.startOAuthFlow()` を fire-and-forget パターンへ変更し、
IPC ハンドラーが OAuth フロー開始後に即座に `{ success: true }` を返すようにする。

### 問題

```
[AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 500ms
```

### 解決策

- `auth:login` は OAuth フロー開始直後に `{ success: true }` を即時返却
- OAuth 成功・失敗の最終通知は `AuthFlowOrchestrator` が `AUTH_STATE_CHANGED` イベントで担う
- invalid provider のみ即時エラー返却

### 成果物一覧

| 種別   | 成果物                                   | 配置先                                                        |
| ------ | ---------------------------------------- | ------------------------------------------------------------- |
| 機能   | authHandlers.ts（fire-and-forget化）     | `apps/desktop/src/main/ipc/authHandlers.ts`                   |
| テスト | authHandlers.test.ts（テスト更新・追加） | `apps/desktop/src/main/ipc/authHandlers.test.ts`              |
| 仕様書 | タスク仕様書（本書）                     | `docs/30-workflows/fix-step2-seq-auth-login-ipc-nonblocking/` |

## Phase一覧

| Phase | 名称               | 仕様書                       | ステータス   |
| ----- | ------------------ | ---------------------------- | ------------ |
| 1     | 要件定義           | phase-1-requirements.md      | 完了         |
| 2     | 設計               | phase-2-design.md            | 完了         |
| 3     | 設計レビューゲート | phase-3-design-review.md     | 完了（PASS） |
| 4     | テスト作成         | phase-4-test-creation.md     | 完了         |
| 5     | 実装               | phase-5-implementation.md    | 完了         |
| 6     | テスト拡充         | phase-6-test-expansion.md    | 完了         |
| 7     | カバレッジ確認     | phase-7-coverage-check.md    | 完了         |
| 8     | リファクタリング   | phase-8-refactoring.md       | 完了         |
| 9     | 品質保証           | phase-9-quality-assurance.md | 完了         |
| 10    | 最終レビューゲート | phase-10-final-review.md     | 完了（PASS） |
| 11    | 手動テスト         | phase-11-manual-test.md      | 未実施       |
| 12    | ドキュメント更新   | phase-12-documentation.md    | 未実施       |
| 13    | PR作成             | phase-13-pr-creation.md      | 未実施       |

## テスト実行コマンド

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop exec vitest run --reporter=verbose "src/main/ipc/authHandlers.test.ts"
```

結果: 54テスト PASS

## 参照ファイル

- `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md` - auth IPC 仕様
- `apps/desktop/src/main/auth/authFlowOrchestrator.ts` - OAuthフロー実装
- `apps/desktop/src/main/ipc/authHandlers.ts` - IPCハンドラー実装
