# 依存関係スキャン

## 概要

Node.jsプロジェクトの依存関係に含まれる既知の脆弱性を検出します。

## ツール比較

| ツール | 特徴 | コスト |
|-------|------|--------|
| pnpm audit | pnpm組み込み、高速 | 無料 |
| pnpm audit | npm組み込み | 無料 |
| Snyk | 詳細な修正提案、PR自動作成 | 無料枠あり |
| Dependabot | GitHub統合、自動PR | 無料 |

## pnpm audit

### 基本使用法

```bash
# 監査実行
pnpm audit

# 重大度フィルター
pnpm audit --audit-level=high

# JSON出力
pnpm audit --json

# 本番依存のみ
pnpm audit --prod
```

### 出力例

```
┌─────────────────────────────────────────────────────────┐
│                     pnpm audit                          │
├─────────────────────────────────────────────────────────┤
│ high     Prototype Pollution in lodash                  │
│ Package: lodash                                         │
│ Patched in: >=4.17.21                                  │
│ Dependency of: some-package                            │
│ More info: https://npmjs.com/advisories/1673           │
└─────────────────────────────────────────────────────────┘
```

### CI/CD統合

```yaml
# GitHub Actions
- name: Security Audit
  run: pnpm audit --audit-level=high
  continue-on-error: false
```

## pnpm audit

### 基本使用法

```bash
# 監査実行
pnpm audit

# 自動修正（可能な場合）
pnpm audit fix

# 強制修正（破壊的変更を許容）
pnpm audit fix --force

# JSON出力
pnpm audit --json
```

### 注意点

- `pnpm audit fix --force`は破壊的変更を引き起こす可能性あり
- pnpmプロジェクトでは`pnpm audit`を使用

## Snyk

### セットアップ

```bash
# インストール
pnpm install -g snyk

# 認証
snyk auth

# テスト実行
snyk test
```

### GitHub Actions統合

```yaml
- name: Snyk Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

### 利点

- 修正PRの自動作成
- 詳細な脆弱性レポート
- ライセンスコンプライアンスチェック

## Dependabot

### 設定ファイル

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pnpm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
    reviewers:
      - "team-security"

    # セキュリティアップデートのグループ化
    groups:
      security-updates:
        applies-to: security-updates
        patterns:
          - "*"
```

### セキュリティアラート

GitHub Settings → Security → Dependabot alerts を有効化

## 脆弱性対応フロー

```
脆弱性検出
    │
    ▼
重大度評価
    │
    ├─ Critical/High → 即時対応
    │                   ├─ パッチ適用
    │                   └─ ワークアラウンド
    │
    ├─ Medium → 計画的対応
    │            └─ 次回スプリントで対応
    │
    └─ Low → 監視継続
              └─ バックログに追加
```

## 例外管理

### .nsprc（pnpm audit）

```json
{
  "exceptions": [
    "https://npmjs.com/advisories/1234"
  ]
}
```

### .snyk（Snyk）

```yaml
version: v1.19.0
ignore:
  SNYK-JS-LODASH-1234:
    - '*':
        reason: 'No direct exposure, patched in next release'
        expires: '2024-12-31T00:00:00.000Z'
```

## ベストプラクティス

### すべきこと

1. **定期スキャン**: 毎日または毎週の自動スキャン
2. **PRゲート**: マージ前に脆弱性チェック
3. **依存関係の最小化**: 使用しないパッケージは削除
4. **ロックファイル**: package-lock.json/pnpm-lock.yamlをコミット
5. **迅速な対応**: Critical/Highは24時間以内

### 避けるべきこと

1. **警告の無視**: 「後で対応」は忘れがち
2. **自動修正の盲信**: 破壊的変更のリスクあり
3. **古いNode.js**: セキュリティサポート切れに注意
4. **野良パッケージ**: 信頼性の低いパッケージは避ける
