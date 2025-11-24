---
name: multi-agent-systems
description: |
  マルチエージェントシステム設計を専門とするスキル。
  エージェント間協調、ハンドオフプロトコル、情報受け渡しにより、
  効果的な分散システムを構築します。

  専門分野:
  - 協調パターン: 委譲、連鎖、並行、フィードバック
  - ハンドオフプロトコル: 標準化された情報受け渡しフォーマット
  - 依存関係: 前提、後続、並行、サブエージェントの定義
  - メッセージング: JSON形式の標準化

  使用タイミング:
  - 複数エージェントの協調を設計する時
  - ハンドオフプロトコルを定義する時
  - エージェント間の依存関係を設計する時

  Use proactively when designing multi-agent collaboration or handoff protocols.
version: 1.0.0
---

# Multi-Agent Systems

## 概要

マルチエージェントシステム設計は、複数のエージェントが協調して
複雑なタスクを実行するシステムを構築する方法論です。

**主要な価値**:
- 協調パターンにより、タスク分割が明確化
- 標準化されたプロトコルにより、情報受け渡しが容易
- 依存関係の明確化により、システムの健全性が保たれる

## ワークフロー

### Phase 1: 協調パターンの選択

**4つの協調パターン**:

#### 1. 委譲（Delegation）
上位エージェントが下位エージェントにタスクを委譲
```
オーケストレーター → ワーカー1
                  → ワーカー2
```

#### 2. 連鎖（Chaining）
エージェントが順次処理を引き継ぐ
```
エージェント1 → エージェント2 → エージェント3
```

#### 3. 並行（Parallel）
複数エージェントが独立して並行実行
```
エージェント1 ┐
エージェント2 ├→ 統合
エージェント3 ┘
```

#### 4. フィードバック（Feedback）
後続エージェントが前段に結果をフィードバック
```
エージェント1 ⇄ エージェント2
```

### Phase 2: ハンドオフプロトコル設計

**標準フォーマット**:
```json
{
  "from_agent": "agent-name",
  "to_agent": "next-agent",
  "status": "completed|partial|failed",
  "summary": "実施内容サマリー",
  "artifacts": ["file1.md"],
  "context": {
    "key_decisions": [],
    "unresolved_issues": [],
    "next_steps": []
  },
  "metadata": {
    "duration": "5m30s",
    "model_used": "sonnet",
    "token_count": 15420
  }
}
```

**必須情報**:
- from_agent, to_agent
- status
- summary
- artifacts
- context

### Phase 3: 依存関係の定義

**依存関係の種類**:
- **前提エージェント**: このエージェントの前に実行
- **後続エージェント**: このエージェントの後に実行
- **並行エージェント**: 並行実行可能
- **サブエージェント**: 委譲対象

## ベストプラクティス

✅ **すべきこと**:
- 標準化されたハンドオフプロトコル使用
- 依存関係の明確化
- 循環依存の回避

❌ **避けるべきこと**:
- 独自フォーマットの使用
- 曖昧な依存関係
- 循環依存の放置

## 関連スキル

- **agent-architecture-patterns** (`.claude/skills/agent-architecture-patterns/SKILL.md`)
- **agent-dependency-design** (`.claude/skills/agent-dependency-design/SKILL.md`)

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- 協調パターン (`resources/collaboration-patterns.md`)

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 |
