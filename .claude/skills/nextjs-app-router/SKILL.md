---
name: nextjs-app-router
description: |
  Next.js App Routerのアーキテクチャと実装パターンを専門とするスキル。
  ディレクトリベースルーティング、Server/Client Components分離、レンダリング戦略選択を支援。

  Anchors:
  • Guillermo Rauch "Server-First" / 適用: コンポーネント配置判断 / 目的: デフォルトサーバー・例外クライアントの徹底
  • Learning React (Banks, Porcello) / 適用: コンポーネント設計 / 目的: 再利用性と単一責任の原則適用
  • Next.js公式ドキュメント / 適用: 特殊ファイル規約・レンダリング戦略 / 目的: フレームワーク規約準拠

  Trigger:
  Use when designing Next.js routing structures, implementing app directory patterns, deciding Server vs Client Components, choosing rendering strategies (SSG, ISR, Dynamic), or structuring layouts and route groups.
  Keywords: app router, server components, client components, dynamic routes, route groups, parallel routes, intercepting routes, layout, template, loading, error
tags:
  - nextjs
  - react
  - routing
  - server-components
  - app-router
---

# Next.js App Router

## 概要

Next.js App Routerのアーキテクチャと実装パターンを専門とするスキル。
Guillermo Rauchの「Server-First」「Convention over Configuration」思想に基づき、
高速で保守性の高いルーティング構造を設計・実装します。

詳細な手順や背景は `references/basics.md` と `references/patterns.md` を参照してください。

## ワークフロー

Next.js App Routerの設計・実装は以下の3フェーズで進めます。
各フェーズで対応するTaskを実行します。

### Phase 1: ルーティング構造分析

**目的**: 要件からルーティング構造とURL設計を導出する

**Task仕様**: `agents/analyze-routing.md`

**入力**: 要件定義、ユーザーストーリー、既存アプリ構造
**出力**: ディレクトリ構造案、URL設計、Route Groups配置

**参照リソース**:

- `references/routing-patterns.md`: ルーティングパターン詳細
- `references/basics.md`: 基礎概念
- `scripts/analyze-routing-structure.mjs`: 既存構造解析

### Phase 2: コンポーネント設計

**目的**: Server/Client Components分離とレンダリング戦略を決定する

**Task仕様**: `agents/design-components.md`

**入力**: Phase 1のルーティング構造、パフォーマンス要件
**出力**: コンポーネント配置案、レンダリング戦略、Layout階層

**参照リソース**:

- `references/server-client-decision.md`: Server/Client判断フロー
- `references/rendering-strategies.md`: レンダリング戦略ガイド
- `references/layout-hierarchy.md`: Layout階層設計
- `references/patterns.md`: 実装パターン

### Phase 3: 実装と検証

**目的**: 設計をコードに落とし込み、規約準拠を検証する

**Task仕様**: `agents/implement-validate.md`

**入力**: Phase 2のコンポーネント設計
**出力**: 実装コード、検証レポート

**参照リソース**:

- `assets/layout-template.md`: Layoutテンプレート
- `assets/page-template.md`: Pageテンプレート
- `references/patterns.md`: 応用パターン（並列ルート、インターセプト）
- `scripts/validate-skill.mjs`: 構造検証

**記録**: `scripts/log_usage.mjs` でフィードバックを記録

## ベストプラクティス

### すべきこと

- Next.js App Routerのルーティング構造を設計する時
- Server ComponentsとClient Componentsの使い分けを判断する時
- 動的ルートやRoute Groupsを実装する時
- レンダリング戦略（Static/Dynamic/ISR）を選択する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/nextjs-app-router/references/basics.md
cat .claude/skills/nextjs-app-router/references/patterns.md
cat .claude/skills/nextjs-app-router/references/layout-hierarchy.md
cat .claude/skills/nextjs-app-router/references/rendering-strategies.md
cat .claude/skills/nextjs-app-router/references/routing-patterns.md
cat .claude/skills/nextjs-app-router/references/server-client-decision.md
```

### スクリプト実行

```bash
node .claude/skills/nextjs-app-router/scripts/analyze-routing-structure.mjs --help
node .claude/skills/nextjs-app-router/scripts/log_usage.mjs --help
node .claude/skills/nextjs-app-router/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/nextjs-app-router/assets/layout-template.md
cat .claude/skills/nextjs-app-router/assets/page-template.md
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
