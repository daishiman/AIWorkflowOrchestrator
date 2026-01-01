---
name: skill-creator
description: |
  18-skills.md仕様に完全準拠したスキルを作成・更新するためのメタスキル。
  Progressive Disclosure、Task分離、知識圧縮アンカーを適用し、高品質なスキルを効率的に量産する。
  目的に合わせてagents/scripts/assets/referencesを必要最小限で設計する。

  Anchors:
  • 18-skills.md / 適用: スキル構造・フォーマット全般 / 目的: 仕様準拠の担保
  • Continuous Delivery (Jez Humble) / 適用: 自動化・検証フロー / 目的: 品質パイプライン構築
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善サイクル
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した語彙設計

  Trigger:
  Use when creating new skills, updating existing skills, validating skill structure, or generating skill templates.
  skill creation, skill update, skill validation, skill template, 18-skills spec, スキル作成
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Skill Creator

## 概要

18-skills.md仕様に完全準拠したスキルを作成・更新するためのメタスキル。
「スキルを作るためのスキル」として、仕様の全セクション（§1-11）を反映したワークフロー、Task仕様書、検証スクリプト、テンプレートを提供する。

## ワークフロー

### Phase 1: 要件分析

**目的**: スキルの目的・発動条件・必要リソースを明確化

**アクション**:

1. ユーザー要求からスキルの機能を特定
2. 発動条件（Trigger）を英語で定義
3. 知識圧縮アンカー候補を選定（1-5個）
4. Task分割の必要性を判断
5. 反復作業・決定論処理・多段思考の候補を抽出し、agents/scriptsの仮説を作る
6. 制約と検証条件を整理し、必要な検証スクリプト候補を定義する

**Task**: `agents/analyze-requirements.md` を参照

### Phase 2: 構造設計

**目的**: フォルダ構造とファイル配置を決定

**アクション**:

1. 標準フォルダ構造を適用（SKILL.md以外はゼロベースで追加）
2. agents/ の Task仕様書を設計（目的に必要な分だけ、不要なら作らない）
3. scripts/ の必要性を判断（反復処理/決定論/検証がある時のみ）
4. references/ への知識外部化を計画
5. assets/ のテンプレート配置を決定
6. 目的→リソース対応を明示し、余剰ファイルを排除する

**Task**: `agents/design-structure.md` を参照

### Phase 3: 実装

**目的**: SKILL.md と各リソースを作成

**アクション**:

1. `scripts/init_skill.mjs` を構造設計書の --resources に合わせて実行
2. SKILL.md を作成（frontmatter + 本文）
3. agents/\*.md を作成（構造設計書で必要とされた分のみ）
4. scripts/\*.mjs を実装（実行/検証/品質担保に必要な分のみ）
5. references/\*.md に知識を外部化
6. assets/ にテンプレートを配置
7. 不要な空ディレクトリは作成しない

**Task**: `agents/implement-skill.md` を参照

### Phase 4: 検証とイテレーション

**目的**: 品質基準を満たすまで改善

**アクション**:

1. `scripts/quick_validate.mjs` で構造検証
2. チェックリスト（§8.1）で品質確認
3. 実際のタスクでスキルをテスト
4. `scripts/log_usage.mjs` でフィードバック記録
5. 必要に応じてイテレーション

**Task**: `agents/validate-and-iterate.md` を参照

## Task仕様（ナビゲーション）

下記のエージェントは、デフォルトとして、目的を達成するためにエージェントを追加すること。

