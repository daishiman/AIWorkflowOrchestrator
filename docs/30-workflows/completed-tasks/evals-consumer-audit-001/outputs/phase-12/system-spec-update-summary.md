# System Spec Update Summary

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 Task 2 成果物。
> 本タスクの監査結果により、`aiworkflow-requirements` skill の `references/` 等（正本仕様）をどう更新すべきかを提案する。
> **本タスクでは正本ファイルを変更しない**（Phase 1 制約 / 監査タスクゆえ）。提案のみを記録し、実更新は別タスク（未タスク化済み）で実施する。

---

## メタ情報

| 項目                                          | 内容                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| task_id                                       | TASK-EVALS-CONSUMER-AUDIT-001                                                                                    |
| phase_id                                      | 12                                                                                                               |
| task                                          | Task 12-2（system-spec-update-summary）                                                                          |
| 生成日時                                      | 2026-04-19                                                                                                       |
| taskType                                      | NON_VISUAL / 監査タスク / docs-only                                                                              |
| implementation_mode                           | verify_existing                                                                                                  |
| 完了ステータス (spec_created)                 | spec_created=true / `completed` の代替として採用（docs-only モードのため）                                       |
| 正本更新の有無（本 Phase）                    | **なし**（更新提案のみ）                                                                                         |
| 正本不変性                                    | `git status` 上 `.claude/skills/aiworkflow-requirements/references/` 配下変更 0 件（Phase 9 §メタ情報確認）      |
| 対応 AC / FR                                  | AC-7（未タスク記録）/ FR-9（監査発見の記録先明示）                                                               |
| 入力（未更新需要のソース）                    | `outputs/phase-9/spec-alignment-report.md` §6.1 NR-1 / NR-2 / NR-3（計 3 件）                                    |
| 対応する未タスク ID（phase-12 task 4 で集約） | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 / -QUALITY-INSIGHTS-DOCUMENT-001 / -VALIDATOR-ZERO-DOCUMENT-001 |

---

## 1. 目的（Why）

Phase 9 `spec-alignment-report.md` は `aiworkflow-requirements/references/` と監査成果物（Phase 5 / 6 / 8 の canonical 4 成果物）の突合を行い、**明確な齟齬（misaligned）= 0 件**・**未タスク化（needs-review）= 3 件**・**許容 = 4 件**という `partial` 判定を下した。

3 件の `needs-review` はいずれも **「正本が実態を網羅していない（記載漏れ）」タイプの不整合**である。これらは AC-6 解除（Phase 10 で PASS 4/4）を阻害しないが、将来同種の監査タスクが再発しないよう正本側を補強する必要がある。

本 Task 12-2 は:

1. 3 件の需要（正本未記載事項）を「正本側のどのファイル／どの位置に／どのような記述を追加すべきか」まで具体化する
2. 各項目を **本 Phase で更新する / 別タスク（未タスク化）へ委譲する** のどちらで処理するかを意思決定する
3. 関連する `LOGS.md` / `topic-map.md` / `keywords.json` の更新要否を判定し、実績ベースで記録する

Phase 1 制約（監査タスクゆえコード／正本の変更禁止）に従い、**本 Phase では正本ファイルを一切変更しない**。更新提案は `docs/30-workflows/unassigned-task/` 配下に起票される別タスク（本 Phase Task 4 `unassigned-task-detection.md` で記録先指定済）で実施する。

---

## 2. Step 1-A: 完了タスク記録

