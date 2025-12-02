# 品質指標定義

## メトリクス体系

### コードカバレッジ
```
対象: ユニットテスト
指標: ブランチカバレッジ
基準: 80%以上
計測: Jest, nyc
```

実装例:
```bash
jest --coverage --collectCoverageFrom="src/**/*.ts"
```

### 複雑度メトリクス
```
循環複雑度: 10以下
認知複雑度: 15以下
深さ: 4以下
```

計測ツール:
```bash
pnpm install --save-dev eslint-plugin-sonarjs
# ESLintで自動計測
```

### バグリスク指標
```
Critical: 0個
High: 0個
Medium: <3個
Low: <5個
```

計測方法:
```bash
pnpm audit --production
npx sonarqube-scanner
```

## テスト品質指標

### ユニットテスト
- カバレッジ: 80%以上
- パス率: 100%
- 実行時間: <30秒

### 統合テスト
- カバレッジ: 60%以上
- パス率: 100%
- 実行時間: <2分

### E2Eテスト
- カバレッジ: 主要フロー
- パス率: 100%
- 実行時間: <10分

## セキュリティメトリクス

### 脆弱性スキャン
```
Critical: 0個
High: 0個
Medium: <3個（古いライブラリは除外可）
```

### 依存関係管理
```
outdated パッケージ: <5個
major更新可能: <10個
```

計測:
```bash
pnpm audit
pnpm outdated
```

### 秘密情報検出
```
APIキーの検出: 0個
パスワードの検出: 0個
```

計測:
```bash
git diff --staged | grep -E "api_key|secret|password"
```

## パフォーマンスメトリクス

### ビルド時間
```
開発ビルド: <5秒
本番ビルド: <30秒
インクリメンタル: <2秒
```

### バンドルサイズ
```
メインバンドル: <500KB
チャンク平均: <100KB
合計: <1MB
```

### 実行時パフォーマンス
```
初期ロード: <3秒
インタラクション: <100ms
API応答: <500ms
```

## 保守性メトリクス

### コード行数
```
平均関数長: <50行
平均ファイル長: <500行
最大複雑度: <10
```

### ドキュメント
```
JSDocカバレッジ: >80%
README更新率: 100%（機能追加時）
```

### 技術負債
```
TODO/FIXME: <5個
非推奨API使用: <3個
```

## メトリクス収集スクリプト

### バッチ測定
```bash
#!/bin/bash
echo "=== Coverage ==="
pnpm test -- --coverage

echo "=== Complexity ==="
npx eslint src/ --format json | grep "complexity"

echo "=== Security Audit ==="
pnpm audit

echo "=== Build Performance ==="
time pnpm run build

echo "=== Bundle Size ==="
npx webpack-bundle-analyzer dist/stats.json
```

### CI/CDパイプライン統合
```yaml
# GitHub Actions例
- name: Run Quality Metrics
  run: |
    pnpm run test:coverage
    pnpm run lint
    pnpm audit --production
    pnpm run build
```

## メトリクス目標値

### 開発環境
| メトリクス | 目標値 |
|-----------|-------|
| テストカバレッジ | 80% |
| Lint警告 | 0個 |
| 複雑度 | <10 |
| セキュリティ脆弱性 | 0個 |

### ステージング環境
| メトリクス | 目標値 |
|-----------|-------|
| テストカバレッジ | 85% |
| Lint警告 | 0個 |
| 複雑度 | <8 |
| セキュリティ脆弱性 | 0個 |

### 本番環境
| メトリクス | 目標値 |
|-----------|-------|
| テストカバレッジ | 90% |
| Lint警告 | 0個 |
| 複雑度 | <6 |
| セキュリティ脆弱性 | 0個 |

## メトリクス回帰の検出

### 自動検出
```bash
# 前回比較
COVERAGE_CURRENT=$(pnpm test -- --coverage --silent | grep Total | awk '{print $4}')
COVERAGE_PREV=$(git show HEAD:coverage.json | jq '.total.lines.pct')

if [ $COVERAGE_CURRENT < $COVERAGE_PREV ]; then
  echo "⚠️ Coverage regression detected"
  exit 1
fi
```

### 手動レビュー
- デイリーレポート確認
- 週次トレンド分析
- 月次改善計画立案

## メトリクス改善アクション

### カバレッジ < 80%
1. 未テストコードを特定
2. テストケース追加
3. リグレッション防止

### 複雑度 > 10
1. 関数を分割
2. ヘルパー関数抽出
3. リファクタリング

### セキュリティリスク
1. 脆弱性を特定
2. パッチ適用
3. コード修正
