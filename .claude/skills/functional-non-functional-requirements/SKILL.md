---
name: functional-non-functional-requirements
description: |
  機能要件と非機能要件の分類と定義スキル。要件を適切なカテゴリに分類し、
  漏れなく体系的に管理するための方法論を提供します。

  Anchors:
  • ISO/IEC 25010 品質モデル / 適用: NFR分類と品質特性定義 / 目的: 8品質特性による網羅的カバレッジ
  • Don't Make Me Think (Steve Krug) / 適用: ユーザビリティ要件定義 / 目的: 直感性と認知負荷の測定基準
  • Software Requirements (Karl Wiegers) / 適用: 要件品質検証 / 目的: SMART原則による検証可能性確保

  Trigger:
  Use when classifying requirements into functional and non-functional categories.
  Use when defining measurable quality attributes for NFRs.
  Use when validating requirements completeness and consistency.
  Keywords: requirements, functional, non-functional, NFR, quality attributes, ISO 25010, SMART criteria, measurability
version: 1.0.1
level: 1
last_updated: 2025-12-31
tags:
  - requirements-engineering
  - quality-attributes
  - nfr
  - software-requirements
---

# Functional and Non-Functional Requirements

## 概要

機能要件と非機能要件の分類と定義スキル。要件を適切なカテゴリに分類し、
漏れなく体系的に管理するための方法論を提供します。
専門分野:

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

このスキルは3つのTask（agents/）に分離されています。各Taskは独立して実行可能ですが、推奨される順序で実行することで最適な結果が得られます。

### Phase 1: 要件分析（Requirements Analysis）

**目的**: プロジェクトの要件を収集・分析し、初期リストを作成する

**Task仕様**: `agents/requirements-analyst.md`

**入力**:

- プロジェクト概要（目的、対象ユーザー、主要機能）
- ステークホルダー要求リスト

**出力**:

- 要件初期リスト（要件ID、記述、初期分類、優先度）

**参考リソース**:

- `references/Level1_basics.md`: 基本的な要件分類の考え方
- `references/classification-guide.md`: 詳細な分類ガイドライン

### Phase 2: 要件分類（Requirements Classification）

**目的**: 要件をFR/NFRに厳密に分類し、NFRを品質特性別に細分化する

**Task仕様**: `agents/requirements-classifier.md`

**入力**:

- 要件初期リスト（Phase 1の出力）

**出力**:

- 要件分類済みリスト（FR、NFR、Constraint別）
- NFRの測定基準初期案

**参考リソース**:

- `references/quality-attributes.md`: ISO 25010品質特性の詳細
- `references/classification-guide.md`: 分類判断基準
- `references/nfr-templates.md`: NFR記述パターン

### Phase 3: 要件検証（Requirements Validation）

**目的**: 分類済み要件の品質を検証し、完全性・一貫性を確保する

**Task仕様**: `agents/requirements-validator.md`

**入力**:

- 要件分類済みリスト（Phase 2の出力）

**出力**:

- 要件検証レポート（指摘事項、カバレッジ分析）
- 最終要件定義書

**参考リソース**:

- `references/measurement-guide.md`: NFR測定可能性のガイド
- `scripts/check-nfr-coverage.mjs`: 品質特性カバレッジ自動チェック
- `assets/nfr-definition-template.md`: 最終成果物テンプレート

### 実行記録

各Phaseの完了後、以下のコマンドで実行記録を残してください：

```bash
node .claude/skills/functional-non-functional-requirements/scripts/log_usage.mjs \
  --result success \
  --phase "Phase 1: Requirements Analysis" \
  --notes "{{feedback}}"
```

## ベストプラクティス

### すべきこと

- 要件を機能/非機能に分類する時
- 非機能要件を定義する時
- 品質特性を網羅的に確認する時
- 見落としがちな要件を発見する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/functional-non-functional-requirements/references/Level1_basics.md
cat .claude/skills/functional-non-functional-requirements/references/Level2_intermediate.md
cat .claude/skills/functional-non-functional-requirements/references/Level3_advanced.md
cat .claude/skills/functional-non-functional-requirements/references/Level4_expert.md
cat .claude/skills/functional-non-functional-requirements/references/classification-guide.md
cat .claude/skills/functional-non-functional-requirements/references/legacy-skill.md
cat .claude/skills/functional-non-functional-requirements/references/measurement-guide.md
cat .claude/skills/functional-non-functional-requirements/references/nfr-templates.md
cat .claude/skills/functional-non-functional-requirements/references/quality-attributes.md
```

### スクリプト実行

```bash
node .claude/skills/functional-non-functional-requirements/scripts/check-nfr-coverage.mjs --help
node .claude/skills/functional-non-functional-requirements/scripts/log_usage.mjs --help
node .claude/skills/functional-non-functional-requirements/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/functional-non-functional-requirements/assets/nfr-definition-template.md
```

## Task Specifications (agents/)

このスキルは以下のTask仕様書を提供します。各Taskは実行直前に読み込まれます：

- **requirements-analyst.md**: Phase 1の要件分析Task仕様
- **requirements-classifier.md**: Phase 2の要件分類Task仕様
- **requirements-validator.md**: Phase 3の要件検証Task仕様

各Task仕様には、役割、入力/出力、思考プロセス、チェックリスト、参照書籍が含まれています。

## 変更履歴

| Version | Date       | Changes                                                                |
| ------- | ---------- | ---------------------------------------------------------------------- |
| 1.0.1   | 2025-12-31 | Added EVALS.json, LOGS.md, and agents/ Task specifications (18-skills) |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                            |
