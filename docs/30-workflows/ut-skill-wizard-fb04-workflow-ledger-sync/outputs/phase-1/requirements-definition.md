# Phase 1 要件定義書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 作成日     | 2026-04-11                                                  |

---

## タスク分類宣言

- タスク種別: **docs-only**
- コード変更: **なし**
- Phase 11 評価方針: **NON_VISUAL**（スクリーンショット不要）
- Phase 12 Step 1-B: `spec_created` ステータスで記録する

---

## 変更対象ファイルの特定

| 対象ファイル                                                                                | 変更内容                                  | 優先度 |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブルに FB-04 エントリ追加 | 必須   |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリストセクション追加      | 必須   |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Task 12-2 Step 1-A の三者同期手順を明文化 | 必須   |

---

## 問題の背景

`UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` の Phase 12 実行中に、
以下のファイルを同時更新する必要があることが段階的に判明した：

1. `docs/30-workflows/<feature>/task-workflow.md`（backlog ledger）
2. `docs/30-workflows/<feature>/task-workflow-completed.md`（completed ledger）
3. `docs/30-workflows/<feature>/lane/index.md`（lane index）
4. `docs/30-workflows/<feature>/outputs/artifacts.json`（成果物 JSON）
5. `.claude/skills/task-specification-creator/outputs/artifacts.json`（スキル成果物 JSON）

この 4〜5 箇所の同期が明文化されていなかったため、実行者が発見ドリブンで修正を繰り返すこととなった。

---

## スコープ

### 含む

- `task-specification-creator` スキルの Phase 12 テンプレート・ガイドへのチェックリスト追記
- `SKILL.md` の「よくある漏れ」テーブル更新
- `.agents/skills/` mirror との同期確認

### 含まない

- 他スキルへの変更
- 実際のワークフロー実行や既存タスクの close-out
- コードファイルの変更

---

## 既存コードの命名規則分析

| 対象ファイル                                               | 現行の見出し/項目名パターン                    |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `SKILL.md` の「よくある漏れ」テーブル                      | `漏れパターン` / `防止方法` 2列構成            |
| `phase12-task-spec-compliance-template.md`                 | `- [ ] <動詞> + <目的語>` 形式のチェックリスト |
| `phase-12-documentation-guide.md` の Task 5 チェックリスト | `## Task N: <名称>` → `- [ ] ...` 形式         |
| FB エントリの形式                                          | `[FB-04]` 形式（既存パターンに準拠）           |

---

## Phase 1 実行記録

### 実行タスク

- 変更対象ファイルの現状確認: 完了（3ファイル特定済み）
- タスク種別宣言: docs-only / NON_VISUAL / spec_created

### 発見事項

- 良かった点: 対象ファイルが明確で変更範囲が限定的
- 問題点: なし
- 改善提案: なし

### 次Phase への引き継ぎ事項

- 変更対象ファイル3件を Phase 2 の設計対象とする
- AC-1〜AC-6 の検証基準が明確に定義済み
