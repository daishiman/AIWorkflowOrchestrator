---
name: skill-creator
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  3つのモード（create/update/improve-prompt）を提供し、
  Script Firstで100%再現可能な実行を実現する。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した語彙

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt
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

スキルを作成・更新・プロンプト改善するためのメタスキル。
**Script First**の原則で決定論的処理を自動化し、**Atomic Task**で細粒度のタスク分解を提供する。

## 設計原則

| 原則             | 説明                                            |
| ---------------- | ----------------------------------------------- |
| Script First     | 決定論的処理はすべてスクリプトで実行            |
| LLM for Judgment | LLMは判断・創造が必要な部分のみ担当             |
| Atomic Task      | 1タスク = 1アクション（実行後すぐ次へ移行可能） |
| Schema Driven    | 入出力はJSONスキーマで検証                      |

## モード一覧

| モード         | 用途           | 開始コマンド                                                        |
| -------------- | -------------- | ------------------------------------------------------------------- |
| create         | 新規スキル作成 | `node scripts/detect_mode.mjs --request "新規スキル"`               |
| update         | 既存スキル更新 | `node scripts/detect_mode.mjs --request "更新" --skill-path <path>` |
| improve-prompt | プロンプト改善 | `node scripts/analyze_prompt.mjs --skill-path <path>`               |

## ワークフロー

### Mode: create（新規作成）

```
Phase 1: 分析（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ analyze-request → extract-purpose → define-boundary     │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 2: 設計（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ select-anchors ─┐                                       │
│                 ├→ design-workflow → [validate-workflow]│
│ define-trigger ─┘                                       │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 3: 構造計画（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ plan-structure → [validate-plan]                        │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 4: 生成（Script Task）
┌─────────────────────────────────────────────────────────┐
│ [init-skill] → [generate-skill-md] → [generate-agents]  │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 5: 検証（Script Task）
┌─────────────────────────────────────────────────────────┐
│ [validate-all] → [update-skill-list]                    │
└─────────────────────────────────────────────────────────┘

凡例: [script] = Script Task, 無印 = LLM Task
```

### Mode: update（既存スキル更新）

```
Phase 1: 分析
[detect-mode] → design-update → [validate-schema]
                            ↓
Phase 2: 生成・適用（Script Task）
[apply-updates] → [validate-all] → [update-skill-list] → [log-usage]
```

### Mode: improve-prompt（プロンプト改善）

```
Phase 1: 分析（Script Task）
[analyze-prompt] → 分析結果確認
                            ↓
Phase 2: 改善設計（LLM Task）
improve-prompt → [validate-schema]
                            ↓
Phase 3: 適用（Script Task）
[apply-updates] → [validate-all] → [update-skill-list] → [log-usage]
```

## Task一覧

### LLM Tasks（判断が必要）

| Task            | 責務                 | 入力          | 出力                | 検証スクリプト          |
| --------------- | -------------------- | ------------- | ------------------- | ----------------------- |
| analyze-request | 要求分析・モード判定 | ユーザー要求  | 要求分析書          | -                       |
| extract-purpose | 目的抽出             | 要求分析書    | purpose.json        | `validate_schema.mjs`   |
| define-boundary | 境界定義             | purpose.json  | boundary.json       | `validate_schema.mjs`   |
| select-anchors  | アンカー選定         | purpose.json  | anchors.json        | `validate_schema.mjs`   |
| define-trigger  | Trigger定義          | purpose.json  | trigger.json        | `validate_schema.mjs`   |
| design-workflow | ワークフロー設計     | 全定義JSON    | workflow.json       | `validate_workflow.mjs` |
| plan-structure  | 構造計画             | workflow.json | structure-plan.json | `validate_plan.mjs`     |
| design-update   | 更新設計             | 要求分析書    | update-plan.json    | `validate_schema.mjs`   |
| improve-prompt  | プロンプト改善       | analysis.json | improvement.json    | `validate_schema.mjs`   |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

### Script Tasks（決定論的実行）

