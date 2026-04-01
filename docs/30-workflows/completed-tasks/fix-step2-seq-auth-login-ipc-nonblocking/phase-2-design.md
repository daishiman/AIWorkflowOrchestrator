# Phase 2: 設計

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 2                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

`auth:login` IPC ハンドラーを fire-and-forget に変更し、500ms の timeout 制約内で即時レスポンスする設計を定義する。
成功・失敗の通知は既存の `AuthFlowOrchestrator` が送る `AUTH_STATE_CHANGED` を正本とし、handler 側で重複送信しない。

## 実行タスク

- 現行実装の blocking point を確認する
- fire-and-forget の責務境界を決める
- 既存の `AUTH_STATE_CHANGED` 通知を維持したまま handler を非同期起動へ変更する
- 30種の思考法を使って代替案を比較し、最小複雑性の設計を選ぶ

## 現在の実装（問題のある設計）

```typescript
// authHandlers.ts - 現在（問題あり）
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }) => {
    await authFlowOrchestrator.startOAuthFlow(provider); // ← OAuth 完了まで待つ
    return { success: true };
  },
);
```

### 問題点

- `await authFlowOrchestrator.startOAuthFlow(provider)` が OAuth フロー完了まで待機する
- `auth:login` の timeout は 500ms のため、完了待ちをすると簡単に超過する
- レンダラーは `IPC timeout: auth:login did not respond within 500ms` を受ける
- `AUTH_STATE_CHANGED` の通知責務が handler と orchestrator に分散すると、二重送信の危険がある

## 修正後の設計（fire-and-forget）

```typescript
// authHandlers.ts - 修正後
registerValidatedAuthHandler(
  IPC_CHANNELS.AUTH_LOGIN,
  async (_event, { provider }) => {
    if (!isValidProvider(provider)) {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.INVALID_PROVIDER,
          message: `Invalid provider: ${provider}. Must be one of: google, github, discord`,
        },
      };
    }

    // fire-and-forget: OAuth フロー開始のみ行い、完了通知は AuthFlowOrchestrator に任せる
    void authFlowOrchestrator!
      .startOAuthFlow(provider as OAuthProvider)
      .catch((error) => {
        console.error(
          "[AuthHandlers] auth:login fire-and-forget failed:",
          sanitizeErrorMessage(error),
        );
      });

    return { success: true };
  },
);
```

### 設計の要点

- `await` を除去し、`startOAuthFlow()` を非同期で起動する
- ハンドラーは start 直後に `{ success: true }` を返す
- OAuth の成功・失敗通知は `AuthFlowOrchestrator` が送る `AUTH_STATE_CHANGED` に一本化する
- ハンドラー側の `.catch()` は unhandled rejection の抑止とログ出力のみに使う
- `authHandlers.ts` は `AUTH_STATE_CHANGED` を送らない。state ownership は `AuthFlowOrchestrator` に残す
- `auth:login` の timeout 値は変更しない。設計を timeout に合わせる

## 30種の思考法適用

| カテゴリ     | 思考法                                                               | このタスクでの使い方                                                  |
| ------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 論理分析系   | 批判的思考, 演繹思考, 帰納的思考, アブダクション, 垂直思考           | 根本原因が await であることを証明し、timeout 超過を論理的に切り分ける |
| 構造分解系   | 要素分解, MECE, 2軸思考, プロセス思考                                | handler / orchestrator / renderer / preload を責務単位で分解する      |
| メタ・抽象系 | メタ思考, 抽象化思考, ダブル・ループ思考                             | 「timeout を延ばす」ではなく「責務を分ける」前提へ再定義する          |
| 発想・拡張系 | ブレインストーミング, 水平思考, 逆説思考, 類推思考, if思考, 素人思考 | 代替案を広く出し、素朴な「待たない」案が最小複雑性と確認する          |
| システム系   | システム思考, 因果関係分析, 因果ループ                               | handler → orchestrator → renderer の因果とフィードバックを閉じる      |
| 戦略・価値系 | トレードオン思考, プラスサム思考, 価値提案思考, 戦略的思考           | 変更量を最小にしつつ UX と保守性の両方を上げる                        |
| 問題解決系   | why思考, 改善思考, 仮説思考, 論点思考, KJ法                          | 何が詰まっているか、何を変えずに済むかを整理する                      |

## シーケンス図

