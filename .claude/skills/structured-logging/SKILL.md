---
name: structured-logging
description: |
  構造化ログ設計の専門スキル。JSON形式ログ、ログレベル体系、PII マスキング、ログスキーマ設計における段階的ガイダンスを提供します。

  Anchors:
  • Observability Engineering (Charity Majors) / 適用: ログ設計とメトリクス / 目的: 可観測性向上
  • Structured Logging in Cloud Native (12-Factor App) / 適用: JSON形式ログ設計 / 目的: 標準ログ形式の統一

  Trigger:
  構造化ログシステム実装、JSONログ設計、ログレベル体系設計、PII マスキング戦略、ログスキーマ定義、可観測性向上時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Structured Logging - 構造化ロギング設計

## 概要

構造化ログシステム設計の専門スキル。JSON形式ログ、ログレベル階層、PII マスキング、スキーマ設計の段階的ガイダンスを提供します。アプリケーションの可観測性を向上させ、ログの検索・分析・監視を効率化するためのベストプラクティスを習得できます。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 要件と前提の整理

**目的**: ログシステムの要件と現在の状態を把握する

**アクション**:

1. 対象システムのログ要件を確認（ログレベル、形式、保持期間）
2. 必要なガイダンスレベルを判断（基礎/中級/上級/専門）
3. 参照する references/ ファイルを選択:
   - 基礎: `references/Level1_basics.md`
   - 中級: `references/Level2_intermediate.md`
   - 上級: `references/Level3_advanced.md`
   - 専門: `references/Level4_expert.md`

### Phase 2: スキル適用と実装

**目的**: スキルの指針に従って構造化ログシステムを設計・実装する

**アクション**:

1. 必要に応じて以下の参照資料を確認:
   - ログレベル設計: `references/log-level-guide.md`
   - ログスキーマ定義: `references/log-schema-design.md`
   - PII マスキング: `references/pii-masking-patterns.md`

2. テンプレートを使用して実装:
   - ログ形式例: `assets/log-format-examples.json`
   - Logger実装: `assets/logger-template.ts`

3. 重要な判断点をドキュメント化

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. ログ形式の検証: `node scripts/validate-log-format.mjs <log-file>`
2. スキル構造の検証: `node scripts/validate-skill.mjs`
3. 使用記録の保存: `node scripts/log_usage.mjs --result success --phase "implementation"`

## Task仕様ナビ

| Phase   | Task           | 目的                    | 参照資料                | 成果物               |
| ------- | -------------- | ----------------------- | ----------------------- | -------------------- |
| Phase 1 | 要件分析       | ログ要件の明確化        | Level1_basics.md        | 要件ドキュメント     |
| Phase 1 | 現状評価       | 既存ログシステムの確認  | legacy-skill.md         | 評価レポート         |
| Phase 2 | スキーマ設計   | JSON ログスキーマの定義 | log-schema-design.md    | schema.json          |
| Phase 2 | ログレベル体系 | 適切なログレベル設計    | log-level-guide.md      | level-design.md      |
| Phase 2 | PII マスキング | 機密情報の保護戦略      | pii-masking-patterns.md | masking-config.json  |
| Phase 2 | Logger実装     | ログ出力の実装          | logger-template.ts      | logger.ts            |
| Phase 3 | 検証           | ログ形式の妥当性確認    | validate-log-format.mjs | validation-report.md |
| Phase 3 | 記録           | スキル使用の記録        | log_usage.mjs           | logs.md              |

## ベストプラクティス

### すべきこと

- JSON形式ログを採用し、機械可読性を確保する
- ログレベル（DEBUG, INFO, WARN, ERROR, FATAL）を適切に使い分ける
- タイムスタンプ、トレース ID、リクエスト ID を必ず含める
- PII (個人識別情報) をマスキングし、セキュリティを確保する
- ログスキーマを標準化し、一貫性を保つ
- 構造化ログで検索・フィルタリング・集計を容易にする
- contexts/Level2_intermediate.md で実務パターンを確認する

### 避けるべきこと

- プレーンテキスト形式のログを使用しない
- ログレベルを無視してすべてを INFO で出力しない
- 機密情報（パスワード、API キー、PII）をログに出力しない
- 非構造化ログをデータベースに保存しない
- ログスキーマなしに運用を開始しない
- PII マスキングを後付けにしない（実装時に組み込む）
- アンチパターンや注意点を確認せずに進めることを避ける

## リソース/スクリプト参照

### references/ （段階的参照資料）

- **Level1_basics.md**: 構造化ログの基礎知識
- **Level2_intermediate.md**: 実務レベルのログ設計と実装
- **Level3_advanced.md**: 高度なログシステム設計パターン
- **Level4_expert.md**: 専門的なログ監視・分析技法
- **log-level-guide.md**: ログレベルの定義と使い分けガイド
- **log-schema-design.md**: JSON ログスキーマ設計のベストプラクティス
- **pii-masking-patterns.md**: 機密情報マスキング戦略とパターン集
- **legacy-skill.md**: 旧SKILL.mdの参考資料
- **requirements-index.md**: 要求仕様索引（docs/00-requirements と同期）

### scripts/ （実行スクリプト）

- **validate-log-format.mjs**: ログ形式の構文・スキーマチェック
- **validate-skill.mjs**: スキル構造の整合性検証
- **log_usage.mjs**: スキル使用記録と自動評価

### assets/ （出力テンプレート・例）

- **log-format-examples.json**: JSON ログ形式の具体例
- **logger-template.ts**: Logger実装のテンプレート

## 変更履歴

| Version | Date       | Changes                                                      |
| ------- | ---------- | ------------------------------------------------------------ |
| 2.0.0   | 2025-12-31 | 18-skills.md 仕様に準拠、Task仕様ナビ追加、日本語Trigger実装 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                  |