| Task                 | 起動タイミング     | 入力             | 出力             |
| -------------------- | ------------------ | ---------------- | ---------------- |
| analyze-requirements | Phase 1開始時      | ユーザー要求     | 要件定義書       |
| design-structure     | Phase 2開始時      | 要件定義書       | 構造設計書       |
| implement-skill      | Phase 3開始時      | 構造設計書       | スキルファイル群 |
| validate-and-iterate | Phase 4開始時      | スキルファイル群 | 検証済みスキル   |
| {{agent-name}}       | Phase {{N}}開始時  | {{input}}        | {{output}}       |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- descriptionにAnchorsとTriggerを必ず含める（§3.2.3）
- 知識圧縮アンカーは1-5個に制限（§2.2）
- SKILL.mdは500行以内に保つ（§3.2.4）
- 詳細知識はreferences/に外部化（§3.5）
- スクリプトは冪等性・エラー出力・引数検証を実装（§3.4.2）
- 目的の制約（文字数/スキーマ/品質条件など）は検証スクリプトで自動チェックする
- agents/\*.mdはTask仕様書テンプレに準拠（§3.3.2）
- 相対パスでリソースを参照（§10.1）
- 目的→リソース対応を示し、agents/scriptsは必要最小限に絞る
- 反復処理は統合し、同種のscripts/agentsの乱立を避ける

### 避けるべきこと

- README.md等の補助ドキュメントを作成しない（§3.1）
- descriptionでMarkdown記法を使用しない（§3.2.3）
- agents/に知識本文をベタ書きしない（§3.3.1）
- 絶対パスや../を含む相対パスを使用しない（§10.2）
- 目的に無関係なagents/scriptsをテンプレ的に作成する
- 空のagents/scripts/references/assetsディレクトリを作成する
- 目的に対する検証や実行を「手順説明のみ」で済ませる
- analyze/design/validate の固定セットを流用してタスク設計を済ませる

**詳細**: See [references/quality-standards.md](references/quality-standards.md)

## リソース参照

### references/（詳細知識）

| リソース           | パス                                                                               | 対応仕様 |
| ------------------ | ---------------------------------------------------------------------------------- | -------- |
| 仕様概要           | See [references/spec-overview.md](references/spec-overview.md)                     | §1-2     |
| 構造仕様           | See [references/skill-structure.md](references/skill-structure.md)                 | §3       |
| ワークフロー       | See [references/workflow-patterns.md](references/workflow-patterns.md)             | §4       |
| 出力パターン       | See [references/output-patterns.md](references/output-patterns.md)                 | §5       |
| 作成・更新プロセス | See [references/creation-update-process.md](references/creation-update-process.md) | §6       |
| フィードバック     | See [references/feedback-loop.md](references/feedback-loop.md)                     | §7       |
| 品質基準           | See [references/quality-standards.md](references/quality-standards.md)             | §8       |
| 命名規則           | See [references/naming-conventions.md](references/naming-conventions.md)           | §9-10    |
| {{reference-name}} | See [references/{{reference-name}}.md](references/{{reference-name}}.md)           | §{{N}}   |

### scripts/（決定論的処理）

**注記**: 以下は本スキル（skill-creator）の内部スクリプト一覧。新規スキルには目的に必要なもを作成する。下記のものはデフォルトとして、目的に合わせて追加すること。

| スクリプト           | 用途                     | 使用例                                                           |
| -------------------- | ------------------------ | ---------------------------------------------------------------- |
| `init_skill.mjs`     | スキルディレクトリ初期化 | `node scripts/init_skill.mjs <skill-name> --path .claude/skills --resources agents,references` |
| `quick_validate.mjs` | 構造検証                 | `node scripts/quick_validate.mjs .claude/skills/<skill-name>`    |
| `log_usage.mjs`      | フィードバック記録       | `node scripts/log_usage.mjs --result success --phase "Phase 4"`  |
| `{{script-name}}.mjs`| {{用途}}                 | `node scripts/{{script-name}}.mjs --{{}}`                        |

### assets/（テンプレート）

| テンプレート             | 用途                      |
| ------------------------ | ------------------------- |
| `skill-template.md`      | SKILL.md テンプレート     |
| `agent-task-template.md` | agents/\*.md テンプレート |
| `script-task-template.mjs` | タスク実行スクリプト雛形 |
| `script-validator-template.mjs` | 制約検証スクリプト雛形 |
| `{{asset-name}}`         | {{asset用途}}             |

## 変更履歴

| Version | Date       | Changes                                    |
| ------- | ---------- | ------------------------------------------ |
| 1.1.0   | 2025-12-31 | 構造改善・参照テーブル形式化・アンカー追加 |
| 1.0.0   | 2025-12-31 | 18-skills.md完全準拠版として新規作成       |
