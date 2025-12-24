---
name: .claude/skills/design-system-architecture/SKILL.md
description: |
    一貫性と拡張性を両立するデザインシステムの基盤設計を専門とするスキル。
    Diana MounterやBrad Frostのデザインシステム思想に基づき、
    デザイントークン管理、コンポーネント規約策定、Figma/コード統合を実現します。
    専門分野:
    - デザイントークン設計: 色、タイポグラフィ、スペーシング、シャドウ等の体系的管理
    - コンポーネント規約: 命名規則、階層構造、ファイル組織の標準化
    - デザイン・コード連携: Figmaトークン同期、Style Dictionary活用
    - ドキュメンテーション: Storybook統合、使用ガイドライン
    使用タイミング:
    - デザインシステムの新規構築時
    - デザイントークンの定義・拡張時
    - コンポーネントライブラリの規約策定時
    - Figmaとコードベース間の同期戦略策定時
    Use proactively when design system foundation, design tokens,
    or component library governance needs to be established.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/design-system-architecture/resources/component-hierarchy.md`: 4層構造のコンポーネント階層設計（Primitives/Patterns/Features/Templates）
  - `.claude/skills/design-system-architecture/resources/design-tokens-guide.md`: 3層トークンモデル（Global/Alias/Component）とカテゴリ別設計
  - `.claude/skills/design-system-architecture/resources/figma-code-sync.md`: FigmaとコードベースのトークンCLOSE同期戦略とCI/CD統合
  - `.claude/skills/design-system-architecture/resources/naming-conventions.md`: コンポーネントとファイルの命名規則標準化ガイド
  - `.claude/skills/design-system-architecture/templates/component-spec-template.md`: コンポーネント仕様ドキュメントのテンプレート
  - `.claude/skills/design-system-architecture/templates/design-tokens-template.json`: デザイントークンJSON定義のテンプレート
  - `.claude/skills/design-system-architecture/scripts/validate-tokens.mjs`: トークン整合性と3層構造の検証スクリプト

version: 1.0.0
---

# Design System Architecture

## 概要

このスキルは、Diana Mounter（GitHub Design Systems Lead）や Brad Frost（Atomic Design の提唱者）の
デザインシステム思想に基づき、スケーラブルで一貫性のある UI コンポーネント設計の基盤を提供します。

近年の UI 設計では、Atomic Design の粒度問題やメンテナンスコストが指摘され、
より実践的な**デザイントークン駆動**と**コンポーネント規約**を中心としたアプローチが主流となっています。

**主要な価値**:

- デザインとコードの一貫性を自動化で保証
- トークンベースで変更影響を最小化（一箇所変更で全体に反映）
- デザイナーと開発者の共通言語を確立
- スケーラブルなコンポーネント階層を実現

**対象ユーザー**:

- UI コンポーネントを設計・実装するエージェント
- デザインシステムを構築するチーム
- 一貫性のある UI を維持したいプロジェクト

## リソース構造

```
design-system-architecture/
├── SKILL.md                              # 本ファイル（概要とワークフロー）
├── resources/
│   ├── design-tokens-guide.md            # デザイントークン詳細ガイド
│   ├── component-hierarchy.md            # コンポーネント階層設計
│   ├── naming-conventions.md             # 命名規則とファイル構造
│   └── figma-code-sync.md                # Figma連携戦略
├── scripts/
│   └── validate-tokens.mjs               # トークン検証スクリプト
└── templates/
    ├── design-tokens-template.json       # トークン定義テンプレート
    └── component-spec-template.md        # コンポーネント仕様テンプレート
```

### リソース種別

- **トークンガイド** (`resources/design-tokens-guide.md`): デザイントークンの設計原則と実装
- **階層設計** (`resources/component-hierarchy.md`): コンポーネントの層別分類とルール
- **命名規則** (`resources/naming-conventions.md`): 命名とファイル組織の標準化
- **連携戦略** (`resources/figma-code-sync.md`): デザインツールとコードの同期
- **検証スクリプト** (`scripts/validate-tokens.mjs`): トークン整合性チェック
- **テンプレート** (`templates/`): 標準化されたドキュメント雛形

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# デザイントークンガイド
cat .claude/skills/design-system-architecture/resources/design-tokens-guide.md

# コンポーネント階層設計
cat .claude/skills/design-system-architecture/resources/component-hierarchy.md

# 命名規則
cat .claude/skills/design-system-architecture/resources/naming-conventions.md

# Figma連携戦略
cat .claude/skills/design-system-architecture/resources/figma-code-sync.md
```