| 項目                              | 値                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 完了タスク ID                     | TASK-EVALS-CONSUMER-AUDIT-001                                                                           |
| 完了ステータス判断                | **spec_created**（docs-only モードのため `completed` の代替として採用）                                 |
| 判断根拠（phase-template）        | `phase-template-phase12.md` §「docs-only モードフラグ」規定 / 本タスク Phase 1 spec.md `taskType` 欄    |
| 成果物形態                        | docs-only / 監査成果物のみ（コード実装なし・テスト追加なし）                                            |
| canonical 4 成果物パス            | Phase 5 / 6 / 8 の `outputs/phase-{5,6,8}/` 配下（Phase 12 では複製せず参照）                           |
| 本 Phase 必須 6 成果物            | `outputs/phase-12/` 配下 6 ファイル（本ファイルを含む）                                                 |
| Issue 状態                        | #2279 CLOSED 維持（`issue_closed_reason` = 「運用上クローズ済みだが、ユーザー指示により仕様書は作成」） |
| AC-6（TASK-CONFLICT-PREVENT-001） | **解除可能（PASS 4/4）**（Phase 10 `ac6-release-verdict.md`）                                           |

---

## 3. Step 1-B: 実装状況表更新（判断一覧）

| 状況表項目                                      | 値                   | 根拠                                                                                           |
| ----------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| コード実装                                      | **なし**             | docs-only / verify_existing。`apps/` / `.claude/skills/*/scripts/` は一切変更しない            |
| テスト追加                                      | **なし**             | 既存テスト（`SkillScanner.test.ts` / `skill-creator.fixture.test.ts`）を監査対象として確認済み |
| 正本 `references/*.md` 更新                     | **なし**（本 Phase） | Phase 1 制約。§4 で 3 件の更新提案を記述（実更新は別タスク）                                   |
| 正本 `indexes/topic-map.md` 更新                | **なし**（本 Phase） | §6.2 で更新提案を記述（実更新は別タスク）                                                      |
| 正本 `indexes/keywords.json` 更新               | **なし**（本 Phase） | §6.3 で更新提案を記述（実更新は別タスク）                                                      |
| 正本 `indexes/resource-map.md` 更新             | **なし**（本 Phase） | 既存エントリに EVALS.json 専用項目なし。§6.4 で追加提案を記述                                  |
| `LOGS.md`（`.claude` / `.agents` skill 内）更新 | **なし**             | §6.1 で更新要否を判定（「記録対象イベントなし」）                                              |
| `CHANGELOG.md`（skill 内）更新                  | **なし**             | §6.1 の判定に従う                                                                              |
| `EVALS.json`（各スキル）更新                    | **なし**             | 監査対象そのものなので本タスクでは変更しない                                                   |
| `completed-tasks/` への記録                     | **なし**（本 Phase） | `docs/30-workflows/completed-tasks/` 反映は本タスクの責務外。別タスクへ委譲                    |

---

## 4. Step 1-C: 関連タスク表更新（3 件の更新提案）

Phase 9 `spec-alignment-report.md` §6.1 の NR-1 / NR-2 / NR-3 に対応する 3 件の更新提案を以下に整理する。各項目は「本タスクで更新せず、未タスクとして別タスクへ委譲」する方針である。

### 4.1 更新提案 #1: snake_case v1 系スキーマの正本記載追加（NR-1 対応）

| 項目                     | 内容                                                                                                                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 更新提案 ID              | UPDATE-SPEC-001                                                                                                                                                                                                                         |
| 対応 `needs-review` ID   | NR-1 (Phase 9 §6.1)                                                                                                                                                                                                                     |
| 対応未タスク ID          | **UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001**                                                                                                                                                                                    |
| 優先度                   | 中                                                                                                                                                                                                                                      |
| 更新対象ファイル（案 A） | 新規作成: `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                                                                                                                                                      |
| 更新対象ファイル（案 B） | 既存追記: `.claude/skills/aiworkflow-requirements/references/claude-code-overview.md` の `### Skill 層（Domain 層）` §127 直下にサブセクション追加                                                                                      |
| 推奨案                   | **案 A**（`references/evals-schema-spec.md` を新設）。Progressive Disclosure 原則に従い、EVALS 専用の正本を別ファイル化する。案 B は既存の `18-skills.md` への詳細委譲パターンから逸脱する恐れがある                                    |
| 更新内容ドラフト         | ⬇ §4.1.1 参照                                                                                                                                                                                                                           |
| dual root 対応           | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` と `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md` を同一 commit で同時作成（`schema-change-guide.md` §6 dual root 同期ルールに準拠） |
| 承認プロセス             | (1) `aiworkflow-requirements` skill owner レビュー / (2) `task-specification-creator` の spec-elegance-consistency-audit で整合性確認 / (3) `indexes/topic-map.md` と同時反映                                                           |
| 本 Phase で更新するか    | **No / 別タスクへ委譲**（Phase 1 制約）                                                                                                                                                                                                 |
| 委譲先                   | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`（Phase 12 Task 4 §4.2.1 で記録先確定）                                                                                                                |

