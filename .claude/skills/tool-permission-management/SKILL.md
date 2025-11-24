---
name: tool-permission-management
description: |
  ツール権限管理とセキュリティ制御を専門とするスキル。
  最小権限の原則に基づき、適切なツール選択、パス制限、
  承認要求設定により、安全なエージェント設計を実現します。

  専門分野:
  - ツール選択: 役割に応じた必要最小限のツール選定
  - パス制限: write_allowed_paths, write_forbidden_pathsの設定
  - 承認要求: 危険な操作の承認ゲート設計
  - セキュリティ: センシティブファイル保護、Bash制限

  使用タイミング:
  - エージェントのツール権限を設計する時
  - パス制限を設定する時
  - セキュリティリスクを評価する時

  Use proactively when designing tool permissions or security constraints.
version: 1.0.0
---

# Tool Permission Management

## 概要

ツール権限管理は、最小権限の原則に基づき、エージェントに必要最小限の
ツール権限のみを付与するセキュリティ設計手法です。

**主要な価値**:
- 最小権限によりセキュリティリスクを最小化
- パス制限により誤操作を防止
- 承認要求により危険な操作を制御

## ワークフロー

### Phase 1: ツール選択

**ツール選択の判断フロー**:
```
エージェントの役割は？
├─ 分析・レビュー → [Read, Grep, Glob]
├─ 実装・生成 → [Read, Write, Edit, Grep]
├─ 委譲・調整 → [Task, Read]
└─ デプロイ・管理 → [Bash, Read, Write, Edit, Task]
```

**ツールカテゴリ**:

#### 読み取り専用 `[Read, Grep, Glob]`
- 用途: 分析、レビュー、監査
- リスク: 低
- パス制限: 不要（読み取り のみ）

#### 読み書き `[Read, Write, Edit, Grep]`
- 用途: 実装、生成、変換
- リスク: 中
- パス制限: **必須**

#### オーケストレーター `[Task, Read]`
- 用途: マルチエージェント調整
- リスク: 中
- パス制限: 不要

#### フル権限 `[Bash, Read, Write, Edit, Task]`
- 用途: デプロイ、インフラ管理
- リスク: 高
- パス制限: **必須**
- 承認要求: **推奨**

### Phase 2: パス制限の設定

**write_allowed_paths**:
```yaml
write_allowed_paths:
  - ".claude/agents/**/*.md"
  - "src/features/**/*.ts"
  - "docs/**/*.md"
```

**write_forbidden_paths**:
```yaml
write_forbidden_paths:
  - ".env"
  - "**/*.key"
  - "**/*.pem"
  - ".git/**"
  - "node_modules/**"
```

### Phase 3: 承認要求の設定

**approval_required**:
```yaml
approval_required: true
```

**approval_required_for**:
```yaml
approval_required_for:
  - "rm *"
  - "git push"
  - "npm publish"
```

### Phase 4: Bash制限

**許可されるコマンド**:
```yaml
approved_commands:
  - "ls"
  - "find"
  - "grep"
  - "git status"
```

**禁止されるコマンド**:
- `rm -rf`
- `sudo`
- `curl | sh`
- `wget | sh`

## ベストプラクティス

✅ **すべきこと**:
- 必要最小限のツールのみ選択
- パス制限を必ず設定（Write/Edit使用時）
- 危険な操作に承認要求

❌ **避けるべきこと**:
- 不要なツール権限の付与
- パス制限の省略
- 承認なしの危険操作

## 関連スキル

- **agent-structure-design** (`.claude/skills/agent-structure-design/SKILL.md`)
- **agent-quality-standards** (`.claude/skills/agent-quality-standards/SKILL.md`)

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- ツール選択マトリックス (`resources/tool-selection-matrix.md`)

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 |