### スクリプト実行

```bash
# トークン検証
node .claude/skills/design-system-architecture/scripts/validate-tokens.mjs <tokens.json>
```

### テンプレート参照

```bash
# トークン定義テンプレート
cat .claude/skills/design-system-architecture/templates/design-tokens-template.json

# コンポーネント仕様テンプレート
cat .claude/skills/design-system-architecture/templates/component-spec-template.md
```

---

## 知識領域

### 1. デザイントークンの設計原則

デザイントークンは、デザインシステムの**単一の信頼源（Single Source of Truth）**です。

#### トークンの階層構造

```
Global Tokens (グローバルトークン)
├── colors.blue.500: "#3B82F6"
├── spacing.4: "1rem"
└── fonts.sans: "Inter, system-ui"
    ↓
Alias Tokens (エイリアストークン)
├── colors.primary: {$colors.blue.500}
├── spacing.md: {$spacing.4}
└── fonts.body: {$fonts.sans}
    ↓
Component Tokens (コンポーネントトークン)
├── button.bg.primary: {$colors.primary}
├── button.padding.x: {$spacing.md}
└── button.font.family: {$fonts.body}
```

#### トークンカテゴリ

| カテゴリ       | 例                                    | 用途                   |
| -------------- | ------------------------------------- | ---------------------- |
| **Color**      | primary, secondary, neutral, semantic | ブランドカラー、状態色 |
| **Typography** | font-family, font-size, line-height   | テキストスタイル       |
| **Spacing**    | spacing-1 to spacing-16               | マージン、パディング   |
| **Border**     | radius, width                         | 角丸、境界線           |
| **Shadow**     | sm, md, lg, xl                        | エレベーション         |
| **Motion**     | duration, easing                      | アニメーション         |

### 2. コンポーネント階層の設計

#### 階層モデル

```
Foundation (基盤)
└── デザイントークン、CSS Variables

Primitives (プリミティブ)
└── Button, Input, Text, Icon

Patterns (パターン)
└── SearchInput, IconButton, FormField

Features (機能)
└── LoginForm, UserCard, NavigationMenu

Templates (テンプレート)
└── PageLayout, DashboardLayout
```

#### 各層の責務

**Primitives（プリミティブ）**:

- 最小単位の UI 要素
- 汎用的で再利用可能
- 外部依存なし
- 例: `<Button>`, `<Input>`, `<Badge>`

**Patterns（パターン）**:

- プリミティブの組み合わせ
- 特定の UI パターンを実現
- 例: `<FormField>` = Label + Input + ErrorMessage

**Features（機能）**:

- ビジネスロジックを含む
- 特定の機能に特化
- 例: `<LoginForm>`, `<UserProfileCard>`

### 3. 命名規則の標準化

#### ファイル命名

```
components/
├── primitives/
│   ├── Button/
│   │   ├── Button.tsx           # コンポーネント本体
│   │   ├── Button.styles.ts     # スタイル定義
│   │   ├── Button.types.ts      # 型定義
│   │   ├── Button.stories.tsx   # Storybook
│   │   ├── Button.test.tsx      # テスト
│   │   └── index.ts             # エクスポート
│   └── Input/
│       └── ...
├── patterns/
│   └── ...
└── features/
    └── ...
```

#### 命名規約

| 対象           | 規約           | 例                      |
| -------------- | -------------- | ----------------------- |
| コンポーネント | PascalCase     | `Button`, `IconButton`  |
| ファイル       | PascalCase.tsx | `Button.tsx`            |
| CSS 変数       | kebab-case     | `--color-primary`       |
| トークン       | dot.notation   | `colors.primary.500`    |
| Props          | camelCase      | `onClick`, `isDisabled` |
| Variant        | lowercase      | `primary`, `secondary`  |

