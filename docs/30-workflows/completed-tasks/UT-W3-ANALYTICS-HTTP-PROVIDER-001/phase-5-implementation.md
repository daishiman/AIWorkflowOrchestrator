# Phase 5: 実装（TDD Green） - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001       |
| タイトル   | Analytics HTTP プロバイダー実装         |
| 作成日     | 2026-04-14                              |
| 前提Phase  | Phase 4（テスト作成 TDD Red）           |
| 後続Phase  | Phase 6（テスト拡充）                   |
| 関連Issue  | #2125 (CLOSED)                          |
| 依存タスク | UT-W3-ANALYTICS-ADAPTER-001（完了済み） |

## 目的

Phase 4 で作成した全テスト（TC-01〜TC-09）が PASS（Green）になるよう、`AnalyticsHttpProvider` の新規実装と関連ファイルの変更を行う。実装は受入基準 AC-1〜AC-6 を完全に満たすこと。既存機能のオプトアウト二重防衛・エラー非伝播設計を維持すること。

---

## 実行タスク

### Task 5-1: AnalyticsHttpProvider.ts 実装

**ファイルパス**: `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`（新規作成）

**実装概要**:

```typescript
// AnalyticsHttpProvider.ts の実装概要（コメントのみ）

// インターフェース定義:
//   interface AnalyticsEvent {
//     eventName: string
//     payload: Record<string, unknown>
//     timestamp: number
//   }
//
//   interface AnalyticsSendResult {
//     success: boolean
//     skipped?: boolean
//     error?: string
//   }

// クラス構造:
//   export class AnalyticsHttpProvider {
//     private readonly endpointUrl: string | undefined
//     private readonly store: Store<AnalyticsStoreSchema>
//
//     constructor(endpointUrl: string | undefined, store: Store<...>) {
//       // endpointUrl が未設定の場合は no-op モードで動作する
//     }
//
//     async send(event: AnalyticsEvent): Promise<AnalyticsSendResult> {
//       // 1. endpointUrl 未設定チェック → { success: true, skipped: true }
//       // 2. attemptSend(payload, 0) を呼び出す
//       // 3. 成功時: sentCount をインクリメント
//       // 4. 失敗時: failedCount をインクリメント
//       // 5. 例外はスローしない（try/catch で囲む）
//     }
//
//     private async attemptSend(
//       payload: string,
//       attempt: number
//     ): Promise<AnalyticsSendResult> {
//       // 1. attempt > MAX_RETRIES ならば { success: false } を返す
//       // 2. AbortController を生成（タイムアウト: 5000ms）
//       // 3. fetch を呼び出す
//       // 4. response.ok なら { success: true } を返す
//       // 5. response.status >= 500 ならリトライ（指数バックオフ）
//       // 6. response.status が 4xx ならリトライしない
//       // 7. catch (AbortError | NetworkError) ならリトライ
//     }
//
//     private buildPayload(event: AnalyticsEvent): string {
//       // JSON.stringify(event) でペイロードを構築
//     }
//
//     private async sleep(ms: number): Promise<void> {
//       // setTimeout をラップ（テストで vi.useFakeTimers() によるモック可能）
//     }
//   }
```

**定数定義**:

| 定数名        | 値   | 説明                            |
| ------------- | ---- | ------------------------------- |
| MAX_RETRIES   | 3    | 最大リトライ回数（初回除く）    |
| TIMEOUT_MS    | 5000 | タイムアウト（ミリ秒）          |
| BASE_DELAY_MS | 100  | 指数バックオフの基底遅延（ms）  |
| BACKOFF_MULT  | 2    | バックオフ倍率（100→200→400ms） |

**指数バックオフ計算式**:

```typescript
// 待機時間 = BASE_DELAY_MS * (BACKOFF_MULT ** attempt)
// attempt=0: 100ms, attempt=1: 200ms, attempt=2: 400ms
```

**`sentCount` / `failedCount` の Store 更新**:

```typescript
// sentCount インクリメント（送信成功時）:
//   const current = this.store.get('sentCount', 0) as number
//   this.store.set('sentCount', current + 1)

// failedCount インクリメント（全リトライ失敗後のみ）:
//   const current = this.store.get('failedCount', 0) as number
//   this.store.set('failedCount', current + 1)
```

---

### Task 5-2: analyticsHandler.ts の TODO 解消

