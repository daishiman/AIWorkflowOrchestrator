# EVALS.json スキーマ仕様

> 正本: 各スキル (`.claude/skills/<skill>/EVALS.json`) と dual root ミラー (`.agents/skills/<skill>/EVALS.json`)
> 最終更新: 2026-04-19（TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 close-out 由来）
> 関連 canonical 成果物: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` / `evals-field-map.md` / `phase-6/dual-root-parity.md` / `phase-8/schema-change-guide.md`

---

## 1. 目的

`EVALS.json` の構造体フィールド命名・方言・consumer コントラクトを正本として記録する。

本ファイルの責務:

- camelCase v2 系（標準）と snake_case v1 系（方言）の両併存を「事実」として記録する
- 「どちらが正本か」は本ファイルでは**断定しない**（dual root 正本断定禁止方針 / phase-2 scope-architecture §3.1 準拠）
- consumer コントラクト（reader / writer）と変更手順を canonical 4 成果物へリンクする
- validator=0 件の既知制約と代替の手動検証運用を明記する

`EVALS.json` の存在性・JSON parse 可能性のみを対象とする「Skill 作成時のチェックリスト」は `references/claude-code-overview.md` §「Skill 作成時のチェックリスト」を参照すること。

---

## 2. 標準スキーマ（camelCase v2 系）

v2 系は `skill-creator` / `task-specification-creator` などの新規スキルで採用されている。

| フィールド                       | 型        | 意味                                       | 主 writer                  | 主 reader                            |
| -------------------------------- | --------- | ------------------------------------------ | -------------------------- | ------------------------------------ |
| `skillName`                      | string    | スキル名                                   | init / log_usage           | select_skill / SkillScanner          |
| `currentLevel`                   | 1..4      | 現在レベル                                 | log_usage                  | select_skill / SkillScanner          |
| `metrics.totalUsageCount`        | number    | 累計使用回数                               | log_usage                  | select_skill                         |
| `metrics.successCount`           | number    | 成功回数                                   | log_usage                  | select_skill                         |
| `metrics.failureCount`           | number    | 失敗回数                                   | log_usage                  | select_skill                         |
| `metrics.successRate`            | number    | 成功率 (0..1)                              | log_usage                  | select_skill                         |
| `metrics.averageDuration`        | number    | 平均実行時間 (ms)                          | log_usage                  | select_skill                         |
| `metrics.lastEvaluated`          | ISO-8601  | 最終評価日時                               | log_usage                  | select_skill                         |
| `levelHistory[]`                 | array     | レベル変動履歴                             | log_usage                  | select_skill / analytics             |
| `levelCriteria.level{N}.{field}` | object    | レベル判定基準（静的）                     | static（正本参考値）       | select_skill                         |
| `phaseMetrics.<phase_id>.*`      | object    | Phase 別メトリクス                         | log_usage                  | select_skill / qualityInsights 生成  |
| `patterns.commonErrors[].*`      | object    | 頻発エラー                                 | log_usage                  | improve_skill                         |
| `patterns.slowPhases[].*`        | object    | 遅い Phase                                 | log_usage                  | improve_skill                         |
| `qualityInsights.*`              | object    | 拡張メトリクス（§6 参照）                   | 手動メンテ                 | reader=0 件（将来用）                 |

フィールド詳細は canonical `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §3 を参照する。

---

## 3. 方言スキーマ（snake_case v1 系）

`skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner` / fixture 等で稼働中。camelCase v2 と意味論的に等価だが、**同一スキル内でのミックス利用は禁止**（NaN 伝播リスクのため）。

