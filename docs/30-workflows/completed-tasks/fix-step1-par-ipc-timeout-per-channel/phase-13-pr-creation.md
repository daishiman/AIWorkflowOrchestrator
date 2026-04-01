# Phase 13: PR 作成

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 13                          |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

Phase 12 までの成果を PR にまとめる。ただしこのタスクは user approval があるまで blocked とする。

## 実行タスク

- 変更サマリーを作る
- PR 本文を準備する
- ユーザー承認後にのみ PR を作成する

## 参照資料

| 資料名              | パス                                                     | 参照理由       |
| ------------------- | -------------------------------------------------------- | -------------- |
| Phase 12 成果物     | `outputs/phase-12/`                                      | PR 本文の根拠  |
| Phase 5 実装        | `phase-5-implementation.md`                              | 変更内容の要約 |
| Phase 12 compliance | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了確認       |

## 実行手順

### ステップ1: ローカルチェックを実行する

1. 型チェック: `pnpm --filter @repo/desktop typecheck`
2. lint: `pnpm --filter @repo/desktop lint`
3. テスト: `pnpm --filter @repo/desktop test:run`
4. ビルド: `pnpm --filter @repo/desktop build`

### ステップ2: 変更サマリーを作成する

1. 変更ファイルは `ipc-utils.ts` 1 ファイルと `ipc-utils.test.ts` のみであることを確認する
2. `CHANNEL_TIMEOUTS` + `getChannelTimeout` の追加と `invokeWithTimeout` の修正を 1 本の説明にまとめる
3. 後方互換性を維持していることを明記する
4. commit / PR は user approval 後のみと書く

### ステップ3: PR を作成する

1. `gh pr create` を使う
2. ただし user approval が得られた場合に限る
3. approval がない間は blocked を維持する

## PR 準備内容

### PR タイトル案

`fix(preload): IPCチャンネル別タイムアウト設定の追加 (TASK-FIX-IPC-TIMEOUT-001)`

### PR 概要案

- `ipc-utils.ts` に `CHANNEL_TIMEOUTS` マップと `getChannelTimeout` 関数を追加
- `auth:login`（500ms）〜 `skill:execute`（60000ms）のチャンネル別タイムアウトを設定
- `invokeWithTimeout` が `getChannelTimeout(channel)` を使うように変更
- `IPC_TIMEOUT_MS` デフォルト値（5000ms）を維持し後方互換性を確保

### 変更ファイル

| ファイル                                               | 変更内容                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `apps/desktop/src/preload/ipc-utils.ts`                | `CHANNEL_TIMEOUTS` / `getChannelTimeout` 追加・`invokeWithTimeout` 修正 |
| `apps/desktop/src/preload/__tests__/ipc-utils.test.ts` | テストケース T-001 〜 T-018 追加                                        |

## 成果物

| 成果物       | パス                                 | 説明               |
| ------------ | ------------------------------------ | ------------------ |
| PR 草案      | `phase-13-pr-creation.md`            | blocked 中の PR 案 |
| 変更サマリー | `outputs/phase-13/change-summary.md` | 承認後に使う要約   |

## 完了条件

- [ ] ローカルチェックの結果が揃っている
- [ ] PR 本文の下書きがある
- [ ] user approval がない限り blocked のまま維持する

## サブタスク管理

1. ローカルチェック
2. 変更サマリー作成
3. PR 下書き作成
4. approval 待機

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] approval なしで PR を作成しない
- [ ] blocked / ready の状態が明示されている