| Script                  | 責務               | 入力       | 出力              |
| ----------------------- | ------------------ | ---------- | ----------------- |
| `detect_mode.mjs`       | モード判定         | 要求文     | mode.json         |
| `analyze_prompt.mjs`    | プロンプト分析     | skill-path | analysis.json     |
| `init_skill.mjs`        | ディレクトリ初期化 | skill-name | ディレクトリ      |
| `generate_skill_md.mjs` | SKILL.md生成       | plan.json  | SKILL.md          |
| `generate_agent.mjs`    | agents/\*.md生成   | task.json  | agents/\*.md      |
| `generate_script.mjs`   | scripts/\*.mjs生成 | def.json   | scripts/\*.mjs    |
| `apply_updates.mjs`     | 更新適用           | plan.json  | 更新結果          |
| `validate_all.mjs`      | 全体検証           | skill-path | 検証結果          |
| `validate_schema.mjs`   | スキーマ検証       | JSON       | 検証結果          |
| `log_usage.mjs`         | 使用記録           | result     | LOGS.md           |
| `update_skill_list.mjs` | スキルリスト更新   | skill-path | skill_list.md更新 |

**詳細仕様**: 各スクリプトは `scripts/` ディレクトリを参照

## 実行例

### create モード

```bash
# Phase 1-3: LLMがagents/を参照して実行
# 各TaskでJSONを生成し、スクリプトで検証

# Phase 4: スクリプトで生成
node scripts/init_skill.mjs my-skill --path .claude/skills
node scripts/generate_skill_md.mjs --plan .tmp/structure-plan.json

# Phase 5: スクリプトで検証・スキルリスト更新
node scripts/validate_all.mjs .claude/skills/my-skill
node scripts/update_skill_list.mjs --skill-path .claude/skills/my-skill
```

### update モード

```bash
# モード判定
node scripts/detect_mode.mjs --request "スキルを更新" --skill-path .claude/skills/my-skill

# LLMがdesign-update.mdを参照して更新計画を生成

# 更新適用（dry-run）
node scripts/apply_updates.mjs --plan .tmp/update-plan.json --dry-run

# 更新適用（実行）
node scripts/apply_updates.mjs --plan .tmp/update-plan.json --backup

# 検証・スキルリスト更新
node scripts/validate_all.mjs .claude/skills/my-skill
node scripts/update_skill_list.mjs --skill-path .claude/skills/my-skill
```

### improve-prompt モード

```bash
# プロンプト分析
node scripts/analyze_prompt.mjs --skill-path .claude/skills/my-skill --verbose

# LLMがimprove-prompt.mdを参照して改善計画を生成

# 更新適用
node scripts/apply_updates.mjs --plan .tmp/update-plan.json --backup

# 検証・スキルリスト更新
node scripts/validate_all.mjs .claude/skills/my-skill
node scripts/update_skill_list.mjs --skill-path .claude/skills/my-skill
```

## ベストプラクティス

### すべきこと

| 推奨事項                     | 理由                     |
| ---------------------------- | ------------------------ |
| LLM出力は必ずスキーマ検証    | 曖昧さを排除し再現性確保 |
| Script TaskはLLMに依存しない | 100%決定論的実行を保証   |
| 中間出力は.tmp/に保存        | デバッグ・再実行を容易に |
| 各Taskは独立して実行可能に   | 部分的な再実行を可能に   |
| --dry-runで事前確認          | 意図しない変更を防止     |
| --backupで安全性確保         | ロールバックを可能に     |

### 避けるべきこと

| 禁止事項                    | 問題点                   |
| --------------------------- | ------------------------ |
| LLM出力を検証せず次へ進む   | エラーの連鎖を招く       |
| Script TaskでLLM判断を要求  | 決定論性が失われる       |
| 複数責務を1タスクに詰め込む | 再実行・デバッグが困難に |
| 中間ファイルを省略          | 検証・再実行が不可能に   |

## リソース参照

### scripts/（決定論的処理）

