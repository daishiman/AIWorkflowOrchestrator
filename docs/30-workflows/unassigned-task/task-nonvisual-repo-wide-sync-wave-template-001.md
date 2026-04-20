---
task_id: TASK-NONVISUAL-REPO-WIDE-SYNC-WAVE-TEMPLATE-001
task_name: NON_VISUAL repo-wide sync wave 再利用テンプレート固定
task_type: NON_VISUAL
category: template-definition
status: unassigned
created_date: 2026-04-20
priority: medium
scale: small
parent_task: TASK-SC-CANCEL-LOGS-SYNC-001
implementation_mode: new
issue_number: 2361
---

# TASK-NONVISUAL-REPO-WIDE-SYNC-WAVE-TEMPLATE-001

## ユーザー要求の要約

`TASK-SC-CANCEL-LOGS-SYNC-001` では Lane A/B/C、TC-01〜TC-05、Phase 11 grep スナップショット、
Phase 12 close-out を都度設計した。
同種の **NON_VISUAL repo-wide docs-sync wave** タスクを新規設計せず起票できるよう、
`task-specification-creator` スキルへ再利用可能なテンプレートを追加する。

---

## メタ情報

| 項目                | 内容                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| タスクID            | TASK-NONVISUAL-REPO-WIDE-SYNC-WAVE-TEMPLATE-001                       |
| タスク名            | NON_VISUAL repo-wide sync wave 再利用テンプレート固定                 |
| 分類                | template-definition（テンプレート整備）                               |
| 対象機能            | task-specification-creator スキル（NON_VISUAL wave テンプレート追加） |
| タスク種別          | NON_VISUAL（UI/UX 変更なし。スクリーンショット代替証跡方式）          |
| 優先度              | 中                                                                    |
| 見積もり規模        | 小規模                                                                |
| ステータス          | unassigned（未着手）                                                  |
| 発見元              | TASK-SC-CANCEL-LOGS-SYNC-001 Phase 12 / unassigned-task-detection.md  |
| 親タスク            | TASK-SC-CANCEL-LOGS-SYNC-001                                          |
| implementation_mode | new                                                                   |
| 作成日              | 2026-04-20                                                            |

---

## タスク概要

### 目的（最上位目的）

NON_VISUAL repo-wide docs-sync wave を扱う際に毎回 Phase 11/12 を設計し直す工数を削減し、
同種タスクを **テンプレートから即起票できる** 状態を作る。

### 背景

`TASK-SC-CANCEL-LOGS-SYNC-001` では以下を都度設計した:

- Lane A/B/C（branch 内 / repo-wide / lessons-learned 各レーン）
- TC-01〜TC-05（grep スナップショット検証コマンド）
- Phase 11 grep スナップショット命名規則（`tc-NN-<target>.txt`）
- Phase 12 close-out 要件（LOGS.md×2 / mirror parity / completed ledger）

これらを毎回設計すると、仕様書作成に 2〜3 時間かかるうえ、命名ゆれ・項目漏れが起こりやすい。
本タスクはこの設計負荷を `task-specification-creator` のテンプレートへ吸収し、
**次回から phase spec 生成コスト 0 に近づける**ことを目的とする。

### 最終ゴール（期待される成果）

1. `.claude/skills/task-specification-creator/references/` に
   `phase-template-nonvisual-repo-wide-sync.md` が追加される
2. Phase 11 の grep スナップショット命名規則が固定文書化される
3. Phase 12 の close-out 必須要件（LOGS.md×2 / mirror parity / completed ledger）が定型化される
4. 同種タスク新規起票時に「テンプレートを参照するだけで Phase 1-12 spec が揃う」ことが確認される
5. `references/resource-map.md` に新テンプレートへのリンクが追加される

### 成功基準

| AC   | 受入基準                                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| AC-1 | `phase-template-nonvisual-repo-wide-sync.md` が `references/` に存在し、Phase 11/12 の必須見出しを含む          |
| AC-2 | Phase 11 grep スナップショット命名規則が `tc-NN-<target>.txt` 形式でテンプレートに明記されている                |
| AC-3 | Phase 12 必須成果物（LOGS.md×2 / mirror parity / completed ledger）がチェックリスト形式でテンプレートに含まれる |
| AC-4 | `resource-map.md` に新テンプレートへのリンクエントリが追加されている                                            |
| AC-5 | テンプレートを用いて仮想タスク設計を 30 分以内に完了できることをレビューで確認                                  |

### スコープ境界

| 区分           | 内容                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 含む（scope）  | `phase-template-nonvisual-repo-wide-sync.md` 新規作成 / Phase 11 命名規則ドキュメント / Phase 12 close-out 定型化 / `resource-map.md` エントリ追加      |
| 含まない（外） | VISUAL タスクテンプレート修正 / 既存タスク仕様書の一括更新 / `task-specification-creator` スキルの他テンプレートへの影響 / スクリプト自動生成機能の追加 |

---

## ドメイン定義

### 用語集