**ファイルパス**: `apps/desktop/src/main/ipc/analyticsHandler.ts`（変更）

**変更内容**:

| 変更箇所                           | 変更前                                   | 変更後                                                            |
| ---------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| Line 106 付近の TODO コメント      | `// TODO: 本番環境での HTTP 送信実装...` | `AnalyticsHttpProvider.send()` の呼び出しに置き換え               |
| `AnalyticsSendResponse` 型定義     | 変更なし                                 | 変更なし（既存型で対応可能）                                      |
| `AnalyticsStoreSchema` 型定義      | `analyticsOptOut?: boolean` のみ         | `sentCount?: number; failedCount?: number` を追加                 |
| `registerAnalyticsHandlers()` 本体 | TODO コメントのまま                      | `provider.send()` 呼び出しと `ANALYTICS_GET_STATS` ハンドラー追加 |

**実装変更のポイント**:

```typescript
// analyticsHandler.ts の変更概要（コメントのみ）

// 変更点 1: AnalyticsHttpProvider のインスタンス化
//   const provider = new AnalyticsHttpProvider(
//     process.env.ANALYTICS_ENDPOINT_URL,
//     analyticsStore
//   )

// 変更点 2: TODO を実際の呼び出しに置き換え
//   // Before:
//   // TODO: 本番環境での HTTP 送信実装
//   // await sendToAnalyticsProvider({ eventName, payload, timestamp })
//
//   // After:
//   const result = await provider.send({ eventName, payload, timestamp })
//   return result

// 変更点 3: analytics:get-stats ハンドラーの追加
//   ipcMain.handle(IPC_CHANNELS.ANALYTICS_GET_STATS, async () => {
//     return {
//       sentCount: analyticsStore.get('sentCount', 0),
//       failedCount: analyticsStore.get('failedCount', 0),
//     }
//   })
```

**オプトアウト二重防衛の維持**（変更してはならない箇所）:

```typescript
// 以下のオプトアウト判定ロジックは変更しないこと
// if (optedOut || storeOptedOut) {
//   return { success: true, skipped: true }
// }
// ※ オプトアウト確認は AnalyticsHttpProvider の手前で行うこと
//   Provider は「送信を命じられたら送信する」責務のみを持つ
```

---

### Task 5-3: channels.ts への ANALYTICS_GET_STATS 追加

**ファイルパス**: `apps/desktop/src/preload/channels.ts`（変更）

**変更内容**:

```typescript
// IPC_CHANNELS への追加（コメントのみ）
//
// // Analytics operations (UT-W3-ANALYTICS-HTTP-PROVIDER-001)
// ANALYTICS_GET_STATS: "analytics:get-stats",
//
// ※ 既存の ANALYTICS_SEND: "analytics:send" の直下に追加する

// ALLOWED_INVOKE_CHANNELS への追加（コメントのみ）
//
// // Analytics channels
// IPC_CHANNELS.ANALYTICS_SEND,      // 既存
// IPC_CHANNELS.ANALYTICS_GET_STATS, // 追加
//
// ※ ALLOWED_INVOKE_CHANNELS への追加を忘れると Renderer で channel not allowed エラーになる
```

**`packages/shared/src/ipc/channels.ts` への追加**（必要な場合）:

```typescript
// shared/channels.ts への追加が必要な場合のみ実施
//
// export const ANALYTICS_CHANNELS = {
//   ANALYTICS_SEND: "analytics:send",
//   ANALYTICS_GET_STATS: "analytics:get-stats",
// } as const
//
// IPC_CHANNELS スプレッドへの追加:
//   ...ANALYTICS_CHANNELS,
```

---

### Task 5-4: Preload API への getAnalyticsStats 追加

**ファイルパス**: `apps/desktop/src/preload/` の適切なファイル（変更）

**変更内容**:

```typescript
// Preload API への追加（コメントのみ）
//
// getAnalyticsStats: (): Promise<{ sentCount: number; failedCount: number }> =>
//   safeInvoke(IPC_CHANNELS.ANALYTICS_GET_STATS)
//
// ※ 既存の analytics API（sendAnalyticsEvent 等）と同じ namespace に追加すること
// ※ safeInvoke の型パラメータを正確に設定すること
//   safeInvoke<{ sentCount: number; failedCount: number }>(...)
```

**contextBridge への公開**（既存の analytics API が定義されているブロックに追加）:

