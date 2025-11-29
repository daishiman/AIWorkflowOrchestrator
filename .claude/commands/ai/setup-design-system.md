---
description: |
  デザインシステム基盤とTailwind CSS設定の完全セットアップ。

  デザイントークン体系、Tailwind設定、コンポーネント規約を統合的に構築します。
  一貫性のあるUI実装基盤を確立し、開発速度と保守性を最大化します。

  🤖 起動エージェント:
  - `.claude/agents/ui-designer.md`: UI設計・デザインシステム専門エージェント

  📚 利用可能スキル（ui-designerエージェントが必要時に参照）:
  **デザインシステム基盤（必須）:**
  - `.claude/skills/design-system-architecture/SKILL.md`: デザイントークン管理、コンポーネント規約、3層トークンモデル
  - `.claude/skills/tailwind-css-patterns/SKILL.md`: Tailwind設定、CVA、レスポンシブ、ダークモード

  **コンポーネント設計（推奨）:**
  - `.claude/skills/component-composition-patterns/SKILL.md`: Compositionパターン、Slot/Compound
  - `.claude/skills/headless-ui-principles/SKILL.md`: ロジック分離、WAI-ARIAパターン

  **品質・アクセシビリティ（必須）:**
  - `.claude/skills/accessibility-wcag/SKILL.md`: WCAG 2.1 AA準拠、カラーコントラスト
  - `.claude/skills/apple-hig-guidelines/SKILL.md`: ネイティブ品質UI（Apple向け製品の場合）

  ⚙️ このコマンドの設定:
  - argument-hint: なし（インタラクティブ設定推奨）
  - allowed-tools: パッケージインストール、設定ファイル読み書き
    • Bash(pnpm*): Tailwind CSS、CVA、関連パッケージのインストール
    • Read: 既存設定確認（tailwind.config.*, tsconfig.json, package.json）
    • Write: 設定ファイル生成（tailwind.config.ts, globals.css, トークンファイル）
    • Edit: 既存設定の更新
  - model: sonnet（設定ファイル生成・パッケージ管理タスク）

  📦 成果物:
  - tailwind.config.ts（デザイントークン統合、ダークモード設定）
  - src/styles/globals.css（CSS変数、デザイントークン定義）
  - src/styles/tokens/（トークン定義ファイル群）
  - package.json（Tailwind CSS、CVA、関連依存パッケージ）

  🎯 プロジェクト準拠:
  - master_system_design.md 第4章: ハイブリッドディレクトリ構造（src/app/, src/features/）
  - master_system_design.md 第2章: TypeScript strict モード、ESLint統合
  - master_system_design.md 第5章: Clean Architecture依存関係ルール

  トリガーキーワード: design-system, tailwind, デザイントークン, スタイル設定, UI基盤
allowed-tools: [Bash(pnpm*), Read, Write, Edit]
model: sonnet
---

# デザインシステムセットアップ

## Phase 1: 準備と現状確認

### ステップ1.1: プロジェクト状況分析

ui-designerエージェントを起動し、以下を確認してもらいます:

```bash
# 既存設定の確認
- package.json（Tailwind CSS、関連パッケージの有無）
- tailwind.config.* の存在確認
- src/styles/ ディレクトリ構造
- tsconfig.json（パスエイリアス設定）
```

**確認項目**:
- [ ] 既存のTailwind CSS設定の有無
- [ ] デザイントークン定義の有無
- [ ] TypeScript設定（@/パスエイリアス）
- [ ] プロジェクトのUI要件（ダークモード、レスポンシブ等）

### ステップ1.2: 要件ヒアリング

ui-designerエージェントが以下を確認:
- ダークモード対応の必要性
- ブレークポイント要件（デフォルト/カスタム）
- カラーパレット方針（ブランドカラー等）
- アニメーション要件
- アクセシビリティレベル（WCAG AA/AAA）

---

## Phase 2: パッケージインストール

### ステップ2.1: Tailwind CSS基本パッケージ

ui-designerエージェントが以下をインストール:

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm add class-variance-authority clsx tailwind-merge
```

**追加パッケージ（必要に応じて）**:
- `@tailwindcss/forms`: フォームスタイリング
- `@tailwindcss/typography`: タイポグラフィ
- `tailwindcss-animate`: アニメーション拡張

### ステップ2.2: TypeScript型定義

```bash
pnpm add -D @types/node
```

---

## Phase 3: デザイントークン設計

### ステップ3.1: デザイントークン体系構築

ui-designerエージェントが `.claude/skills/design-system-architecture/SKILL.md` を参照し、3層トークンモデルを設計:

**3層構造**:
1. **Global Tokens**: 基本値（colors.blue.500, spacing.4等）
2. **Alias Tokens**: セマンティック名（colors.primary, spacing.md等）
3. **Component Tokens**: コンポーネント固有（button.bg.primary等）

**成果物**: `src/styles/tokens/` ディレクトリ配下
- `colors.ts`: カラートークン定義
- `spacing.ts`: スペーシングトークン定義
- `typography.ts`: タイポグラフィトークン定義
- `index.ts`: トークン集約エクスポート

### ステップ3.2: CSS変数統合

`src/styles/globals.css` にトークンをCSS変数として定義:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Global Tokens → CSS Variables */
    --color-primary: 214 100% 50%; /* HSL */
    --spacing-md: 1rem;
    /* ... */
  }

  .dark {
    /* Dark mode overrides */
    --color-primary: 214 100% 60%;
    /* ... */
  }
}
```