#### 4.1.1 更新内容ドラフト（案 A: `references/evals-schema-spec.md` の主要セクション）

以下のセクション構成を推奨する（詳細本文は当該未タスク起票時に確定）:

```md
# EVALS.json スキーマ仕様

## 1. 目的

EVALS.json の構造体フィールド命名・方言・consumer コントラクトを正本として記録する。

## 2. 標準スキーマ（camelCase v2 系）

| フィールド                     | 型       | 意味               | 主 writer / 主 reader   |
| ------------------------------ | -------- | ------------------ | ----------------------- |
| skillName                      | string   | スキル名           | init / log_usage        |
| currentLevel                   | 1..4     | 現在レベル         | log_usage, select_skill |
| metrics.totalUsageCount        | number   | 累計使用回数       | log_usage               |
| metrics.successCount           | number   | 成功回数           | log_usage               |
| metrics.failureCount           | number   | 失敗回数           | log_usage               |
| metrics.successRate            | number   | 成功率（0..1）     | log_usage               |
| metrics.averageDuration        | number   | 平均実行時間 (ms)  | log_usage               |
| metrics.lastEvaluated          | ISO-8601 | 最終評価日時       | log_usage               |
| levelHistory[]                 | array    | レベル変動履歴     | log_usage               |
| levelCriteria.level{N}.{field} | object   | レベル判定基準     | static（正本参考値）    |
| phaseMetrics.<phase_id>.\*     | object   | Phase 別メトリクス | log_usage               |
| patterns.commonErrors[].\*     | object   | 頻発エラー         | log_usage               |
| patterns.slowPhases[].\*       | object   | 遅い Phase         | log_usage               |

詳細: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §3 を正本とする。

## 3. 方言スキーマ（snake_case v1 系）

現在、一部スキル（`skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner` / fixture）
は snake_case v1 系で稼働している。両方言は意味論的には等価だが、同一スキル内でミックス利用は
禁止する（NaN 伝播リスクのため）。

| camelCase v2            | snake_case v1                           |
| ----------------------- | --------------------------------------- |
| currentLevel            | current_level                           |
| metrics.totalUsageCount | metrics.total_usage_count               |
| metrics.successCount    | metrics.success_count                   |
| metrics.failureCount    | metrics.failure_count                   |
| metrics.successRate     | metrics.success_rate                    |
| metrics.averageDuration | metrics.average_duration                |
| metrics.lastEvaluated   | metrics.last_evaluated                  |
| levelHistory            | levels                                  |
| -                       | metrics.average_satisfaction（v1 固有） |

「どちらが正本か」は本 skill では**断定しない**（dual root 正本断定禁止 / Phase 2 §3.1）。
統一は UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFY-001 で別途検討。

## 4. consumer 一覧

`docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` を参照。

## 5. schema 変更手順

`docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` を参照。
```

> 注: この内容はあくまでドラフト。実際の追記は別タスクで `aiworkflow-requirements` skill owner のレビューを経て確定する。

---

### 4.2 更新提案 #2: `qualityInsights.*` 11 フィールド正本記載（NR-2 対応）

