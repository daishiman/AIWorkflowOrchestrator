# Phase 8 責務境界マップ

## タスク: UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 対象フェーズ: Phase 8 — 責務境界マップ

## 作成日: 2026-04-13

---

## 概要

`analyticsHandler.ts` 内の各要素の責務境界を明確化する。

---

## 責務境界の定義

```
┌─────────────────────────────────────────────────────────────┐
│ analyticsHandler.ts                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ IPC ハンドラー層（analytics:send チャンネル）          │   │
│  │                                                      │   │
│  │  責務:                                               │   │
│  │  - IPC リクエストの受信                               │   │
│  │  - 入力バリデーション（eventName/payload/timestamp）  │   │
│  │  - IPC レスポンスの返却（success/error）              │   │
│  │  - sendToAnalyticsProvider の呼び出し                 │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │ 呼び出し（await）                    │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │ sendToAnalyticsProvider（非公開関数）                  │   │
│  │                                                      │   │
│  │  責務:                                               │   │
│  │  - 環境チェック（NODE_ENV, ANALYTICS_ENDPOINT_URL）   │   │
│  │  - HTTP POST リクエストの構築と送信                    │   │
│  │  - タイムアウト制御（AbortController, 5000ms）        │   │
│  │  - HTTP エラーの握り潰し                              │   │
│  │                                                      │   │
│  │  責務外:                                             │   │
│  │  - 入力バリデーション（呼び出し元の責務）              │   │
│  │  - IPC レスポンスの生成（呼び出し元の責務）            │   │
│  │  - リトライ処理（本タスクのスコープ外）               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 責務分担表

| 責務                | 担当層                    | 備考                                              |
| ------------------- | ------------------------- | ------------------------------------------------- |
| IPC リクエスト受信  | IPC ハンドラー層          | `ipcMain.handle("analytics:send", ...)`           |
| 入力バリデーション  | IPC ハンドラー層          | eventName/payload/timestamp の型チェック          |
| IPC レスポンス返却  | IPC ハンドラー層          | `{ success: true }` / `{ success: false, error }` |
| 環境チェック        | `sendToAnalyticsProvider` | NODE_ENV と URL の存在確認                        |
| HTTP POST 送信      | `sendToAnalyticsProvider` | fetch による外部エンドポイント呼び出し            |
| タイムアウト制御    | `sendToAnalyticsProvider` | AbortController で 5000ms                         |
| HTTP エラー握り潰し | `sendToAnalyticsProvider` | catch ブロックで何もしない                        |
| リトライ処理        | 対象外                    | 本タスクのスコープ外                              |
| 認証・署名          | 対象外                    | 本タスクのスコープ外                              |

---

## 境界の根拠

- `sendToAnalyticsProvider` は非公開関数（`export` なし）とした
  - 理由: HTTP 送信の詳細を IPC ハンドラーから隠蔽し、単一責任の原則を守るため
- エラー握り潰しは `sendToAnalyticsProvider` 内で完結させた
  - 理由: IPC ハンドラー層がエラー処理を意識しなくてよくするため
- 入力バリデーションは IPC ハンドラー層の責務とした
  - 理由: バリデーション結果を IPC レスポンスに反映する必要があるため
