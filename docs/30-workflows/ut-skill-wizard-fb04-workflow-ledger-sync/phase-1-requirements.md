# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 1                                                           |
| Phase名    | 要件定義                                                    |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | **docs-only**（コード変更なし・スキルテンプレート更新のみ） |
| 前提Phase  | -                                                           |
| 後続Phase  | Phase 2                                                     |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 12 close-out において更新が必要な ledger / lane index / artifacts の同期対象ファイルを確定し、
テンプレートへ追加すべきチェックリスト項目の受け入れ基準（AC）を固定する。

## 背景

`UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` の Phase 12 実行中に、
以下のファイルを同時更新する必要があることが段階的に判明した：

1. `docs/30-workflows/<feature>/task-workflow.md`（backlog ledger）
2. `docs/30-workflows/<feature>/task-workflow-completed.md`（completed ledger）
3. `docs/30-workflows/<feature>/lane/index.md`（lane index）
4. `docs/30-workflows/<feature>/outputs/artifacts.json`（成果物 JSON）
5. `.claude/skills/task-specification-creator/outputs/artifacts.json`（スキル成果物 JSON）

この 4〜5 箇所の同期が明文化されていなかったため、
実行者が発見ドリブンで修正を繰り返すこととなった。
本タスクはこの経験を Phase 12 テンプレートへ標準化する docs-only 改善タスクである。

---

## タスク分類宣言

> **[Phase 1 宣言]**
>
> - タスク種別: **docs-only**
> - コード変更: **なし**
> - Phase 11 評価方針: **NON_VISUAL**（スクリーンショット不要・自動テスト結果が primary evidence）
> - Phase 12 Step 1-B: `spec_created` ステータスで記録する

---

## 既存コードの命名規則分析

> **[FB-SDK-07-4 対策]** Phase 1 で既存テンプレートの命名パターンを確認する。

| 対象ファイル                                               | 現行の見出し/項目名パターン                    |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `SKILL.md` の「よくある漏れ」テーブル                      | `漏れパターン` / `防止方法` 2列構成            |
| `phase12-task-spec-compliance-template.md`                 | `- [ ] <動詞> + <目的語>` 形式のチェックリスト |
| `phase-12-documentation-guide.md` の Task 5 チェックリスト | `## Task N: <名称>` → `- [ ] ...` 形式         |

---

## 変更対象ファイルの特定

| 対象ファイル                                                                                | 変更内容                                  | 優先度 |
| ------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブルに FB-04 エントリ追加 | 必須   |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリストセクション追加      | 必須   |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Task 12-2 Step 1-A の三者同期手順を明文化 | 必須   |

---

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                             | 検証方法         |
| ---- | ---------------------------------------------------------------------------------------- | ---------------- |
| AC-1 | `SKILL.md` の「よくある漏れ」テーブルに `[FB-04]` エントリが追加されていること           | ファイル内容確認 |
| AC-2 | `phase12-task-spec-compliance-template.md` に三者同期チェックリストが追加されていること  | ファイル内容確認 |
| AC-3 | 同期対象ファイル（backlog/completed/lane-index/artifacts × 2）が全件明示されていること   | ファイル内容確認 |
| AC-4 | チェックリストが Phase 12 の必須完了条件として組み込まれていること                       | 構造確認         |
| AC-5 | `phase-12-documentation-guide.md` の Step 1-A 手順に三者同期ステップが追記されていること | ファイル内容確認 |
| AC-6 | `.agents/skills/` mirror が `.claude/skills/` と同期されていること                       | diff確認         |

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

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-1/` へ記録する。

### タスク1: 変更対象ファイルの現状確認

**目的**: 変更前の現行状態を記録し、変更箇所を特定する

**実行手順**:

1. `SKILL.md` の「よくある漏れ」テーブルの現行末尾エントリを確認する
2. `phase12-task-spec-compliance-template.md` の現行構造を確認する
3. `phase-12-documentation-guide.md` の Step 1-A 現行記述を確認する
4. 変更差分の before/after を `outputs/phase-1/current-state.md` に記録する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/current-state.md`

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                       |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| SKILL.md                  | `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブル確認   |
| Phase 12 準拠テンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | チェックリスト現行構造確認 |
| Phase 12 ガイド           | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A 現行記述確認      |
| spec-update-workflow      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12 同期ルール確認    |
| 元 unassigned task        | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001.md`       | 苦戦箇所・完了条件の参照元 |

---

## 成果物

| 成果物       | パス                                         | 内容                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | AC一覧・スコープ・変更対象   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-6 一覧   |
| 現状確認記録 | `outputs/phase-1/current-state.md`           | 変更前後の before/after 記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 接続要件: なし（docs-only タスク）
- 確認事項: テンプレートが他のワークフローで参照されているか確認する

---

## 完了条件

- [ ] 変更対象ファイル 3 件が特定されていること
- [ ] AC-1〜AC-6 が全て検証可能な形で定義されていること
- [ ] タスク種別が docs-only と宣言されていること
- [ ] Phase 11 が NON_VISUAL と宣言されていること
- [ ] 成果物 3 件（requirements-definition.md / acceptance-criteria.md / current-state.md）が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- 変更対象ファイルの現状確認: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-2-design.md`
