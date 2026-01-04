# Prettier-ESLint Conflict Resolution

## 競合の原因

ESLintとPrettierは一部のルールが重複し、競合します。

### 競合するルール領域

**フォーマット関連**:

- インデント（`indent` vs Prettier）
- クォートスタイル（`quotes` vs Prettier）
- セミコロン（`semi` vs Prettier）
- 行長（`max-len` vs Prettier `printWidth`）
- カンマ（`comma-dangle` vs Prettier `trailingComma`）

## 解決戦略

### 戦略1: eslint-config-prettier使用（推奨）

**目的**: Prettierと競合するESLintルールを自動無効化

**インストール**:

```bash
pnpm add -D eslint-config-prettier
```

**設定**:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier" // 必ず最後に配置
  ]
}
```

**動作**:

- `prettier`設定がPrettierと競合するESLintルールをすべて無効化
- 順序重要: 最後に`prettier`を配置

**検証**:

```bash
# 競合確認
npx eslint-config-prettier .eslintrc.json
```

### 戦略2: 手動無効化

**Prettierに委譲するルール**:

```json
{
  "rules": {
    "indent": "off",
    "quotes": "off",
    "semi": "off",
    "max-len": "off",
    "comma-dangle": "off",
    "arrow-parens": "off",
    "object-curly-spacing": "off",
    "array-bracket-spacing": "off",
    "space-before-function-paren": "off"
  }
}
```

**TypeScript固有**:

```json
{
  "rules": {
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/comma-dangle": "off"
  }
}
```

### 戦略3: Prettier設定をESLintに合わせる

**非推奨**: Prettierの責務を尊重すべき

**例**（避けるべき）:

```json
{
  "semi": true, // ESLintのsemiルールに合わせる
  "singleQuote": true
}
```

## 推奨フロー

### 開発ワークフロー

```
コード記述
  ↓
保存時
  ├─ Prettier自動フォーマット
  └─ ESLint自動修正（--fix）
  ↓
残るエラー表示（ESLint）
  ↓
手動修正
```

### コミットフロー

```
git add
  ↓
pre-commit hook
  ├─ lint-staged
  │   ├─ Prettier --write
  │   └─ ESLint --fix
  ↓
成功? → commit
失敗? → commit中止
```

## 責務分離の確認

### ESLintが担当

- [ ] 論理エラー検出（`no-unused-vars`）
- [ ] ベストプラクティス（`prefer-const`）
- [ ] 複雑度制限（`complexity`）
- [ ] 命名規約（`camelcase`）

### Prettierが担当

- [ ] インデント
- [ ] クォートスタイル
- [ ] セミコロン
- [ ] 括弧配置
- [ ] 改行位置

### 競合なし

- [ ] フォーマットルールがESLintで無効化されている
- [ ] ESLintはロジックのみチェック
- [ ] Prettierはスタイルのみ管理

## トラブルシューティング

### 問題1: ESLintとPrettierの出力が矛盾

**症状**: ESLintエラーを修正するとPrettier警告、逆も同様

**解決**:

```bash
# 競合チェック
npx eslint-config-prettier .eslintrc.json

# 競合ルールを無効化
```

### 問題2: 保存時にフォーマットが崩れる

**症状**: 保存するたびにスタイルが変わる

**解決**:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 問題3: lint-stagedでエラー

**症状**: pre-commit hook失敗

**解決**:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "prettier --write", // 先にフォーマット
      "eslint --fix" // 後でlint
    ]
  }
}
```

## まとめ

**原則**:

- Prettier = フォーマット専門
- ESLint = コード品質専門
- 重複ルールは無効化（eslint-config-prettier）

**実装**:

1. eslint-config-prettierインストール
2. extendsの最後に"prettier"追加
3. 競合確認（npx eslint-config-prettier）
4. エディタ/commit hook統合
