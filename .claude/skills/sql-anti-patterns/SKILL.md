---
name: sql-anti-patterns
description: |
  SQLアンチパターンの専門スキル。
  N+1問題、デッドロック、非効率クエリの検出・回避を提供します。

  Anchors:
  • 『SQLアンチパターン』（Bill Karwin）/ 適用: データベース設計 / 目的: パフォーマンス向上
  • 『Designing Data-Intensive Applications』（Martin Kleppmann）/ 適用: データモデリング / 目的: スケーラビリティ向上

  Trigger:
  SQLアンチパターン検出時、データベース設計レビュー時、クエリ最適化時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# SQL アンチパターン

## 概要

Bill Karwinの『SQLアンチパターン』に基づいて、データベース設計とクエリ実装の落とし穴（アンチパターン）を認識し、適切な解決策を提案するスキルです。スキーマ設計の矛盾、クエリパフォーマンスの問題、データ整合性の違反などを検出・改善します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認してアンチパターンの分類を理解
2. レビュー対象のスキーマ、クエリ、設計を特定
3. 必要な references/scripts/templates を指定

### Phase 2: スキル適用

**目的**: スキルの指針に従ってアンチパターン検出と改善を実施

**アクション**:

1. `references/anti-patterns-catalog.md` を参照してアンチパターンの詳細を把握
2. `scripts/detect-anti-patterns.mjs` を実行してアンチパターン候補を自動検出
3. 関連リソースやテンプレートを参照しながら改善案を作成
4. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 改善案がビジネス要件と設計原則に合致するか確認
3. パフォーマンス影響を検証
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| Task                   | 説明                                                        | 使用リソース                                     | 使用テンプレート           |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| **アンチパターン検出** | スキーマやクエリの既知のアンチパターンを識別                | Level1_basics.md, anti-patterns-catalog.md       | detect-anti-patterns.mjs   |
| **スキーマレビュー**   | テーブル設計、正規化、主キー・外キー設計をレビュー          | Level2_intermediate.md, Level3_advanced.md       | schema-review-checklist.md |
| **クエリ最適化提案**   | パフォーマンス低下、N+1問題、不適切なインデックス使用を検出 | Level2_intermediate.md, anti-patterns-catalog.md | detect-anti-patterns.mjs   |
| **改善プラン作成**     | アンチパターン改善の具体的なステップと影響分析を記述        | Level3_advanced.md, Level4_expert.md             | schema-review-checklist.md |

## ベストプラクティス

### すべきこと

- `references/Level1_basics.md` を参照し、アンチパターンの分類と定義を理解する
- `references/Level2_intermediate.md` を参照し、実務的な改善手順を整理する
- `references/anti-patterns-catalog.md` でアンチパターンの詳細情報を確認する
- スキーマレビューの際は `assets/schema-review-checklist.md` を使用
- クエリ品質向上時は `scripts/detect-anti-patterns.mjs` を自動実行
- Level3以上のリソースで応用的なアンチパターンも認識する
- 複数のアンチパターンが相互に関連していないか確認

### 避けるべきこと

- アンチパターンの背景と原因を確認せずに改善を提案すること
- ビジネス要件や既存の制約を無視した改善案を作成すること
- パフォーマンス向上のみを優先し、保守性やスケーラビリティを無視すること
- 簡単な修正案でなく、全体的な設計改善を検討しないこと
- 正規化と非正規化のトレードオフを考慮しないこと

## リソース参照

### Resources（リソース）

| リソース                             | 説明                               | 用途               |
| ------------------------------------ | ---------------------------------- | ------------------ |
| `references/Level1_basics.md`         | アンチパターンの基礎分類と定義     | 初期学習、概念理解 |
| `references/Level2_intermediate.md`   | 実務的な改善手順と事例             | 実装、意思決定     |
| `references/Level3_advanced.md`       | 高度なアンチパターンと複合シナリオ | 高度な設計検討     |
| `references/Level4_expert.md`         | エキスパートレベルの深掘り分析     | 専門的な最適化     |
| `references/anti-patterns-catalog.md` | SQLアンチパターンの完全カタログ    | 参照、検索         |
| `references/legacy-skill.md`          | 旧SKILL.mdの全文                   | 変更履歴確認       |

### Scripts（スクリプト）

| スクリプト                         | 説明                   | コマンド                                                                        |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| `scripts/detect-anti-patterns.mjs` | アンチパターン自動検出 | `node .claude/skills/sql-anti-patterns/scripts/detect-anti-patterns.mjs --help` |
| `scripts/log_usage.mjs`            | 使用記録・自動評価     | `node .claude/skills/sql-anti-patterns/scripts/log_usage.mjs --help`            |
| `scripts/validate-skill.mjs`       | スキル構造検証         | `node .claude/skills/sql-anti-patterns/scripts/validate-skill.mjs --help`       |

### Templates（テンプレート）

| テンプレート                           | 説明                           | 参照コマンド                                                                |
| -------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `assets/schema-review-checklist.md` | スキーマレビューチェックリスト | `cat .claude/skills/sql-anti-patterns/assets/schema-review-checklist.md` |

## 変更履歴

| Version | Date       | Changes                                                                                                  |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に完全準拠：YAML frontmatter(Anchor/Trigger)追加、Task仕様ナビ・リソース参照をテーブル化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                              |
