# Commit Hooks Performance Optimization

## パフォーマンス問題

### 遅いコミットフックの影響

- 開発者体験悪化
- コミット頻度低下
- フック無効化の誘因（`--no-verify`）

**目標実行時間**: <5秒

## 最適化戦略

### 1. ステージングファイルのみ処理

**lint-staged使用**:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

**効果**: 全ファイルスキャン回避

**比較**:

- 全ファイル: 30秒
- ステージングのみ: 3秒

### 2. キャッシュ活用

**ESLint**:

```bash
eslint --cache --fix
```

**効果**:

- 初回: 10秒
- 2回目以降: 2秒（80%削減）

**Prettier**:

```bash
prettier --cache --write
```

### 3. 並列実行

**lint-stagedデフォルト**: 並列実行

**カスタマイズ**:

```javascript
// .lintstagedrc.js
module.exports = {
  concurrent: true, // 並列実行（デフォルト）
  chunkSize: 10, // 10ファイルずつ処理
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
};
```

### 4. 対象ファイル絞り込み

**不要なファイル除外**:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix"],
    "!**/*.d.ts": ["eslint --fix"], // 型定義除外
    "!**/dist/**": ["eslint --fix"] // ビルド成果物除外
  }
}
```

**.eslintignore活用**:

```
node_modules/
dist/
build/
*.min.js
```

### 5. 型チェックスキップ

**型チェックは遅い**:

```bash
tsc --noEmit  # 5-10秒かかる
```

**代替案**:

- pre-pushで実行（pre-commitではスキップ）
- CI/CDで実行

**pre-commit**:

```bash
pnpm lint-staged  # 型チェックなし、高速
```

**pre-push**:

```bash
pnpm tsc --noEmit  # push前に型チェック
pnpm test
```

### 6. テスト実行戦略

**全テスト実行は遅い**:

```bash
pnpm test  # 30秒-数分
```

**最適化**:

```javascript
// 関連テストのみ
'*.{ts,tsx}': (filenames) => [
  'eslint --fix',
  `vitest related --run ${filenames.join(' ')}`  # 関連のみ
];
```

**または**:

- pre-commit: テストなし（高速）
- pre-push: 全テスト（厳格）

## ベンチマーク

### 測定方法

```bash
# 実行時間計測
time git commit -m "test"
```

### 目標値

| フック     | 目標時間 | 許容時間 |
| ---------- | -------- | -------- |
| pre-commit | <3秒     | <5秒     |
| commit-msg | <1秒     | <2秒     |
| pre-push   | <30秒    | <60秒    |

### 最適化前後比較

**最適化前**:

```bash
# 全ファイルlint + format + 型チェック + テスト
real    0m45.231s
```

**最適化後**:

```bash
# ステージングファイルのみ lint + format
real    0m2.847s
```

**削減率**: 94%

## トラブルシューティング

### 問題1: コミットが遅すぎる

**診断**:

```bash
DEBUG=lint-staged* git commit
```

**解決策**:

1. キャッシュ有効化
2. 対象ファイル絞り込み
3. 型チェック/テストをpre-pushに移行

### 問題2: メモリ不足

**症状**: `JavaScript heap out of memory`

**解決**:

```bash
# Node.jsメモリ増加
export NODE_OPTIONS="--max-old-space-size=4096"
```

**lint-staged設定**:

```javascript
{
  chunkSize: 5  # チャンクサイズ削減
}
```

### 問題3: 並列実行でエラー

**症状**: ランダムに失敗

**解決**:

```javascript
{
  concurrent: false; // 直列実行に変更
}
```

## ベストプラクティス

### 高速pre-commit

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --cache --fix", "prettier --cache --write"]
  }
}
```

### 厳格pre-push

```bash
#!/usr/bin/env sh
pnpm tsc --noEmit
pnpm test --run
pnpm build
```

### 段階的品質ゲート

```
commit時:
  - lint（高速）
  - format（高速）

push時:
  - 型チェック（中速）
  - テスト（中速）
  - ビルド（遅い）

CI/CD時:
  - 全品質チェック
  - E2Eテスト
  - セキュリティスキャン
```

## まとめ

**最適化優先順位**:

1. ステージングファイルのみ（最重要）
2. キャッシュ有効化
3. 並列実行
4. 対象ファイル絞り込み
5. 重い処理をpre-pushに移行

**目標**:

- pre-commit: <5秒
- 開発者体験を損なわない
- 品質と速度のバランス
