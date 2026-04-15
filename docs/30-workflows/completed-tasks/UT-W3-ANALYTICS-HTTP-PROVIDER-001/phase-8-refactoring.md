# Phase 8: リファクタリング（TDD Refactor） - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 8                                                       |
| Phase名    | リファクタリング（TDD Refactor）                        |
| タスクID   | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル   | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| 前提Phase  | Phase 7: テストカバレッジ確認                           |
| 次Phase    | Phase 9: 品質保証                                       |
| ステータス | pending                                                 |
| 作成日     | 2026-04-14                                              |

## 目的

TDD の Refactor フェーズとして、全テストが GREEN を維持したまま
`AnalyticsHttpProvider.ts` と `analyticsHandler.ts` のコード品質を改善する。
可読性・保守性を高め、Phase 9 の品質保証ゲートを通過できる状態にする。

> **原則**: リファクタリング中は外部から観測可能な振る舞いを変えない。
> テストが RED になった場合はリファクタリングを中断して原因を特定すること。

## 実行タスク

### Task 8-1: AnalyticsHttpProvider コード品質改善

#### 指数バックオフロジックの明確化

リトライ間隔の計算式が実装コード内にマジックナンバーとして埋め込まれている場合、
名前付き定数と説明コメントに置き換える。

**改善前（例）**:

```typescript
await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 100));
```

**改善後（例）**:

```typescript
const BACKOFF_BASE_MS = 100;
// 指数バックオフ: 1回目=100ms, 2回目=200ms, 3回目=400ms
await new Promise((resolve) =>
  setTimeout(resolve, BACKOFF_BASE_MS * 2 ** attempt),
);
```

確認観点:

- [ ] バックオフの計算式が自己説明的であること
- [ ] 計算式のコメントに最大待機時間（worst case）が明記されていること
- [ ] リファクタ後も TC-13〜TC-15 が PASS すること

#### タイムアウト処理の整理

`AbortController` と `setTimeout` の対応関係が明確になっているか確認する。

確認観点:

- [ ] `clearTimeout` が `finally` 節で確実に呼ばれていること
- [ ] `AbortController.abort()` 呼び出し後の fetch エラー処理が明確であること
- [ ] タイムアウト発生時のログ出力が適切であること（機密情報を含まないこと）

#### 定数の抽出（RETRY_COUNT, TIMEOUT_MS）

実装コード内のリトライ回数・タイムアウト値をモジュールトップに定数として集約する。

**抽出対象定数**:

| 定数名            | 推奨値 | 説明                                     |
| ----------------- | ------ | ---------------------------------------- |
| `MAX_RETRY_COUNT` | `3`    | 最大リトライ回数（受入基準 AC-3 に対応） |
| `TIMEOUT_MS`      | `5000` | HTTP 送信タイムアウト（5 秒）            |
| `BACKOFF_BASE_MS` | `100`  | 指数バックオフの基底値（ms）             |

確認観点:

- [ ] 定数が `AnalyticsHttpProvider.ts` のモジュールトップに集約されていること
- [ ] テストコード側も同一定数を参照していること（ハードコードの重複なし）
- [ ] 定数変更時にテストが自動追従すること

---

### Task 8-2: analyticsHandler.ts の整理

#### 送信統計更新ロジックの責務整理

`analyticsHandler.ts` で `analyticsStore.sentCount` / `failedCount` を更新している箇所が
`AnalyticsHttpProvider` の結果を受けて行われているか、責務の境界を確認する。

| 責務                           | 配置場所                   | 確認観点                                         |
| ------------------------------ | -------------------------- | ------------------------------------------------ |
| HTTP 送信・リトライ            | `AnalyticsHttpProvider.ts` | Provider 内で完結していること                    |
| カウンター更新（sentCount 等） | `analyticsHandler.ts`      | Handler が Provider の結果を受けて更新すること   |
| オプトアウト判定               | `analyticsHandler.ts`      | Handler が送信前に判定し Provider を呼ばないこと |

確認観点:

- [ ] カウンター更新ロジックが Handler と Provider の両方に散在していないこと
- [ ] オプトアウト判定が Provider 内に漏れ込んでいないこと
- [ ] 責務境界の整理後も TC-01〜TC-17 が全て PASS すること

---

### Task 8-3: 型定義の整理

#### AnalyticsStoreSchema 拡張型の確認

`sentCount` / `failedCount` の型定義が `packages/shared/src/ipc/channels.ts` または
`analyticsHandler.ts` に適切に宣言されているか確認する。

| 確認項目                     | 確認観点                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `sentCount` の型             | `number` 型で初期値 `0` が設定されていること                                                   |
| `failedCount` の型           | `number` 型で初期値 `0` が設定されていること                                                   |
| `AnalyticsSendRequest` の型  | `eventName: string`, `payload: unknown`, `timestamp: number` を持つこと                        |
| `AnalyticsSendResponse` の型 | `success: boolean`, `error?: string` を持つこと                                                |
| 既存の IPC 型契約への影響    | 変更前後で `AnalyticsSendRequest` / `AnalyticsSendResponse` の型シグネチャが変わっていないこと |