### 修正前（ブロッキング）

```
Renderer           Main Process         OAuthFlow
   |                    |                    |
   |--- auth:login ---->|                    |
   |                    |-- startOAuthFlow ->|
   |                    |   (OAuth完了まで待機)|
   |                    |<-- completed ------|
   |<-- response ------|                    |
   ↑ 500ms 以内に返らない → タイムアウト
```

### 修正後（非ブロッキング）

```
Renderer           Main Process         OAuthFlow
   |                    |                    |
   |--- auth:login ---->|                    |
   |                    |-- startOAuthFlow ->|  ← fire-and-forget
   |<-- { success } ----|                    |  ← 即座に返す
   |                    |                    |
   |                    |   (OAuth完了後)    |
   |<- AUTH_STATE_CHANGED|                   |  ← 既存イベントで通知
```

## 既存の AUTH_STATE_CHANGED リスナー（変更なし）

`apps/desktop/src/renderer/store/slices/authSlice.ts` に既存の `AUTH_STATE_CHANGED` リスナーがあり、このリスナーは変更不要。

```typescript
// authSlice.ts - 既存・変更なし
ipcRenderer.on(IPC_CHANNELS.AUTH_STATE_CHANGED, (_, authState) => {
  // 認証状態を更新する既存の listener
});
```

## エラーパス設計

| シナリオ         | 現在の挙動                                            | 修正後の挙動                                                                   |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| OAuth 成功       | `auth:login` が OAuth 完了まで待機する                | `auth:login` は即時 `{ success: true }` を返し、成功通知は orchestrator が送る |
| OAuth 失敗       | `auth:login` がエラーを返し、タイムアウトと混同される | `auth:login` は即時 `{ success: true }` を返し、失敗通知は orchestrator が送る |
| invalid provider | `auth/invalid-provider` を返す                        | 変更なし                                                                       |
| IPC タイムアウト | タイムアウトエラー発生                                | 500ms 以内にレスポンスするためタイムアウト発生を回避                           |

## 変更スコープ

| ファイル                                                            | 変更内容                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.ts`                         | `await` 削除、`void ... .catch()` 追加、イベント重複送信なし |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | 期待値を immediate response と責務境界に合わせる             |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | 既存の AUTH_STATE_CHANGED 通知を回帰確認                     |

変更なしのファイル:

- `apps/desktop/src/preload/ipc-utils.ts`（`auth:login=500` のまま）
- `apps/desktop/src/renderer/store/slices/authSlice.ts`（listener はそのまま活用）
- `apps/desktop/src/main/auth/authFlowOrchestrator.ts`（通知責務を維持）

## 統合テスト連携

| テスト対象                                                          | 役割                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | handler の即時応答・provider validation・fire-and-forget を確認 |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | success / failure の `AUTH_STATE_CHANGED` を確認                |
| `apps/desktop/src/renderer/store/slices/authSlice.test.ts`          | listener 互換を確認                                             |

## サブタスク管理

- SubAgent 1: skill 準拠の観点から必須セクション漏れを洗い出す
- SubAgent 2: current code と timeout / event contract の整合を検証する
- SubAgent 3: alternative design を 30種の思考法で比較する

## 参照資料

| 資料名                  | パス                                                  | 説明          |
| ----------------------- | ----------------------------------------------------- | ------------- |
| authHandlers.ts         | `apps/desktop/src/main/ipc/authHandlers.ts`           | 修正対象      |
| authSlice.ts            | `apps/desktop/src/renderer/store/slices/authSlice.ts` | listener 実装 |
| authFlowOrchestrator.ts | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | event source  |
| phase-1-requirements.md | `./phase-1-requirements.md`                           | 要件          |

## 成果物

| 成果物 | パス                | 説明       |
| ------ | ------------------- | ---------- |
| 設計書 | `phase-2-design.md` | 本ファイル |

## 完了条件

- [ ] current timeout が 500ms である前提が明記されている
- [ ] `AuthFlowOrchestrator` を source of truth とする責務境界が明記されている
- [ ] handler は fire-and-forget で起動し、即時応答する設計が明記されている
- [ ] handler 側で `AUTH_STATE_CHANGED` を重複送信しない設計が明記されている
- [ ] 代替案比較の結果、最小複雑性の設計であることが示されている
- [ ] **本Phase内の全タスクを100%実行完了**
