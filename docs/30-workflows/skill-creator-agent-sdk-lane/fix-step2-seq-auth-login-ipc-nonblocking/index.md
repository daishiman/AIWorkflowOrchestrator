# TASK-FIX-AUTH-IPC-001: auth:login IPCハンドラーの非ブロッキング化

## 概要

スキル生成ボタン押下時に `auth:login` IPC 呼び出しが 5000ms タイムアウトエラーを発生させる問題を修正する。
`authHandlers.ts` の `auth:login` ハンドラーを fire-and-forget パターンに変更し、OAuth フロー完了は既存の `onAuthStateChanged` イベントで通知する設計に切り替える。

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-FIX-AUTH-IPC-001                      |
| タイトル   | auth:login IPCハンドラーの非ブロッキング化 |
| 優先度     | high                                       |
| 複雑度     | medium                                     |
| 依存タスク | なし（独立して実行可能）                   |
| 作成日     | 2026-04-01                                 |
| ステータス | spec_created                               |

## 背景・問題

### エラー内容

```
authSlice.ts:300 [AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 5000ms
```

### 発生タイミング

スキル生成ボタン押下時に発生。

### 根本原因

`authHandlers.ts` の `auth:login` ハンドラーが `await authFlowOrchestrator.startOAuthFlow()` を呼び出しており、OAuth フロー完了まで（最大 300,000ms）レンダラーへのレスポンスをブロックする。`ipc-utils.ts` の `IPC_TIMEOUT_MS = 5000`（5秒）を超えるため、タイムアウトエラーが発生する。

### 修正方針

`auth:login` ハンドラーを fire-and-forget に変更する。OAuth フロー開始だけ行って即座に `{ success: true }` を返し、OAuth 完了通知は既存の `AUTH_STATE_CHANGED` IPC イベント経由で行う。

## スコープ

### 含むもの

- `apps/desktop/src/main/ipc/authHandlers.ts` の修正
- 修正に対応するユニットテストの作成・更新
- 既存 OAuth フローの動作確認

### 含まないもの

- `ipc-utils.ts` の `IPC_TIMEOUT_MS` 変更
- `authFlowOrchestrator` の内部実装変更
- `authSlice.ts` のレンダラー側実装変更
- OAuth プロバイダーロジックの変更

## 修正対象ファイル

| ファイル                                    | 変更内容                                         |
| ------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.ts` | `auth:login` ハンドラーを fire-and-forget に変更 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         |
| ----- | ---------------- | -------------------------------------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           |

## 参照資料

| 資料名          | パス                                           | 説明                                                            |
| --------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| authHandlers.ts | `apps/desktop/src/main/ipc/authHandlers.ts`    | 修正対象ハンドラー                                              |
| authSlice.ts    | `apps/desktop/src/renderer/store/authSlice.ts` | エラー発生箇所（L300）、AUTH_STATE_CHANGED リスナー（L395-491） |
| ipc-utils.ts    | `apps/desktop/src/main/ipc/ipc-utils.ts`       | IPC_TIMEOUT_MS = 5000 定義                                      |

## 完了定義

- `auth:login` ハンドラーが 5 秒以内にレスポンスを返す
- スキル生成ボタン押下時にタイムアウトエラーが発生しない
- OAuth フロー（認証成功・失敗両方）が `AUTH_STATE_CHANGED` で正常通知される
- 既存テストが全て PASS する
