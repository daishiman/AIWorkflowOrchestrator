---
name: .claude/skills/progressive-disclosure/SKILL.md
description: |
  3層開示モデルによるトークン効率と知識スケーラビリティの両立を専門とするスキル。
  メタデータ→本文→リソースの段階的な情報提供により、必要な時に必要な知識だけを
  ロードし、スキル発動信頼性を最大化します。

  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/agent-dependency-format-guide.md`: agent-dependency-format-guide のガイド
  - `references/commitment-mechanism.md`: コミットメントメカニズム設計ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/metadata-design.md`: メタデータ設計ガイド
  - `references/skill-activation-optimization.md`: スキル発動最適化ガイド
  - `references/three-layer-model.md`: 3層開示モデル詳細ガイド
  - `references/token-efficiency-strategies.md`: 遅延読み込み、インデックス駆動設計によるトークン使用量60-80%削減手法
  - `scripts/calculate-token-usage.mjs`: Token Usage Calculator for Claude Code Skills
  - `scripts/calculate-token-usage.sh`: File Size Checker for Claude Code Skills
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/skill-metadata-template.yaml`: skill-metadata-template設定ファイル

  Use proactively when handling progressive disclosure tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Progressive Disclosure

## 概要

3層開示モデルによるトークン効率と知識スケーラビリティの両立を専門とするスキル。
メタデータ→本文→リソースの段階的な情報提供により、必要な時に必要な知識だけを
ロードし、スキル発動信頼性を最大化します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

Progressive Disclosureの実践は、3つのTaskに分割して実行します。
各Taskは独立したコンテキストで実行され、メインコンテキストを汚さずに完了します。

### Phase 1: 目的と前提の整理

**Task仕様**: `agents/phase1-analysis.md`（Barbara Liskovの契約設計思考）

**目的**: タスクの目的と前提条件を明確にする

**入力**:

- タスク要求（ユーザーまたは呼び出し元から）
- 現在のプロジェクトコンテキスト

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/assets を特定
3. 前提条件を検証し、欠落を洗い出す

**出力**:

- 分析レポート（目的、成果物、必要リソース、前提条件チェック結果）
- リソース特定リスト（各リソースの読み込みタイミングと目的）

### Phase 2: スキル適用

**Task仕様**: `agents/phase2-execution.md`（Kent Beckの段階的前進思考）

**目的**: スキルの指針に従って具体的な作業を進める

**入力**:

- Phase 1の分析レポート
- リソース特定リスト

**アクション**:

1. 必要なreferencesを段階的に読み込む（Level1→Level2→Level3→Level4）
2. 関連リソースやテンプレートを参照しながら作業を実施
3. 重要な判断点をメモとして残す（理由と代替案を含む）

**出力**:

- 最終成果物（タスクの目的に応じた形式）
- 判断ログ（重要な判断点の記録）
- 使用リソースリスト（トークン効率の検証用）

### Phase 3: 検証と記録

**Task仕様**: `agents/phase3-validation.md`（Dijkstraの厳密検証思考）

**目的**: 成果物の検証と実行記録の保存

**入力**:

- Phase 2の最終成果物
- 判断ログ
- 使用リソースリスト

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す
4. EVALS.jsonとLOGS.mdを確認し、メトリクスが更新されたことを確認

**出力**:

- 検証レポート（品質検証、スキル構造検証、総合評価、改善提案）
- LOGS.mdへの実行記録エントリ
- EVALS.jsonのメトリクス更新

## ベストプラクティス

### すべきこと

- スキルのYAML Frontmatter（特にdescription）を設計する時
- トークン使用量を最小化する必要がある時
- スキルの自動発動率を向上させる時
- 大量の知識を効率的に提供する必要がある時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/progressive-disclosure/references/Level1_basics.md
cat .claude/skills/progressive-disclosure/references/Level2_intermediate.md
cat .claude/skills/progressive-disclosure/references/Level3_advanced.md
cat .claude/skills/progressive-disclosure/references/Level4_expert.md
cat .claude/skills/progressive-disclosure/references/agent-dependency-format-guide.md
cat .claude/skills/progressive-disclosure/references/commitment-mechanism.md
cat .claude/skills/progressive-disclosure/references/legacy-skill.md
cat .claude/skills/progressive-disclosure/references/metadata-design.md
cat .claude/skills/progressive-disclosure/references/skill-activation-optimization.md
cat .claude/skills/progressive-disclosure/references/three-layer-model.md
cat .claude/skills/progressive-disclosure/references/token-efficiency-strategies.md
```

### スクリプト実行

```bash
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs --help
.claude/skills/progressive-disclosure/scripts/calculate-token-usage.sh
node .claude/skills/progressive-disclosure/scripts/log_usage.mjs --help
node .claude/skills/progressive-disclosure/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/progressive-disclosure/assets/skill-metadata-template.yaml
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |
