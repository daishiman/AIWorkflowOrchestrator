---
id: TASK-9B-A
tier: 2
title: skill-creator SKILL.md 作成
phase: 9
depends_on: [TASK-7D]
parallel_with: [TASK-9B-B]
blocks: [TASK-9B-C, TASK-9B-D]
status: pending
priority: critical
estimated_complexity: medium
tags: [backend, skill, meta-skill]
---

# skill-creator SKILL.md 作成

## 概要

skill-creator スキルの SKILL.md を作成する。
このファイルはメタスキルの中核であり、全機能の定義を含む。

## 入力

- TASK-7D: ChatPanel統合済みのUI

## 出力

- `~/.aiworkflow/skills/skill-creator/SKILL.md`

## 実装詳細

```markdown
---
name: skill-creator
description: スキルを対話的に作成・改善・実行するメタスキル
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - WebFetch
  - AskUserQuestion
---

# skill-creator

スキルを対話的に作成・改善・実行するメタスキル。
会話形式でニーズをヒアリングし、API連携やコード実行を含むスキルを生成できる。

## 機能

### 1. 対話的スキル作成 (`/skill-creator` または `/skill-creator chat`)

会話形式でスキルを作成します。

### 2. 外部API連携スキル (`/skill-creator api`)

REST API/Webhook連携スキルを生成します。

### 3. 既存スキル改善 (`/skill-creator improve`)

既存スキルを分析し、改善を提案・実行します。

### 4. タスク実行 (`/skill-creator execute`)

タスク仕様書に従ってタスクを自動実行します。

### 5. 即時使用 (`/skill-creator use`)

作成したスキルを即座に現在のセッションで使用します。

## サブエージェント

- `agents/hearing-facilitator.md` - 対話的ヒアリング
- `agents/task-generator.md` - タスク仕様書生成
- `agents/code-generator.md` - コード生成
- `agents/api-integrator.md` - API連携コード生成
- `agents/validator.md` - 検証・テスト

## 参照資料

- `references/task-template.md` - タスク仕様書テンプレート
- `references/skill-structure.md` - スキル構造ガイド
- `references/api-patterns.md` - API連携パターン集
```

## ファイル

| 操作 | パス                                          |
| ---- | --------------------------------------------- |
| 作成 | `~/.aiworkflow/skills/skill-creator/SKILL.md` |

## 完了条件

- [ ] SKILL.md が作成されている
- [ ] allowed-tools が適切に設定されている
- [ ] 全機能が記述されている
- [ ] サブエージェント・参照資料のパスが正しい
