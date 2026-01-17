---
name: session-management
description: |
  Claude Codeセッションの状態管理、コンテキスト保持、会話履歴の効率的な運用を支援するスキル。
  長時間セッションでのコンテキスト消費最適化、セッション再開時の状態復元、
  マルチタスク切り替え時の状態保存・復元を提供する。

  Anchors:
  • The Pragmatic Programmer (Hunt & Thomas) / 適用: 状態管理の原則 / 目的: 効率的なセッション運用
  • Domain-Driven Design (Evans) / 適用: コンテキスト境界 / 目的: 適切な状態分離
  • Clean Architecture (Martin) / 適用: 依存関係管理 / 目的: セッション間の独立性確保

  Trigger:
  Use when managing Claude Code sessions, preserving context across interactions, or optimizing token usage in long conversations.
  session management, context preservation, token optimization, session state, conversation history
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - TodoWrite
---

# Session Management

## 概要

Claude Codeセッションの効率的な状態管理を支援するスキル。
コンテキスト保持、トークン消費最適化、セッション再開・切り替えをスムーズに行う。

---

## ワークフロー

```
analyze-session → plan-context → optimize-tokens → restore-state
                                        ↓
                  summarize-progress ← save-checkpoint
```

### Task 1: セッション分析（analyze-session）

現在のセッション状態とコンテキスト使用状況を分析する。

**Task**: `agents/analyze-session.md` を参照

### Task 2: コンテキスト計画（plan-context）

効率的なコンテキスト配分を計画する。

**Task**: `agents/plan-context.md` を参照

### Task 3: トークン最適化（optimize-tokens）

トークン消費を最適化し、長時間セッションを可能にする。

**Task**: `agents/optimize-tokens.md` を参照

### Task 4: チェックポイント保存（save-checkpoint）

セッション状態をチェックポイントとして保存する。

**Task**: `agents/save-checkpoint.md` を参照

### Task 5: 状態復元（restore-state）

保存されたチェックポイントからセッション状態を復元する。

**Task**: `agents/restore-state.md` を参照

### Task 6: 進捗サマリー（summarize-progress）

セッションの進捗を要約し、次のアクションを明確にする。

**Task**: `agents/summarize-progress.md` を参照

---

## Task仕様（ナビゲーション）

| Task               | 責務                 | 入力                   | 出力                     |
| ------------------ | -------------------- | ---------------------- | ------------------------ |
| analyze-session    | セッション状態分析   | 現在の会話コンテキスト | 状態分析レポート         |
| plan-context       | コンテキスト配分計画 | 状態分析レポート       | コンテキスト計画書       |
| optimize-tokens    | トークン最適化       | コンテキスト計画書     | 最適化済みコンテキスト   |
| save-checkpoint    | チェックポイント保存 | セッション状態         | チェックポイントファイル |
| restore-state      | 状態復元             | チェックポイント       | 復元されたコンテキスト   |
| summarize-progress | 進捗サマリー         | セッション履歴         | 進捗レポート             |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照
**注記**: 1 Task = 1 責務。必要なTaskのみ実行する。

---

## ベストプラクティス

### すべきこと

| 推奨事項                           | 理由                         |
| ---------------------------------- | ---------------------------- |
| 重要な状態は明示的にメモを残す     | セッション再開時の復元が容易 |
| TodoWriteで進捗を追跡する          | 中断時の再開が容易           |
| 不要なコンテキストは早めに削除する | トークン消費を抑制           |
| 定期的にチェックポイントを作成する | 長時間作業での安全性確保     |
| セッション終了時に進捗を要約する   | 次回セッションの効率向上     |

### 避けるべきこと

| 禁止事項                           | 問題点           |
| ---------------------------------- | ---------------- |
| 大量のファイルを一度に読み込む     | コンテキスト枯渇 |
| 進捗メモなしで長時間作業する       | 再開困難         |
| 複数の無関係なタスクを同時進行する | 状態管理の複雑化 |
| チェックポイントなしで複雑な変更   | ロールバック不能 |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト      | 用途               | 使用例                                        |
| --------------- | ------------------ | --------------------------------------------- |
| `log_usage.mjs` | フィードバック記録 | `node scripts/log_usage.mjs --result success` |

### references/（詳細知識）

| リソース             | パス                                                                 | 読込条件                           |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| コンテキスト管理基礎 | [references/context-management.md](references/context-management.md) | コンテキスト管理の詳細が必要時     |
| トークン最適化手法   | [references/token-optimization.md](references/token-optimization.md) | トークン最適化の詳細が必要時       |
| チェックポイント設計 | [references/checkpoint-design.md](references/checkpoint-design.md)   | チェックポイント設計の詳細が必要時 |

---

## 変更履歴

| Version | Date       | Changes                        |
| ------- | ---------- | ------------------------------ |
| 1.0.0   | 2026-01-02 | 18-skills.md仕様準拠で新規作成 |
