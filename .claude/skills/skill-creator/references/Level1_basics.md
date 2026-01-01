# Level 1: Basics

## 概要

18-skills.md仕様に完全準拠したスキルを作成・更新するためのメタスキル。
「スキルを作るためのスキル」として、仕様の全セクション（§1-11）を反映したワークフロー、Task仕様書、検証スクリプト、テンプレートを提供する。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 18-skills.md 仕様の基本的な理解がある
- スキルの目的（新規作成 or 更新）が明確である

## 詳細ガイド

### 使用タイミング

- Use when creating new skills, updating existing skills, validating skill structure, or generating skill templates.
- skill creation, skill update, skill validation, skill template, 18-skills spec, スキル作成

### 必要な知識

- 対象領域: 18-skills.md仕様に準拠したスキル作成・更新
- 主要概念: Progressive Disclosure、Task分離、知識圧縮アンカー
- 実務指針: 新規スキル作成時、既存スキル更新時、スキル構造検証時

### 判断基準

- スキルの発動条件（Trigger）を英語で定義できるか
- 知識圧縮アンカー候補（1-5個）を特定できるか
- Task分割の必要性を判断できるか

### 成果物の最小要件

- SKILL.md（frontmatter + 本文）
- 必要に応じて agents/、references/、scripts/、assets/

### 参照書籍

- 『Continuous Delivery』（Jez Humble）: 自動化・検証フロー
- 『The Lean Startup』（Eric Ries）: Build-Measure-Learn
- 『Domain-Driven Design』（Eric Evans）: ユビキタス言語

### 主要リソース

- `SKILL.md`: スキルの目的・前提・判断基準の基礎
- See [spec-overview.md](spec-overview.md): 18-skills.md §1-2の要約

### 主要テンプレート

- `assets/skill-template.md`: SKILL.md テンプレート
- `assets/agent-task-template.md`: agents/\*.md テンプレート

## 実践手順

1. SKILL.md の Phase 1-4 ワークフローを確認する
2. 新規作成の場合は要件分析（Phase 1）から開始
3. 更新の場合は影響範囲を特定してから着手
4. 最小限の成果物（SKILL.md）から始める

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している
- [ ] 4つのPhaseの流れを理解している
