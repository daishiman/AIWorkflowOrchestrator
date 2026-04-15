# Phase 3: 設計レビューゲート - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 3                                       |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001       |
| タイトル   | Analytics HTTP プロバイダー実装         |
| 作成日     | 2026-04-14                              |
| 前提Phase  | Phase 2（設計）                         |
| 後続Phase  | Phase 4（テスト作成 TDD Red）           |
| 関連Issue  | #2125 (CLOSED)                          |
| 依存タスク | UT-W3-ANALYTICS-ADAPTER-001（完了済み） |

## 目的

Phase 2 で設計した `AnalyticsHttpProvider` の実装方針・IPC 設計・エラーハンドリング・セキュリティ設計が、既存アーキテクチャ（`analyticsHandler.ts`、IPC 4層構造）と整合しているかを確認する。すべての設計判断が Phase 4 以降の実装に進められる品質であることを保証する。

---

## レビュー項目

### Check 1: AnalyticsHttpProvider クラス設計の妥当性

**目的**: クラス設計が単一責務原則（SRP）に従い、テスト容易な構造になっているかを確認する。

**レビュー観点**:

| 観点                 | 確認基準                                                                                   | 判定 |
| -------------------- | ------------------------------------------------------------------------------------------ | ---- |
| 配置パス             | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` であること             | -    |
| 単一責務             | HTTP 送信責務のみを持ち、IPC 受信や Store 操作を含まないこと                               | -    |
| インターフェース設計 | `send(event: AnalyticsEvent): Promise<AnalyticsSendResult>` の形で外部から呼び出せること   | -    |
| オプトアウト非関与   | オプトアウト判定は `analyticsHandler.ts` 側で行い、Provider は純粋な送信責務のみを持つこと | -    |
| no-op パターン       | `ANALYTICS_ENDPOINT_URL` 未設定時は `{ success: true, skipped: true }` を即時返すこと      | -    |
| コンストラクタ注入   | `endpointUrl` をコンストラクタで受け取り、直接 `process.env` を参照しない設計であること    | -    |

**確認すべきコードコメントのスケルトン例**:

```typescript
// AnalyticsHttpProvider クラス概要（コメントのみ）
// - コンストラクタ: endpointUrl を受け取る（未設定時は no-op）
// - send(event): HTTP POST → リトライ → 結果返却
// - private buildPayload(event): リクエストボディ構築
// - private attemptSend(payload, retries): 再帰的リトライ実装
```

---

### Check 2: IPC 4層整合性チェック

**目的**: 新規追加する `analytics:get-stats` チャネルが既存の IPC 4層（Main / Preload / Renderer / channels.ts）すべてに漏れなく追加されているかを確認する。

**IPC 4層の構成**:

| 層              | 対象ファイル                                                        | 追加内容                                     |
| --------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| チャネル定義    | `apps/desktop/src/preload/channels.ts`                              | `ANALYTICS_GET_STATS: "analytics:get-stats"` |
| Main ハンドラー | `apps/desktop/src/main/ipc/analyticsHandler.ts`                     | `ipcMain.handle(ANALYTICS_GET_STATS, ...)`   |
| Preload API     | `apps/desktop/src/preload/` の適切なファイル                        | `getAnalyticsStats: () => safeInvoke(...)`   |
| shared channels | `packages/shared/src/ipc/channels.ts`（必要に応じて）               | Analytics チャネルグループの追加             |
| ホワイトリスト  | `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` | `ANALYTICS_GET_STATS` の追加                 |

**確認ポイント**:

- `ALLOWED_INVOKE_CHANNELS` への追加漏れは Renderer 側で `Error: channel not allowed` になるため必須
- `packages/shared/src/ipc/channels.ts` に Analytics チャネルグループを追加する場合、既存の `IPC_CHANNELS` スプレッドに含めること

---

### Check 3: エラーハンドリング設計

**目的**: HTTP 送信失敗時にメインプロセスがクラッシュせず、Renderer へ適切な `{ success: false }` が返ることを確認する。

**エラーシナリオ別の設計確認**:

| シナリオ                              | 期待する挙動                                                                      | `analyticsStore` への影響   |
| ------------------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| ネットワークエラー（ECONNREFUSED 等） | `{ success: false, error: "Network error" }` を返す                               | `failedCount` +1            |
| タイムアウト（5秒超過）               | `AbortController` でリクエストキャンセル → `{ success: false, error: "Timeout" }` | `failedCount` +1            |
| HTTP 4xx / 5xx レスポンス             | `{ success: false, error: "HTTP 4xx/5xx" }` を返す                                | `failedCount` +1            |
| リトライ後の最終失敗                  | 3回リトライ後に失敗した場合のみ `failedCount` +1                                  | `failedCount` +1（1回のみ） |
| 送信成功                              | `{ success: true }` を返す                                                        | `sentCount` +1              |

**エラー非伝播の設計原則**:

- `AnalyticsHttpProvider.send()` は例外をスローしないこと
- すべてのエラーは `try/catch` で捕捉し、`{ success: false, error: string }` に変換すること
- `analyticsHandler.ts` で `await provider.send()` が例外を受け取らない設計

---

### Check 4: リトライ・タイムアウト設計

**目的**: 指数バックオフによるリトライロジックとタイムアウト実装が正しく設計されているかを確認する。

**リトライ設計パラメータ**:

| パラメータ         | 設計値                                       | 根拠                             |
| ------------------ | -------------------------------------------- | -------------------------------- |
| 最大リトライ回数   | 3回                                          | 受入基準 AC-3 による要件         |
| 初回バックオフ遅延 | 100ms                                        | 初回は短く、指数的に増加させる   |
| バックオフ倍率     | 2倍                                          | 100ms → 200ms → 400ms の指数増加 |
| タイムアウト       | 5000ms                                       | 受入基準による要件（AC-2）       |
| リトライ対象       | ネットワークエラー / タイムアウト / HTTP 5xx | HTTP 4xx はリトライしない        |

**指数バックオフの擬似コード（コメントのみ）**:

```typescript
// attemptSend(payload, attempt = 0):
//   if attempt > MAX_RETRIES: return { success: false }
//   try:
//     fetch with AbortController (timeout: 5000ms)
//     if response.ok: return { success: true }
//     if response.status >= 500: backoff and retry
//     return { success: false }  // 4xx はリトライしない
//   catch (NetworkError | AbortError):
//     if attempt < MAX_RETRIES: wait(100 * 2^attempt) and retry
//     return { success: false }
```

**テスト時の考慮事項**:

- バックオフ遅延は `vi.useFakeTimers()` でスキップできる設計にすること
- `sleep` 関数を注入可能にするか、`vi.spyOn(global, 'setTimeout')` でモック可能にすること

---

### Check 5: セキュリティ観点

**目的**: Renderer から取得したデータが外部 HTTP エンドポイントへ送信される際のセキュリティリスクを確認する。

**セキュリティチェックリスト**:

| 項目                              | 確認内容                                                                              | 判定 |
| --------------------------------- | ------------------------------------------------------------------------------------- | ---- |
| エンドポイント URL 検証           | `ANALYTICS_ENDPOINT_URL` が `https://` スキームのみ受け入れること                     | -    |
| ペイロードサイズ制限              | `eventName` + `payload` の合計サイズに上限（例: 64KB）を設ける設計があること          | -    |
| PII（個人情報）非送信             | `payload` に個人識別情報が含まれないことを Renderer 側で保証する設計方針の明記        | -    |
| 認証情報の非ハードコード          | API キーや認証トークンは環境変数経由のみ（ソースコードへのハードコード禁止）          | -    |
| CORS 非関与                       | Main プロセスからの送信のため CORS は関係ないが、サーバー側証明書検証は有効にすること | -    |
| `ANALYTICS_ENDPOINT_URL` スコープ | 環境変数は Main プロセスのみが参照し、Preload / Renderer には公開しないこと           | -    |

