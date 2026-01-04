# Prettier統合 - 基本概念

## 概要

ESLintとPrettierの統合とフォーマット自動化の基礎知識。
責務分離、競合解決、エディタ統合、保存時自動実行の基本を理解します。

## Prettierとは

Prettierはコードフォーマッター（整形ツール）であり、コードのスタイルを自動的に統一します。

### 主な特徴

- **Opinionated**: 設定項目が少なく、デフォルトで良好なスタイル
- **言語横断**: JavaScript, TypeScript, CSS, JSON, Markdown等に対応
- **エディタ統合**: VS Code, WebStorm, Vim等で保存時自動フォーマット
- **チーム標準化**: 個人の好みに依存せず、一貫したスタイルを維持

### ESLintとの違い

| ツール   | 目的                     | 例                                   |
| -------- | ------------------------ | ------------------------------------ |
| ESLint   | コード品質の検証         | 未使用変数、console.log、バグの検出  |
| Prettier | コードフォーマットの統一 | インデント、クォート、改行位置の統一 |

## 責務分離の原則

### ESLint 役割

- コード品質の検証
- バグの検出
- ベストプラクティスの強制

### Prettier 役割

- コードフォーマットの統一
- スタイルの自動修正
- チーム全体のコード一貫性

**重要**: ESLintとPrettierは役割が異なるため、責務を明確に分離する必要があります。

## 初期セットアップ手順

### 1. インストール

```bash
pnpm add -D prettier eslint-config-prettier
```

**依存関係の説明**:

- `prettier`: コードフォーマッター本体
- `eslint-config-prettier`: ESLintの競合ルールを無効化

### 2. Prettier設定ファイル作成

`.prettierrc.json`:

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

**設定項目の説明**:

| 項目            | 説明                         | デフォルト値推奨 |
| --------------- | ---------------------------- | ---------------- |
| `printWidth`    | 1行の最大文字数              | 80               |
| `tabWidth`      | インデントのスペース数       | 2                |
| `useTabs`       | タブ文字を使用するか         | false            |
| `semi`          | セミコロンを付けるか         | true             |
| `singleQuote`   | シングルクォートを使用するか | true             |
| `trailingComma` | 末尾カンマをどこまで付けるか | "es5"            |

### 3. .prettierignore作成

```
# 依存関係
node_modules/
pnpm-lock.yaml

# ビルド成果物
dist/
build/
.next/

# 自動生成ファイル
*.min.js
```

### 4. package.jsonスクリプト追加

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**スクリプトの説明**:

- `format`: すべてのファイルをフォーマット（破壊的変更）
- `format:check`: フォーマット違反をチェックのみ（非破壊的）

## 使用タイミング

- プロジェクトにPrettierを新規導入する時
- コードフォーマット設定を統一する時
- チーム開発でスタイルガイドを確立する時

## ベストプラクティス

### すべきこと

- デフォルト設定を優先し、カスタマイズは最小限にとどめる
- eslint-config-prettierで競合ルールを自動無効化する
- チーム全体で同じ設定を共有する
- .prettierignoreで不要なファイルを除外する

### 避けるべきこと

- ESLintのstyling rulesとPrettierルールを重複設定しない
- 手動フォーマットと自動フォーマットを混在させない
- アンチパターンや注意点を確認せずに進めない

## 最小要件チェックリスト

- [ ] `.prettierrc.json`が存在し、基本設定が含まれている
- [ ] `package.json`にformat, format:checkスクリプトが存在
- [ ] `.prettierignore`で不要なファイルを除外している
- [ ] 初回フォーマットが実行できた

## 参照書籍

- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善アプローチ
