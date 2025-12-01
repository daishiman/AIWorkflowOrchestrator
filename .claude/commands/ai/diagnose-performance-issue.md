---
description: |
  パフォーマンス問題の診断を行うコマンド。

  症状（slow-render/slow-query/memory-leak等）から原因を診断し、
  修正方法を提案します。

  🤖 起動エージェント:
  - Phase 2 (frontend): `.claude/agents/router-dev.md` - レンダリング問題診断
  - Phase 3 (backend): `.claude/agents/repo-dev.md` - クエリパフォーマンス診断
  - Phase 4 (monitoring): `.claude/agents/sre-observer.md` - システム全体診断

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/performance-profiling/SKILL.md` - プロファイリング手法
  - `.claude/skills/query-optimization/SKILL.md` - クエリ最適化
  - `.claude/skills/memory-leak-detection/SKILL.md` - メモリリーク検出

  ⚙️ このコマンドの設定:
  - argument-hint: "[symptom]"（必須: slow-render/slow-query/memory-leak）
  - allowed-tools: 診断実行用
    • Task: router-dev/repo-dev/sre-observerエージェント起動用
    • Read: コード確認用
    • Bash: プロファイリングツール実行用
    • Write(docs/**): 診断レポート保存用
  - model: opus（複雑なパフォーマンス問題診断が必要）

  📋 成果物:
  - 診断レポート（`docs/performance/diagnosis-report.md`）
  - 修正提案

  🎯 対応症状:
  - slow-render: 遅いレンダリング
  - slow-query: スロークエリ
  - memory-leak: メモリリーク

  トリガーキーワード: performance issue, slow, パフォーマンス問題, 遅い
argument-hint: "[symptom]"
allowed-tools:
  - Task
  - Read
  - Bash
  - Write(docs/**)
model: opus
---

# パフォーマンス問題診断

このコマンドは、パフォーマンス問題を診断します。

## 📋 実行フロー

### Phase 1: 症状の確認

```bash
symptom="$ARGUMENTS"

if ! [[ "$symptom" =~ ^(slow-render|slow-query|memory-leak)$ ]]; then
  エラー: 無効な症状です
  使用可能: slow-render, slow-query, memory-leak
fi
```

### Phase 2-4: エージェント起動（症状別）

症状に応じて適切なエージェントを起動

### Phase 5: 完了報告

```markdown
## パフォーマンス問題診断完了

### 診断結果
原因: ${root_cause}

### 修正提案
${fix_proposal}

レポート: docs/performance/diagnosis-report.md
```

## 使用例

```bash
/ai:diagnose-performance-issue slow-render
```

## 参照

- router-dev: `.claude/agents/router-dev.md`
- repo-dev: `.claude/agents/repo-dev.md`
- sre-observer: `.claude/agents/sre-observer.md`