---

### Check 6: 既存テストへの影響

**目的**: 今回の変更が既存の `analyticsHandler.ts` テストおよびその他テストを壊さないことを確認する。

**影響範囲の確認**:

| 対象ファイル                                                                       | 変更内容                         | テストへの影響                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/analyticsHandler.ts`                                    | TODO 解消・Provider 呼び出し追加 | 既存テストで `provider.send` をモックする必要がある場合がある   |
| `packages/shared/src/ipc/channels.ts`                                              | `ANALYTICS_GET_STATS` 追加       | チャネル定数テストがある場合は追加が必要                        |
| `apps/desktop/src/preload/channels.ts`                                             | チャネル追加・ホワイトリスト追加 | Preload テストがある場合は `ALLOWED_INVOKE_CHANNELS` 確認が必要 |
| `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts` | 新規作成                         | 新規テストのみ（既存への影響なし）                              |

**既存テストの regression 確認手順**:

```bash
# analyticsHandler 関連テストを実行して既存テストが壊れていないことを確認
pnpm vitest run --reporter=verbose apps/desktop/src/main/ipc/__tests__/
```

---

## 判定基準（PASS/MINOR/MAJOR）

| 判定  | 条件                                                              | 対応                              |
| ----- | ----------------------------------------------------------------- | --------------------------------- |
| PASS  | 全 Check（1〜6）が問題なし                                        | Phase 4 へ進行                    |
| MINOR | 軽微な設計上の修正が必要（命名変更・JSDoc 補完等）                | 修正内容を記録して Phase 4 へ進行 |
| MAJOR | IPC 4層の漏れ・セキュリティリスク・エラー伝播設計の根本的問題あり | Phase 2 へ差し戻し・設計を再実施  |

---

## MINOR追跡テーブル

| No. | 指摘箇所   | 内容     | 対応方針 | 担当 | 解消確認 |
| --- | ---------- | -------- | -------- | ---- | -------- |
| 1   | （記入欄） | （内容） | （方針） | -    | [ ]      |
| 2   | （記入欄） | （内容） | （方針） | -    | [ ]      |

---

## Phase 4開始条件

| 条件                                                                      | 確認 |
| ------------------------------------------------------------------------- | ---- |
| Check 1〜6 の判定がすべて PASS または MINOR 解消済み                      | [ ]  |
| MAJOR 指摘が 0 件                                                         | [ ]  |
| レビュー結果が `outputs/phase-3/design-review-result.md` に記録されている | [ ]  |

---

## 参照資料

| 資料名                        | パス                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| analyticsHandler.ts（実装中） | `apps/desktop/src/main/ipc/analyticsHandler.ts`                        |
| Preload チャネル定義          | `apps/desktop/src/preload/channels.ts`                                 |
| shared チャネル定義           | `packages/shared/src/ipc/channels.ts`                                  |
| Phase 1 要件定義              | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-1/` |
| Phase 2 設計書                | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-2/` |
| 前提タスク完了物              | UT-W3-ANALYTICS-ADAPTER-001 の完了成果物                               |

---

| 要件定義書（FR/NFR/AC/IPC4層整合性） | `outputs/phase-1/requirements-summary.md` | Phase 1 成果物 |
| 設計書（クラス設計/IPC4層/リトライ/DI境界） | `outputs/phase-2/design-summary.md` | Phase 2 成果物 |

## 実行手順

1. Phase 2 設計書（`outputs/phase-2/`）を開き、設計の全体像を把握する
2. Check 1〜6 を順番にレビューし、各観点の判定（OK / NG）を記録する
3. NG 項目が MINOR 相当の場合、MINOR 追跡テーブルに記入する
4. NG 項目が MAJOR 相当の場合、Phase 2 差し戻しを宣言する
5. 全 Check が PASS/MINOR 解消済みになったら `outputs/phase-3/design-review-result.md` に結果を記録する
6. Phase 4 開始条件を確認し、次 Phase への移行を宣言する

---

## 成果物

| 成果物               | パス                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| 設計レビュー結果記録 | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-3/design-review-result.md` |

