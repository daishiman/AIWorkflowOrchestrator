---
name: project-architecture-integration
description: |
  プロジェクト固有のアーキテクチャ設計原則を専門とするスキル。
  ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API、
  テスト戦略、エラーハンドリング、CI/CDの原則をエージェント設計に統合します。

  Anchors:
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルールと境界設計 / 目的: アーキテクチャ層の分離と依存方向の制御
  • Hybrid Architecture Guide / 適用: shared/features 構造設計 / 目的: ドメイン機能の分離と再利用性の確保
  • docs/00-requirements/ / 適用: プロジェクト固有の技術スタック仕様 / 目的: 要求仕様との整合性維持

  Trigger:
  Use when designing agents that generate project-specific files, database operations, API integrations, test strategies, error handling, or CI/CD workflows.
  Keywords: architecture compliance, hybrid structure, shared features, dependency rules, agent file generation, database design, REST API, testing strategy
tags:
  - architecture
  - clean-architecture
  - hybrid-architecture
  - agent-design
  - project-structure
version: 2.0.0
last_updated: 2025-12-31
---

# Project Architecture Integration

## 概要

プロジェクト固有のアーキテクチャ設計原則に基づいてエージェント設計を支援するスキル。Clean Architectureの依存関係ルールとHybrid Architecture（shared/features）パターンを統合し、プロジェクト構造に準拠したファイル生成、データベース設計、API連携を実現します。

## ワークフロー

### Phase 1: アーキテクチャ分析（Task起動）

**目的**: プロジェクト構造とアーキテクチャ要件を分析し、適用すべきパターンを特定する

**Task**: `agents/architecture-analysis.md`

**入力**:

- エージェントの役割と責務
- 生成対象ファイルの種類（コンポーネント、API、データベース等）
- 既存のプロジェクト構造

**出力**:

- 適用すべきアーキテクチャパターンのリスト
- ファイル配置先の決定（shared/ or features/）
- 依存関係の設計方針

**実行タイミング**: エージェント設計の最初、またはアーキテクチャ判断が必要な時

### Phase 2: 準拠性検証（Task起動）

**目的**: 生成されたファイルやエージェント設計がアーキテクチャ原則に準拠しているか検証する

**Task**: `agents/compliance-check.md`

**入力**:

- 生成されたファイルパス
- エージェントの設計仕様
- 依存関係グラフ

**出力**:

- 準拠性チェック結果
- 違反項目のリスト
- 修正提案

**実行タイミング**: ファイル生成後、エージェント設計完了後

**検証スクリプト**: `scripts/check-architecture-compliance.mjs`

### Phase 3: 統合と記録

**目的**: アーキテクチャ原則をエージェント設計に統合し、実行記録を保存する

**Task**: `agents/integration.md`

**入力**:

- 検証済みのアーキテクチャ設計
- エージェント仕様
- 統合対象のコンポーネント

**出力**:

- 統合完了したエージェント設計
- アーキテクチャドキュメント更新
- 使用記録

**実行タイミング**: 検証完了後

**記録スクリプト**: `scripts/log_usage.mjs --result success --phase integration`

## Task仕様（ナビゲーション）

### agents/architecture-analysis.md

アーキテクチャパターンの分析と適用判断を行うTask仕様。

**いつ起動するか**:

- 新規エージェント設計開始時
- ファイル配置先の判断が必要な時
- 依存関係設計が必要な時

**何を入力するか**:

- エージェントの役割、責務、目的
- 生成対象ファイルの種類とドメイン
- 既存構造の情報

**何を返すか**:

- shared/ or features/ の配置判断
- 適用アーキテクチャパターン
- 依存関係の設計方針

### agents/compliance-check.md

アーキテクチャ準拠性の検証を行うTask仕様。

**いつ起動するか**:

- ファイル生成完了後
- エージェント設計レビュー時
- アーキテクチャ違反の疑いがある時

**何を入力するか**:

- 生成ファイルのパスリスト
- エージェント設計仕様
- 依存関係情報

**何を返すか**:

- 準拠性チェック結果（合格/不合格）
- 違反項目の詳細リスト
- 修正提案と優先度

### agents/integration.md

アーキテクチャ原則をエージェント設計に統合するTask仕様。

**いつ起動するか**:

- 準拠性検証完了後
- エージェント設計の最終化時
- ドキュメント更新が必要な時