確認観点:

- [ ] `any` 型が使われていないこと
- [ ] 型拡張が呼び出し側（Renderer / Preload）に破壊的変更を与えていないこと
- [ ] `packages/shared/src/ipc/channels.ts` の `analytics:send` チャンネル定義が最新であること

## リファクタリング禁止事項

以下の変更はリファクタリングの範囲外とし、実施しないこと。

| 禁止事項                                                            | 理由                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `AnalyticsSendRequest` / `AnalyticsSendResponse` の型シグネチャ変更 | 呼び出し側（Renderer/Preload）の変更を伴い、スコープ外となる |
| `analyticsHandler.ts` の IPC チャンネル名変更                       | `analytics:send` チャンネル名変更は後方互換性を破壊する      |
| リトライ回数・タイムアウト値の変更                                  | 受入基準 AC-3 に定義された値（3 回 / 5 秒）を変えない        |
| オプトアウト判定ロジックの移動                                      | Renderer 側と Main 側の二重防衛構造を維持すること            |
| テストの期待値変更                                                  | 振る舞いを変えない前提でのリファクタであること               |

## 参照資料

| 資料名                | パス                                                                | 説明                           |
| --------------------- | ------------------------------------------------------------------- | ------------------------------ |
| メインタスク仕様      | `docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001.md`            | 受入基準・スコープ定義         |
| 要件定義書            | `outputs/phase-1/requirements-definition.md`                        | Phase 1 成果物                 |
| 設計書                | `outputs/phase-2/design-document.md`                                | Phase 2 成果物                 |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                         | Phase 5 成果物                 |
| 変更ファイル一覧      | `outputs/phase-5/changed-files.md`                                  | Phase 5 成果物                 |
| 拡張テストケース一覧  | `outputs/phase-6/expanded-test-cases.md`                            | Phase 6 成果物（壊さないこと） |
| カバレッジレポート    | `outputs/phase-7/coverage-report.md`                                | Phase 7 成果物                 |
| AnalyticsHttpProvider | `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts` | リファクタ対象ファイル         |
| analyticsHandler      | `apps/desktop/src/main/ipc/analyticsHandler.ts`                     | リファクタ対象ファイル         |
| channels.ts           | `packages/shared/src/ipc/channels.ts`                               | 型定義確認対象                 |

## 実行手順

1. Phase 7 のカバレッジレポート（`outputs/phase-7/coverage-report.md`）を確認し、
   目標が達成されていることを前提とする
2. `pnpm --filter @repo/desktop test` を実行し、全テストが GREEN であることを確認する
3. Task 8-1 を実施する（定数抽出 → バックオフ明確化 → タイムアウト整理の順で）
4. 各変更後に `pnpm --filter @repo/desktop test` を実行して GREEN を維持することを確認する
5. Task 8-2 を実施し、責務境界を整理する
6. Task 8-3 を実施し、型定義を確認・整理する
7. 全変更後に `pnpm --filter @repo/desktop test` を実行して全テスト GREEN を最終確認する
8. リファクタリング内容を `outputs/phase-8/refactoring-record.md` に記録する

## 成果物

| 成果物               | パス                                             | 説明                            |
| -------------------- | ------------------------------------------------ | ------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`          | 変更内容・判断理由・テスト結果  |
| 定数定義一覧         | `outputs/phase-8/constants-definition.md`        | 抽出した定数の一覧と根拠        |
| 責務境界マップ       | `outputs/phase-8/responsibility-boundary-map.md` | Handler / Provider の責務分担図 |

## 完了条件

- [ ] `MAX_RETRY_COUNT` / `TIMEOUT_MS` / `BACKOFF_BASE_MS` が定数として抽出されている
- [ ] 指数バックオフロジックにコメントが付き、最大待機時間が明記されている
- [ ] `clearTimeout` が `finally` 節で確実に呼ばれていること
- [ ] カウンター更新ロジックが Handler と Provider に重複していないこと
- [ ] `any` 型が使われていないこと
- [ ] `AnalyticsSendRequest` / `AnalyticsSendResponse` の型シグネチャが変更されていないこと
- [ ] リファクタ後も TC-01〜TC-17 が全て PASS していること
- [ ] 成果物テーブル記載のファイルが全件生成されていること

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 8-1 / 8-2 / 8-3）を 100% 実行完了
- [ ] リファクタリング前後でテストが全て GREEN であることを確認した
- [ ] 禁止事項に違反する変更が行われていないことを確認した
- [ ] 実行記録を `outputs/phase-8/` に残した

```bash
pnpm --filter @repo/desktop test
pnpm typecheck
```

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