| 項目                     | 内容                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 更新提案 ID              | UPDATE-SPEC-002                                                                                                                                                                                  |
| 対応 `needs-review` ID   | NR-2 (Phase 9 §6.1)                                                                                                                                                                              |
| 対応未タスク ID          | **UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001**                                                                                                                                          |
| 優先度                   | 中                                                                                                                                                                                               |
| 更新対象ファイル（案 A） | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`（4.1 で新設するファイルに `§6 qualityInsights（拡張メトリクス）` セクションを追加）                                     |
| 更新対象ファイル（案 B） | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` に `§qualityInsights` サブセクションを追加（同一スキル内に EVALS.json 構造例示がすでに存在するため）            |
| 推奨案                   | **案 A**（evals-schema-spec.md への集約）。qualityInsights は `task-specification-creator` 固有だが、他スキルへ波及する可能性があるため `aiworkflow-requirements` 正本に記録するのが妥当         |
| 更新内容ドラフト         | ⬇ §4.2.1 参照                                                                                                                                                                                    |
| dual root 対応           | 案 A 採用時は 4.1 と同一ファイルへの追記で dual root 要同時更新。案 B 採用時は `task-specification-creator` skill 側のみ（`.agents/.../self-improvement-cycle.md` と同時更新）                   |
| 承認プロセス             | (1) `task-specification-creator` skill owner レビュー（qualityInsights は task-specification-creator 固有概念） / (2) `aiworkflow-requirements` skill owner レビュー / (3) runner 側との整合確認 |
| 本 Phase で更新するか    | **No / 別タスクへ委譲**                                                                                                                                                                          |
| 委譲先                   | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md`（Phase 12 Task 4 §4.2.2 で記録先確定）                                                                      |

#### 4.2.1 更新内容ドラフト（案 A の追加セクション）

```md
## 6. qualityInsights（拡張メトリクス / writer=手動メンテ）

`task-specification-creator/EVALS.json` の `qualityInsights.*` は、自動計装ではなく
**運用担当が手動でメンテする品質 KPI 集合**である。writer は手動、reader は現状 0 件（将来、
select_skill.js 等の reader は現状 0 件）。

| フィールド                                  | 型       | 意味                                                       |
| ------------------------------------------- | -------- | ---------------------------------------------------------- |
| qualityInsights.patternAdoptionRate         | number   | parent-skill pattern の採用率                              |
| qualityInsights.coverageTargetHitRate       | number   | coverage target 達成率                                     |
| qualityInsights.unassignedTaskDetectionRate | number   | 未タスク検出率（Phase 12 Task 4 件数 / 全 Phase 発見件数） |
| qualityInsights.notes                       | string   | 運用者メモ                                                 |
| qualityInsights.taskMetrics.createdCount    | number   | 起票タスク数                                               |
| qualityInsights.taskMetrics.completedCount  | number   | 完了タスク数                                               |
| qualityInsights.taskMetrics.failedCount     | number   | 失敗タスク数                                               |
| qualityInsights.taskMetrics.retriedCount    | number   | retry 回数                                                 |
| qualityInsights.taskMetrics.cancelRate      | number   | cancel 率                                                  |
| qualityInsights.taskMetrics.blockedCount    | number   | blocked 件数                                               |
| qualityInsights.taskMetrics.lastUpdated     | ISO-8601 | 最終更新                                                   |

運用ルール:

- 手動更新時は commit メッセージに `chore(evals): qualityInsights update` を付与する
- validator 化は UNASSIGNED-EVALS-VALIDATOR-GUARD-001 で設計後に検討（手動値の書式検証）
```

---

### 4.3 更新提案 #3: validator=0 件事実の正本追記（NR-3 対応）

| 項目                   | 内容                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 更新提案 ID            | UPDATE-SPEC-003                                                                                                                                                                                              |
| 対応 `needs-review` ID | NR-3 (Phase 9 §6.1)                                                                                                                                                                                          |
| 対応未タスク ID        | **UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001**                                                                                                                                                        |
| 優先度                 | 中                                                                                                                                                                                                           |
| 更新対象ファイル       | `.claude/skills/aiworkflow-requirements/references/claude-code-overview.md` の **§「Skill 作成時のチェックリスト」（272 行目付近）**                                                                         |
| 更新位置               | 272 行 `- [ ] EVALS.json が存在し、有効なJSON` の直下に注記を追加                                                                                                                                            |
| 更新内容ドラフト       | ⬇ §4.3.1 参照                                                                                                                                                                                                |
| 副次更新対象           | 新設される `references/evals-schema-spec.md` § 「既知の制約」にも validator=0 件を明記                                                                                                                       |
| dual root 対応         | `.claude/skills/aiworkflow-requirements/references/claude-code-overview.md` と `.agents/skills/aiworkflow-requirements/references/claude-code-overview.md` を同一 commit で同時更新                          |
| 承認プロセス           | (1) `aiworkflow-requirements` skill owner レビュー / (2) UNASSIGNED-EVALS-VALIDATOR-GUARD-001 の担当者レビュー（実装方針との整合） / (3) ポインタ先（`schema-change-guide.md` §7）と双方向リンク確認         |
| 本 Phase で更新するか  | **No / 別タスクへ委譲**                                                                                                                                                                                      |
| 委譲先                 | `docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`（Phase 12 Task 4 §4.2.3 で記録先確定）                                                                                    |
| 備考                   | 3 提案の中で**最も軽量**（既存ファイルへの数行追記）。UNASSIGNED-EVALS-VALIDATOR-GUARD-001（validator 実装）よりも先に実施可能（先行して「既知の制約」として明記することで、意図的な決定であることを示せる） |

#### 4.3.1 更新内容ドラフト（`claude-code-overview.md:272` 直後に追記）

```md
- [ ] EVALS.json が存在し、有効なJSON

  > **注記（validator=0 件の既知制約）**: 本チェックリストは `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`
  > によって確認される「存在性」「JSON parse 可能性」までを対象とする。EVALS.json の**内部フィールド構造**（schema）
  > を機械的に検証する consumer は現状 0 件である（`validate-schemas.js` は `schemas/*.json` のみを扱う）。
  > このため、フィールド削除 / リネーム時の silent break / NaN 伝播は自動検出されない。
  > schema 変更時は `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` §7 の
  > 3 カテゴリ手動検証（静的参照 / dual root 一致 / JSON パース）を必ず実施すること。
  > validator 化タスクは `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` で追跡中。
```

---

## 5. 更新提案サマリ

| UPDATE-SPEC-ID  | 優先度 | 対応 `needs-review` | 対応未タスク ID                                     | 対象ファイル                                     | 本 Phase で更新 | 委譲先                                                                               |
| --------------- | ------ | ------------------- | --------------------------------------------------- | ------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------ |
| UPDATE-SPEC-001 | 中     | NR-1                | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001    | 新規: `references/evals-schema-spec.md`          | **No**          | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`    |
| UPDATE-SPEC-002 | 中     | NR-2                | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 | 追記: `references/evals-schema-spec.md` §6       | **No**          | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md` |
| UPDATE-SPEC-003 | 中     | NR-3                | UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001   | 追記: `references/claude-code-overview.md:272+1` | **No**          | `docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`   |

### 5.1 優先度別件数

| 優先度 | 件数 | 内訳                                                |
| ------ | ---- | --------------------------------------------------- |
| 高     | 0    | （該当なし）                                        |
| 中     | 3    | UPDATE-SPEC-001 / UPDATE-SPEC-002 / UPDATE-SPEC-003 |
| 低     | 0    | （該当なし）                                        |

### 5.2 本 Phase で更新するものの有無

**なし**（全 3 件とも Phase 1 制約に従い別タスクへ委譲）。本 Phase Task 4 `unassigned-task-detection.md` §4.2 に記録先が確定している。

---

## 6. LOGS.md / topic-map.md / keywords.json 更新要否判定

Phase 12 Task 2 規定により、`LOGS.md`（skill 単位）/ `topic-map.md` / `keywords.json` の更新要否を実績ベースで判定する。

### 6.1 LOGS.md 更新要否

| LOGS.md 配置                                        | 更新要否 | 根拠                                                                                                 |
| --------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | **不要** | 本 Phase は `aiworkflow-requirements` skill の scripts を実行していない。log_usage 対象イベント 0 件 |
| `.claude/skills/task-specification-creator/LOGS.md` | **不要** | 本 Phase は `task-specification-creator` scripts を実行していない（仕様書作成は手動）                |
| `.claude/skills/github-issue-manager/LOGS.md`       | **不要** | 本 Phase は `gh` CLI を実行していない（Issue #2279 CLOSED 維持方針、状態確認は Phase 1 で完了済み）  |
| `.claude/skills/skill-creator/LOGS.md`              | **不要** | 本 Phase は skill-creator を使用していない                                                           |
| `.claude/skills/skill-fixture-runner/LOGS.md`       | **不要** | 本 Phase は fixture runner を実行していない                                                          |
| `.claude/skills/int-test-skill/LOGS.md`             | **不要** | 本 Phase は int-test-skill を使用していない                                                          |
| `.agents/skills/*/LOGS.md`（6 スキル分）            | **不要** | dual root は `.claude/` と同一記録対象。本 Phase ではイベント 0 件                                   |

**判定**: LOGS.md 更新は不要（全 12 ファイル）。理由は本 Phase が「監査成果物のレビューと close-out ドキュメント生成」のみで、各 skill の scripts 実行が発生しないため。

### 6.2 topic-map.md 更新要否

| ファイル                                                      | 更新要否             | 提案内容                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` | **必要**（別タスク） | EVALS.json 関連トピックが **未掲載**（`rg 'EVALS\|evals' indexes/` = 0 ヒット）。`topic: evals-json` エントリを新設し、`references/evals-schema-spec.md`（新設）/ `references/arch-electron-services-details-part1.md` / `references/claude-code-overview.md` / `references/lessons-learned-current-2026-04.md`（L-WC-001）を cross-reference として列挙する |
| 対応する Skill Feedback PROPOSAL                              | -                    | PROPOSAL-AWR-02（`skill-feedback-report.md` §4.4）                                                                                                                                                                                                                                                                                                           |
| 本 Phase で更新するか                                         | **No / 別タスク**    | Phase 1 制約。PROPOSAL-AWR-02 は UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001（UPDATE-SPEC-001）実施と同時に反映するのが合理的                                                                                                                                                                                                                           |

### 6.3 keywords.json 更新要否

| ファイル                                                       | 更新要否             | 提案内容                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json` | **必要**（別タスク） | EVALS 関連キーワードが未登録（`rg 'EVALS' indexes/keywords.json` = 0 ヒット）。以下を追加提案: `EVALS`, `EVALS.json`, `currentLevel`, `current_level`, `levelHistory`, `levels`, `qualityInsights`, `phaseMetrics`, `validator=0`, `schema-change-guide` |
| 本 Phase で更新するか                                          | **No / 別タスク**    | Phase 1 制約。topic-map.md と同時更新が望ましい                                                                                                                                                                                                          |

### 6.4 resource-map.md 更新要否

| ファイル                                                         | 更新要否             | 提案内容                                                                                                                                                  |
| ---------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` | **必要**（別タスク） | UPDATE-SPEC-001 で新規作成する `references/evals-schema-spec.md` をリソースとして登録する必要あり。既存エントリには EVALS 専用リソースがないため 1 行追加 |
| 本 Phase で更新するか                                            | **No / 別タスク**    | Phase 1 制約。evals-schema-spec.md の新規作成と同時に更新が望ましい                                                                                       |

### 6.5 更新要否サマリ

| 対象                               | 更新要否 | 本 Phase で更新    | 実更新タイミング                             |
| ---------------------------------- | -------- | ------------------ | -------------------------------------------- |
| LOGS.md（全 skill）                | 不要     | -                  | -                                            |
| CHANGELOG.md（全 skill）           | 不要     | -                  | -                                            |
| topic-map.md                       | 必要     | **No**（別タスク） | UPDATE-SPEC-001 実施時に同時反映             |
| keywords.json                      | 必要     | **No**（別タスク） | UPDATE-SPEC-001 実施時に同時反映             |
| resource-map.md                    | 必要     | **No**（別タスク） | UPDATE-SPEC-001 実施時に同時反映             |
| references/evals-schema-spec.md    | 新規必要 | **No**（別タスク） | UPDATE-SPEC-001 / UPDATE-SPEC-002 で新規作成 |
| references/claude-code-overview.md | 追記必要 | **No**（別タスク） | UPDATE-SPEC-003 で §272 直後に追記           |

---

## 7. 「なぜ更新不要か」の根拠集約

Phase 12 Task 2 契約により、「更新不要」判定は実績根拠とともに記録する必要がある。

| 判定対象                                            | 判定 | 根拠                                                                                                                         |
| --------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| 本 Phase での正本 `references/*.md` 更新            | 不要 | Phase 1 spec §制約「`.claude/skills/*/` 配下を変更しない」。監査タスクゆえ、修正自体を別タスクとして切り出すことが正しい運用 |
| 本 Phase での `topic-map.md` / `keywords.json` 更新 | 不要 | 上と同様。更新提案のみ §6 で記録し、実更新は UPDATE-SPEC-001 〜 003 と同期実施                                               |
| 本 Phase での `LOGS.md` 更新                        | 不要 | 本 Phase は各 skill の scripts を実行していない。log_usage.js 起動 0 回                                                      |
| 本 Phase での `CHANGELOG.md` 更新                   | 不要 | skill 本体に変更なし。CHANGELOG 記録対象なし                                                                                 |
| 本 Phase での `EVALS.json` 書き換え                 | 不要 | EVALS.json 自体が監査対象。writer=log_usage.js のみで、本タスクはそれを実行しない                                            |
| 本 Phase での `completed-tasks/` 記録               | 不要 | 本タスクの責務外。別タスクへ委譲                                                                                             |
| 本 Phase での `.agents/skills/` 更新                | 不要 | dual root bit-for-bit 一致（Phase 6 §1）のため、`.claude` に変更がなければ `.agents` への同時更新も発生しない                |

---

## 8. 正本不変性確認（Phase 1 / Phase 2 準拠）

| 確認項目                                                                                | 結果                                                                    |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/` 配下の変更                         | **0 件**                                                                |
| `.claude/skills/aiworkflow-requirements/indexes/` 配下の変更                            | **0 件**                                                                |
| `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` の変更 | **0 件**                                                                |
| `.claude/skills/*/EVALS.json` / `.agents/skills/*/EVALS.json` の変更                    | **0 件**                                                                |
| `apps/desktop/src/main/services/skill/SkillScanner.ts` の変更                           | **0 件**                                                                |
| 本 Phase の書き込み先                                                                   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/` 配下のみ |
| dual root 正本断定（Phase 2 §3.1）                                                      | 断定していない（本サマリでも方言統一の最終判定を保留）                  |

**結論**: Phase 1 / Phase 2 の正本不変性・dual root 正本断定禁止方針を本 Phase でも遵守している。

---

## 9. planned wording の除去確認

Phase 12 Task 2 契約「planned wording を残さない」規定に従い、本ファイル中の曖昧表現を事実ベース／意思決定済み表現に置換する。

| 置換前の曖昧表現     | 置換後の事実表現                                                  | 根拠                        |
| -------------------- | ----------------------------------------------------------------- | --------------------------- |
| future-tense wording | 「UPDATE-SPEC-XXX として提案（本 Phase では更新しない）」         | 別タスクへ委譲済み          |
| 「将来対応する」     | 「UNASSIGNED-EVALS-SPEC-〜 として未タスク化済み（記録先指定済）」 | Phase 12 Task 4 §4.2 で確定 |
| 「TODO」             | （本ファイル中に残存 0 件）                                       | §9.1 自己検証               |
| 「保留」             | 「別タスクへ委譲（委譲先パス明記済）」                            | §4.1〜§4.3 に委譲先を列挙   |

### 9.1 planned wording 自己検証コマンド

```bash
# 本ファイルに planned wording が残存しないことを確認
rg -n '計画|予定|TODO|will be|保留|後で' \
   docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/system-spec-update-summary.md