```typescript
// contextBridge.exposeInMainWorld('electronAPI', {
//   ...existingApis,
//   analytics: {
//     send: (event) => safeInvoke(IPC_CHANNELS.ANALYTICS_SEND, event),
//     getStats: () => safeInvoke(IPC_CHANNELS.ANALYTICS_GET_STATS), // 追加
//   },
// })
```

---

### Task 5-5: analyticsStore スキーマ拡張（sentCount/failedCount）

**ファイルパス**: `apps/desktop/src/main/ipc/analyticsHandler.ts`（変更）

**変更内容**:

```typescript
// AnalyticsStoreSchema 型定義の拡張（コメントのみ）
//
// Before:
// interface AnalyticsStoreSchema {
//   analyticsOptOut?: boolean
//   [key: string]: unknown
// }
//
// After:
// interface AnalyticsStoreSchema {
//   analyticsOptOut?: boolean
//   sentCount?: number
//   failedCount?: number
//   [key: string]: unknown
// }
//
// ※ 既存の electron-store インスタンスに sentCount / failedCount を追加するだけ
// ※ 既存の Store データとの後方互換性: undefined は 0 として扱う（get のデフォルト値で対応）
```

---

## 実装順序と依存関係

```
Task 5-5（ストアスキーマ拡張）
    ↓
Task 5-1（AnalyticsHttpProvider.ts 新規作成）
    ↓
Task 5-3（channels.ts への ANALYTICS_GET_STATS 追加）
    ↓
Task 5-4（Preload API への getAnalyticsStats 追加）
    ↓
Task 5-2（analyticsHandler.ts の TODO 解消 + get-stats ハンドラー追加）
    ↓
テスト実行（TDD Green 確認）
```

**依存関係の理由**:

- `AnalyticsHttpProvider` は `AnalyticsStoreSchema` の型定義に依存するため 5-5 を先に行う
- `analyticsHandler.ts` は `AnalyticsHttpProvider` と `IPC_CHANNELS.ANALYTICS_GET_STATS` に依存するため 5-1 / 5-3 の後に行う
- Preload API は `IPC_CHANNELS.ANALYTICS_GET_STATS` の定義に依存するため 5-3 の後に行う

---

## 実装時の注意事項

### オプトアウト二重防衛の維持

`analyticsHandler.ts` のオプトアウトチェック（`if (optedOut || storeOptedOut)`）は変更してはならない。`AnalyticsHttpProvider.send()` の呼び出しは必ずこのチェックの **後** に行うこと。

```
[Renderer] → analytics:send IPC
    → [Main / analyticsHandler.ts]
        → バリデーション
        → オプトアウトチェック ← ここで early return（変更禁止）
        → AnalyticsHttpProvider.send() ← ここに実装を追加
```

Provider 内部では再度オプトアウトチェックを行わない（二重防衛は handler 側の責務）。

### エラー非伝播設計

`AnalyticsHttpProvider.send()` は外部に例外をスローしてはならない。すべての例外（ネットワークエラー・タイムアウト・JSON シリアライズエラー等）を `try/catch` で捕捉し、`{ success: false, error: string }` に変換して返すこと。

```typescript
// 正しい実装パターン（コメントのみ）
// async send(event): Promise<AnalyticsSendResult> {
//   try {
//     // ... HTTP 送信ロジック
//   } catch (err) {
//     // ← ここで catch して外部に漏らさない
//     return { success: false, error: String(err) }
//   }
// }
```

### IPC型契約の後方互換性

`analytics:get-stats` は新規チャネルであるため、既存の Renderer コードへの影響はない。ただし、`analytics:send` の戻り値型（`AnalyticsSendResponse`）は変更しないこと。既存の Renderer 側コードがこの型に依存している可能性がある。

| 変更対象                     | 後方互換性 | 注意点                                                       |
| ---------------------------- | ---------- | ------------------------------------------------------------ |
| `analytics:send` 戻り値型    | 維持必須   | `success / skipped / error` フィールドを変更しないこと       |
| `analytics:get-stats` 戻り値 | 新規追加   | 型定義は `{ sentCount: number; failedCount: number }`        |
| `analyticsStore` スキーマ    | 後方互換   | `sentCount / failedCount` は省略可能（既存データに影響なし） |

---

## 参照資料

