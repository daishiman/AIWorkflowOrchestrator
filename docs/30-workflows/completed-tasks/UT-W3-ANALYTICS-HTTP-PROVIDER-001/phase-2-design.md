# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 1                                              |
| 後続Phase  | Phase 3                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

`sendToAnalyticsProvider` 関数のアーキテクチャと HTTP 送信設計を確定し、Phase 4 のテスト作成に必要な設計書を揃える。

## 背景

Phase 1 で固定した要件（FR-01〜FR-06, AC-01〜AC-07）に基づき、既存 IPC 契約を変えずに HTTP 送信を追加する設計を確定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと       | 主担当                             |
| ---------- | -------------- | ---------------------------------- |
| SubAgent-A | HTTP 送信設計  | `sendToAnalyticsProvider` 関数設計 |
| SubAgent-B | 設定・環境変数 | `ANALYTICS_ENDPOINT_URL` 設定管理  |
| SubAgent-C | テスト設計     | モック戦略、テストパターン設計     |
| SubAgent-D | 統合監査       | IPC 契約整合、依存整合確認         |

## 設計方針

### アーキテクチャ概要

```
Renderer
  ↓ (IPC: analytics:send)
Preload (contextBridge)
  ↓ (ipcMain.handle)
Main: analyticsHandler.ts
  ├─ validateRequest()       // 既存
  ├─ optOut check           // 既存
  ├─ [NEW] sendToAnalyticsProvider() // 新規追加
  │    ├─ ANALYTICS_ENDPOINT_URL 未設定チェック
  │    ├─ NODE_ENV !== "production" チェック
  │    ├─ AbortController (5000ms)
  │    ├─ fetch() POST
  │    └─ catch → エラー握り潰し
  └─ return { success: true }
```

### `sendToAnalyticsProvider` 設計

```typescript
// 設計仕様（実装は Phase 5）
interface SendToAnalyticsProviderInput {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

async function sendToAnalyticsProvider(
  event: SendToAnalyticsProviderInput,
): Promise<void>;
// - ANALYTICS_ENDPOINT_URL 未設定 → return（静かにスキップ）
// - NODE_ENV !== "production" → return（dev 環境では送信しない）
// - AbortController で 5000ms タイムアウト
// - fetch POST + JSON.stringify
// - catch: すべての例外を握り潰す
// - finally: clearTimeout
```

### 環境変数設計

| 変数名                   | 用途                               | デフォルト | 必須 |
| ------------------------ | ---------------------------------- | ---------- | ---- |
| `ANALYTICS_ENDPOINT_URL` | 外部分析基盤の HTTP エンドポイント | なし       | 任意 |

- 未設定時は送信をスキップ（エラーではない）
- `process.env.ANALYTICS_ENDPOINT_URL` で参照

### テスト可能性設計

| テスト対象   | モック方法                                                               |
| ------------ | ------------------------------------------------------------------------ |
| fetch        | `vi.stubGlobal("fetch", mockFetch)`                                      |
| process.env  | `process.env.ANALYTICS_ENDPOINT_URL = "..."` を beforeEach で設定/クリア |
| NODE_ENV     | `process.env.NODE_ENV = "production"` を beforeEach で設定               |
| タイムアウト | `vi.useFakeTimers()` で AbortController のタイムアウトをシミュレート     |

**重要**: `vi.stubGlobal("window", ...)` は禁止（Feedback VSCPKR-02 参照）。`fetch` のモックは `vi.stubGlobal("fetch", ...)` を使用する。

## 依存整合マトリクス

| 依存先                        | 方向      | 変更 | 確認内容                             |
| ----------------------------- | --------- | ---- | ------------------------------------ |
| `analyticsHandler.ts`         | 修正      | あり | TODO を実装に置き換え                |
| `IPC_CHANNELS.ANALYTICS_SEND` | 参照      | なし | チャネル名は変更しない               |
| `AnalyticsSendRequest`        | 参照      | なし | 既存型を壊さない                     |
| `AnalyticsSendResponse`       | 参照      | なし | 既存型を壊さない                     |
| `channels.ts`                 | 参照      | なし | ALLOWED_INVOKE_CHANNELS への追記不要 |
| テストファイル                | 新規/修正 | あり | HTTP 送信パスのテスト追加            |

## 統合テスト連携【必須】

統合ポイントと契約を設計へ固定する:

| 統合ポイント                             | 契約定義                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| `analytics:send` → `analyticsHandler.ts` | 既存 IPC 応答は `success: true` を維持し、validation / opt-out のみ応答に影響する |
| `sendToAnalyticsProvider` → 外部分析基盤 | `ANALYTICS_ENDPOINT_URL` 宛ての POST 送信。失敗は握り潰し、呼び出し元へ伝播しない |
| 設定値                                   | `ANALYTICS_ENDPOINT_URL` は新規設定値として環境変数設計に含める                   |

## 実行タスク

- HTTP 送信アーキテクチャ設計を確定する
- 環境変数設計とその管理方法を定義する
- テスト戦略（モック方法、テストケース分類）を設計する
- 依存整合マトリクスで矛盾がないことを確認する

## 参照資料

| 参照資料             | パス                                                         | 説明           |
| -------------------- | ------------------------------------------------------------ | -------------- |
| Phase 1 成果物       | `outputs/phase-1/requirements-definition.md`                 | 要件定義書     |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                     | AC 一覧        |
| analyticsHandler     | `apps/desktop/src/main/ipc/analyticsHandler.ts`              | 現状コード     |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物 |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物 |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物 |

## 成果物

| 成果物             | パス                                               | 説明                         |
| ------------------ | -------------------------------------------------- | ---------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | 設計図と責務境界             |
| HTTP送信設計       | `outputs/phase-2/http-send-design.md`              | sendToAnalyticsProvider 設計 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | モック戦略とテストパターン   |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 依存確認表                   |

## 完了条件

- [ ] `sendToAnalyticsProvider` の設計が確定していること
- [ ] 環境変数 `ANALYTICS_ENDPOINT_URL` の設計が明記されていること
- [ ] テスト戦略（fetch モック方法）が定義されていること
- [ ] 既存 IPC 契約への非破壊性が確認されていること
- [ ] 依存整合マトリクスで矛盾なしが確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料（Phase 1 成果物）の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 3: 設計レビュー
