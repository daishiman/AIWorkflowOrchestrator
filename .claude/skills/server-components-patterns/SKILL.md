---
name: server-components-patterns
description: |
  React Server Componentsの実装パターン専門スキル。
  データフェッチ最適化、Suspenseストリーミング、サーバーアクション実装を提供します。

  Anchors:
  • 『Next.js Documentation』（Vercel） / 適用: Server Components / 目的: パフォーマンス向上
  • 『React Server Components RFC』（Facebook React Team） / 適用: RSCアーキテクチャ / 目的: フェッチ最適化
  • 『Next.js Data Fetching』（Vercel） / 適用: キャッシング戦略 / 目的: 効率的なデータ管理

  Trigger:
  React Server Components実装時、RSCパターン設計時、サーバーコンポーネント最適化検討時、データフェッチ戦略立案時、Suspense境界設計時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Server Components Patterns

## 概要

React Server Componentsのデータフェッチ最適化とSuspense活用を専門とするスキル。このスキルは、Next.js App Routerにおけるサーバーコンポーネントアーキテクチャ、効率的なデータフェッチ戦略、Suspenseを活用したストリーミング、サーバーアクションの実装をカバーしています。

詳細な実装パターンと背景理論については、段階的なリソース（基礎から専門レベルまで）を参照してください。

## ワークフロー

### Phase 1: タスク分析と戦略立案

**目的**: 実装タスクの要件を分析し、最適なRSCパターンを選定する

**アクション**:

1. **要件の理解**
   - クライアント側の対話性要件を確認（Client ComponentとServer Componentの分離）
   - データフェッチのタイミング要件を確認（初期ロード vs ユーザーインタラクション後）
   - 処理負荷の分散戦略を検討（フロントエンド vs バックエンド）

2. **リソースの参照**
   - `references/Level1_basics.md` でRSCの基本概念を確認
   - `references/data-fetching-patterns.md` で適切なパターンを選定
   - 必要に応じて `references/suspense-streaming.md` や `references/server-actions.md` を確認

3. **実装パターンの決定**
   - キャッシング戦略の検討（`references/caching-strategies.md` 参照）
   - エラーハンドリング方針の決定
   - Suspense境界の粒度設計

### Phase 2: 実装と統合

**目的**: 選定したパターンに基づいて、スケーラブルで保守可能なコンポーネントを実装する

**アクション**:

1. **テンプレートの活用**
   - `assets/data-fetch-template.md` を参考にデータフェッチロジックを実装
   - `assets/server-action-template.md` を参考にサーバーアクションを定義

2. **コンポーネント実装**
   - Server ComponentとClient Componentの適切な分離
   - キャッシング戦略の適用（revalidateタグ、時間ベース、オンデマンド）
   - Suspense UIの実装（loading状態、エラー境界）

3. **データフェッチの最適化**
   - N+1クエリ問題の防止
   - バッチ処理の活用
   - キャッシュ戦略の実装

### Phase 3: 検証と最適化

**目的**: 実装の正確性を確認し、パフォーマンス最適化を施す

**アクション**:

1. **機能検証**
   - データ取得が正確に行われているか確認
   - Suspense境界が適切に機能しているか確認
   - サーバーアクションがクライアント側で正しく処理されているか確認

2. **パフォーマンス評価**
   - `scripts/analyze-data-fetching.mjs` を使用してデータフェッチパターンを分析
   - `references/Level3_advanced.md` の最適化テクニックを適用
   - バンドルサイズとランタイム性能の測定

3. **ドキュメント化と記録**
   - `scripts/validate-skill.mjs` でスキル構造の整合性を確認
   - `scripts/log_usage.mjs` を実行して実装事例を記録
   - `references/requirements-index.md` で要求仕様との整合性を確認

## Task仕様ナビ

このスキルに関連する主要なタスク領域とリソースマッピング:

| タスク領域               | 関連リソース              | 実装レベル | 用途                                       |
| ------------------------ | ------------------------- | ---------- | ------------------------------------------ |
| RSC基礎理解              | Level1_basics.md          | 初級       | サーバーコンポーネントの基本的な概念習得   |
| データフェッチ戦略       | data-fetching-patterns.md | 中級       | 複数のフェッチパターンから最適なものを選定 |
| キャッシング実装         | caching-strategies.md     | 中級       | revalidate、キャッシュタグの実装           |
| Suspenseとストリーミング | suspense-streaming.md     | 中級       | UI段階的レンダリングの実装                 |
| サーバーアクション実装   | server-actions.md         | 中級       | フォーム送信とデータ更新の処理             |
| 高度な最適化             | Level3_advanced.md        | 上級       | パフォーマンス最適化と複雑なシナリオ       |
| エキスパート実装         | Level4_expert.md          | 専門       | 大規模アプリケーションの設計と最適化       |

## ベストプラクティス

### すべきこと

- **段階的学習**: Level1から順序立てて進め、基礎を確立してから高度なパターンへ進む
- **テンプレート活用**: 提供されているテンプレートを基にコンポーネントを実装し、一貫性を保つ
- **キャッシング戦略の検討**: 各コンポーネントでどの程度のキャッシュが必要か明確にする
- **Suspense境界の設計**: ユーザー体験を考慮した細かい粒度のSuspense境界を設計する
- **パフォーマンス測定**: 実装後に分析スクリプトを使用してパフォーマンスを評価する
- **要求仕様との整合性**: 実装内容が `requirements-index.md` の要求を満たしているか確認する

### 避けるべきこと

- **オーバーキャッシング**: すべてのクエリをキャッシュすべきではない（データ鮮度とのバランス）
- **粗粒度Suspense**: Suspense境界が大きすぎてUX が低下することを避ける
- **Client Componentの過度な使用**: Server Componentで処理できることをClient Componentで行わない
- **エラーハンドリングの未実装**: ネットワークエラーやデータベースエラーに対する対応をスキップしない
- **セキュリティの軽視**: クライアント側でのデータ検証のみに依存して、サーバー検証を省略しない
- **N+1クエリ**: ループ内での複数回のデータフェッチを避ける

## リソース参照

### 基礎学習リソース（references/）

- **Level1_basics.md** - RSCの基本概念と「なぜRSCが必要か」
- **Level2_intermediate.md** - 実務的な実装パターンと注意点
- **Level3_advanced.md** - パフォーマンス最適化と複雑なシナリオ対応
- **Level4_expert.md** - 大規模アプリケーション設計と高度なテクニック
- **requirements-index.md** - 要求仕様の索引（docs/00-requirements と同期）

### パターン別リソース（references/）

- **data-fetching-patterns.md** - 複数のフェッチパターンの比較と選定ガイド
- **caching-strategies.md** - キャッシュ戦略（時間ベース、タグベース、オンデマンド）
- **suspense-streaming.md** - Suspenseと段階的レンダリングの実装
- **server-actions.md** - Server Actionsを使用したデータ更新パターン
- **legacy-skill.md** - 旧バージョンのドキュメント（互換性確認用）

### テンプレート（assets/）

- **data-fetch-template.md** - データフェッチロジックの実装テンプレート
- **server-action-template.md** - Server Action実装のテンプレート

### ユーティリティスクリプト（scripts/）

- **analyze-data-fetching.mjs** - データフェッチパターンの分析ツール
- **validate-skill.mjs** - スキル構造の検証ツール
- **log_usage.mjs** - 使用記録と自動評価スクリプト

## 変更履歴

| Version | Date       | Changes                                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に完全準拠。YAMLフロントマター改善、ワークフロー詳細化、Task仕様ナビテーブル追加、リソース参照の再構成 |
| 1.0.0   | 2025-12-24 | Initial version with basic structure                                                                                   |
