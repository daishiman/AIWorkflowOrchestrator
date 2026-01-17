---
name: task-decomposition
description: |
  複雑なタスクを目的・成果・制約から分解し、実行可能な作業単位に落とし込むスキル。
  依存関係、優先順位、検証条件まで整理して、実行計画を一貫した形で提示する。

  Anchors:
  • PMBOK Guide / 適用: WBS作成 / 目的: 分解粒度と成果物の整合
  • User Story Mapping (Jeff Patton) / 適用: 価値分解 / 目的: 価値順序の可視化
  • The Pragmatic Programmer / 適用: 反復計画 / 目的: 実行可能性の担保

  Trigger:
  Use when breaking down complex work, clarifying ambiguous tasks, or planning phased execution.
  task decomposition, work breakdown, WBS, dependency mapping, phased planning
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# task-decomposition

## 概要

複雑な要求を実行可能なタスクへ分解し、依存関係と検証条件を明確化するスキル。

---

## ワークフロー

### Phase 1: 目的と境界の確定

**目的**: 目的、成果、スコープ、前提を確定する。

**アクション**:

1. 目的と成果物を一文で表現する
2. スコープ内外と制約を整理する
3. 成功条件と検証方法を定義する

**Task**: `agents/define-scope.md` を参照

### Phase 2: 分解と構造化

**目的**: 実行可能なタスクへ分解し、依存関係を構造化する。

**アクション**:

1. 成果物ベースでタスクを分解する
2. 依存関係と順序を整理する
3. 見積もりと完了条件を付与する

**Task**: `agents/build-breakdown.md` を参照

### Phase 3: 検証と調整

**目的**: 分解計画の妥当性を検証し、必要な修正を行う。

**アクション**:

1. 目的との整合性と依存の抜け漏れを確認する
2. リスクと検証項目を明文化する
3. 改善点と再分解の判断を行う

**Task**: `agents/validate-plan.md` を参照

---

## Task仕様ナビ

| Task            | 起動タイミング | 入力           | 出力             |
| --------------- | -------------- | -------------- | ---------------- |
| define-scope    | Phase 1開始時  | ユーザー要求   | 目的・境界定義   |
| build-breakdown | Phase 2開始時  | 目的・境界定義 | 分解タスク一覧   |
| validate-plan   | Phase 3開始時  | 分解タスク一覧 | 検証済み分解計画 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                     | 理由                         |
| ---------------------------- | ---------------------------- |
| 目的と成果物を最初に確定する | 分解の軸がぶれない           |
| 依存関係を明示する           | 実行順序の誤りを防ぐ         |
| 完了条件を明文化する         | 検証可能な計画になる         |
| 粒度を揃えて分解する         | 見積もりと進捗が管理しやすい |

### 避けるべきこと

| 禁止事項                 | 問題点                     |
| ------------------------ | -------------------------- |
| 目的が曖昧なまま分解する | 作業が散漫になりやすい     |
| 依存関係を暗黙にする     | 手戻りが増える             |
| 完了条件を曖昧にする     | 受け入れ判断が不明確になる |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト                           | 機能                         |
| ------------------------------------ | ---------------------------- |
| `scripts/validate-decomposition.mjs` | 分解計画の必須項目を検証する |
| `scripts/log_usage.mjs`              | 使用記録をLOGS.mdに記録する  |

### references/（詳細知識）

| リソース     | パス                                                                   | 読込条件     |
| ------------ | ---------------------------------------------------------------------- | ------------ |
| 基礎         | [references/Level1_basics.md](references/Level1_basics.md)             | 初回利用時   |
| 実務パターン | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 分解実行時   |
| 高度手法     | [references/Level3_advanced.md](references/Level3_advanced.md)         | 複雑案件時   |
| エキスパート | [references/Level4_expert.md](references/Level4_expert.md)             | 調整フェーズ |

### assets/（テンプレート）

| アセット                               | 用途                         |
| -------------------------------------- | ---------------------------- |
| `assets/task-breakdown-template.md`    | タスク分解の計画テンプレート |
| `assets/dependency-matrix-template.md` | 依存関係マトリクス雛形       |
