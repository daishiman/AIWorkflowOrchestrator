---
name: pm2-ecosystem-config
description: |
  PM2エコシステム設定の専門スキル。
  プロセス管理、クラスタモード、ログ設定、環境管理を提供します。

  Anchors:
  • 『PM2 Documentation』（Keymetrics） / 適用: プロセス管理 / 目的: 運用自動化
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas） / 適用: 実践的実装 / 目的: 品質向上

  Trigger:
  PM2設定時、プロセス管理設計時、Node.jsアプリデプロイ時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# PM2 Ecosystem Configuration スキル

## 概要

PM2エコシステム設定の設計と最適化を専門とするスキル。ecosystem.config.js の構成、実行モード選択、環境設定、監視設定を体系的に設計し、Node.jsアプリケーションのプロセス管理を最適化します。

このスキルは以下のタスクに対応します：

- ecosystem.config.js の新規作成と既存設定の最適化
- fork モードと cluster モードの選択と実装
- 環境変数管理と本番環境構築
- プロセス監視とエラーハンドリング設定

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## ベストプラクティス

### すべきこと

- PM2でNode.jsアプリケーションを管理する時
- ecosystem.config.jsを新規作成する時
- 既存PM2設定を最適化する時
- 本番環境でのプロセス管理設定を設計する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- 実行モードを適切に選択せずにデフォルト設定を使用する
- 環境変数の階層設計を計画しないまま実装する
- 監視設定と再起動戦略の組み合わせを検討しない

## Task仕様ナビ

| タスク                   | リソース                              | スクリプト                       | テンプレート                             |
| ------------------------ | ------------------------------------- | -------------------------------- | ---------------------------------------- |
| Level 1: 基礎設定        | `references/Level1_basics.md`          | `scripts/validate-skill.mjs`     | `assets/ecosystem.config.template.js` |
| Level 2: 実務設定        | `references/Level2_intermediate.md`    | `scripts/validate-ecosystem.mjs` | `assets/ecosystem.config.template.js` |
| Level 3: 応用最適化      | `references/Level3_advanced.md`        | `scripts/validate-skill.mjs`     | `assets/ecosystem.config.template.js` |
| Level 4: 専門構築        | `references/Level4_expert.md`          | `scripts/validate-ecosystem.mjs` | `assets/ecosystem.config.template.js` |
| ecosystem.config.js 設計 | `references/config-structure-guide.md` | `scripts/validate-ecosystem.mjs` | `assets/ecosystem.config.template.js` |
| 環境管理戦略             | `references/environment-management.md` | `scripts/validate-skill.mjs`     | `assets/ecosystem.config.template.js` |
| 実行モード選択           | `references/execution-modes.md`        | `scripts/validate-ecosystem.mjs` | `assets/ecosystem.config.template.js` |
| 使用記録・評価           | `references/legacy-skill.md`           | `scripts/log_usage.mjs`          | N/A                                      |

## リソース参照

### references/

- **Level1_basics.md**: PM2基礎、設定ファイルの基本構造、簡単な例
- **Level2_intermediate.md**: 実務的な設定パターン、環境分離、監視設定
- **Level3_advanced.md**: パフォーマンス最適化、cluster モード、負荷分散
- **Level4_expert.md**: 高度なシナリオ、複雑な環境構築、トラブルシューティング
- **config-structure-guide.md**: ecosystem.config.js の完全な構造ガイド、apps配列、必須/推奨オプション
- **environment-management.md**: env 階層設計、env_production の分離、機密情報外部化パターン
- **execution-modes.md**: fork vs cluster モード選択基準、instances 決定方法、負荷タイプ別最適化
- **legacy-skill.md**: 旧 SKILL.md の全文、参考用

### scripts/

- **log_usage.mjs**: スキル使用記録・自動評価スクリプト
- **validate-ecosystem.mjs**: ecosystem.config.js の構文検証と設定項目の整合性チェック
- **validate-skill.mjs**: スキル構造検証スクリプト

### assets/

- **ecosystem.config.template.js**: PM2 設定ファイルテンプレート（実行モード、再起動戦略、環境変数含む）

## 変更履歴

| Version | Date       | Changes                                                                                             |
| ------- | ---------- | --------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠。Anchors/Trigger追加、Task仕様ナビテーブル追加、リソース参照セクション再編成 |
