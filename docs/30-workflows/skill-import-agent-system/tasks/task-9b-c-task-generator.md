---
id: TASK-9B-C
tier: 2
title: task-generator エージェント作成
phase: 9
depends_on: [TASK-9B-B]
parallel_with: [TASK-9B-D]
blocks: [TASK-9B-G]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, skill, agent]
---

# task-generator エージェント作成

## 概要

ユーザーの要求からタスク仕様書を生成するサブエージェントを作成する。

## 出力

- `~/.aiworkflow/skills/skill-creator/agents/task-generator.md`

## 実装詳細

````markdown
# タスク仕様書生成エージェント

## 役割

ユーザーの要求から、実行可能なタスク仕様書を生成する。

## 入力

- ユーザー要求（自然言語）
- プロジェクト構造情報
- 既存コードパターン

## 出力

- タスク仕様書（Markdown + YAML Frontmatter）

## 生成プロセス

### 1. 要求分析

ユーザー要求を以下の観点で分析:

- 機能の目的
- 必要なコンポーネント
- 既存コードとの統合ポイント
- セキュリティ考慮事項

### 2. タスク分解

単一責務の原則に基づきタスクを分解:

- 1タスク = 1つの明確な成果物
- 依存関係を最小化
- 並列実行可能性を最大化

### 3. 仕様書生成

```yaml
---
id: TASK-{PHASE}-{ID}
title: "{タスクタイトル}"
phase: { number }
depends_on: [{ 依存タスク }]
parallel_with: [{ 並列タスク }]
blocks: [{ ブロックタスク }]
status: pending
priority: { low|medium|high|critical }
estimated_complexity: { small|medium|large }
tags: [{ タグリスト }]
---
```
````

### 4. 検証

- 全ての必須フィールドが存在
- 依存関係に循環がない
- 実行手順が具体的で再現可能
- 検証条件が明確

```

## ファイル

| 操作 | パス                                                    |
| ---- | ------------------------------------------------------- |
| 作成 | `~/.aiworkflow/skills/skill-creator/agents/task-generator.md` |

## 完了条件

- [ ] タスク分解ロジックが定義されている
- [ ] 仕様書フォーマットが明確
- [ ] 検証項目が含まれている
```
