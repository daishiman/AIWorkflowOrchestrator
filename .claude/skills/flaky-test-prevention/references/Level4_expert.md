# Level 4: Expert

## 概要

エッジケース、パフォーマンス最適化、フィードバックループを回しながらスキルを継続的に改善する方法を整理します。

## 前提条件

- Level 3の運用を完了している
- Task分離とProgressive Disclosureを実践できる
- スクリプトの実行とログ更新ができる

## エッジケースとトラブルシューティング

### エッジケース1: タイムゾーン境界での失敗

**問題**: 日付の境界（午前0時）でテストが失敗する

**対処法**:

```typescript
// ❌ 悪い例: ローカルタイムゾーンに依存
const today = new Date().toISOString().split("T")[0];

// ✅ 良い例: UTCで統一
const today = new Date(Date.UTC(2024, 0, 15)).toISOString().split("T")[0];
```

**参照**: `references/non-determinism-patterns.md` の「時刻依存の非決定性」→「タイムゾーン依存」

### エッジケース2: リトライが逆効果になる

**問題**: リトライによってテストが余計に不安定になる

**原因**: リトライ対象が根本的に不安定（非決定的な設計）

**対処法**:

1. リトライを一時的に無効化
2. 根本原因を `agents/analyze-non-determinism.md` で分析
3. 非決定性を排除してから、必要に応じてリトライを再有効化

### エッジケース3: Fixtureの競合

**問題**: 並列実行時にFixtureが競合する

**対処法**:

```typescript
// ✅ 良い例: テストごとに独立したFixture
test.beforeEach(async ({ page }) => {
  const uniqueId = Date.now() + Math.random();
  await page.goto(`/test?id=${uniqueId}`);
});
```

## パフォーマンス最適化

### 最適化1: 検出スクリプトの高速化

大量のテスト履歴がある場合、検出スクリプトが遅くなる。

**対処法**:

- 最新N件のみを分析対象にする（`--limit` オプション）
- 並列処理で複数のログファイルを同時に処理
- キャッシュ機構を導入（既に分析済みのテストをスキップ）

### 最適化2: Task実行の並列化

独立したTaskは並列実行できる。

**例**: 複数のフレーキーテストを並列に修正

```bash
# Task 1: テストAの修正
# Task 2: テストBの修正（並列実行可能）
```

### 最適化3: リソースの選択的読み込み

すべてのリソースを読み込むのではなく、必要な部分のみを読み込む。

**例**:

- `references/non-determinism-patterns.md` の特定セクションのみを参照
- 頻繁に使う部分を要約メモとして保存

## フィードバックループ

### 1. 実行記録の蓄積

`scripts/log_usage.mjs` で使用履歴を記録する。

```bash
node scripts/log_usage.mjs \
  --result success \
  --phase "detect-and-fix" \
  --notes "10件のフレーキーテストを修正、すべて安定化に成功"
```

**記録される情報**:

- 実行日時
- 成功/失敗
- 実行フェーズ（detect / analyze / implement）
- 追加のメモ

### 2. 評価メトリクスの更新

`EVALS.json` で成功率やパターンを追跡する。

**メトリクス例**:

- 総実行回数
- 成功回数/失敗回数
- 成功率
- よくある失敗パターン

### 3. スキルの継続的改善

`LOGS.md` を定期的にレビューし、改善点を特定する。

**改善サイクル**:

1. `LOGS.md` で失敗パターンを分析
2. 新しいパターンが見つかれば `references/` に追加
3. よく使う修正方法を `assets/` にテンプレート化
4. `scripts/` に自動化スクリプトを追加

### 4. スキル構造の検証

```bash
node scripts/validate-skill.mjs
```

**検証項目**:

- SKILL.mdの存在と形式
- YAML frontmatterの妥当性
- リソースファイルへのリンク切れチェック
- agents/内のTask仕様書の完全性

## 高度なテクニック

### テクニック1: カスタムMatchers

頻繁に使う検証をカスタムMatcherにする。

```typescript
expect.extend({
  async toBeStableAfterRetries(testFn, retries = 10) {
    let successes = 0;
    for (let i = 0; i < retries; i++) {
      try {
        await testFn();
        successes++;
      } catch (e) {
        // 失敗はカウントしない
      }
    }
    const successRate = successes / retries;
    return {
      pass: successRate === 1.0,
      message: () => `Expected 100% success rate, got ${successRate * 100}%`,
    };
  },
});
```

### テクニック2: フレーキーテストの自動隔離

CI/CDパイプラインでフレーキーテストを検出し、自動的に隔離する。

```yaml
# .github/workflows/test.yml
- name: Detect flaky tests
  run: node scripts/detect-flaky-tests.mjs --log-path ./test-results.json
- name: Quarantine flaky tests
  if: failure()
  run: |
    # フレーキーテストを別のスイートに移動
    node scripts/quarantine-flaky-tests.mjs
```

### テクニック3: メトリクスダッシュボード

フレーキーテスト率を可視化し、改善トレンドを追跡する。

**メトリクス例**:

- 週次フレーキーテスト検出数
- 修正成功率
- カテゴリ別の分布（時刻依存、ネットワーク等）

## 実践手順

1. `LOGS.md` で過去の実行履歴を分析
2. エッジケースやトラブルシューティングが必要な場合は、このレベルの知識を活用
3. パフォーマンス最適化が必要な場合は、該当セクションを参照
4. フィードバックループを回して、スキルを継続的に改善
5. 高度なテクニックを適用して、フレーキーテスト防止を自動化・効率化

## チェックリスト

- [ ] エッジケースに対処できる
- [ ] パフォーマンス最適化を実施できる
- [ ] フィードバックループを回している
- [ ] スキル構造の検証を実施した
- [ ] 高度なテクニックを活用できる
- [ ] 継続的改善のサイクルが確立している
