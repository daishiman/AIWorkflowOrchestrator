---
name: skill-creator
description: |
  スキルを作成・更新するためのメタスキル。
  Progressive Disclosure、Task分離、知識圧縮アンカーを適用し、高品質なスキルを効率的に量産する。
  目的に合わせてagents/scripts/assets/referencesを必要最小限で設計する。
  agents/scripts/assets/referencesは責務ごとに分離し、単一責務の構成で量産可能にする。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化・検証フロー / 目的: 品質パイプライン構築
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善サイクル
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した語彙設計

  Trigger:
  新規スキルの作成、既存スキルの更新、スキル構造の検証、スキルテンプレートの生成を行う場合に使用。
  スキル作成, スキル更新, スキル検証, スキルテンプレート, skills仕様, skill creation
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

スキルを作成・更新するためのメタスキル。
「スキルを作るためのスキル」として、仕様の全セクション（§1-11）を反映したワークフロー、Task仕様書、検証スクリプト、テンプレートを提供する。

## ワークフロー

```
                    ┌→ define-trigger ──┐
extract-purpose → ┼                    ┼→ design-workflow → plan-structure
                    └→ select-anchors ──┘                         ↓
                                                    ┌→ generate-skill-md ─┐
                                                    ┼                      ┼→ validate-structure → record-feedback
                                                    └→ generate-agents ────┘
```

### 並列実行グループ

| グループ   | 含まれるTask                       | 同期ポイント       |
| ---------- | ---------------------------------- | ------------------ |
| parallel-1 | define-trigger, select-anchors     | design-workflow    |
| parallel-2 | generate-skill-md, generate-agents | validate-structure |

### Task 1: 目的抽出（extract-purpose）

ユーザー要求からスキルの本質的な目的を抽出する。

**Task**: `agents/extract-purpose.md` を参照

### Task 2: Trigger定義（define-trigger）

発動条件を日本語で定義する。

**Task**: `agents/define-trigger.md` を参照

### Task 3: アンカー選定（select-anchors）

目標達成に必要十分な知識圧縮アンカーを選定する。

**Task**: `agents/select-anchors.md` を参照

### Task 4: ワークフロー設計（design-workflow）

スキルのワークフローパターンを設計する。並列実行、条件分岐、ループ処理などを検討し、Task間の依存関係を定義する。

**Task**: `agents/design-workflow.md` を参照

### Task 5: 構造設計（plan-structure）

ワークフロー設計に基づき、フォルダ構造とファイル配置を決定する。

**Task**: `agents/plan-structure.md` を参照

### Task 6: SKILL.md生成（generate-skill-md）

構造設計書に基づきSKILL.mdを生成する。

**Task**: `agents/generate-skill-md.md` を参照

### Task 7: agents/生成（generate-agents）

構造設計書で定義されたTask仕様書を生成する。

**Task**: `agents/generate-agents.md` を参照

### Task 8: 構造検証（validate-structure）

作成されたスキルが品質基準を満たすことを検証する。

**Task**: `agents/validate-structure.md` を参照

### Task 9: フィードバック記録（record-feedback）

使用結果を記録し、イテレーションの必要性を判断する。

**Task**: `agents/record-feedback.md` を参照

## Task仕様（ナビゲーション）

| Task               | 責務               | 実行パターン | 入力                        | 出力               |
| ------------------ | ------------------ | ------------ | --------------------------- | ------------------ |
| extract-purpose    | 目的抽出           | seq          | ユーザー要求                | 目的定義書         |
| define-trigger     | Trigger定義        | **par**      | 目的定義書                  | Trigger定義書      |
| select-anchors     | アンカー選定       | **par**      | 目的定義書                  | アンカー定義書     |
| design-workflow    | ワークフロー設計   | **agg**      | 目的/Trigger/アンカー定義書 | ワークフロー設計書 |
| plan-structure     | 構造設計           | seq          | ワークフロー設計書          | 構造設計書         |
| generate-skill-md  | SKILL.md生成       | **par**      | 構造設計書                  | SKILL.md           |
| generate-agents    | agents/生成        | **par**      | 構造設計書                  | agents/\*.md       |
| validate-structure | 構造検証           | **agg**      | SKILL.md + agents/\*.md     | 検証レポート       |
| record-feedback    | フィードバック記録 | seq          | 検証レポート                | LOGS.md更新        |

**実行パターン凡例**:

- `seq`: シーケンシャル（前のTaskに依存）
- `par`: 並列実行（他と独立）
- `cond`: 条件分岐の起点
- `loop`: ループ処理の本体
- `agg`: 集約処理（並列/ループの終点）

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照
**ワークフローパターン**: See [references/workflow-patterns.md](references/workflow-patterns.md)
**注記**: 1 Task = 1 責務。複数責務を1ファイルに入れない。

