# アーキテクチャ設計

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## 設計概要

Phase 1 で確定した要件（FR-01〜FR-06、NFR-01〜NFR-04）に基づき、既存 IPC 契約を破壊せずに HTTP 送信機能を追加するアーキテクチャを設計した。

---

## 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer Process                                            │
│  analytics イベント発生                                      │
│  optedOut フラグ付与（Renderer 側オプトアウト）              │
└────────────────────────┬────────────────────────────────────┘
                         │ IPC: analytics:send
                         │ AnalyticsSendRequest
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Preload Process                                             │
│  contextBridge.exposeInMainWorld                            │
│  safeInvoke(IPC_CHANNELS.ANALYTICS_SEND, body)              │
└────────────────────────┬────────────────────────────────────┘
                         │ ipcMain.handle
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Main Process: analyticsHandler.ts                           │
│                                                             │
│  ① validateRequest(body)                                   │
│     └─ 失敗 → { success: false, error: "..." }             │
│                                                             │
│  ② optOut check                                            │
│     ├─ optedOut (Renderer 側)                              │
│     ├─ analyticsStore.get("analyticsOptOut") (Main 側)     │
│     └─ 該当 → { success: true, skipped: true }             │
│                                                             │
│  ③ [NEW] sendToAnalyticsProvider(event)       ←本タスク追加 │
│     ├─ ANALYTICS_ENDPOINT_URL 未設定 → return (skip)       │
│     ├─ NODE_ENV !== "production" → return (skip)           │
│     ├─ AbortController(5000ms)                             │
│     ├─ fetch(url, { method: POST, body: JSON })            │
│     └─ catch → 全例外握り潰し                               │
│                                                             │
│  ④ return { success: true }                                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST（production のみ）
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 外部分析基盤                                                │
│  ANALYTICS_ENDPOINT_URL                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 責務境界

| レイヤー                      | 責務                                      | 変更有無 |
| ----------------------------- | ----------------------------------------- | -------- |
| Renderer                      | イベント生成・Renderer 側オプトアウト付与 | 変更なし |
| Preload                       | contextBridge 経由の IPC 橋渡し           | 変更なし |
| Main: validateRequest         | 入力バリデーション                        | 変更なし |
| Main: optOut check            | 二重防衛オプトアウト確認                  | 変更なし |
| Main: sendToAnalyticsProvider | HTTP POST 送信（本タスク追加）            | 新規追加 |
| Main: return                  | IPC 応答返却                              | 変更なし |

---

## sendToAnalyticsProvider の責務

`sendToAnalyticsProvider` は以下の単一責務を持った。

**責務**: analytics イベントを外部分析基盤へ HTTP POST で送信する

この関数は以下の責務を持たなかった。

- バリデーション（validateRequest が担当）
- オプトアウト確認（既存の optOut check が担当）
- IPC 応答の生成（呼び出し元の analyticsHandler が担当）

---

## モジュール構成

### 変更対象ファイル

```
apps/desktop/src/main/ipc/
└── analyticsHandler.ts        ← 既存ファイル（sendToAnalyticsProvider を追加）
```

### 変更内容

```
analyticsHandler.ts
├── [既存] interface AnalyticsSendRequest
├── [既存] interface AnalyticsSendResponse
├── [既存] interface AnalyticsStoreSchema
├── [既存] analyticsStore
├── [既存] isPlainObject()
├── [既存] validateRequest()
├── [NEW]  interface SendToAnalyticsProviderInput  ← 追加
├── [NEW]  async function sendToAnalyticsProvider()  ← 追加
└── [既存] export function registerAnalyticsHandlers()
           └── [修正] TODO を sendToAnalyticsProvider 呼び出しに置き換え
```

### 新規ファイルなし

外部モジュールへの分離は行わなかった。`sendToAnalyticsProvider` は `analyticsHandler.ts` 内の非エクスポート関数として閉じた。これにより以下が達成された。

- 依存グラフの複雑化を防いだ
- テストの対象ファイルが `analyticsHandler.ts` 単体に収まった
- `import` の追加が不要だった

---

## IPC 契約非破壊性の確認

| 契約要素                    | 変更有無 | 理由                                           |
| --------------------------- | -------- | ---------------------------------------------- |
| チャネル名 `analytics:send` | 変更なし | `IPC_CHANNELS.ANALYTICS_SEND` を変更しなかった |
| `AnalyticsSendRequest` 型   | 変更なし | フィールド追加・削除なし                       |
| `AnalyticsSendResponse` 型  | 変更なし | フィールド追加・削除なし                       |
| バリデーション失敗時の応答  | 変更なし | `{ success: false, error: "..." }` を維持した  |
| オプトアウト時の応答        | 変更なし | `{ success: true, skipped: true }` を維持した  |
| 正常時の応答                | 変更なし | `{ success: true }` を維持した                 |

---

## エラー伝播境界

```
sendToAnalyticsProvider()
  ├── ANALYTICS_ENDPOINT_URL 未設定 → return (void)  ← エラーなし
  ├── NODE_ENV !== "production" → return (void)        ← エラーなし
  ├── fetch() 成功 → return (void)                    ← エラーなし
  └── fetch() 失敗（例外）→ catch → return (void)     ← 握り潰し

analyticsHandler.ts の ipcMain.handle
  ├── validateRequest 失敗 → { success: false, error }  ← 例外なし
  ├── optOut 該当 → { success: true, skipped: true }    ← 例外なし
  ├── sendToAnalyticsProvider 呼び出し → void           ← 例外なし（関数内で握り潰し）
  └── return { success: true }                          ← 例外なし
```

HTTP 送信の失敗は `sendToAnalyticsProvider` の境界を越えず、呼び出し元へ伝播しなかった。