```

期待結果: ヒット 0 件。

---

## 10. 後続 Phase（Phase 13）への引き継ぎ

| 項目                            | 値                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 本 Phase 正本更新件数           | **0 件**（提案のみ 3 件）                                                                                                                             |
| 委譲先記録先パス                | `docs/30-workflows/unassigned-task/task-evals-spec-{snake-case-v1,quality-insights,validator-zero}-document-001.md`（3 件）                           |
| PR description で言及すべき点   | 「本タスクは監査タスクゆえ正本を一切変更せず、3 件の正本補強需要は unassigned-task/ へ委譲」の明示                                                    |
| PR title への反映               | タイトル本文への追記不要（spec-only close-out のため）                                                                                                |
| 後続タスク起票の依存関係        | `UPDATE-SPEC-001` → `UPDATE-SPEC-002` → `UPDATE-SPEC-003` の直列順が合理的（1 が土台、2・3 が追記）。unassigned-task-detection.md §6 の依存グラフ参照 |
| Phase 13 で参照すべきセクション | §4（更新提案）/ §5（サマリ）/ §6（関連ファイル更新要否）/ §10（PR description 材料）                                                                  |

---

## 11. 自己検証（Task 12-2 完了条件チェック）

| チェック項目                                                                         | 結果       |
| ------------------------------------------------------------------------------------ | ---------- |
| Step 1-A（完了タスク記録）が含まれる                                                 | §2 ✅      |
| Step 1-B（実装状況表更新）が含まれる                                                 | §3 ✅      |
| Step 1-C（関連タスク表更新）が含まれる                                               | §4 ✅      |
| `LOGS.md` 更新要否が判定されている                                                   | §6.1 ✅    |
| `topic-map.md` 更新要否が判定されている                                              | §6.2 ✅    |
| `keywords.json` 更新要否が判定されている                                             | §6.3 ✅    |
| `aiworkflow-requirements` を更新しない場合「なぜ更新不要か」が記述されている         | §7 ✅      |
| planned wording が残っていない（future-tense wording は除去済み）                    | §9 ✅      |
| 3 件の `needs-review`（NR-1 / NR-2 / NR-3）すべてに更新提案 / 委譲先が明記されている | §4 / §5 ✅ |
| 本 Phase で正本を変更していないことが git status で確認可能                          | §8 ✅      |

---

## 12. 参照資料

- Phase 9 `spec-alignment-report.md` §6.1（NR-1 / NR-2 / NR-3 の根拠）
- Phase 9 `spec-alignment-report.md` §7（未タスク候補と target_record_path）
- Phase 12 Task 4 `unassigned-task-detection.md` §4.2（委譲先パス確定）
- Phase 12 Task 5 `skill-feedback-report.md` §4.4（PROPOSAL-AWR-01 / -02 / -03）
- Phase 1 `design-docs/phase-1-requirements.md` §制約（正本不変性）
- Phase 2 `design-docs/phase-2-scope-architecture.md` §3.1（dual root 正本断定禁止）
- `task-specification-creator/references/phase-template-phase12.md`（Task 12-2 契約）
- `task-specification-creator/references/phase-12-documentation-guide.md`（system-spec-update-summary 詳細）

---

## 13. 変更履歴

| Date       | 変更内容                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-19 | Phase 12 Task 2 初版作成。正本更新提案 3 件（UPDATE-SPEC-001/002/003・全件中優先度）、本 Phase で更新するもの 0 件、全件を別タスクへ委譲（未タスク化済み）。 |