---

## 完了条件

- [ ] Check 1: `AnalyticsHttpProvider` クラス設計の妥当性が確認された
- [ ] Check 2: IPC 4層整合性（channels.ts / analyticsHandler.ts / Preload / ホワイトリスト）が確認された
- [ ] Check 3: エラーハンドリング設計（エラー非伝播・failedCount 更新）が確認された
- [ ] Check 4: リトライ（指数バックオフ × 最大3回）・タイムアウト（5秒）設計が確認された
- [ ] Check 5: セキュリティ観点（エンドポイント URL 検証・PII 非送信）が確認された
- [ ] Check 6: 既存テストへの影響範囲が確認された
- [ ] MAJOR 指摘が 0 件であること
- [ ] MINOR 指摘がある場合、すべて解消済みであること
- [ ] レビュー結果が `outputs/phase-3/design-review-result.md` に記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

本 Phase の全チェックを完了した後、以下を必ず実行して確認すること：

```bash
# レビュー結果ファイルが作成されているかを確認
ls docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-3/

# 既存のanalyticsHandler関連テストが壊れていないことを確認
pnpm vitest run apps/desktop/src/main/ipc/__tests__/ --reporter=verbose 2>&1 | tail -20
```

上記コマンドがエラーなく完了し、全完了条件にチェックが入ったことを確認してから Phase 4 へ進むこと。

---

## 次Phase

Phase 4: テスト作成（TDD Red） - `phase-4-test-creation.md`
