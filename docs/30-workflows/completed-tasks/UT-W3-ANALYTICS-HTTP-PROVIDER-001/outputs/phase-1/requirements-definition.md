# 要件定義書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## 目的

`analyticsHandler.ts` の Line 106 に存在する TODO コメントを実装対象として特定し、Renderer からの analytics イベントを外部分析基盤（HTTP エンドポイント）へ実際に送信するための機能要件・非機能要件を確定した。

---

## 背景

UT-W3-ANALYTICS-ADAPTER-001 において analytics の IPC パイプライン（Renderer → preload → Main）が完成した。Main プロセス側の `analyticsHandler.ts` では、オプトアウトチェックをパスしたイベントはコンソール出力のみで、実際の外部送信は未実装のまま次のコメントが残っていた。

```ts
// apps/desktop/src/main/ipc/analyticsHandler.ts:106
// TODO: 本番環境での HTTP 送信実装（外部分析基盤への接続）
// await sendToAnalyticsProvider({ eventName, payload, timestamp });
```

本タスクはこの TODO を実装するための要件を定義した。

---

## タスク分類

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスク分類   | non-ui-task（UI変更なし）                  |
| IPC変更      | なし（既存 analytics:send チャネルを使用） |
| 新規内部関数 | `sendToAnalyticsProvider` 関数のみ         |
| 環境変数追加 | `ANALYTICS_ENDPOINT_URL`                   |

---

## 機能要件

| ID    | 要件                                                                        | 優先度 |
| ----- | --------------------------------------------------------------------------- | ------ |
| FR-01 | `NODE_ENV === "production"` 時に `ANALYTICS_ENDPOINT_URL` へ HTTP POST する | Must   |
| FR-02 | リクエストボディは `{ eventName, payload, timestamp }` の JSON              | Must   |
| FR-03 | タイムアウトは 5000ms（AbortController 使用）                               | Must   |
| FR-04 | HTTP 送信失敗時はエラーを握り潰し、IPC 応答を壊さない                       | Must   |
| FR-05 | `ANALYTICS_ENDPOINT_URL` が未設定の場合は静かにスキップする                 | Must   |
| FR-06 | 既存のオプトアウト二重防衛構造（Renderer + Main）を破らない                 | Must   |

### FR-01 詳細

- `process.env.NODE_ENV` が `"production"` である場合にのみ HTTP POST を実行した
- 開発環境（`development`）・テスト環境（`test`）では HTTP POST を呼ばないことを確認した
- 条件分岐は `sendToAnalyticsProvider` 関数の内部に閉じた

### FR-02 詳細

- リクエストボディは `JSON.stringify({ eventName, payload, timestamp })` で生成した
- `Content-Type: application/json` ヘッダーを付与した
- `eventName: string`、`payload: Record<string, unknown>`、`timestamp: number` の型を満たした

### FR-03 詳細

- `AbortController` を生成し `setTimeout(controller.abort, 5000)` でタイムアウトを設定した
- `fetch` の `signal` オプションに `controller.signal` を渡した
- タイムアウト後は `finally` ブロックで `clearTimeout` を呼び出した

### FR-04 詳細

- `try-catch` ブロックで `sendToAnalyticsProvider` 全体を囲んだ
- `catch` はエラーを外へ伝播させず、関数が void を返す形にした
- 呼び出し元の `analyticsHandler.ts` は `{ success: true }` を返し続けた

### FR-05 詳細

- `process.env.ANALYTICS_ENDPOINT_URL` が falsy な場合は `return` で即時終了した
- エラーをスローせず、undefined または空文字列でも同様に無音スキップした

### FR-06 詳細

- `sendToAnalyticsProvider` の呼び出しはオプトアウトチェック（既存コード Lines 86〜94）の後に配置した
- Renderer 側の `optedOut` フラグと Main 側の `analyticsStore` による二重チェック構造は変更しなかった

---

## 非機能要件

| ID     | 要件                                                                     | 優先度 |
| ------ | ------------------------------------------------------------------------ | ------ |
| NFR-01 | 送信失敗がアプリケーション全体を壊さないこと（エラー非伝播設計）         | Must   |
| NFR-02 | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること              | Must   |
| NFR-03 | 既存 `AnalyticsSendRequest` / `AnalyticsSendResponse` 型を変更しないこと | Must   |
| NFR-04 | テスト時は `global.fetch` をモックして実際の HTTP 通信を行わないこと     | Must   |

### NFR-01 詳細

- `sendToAnalyticsProvider` の例外は全て catch ブロック内で握り潰した
- HTTP 送信の失敗（ネットワーク断・タイムアウト・5xx応答）は全て握り潰し対象とした
- `analyticsHandler.ts` の `ipcMain.handle` コールバックは例外をスローしない構造を維持した

### NFR-02 詳細

- TypeScript の型チェックが通ることを確認した（`pnpm typecheck`）
- ESLint のルールに違反しないことを確認した（`pnpm lint`）
- Vitest の全テストが通ることを確認した（`pnpm test`）

### NFR-03 詳細

- `AnalyticsSendRequest` インターフェース（eventName, payload, timestamp, optedOut）は変更しなかった
- `AnalyticsSendResponse` インターフェース（success, skipped?, error?）は変更しなかった
- 新規追加は `sendToAnalyticsProvider` のプライベート関数と `SendToAnalyticsProviderInput` 型のみとした

### NFR-04 詳細

- テストファイルでは `vi.stubGlobal("fetch", mockFetch)` を使用してモックした
- `vi.stubGlobal("window", ...)` は使用禁止とした（VSCPKR-02 フィードバック準拠）
- `afterEach` で `vi.unstubAllGlobals()` を呼び出してモックを解除した

---

## データフロー

```
Renderer
  ↓ (IPC: analytics:send)
Preload (contextBridge)
  ↓ (ipcMain.handle)
Main: analyticsHandler.ts
  ├─ validateRequest()           // 入力検証（既存）
  ├─ optOut check               // オプトアウト二重防衛（既存）
  ├─ [NEW] sendToAnalyticsProvider()
  │    ├─ ANALYTICS_ENDPOINT_URL 未設定チェック → スキップ
  │    ├─ NODE_ENV !== "production" チェック → スキップ
  │    ├─ AbortController (5000ms タイムアウト設定)
  │    ├─ fetch() POST (JSON body)
  │    └─ catch → 全例外握り潰し
  └─ return { success: true }
```

---

## 環境変数一覧

| 変数名                   | 用途                               | デフォルト | 必須 |
| ------------------------ | ---------------------------------- | ---------- | ---- |
| `ANALYTICS_ENDPOINT_URL` | 外部分析基盤の HTTP エンドポイント | なし       | 任意 |

---

## 前タスクからの教訓適用

| 教訓                 | 本タスクへの適用                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| IPC 型契約の保守     | `AnalyticsSendRequest` / `AnalyticsSendResponse` の型定義を変更しないことを要件に明記した        |
| エラー非伝播設計     | HTTP エラーが IPC 呼び出し全体を壊さないよう catch で握り潰す設計を NFR-01 として定義した        |
| オプトアウト二重防衛 | Renderer 側と Main 側の両方でオプトアウトを確認する既存構造を破らないことを FR-06 として定義した |
