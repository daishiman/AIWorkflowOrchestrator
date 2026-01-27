---
name: skill-creator
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  **collaborative**モードでユーザーと対話しながら共創し、
  抽象的なアイデアから具体的な実装まで柔軟に対応する。
  **orchestrate**モードでタスクの実行エンジン（Claude Code / Codex / 連携）を選択。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した語彙
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創
  • Microservices Patterns (Richardson) / 適用: サービス委譲 / 目的: 疎結合な連携

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt,
  Codexに任せて, assign codex, Codexで実行, GPTに依頼, 実行モード選択, どのAIを使う
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

# Skill Creator

スキルを作成・更新・プロンプト改善するためのメタスキル。

## 設計原則

| 原則                    | 説明                                       |
| ----------------------- | ------------------------------------------ |
| **Collaborative First** | ユーザーとの対話を通じて要件を明確化       |
| Script First            | 決定論的処理はスクリプトで実行（100%精度） |
| Progressive Disclosure  | 必要な時に必要なリソースのみ読み込み       |

## クイックスタート

| モード            | 用途                             | 開始方法                                        |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| **collaborative** | ユーザー対話型スキル共創（推奨） | AskUserQuestionでインタビュー開始               |
| **orchestrate**   | 実行エンジン選択                 | AskUserQuestionでヒアリング開始                 |
| create            | 要件が明確な場合の新規作成       | `scripts/detect_mode.js --request "..."`        |
| update            | 既存スキル更新                   | `scripts/detect_mode.js --skill-path <path>`    |
| improve-prompt    | プロンプト改善                   | `scripts/analyze_prompt.js --skill-path <path>` |

---

## ワークフロー概要

### Collaborative モード（推奨）

```
Phase 0-1〜0-8: インタビュー → interview-result.json
      ↓
リソース選択: select-resources.md → resource-selection.json（最適リソース選定）
      ↓
Phase 1〜6: 分析 → 設計 → 構造計画 → 生成 → 検証
```

📖 [agents/interview-user.md](.claude/skills/skill-creator/agents/interview-user.md)
📖 [agents/select-resources.md](.claude/skills/skill-creator/agents/select-resources.md)

### Orchestrate モード

実行エンジン選択: `claude` | `codex` | `claude-to-codex`

📖 [references/execution-mode-guide.md](.claude/skills/skill-creator/references/execution-mode-guide.md)

---

## リソース一覧

| カテゴリ    | 詳細参照                     |
| ----------- | ---------------------------- |
| agents/     | [resource-map.md#agents]     |
| references/ | [resource-map.md#references] |
| scripts/    | [resource-map.md#scripts]    |
| assets/     | [resource-map.md#assets]     |
| schemas/    | [resource-map.md#schemas]    |

📖 [references/resource-map.md](.claude/skills/skill-creator/references/resource-map.md)

---

## 主要エントリポイント

| 用途                 | リソース                       |
| -------------------- | ------------------------------ |
| インタビュー         | agents/interview-user.md       |
| リソース選択         | agents/select-resources.md     |
| 要求分析             | agents/analyze-request.md      |
| スクリプト生成       | agents/design-script.md        |
| オーケストレーション | agents/design-orchestration.md |
| フィードバック記録   | scripts/log_usage.js           |

---

## 機能別ガイド

| 機能                 | 参照先                               |
| -------------------- | ------------------------------------ |
| スクリプト生成       | references/script-types-catalog.md   |
| ワークフローパターン | references/workflow-patterns.md      |
| オーケストレーション | references/orchestration-guide.md    |
| ドキュメント生成     | references/api-docs-standards.md     |
| 自己改善サイクル     | references/self-improvement-cycle.md |
| ライブラリ管理       | references/library-management.md     |

---

## フィードバック（必須）

実行後は必ず記録：

```bash
node scripts/log_usage.js --result success --phase "Phase 4"
node scripts/log_usage.js --result failure --phase "Phase 3" --error "ValidationError"
```

---

## ベストプラクティス

| すべきこと                 | 避けるべきこと                |
| -------------------------- | ----------------------------- |
| Script優先（決定論的処理） | 全リソースを一度に読み込む    |
| LLMは判断・創造のみ        | Script可能な処理をLLMに任せる |
| Progressive Disclosure     | 具体例をテンプレートに書く    |

---

## 変更履歴

| Version   | Date           | Changes                                                                               |
| --------- | -------------- | ------------------------------------------------------------------------------------- |
| **7.0.1** | **2026-01-24** | **整合性修正: custom-script-design.json追加、壊れた参照5件修正、リソース数166に更新** |
| 7.0.0     | 2026-01-24     | リファクタリング: SKILL.md 481→130行（73%削減）、詳細をreferencesに委譲               |
| 6.2.0     | 2026-01-24     | API推薦機能追加: recommend-integrations.md, goal-to-api-mapping.md                    |
| 6.1.0     | 2026-01-24     | 自動リソース選択機能追加: select-resources.md                                         |
| 6.0.0     | 2026-01-24     | オーケストレーション・ドキュメント生成機能追加                                        |
| 5.7.0     | 2026-01-21     | Part 5をresource-map.mdに分離                                                         |
| 5.6.0     | 2026-01-21     | Self-Contained Skills: PNPM依存関係管理                                               |
| 5.0.0     | 2026-01-15     | Collaborative First追加、抽象度レベル対応                                             |