### 4. デザイン・コード連携戦略

#### Figma との同期フロー

```
Figma (Design)
    ↓ Design Tokens Plugin / Tokens Studio
    ↓ Export to JSON
tokens.json
    ↓ Style Dictionary / Token Transformer
    ↓ Transform & Generate
CSS Variables / Tailwind Config / TypeScript Types
```

#### 同期のベストプラクティス

1. **Figma をソースとする**: デザイナーが Figma でトークンを管理
2. **自動エクスポート**: Tokens Studio プラグインで変更を検知
3. **CI/CD 統合**: PR でトークン変更をレビュー
4. **型安全**: TypeScript 型を自動生成

---

## タスク実行ワークフロー

### Phase 1: 現状分析

**目的**: 既存のデザインシステム状況を把握

**実行内容**:

1. 既存のトークン定義を確認
2. コンポーネント構造を分析
3. 命名の一貫性をチェック

**判断基準**:

- [ ] 既存トークンの体系性
- [ ] コンポーネント重複の有無
- [ ] 命名規則の遵守状況

### Phase 2: トークン設計

**目的**: デザイントークンの体系化

**使用リソース**:

```bash
cat .claude/skills/design-system-architecture/resources/design-tokens-guide.md
```

**実行内容**:

1. グローバルトークンの定義
2. エイリアストークンの設計
3. コンポーネントトークンへのマッピング

**判断基準**:

- [ ] 3 層構造が適用されているか
- [ ] セマンティックな命名か
- [ ] 拡張性が考慮されているか

### Phase 3: コンポーネント規約策定

**目的**: 階層構造と命名規則の確立

**使用リソース**:

```bash
cat .claude/skills/design-system-architecture/resources/component-hierarchy.md
cat .claude/skills/design-system-architecture/resources/naming-conventions.md
```

**実行内容**:

1. コンポーネント階層の定義
2. ファイル構造の標準化
3. 命名規則の文書化

**判断基準**:

- [ ] 階層が明確に分離されているか
- [ ] ファイル構造が一貫しているか
- [ ] チーム全員が理解可能か

### Phase 4: 連携戦略の実装

**目的**: デザインツールとコードの同期

**使用リソース**:

```bash
cat .claude/skills/design-system-architecture/resources/figma-code-sync.md
```

**実行内容**:

1. 同期フローの設計
2. 変換パイプラインの構築
3. CI/CD 統合の検討

**判断基準**:

- [ ] 自動化が実現されているか
- [ ] 変更検知が可能か
- [ ] ロールバックが可能か

---

## 品質基準

### 必須チェックリスト

- [ ] デザイントークンが 3 層構造で定義されている
- [ ] コンポーネント階層が明確に分離されている
- [ ] 命名規則が一貫して適用されている
- [ ] ダークモード対応が考慮されている
- [ ] アクセシビリティ基準を満たすトークンがある

### 品質メトリクス

```yaml
metrics:
  token_coverage: > 90%        # トークン化されたスタイルの割合
  naming_consistency: 100%     # 命名規則遵守率
  component_reusability: > 80% # コンポーネント再利用率
  documentation_coverage: > 85% # ドキュメント化率
```

---

## 関連スキル

- `.claude/skills/component-composition-patterns/SKILL.md` - コンポーネント構成パターン
- `.claude/skills/tailwind-css-patterns/SKILL.md` - Tailwind CSS パターン
- `.claude/skills/accessibility-wcag/SKILL.md` - アクセシビリティ

---

## 参照ドキュメント

### 外部参考文献

- **『Design Systems』** Diana Mounter - GitHub デザインシステムの実践
- **『Refactoring UI』** Adam Wathan, Steve Schoger - 実践的 UI 設計
- **Style Dictionary Documentation** - トークン変換ツール
- **Tokens Studio for Figma** - Figma トークン管理

### 内部参照

- `docs/10-architecture/design-system.md` - プロジェクト固有のデザインシステム
- `tailwind.config.js` - Tailwind 設定

---

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
