# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 4                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 前提Phase  | Phase 3                                              |
| 後続Phase  | Phase 5                                              |
| 作成日     | 2026-04-13                                           |
| ステータス | pending                                              |

## 目的

`sendToAnalyticsProvider` の TDD Red テストを作成し、実装前に全テストが失敗することを確認する。

## 背景

Phase 3 でゲートを通過した設計に基づき、HTTP 送信パスのテストケースを作成する。TDD アプローチで Red → Green → Refactor のサイクルを開始する。

## 実行タスク

- Phase 3 の gate 結果を踏まえて Red テスト対象を固定する
- `sendToAnalyticsProvider` 呼び出し経路の success:true / error swallow を検証する
- fetch モックと timeout / exception / skipped path を網羅する
- 命名規則・型整合・public callback 経由テスト方針を確定する

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                |
| ---------- | ------------------ | ------------------------------------- |
| SubAgent-A | HTTP 送信テスト    | fetch モック、POST 送信確認           |
| SubAgent-B | エラーハンドリング | タイムアウト、例外握り潰しテスト      |
| SubAgent-C | 条件分岐テスト     | NODE_ENV, ANALYTICS_ENDPOINT_URL 条件 |
| SubAgent-D | 統合判定           | 命名規則・型整合・網羅率確認          |

## テスト対象

- **ファイル**: `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`
- **対象関数**: `sendToAnalyticsProvider`（analyticsHandler.ts 内）
- **フレームワーク**: Vitest

## Private メソッドテスト方針

`sendToAnalyticsProvider` が内部関数の場合:

- `registerAnalyticsHandlers()` が返す IPC ハンドラを経由してテストする（public callback 経由）
- または `analyticsHandler.ts` から export された場合は直接テスト
- `(module as unknown as ModulePrivate)` キャストパターンを使用しない（副作用が大きいため）

## テストケース一覧

| ID    | テストケース                                                | 期待結果                                 | Red理由                        |
| ----- | ----------------------------------------------------------- | ---------------------------------------- | ------------------------------ |
| TC-01 | production + URL 設定 → HTTP POST を呼ぶ                    | fetch が 1 回呼ばれる                    | sendToAnalyticsProvider 未実装 |
| TC-02 | production + URL 未設定 → fetch を呼ばない                  | fetch が 0 回呼ばれる                    | sendToAnalyticsProvider 未実装 |
| TC-03 | development + URL 設定 → fetch を呼ばない                   | fetch が 0 回呼ばれる                    | sendToAnalyticsProvider 未実装 |
| TC-04 | fetch 成功 → `{ success: true }` を返す                     | success: true                            | sendToAnalyticsProvider 未実装 |
| TC-05 | fetch 例外 → `success: true` を返し、例外を握り潰す         | success: true + error swallow            | sendToAnalyticsProvider 未実装 |
| TC-06 | fetch タイムアウト → `success: true` を返し、例外を握り潰す | success: true + error swallow            | sendToAnalyticsProvider 未実装 |
| TC-07 | optedOut=true → fetch を呼ばない（既存テスト確認）          | skipped: true                            | 既存テストで確認               |
| TC-08 | リクエストボディが正しい JSON 形式                          | eventName, payload, timestamp が含まれる | sendToAnalyticsProvider 未実装 |

## fetch モック方法

```typescript
// Vitest でのモック設定（設計書記載）
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch); // ← vi.stubGlobal("window") は禁止

beforeEach(() => {
  vi.resetAllMocks();
  process.env.ANALYTICS_ENDPOINT_URL = "https://example.com/analytics";
  process.env.NODE_ENV = "production";
});

afterEach(() => {
  delete process.env.ANALYTICS_ENDPOINT_URL;
  vi.unstubAllGlobals();
});
```

## 依存整合確認（Phase 4 開始前チェック）

```bash
# worktree 環境では esbuild バイナリ不一致が多発するため必須チェック
pnpm install
pnpm --filter @repo/shared build
```

## 統合テスト連携【必須】

統合テストシナリオを後続 Phase と結び付ける:

| 統合ポイント               | 検証内容                                   | テストファイル             |
| -------------------------- | ------------------------------------------ | -------------------------- |
| `analytics:send` → handler | validation / opt-out / HTTP 送信経路       | `analyticsHandler.test.ts` |
| fetch / timeout            | success:true + swallowed error の確認      | `analyticsHandler.test.ts` |
| request body               | eventName, payload, timestamp の JSON 形式 | `analyticsHandler.test.ts` |

## 参照資料

| 参照資料             | パス                                                         | 説明             |
| -------------------- | ------------------------------------------------------------ | ---------------- |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                     | Phase 1 成果物   |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                     | Phase 2 成果物   |
| HTTP送信設計         | `outputs/phase-2/http-send-design.md`                        | Phase 2 成果物   |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                           | Phase 2 成果物   |
| analyticsHandler     | `apps/desktop/src/main/ipc/analyticsHandler.ts`              | 実装対象ファイル |
| ゲート判定           | `outputs/phase-3/gate-decision.md`                           | Phase 3 成果物   |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                 | Phase 1 成果物   |
| 仕様抽出結果         | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | Phase 1 成果物   |
| 差分カバレッジ       | `outputs/phase-1/branch-diff-coverage.md`                    | Phase 1 成果物   |
| トレーサビリティ行列 | `outputs/phase-1/implementation-spec-traceability-matrix.md` | Phase 1 成果物   |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md`           | Phase 2 成果物   |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`                    | Phase 3 成果物   |
| 矛盾チェック表       | `outputs/phase-3/contradiction-checklist.md`                 | Phase 3 成果物   |

## 成果物

| 成果物             | パス                                    | 説明                       |
| ------------------ | --------------------------------------- | -------------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md` | TC 一覧と期待結果          |
| Red結果            | `outputs/phase-4/red-test-result.md`    | 全テスト失敗の記録         |
| HTTP送信モック設計 | `outputs/phase-4/http-mock-design.md`   | fetch モック方法の詳細設計 |

## 完了条件

- [ ] TC-01〜TC-08 のテストケースが作成されていること
- [ ] 全テストが Red（失敗）であることが確認されていること
- [ ] fetch モック方法が `vi.stubGlobal("fetch", ...)` であることが確認されていること
- [ ] `vi.stubGlobal("window", ...)` を使用していないことが確認されていること
- [ ] 命名規則が既存コードと一致していること（camelCase）
- [ ] `pnpm --filter @repo/desktop test` でテストが実行できること
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列テスト作成
3. SubAgent-D の統合判定（命名・型・網羅率）
4. Red 確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 全テストが Red であることを確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001
```

## 次のPhase

Phase 5: 実装
