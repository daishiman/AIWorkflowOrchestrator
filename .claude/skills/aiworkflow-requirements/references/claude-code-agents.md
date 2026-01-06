# Claude Code Agent 層仕様書

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本仕様書は、Claude Code の Agent 層（Application 層）の設計仕様を定義する。

---

## ドキュメント構成

| ドキュメント | ファイル | 説明 |
|-------------|----------|------|
| Agent仕様詳細 | [claude-code-agents-spec.md](./claude-code-agents-spec.md) | YAML Frontmatter、description規則、本文構造、命名規則 |
| ワークフロー・協調 | [claude-code-agents-workflow.md](./claude-code-agents-workflow.md) | Phaseテンプレート、ツール権限、エージェント間協調、状態管理 |

---

## Agent 層の役割

| 役割                 | 説明                                 |
| -------------------- | ------------------------------------ |
| ワークフロー制御     | Phase別の処理フローを制御            |
| スキル参照と知識取得 | Skill 層から専門知識と実行手順を取得 |
| 判断と意思決定       | タスクの状況に応じて適切な判断を行う |
| エラーハンドリング   | 失敗時の対応とリカバリー             |

---

## 責務境界

| 行うこと                     | 行わないこと             |
| ---------------------------- | ------------------------ |
| ワークフロー（Phase）の制御  | 詳細なドメイン知識の保持 |
| スキルの参照と知識の取得     | 知識の永続的な保存       |
| スクリプトの実行指示         | ユーザー入力の直接受付   |
| 判断と意思決定               |                          |
| エラーハンドリング           |                          |
| 他エージェントへのハンドオフ |                          |

---

## 関連エージェント

| エージェント        | パス                                    | 用途             |
| ------------------- | --------------------------------------- | ---------------- |
| meta-agent-designer | `.claude/agents/meta-agent-designer.md` | エージェント作成 |

---

## 関連スキル

| スキル                   | パス                                               | 用途                 |
| ------------------------ | -------------------------------------------------- | -------------------- |
| agent-structure-design   | `.claude/skills/agent-structure-design/SKILL.md`   | エージェント構造設計 |
| agent-persona-design     | `.claude/skills/agent-persona-design/SKILL.md`     | ペルソナ設計         |
| agent-template-patterns  | `.claude/skills/agent-template-patterns/SKILL.md`  | テンプレートパターン |
| agent-validation-testing | `.claude/skills/agent-validation-testing/SKILL.md` | 構文検証・テスト     |

---

## 関連ドキュメント

- [Skill構造・フォーマット](./claude-code-skills-structure.md)
- [Command層仕様](./claude-code-commands.md)
