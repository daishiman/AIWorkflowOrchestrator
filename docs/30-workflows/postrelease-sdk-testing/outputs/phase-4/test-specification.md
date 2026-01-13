# Agent SDK ポストリリーステスト仕様書

> Phase 4 成果物
> 作成日: 2026-01-12
> スキル: e2e-test-design, performance-testing

---

## 1. 概要

本ドキュメントは、Claude Agent SDK統合のポストリリーステスト仕様を定義する。

### 1.1 テストスコープ

| テストカテゴリ       | ファイル                         | 目的                     |
| -------------------- | -------------------------------- | ------------------------ |
| E2E統合テスト        | agent-sdk-integration.spec.ts    | 機能的な統合検証         |
| パフォーマンステスト | agent-performance.spec.ts        | レスポンス時間・閾値検証 |
| 安定性テスト         | scripts/long-running-test.mjs    | 長時間実行の安定性検証   |
| ネットワーク障害     | agent-network-resilience.spec.ts | 障害時の回復性検証       |

### 1.2 テスト環境

- **ブラウザ**: Chromium (Playwright)
- **アプリケーション**: Electron (localhost:3000)
- **SDK バージョン**: 0.2.5
- **Node.js**: v20.x

---

## 2. E2E統合テスト仕様

### 2.1 テストID一覧

| ID     | テスト名                              | 優先度 | 自動化 |
| ------ | ------------------------------------- | ------ | ------ |
| E2E-01 | 認証済み環境で正常初期化              | 高     | ✅     |
| E2E-02 | 新規セッションIDを取得                | 高     | ✅     |
| E2E-03 | プロンプト送信と応答受信              | 高     | ✅     |
| E2E-04 | ストリーミング応答がリアルタイム表示  | 高     | ✅     |
| E2E-05 | セッション再開で会話履歴を保持        | 中     | ✅     |
| E2E-06 | セッション破棄でセッションが無効化    | 中     | ✅     |
| E2E-07 | 最大10セッションまで管理可能          | 低     | ✅     |
| E2E-08 | PermissionDialogが表示される          | 高     | ✅     |
| E2E-09 | 未認証時にエラー表示                  | 高     | ✅     |
| E2E-10 | 設定時間超過でタイムアウトエラー      | 中     | ✅     |
| E2E-11 | abort()でクエリ停止                   | 中     | ✅     |
| E2E-12 | 期限切れセッションで適切なエラー表示  | 中     | ✅     |
| E2E-13 | 空のプロンプトでバリデーションエラー  | 中     | ✅     |
| E2E-14 | 最大プロンプト長（100,000文字）の処理 | 低     | ✅     |
| E2E-15 | 11番目のセッション作成でエラー        | 低     | ✅     |
| E2E-16 | 最大タイムアウト（300秒）設定が有効   | 低     | ✅     |

### 2.2 テストシナリオ詳細

#### E2E-01: 認証済み環境で正常初期化

```gherkin
Given ユーザーが認証済みの状態である
When /agent ページにアクセスする
Then agent-status が "initialized" と表示される
And エラーメッセージが表示されない
```

#### E2E-03: プロンプト送信と応答受信

```gherkin
Given セッションが作成されている
When プロンプト "Hello, Claude!" を送信する
Then 応答エリアにテキストが表示される
And execution-status が "completed" になる
```

#### E2E-08: PermissionDialogが表示される

```gherkin
Given セッションが作成されている
When "Create a file named test.txt" を送信する
Then permission-dialog が表示される
And permission-tool-name に "Write" が含まれる
```

---

## 3. パフォーマンステスト仕様

### 3.1 テストID一覧

| ID      | メトリクス         | 閾値（P50） | 計測回数 |
| ------- | ------------------ | ----------- | -------- |
| PERF-01 | SDK初期化時間      | ≤ 1000ms    | 10回     |
| PERF-02 | セッション作成時間 | ≤ 200ms     | 10回     |
| PERF-03 | 初回応答時間       | ≤ 500ms     | 10回     |
| PERF-04 | メッセージ間遅延   | ≤ 100ms     | 可変     |

### 3.2 メトリクス計測方法

#### PERF-01: SDK初期化時間

```typescript
// 計測開始: page.goto("/agent") 直後
// 計測終了: agent-status="initialized" 検出時
const startTime = performance.now();
await page.goto("/agent");
await page.waitForSelector(
  '[data-testid="agent-status"][data-status="initialized"]',
);
const endTime = performance.now();
```

#### PERF-03: 初回応答時間

```typescript
// 計測開始: send-button クリック直後
// 計測終了: 最初の response-chunk 検出時
const startTime = performance.now();
await page.click('[data-testid="send-button"]');
await page.waitForSelector('[data-testid="response-chunk"]');
const endTime = performance.now();
```

### 3.3 レポート形式

```json
{
  "testDate": "2026-01-12T...",
  "sdkVersion": "0.2.5",
  "environment": {
    "os": "darwin",
    "nodeVersion": "v20.x",
    "electronVersion": "28.x"
  },
  "metrics": {
    "sdkInitTime": {
      "p50": 850,
      "p95": 1200,
      "p99": 1500,
      "threshold": 1000,
      "passed": true
    }
  },
  "overallPassed": true
}
```

