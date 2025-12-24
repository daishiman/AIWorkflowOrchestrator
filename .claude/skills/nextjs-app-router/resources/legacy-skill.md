---
name: .claude/skills/nextjs-app-router/SKILL.md
description: |
  Next.js App Routerのアーキテクチャと実装パターンを専門とするスキル。
  Guillermo Rauchの「Server-First」「Convention over Configuration」思想に基づき、
  高速で保守性の高いルーティング構造を設計・実装します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/nextjs-app-router/resources/layout-hierarchy.md`: Layout階層設計
  - `.claude/skills/nextjs-app-router/resources/rendering-strategies.md`: レンダリング戦略ガイド
  - `.claude/skills/nextjs-app-router/resources/routing-patterns.md`: ルーティングパターン詳細
  - `.claude/skills/nextjs-app-router/resources/server-client-decision.md`: Server/Client Components 判断フロー
  - `.claude/skills/nextjs-app-router/scripts/analyze-routing-structure.mjs`: app/ディレクトリ構造の解析とルーティングパターン・コンポーネント分離の妥当性検証スクリプト
  - `.claude/skills/nextjs-app-router/templates/layout-template.md`: Root/Group Layoutの実装とメタデータ・フォント設定を含むlayout.tsxテンプレート
  - `.claude/skills/nextjs-app-router/templates/page-template.md`: Server/Client Components判断とデータフェッチ・動的ルートパラメータを含むpage.tsxテンプレート

  専門分野:
  - ディレクトリベースルーティング: フォルダ構造によるURL設計、特殊ファイル規約
  - Server/Client Components: 適切なコンポーネント分離とレンダリング戦略
  - Dynamic Routes: [slug]、[...slug]、[[...slug]]による動的ルーティング
  - Route Groups: (folder)による論理グルーピングとレイアウト共有
  - Parallel/Intercepting Routes: @folder、(..)による高度なルーティング

  使用タイミング:
  - Next.js App Routerのルーティング構造を設計する時
  - Server ComponentsとClient Componentsの使い分けを判断する時
  - 動的ルートやRoute Groupsを実装する時
  - レンダリング戦略（Static/Dynamic/ISR）を選択する時

  Use proactively when designing Next.js routing structures, implementing
version: 1.0.0
---

# Next.js App Router

## 概要

このスキルは、Vercel CEO / Next.js 生みの親である Guillermo Rauch の思想に基づき、
Next.js App Router の効果的な設計・実装パターンを提供します。

**核心哲学**:

- **Server-First**: サーバーをデフォルトとし、クライアントは例外として扱う
- **Performance by Default**: パフォーマンスを後付けではなく、フレームワークに組み込む
- **Convention over Configuration**: ファイルシステムが API となる

**主要な価値**:

- ディレクトリベースの直感的なルーティング設計
- 適切な Server/Client Components 分離による最適なバンドルサイズ
- レンダリング戦略の正しい選択によるパフォーマンス最適化

## リソース構造

```
nextjs-app-router/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── routing-patterns.md                     # ルーティングパターン詳細
│   ├── server-client-decision.md               # Server/Client判断フロー
│   ├── rendering-strategies.md                 # レンダリング戦略ガイド
│   └── layout-hierarchy.md                     # Layout階層設計
├── scripts/
│   └── analyze-routing-structure.mjs           # ルーティング構造分析スクリプト
└── templates/
    ├── page-template.md                        # Pageコンポーネントテンプレート
    └── layout-template.md                      # Layoutコンポーネントテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ルーティングパターン詳細
cat .claude/skills/nextjs-app-router/resources/routing-patterns.md

# Server/Client判断フロー
cat .claude/skills/nextjs-app-router/resources/server-client-decision.md

# レンダリング戦略ガイド
cat .claude/skills/nextjs-app-router/resources/rendering-strategies.md

# Layout階層設計
cat .claude/skills/nextjs-app-router/resources/layout-hierarchy.md
```

### スクリプト実行

```bash
# ルーティング構造分析
node .claude/skills/nextjs-app-router/scripts/analyze-routing-structure.mjs <app-directory>
```

### テンプレート参照

```bash
# Pageコンポーネントテンプレート
cat .claude/skills/nextjs-app-router/templates/page-template.md

