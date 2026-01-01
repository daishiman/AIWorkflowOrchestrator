---
name: react-server-components
description: |
  React Server Components（RSC）の実装パターンとNext.js App Routerにおけるベストプラクティスを提供する専門スキル。

  Anchors:
  • 『Learning React Server Components』（Tejas Kumar）/ 適用: RSCアーキテクチャ / 目的: サーバーとクライアント間の責務分離
  • Next.js App Router公式ドキュメント / 適用: RSC実装パターン / 目的: Next.js固有の最適化手法

  Trigger:
  Next.js App Router実装時、Server Components設計時、Client Components境界定義時、データフェッチ最適化時、Suspense統合時、streaming SSR実装時、キャッシュ戦略設計時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
---

# React Server Components

## 概要

React Server Components（RSC）の実装パターンとNext.js App Routerにおけるベストプラクティスを提供する専門スキル。サーバーコンポーネントとクライアントコンポーネントの責務分離、データフェッチの最適化、Suspenseとストリーミングの活用を支援します。

詳細な手順や背景は `references/Level1_basics.md` から `references/Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: アーキテクチャ分析

**目的**: RSCアーキテクチャの適用範囲と境界を定義する

**アクション**:

1. `references/Level1_basics.md` でRSCの基本概念を確認
2. `references/server-client-boundaries.md` でコンポーネント境界を理解
3. プロジェクトの要件とRSCの適合性を評価

**Task**: `agents/analyze-architecture.md` を参照

### Phase 2: コンポーネント設計

**目的**: Server ComponentsとClient Componentsの適切な分離を設計する

**アクション**:

1. `references/Level2_intermediate.md` で設計パターンを確認
2. `references/composition-patterns.md` でコンポーネント構成を検討
3. `assets/server-component-template.tsx` をベースに実装

**Task**: `agents/design-components.md` を参照

### Phase 3: データフェッチ最適化

**目的**: RSCの並列データフェッチとストリーミングを最適化する

**アクション**:

1. `references/Level3_advanced.md` でデータフェッチ戦略を確認
2. `references/data-fetching-patterns.md` で最適なパターンを選択
3. Suspense境界を適切に配置

**Task**: `agents/optimize-data-fetching.md` を参照

### Phase 4: 検証と記録

**目的**: 実装の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. `scripts/analyze-bundle.mjs` でバンドルサイズを検証
3. `scripts/log_usage.mjs` を実行して記録を残す

**Task**: `agents/validate-implementation.md` を参照

## Task仕様ナビ

| 種類                     | 説明                                   | リソース                                 | テンプレート                           |
| :----------------------- | :------------------------------------- | :--------------------------------------- | :------------------------------------- |
| **基礎知識**             | RSCの基本概念とメンタルモデル          | `references/Level1_basics.md`            | -                                      |
| **実装ガイド**           | Next.js App RouterでのRSC実装パターン  | `references/Level2_intermediate.md`      | `assets/server-component-template.tsx` |
| **応用手法**             | 高度なデータフェッチとストリーミング   | `references/Level3_advanced.md`          | `assets/streaming-template.tsx`        |
| **専門知識**             | RSCアーキテクチャの深い理解            | `references/Level4_expert.md`            | -                                      |
| **境界定義**             | ServerとClientコンポーネントの境界     | `references/server-client-boundaries.md` | -                                      |
| **構成パターン**         | コンポーネント構成とprops drilling回避 | `references/composition-patterns.md`     | `assets/composition-example.tsx`       |
| **データフェッチ**       | 並列フェッチとウォーターフォール回避   | `references/data-fetching-patterns.md`   | -                                      |
| **キャッシュ戦略**       | fetch cache、Request Memoization等     | `references/caching-strategies.md`       | -                                      |
| **エラーハンドリング**   | Error BoundaryとSuspense統合           | `references/error-handling.md`           | `assets/error-boundary-template.tsx`   |
| **パフォーマンス最適化** | バンドルサイズ削減とコード分割         | `references/performance-optimization.md` | -                                      |
| **テスト戦略**           | RSCのテストアプローチ                  | `references/testing-strategies.md`       | `assets/test-template.test.tsx`        |
| **移行ガイド**           | Pages RouterからApp Routerへの移行     | `references/migration-guide.md`          | -                                      |

## ベストプラクティス

### すべきこと

- Server Componentsをデフォルトとし、必要な場合のみClient Components（`'use client'`）を使用する
- データフェッチはできるだけサーバー側で行い、並列フェッチを活用する
- Suspense境界を適切に配置し、ユーザー体験を最適化する
- `async/await` を直接Server Components内で使用する（useEffect不要）
- クライアント側のJavaScriptを最小化し、バンドルサイズを削減する
- `references/composition-patterns.md` のパターンに従って、props drilling を回避する
- キャッシュ戦略（`cache()`, `revalidate`）を適切に設定する
- `references/server-client-boundaries.md` で境界設計の原則を確認する

### 避けるべきこと

- Server Components内でクライアント専用API（useState, useEffect等）を使用する
- Client Components内で直接データベース接続やAPIキーを扱う
- 不要にClient Componentsを使用し、クライアントバンドルを肥大化させる
- Suspense境界なしで非同期処理を行い、ウォーターフォールを引き起こす
- Server Componentsをprops経由でClient Componentsに渡す（children経由で渡すべき）
- `'use client'` ディレクティブを親コンポーネントに配置し、子までクライアント化する
- fetch結果を適切にキャッシュせず、同じリクエストを重複実行する
- エラーハンドリングを省略し、エラー時のUXを悪化させる
- テスト戦略を立てずに実装を進める
- 既存のPages Router パターンをそのまま適用する

## リソース/スクリプト参照

### References

- **Level 1（基礎）**: [references/Level1_basics.md](references/Level1_basics.md)
- **Level 2（中級）**: [references/Level2_intermediate.md](references/Level2_intermediate.md)
- **Level 3（上級）**: [references/Level3_advanced.md](references/Level3_advanced.md)
- **Level 4（専門）**: [references/Level4_expert.md](references/Level4_expert.md)
- **境界定義**: [references/server-client-boundaries.md](references/server-client-boundaries.md)
- **構成パターン**: [references/composition-patterns.md](references/composition-patterns.md)
- **データフェッチ**: [references/data-fetching-patterns.md](references/data-fetching-patterns.md)
- **キャッシュ戦略**: [references/caching-strategies.md](references/caching-strategies.md)
- **エラーハンドリング**: [references/error-handling.md](references/error-handling.md)
- **パフォーマンス最適化**: [references/performance-optimization.md](references/performance-optimization.md)
- **テスト戦略**: [references/testing-strategies.md](references/testing-strategies.md)
- **移行ガイド**: [references/migration-guide.md](references/migration-guide.md)

### Scripts

- `scripts/validate-skill.mjs`: スキル構造の検証
- `scripts/analyze-bundle.mjs`: バンドルサイズ分析と最適化提案
- `scripts/log_usage.mjs`: スキル使用履歴の記録

### Assets

- `assets/server-component-template.tsx`: Server Componentテンプレート
- `assets/client-component-template.tsx`: Client Componentテンプレート
- `assets/streaming-template.tsx`: ストリーミングSSRテンプレート
- `assets/composition-example.tsx`: コンポーネント構成例
- `assets/error-boundary-template.tsx`: Error Boundaryテンプレート
- `assets/test-template.test.tsx`: テストテンプレート