---

## 4. 安定性テスト仕様

### 4.1 テスト設定

| 設定項目                | 値        | 説明                           |
| ----------------------- | --------- | ------------------------------ |
| testDurationMs          | 3,600,000 | 1時間連続実行                  |
| queryIntervalMs         | 30,000    | 30秒間隔でクエリ               |
| sessionRotationInterval | 10        | 10クエリごとにセッション再作成 |
| memoryCheckIntervalMs   | 60,000    | 1分間隔でメモリ計測            |

### 4.2 成功条件

| 条件         | 閾値    |
| ------------ | ------- |
| 成功率       | ≥ 95%   |
| エラー率     | ≤ 5%    |
| メモリ増加量 | ≤ 100MB |

### 4.3 実行方法

```bash
# フル実行（1時間）
node apps/desktop/scripts/long-running-test.mjs

# 短縮テスト（環境変数で制御可能）
TEST_DURATION_MS=300000 node apps/desktop/scripts/long-running-test.mjs
```

---

## 5. ネットワーク障害テスト仕様

### 5.1 テストID一覧

| ID     | テスト名                                     | シナリオ           |
| ------ | -------------------------------------------- | ------------------ |
| NET-01 | オフライン状態でクエリ送信時にエラー表示     | オフライン         |
| NET-02 | オフライン状態でセッション作成時にエラー表示 | オフライン         |
| NET-03 | オフライン時にオフラインインジケーターが表示 | オフライン         |
| NET-04 | オンライン復旧でインジケーター非表示         | 復旧               |
| NET-05 | 接続復旧後にクエリが正常に実行できる         | 復旧               |
| NET-06 | クエリ実行中のネットワーク断でエラー後復旧   | 断続               |
| NET-07 | ネットワーク遅延でタイムアウトエラー         | タイムアウト       |
| NET-08 | タイムアウト後のリトライが正常動作           | リトライ           |
| NET-09 | 500エラー時に適切なエラーメッセージ          | サーバーエラー     |
| NET-10 | 429エラー（レート制限）時に適切なエラー      | レート制限         |
| NET-11 | 503エラー（サービス利用不可）時にリトライ    | サービス停止       |
| NET-12 | 認証エラー（401）時に再認証を促す            | 認証エラー         |
| NET-13 | 接続が不安定な状態でもセッションが維持       | 断続的接続         |
| NET-14 | ストリーミング中の一時的な接続断から復旧     | ストリーミング障害 |
| NET-15 | WebSocket接続が切断された場合に再接続        | WebSocket障害      |
| NET-16 | WebSocket再接続成功後にクエリが継続          | WebSocket復旧      |
| NET-17 | ネットワークエラー後にエラー状態がクリア     | エラー回復         |
| NET-18 | 連続エラー後もアプリケーションが応答         | 連続障害           |

### 5.2 シミュレーション方法

```typescript
// オフラインシミュレーション
await context.setOffline(true);

// ネットワーク遅延シミュレーション
await page.route("**/*", async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await route.continue();
});

// HTTPエラーシミュレーション
await page.route("**/api/**", (route) => {
  route.fulfill({
    status: 500,
    body: JSON.stringify({ error: "Internal Server Error" }),
  });
});
```

---

## 6. テスト実行手順

### 6.1 前提条件

1. アプリケーションが起動している（localhost:3000）
2. 認証済みの状態である
3. Claude API キーが設定されている

### 6.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:e2e

# E2E統合テストのみ
pnpm --filter @repo/desktop test:e2e -- agent-sdk-integration.spec.ts

# パフォーマンステストのみ
pnpm --filter @repo/desktop test:e2e -- agent-performance.spec.ts

# ネットワーク障害テストのみ
pnpm --filter @repo/desktop test:e2e -- agent-network-resilience.spec.ts

# 安定性テスト
node apps/desktop/scripts/long-running-test.mjs
```

### 6.3 レポート出力先

```
apps/desktop/
├── test-results/
│   ├── performance/
│   │   └── performance-{timestamp}.json
│   └── stability/
│       └── stability-{timestamp}.json
└── playwright-report/
    └── index.html
```

---

## 7. TDD Red状態の確認

### 7.1 期待される失敗

Phase 4（TDD Red）では、以下のテストが**失敗**することを確認する：

1. **E2Eテスト**: 対応するUIコンポーネントが未実装のため失敗
2. **パフォーマンステスト**: data-testid属性が未設定のため失敗
3. **安定性テスト**: エージェントページが存在しないため失敗
4. **ネットワーク障害テスト**: オフラインインジケーターが未実装のため失敗

### 7.2 Red状態の検証コマンド

```bash
# テストが失敗することを確認
pnpm --filter @repo/desktop test:e2e -- --reporter=list 2>&1 | grep -E "(✓|✗|×)"

# 期待: すべてのテストが失敗（×またはfailed）
```

---

## 変更履歴

| バージョン | 日付       | 変更内容                |
| ---------- | ---------- | ----------------------- |
| 1.0.0      | 2026-01-12 | 初版作成（Phase 4完了） |