| 用語                  | 定義                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| NON_VISUAL            | UI/UX の視覚的変更を伴わないタスク種別。スクリーンショット証跡の代わりに grep スナップショット・テスト結果を主証跡とする                |
| repo-wide sync        | `.claude/skills/` 配下の LOGS.md、canonical spec、lessons-learned、topic-map など、特定ブランチを超えてリポジトリ全体に波及する同期作業 |
| sync wave             | repo-wide sync をまとめて実行する一単位。Phase 11/12 を含む完結した作業ウェーブ                                                         |
| grep スナップショット | Phase 11 の手動テスト代替証跡として取得するテキストファイル。`outputs/phase-11/grep-snapshots/tc-NN-<target>.txt` 形式                  |
| mirror parity         | `.claude/skills/` 正本と `.agents/skills/` ミラーの内容が一致していること                                                               |
| completed ledger      | `task-workflow-completed-*.md` に記録されるタスク完了台帳                                                                               |
| LOGS.md×2             | `task-specification-creator/LOGS.md` と `aiworkflow-requirements/LOGS.md` の両方を同一 wave で更新する原則                              |
| Lane A/B/C            | NON_VISUAL sync wave における作業レーン分割。Lane A = branch 内 docs / Lane B = repo-wide spec / Lane C = lessons-learned               |

### ビジネスルール

| ルール | 説明                                                                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| BIZ-01 | NON_VISUAL docs-sync wave は Phase 11 でスクリーンショットを取得しない。grep スナップショットを代替証跡とする                                   |
| BIZ-02 | Phase 12 close-out では LOGS.md×2 / mirror parity / completed ledger を同一 wave で更新する。別 wave 分割は禁止                                 |
| BIZ-03 | repo-wide sync 対象ファイルは Phase 2 の `target-file-map.md` で事前列挙する。Phase 5 時点で対象ファイルが増えた場合は Phase 2 成果物を更新する |
| BIZ-04 | テンプレートから起票されたタスクでも、Phase 1 の AC（受入基準）は当該タスク固有の内容に更新する                                                 |

---

## Phase 一覧

| Phase | 名称             | 目的                                                                               | ステータス |
| ----- | ---------------- | ---------------------------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | テンプレート追加スコープ・AC・inventory を固定する                                 | pending    |
| 2     | 設計             | テンプレート構造・Lane 分割方針・grep 命名規則・Phase 12 定型要件を設計する        | pending    |
| 3     | 設計レビュー     | 4条件 PASS / 既存テンプレートとの整合 PASS を確認する                              | pending    |
| 4     | テスト作成       | テンプレート検証コマンド・fixture スナップショットを定義する                       | pending    |
| 5     | 実装             | `phase-template-nonvisual-repo-wide-sync.md` を作成し `resource-map.md` を更新する | pending    |
| 6     | テスト拡充       | テンプレートの完全性（必須見出し・命名規則・チェックリスト）を再検証する           | pending    |
| 7     | カバレッジ確認   | AC-1〜AC-5 への対応状況を確認する                                                  | pending    |
| 8     | リファクタリング | テンプレートの冗長表現削減・整合性チェックを行う                                   | pending    |
| 9     | 品質保証         | Markdown lint / mirror parity / `resource-map.md` リンク整合 の最終チェック        | pending    |
| 10    | 最終レビュー     | AC-1〜AC-5 すべての達成状況を確認する                                              | pending    |
| 11    | 手動テスト       | NON_VISUAL 代替証跡として grep スナップショットを記録する                          | pending    |
| 12    | ドキュメント更新 | 本タスク close-out。両 LOGS 追記・mirror parity・completed ledger 更新             | pending    |
| 13    | PR作成           | ユーザー承認後のみ実施（blocked）                                                  | blocked    |

---

## Canonical Artifacts

| Phase | 成果物                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/scope-boundary.md`, `outputs/phase-1/acceptance-criteria.md`                                                                                                                                                                         |
| 2     | `outputs/phase-2/template-design.md`, `outputs/phase-2/target-file-map.md`, `outputs/phase-2/lane-definition.md`                                                                                                                                                                                    |
| 3     | `outputs/phase-3/design-review-result.md`, `outputs/phase-3/format-alignment-check.md`                                                                                                                                                                                                              |
| 4     | `outputs/phase-4/verification-commands.md`, `outputs/phase-4/template-fixture-snapshots.md`                                                                                                                                                                                                         |
| 5     | `outputs/phase-5/template-creation-log.md`                                                                                                                                                                                                                                                          |
| 6     | `outputs/phase-6/completeness-regression-check.md`                                                                                                                                                                                                                                                  |
| 7     | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                |
| 8     | `outputs/phase-8/refactor-decision-log.md`                                                                                                                                                                                                                                                          |
| 9     | `outputs/phase-9/quality-gate-report.md`                                                                                                                                                                                                                                                            |
| 10    | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                           |
| 11    | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/manual-test-checklist.md`, `outputs/phase-11/grep-snapshots/tc-01-template-file-exists.txt`, `outputs/phase-11/grep-snapshots/tc-02-resource-map-entry.txt`                                                                             |
| 12    | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| 13    | `outputs/phase-13/pr-info.md`（blocked / 実施しない）                                                                                                                                                                                                                                               |

---

