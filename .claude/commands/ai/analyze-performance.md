---
description: |
  パフォーマンス分析とボトルネック特定を行うコマンド。

  フロントエンド・バックエンド・データベースのパフォーマンスを分析し、
  ボトルネックを特定して最適化提案を行います。

  🤖 起動エージェント:
  - Phase 2 (frontend): `.claude/agents/router-dev.md` - フロントエンドパフォーマンス分析
  - Phase 3 (backend): `.claude/agents/logic-dev.md` - バックエンドロジック分析
  - Phase 4 (database): `.claude/agents/dba-mgr.md` - クエリパフォーマンス分析

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/web-performance/SKILL.md` - Core Web Vitals、最適化手法
  - `.claude/skills/query-performance-tuning/SKILL.md` - クエリ最適化、インデックス設計
  - `.claude/skills/profiling-techniques/SKILL.md` - プロファイリング、ボトルネック特定

  ⚙️ このコマンドの設定:
  - argument-hint: "[target]"（frontend/backend/database、デフォルト: all）
  - allowed-tools: 分析実行とレポート生成用
    • Task: 3エージェント起動用
    • Read: コード・クエリ確認用
    • Bash: プロファイリングツール実行用
    • Write(docs/**): パフォーマンスレポート保存用
  - model: sonnet（標準的なパフォーマンス分析タスク）

  📋 成果物:
  - パフォーマンス分析レポート（`docs/performance/analysis-report.md`）
  - ボトルネック一覧と最適化提案

  🎯 分析対象:
  - フロントエンド: Core Web Vitals、Bundle Size、レンダリング
  - バックエンド: API Response Time、メモリ使用量
  - データベース: スロークエリ、インデックス効率

  トリガーキーワード: performance, analyze performance, パフォーマンス分析, ボトルネック
argument-hint: "[target]"
allowed-tools:
  - Task
  - Read
  - Bash
  - Write(docs/**)
model: opus
---

# パフォーマンス分析

このコマンドは、パフォーマンス分析とボトルネック特定を行います。

## 📋 実行フロー

### Phase 1: 分析対象の確認

```bash
target="${ARGUMENTS:-all}"

if ! [[ "$target" =~ ^(frontend|backend|database|all)$ ]]; then
  エラー: 無効な分析対象です
  使用可能: frontend, backend, database, all
fi
```

### Phase 2-4: エージェント起動（対象別）

**frontend分析** (router-dev):

- Core Web Vitals測定
- Bundle Size分析
- Next.js最適化チェック

**backend分析** (logic-dev):

- API Response Time測定
- メモリプロファイリング
- 非効率ロジック検出

**database分析** (dba-mgr):

- スロークエリ検出
- インデックス効率評価
- N+1クエリ検出

### Phase 5: 完了報告

```markdown
## パフォーマンス分析完了

### ボトルネック検出

- Critical: ${critical_count}件
- High: ${high_count}件
- Medium: ${medium_count}件

### 最適化提案

[最適化アクション一覧]

レポート: docs/performance/analysis-report.md
```

## 使用例

```bash
/ai:analyze-performance frontend
```

## 参照

- router-dev: `.claude/agents/router-dev.md`
- logic-dev: `.claude/agents/logic-dev.md`
- dba-mgr: `.claude/agents/dba-mgr.md`
- web-performance: `.claude/skills/web-performance/SKILL.md`