| スクリプト               | 機能                                       |
| ------------------------ | ------------------------------------------ |
| `detect_mode.mjs`        | モード判定（create/update/improve-prompt） |
| `analyze_prompt.mjs`     | プロンプト分析・改善点特定                 |
| `init_skill.mjs`         | スキルディレクトリ初期化                   |
| `generate_skill_md.mjs`  | SKILL.md生成                               |
| `generate_agent.mjs`     | agents/\*.md生成                           |
| `generate_script.mjs`    | scripts/\*.mjs生成                         |
| `apply_updates.mjs`      | 更新計画の適用                             |
| `validate_all.mjs`       | 全体構造検証                               |
| `validate_schema.mjs`    | JSONスキーマ検証                           |
| `validate_workflow.mjs`  | ワークフロー検証                           |
| `validate_plan.mjs`      | 構造計画検証                               |
| `validate_structure.mjs` | 構造検証                                   |
| `validate_links.mjs`     | リンク検証                                 |
| `log_usage.mjs`          | 使用記録                                   |
| `update_skill_list.mjs`  | skill_list.mdへのスキル追記・更新          |

### agents/（LLM Task仕様）

| Task             | パス                                                   | 責務                   |
| ---------------- | ------------------------------------------------------ | ---------------------- |
| 要求分析         | [agents/analyze-request.md](agents/analyze-request.md) | 要求構造化・モード判定 |
| 目的抽出         | [agents/extract-purpose.md](agents/extract-purpose.md) | スキル目的の定義       |
| 境界定義         | [agents/define-boundary.md](agents/define-boundary.md) | 機能境界の明確化       |
| アンカー選定     | [agents/select-anchors.md](agents/select-anchors.md)   | 知識圧縮アンカーの選定 |
| Trigger定義      | [agents/define-trigger.md](agents/define-trigger.md)   | 発動条件の定義         |
| ワークフロー設計 | [agents/design-workflow.md](agents/design-workflow.md) | 実行フローの設計       |
| 構造計画         | [agents/plan-structure.md](agents/plan-structure.md)   | ファイル構造の計画     |
| 更新設計         | [agents/design-update.md](agents/design-update.md)     | 更新計画の設計         |
| プロンプト改善   | [agents/improve-prompt.md](agents/improve-prompt.md)   | プロンプト最適化       |

### schemas/（入出力スキーマ）

| スキーマ                  | 用途               |
| ------------------------- | ------------------ |
| `mode.json`               | モード判定結果     |
| `purpose.json`            | 目的定義           |
| `boundary.json`           | 境界定義           |
| `anchors.json`            | アンカー定義       |
| `trigger.json`            | Trigger定義        |
| `workflow.json`           | ワークフロー設計   |
| `structure-plan.json`     | 構造計画           |
| `update-plan.json`        | 更新計画           |
| `prompt-analysis.json`    | プロンプト分析結果 |
| `prompt-improvement.json` | プロンプト改善計画 |

### references/（詳細知識）

| リソース     | パス                                                               | 読込条件           |
| ------------ | ------------------------------------------------------------------ | ------------------ |
| 概要         | [references/overview.md](references/overview.md)                   | 初回のみ           |
| コア原則     | [references/core-principles.md](references/core-principles.md)     | 設計時             |
| 構造仕様     | [references/skill-structure.md](references/skill-structure.md)     | 構造計画時         |
| ワークフロー | [references/workflow-patterns.md](references/workflow-patterns.md) | ワークフロー設計時 |
| 更新プロセス | [references/update-process.md](references/update-process.md)       | update/improve時   |
| 品質基準     | [references/quality-standards.md](references/quality-standards.md) | 検証時             |

### assets/（テンプレート）

| テンプレート                    | 用途                   |
| ------------------------------- | ---------------------- |
| `skill-template.md`             | SKILL.md生成用         |
| `agent-task-template.md`        | agents/\*.md生成用     |
| `script-task-template.mjs`      | タスク実行スクリプト用 |
| `script-validator-template.mjs` | 検証スクリプト用       |
| `script-generator-template.mjs` | 生成スクリプト用       |

## 変更履歴

| Version | Date       | Changes                                                         |
| ------- | ---------- | --------------------------------------------------------------- |
| 3.0.0   | 2026-01-06 | 3モード対応（create/update/improve-prompt）、新規スクリプト追加 |
| 2.0.0   | 2026-01-06 | Script/LLM Task分離、スキーマ検証導入、細粒度タスク分解         |
| 1.3.0   | 2026-01-02 | agents/を責務ベースに再構成・references/を責務分離              |
| 1.0.0   | 2025-12-31 | 18-skills.md完全準拠版として新規作成                            |
