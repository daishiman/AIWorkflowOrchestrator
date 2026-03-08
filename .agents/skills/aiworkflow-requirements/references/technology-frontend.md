# フロントエンド技術スタック

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのフロントエンド技術スタックを定義します。

---

## UIフレームワーク

### React

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `19.x` |
| 最小バージョン | `18.2.0` |
| 関連パッケージ | `react-dom`, `@types/react` |

**選定理由:**

- 広範なエコシステムとコミュニティ
- Next.jsとの統合
- Hooks APIによる状態管理
- Server Components対応

### Next.js

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `15.x` |
| 最小バージョン | `14.0.0` |
| 使用機能 | App Router, Server Components |

**選定理由:**

- ファイルベースルーティング
- Server Components / Server Actions
- 静的生成（SSG）とISR対応
- 画像最適化

📖 詳細: [technology-core.md](./technology-core.md)

---

## スタイリング

### Tailwind CSS

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `3.4.x` |
| 最小バージョン | `3.3.0` |
| 関連パッケージ | `postcss`, `autoprefixer` |

**選定理由:**

- ユーティリティファーストの効率性
- 一貫したデザインシステム構築
- PurgeCSSによる本番バンドル最適化
- カスタマイズ性

**設定ファイル:**

| ファイル | 目的 |
|---------|-----|
| `tailwind.config.ts` | テーマ、プラグイン設定 |
| `postcss.config.js` | PostCSS設定 |
| `globals.css` | グローバルスタイル |

### shadcn/ui

| 項目 | 値 |
|-----|---|
| 使用方法 | コピー＆ペースト |
| 配置先 | `packages/shared/ui/` |

**選定理由:**

- Radix UIベースのアクセシビリティ
- Tailwind CSSとの統合
- カスタマイズ可能なコンポーネント
- 依存関係が最小限

**主要コンポーネント:**

| コンポーネント | 用途 |
|--------------|-----|
| Button | 汎用ボタン |
| Dialog | モーダルダイアログ |
| Form | フォーム要素 |
| Toast | トースト通知 |
| Tabs | タブパネル |

---

## 状態管理

### Zustand

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `5.x` |
| 最小バージョン | `4.5.0` |

**選定理由:**

- 最小限のボイラープレート
- TypeScriptとの相性
- Sliceパターンによる分割管理
- React Server Componentsとの互換性

**代替案との比較:**

| 選択肢 | 利点 | 採用しなかった理由 |
|-------|------|------------------|
| Redux Toolkit | 成熟度、DevTools | ボイラープレート量 |
| Jotai | アトミック設計 | 学習コスト |
| Recoil | Facebook製 | メンテナンス状況 |

📖 詳細: [arch-state-management.md](./arch-state-management.md)

---

## フォーム・バリデーション

### React Hook Form

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `7.x` |

**選定理由:**

- 非制御コンポーネントによるパフォーマンス
- Zodとの統合（@hookform/resolvers）
- フォーム状態の自動管理

### Zod

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `3.x` |

**選定理由:**

- TypeScript型推論
- ランタイムバリデーション
- スキーマ再利用（フロント/バック共通）

📖 詳細: [ui-ux-forms.md](./ui-ux-forms.md)

---

## エディター・表示

### Monaco Editor

| 項目 | 値 |
|-----|---|
| パッケージ | `@monaco-editor/react` |

**用途:**

- コード編集
- 差分表示（Diff Editor）
- シンタックスハイライト

📖 詳細: [arch-ui-components.md](./arch-ui-components.md)

---

## アイコン・アセット

### Lucide React

| 項目 | 値 |
|-----|---|
| パッケージ | `lucide-react` |

**選定理由:**

- Tree-shakingによるバンドル最適化
- 一貫したデザイン
- SVGベースで高品質

---

## アニメーション

### Framer Motion

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `11.x` |
| 使用箇所 | ページ遷移、モーダル |

**原則:**

- `prefers-reduced-motion`対応
- GPUアクセラレーション活用
- 200-300msの標準デュレーション

📖 詳細: [ui-ux-design-principles.md](./ui-ux-design-principles.md)

---

## テスト

### Vitest

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `2.x` |

**用途:**

- ユニットテスト
- コンポーネントテスト

### Testing Library

| 項目 | 値 |
|-----|---|
| パッケージ | `@testing-library/react` |

**原則:**

- ユーザー視点でのテスト
- アクセシビリティクエリ優先

### Playwright

| 項目 | 値 |
|-----|---|
| 推奨バージョン | `1.x` |

**用途:**

- E2Eテスト
- クロスブラウザテスト

📖 詳細: [quality-requirements.md](./quality-requirements.md)

---

## ビルド・バンドル

### ビルドツール

| ツール | 用途 |
|-------|-----|
| Next.js | Webアプリビルド |
| Vite | デスクトップRenderer |
| esbuild | 高速トランスパイル |

### 最適化設定

| 最適化 | 方法 |
|-------|-----|
| Tree Shaking | 未使用コード除去 |
| Code Splitting | 動的import |
| Image Optimization | next/image |
| Font Optimization | next/font |

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|-----|
| [technology-core.md](./technology-core.md) | コア技術スタック |
| [technology-desktop.md](./technology-desktop.md) | デスクトップ技術 |
| [ui-ux-design-principles.md](./ui-ux-design-principles.md) | デザイン原則 |
| [arch-state-management.md](./arch-state-management.md) | 状態管理 |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-26 | 初版作成 |
