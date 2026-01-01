---
name: security-reporting
description: |
  セキュリティ診断レポート生成およびセキュリティ監査結果の文書化におけるベストプラクティスを提供します。

  **Trigger**: セキュリティレポート作成、脆弱性報告、セキュリティ監査結果文書化、脅威分析レポート生成時に使用。

  **Anchors**: #security-reporting, #vulnerability-reporting, #security-audit, #threat-analysis
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
version: 2.0.0
level: 2
last_updated: 2025-12-31
references:
  - book: "Web Application Security"
    author: "Andrew Hoffman"
    concepts:
      - "脅威モデリング"
      - "セキュア設計"
      - "脆弱性評価"
---

# セキュリティレポート作成

## 概要

このスキルは、セキュリティ診断結果、脆弱性評価、セキュリティ監査結果を専門的かつ体系的にレポート化するためのベストプラクティスを提供します。脅威モデリング、リスク評価、レポート生成の各フェーズを通じて、信頼性と実用性の高いセキュリティドキュメントを作成します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## Task仕様ナビ

| Task                 | 説明                               | リソース                    | 難易度 |
| -------------------- | ---------------------------------- | --------------------------- | ------ |
| 脅威分析             | セキュリティ脅威の特定と分析       | Level1_basics.md            | 初級   |
| 脆弱性評価           | 検出された脆弱性のリスク評価       | Level2_intermediate.md      | 中級   |
| リスク採点           | CVSS等の手法を用いたリスク採点     | risk-scoring-methodology.md | 中級   |
| レポート生成         | セキュリティレポートの作成と構成   | security-report-template.md | 中級   |
| 監査文書化           | セキュリティ監査結果の体系的文書化 | Level3_advanced.md          | 上級   |
| 推奨事項作成         | 改善推奨事項の策定と優先順位付け   | Level3_advanced.md          | 上級   |
| エグゼクティブサマリ | 経営層向けサマリーの作成           | Level4_expert.md            | 上級   |

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

- **事前調査**: `references/Level1_basics.md` を参照し、対象システムの適用範囲を明確にしてからレポート作成を開始する
- **手順遵守**: `references/Level2_intermediate.md` を参照し、脅威分析からレポート生成までの実務手順を整理してから作業を進める
- **テンプレート活用**: `assets/security-report-template.md` を使用し、統一された形式でレポートを作成する
- **リスク採点**: `references/risk-scoring-methodology.md` に基づいてCVSSスコアやその他の方法で脆弱性を定量評価する
- **レビュー確認**: 完成したレポートを複数の観点で検証し、正確性と実用性を確保する
- **スクリプト検証**: `scripts/validate-skill.mjs` でスキル構造を確認し、出力内容の一貫性を保つ

### 避けるべきこと

- **準備不足**: アンチパターンや注意点を確認せずに進めることを避ける
- **主観的評価**: リスク評価を主観的に行わず、定量的な手法（CVSS、OWASP RiskRatingなど）を使用する
- **不完全な文書化**: 推奨事項なしでリスクだけを報告することを避ける
- **難解な表現**: 技術用語を過度に使用し、ステークホルダーが理解しにくいレポートを作成することを避ける
- **優先順位付けなし**: リスク対応の優先順位を明示しないレポートを避ける

## リソース参照

### 学習リソース

| リソース                                | 用途                               | 対象レベル |
| --------------------------------------- | ---------------------------------- | ---------- |
| `references/Level1_basics.md`            | セキュリティレポート作成の基礎知識 | 初級       |
| `references/Level2_intermediate.md`      | 実務的なレポート作成手順           | 中級       |
| `references/Level3_advanced.md`          | 高度なリスク評価と分析手法         | 上級       |
| `references/Level4_expert.md`            | エキスパート向け高度な戦略         | 上級       |
| `references/legacy-skill.md`             | 旧SKILL.mdの全文                   | 参考       |
| `references/risk-scoring-methodology.md` | リスク採点方法論（CVSS等）         | 実務       |

### テンプレートと自動化スクリプト

| ファイル                                | 説明                                   |
| --------------------------------------- | -------------------------------------- |
| `assets/security-report-template.md` | セキュリティレポートテンプレート       |
| `scripts/generate-security-report.mjs`  | セキュリティレポート自動生成スクリプト |
| `scripts/validate-skill.mjs`            | スキル構造検証スクリプト               |
| `scripts/log_usage.mjs`                 | 使用記録および自動評価スクリプト       |

### コマンド例

**リソース読み取り:**

```bash
cat .claude/skills/security-reporting/references/Level1_basics.md
cat .claude/skills/security-reporting/references/Level2_intermediate.md
cat .claude/skills/security-reporting/references/risk-scoring-methodology.md
```

**スクリプト実行:**

```bash
node .claude/skills/security-reporting/scripts/generate-security-report.mjs --help
node .claude/skills/security-reporting/scripts/validate-skill.mjs --help
node .claude/skills/security-reporting/scripts/log_usage.mjs --help
```

**テンプレート参照:**

```bash
cat .claude/skills/security-reporting/assets/security-report-template.md
```

## 変更履歴

| Version | Date       | Changes                                                                                                                             |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様への準拠。YAML frontmatter更新、Task仕様ナビ追加、Trigger明示、リソース参照セクション拡充、ベストプラクティス詳細化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                         |