## Phase 12 実装ガイド概要（中学生レベル概念説明）

> Phase 12 Task 1 Part 1 の必須要件として、仕様書レベルで概念説明を事前記載する。

### NON_VISUAL repo-wide sync wave テンプレートとは何か（中学生向け）

#### 日常生活での例え

たとえば、学校の「連絡帳」を想像してください。
先生が黒板に書いた内容を、担任ノート・保護者連絡帳・学校日誌の3冊すべてに
**同じ日に** 書き写す必要があるとします。

もし毎回「どの3冊を更新すればいいか」を考えてゼロから調べていたら、
書き漏れや、書き方がバラバラになるミスが起きます。

**テンプレート**は、「この3冊をこの順番で、この書き方で更新してね」という
**手順書カード**のようなものです。カードを見れば誰でも同じ品質で更新できます。

#### この機能でできること

| やること         | 説明                                               | 例                               |
| ---------------- | -------------------------------------------------- | -------------------------------- |
| 手順の固定       | 「何をどの順番で更新するか」を一度決めて再利用する | LOGS.md → mirror → ledger の順序 |
| 命名ルールの統一 | ファイル名の付け方を全員で統一する                 | `tc-01-<対象>.txt` 形式          |
| 漏れ防止         | チェックリストで必須項目を確認する                 | LOGS.md×2 の両方を更新したか確認 |

#### なぜテンプレートが必要か

repo-wide sync は「どのファイルを更新したか」を追跡しにくく、
毎回設計すると工数が増えるうえ、必須項目の漏れが起きやすい。
テンプレートを用意することで、**同種タスクを 30 分以内に起票できる** 状態を目指す。

---

## 苦戦箇所サマリ

| 苦戦箇所                                    | 症状                                                                                                                                                                                                               | 対応方針                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11/12 を都度設計する負荷が高い        | `TASK-SC-CANCEL-LOGS-SYNC-001` で NON_VISUAL repo-wide sync の Phase 11 grep スナップショット命名・Phase 12 close-out 要件をゼロから設計した。仕様書作成に 2〜3 時間かかり、同種タスクでは再設計の都度ゆれが生じる | 本タスクで `phase-template-nonvisual-repo-wide-sync.md` を作成し、Phase 11/12 の設計負荷をテンプレートに吸収する                   |
| scope 境界（branch 内 / repo-wide）が不明確 | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` では「branch 内 docs」「repo-wide spec」の境界が不明瞭なため、mandatory 5 tasks 完了後も Phase 12 が `in_progress` で停滞した。「あと何が必要か」が不可視化された         | Phase 2 で Lane A/B/C の境界を明示し、branch 内完結と repo-wide sync を 2 つの独立 wave として定義するパターンをテンプレート化する |
| NON_VISUAL 代替証跡の標準化が未整備         | Phase 11 でスクリーンショットが取れない場合の証跡ソースが「manual-test-result.md」に依存するのか「grep スナップショット」に依存するのかが、タスクごとに異なる判断になっていた                                      | grep スナップショットの命名規則 `tc-NN-<target>.txt` と配置パス `outputs/phase-11/grep-snapshots/` をテンプレートに固定する        |

---

## 参照ファイル

- `docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/index.md`
  （本テンプレートの原型となった参照タスク）
- `.claude/skills/task-specification-creator/references/phase-templates.md`
  （テンプレートファミリー全体インデックス）
- `.claude/skills/task-specification-creator/references/phase-template-phase11.md`
  （Phase 11 NON_VISUAL パターン参照元）
- `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md`
  （Phase 12 詳細テンプレート参照元）
- `.claude/skills/task-specification-creator/references/resource-map.md`
  （新テンプレート追加後に更新対象）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`
  （本タスクで得た知見の反映先）

---

## ゲート

- Phase 1 → 2: scope 境界（含む/含まない）と AC-1〜AC-5 が確定していること
- Phase 2 → 3: テンプレート構造・Lane 定義・grep 命名規則・Phase 12 必須要件が設計書に記載済みであること
- Phase 3 → 4: 4条件 PASS（価値性・実現性・整合性・運用性）、既存テンプレートとの形式整合 PASS
- Phase 10 → 11: AC-1〜AC-5 の達成状況が `final-review-result.md` に記録されていること
- Phase 11 → 12: NON_VISUAL 代替証跡（grep スナップショット）が `outputs/phase-11/manual-test-result.md` に記録されていること
- Phase 12 → 13: LOGS.md×2 追記・mirror parity・completed ledger 更新が完了し、本タスク自身の Phase 12 が `completed` であること
- Phase 13: ユーザー承認があるまで blocked

---

## 親タスクとの関係

- **発見元**: `TASK-SC-CANCEL-LOGS-SYNC-001` Phase 12 の `unassigned-task-detection.md` から formalize
- **境界**: 親タスクは repo-wide sync の実施が scope。本タスクはその実施パターンを **テンプレートとして固定** することが scope
- **依存関係**: 本タスクは親タスクの完了を前提としない（独立して実施可能）
- **完了後の効果**: 同種の NON_VISUAL docs-sync wave タスクを 30 分以内に起票できる状態になる
