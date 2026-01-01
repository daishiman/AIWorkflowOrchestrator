# Level 2: Intermediate

## 概要

実務で頻繁に遭遇するフレーキーテストパターンと、その具体的な修正方法。
resources/scripts/templatesの活用を前提とした運用を整理します。

## 前提条件

- Level 1の内容を理解している
- 基本的な3つのアプローチを実践できる
- テストフレームワークの基本的な使い方を習得している

## 5つの非決定性パターンと対処法

詳細は `references/non-determinism-patterns.md` を参照。

### 1. 時刻依存の非決定性

**問題**: 現在時刻やタイムゾーンに依存するテスト

**対処法**:

- テストデータで期限を明示的に設定
- Mockライブラリで時刻を固定（例: `vi.setSystemTime()`）
- タイムゾーンを明示的に指定

**参照**: `references/non-determinism-patterns.md` の「時刻依存の非決定性」セクション

### 2. ランダム性の非決定性

**問題**: 乱数や確率的な処理に依存するテスト

**対処法**:

- 乱数シードを固定
- Mockで乱数生成をスタブ化
- テストでは決定的なデータを使用

**参照**: `references/non-determinism-patterns.md` の「ランダム性の非決定性」セクション

### 3. 外部API依存の非決定性

**問題**: 外部サービスの状態や応答時間に依存するテスト

**対処法**:

- MSW（Mock Service Worker）でAPIをモック
- テスト用のフェイクサービスを用意
- 依存注入でテストダブルを注入

**参照**: `references/non-determinism-patterns.md` の「外部API依存の非決定性」セクション

### 4. 並行処理の非決定性

**問題**: レースコンディション、タイミング依存

**対処法**:

- `waitFor`系メソッドで確実に待機
- ポーリングで状態を確認
- テストの実行順序を制御

**参照**: `references/non-determinism-patterns.md` の「並行処理の非決定性」セクション

### 5. ネットワークの非決定性

**問題**: ネットワーク遅延、タイムアウト、接続失敗

**対処法**:

- リトライロジックを実装
- タイムアウト値を適切に設定
- ネットワークエラーをシミュレート可能にする

**参照**: `references/retry-strategies.md` および `references/non-determinism-patterns.md` の「ネットワークの非決定性」セクション

## リトライ戦略の実装

詳細は `references/retry-strategies.md` を参照。

### Playwrightの自動リトライ

**グローバル設定**:

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

**テストレベル設定**:

```typescript
test("重要なテスト", { retries: 3 }, async ({ page }) => {
  // ...
});
```

### カスタムリトライロジック

**指数バックオフ**:

```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2 ** i * 1000));
    }
  }
}
```

## スクリプト活用

### フレーキーテスト検出

```bash
node scripts/detect-flaky-tests.mjs \
  --log-path ./test-results.json \
  --threshold 0.8
```

**出力**: フレーキーテストのリスト（成功率、失敗パターン分類、優先度）

### 使用記録

```bash
node scripts/log_usage.mjs \
  --result success \
  --phase "implement-fixes" \
  --notes "5つのテストを修正"
```

## テンプレート活用

`assets/stable-test-template.ts` を参考に、安定したテストを作成する。

**テンプレートの特徴**:

- 非決定性の排除
- 適切な待機処理
- エラーハンドリング
- テストデータの独立性

## 実践手順

1. フレーキーテストを `scripts/detect-flaky-tests.mjs` で検出
2. `references/non-determinism-patterns.md` で該当パターンを特定
3. 該当する対処法を適用（必要に応じて `references/retry-strategies.md` を参照）
4. `assets/stable-test-template.ts` のパターンに従って修正
5. 修正後、複数回実行して安定性を検証
6. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] 5つの非決定性パターンを識別できる
- [ ] 各パターンに対する対処法を実装できる
- [ ] リトライ戦略を適切に設定できる
- [ ] スクリプトを活用してフレーキーテストを検出できる
- [ ] テンプレートを参考に安定したテストを作成できる
- [ ] 次のステップ（Level 3）に進む準備ができている