| 資料名                          | パス                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| analyticsHandler.ts（変更対象） | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                               |
| Preload チャネル定義            | `apps/desktop/src/preload/channels.ts`                                                        |
| shared チャネル定義             | `packages/shared/src/ipc/channels.ts`                                                         |
| Phase 4 テストファイル          | `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts`            |
| Phase 4 統合テスト              | `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`                                |
| Phase 3 設計レビュー結果        | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-3/design-review-result.md` |
| 前提タスク完了物                | UT-W3-ANALYTICS-ADAPTER-001 の完了成果物                                                      |

---

| TDD Red確認ログ | `outputs/phase-4/tdd-red-log.txt` | Phase 4 成果物 |

## 実行手順

1. Phase 4 の TDD Red 確認ログ（`outputs/phase-4/tdd-red-log.txt`）を確認し、全テストが FAIL であることを再確認する
2. **Task 5-5**: `AnalyticsStoreSchema` に `sentCount / failedCount` を追加する
3. **Task 5-1**: `AnalyticsHttpProvider.ts` を新規作成する
4. **Task 5-3**: `channels.ts` に `ANALYTICS_GET_STATS` を追加し、`ALLOWED_INVOKE_CHANNELS` にも追加する
5. **Task 5-4**: Preload API に `getAnalyticsStats` を追加する
6. **Task 5-2**: `analyticsHandler.ts` の TODO を解消し、`ANALYTICS_GET_STATS` ハンドラーを追加する
7. テストを実行し、TC-01〜TC-09 が全て PASS であることを確認する（TDD Green）
8. 型チェックを実行し、型エラーがないことを確認する
9. 実装サマリーを `outputs/phase-5/implementation-summary.md` に記録する

---

## 成果物

| 成果物                           | パス                                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| AnalyticsHttpProvider.ts（新規） | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`                             |
| analyticsHandler.ts（変更）      | `apps/desktop/src/main/ipc/analyticsHandler.ts`                                                 |
| preload/channels.ts（変更）      | `apps/desktop/src/preload/channels.ts`                                                          |
| Preload API（変更）              | `apps/desktop/src/preload/` の適切なファイル                                                    |
| 実装サマリー                     | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-5/implementation-summary.md` |

---

## 完了条件

- [ ] Task 5-1: `AnalyticsHttpProvider.ts` が新規作成され、以下を実装している
  - [ ] `ANALYTICS_ENDPOINT_URL` 未設定時に no-op で動作する（AC-5）
  - [ ] `fetch` による HTTP POST 送信が実装されている（AC-1）
  - [ ] `AbortController` によるタイムアウト（5秒）が実装されている（AC-2）
  - [ ] 指数バックオフによる最大 3 回リトライが実装されている（AC-3）
  - [ ] `sentCount` / `failedCount` のインクリメントが実装されている（AC-4）
  - [ ] 例外をスローしない（エラー非伝播設計）
- [ ] Task 5-2: `analyticsHandler.ts` の TODO が解消されている
  - [ ] `AnalyticsHttpProvider.send()` が呼び出されている
  - [ ] `analytics:get-stats` ハンドラーが追加されている
  - [ ] オプトアウト二重防衛が維持されている
- [ ] Task 5-3: `channels.ts` に `ANALYTICS_GET_STATS: "analytics:get-stats"` が追加されている
  - [ ] `ALLOWED_INVOKE_CHANNELS` にも `ANALYTICS_GET_STATS` が追加されている
- [ ] Task 5-4: Preload API に `getAnalyticsStats` が追加されている
- [ ] Task 5-5: `AnalyticsStoreSchema` に `sentCount?: number; failedCount?: number` が追加されている
- [ ] TDD Green 確認: Phase 4 の全テスト（TC-01〜TC-09）が PASS になっている（AC-6）
- [ ] 型チェック: `pnpm --filter @repo/desktop typecheck` がエラーなく通過する
- [ ] 実装サマリーが `outputs/phase-5/implementation-summary.md` に記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

本 Phase の実装が完了した後、以下を必ず実行して確認すること：

```bash
# TDD Green 確認: 全テストが PASS であること
pnpm vitest run apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts
pnpm vitest run apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint チェック
pnpm --filter @repo/desktop lint
```

上記コマンドがすべてエラーなく完了し、全完了条件にチェックが入ったことを確認してから Phase 6 へ進むこと。

---

## 次Phase

Phase 6: テスト拡充（カバレッジ・境界値・エッジケース）
