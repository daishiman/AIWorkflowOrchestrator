# Linting & Formatting 基礎知識

> **相対パス**: `references/basics.md`
> **読込条件**: ツール概念理解時

---

## ツール概要

### ESLint

| 項目     | 説明                                        |
| -------- | ------------------------------------------- |
| 種類     | Linter（静的解析）                          |
| 対象     | JavaScript/TypeScript                       |
| 特徴     | 豊富なプラグインエコシステム                |
| 設定形式 | eslint.config.js (v9+) / .eslintrc (legacy) |

### Prettier

| 項目     | 説明                                |
| -------- | ----------------------------------- |
| 種類     | Formatter（コード整形）             |
| 対象     | JS/TS/CSS/HTML/JSON/YAML/Markdown等 |
| 特徴     | Opinionated（設定項目が少ない）     |
| 設定形式 | .prettierrc / .prettierrc.json      |

### Biome

| 項目     | 説明                                |
| -------- | ----------------------------------- |
| 種類     | Linter + Formatter（統合ツール）    |
| 対象     | JavaScript/TypeScript/JSON          |
| 特徴     | Rust製で高速、ESLint+Prettierの代替 |
| 設定形式 | biome.json                          |

---

## ツール選択フローチャート

```
プロジェクト要件を評価
├─ プラグインが多数必要?
│  ├─ Yes → ESLint + Prettier
│  └─ No → 続行
├─ パフォーマンスが最優先?
│  ├─ Yes → Biome
│  └─ No → 続行
├─ チームが既存ツールに慣れている?
│  ├─ Yes → 既存を維持
│  └─ No → Biome（シンプルさ重視）
```

---

## 用語集

| 用語        | 説明                                     |
| ----------- | ---------------------------------------- |
| Linting     | コードの静的解析で問題を検出             |
| Formatting  | コードスタイルの自動整形                 |
| Flat Config | ESLint v9+の新設定形式                   |
| Pre-commit  | コミット前に実行するGit hook             |
| lint-staged | ステージングされたファイルのみにlint実行 |
| Husky       | Git hooks管理ツール                      |

---

## ESLint vs Prettier vs Biome

| 観点           | ESLint      | Prettier | Biome  |
| -------------- | ----------- | -------- | ------ |
| Linting        | ○           | ×        | ○      |
| Formatting     | △（限定的） | ○        | ○      |
| パフォーマンス | 中          | 中       | 高     |
| プラグイン     | 豊富        | 少数     | 限定的 |
| 設定の複雑さ   | 高          | 低       | 中     |
| 学習コスト     | 中〜高      | 低       | 低     |

---

## 推奨構成パターン

### パターン1: ESLint + Prettier（定番）

```bash
pnpm add -D eslint @eslint/js typescript-eslint prettier eslint-config-prettier
```

**利点**: 最も成熟、プラグインが豊富
**欠点**: 設定が複雑になりがち

### パターン2: Biome（シンプル・高速）

```bash
pnpm add -D @biomejs/biome
```

**利点**: 高速、設定がシンプル、一つのツールで完結
**欠点**: プラグインエコシステムが未成熟

---

## 関連リソース

- **設定パターン**: See [patterns.md](patterns.md)
