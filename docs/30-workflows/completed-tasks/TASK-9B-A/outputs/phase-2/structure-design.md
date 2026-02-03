# TASK-9B-A 構造設計書

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-A                   |
| Phase    | 2                           |
| 作成日   | 2026-02-03                  |
| タイトル | skill-creator SKILL.md 作成 |

## SKILL.md ファイル構造

### 全体構成

```
~/.aiworkflow/skills/skill-creator/SKILL.md
├── YAML Frontmatter (---...---)
│   ├── name: skill-creator
│   ├── description: |
│   │   ├── 概要説明
│   │   ├── Anchors: セクション
│   │   └── Trigger: セクション
│   └── allowed-tools: [9ツール]
└── Markdown Body
    ├── # skill-creator (タイトル)
    ├── ## 機能 (12機能)
    ├── ## サブエージェント (5参照)
    ├── ## 参照資料 (4参照)
    └── ## ベストプラクティス
```

## YAML Frontmatter 設計

### name フィールド

```yaml
name: skill-creator
```

- 形式: ハイフンケース（kebab-case）
- 制約: 英小文字・数字・ハイフンのみ

### description フィールド

```yaml
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  **collaborative**モードでユーザーと対話しながら共創し、
  抽象的なアイデアから具体的な実装まで柔軟に対応する。
  **orchestrate**モードでタスクの実行エンジン（Claude Code / Codex / 連携）を選択。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: 戦略的設計・ユビキタス言語・Bounded Context / 目的: ドメイン構造の明確化
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルール・層分離設計 / 目的: 変更に強い高精度スキル
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt,
  Codexに任せて, assign codex, Codexで実行, GPTに依頼, 実行モード選択, どのAIを使う
```

- 形式: `|` による複数行リテラル
- 必須セクション: `Anchors:`, `Trigger:`

### allowed-tools フィールド

```yaml
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
```

- 形式: YAML配列
- 要素数: 9（既存8 + WebFetch）

## Markdown Body 設計

### セクション構成

| セクション         | 見出しレベル | 必須 | 内容                    |
| ------------------ | ------------ | ---- | ----------------------- |
| タイトル           | H1           | ✓    | `# skill-creator`       |
| 機能               | H2           | ✓    | 12機能の詳細            |
| サブエージェント   | H2           | ✓    | agents/ への参照5つ     |
| 参照資料           | H2           | ✓    | references/ への参照4つ |
| ベストプラクティス | H2           | -    | Do/Don't ガイド         |

### 機能セクション内部構造

```markdown
## 機能

### 1. 対話的スキル作成 (`/skill-creator` または `/skill-creator chat`)

会話形式でスキルを作成します。

### 2. 外部API連携スキル (`/skill-creator api`)

REST API/Webhook連携スキルを生成します。

... (12機能分)
```

## 既存skill-creatorとの整合性

| 項目            | 既存                              | 新規                                  |
| --------------- | --------------------------------- | ------------------------------------- | ----------------- | --- |
| 配置先          | `~/.claude/skills/skill-creator/` | `~/.aiworkflow/skills/skill-creator/` |
| allowed-tools   | 8ツール                           | 9ツール（+WebFetch）                  |
| 機能数          | Phase/モードベース                | 12コマンドベース                      |
| Anchors数       | 5                                 | 5（同一）                             |
| description形式 | 複数行リテラル（`                 | `）                                   | 複数行リテラル（` | `） |

## 推定行数

| セクション         | 推定行数 |
| ------------------ | -------- |
| YAML Frontmatter   | 25-30    |
| タイトル・概要     | 5-10     |
| 機能セクション     | 60-80    |
| サブエージェント   | 10-15    |
| 参照資料           | 10-15    |
| ベストプラクティス | 10-15    |
| **合計**           | **~130** |

→ NFR-001（500行以内）を余裕で達成

## 作成日時

2026-02-03