---

## Phase 4: Tailwind設定ファイル生成

### ステップ4.1: tailwind.config.ts作成

ui-designerエージェントが `.claude/skills/tailwind-css-patterns/SKILL.md` を参照し、設定ファイルを生成:

**主要設定項目**:
- `darkMode: "class"` - ダークモード設定
- `content` - スキャン対象パス（src/app/, src/features/, src/components/）
- `theme.extend` - デザイントークン統合
- `plugins` - 必要なプラグイン

**プロジェクト準拠**:
- ハイブリッド構造対応（src/app/, src/features/）
- CSS変数参照（hsl(var(--color-primary))）
- TypeScript型安全性

### ステップ4.2: PostCSS設定

`postcss.config.js` 生成（Next.jsの場合は不要、Vite等で必要）

---

## Phase 5: ユーティリティ関数作成

### ステップ5.1: cn関数（Class Name utility）

`src/lib/utils.ts` 作成:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**用途**: Tailwindクラスの競合解決と条件付きクラス結合

---

## Phase 6: コンポーネント規約策定

### ステップ6.1: ディレクトリ構造確立

ui-designerエージェントが以下のディレクトリを作成（存在しない場合）:

```
src/
├── app/
│   └── components/        # アプリケーション固有コンポーネント
├── features/
│   └── [feature]/
│       └── components/    # 機能固有コンポーネント
├── components/            # 共有コンポーネント（存在する場合）
│   ├── ui/               # プリミティブコンポーネント
│   └── patterns/         # パターンコンポーネント
└── styles/
    ├── globals.css
    └── tokens/
```

### ステップ6.2: 命名規則ドキュメント

`docs/10-architecture/component-naming.md` 作成（存在しない場合）:
- PascalCase命名
- ファイル構造規約
- Variantプロパティ命名

---

## Phase 7: 検証とドキュメント

### ステップ7.1: 設定検証

ui-designerエージェントが以下を検証:
- [ ] Tailwind CSSビルドが成功するか
- [ ] TypeScript型エラーがないか
- [ ] CSS変数が正しく参照されているか
- [ ] ダークモード切り替えが機能するか

```bash
# 検証コマンド
pnpm typecheck
pnpm build
```

### ステップ7.2: 使用ガイド作成

`docs/10-architecture/design-system.md` 作成:
- デザイントークンの使用方法
- コンポーネント作成ガイドライン
- Tailwindユーティリティのベストプラクティス
- CVA使用例

---

## Phase 8: 完了報告

ui-designerエージェントが以下を報告:

**成果物サマリー**:
- インストール済みパッケージリスト
- 生成されたファイル一覧
- デザイントークン体系概要
- Next Steps（サンプルコンポーネント作成等）

**品質メトリクス**:
- トークンカバレッジ: 100%（全カテゴリ定義済み）
- 設定整合性: 型エラー0件
- ドキュメント化: 主要ガイド作成済み

**推奨Next Actions**:
1. `/ai:create-component Button primary` - サンプルボタン作成
2. デザイントークンのカスタマイズ（ブランドカラー等）
3. アクセシビリティ検証（カラーコントラスト等）

---

## エラーハンドリング

### よくあるエラーと対処

**pnpmインストール失敗**:
- pnpmバージョン確認（9.x必須）
- Node.jsバージョン確認（22.x LTS推奨）
- キャッシュクリア: `pnpm store prune`

**Tailwindビルドエラー**:
- content設定の確認（正しいパスが指定されているか）
- PostCSS設定の確認
- globals.cssのインポート確認

**型エラー**:
- tsconfig.jsonのpaths設定確認
- @types/node インストール確認
- tailwind.config.ts の型定義確認

---

## 補足情報

### プロジェクト固有の考慮事項

**ハイブリッドアーキテクチャ準拠**:
- コンポーネントは `app/` または `features/` に配置
- 共有コンポーネントは慎重に判断（機能間依存を避ける）

**Clean Architecture依存関係**:
- UIコンポーネントはビジネスロジック（shared/core/）に直接依存しない
- 状態管理は別レイヤー（features/*/hooks/）

**TDD対応**:
- コンポーネントテストファイルは `__tests__/` に配置
- Tailwindクラスの視覚テストは Playwright で実施

### 参考リソース

**外部ドキュメント**:
- Tailwind CSS: https://tailwindcss.com/docs
- CVA: https://cva.style/docs
- shadcn/ui: https://ui.shadcn.com/（デザインシステム参考実装）

**内部ドキュメント**:
- `docs/00-requirements/master_system_design.md`: プロジェクト設計書
- `.claude/skills/design-system-architecture/SKILL.md`: デザインシステム設計原則
- `.claude/skills/tailwind-css-patterns/SKILL.md`: Tailwind実装パターン
