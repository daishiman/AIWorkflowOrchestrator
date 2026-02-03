# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

SKILL.md ファイルの構造設計と、各セクションの詳細設計を行う。

## 実行タスク

### Task 1: SKILL.md 構造設計

**YAML Frontmatter 設計**:

```yaml
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
  • Domain-Driven Design (Eric Evans) / 適用: 戦略的設計・ユビキタス言語・Bounded Context / 目的: ドメイン構造の明確化
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係ルール・層分離設計 / 目的: 変更に強い高精度スキル
  • Design Thinking (IDEO) / 適用: ユーザー中心設計 / 目的: 共感と共創

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt,
  Codexに任せて, assign codex, Codexで実行, GPTに依頼, 実行モード選択, どのAIを使う

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
```

**Markdown Body 構造**:

| セクション            | 内容                      |
| --------------------- | ------------------------- |
| # skill-creator       | タイトルと概要            |
| ## 機能               | 12の機能詳細              |
| ## サブエージェント   | agents/ への参照          |
| ## 参照資料           | references/ への参照      |
| ## ベストプラクティス | すべきこと/避けるべきこと |

### Task 2: 12機能の詳細設計

| 機能番号 | コマンド                  | 説明                     |
| -------- | ------------------------- | ------------------------ |
| 1        | `/skill-creator` (chat)   | 対話的スキル作成         |
| 2        | `/skill-creator api`      | 外部API連携スキル生成    |
| 3        | `/skill-creator improve`  | 既存スキル改善           |
| 4        | `/skill-creator execute`  | タスク仕様書実行         |
| 5        | `/skill-creator use`      | 即時使用（セッション内） |
| 6        | `/skill-creator chain`    | スキルチェーン作成       |
| 7        | `/skill-creator fork`     | スキルフォーク           |
| 8        | `/skill-creator share`    | スキル共有               |
| 9        | `/skill-creator schedule` | スケジュール設定         |
| 10       | `/skill-creator debug`    | デバッグ実行             |
| 11       | `/skill-creator docs`     | ドキュメント生成         |
| 12       | `/skill-creator stats`    | 使用統計                 |

### Task 3: サブエージェント参照設計

| エージェント                    | 役割              |
| ------------------------------- | ----------------- |
| `agents/hearing-facilitator.md` | 対話的ヒアリング  |
| `agents/task-generator.md`      | タスク仕様書生成  |
| `agents/code-generator.md`      | コード生成        |
| `agents/api-integrator.md`      | API連携コード生成 |
| `agents/validator.md`           | 検証・テスト      |

### Task 4: 参照資料設計

| 参照資料                        | 内容                     |
| ------------------------------- | ------------------------ |
| `references/task-template.md`   | タスク仕様書テンプレート |
| `references/skill-structure.md` | スキル構造ガイド         |
| `references/api-patterns.md`    | API連携パターン集        |
| `references/security-guide.md`  | 認証・機密情報管理       |

## 参照資料

| 資料名            | パス                                                       | 説明                 |
| ----------------- | ---------------------------------------------------------- | -------------------- |
| Phase 1成果物     | `outputs/phase-1/requirements-definition.md`               | 要件定義             |
| スキル構造仕様    | `aiworkflow-requirements: claude-code-skills-structure.md` | SKILL.mdフォーマット |
| 既存skill-creator | `~/.claude/skills/skill-creator/SKILL.md`                  | 参考実装             |

## 統合テスト連携【必須】

| 統合ポイント           | 契約定義                                |
| ---------------------- | --------------------------------------- |
| SKILL.md → Scanner     | YAML Frontmatter + Markdown Body の構造 |
| agents/ → SKILL.md     | 相対パス参照の整合性                    |
| references/ → SKILL.md | 相対パス参照の整合性                    |

## 成果物

| 成果物         | パス                                  | 説明         |
| -------------- | ------------------------------------- | ------------ |
| 構造設計書     | `outputs/phase-2/structure-design.md` | SKILL.md構造 |
| 機能詳細設計書 | `outputs/phase-2/feature-design.md`   | 12機能詳細   |

## 完了条件

- [ ] YAML Frontmatter構造が設計されている
- [ ] Markdown Body構造が設計されている
- [ ] 12機能の詳細が設計されている
- [ ] サブエージェント参照が設計されている
- [ ] 参照資料参照が設計されている
- [ ] 既存skill-creatorとの整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
