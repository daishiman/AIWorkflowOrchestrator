---
name: plugin-architecture
description: |
  プラグインアーキテクチャの専門スキル。
  レジストリパターン、動的ロード、依存性注入を活用し、
  拡張ポイント設計とプラグインAPI、動的ロードを提供します。

  Anchors:
  • 『Clean Architecture』（Robert C. Martin） / 適用: 拡張性設計 / 目的: 柔軟性確保

  Trigger:
  プラグインシステム設計時、拡張ポイント実装時、動的ロード設計時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# プラグインアーキテクチャ

## 概要

動的な機能拡張を可能にするプラグインアーキテクチャの設計を専門とするスキル。
レジストリパターン、動的ロード、依存性注入を活用し、
機能追加時の既存コード修正を不要にする拡張性の高いシステム設計を提供します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要なリソース/スクリプト/テンプレートを特定
3. アーキテクチャの要件（レジストリ設計、ロード戦略、DI方式）を定義

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソース（registry-pattern.md、dependency-injection.md、dynamic-loading.md）を参照
2. 適切なパターンテンプレート（plugin-implementation.md、registry-implementation.md）を使用
3. プラグインライフサイクルと依存性注入の設計を実施
4. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-plugin-structure.mjs` でプラグイン構造を検証
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 成果物が目的に合致するか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Task                         | リソース                | スクリプト                    | テンプレート               |
| ---------------------------- | ----------------------- | ----------------------------- | -------------------------- |
| プラグインの基本概念習得     | Level1_basics.md        | validate-skill.mjs            | -                          |
| レジストリパターン実装       | registry-pattern.md     | validate-plugin-structure.mjs | registry-implementation.md |
| 動的ロード戦略の選択         | dynamic-loading.md      | validate-plugin-structure.mjs | plugin-implementation.md   |
| 依存性注入の設計             | dependency-injection.md | validate-plugin-structure.mjs | plugin-implementation.md   |
| プラグインライフサイクル管理 | plugin-lifecycle.md     | validate-plugin-structure.mjs | plugin-implementation.md   |
| Service Locatorパターン      | service-locator.md      | validate-plugin-structure.mjs | -                          |
| 実務的な設計パターン         | Level2_intermediate.md  | validate-plugin-structure.mjs | registry-implementation.md |
| 応用的なテクニック           | Level3_advanced.md      | validate-skill.mjs            | -                          |
| エキスパート知見             | Level4_expert.md        | log_usage.mjs                 | -                          |

## ベストプラクティス

### すべきこと

- ワークフローエンジンのプラグインシステムを構築する時
- 機能の動的追加・削除が必要な時
- 疎結合なモジュール設計が必要な時
- 拡張ポイントを提供するフレームワークを設計する時
- 型安全なプラグイン登録メカニズムを実装する時
- ロード順序の依存性を明確に管理する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- プラグイン間の循環依存を許可することを避ける
- グローバル状態を使用してプラグイン間通信を行うことを避ける
- 型安全性なしでプラグインレジストリを実装することを避ける

## リソース参照

### リソースファイル

- `references/Level1_basics.md` - プラグインアーキテクチャの基礎概念
- `references/Level2_intermediate.md` - 実装パターンと設計判断
- `references/Level3_advanced.md` - 高度なテクニックとスケーリング
- `references/Level4_expert.md` - エキスパートレベルの知見
- `references/registry-pattern.md` - 型安全なレジストリ実装パターン
- `references/dependency-injection.md` - DI Container設計とパターン
- `references/dynamic-loading.md` - ロード戦略（Eager/Lazy/On-Demand）
- `references/plugin-lifecycle.md` - ロード、初期化、有効化、無効化、アンロード
- `references/service-locator.md` - Service Locatorパターンの比較検討
- `references/legacy-skill.md` - 旧SKILL.mdの全文
- `references/requirements-index.md` - 要求仕様の索引

### スクリプト

- `scripts/validate-plugin-structure.mjs` - プラグインディレクトリ構造とインターフェース実装の検証
- `scripts/validate-skill.mjs` - スキル構造検証
- `scripts/log_usage.mjs` - 使用記録と自動評価

### テンプレート

- `assets/plugin-implementation.md` - IPlugin実装、ライフサイクルフック、依存性注入を含むプラグインテンプレート
- `assets/registry-implementation.md` - 型安全なRegistry実装テンプレート（Map-based、CRUD操作含む）

## 変更履歴

| Version | Date       | Changes                                                                                                 |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に基づいて完全更新: Trigger/Anchorsの追加、Task仕様ナビ追加、リソース参照セクション統合 |