# Layoutコンポーネントテンプレート
cat .claude/skills/nextjs-app-router/templates/layout-template.md
```

## いつ使うか

### シナリオ 1: ルーティング構造設計

**状況**: 新規プロジェクトまたは機能追加で URL 構造を設計する

**適用条件**:

- [ ] 複数のページ・ルートが必要
- [ ] URL 階層の設計が求められる
- [ ] 認証状態によるルート分離が必要

**期待される成果**: 論理的で保守性の高いディレクトリ構造

### シナリオ 2: Server/Client 判断

**状況**: コンポーネントを Server Component にするか Client Component にするか迷う

**適用条件**:

- [ ] データフェッチの要件がある
- [ ] インタラクティブ性の要件がある
- [ ] ブラウザ API の使用が必要

**期待される成果**: 適切なコンポーネント分類とバンドルサイズ最適化

### シナリオ 3: レンダリング戦略選択

**状況**: Static Generation、Dynamic Rendering、ISR のどれを使うか迷う

**適用条件**:

- [ ] コンテンツの更新頻度が定義されている
- [ ] パフォーマンス要件がある
- [ ] SEO 要件がある

**期待される成果**: 要件に最適なレンダリング戦略の選択

## 知識領域

### 領域 1: ディレクトリベースルーティング

**特殊ファイル**:
| ファイル | 役割 |
|---------|------|
| `page.tsx` | ルートの UI を定義 |
| `layout.tsx` | 共有レイアウト（ナビゲーション時に再レンダリングされない） |
| `template.tsx` | 共有テンプレート（ナビゲーション毎に再マウント） |
| `loading.tsx` | 自動 Suspense 境界 |
| `error.tsx` | エラー境界 |
| `not-found.tsx` | 404 エラー UI |

**動的ルート構文**:
| 構文 | 説明 | 例 |
|------|------|-----|
| `[slug]` | 単一動的セグメント | `/blog/[slug]` → `/blog/hello` |
| `[...slug]` | Catch-all | `/docs/[...slug]` → `/docs/a/b/c` |
| `[[...slug]]` | Optional Catch-all | ルート自体も含めてキャッチ |

**詳細は**: `resources/routing-patterns.md` を参照

### 領域 2: Server/Client Components

**判断基準**:

```
このコンポーネントは...
├─ データフェッチが必要？
│  └─ Yes → Server Component（async/await）
├─ インタラクティブ性が必要？（onClick、useState等）
│  └─ Yes → Client Component（"use client"）
├─ ブラウザAPIが必要？（window、localStorage等）
│  └─ Yes → Client Component
└─ 上記すべてNo → Server Component（デフォルト）
```

**境界最適化原則**:

- Client Component は可能な限り下層（葉）に配置
- Server Component を Client Component の children props で渡す
- Context Provider は専用 Client Component に分離

**詳細は**: `resources/server-client-decision.md` を参照

### 領域 3: レンダリング戦略

| 戦略              | 使用ケース         | 設定                        |
| ----------------- | ------------------ | --------------------------- |
| Static Generation | 完全静的コンテンツ | `dynamic = 'force-static'`  |
| Dynamic Rendering | リクエスト毎に変化 | `dynamic = 'force-dynamic'` |
| ISR               | 定期更新           | `revalidate = 秒数`         |
| Streaming SSR     | 大量データ         | `loading.tsx` + Suspense    |

**詳細は**: `resources/rendering-strategies.md` を参照

### 領域 4: Layout 階層設計

**Root Layout**: HTML 構造、グローバル設定（フォント、メタデータ）
**Group Layout**: 共有 UI（ヘッダー、ナビ）、認証境界
**Page Layout**: ページ固有のレイアウト

**判断基準**:

- 複数ページで共有する UI → Group Layout
- 認証状態で分離 → `(auth)`、`(dashboard)` などの Route Groups
- 再レンダリングを避けたい重いロジック → Layout（1 回のみ実行）

**詳細は**: `resources/layout-hierarchy.md` を参照

## ワークフロー

### Phase 1: URL 構造設計

1. 要件からページ一覧を抽出
2. URL 階層とセグメント構造を設計
3. 動的ルートの識別（[slug]、[id]等）
4. Route Groups による論理分離を計画

### Phase 2: レンダリング戦略選定

1. 各ページのコンテンツ更新頻度を評価
2. Static / Dynamic / ISR を選択
3. Streaming SSR の必要性を判断

### Phase 3: Layout 階層設計

1. Root Layout の責務を定義
2. Group Layouts を計画
3. 認証境界を設定

### Phase 4: Server/Client 分離

1. 各コンポーネントの要件を分析
2. Server Component をデフォルトに
3. Client Component は明示的に最小限に

### Phase 5: 実装と検証

1. ディレクトリ構造を作成
2. 特殊ファイル（page.tsx、layout.tsx 等）を実装
3. ルーティングが意図通り動作するか検証

## 設計原則

### Server-First の原則

デフォルトは Server Component。Client Component は明示的な"use client"で最小限に。

### Convention over Configuration の原則

ディレクトリ構造がルーティングを定義。特殊ファイル名による規約に従う。

### Progressive Enhancement の原則

サーバーレンダリングされた HTML を基礎とし、JavaScript は段階的な機能強化のみ。

### Colocation の原則

関連するファイル（page、layout、loading、error）は同じディレクトリに配置。

## 関連スキル

- `.claude/skills/server-components-patterns/SKILL.md` - データフェッチ最適化、Suspense 活用
- `.claude/skills/seo-optimization/SKILL.md` - Metadata API、動的 OGP
- `.claude/skills/web-performance/SKILL.md` - 動的インポート、画像最適化
- `.claude/skills/error-handling-pages/SKILL.md` - error.tsx、not-found.tsx 設計

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
