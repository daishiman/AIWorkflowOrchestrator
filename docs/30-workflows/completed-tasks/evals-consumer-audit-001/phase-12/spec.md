# Phase 12: ドキュメント・正本仕様同期 - タスク仕様書

## メタ情報

| 項目                | 内容                                                 |
| ------------------- | ---------------------------------------------------- |
| タスクID            | TASK-EVALS-CONSUMER-AUDIT-001                        |
| Phase               | 12                                                   |
| Phase名             | close-out・仕様同期・未タスク同期                    |
| 前提Phase           | Phase 11                                             |
| 後続Phase           | Phase 13                                             |
| ステータス          | 完了（成果物作成済み）                               |
| 作成日              | 2026-04-19                                           |
| 機能名              | evals-consumer-audit                                 |
| taskType            | NON_VISUAL / 監査タスク（コード実装なし・docs-only） |
| implementation_mode | verify_existing                                      |
| issue_number        | 2279                                                 |
| issue_status        | CLOSED（仕様書のみ作成方針）                         |

---

## 1. 目的（Why）

本 Phase は `task-specification-creator` の Phase 12 契約に従い、監査タスクの close-out を完了する。  
canonical 4 成果物そのものを Phase 12 へコピーして増殖させるのではなく、**Phase 5 / 6 / 8 の canonical 成果物を参照しながら、close-out 用の必須 6 成果物を生成する**。

必須 6 成果物:

1. `implementation-guide.md`
2. `system-spec-update-summary.md`
3. `documentation-changelog.md`
4. `unassigned-task-detection.md`
5. `skill-feedback-report.md`
6. `phase12-task-spec-compliance-check.md`

また、`implementation-guide.md` の Part 1 に中学生レベル説明を統合し、Part 2 で技術的説明を扱う。

---

## 2. 入力（前Phase成果物・参照資料）

### 2.1 前Phase成果物

| 成果物                                     | 役割                     |
| ------------------------------------------ | ------------------------ |
| `outputs/phase-5/consumer-audit-report.md` | canonical 成果物 1       |
| `outputs/phase-5/evals-field-map.md`       | canonical 成果物 2       |
| `outputs/phase-6/dual-root-parity.md`      | canonical 成果物 3       |
| `outputs/phase-8/schema-change-guide.md`   | canonical 成果物 4       |
| `outputs/phase-9/spec-alignment-report.md` | 正本整合の判定入力       |
| `outputs/phase-10/ac6-release-verdict.md`  | AC-6 判定入力            |
| `outputs/phase-10/final-review-log.md`     | MINOR / 戻し先の確認     |
| `outputs/phase-11/manual-test-result.md`   | Phase 11 の正本証跡      |
| `outputs/phase-11/discovered-issues.md`    | 未タスク候補の一次ソース |

### 2.2 参照資料

| 資料                                                                                        | 用途                      |
| ------------------------------------------------------------------------------------------- | ------------------------- |
| `.claude/skills/task-specification-creator/references/phase-template-phase12.md`            | Phase 12 必須構成         |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Task 12-1〜12-6 詳細      |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | Phase 11/12 通しガイド    |
| `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`      | changelog テンプレ        |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | compliance-check テンプレ |
| `.claude/skills/aiworkflow-requirements/references/`                                        | Step 2 の仕様同期対象     |

---

## 3. 実行手順

### Task 12-1: `implementation-guide.md` を作成する

**配置先**: `outputs/phase-12/implementation-guide.md`

要件:

- Part 1: 中学生レベル説明
- Part 2: 技術者向け説明
- `## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定記載
- 代替証跡として `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md` を参照する
- canonical 4 成果物の役割と相互参照を記載する

### Task 12-2: `system-spec-update-summary.md` を作成する

**配置先**: `outputs/phase-12/system-spec-update-summary.md`

要件:

- Step 1-A: 完了タスク記録
- Step 1-B: 実装状況表更新（docs-only のため `spec_created` 系判断を明示）
- Step 1-C: 関連タスク表更新
- `LOGS.md x2`、`topic-map.md`、必要なら `keywords.json` の更新要否を判定し、実績ベースで記録する
- `aiworkflow-requirements` へ更新しない場合も「なぜ更新不要か」を書く
- planned wording を残さない

### Task 12-3: `documentation-changelog.md` を作成する

**配置先**: `outputs/phase-12/documentation-changelog.md`

要件:

- この workflow 内で追加 / 更新 / 非更新と判断したファイルを列挙する
- canonical 4 成果物は「参照先」として扱い、Phase 12 で複製しないことを明記する
- current / baseline の観点を記録する

### Task 12-4: `unassigned-task-detection.md` を作成する

**配置先**: `outputs/phase-12/unassigned-task-detection.md`

要件:

- `discovered-issues.md`、`spec-alignment-report.md`、`dual-root-parity.md` の要対応項目を入力にする
- 0 件でも summary を出す
- 1 件以上なら `docs/30-workflows/unassigned-task/` への配置先を明記する

### Task 12-5: `skill-feedback-report.md` を作成する

**配置先**: `outputs/phase-12/skill-feedback-report.md`

要件:

- `task-specification-creator` と `aiworkflow-requirements` に対する改善提案を記録する
- 改善提案が 0 件でも「改善点なし」でファイルを作成する
- 今回見つかった命名揺れ、成果物契約ドリフト、参照先ミスマッチを記録する

### Task 12-6: `phase12-task-spec-compliance-check.md` を作成する

**配置先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

要件:

- Task 12-1〜12-5 の完了を 1 ファイルへ集約する
- Phase 11 `manual-test-result.md` を参照し、NON_VISUAL 証跡が閉じていることを確認する
- planned wording 0 件、root parity、未タスク整合を同時確認する

---

## 4. 成果物（パス・フォーマット・スキーマ）

| 成果物名             | パス                                                     | 必須 | 説明                                        |
| -------------------- | -------------------------------------------------------- | ---- | ------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | ✅   | Part 1 / Part 2 を統合した close-out ガイド |
| 仕様同期サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | 正本更新の有無と根拠                        |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | ✅   | close-out 更新台帳                          |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | follow-up 候補                              |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善提案または改善点なし                    |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 12-1〜12-6 の集約証跡                  |

### 4.1 `implementation-guide.md` 必須構成

```md
# Implementation Guide

## メタ情報

## Part 1: 中学生レベル説明

## Part 2: 技術者向け説明

## 視覚証跡

## 参照成果物

## 既知の制約
```

---

## 5. 完了条件チェックリスト

- [ ] Phase 12 必須 6 成果物がすべて `outputs/phase-12/` に存在する
- [ ] `implementation-guide.md` が Part 1 / Part 2 の 2 部構成になっている
- [ ] `implementation-guide.md` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` が記載されている
- [ ] `system-spec-update-summary.md` が更新あり / 更新なしのどちらでも実績ベースで記録されている
- [ ] `documentation-changelog.md` に planned wording が残っていない
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `skill-feedback-report.md` が改善点なしの場合でも存在する
- [ ] `phase12-task-spec-compliance-check.md` が Task 12-1〜12-6 を集約している
- [ ] canonical 4 成果物の参照先が Phase 5 / 6 / 8 の実ファイルに統一されている

---

## 6. 検証方法

### 6.1 必須 6 成果物確認

```bash
for f in \
  implementation-guide.md \
  system-spec-update-summary.md \
  documentation-changelog.md \
  unassigned-task-detection.md \
  skill-feedback-report.md \
  phase12-task-spec-compliance-check.md; do
  test -f "docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/$f"
done
```

### 6.2 planned wording 検出

```bash
rg -n '計画|予定|TODO|will be|を予定|保留' \
  docs/30-workflows/evals-consumer-audit-001/outputs/phase-12 \
  -g '*.md'
```

### 6.3 canonical 参照先確認

```bash
rg -n 'outputs/phase-12/(consumer-audit-report|evals-field-map|schema-change-guide|dual-root-parity)\\.md' \
  docs/30-workflows/evals-consumer-audit-001
```

---

## 7. リスクと対策

| ID     | リスク                                         | 対策                                                                       |
| ------ | ---------------------------------------------- | -------------------------------------------------------------------------- |
| P12-R1 | Phase 12 が独自成果物名へ逸脱する              | 必須 6 成果物へ固定                                                        |
| P12-R2 | canonical 4 成果物を複製し、参照系が二重化する | Phase 5 / 6 / 8 を canonical と明記                                        |
| P12-R3 | 正本更新不要の判断が根拠不足になる             | `spec-alignment-report.md` と `system-spec-update-summary.md` を対応づける |

---

## 8. 前後 Phase との依存

- 前 Phase から受け取るもの: Phase 5 / 6 / 8 / 9 / 10 / 11 の成果物
- 後 Phase へ渡すもの: Phase 12 必須 6 成果物

---

## 統合テスト連携【必須】

| 観点                                                          | 期待値 | ステータス |
| ------------------------------------------------------------- | ------ | ---------- |
| Phase 12 必須 6 成果物が揃う                                  | PASS   | pending    |
| `manual-test-result.md` を正本証跡として参照している          | PASS   | pending    |
| canonical 4 成果物の参照先が Phase 5 / 6 / 8 に統一されている | PASS   | pending    |

---

## タスク100%実行確認【必須】

- [ ] Task 12-1 実装ガイド作成完了
- [ ] Task 12-2 仕様同期サマリー作成完了
- [ ] Task 12-3 更新履歴作成完了
- [ ] Task 12-4 未タスク検出完了
- [ ] Task 12-5 スキルフィードバック完了
- [ ] Task 12-6 準拠チェック完了

---

## 次Phase

Phase 13 では、canonical 4 成果物は Phase 5 / 6 / 8 のパスを参照し、Phase 12 必須 6 成果物を close-out 根拠として PR 段取りを記述する。