**何を入力するか**:

- 検証済みアーキテクチャ設計
- エージェント仕様
- 統合対象コンポーネント

**何を返すか**:

- 統合完了エージェント設計
- 更新されたアーキテクチャドキュメント
- 実行記録とメトリクス

## ベストプラクティス

### すべきこと

- エージェントがプロジェクト構造に準拠したファイルを生成する時
- データベース操作を行うエージェントを設計する時
- API連携エージェントを設計する時
- テスト実行エージェントを設計する時
- デプロイ関連エージェントを設計する時
- shared/ と features/ の配置判断に迷った時は必ず Task を起動する
- 依存関係ルールの違反チェックを必ず実行する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- shared/ から features/ への依存を作らない（逆方向のみ許可）
- features/ 間の直接依存を避ける（shared/ を経由）
- アーキテクチャ検証をスキップしない
- ドメインロジックを shared/ に配置しない

## リソース/スクリプト参照

### references/ - 段階的知識参照

**Level 1 (基礎)**: [references/Level1_basics.md](references/Level1_basics.md)

- スキル適用タイミングの理解
- 基本概念の把握
- 最小要件の確認

**Level 2 (実務)**: [references/Level2_intermediate.md](references/Level2_intermediate.md)

- リソース・スクリプトの活用
- テンプレート運用
- 実践的な適用手順

**Level 3 (応用)**: [references/Level3_advanced.md](references/Level3_advanced.md)

- 複雑なアーキテクチャパターン
- 高度な統合シナリオ
- パフォーマンス最適化

**Level 4 (専門)**: [references/Level4_expert.md](references/Level4_expert.md)

- アーキテクチャ設計の深い原則
- カスタムパターンの設計
- 大規模システムへの適用

### 専門リソース

- **Hybrid Architecture Guide**: [references/hybrid-architecture-guide.md](references/hybrid-architecture-guide.md)
  - shared/ と features/ の構造設計
  - 依存関係ルールの詳細
  - ベストプラクティスと禁止事項
- **Requirements Index**: [references/requirements-index.md](references/requirements-index.md)
  - プロジェクト要求仕様との同期
  - 技術スタック仕様書の参照
- **Legacy Skill**: [references/legacy-skill.md](references/legacy-skill.md)
  - 旧SKILL.mdの全文
  - 移行履歴の参照

### scripts/ - 決定論的処理

**check-architecture-compliance.mjs**:

```bash
node scripts/check-architecture-compliance.mjs --help
# アーキテクチャ準拠性の自動チェック
# 終了コード: 0=準拠, 1=違反あり, 2=引数エラー
```

**log_usage.mjs**:

```bash
node scripts/log_usage.mjs --result success --phase analysis
# 使用記録と自動評価
# --result: success | failure
# --phase: analysis | compliance | integration
```

**validate-skill.mjs**:

```bash
node scripts/validate-skill.mjs
# スキル構造の検証
# YAML frontmatter、ファイル構造の確認
```

### assets/ - 出力素材

**architecture-compliance-checklist.md**:

```bash
cat assets/architecture-compliance-checklist.md
# アーキテクチャ準拠チェックリストのテンプレート
# エージェント設計レビュー時に使用
```

## コマンドリファレンス

### クイックスタート

```bash
# 1. Level1 を読んで基礎を理解
cat references/Level1_basics.md

# 2. アーキテクチャ分析 Task を起動（詳細は agents/architecture-analysis.md）
# Task内で Hybrid Architecture Guide を参照しながら分析

# 3. 準拠性チェックを実行
node scripts/check-architecture-compliance.mjs --path <target-files>

# 4. 使用記録を保存
node scripts/log_usage.mjs --result success --phase analysis
```

### 段階的学習パス

```bash
# 初心者: Level 1 → Hybrid Architecture Guide
cat references/Level1_basics.md
cat references/hybrid-architecture-guide.md

# 中級者: Level 2 → スクリプト実行
cat references/Level2_intermediate.md
node scripts/check-architecture-compliance.mjs --help

# 上級者: Level 3 → 複雑なパターン適用
cat references/Level3_advanced.md

# 専門家: Level 4 → カスタムパターン設計
cat references/Level4_expert.md
```

## 変更履歴

| Version | Date       | Changes                                             |
| ------- | ---------- | --------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md 仕様準拠: agents/追加、description更新 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added         |
