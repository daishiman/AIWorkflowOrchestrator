# TASK-FIX-AUTH-IPC-001: auth:login IPCハンドラーの非ブロッキング化

## 概要

`auth:login` IPC は `apps/desktop/src/preload/ipc-utils.ts` の `CHANNEL_TIMEOUTS["auth:login"] = 500` により、500ms 以内の応答が前提になっている。
現行の `apps/desktop/src/main/ipc/authHandlers.ts` は `authFlowOrchestrator.startOAuthFlow(provider)` の完了まで待つため、この制約を超えてしまう。

修正方針はシンプルにする。

- `auth:login` ハンドラーは OAuth フローを開始したら待たずに `{ success: true }` を返す
- 成功・失敗の通知は既存の `AuthFlowOrchestrator` が送る `AUTH_STATE_CHANGED` を正本にする
- ハンドラー側は fire-and-forget の未処理例外だけを抑止し、通知を重複させない

- current canonical task directory: `docs/30-workflows/fix-step2-seq-auth-login-ipc-nonblocking`

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-FIX-AUTH-IPC-001              |
| タスク種別 | implementation（desktop auth IPC） |
| 優先度     | high                               |
| 複雑度     | medium                             |
| ステータス | spec_created                       |
| 依存タスク | なし                               |
| 後続タスク | なし                               |
| 作成日     | 2026-04-01                         |
| 更新日     | 2026-04-01                         |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| 真の論点             | `auth:login` が `startOAuthFlow()` の完了を待つため、500ms のチャンネル timeout を超えている |
| 依存関係・責務境界   | 変更対象は `authHandlers.ts` のみ。`AuthFlowOrchestrator` は既存の通知責務を維持する         |
| 価値とコストの不均衡 | `await` の削除だけで timeout 解消と UX 改善を両立できる                                      |
| 改善優先順位         | 1. fire-and-forget 化 2. 通知責務の重複防止 3. テストと docs の同期                          |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 高                                            |

## Step 2 判定

| 観点            | 判定   | 補足                                                                                         |
| --------------- | ------ | -------------------------------------------------------------------------------------------- |
| public IPC      | 要更新 | `auth:login` の completion semantics を「start only」に明記する                              |
| preload         | 不要   | `apps/desktop/src/preload/ipc-utils.ts` の `CHANNEL_TIMEOUTS["auth:login"] = 500` は維持する |
| state semantics | 要更新 | `AUTH_STATE_CHANGED` の送信責務は `AuthFlowOrchestrator` に固定する                          |
| lessons-learned | 要更新 | fire-and-forget + state owner 分離の教訓を追記する                                           |
| task-workflow   | 要更新 | 完了タスク / 関連タスクの記録を同期する                                                      |
| topic-map       | 要更新 | 仕様書変更に伴い `generate-index.js` で再生成する                                            |

**判定理由**:

- 仕様の形状は変わらないが、`auth:login` の応答タイミングと state ownership が public contract として重要なので Step 2 は実施する
- preload surface は変えず、`CHANNEL_TIMEOUTS["auth:login"] = 500` のままにする
- 変更内容は API / state semantics / lessons / workflow / index の同期に集中させる

## 受入基準

| ID     | 基準                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| AC-001 | `auth:login` が 500ms の timeout 制約内でレスポンスを返す                      |
| AC-002 | `auth:login` は `startOAuthFlow()` の完了を待たずに `{ success: true }` を返す |
| AC-003 | 成功・失敗の `AUTH_STATE_CHANGED` は既存の `AuthFlowOrchestrator` が維持する   |
| AC-004 | `authHandlers.ts` 側で `AUTH_STATE_CHANGED` を重複送信しない                   |
| AC-005 | 既存の `authSlice` listener と互換性を保つ                                     |
| AC-006 | 既存テストが regress しない                                                    |

## スコープ

**含む**:

- `apps/desktop/src/main/ipc/authHandlers.ts` の fire-and-forget 化
- `apps/desktop/src/main/ipc/authHandlers.test.ts` の更新
- `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` の回帰確認

**含まない**:

- `apps/desktop/src/preload/ipc-utils.ts` の timeout 値変更
- `apps/desktop/src/renderer/store/slices/authSlice.ts` の listener 変更
- `AuthFlowOrchestrator` の success/failure 通知ロジックの変更
- commit / PR / push

## 依存関係

| 種別      | 参照先                                                | 役割                      |
| --------- | ----------------------------------------------------- | ------------------------- |
| canonical | `apps/desktop/src/main/ipc/authHandlers.ts`           | 修正対象                  |
| canonical | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | 既存通知責務の正本        |
| canonical | `apps/desktop/src/preload/ipc-utils.ts`               | `auth:login=500ms` の根拠 |
| canonical | `apps/desktop/src/renderer/store/slices/authSlice.ts` | 受信側 listener           |
| canonical | `.claude/skills/task-specification-creator/SKILL.md`  | 仕様書テンプレートの正本  |
| canonical | `.claude/skills/aiworkflow-requirements/SKILL.md`     | system spec の正本        |

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
