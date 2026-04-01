# Phase 13: PR作成（blocked）

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 13                                         |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |
| 状態   | blocked（ユーザー承認待ち）                |

## 目的

Phase 1〜12 の成果物が揃っていることを確認し、PR 作成に必要な情報を定義する。
**ユーザー承認が得られるまで、commit / PR 作成 / push は実行禁止。**

## 実行タスク（承認前）

- 成果物の揃いを確認する
- PR 情報のテンプレートを作成する
- 実行結果は `outputs/phase-13/` に記録する

## PR 作成前チェックリスト

### 必須条件

- [ ] Phase 10 の最終レビューが PASS している
- [ ] Phase 11 の手動テストが全シナリオ PASS している
- [ ] `outputs/phase-11/manual-test-result.md` が作成済みである
- [ ] Phase 12 のドキュメント更新が完了している
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が PASS している
- [ ] `pnpm --filter @repo/desktop exec vitest run` が PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している

## PR 情報（テンプレート）

### PR タイトル

```
fix(desktop): auth:login IPCハンドラーの非ブロッキング化 (TASK-FIX-AUTH-IPC-001)
```

### PR 説明テンプレート

```markdown
## 概要

`auth:login` IPC が 500ms のチャンネル timeout 制約内で応答するよう、ハンドラーを fire-and-forget に変更する。

## 根本原因

`authHandlers.ts` の `auth:login` ハンドラーが `startOAuthFlow()` の完了まで await しており、
OAuth フロー完了までレスポンスがブロックされていた。

## 修正内容

- `startOAuthFlow()` を await せずに起動し、即座に `{ success: true }` を返す
- ハンドラーは logging-only の `.catch()` で未処理例外を抑止する
- 成否通知は `AuthFlowOrchestrator` の `AUTH_STATE_CHANGED` を正本として継続
- `preload/ipc-utils.ts` の `CHANNEL_TIMEOUTS["auth:login"] = 500` は変更しない

## テスト

- TC-01: auth:login が 500ms 以内に応答する
- TC-02: 無効 provider が即時拒否される
- TC-03: `startOAuthFlow` が provider 引数付きで呼び出される
- TC-04: handler で `AUTH_STATE_CHANGED` を重複送信しない
- TC-05: `startOAuthFlow` が reject しても handler は success 応答を返し、ログのみ残す

## 影響範囲

- `apps/desktop/src/main/ipc/authHandlers.ts`（ハンドラーのみ）
- 既存の `AuthFlowOrchestrator` / `authSlice` の責務は維持

関連タスク: TASK-FIX-AUTH-IPC-001
```

### コミットメッセージ（承認後に使用）

```
fix(desktop): TASK-FIX-AUTH-IPC-001 auth:login IPCハンドラーの非ブロッキング化

- auth:login ハンドラーから await を削除し fire-and-forget 化
- 500ms のチャンネル timeout 制約内で即時応答する
- 失敗時は logging-only で未処理例外を抑止し、`AUTH_STATE_CHANGED` の送信は orchestrator に残す
```

## 制約事項

| 制約                   | 内容                                                           |
| ---------------------- | -------------------------------------------------------------- |
| 承認前の実行禁止       | commit / PR 作成 / push はユーザーの明示的な承認があるまで禁止 |
| `--no-verify` 禁止     | git commit に `--no-verify` を使用しない                       |
| force push 禁止        | `git push --force` を使用しない                                |
| ファイル差分の固定確認 | 変更対象は `authHandlers.ts` とテスト仕様書のみ                |

## 参照資料

| 資料名           | パス                          | 説明         |
| ---------------- | ----------------------------- | ------------ |
| 最終レビュー     | `./phase-10-final-review.md`  | リリース判定 |
| 手動テスト       | `./phase-11-manual-test.md`   | テスト結果   |
| ドキュメント更新 | `./phase-12-documentation.md` | 更新内容     |

## 成果物

| 成果物                | パス                                     | 説明                               |
| --------------------- | ---------------------------------------- | ---------------------------------- |
| local-check-result.md | `outputs/phase-13/local-check-result.md` | ローカルチェック結果（blocked 可） |
| change-summary.md     | `outputs/phase-13/change-summary.md`     | 変更概要サマリー                   |
| pr-info.md            | `outputs/phase-13/pr-info.md`            | PR 情報（タイトル・本文等）        |
| pr-creation-result.md | `outputs/phase-13/pr-creation-result.md` | PR 作成結果（承認後のみ）          |

## 完了条件

- [ ] PR 作成が **blocked** であることを明記している
- [ ] PR 作成前の必須チェックリストが定義されている
- [ ] PR テンプレートが 500ms 前提で整合している
- [ ] `outputs/phase-13/` の成果物名が明示されている
- [ ] **本Phase内の全タスクを100%実行完了**