| camelCase v2              | snake_case v1                           | 備考                        |
| ------------------------- | --------------------------------------- | --------------------------- |
| `currentLevel`            | `current_level`                         | 1..4                        |
| `metrics.totalUsageCount` | `metrics.total_usage_count`             | -                           |
| `metrics.successCount`    | `metrics.success_count`                 | -                           |
| `metrics.failureCount`    | `metrics.failure_count`                 | -                           |
| `metrics.successRate`     | `metrics.success_rate`                  | 0..1                        |
| `metrics.averageDuration` | `metrics.average_duration`              | ms                          |
| `metrics.lastEvaluated`   | `metrics.last_evaluated`                | ISO-8601                    |
| `levelHistory`            | `levels`                                | 配列構造                    |
| -                         | `metrics.average_satisfaction`          | v1 固有（v2 に対応フィールドなし） |

### 3.1 どちらが正本か

本ファイルでは**断定しない**。理由:

1. dual root 正本断定禁止方針（`design-docs/phase-2-scope-architecture.md` §3.1）
2. 方言統一は複数スキルの同時 schema migration が必要で、別タスクで取り扱う
3. 統一候補は未タスク `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` で追跡中（`docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`）

### 3.2 方言検出・移行時の注意点

- NaN 伝播リスク: 同一スキル内で camel/snake を併用すると `totalUsageCount + total_usage_count` のような集計ミスで NaN が伝播する可能性あり
- 移行時は `schema-change-guide.md` §6-§8 の手順（dual root 同時更新 / consumer 逐次確認 / JSON parse 検証）に従う

---

## 4. consumer 一覧

consumer 全集合と 9 列表（`path` / `root` / `consumer_type` / `operation` / `read_fields` / `write_fields` / `dynamic_path` / `notes` / `source_evidence`）は canonical 成果物を参照する。

- 正本: [`docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`](../../../../docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md)
- フィールド別突合: [`docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`](../../../../docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md)
- dual root 差分: [`docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`](../../../../docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md)

`references/arch-electron-services-details-part1.md` の `OTHER_FILES` 定数表（2 列表記）は consumer サマリ（path / 役割）のみを提供する。完全な 9 列表を参照する場合は上記 canonical 成果物を優先する。

### 4.1 consumer カテゴリ（参考）

| カテゴリ        | 例                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------ |
| reader（静的）  | `SkillScanner` (`apps/desktop/src/main/services/skill/SkillScanner.ts`) OTHER_FILES 定数         |
| reader（動的）  | `select_skill.js`（スキル選定スコアリング）                                                       |
| writer          | `log_usage.js`（各スキル scripts/ 配下）                                                           |
| mixed / runner  | `skill-fixture-runner/scripts/*` (fixture 層、本タスクでは非実行 consumer として記録)             |
| validator       | **現状 0 件**（§7 参照）                                                                          |

---

## 5. schema 変更手順

schema 変更時は dual root 同時更新・consumer 逐次確認・JSON parse 検証が必須。詳細手順は canonical を参照。

- 正本: [`docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`](../../../../docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md)

### 5.1 変更時チェックリスト（要約）

1. 変更対象フィールド（camel 系 or snake 系）を明確化し、方言ミックスが発生しないことを確認
2. dual root（`.claude/skills/<skill>/EVALS.json` ⇄ `.agents/skills/<skill>/EVALS.json`）を同一 commit で同時更新
3. consumer 全集合（`consumer-audit-report.md` §3）を精査し、read_fields / write_fields を更新
4. `evals-field-map.md` の更新対応を確認
5. `arch-electron-services-details-part1.md` の `OTHER_FILES` 定数表も合わせて更新（path ⇄ 役割のサマリ）
6. JSON parse 検証（`node -e "JSON.parse(require('fs').readFileSync('path/to/EVALS.json'))"` 等）
7. `dual-root-parity.md` §1（bit-for-bit 一致）の再検証: `diff -qr .claude/skills .agents/skills`

### 5.2 手動検証の 3 カテゴリ

`schema-change-guide.md` §7 より:

1. 静的参照検証: ソースコード grep で `currentLevel` / `current_level` 等フィールド名の直接参照箇所を特定
2. dual root 一致検証: `diff -qr .claude/skills .agents/skills` で bit-for-bit parity 確認
3. JSON パース検証: 全 `EVALS.json` の JSON parse 成功確認

---

## 6. qualityInsights（拡張メトリクス / writer=手動メンテ）

`task-specification-creator/EVALS.json` の `qualityInsights.*` は、自動計装ではなく**運用担当が手動でメンテする品質 KPI 集合**である。writer は手動、reader は現状 0 件（将来、`select_skill.js` 等が消費する設計）。

| フィールド                                  | 型       | 意味                                                       |
| ------------------------------------------- | -------- | ---------------------------------------------------------- |
| `qualityInsights.patternAdoptionRate`         | number   | parent-skill pattern の採用率                              |
| `qualityInsights.coverageTargetHitRate`       | number   | coverage target 達成率                                     |
| `qualityInsights.unassignedTaskDetectionRate` | number   | 未タスク検出率（Phase 12 Task 4 件数 / 全 Phase 発見件数） |
| `qualityInsights.notes`                       | string   | 運用者メモ                                                 |
| `qualityInsights.taskMetrics.createdCount`    | number   | 起票タスク数                                               |
| `qualityInsights.taskMetrics.completedCount`  | number   | 完了タスク数                                               |
| `qualityInsights.taskMetrics.failedCount`     | number   | 失敗タスク数                                               |
| `qualityInsights.taskMetrics.retriedCount`    | number   | retry 回数                                                 |
| `qualityInsights.taskMetrics.cancelRate`      | number   | cancel 率                                                  |
| `qualityInsights.taskMetrics.blockedCount`    | number   | blocked 件数                                               |
| `qualityInsights.taskMetrics.lastUpdated`     | ISO-8601 | 最終更新                                                   |

### 6.1 運用ルール

- 手動更新時は commit メッセージに `chore(evals): qualityInsights update` を付与する
- validator 化は UNASSIGNED-EVALS-VALIDATOR-GUARD-001 の設計検討後に実施する（手動値の書式検証）
- reader 0 件である状態も「既知の制約」として §7 に明記

---

## 7. 既知の制約（validator=0 件）

本スキーマには現状、**構造体フィールドを機械的に検証する consumer が 0 件**である。

### 7.1 事実

- `skill-fixture-runner/scripts/validate-skill-structure.js` は EVALS.json の**存在性・JSON parse 可能性**のみを対象とする
- `validate-schemas.js`（`skill-fixture-runner/scripts/` 配下）は `schemas/*.json` 管下のみを扱う（EVALS.json は schemas/ 配下ではない）
- `consumer-audit-report.md` §3 で validator_type consumer は 0 件と確認済み

### 7.2 影響

- フィールド削除 / リネーム時の silent break が自動検出されない
- NaN 伝播（camel/snake 混在起因など）が自動検出されない
- 方言統一時の破壊的変更が手動検証に依存する

### 7.3 代替の手動検証運用

- schema 変更時は §5.1 の 7 ステップを必ず実施
- `schema-change-guide.md` §7 の 3 カテゴリ手動検証（静的参照 / dual root 一致 / JSON パース）が primary guard
- validator 実装タスクは `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` で追跡中

### 7.4 validator 新設時の設計ポリント（参考）

- 検証対象: camelCase v2 系 / snake_case v1 系の両方言を許容、ただし同一ファイル内の混在は禁止として拒否
- 配置候補: `skill-fixture-runner/scripts/validate-evals-schema.js`（新設）
- CI 組み込み: pre-commit hook / PR 時の必須 check

---

## 8. 変更履歴

| Date       | 変更内容                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-19 | 初版作成。TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 Task 2 `system-spec-update-summary.md` §4.1.1 / §4.2.1 / §4.3.1 のドラフトを正本化。camelCase v2 / snake_case v1 / qualityInsights / validator=0 件 を明示。 |
