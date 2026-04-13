# aiworkflow 仕様抽出結果

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## 抽出概要

本ドキュメントは、AIWorkflowOrchestrator の正本仕様（`references/` 配下）から本タスクに関連する仕様を抽出した結果を記録した。抽出対象は以下の 4 カテゴリとした。

1. Analytics IPC 仕様（`api-ipc-system.md`）
2. エラーハンドリング方針（`error-handling.md`）
3. アーキテクチャパターン（`architecture-implementation-patterns.md`）
4. 品質要件（`quality-requirements.md`）

---

## 1. Analytics IPC 仕様

### チャネル定義

| チャネル名       | 方向            | ハンドラー            |
| ---------------- | --------------- | --------------------- |
| `analytics:send` | Renderer → Main | `analyticsHandler.ts` |

### リクエスト型

```typescript
interface AnalyticsSendRequest {
  eventName: string; // 必須: 非空文字列
  payload: Record<string, unknown>; // 必須: プレーンオブジェクト
  timestamp: number; // 省略時は Date.now() を使用
  optedOut?: boolean; // Renderer 側オプトアウトフラグ
}
```

### レスポンス型

```typescript
interface AnalyticsSendResponse {
  success: boolean; // 成功: true、バリデーション失敗: false
  skipped?: boolean; // オプトアウト時: true
  error?: string; // バリデーション失敗時のエラーメッセージ
}
```

### オプトアウト二重防衛構造

既存の実装では以下の 2 層でオプトアウトを確認していた。

1. **Renderer 側**: `optedOut: true` をリクエストに含める
2. **Main 側**: `electron-store` の `analyticsOptOut` フラグを確認する

両方でオプトアウトが確認された場合、`{ success: true, skipped: true }` を返し、HTTP 送信には進まない。この構造は本タスクの実装で変更しなかった。

### 既存コード状態（TODO 箇所）

```typescript
// apps/desktop/src/main/ipc/analyticsHandler.ts:106
// TODO: 本番環境での HTTP 送信実装（外部分析基盤への接続）
// await sendToAnalyticsProvider({ eventName, payload, timestamp });
```

この TODO が本タスクの実装対象であった。

---

## 2. エラーハンドリング方針

### 基本原則

AIWorkflowOrchestrator のエラーハンドリング方針として、以下が正本仕様に定義されていた。

| 原則                     | 内容                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| エラー非伝播             | 外部依存（HTTP など）の失敗は IPC レイヤーへ伝播させない         |
| 呼び出し元保護           | `ipcMain.handle` コールバックは例外をスローしない構造を維持する  |
| サイレントフォールバック | 設定値の欠落（URL 未設定など）はエラーではなくスキップとして扱う |

### analytics:send への適用

- HTTP 送信（`sendToAnalyticsProvider`）は `try-catch` で囲み、例外を握り潰した
- `catch` ブロック内ではエラーを再スローしなかった
- `sendToAnalyticsProvider` は `Promise<void>` を返し、呼び出し元へエラーを伝播しなかった
- `analyticsHandler.ts` の `return { success: true }` は HTTP 送信の成否に依存しなかった

### タイムアウト設計

`AbortController` を使用した 5000ms タイムアウトが設計に含まれた。これはネットワーク遅延によるアプリケーション応答遅延を防ぐためであった。

---

## 3. アーキテクチャパターン

### Main プロセスの設計パターン

正本仕様で定義された Main プロセスの IPC ハンドラーパターンに従い、以下の責務分離が確認された。

| 責務               | 担当箇所                    | 変更有無 |
| ------------------ | --------------------------- | -------- |
| 入力バリデーション | `validateRequest()`         | 変更なし |
| オプトアウト確認   | `analyticsStore.get()`      | 変更なし |
| HTTP 送信（新規）  | `sendToAnalyticsProvider()` | 新規追加 |
| IPC 応答返却       | `return { success: true }`  | 変更なし |

### 関数の配置

`sendToAnalyticsProvider` は `analyticsHandler.ts` と同一ファイル内の非エクスポート関数として配置した。外部モジュールへの分離は行わなかった（単一責務: analytics イベント送信に閉じた処理）。

### 環境変数アクセスパターン

`process.env.ANALYTICS_ENDPOINT_URL` を直接参照するパターンを採用した。設定ファイルや DI（依存性注入）は使用しなかった。これは既存の `analyticsHandler.ts` の `process.env.NODE_ENV` 参照パターンと統一した判断であった。

---

## 4. 品質要件

### CI パイプライン要件

正本仕様で定義された品質ゲートは以下であった。

| チェック項目   | コマンド         | 合格基準             |
| -------------- | ---------------- | -------------------- |
| TypeScript 型  | `pnpm typecheck` | 型エラー 0 件        |
| Linter         | `pnpm lint`      | ESLint エラー 0 件   |
| ユニットテスト | `pnpm test`      | Vitest 全テスト PASS |

### テスト品質要件

- `global.fetch` のモックは `vi.stubGlobal("fetch", ...)` を使用した
- `vi.stubGlobal("window", ...)` は禁止（VSCPKR-02 フィードバック準拠）
- 実際の HTTP 通信はテスト内で行わなかった
- `afterEach` で `vi.unstubAllGlobals()` を呼び出した

### 型安全性要件

- `any` 型の使用を禁止した
- 新規追加の `SendToAnalyticsProviderInput` 型は明示的に定義した
- 既存の `AnalyticsSendRequest` / `AnalyticsSendResponse` 型を変更しなかった

---

## 5. carry-over 仕様との整合確認

前タスク（UT-W3-ANALYTICS-ADAPTER-001）の carry-over 仕様との整合を確認した。

| carry-over 項目      | 本タスクでの扱い                                                  |
| -------------------- | ----------------------------------------------------------------- |
| IPC チャネル変更なし | `analytics:send` チャネルを変更しなかった                         |
| 型定義の保守         | `AnalyticsSendRequest` / `AnalyticsSendResponse` を変更しなかった |
| オプトアウト二重防衛 | Renderer + Main の両方でオプトアウトを確認する構造を維持した      |
| エラー非伝播         | HTTP 送信失敗でも IPC 応答 `{ success: true }` を返し続けた       |

---

## 抽出結果サマリー

| カテゴリ               | 抽出項目数 | 本タスクへの適用 |
| ---------------------- | ---------- | ---------------- |
| Analytics IPC 仕様     | 4 項目     | 全件適用         |
| エラーハンドリング方針 | 3 項目     | 全件適用         |
| アーキテクチャパターン | 4 項目     | 全件適用         |
| 品質要件               | 3 項目     | 全件適用         |
| carry-over 整合確認    | 4 項目     | 全件確認         |

矛盾・漏れ・整合性問題はなかった。