## ベストプラクティス

### すべきこと

- descriptionにAnchorsとTriggerを必ず含める（§3.2.3）
- 知識圧縮アンカーは目標達成に必要十分な個数を選定（§2.2）
- SKILL.mdは500行以内に保つ（§3.2.4）
- 詳細知識はreferences/に外部化（§3.5）
- スクリプトは冪等性・エラー出力・引数検証を実装（§3.4.2）
- 目的の制約（文字数/スキーマ/品質条件など）は検証スクリプトで自動チェックする
- agents/\*.mdはTask仕様書テンプレに準拠（§3.3.2）
- 相対パスでリソースを参照（§10.1）
- 目的→リソース対応を示し、agents/scriptsは必要最小限に絞る
- 反復処理は統合し、同種のscripts/agentsの乱立を避ける
- agents/scripts/references/assets は責務ごとに分離し、1ファイル=1責務を徹底する

### 避けるべきこと

- README.md等の補助ドキュメントを作成しない（§3.1）
- descriptionでMarkdown記法を使用しない（§3.2.3）
- agents/に知識本文をベタ書きしない（§3.3.1）
- 絶対パスや../を含む相対パスを使用しない（§10.2）
- 目的に無関係なagents/scriptsをテンプレ的に作成する
- 空のagents/scripts/references/assetsディレクトリを作成する
- 目的に対する検証や実行を「手順説明のみ」で済ませる
- analyze/design/validate の固定セットを流用してタスク設計を済ませる
- 複数責務を1つのagents/scripts/references/assetsに詰め込む

**詳細**: See [references/quality-standards.md](references/quality-standards.md)

## リソース参照

### references/（詳細知識）

**注記**: references/ は責務/ドメイン単位で分割し、1ファイル=1責務を基本とする。

| リソース         | パス                                                                     | 対応仕様 |
| ---------------- | ------------------------------------------------------------------------ | -------- |
| Skill概要        | See [references/overview.md](references/overview.md)                     | §1       |
| コア原則         | See [references/core-principles.md](references/core-principles.md)       | §2       |
| 構造仕様         | See [references/skill-structure.md](references/skill-structure.md)       | §3       |
| ワークフロー     | See [references/workflow-patterns.md](references/workflow-patterns.md)   | §4       |
| 出力パターン     | See [references/output-patterns.md](references/output-patterns.md)       | §5       |
| 新規作成プロセス | See [references/creation-process.md](references/creation-process.md)     | §6.1-6.7 |
| 更新プロセス     | See [references/update-process.md](references/update-process.md)         | §6.8     |
| フィードバック   | See [references/feedback-loop.md](references/feedback-loop.md)           | §7       |
| 品質基準         | See [references/quality-standards.md](references/quality-standards.md)   | §8       |
| 命名規則         | See [references/naming-conventions.md](references/naming-conventions.md) | §9-10    |

### scripts/（決定論的処理）

**注記**: 以下は本スキル（skill-creator）の内部スクリプト一覧。新規スキルには目的に必要なもを作成する。下記のものはデフォルトとして、目的に合わせて追加すること。
**注記**: scripts/ は責務単位で分割し、1スクリプト=1責務（処理/検証）を基本とする。

| スクリプト            | 用途                     | 使用例                                                                                         |
| --------------------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| `init_skill.mjs`      | スキルディレクトリ初期化 | `node scripts/init_skill.mjs <skill-name> --path .claude/skills --resources agents,references` |
| `quick_validate.mjs`  | 構造検証                 | `node scripts/quick_validate.mjs .claude/skills/<skill-name>`                                  |
| `log_usage.mjs`       | フィードバック記録       | `node scripts/log_usage.mjs --result success --phase "Phase 4"`                                |
| `{{script-name}}.mjs` | {{用途}}                 | `node scripts/{{script-name}}.mjs --{{}}`                                                      |

### assets/（テンプレート）

**注記**: assets/ は用途/責務単位で分離し、1アセット=1用途を基本とする。

| テンプレート                    | 用途                      |
| ------------------------------- | ------------------------- |
| `skill-template.md`             | SKILL.md テンプレート     |
| `agent-task-template.md`        | agents/\*.md テンプレート |
| `script-task-template.mjs`      | タスク実行スクリプト雛形  |
| `script-validator-template.mjs` | 制約検証スクリプト雛形    |
| `{{asset-name}}`                | {{asset用途}}             |

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 1.3.0   | 2026-01-02 | agents/を責務ベースに再構成・references/を責務分離 |
| 1.2.0   | 2026-01-02 | 不要なreferences削除・品質基準整理・日本語統一     |
| 1.1.0   | 2025-12-31 | 構造改善・参照テーブル形式化・アンカー追加         |
| 1.0.0   | 2025-12-31 | 18-skills.md完全準拠版として新規作成               |
