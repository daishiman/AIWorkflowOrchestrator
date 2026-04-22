# EVALS.json スキーマ仕様

> 正本: 各スキル (`.claude/skills/<skill>/EVALS.json`) と dual root ミラー (`.agents/skills/<skill>/EVALS.json`)
> 最終更新: 2026-04-21（UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 反映）
> 関連 canonical 成果物: `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` / `evals-field-map.md` / `phase-6/dual-root-parity.md` / `phase-8/schema-change-guide.md`

---

## 1. 目的

`EVALS.json` の構造体フィールド命名・方言・consumer コントラクトを正本として記録する。

本ファイルの責務:

- camelCase v2 系（標準）と snake_case v1 系（方言）の両併存を「事実」として記録する
- 「どちらが正本か」は本ファイルでは**断定しない**（dual root 正本断定禁止方針 / phase-2 scope-architecture §3.1 準拠）
- consumer コントラクト（reader / writer）と変更手順を canonical 4 成果物へリンクする
- `validate-evals.js` による構造検証の現在地と、残る制約を明記する

`EVALS.json` の存在性・JSON parse 可能性のみを対象とする「Skill 作成時のチェックリスト」は `references/claude-code-overview.md` §「Skill 作成時のチェックリスト」を参照すること。

---

## 2. Legacy スキーマ（camelCase v2 系）

> **注意**: camelCase v2 系は 2026-04-21 の方言統一（UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001）により **legacy** となった。新規 writer は snake_case v1 系（§3）を使用すること。

v2 系はかつて `task-specification-creator` / `int-test-skill` / `github-issue-manager` / `automation-30` で採用されていたが、現在は全スキルが snake_case v1 系に統一済み。

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

フィールド詳細は canonical `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §3 を参照する。

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
| `levelHistory`            | `levels`                                | 静的オブジェクト（レベル番号文字列キー）— 詳細は §3.4 |
| -                         | `metrics.average_satisfaction`          | v1 固有（v2 に対応フィールドなし） |

### 3.1 正本方言（2026-04-21 確定）

**snake_case v1 が正本方言**。UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001（Phase 1-12 完了）で統一実施済み。

- 全スキルの EVALS.json（`.claude/skills/` + `.agents/skills/`）が snake_case v1 に統一された
- camelCase v2 系は **legacy 方言**として本ファイルでのみ参照（既存 consumer への後方互換記録目的）
- 統一実施記録: `docs/30-workflows/completed-tasks/task-evals-schema-dialect-unification-001.md`
- タスク仕様書: `docs/30-workflows/UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001/index.md`

### 3.2 方言検出・移行時の注意点

- NaN 伝播リスク: 同一スキル内で camel/snake を併用すると `totalUsageCount + total_usage_count` のような集計ミスで NaN が伝播する可能性あり
- 移行時は `schema-change-guide.md` §6-§8 の手順（dual root 同時更新 / consumer 逐次確認 / JSON parse 検証）に従う

### 3.3 v1 固有フィールド完全定義

v1 系固有フィールドのうち、§3 対照テーブルで詳細が未定義のフィールドを完全型テーブルで補完する。

| フィールド | 型 | 範囲 / 形式 | 必須/任意 | 意味 | 主 writer | 主 reader |
| --- | --- | --- | --- | --- | --- | --- |
| `metrics.average_satisfaction` | number | 観測値: `0`, `4.5`（固定値域は断定しない） | optional | 満足度スコアの集計値（推定）— v1 固有 | なし（現行 script 側の write 実装なし） | なし（現行 script 側の read 実装なし） |

#### `metrics.average_satisfaction` 詳細

- **型**: `number`（浮動小数点）
- **観測値**: `0`（skill-creator、未評価相当）、`4.5`（aiworkflow-requirements、評価済み相当）
- **値域**: グローバル固定値域は断定しない。上記観測値を根拠として 0 以上であることは確認済み
- **意味**: 満足度スコアの集計値。実データから意味を確定することは困難なため「推定」として記載する
- **v1 固有**: v2 スキーマには対応フィールドが現時点では確認されていない
- **現行 consumer 状態**: consumer audit 時点では read/write とも 0 件で、JSON 上に残存するデッドフィールド候補として扱う
- **非保持スキル**: `skill-fixture-runner` は `metrics.average_satisfaction` を保持しない（フィールドキー自体が存在しない）

### 3.4 `levels` フィールドの構造

#### 3.4.1 全体の型

`levels` は**レベル番号文字列キー**を持つ静的オブジェクトである（§3 対照テーブルも参照）。

```json
{
  "levels": {
    "1": { "name": "Beginner", "requirements": { "min_usage_count": 0, "min_success_rate": 0 } },
    "2": { "name": "Intermediate", "requirements": { "min_usage_count": 5, "min_success_rate": 0.6 } },
    "3": { "name": "Advanced", "requirements": { "min_usage_count": 15, "min_success_rate": 0.75 } },
    "4": { "name": "Expert", "requirements": { "min_usage_count": 30, "min_success_rate": 0.85 } }
  }
}
```

#### 3.4.2 `LevelEntry` 型定義

| フィールド | 型 | 必須/任意 | 根拠 |
| --- | --- | --- | --- |
| `name` | string | required | skill-creator / aiworkflow-requirements 両方で保持 |
| `description` | string | optional | aiworkflow-requirements のみ保持（skill-creator には存在しない） |
| `unlocked` | boolean | optional | aiworkflow-requirements のみ保持 |
| `requirements.min_usage_count` | number | required | 両スキルで保持（0 以上） |
| `requirements.min_success_rate` | number（0..1） | required | 両スキルで保持 |

#### 3.4.3 非保持スキル

`skill-fixture-runner` は `levels` フィールドを保持しない（フィールドキー自体が存在しない）。`null` や空オブジェクトとは区別する。

#### 3.4.4 writer / reader

- writer: `init_skill.js`（初期化時に静的定義として設定）/ `log_usage.js`（更新）
- reader: `select_skill.js`（レベル昇格判定）/ analytics 処理

#### 3.4.5 `levelHistory`（v2）との比較

`levelHistory`（camelCase v2）は配列型のレベル変動**履歴**であり、`levels`（snake_case v1）はレベル定義の静的オブジェクトである。両者は意味論的に比較可能だが、構造・用途・writer コンテキストが異なるため直接等価とはみなさない。v1/v2 の正本断定については §3.1 を参照すること。

---

## 4. consumer 一覧

consumer 全集合と 9 列表（`path` / `root` / `consumer_type` / `operation` / `read_fields` / `write_fields` / `dynamic_path` / `notes` / `source_evidence`）は canonical 成果物を参照する。

- 正本: [`docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`](../../../../docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md)
- フィールド別突合: [`docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`](../../../../docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md)
- dual root 差分: [`docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`](../../../../docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md)

`references/arch-electron-services-details-part1.md` の `OTHER_FILES` 定数表（2 列表記）は consumer サマリ（path / 役割）のみを提供する。完全な 9 列表を参照する場合は上記 canonical 成果物を優先する。

### 4.1 consumer カテゴリ（参考）

| カテゴリ        | 例                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------ |
| reader（静的）  | `SkillScanner` (`apps/desktop/src/main/services/skill/SkillScanner.ts`) OTHER_FILES 定数         |
| reader（動的）  | `select_skill.js`（スキル選定スコアリング）                                                       |
| writer          | `log_usage.js`（各スキル scripts/ 配下）                                                           |
| mixed / runner  | `skill-fixture-runner/scripts/*` (fixture 層、本タスクでは非実行 consumer として記録)             |
| validator       | `skill-fixture-runner/scripts/validate-evals.js`（L1/L2/L3 / allowlist 6件 / dual-root 比較）    |

---

## 5. schema 変更手順

schema 変更時は dual root 同時更新・consumer 逐次確認・JSON parse 検証が必須。詳細手順は canonical を参照。

- 正本: [`docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`](../../../../docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md)

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

| フィールド                                                      | 型                       | 意味                                                                           |
| --------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `qualityInsights.patternAdoptionRate`                           | number (0.0〜1.0)        | parent-skill pattern の採用率                                                  |
| `qualityInsights.coverageTargetHitRate`                         | number (0.0〜1.0)        | coverage target 達成率                                                         |
| `qualityInsights.unassignedTaskDetectionRate`                   | number (0.0〜1.0)        | 未タスク検出率（Phase 12 Task 4 件数 / 全 Phase 発見件数）                     |
| `qualityInsights.notes`                                         | string                   | 運用者メモ（フリーテキスト・Phase 12 closeout 時に追記）                       |
| `qualityInsights.taskMetrics`                                   | Record\<string, object\> | 完了タスクIDをキーとした詳細メトリクス辞書（例: `"TASK-8A": {...}`）           |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | number (整数 1〜13)      | そのタスクで完了した Phase 数                                                  |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | number (整数 0以上)      | 総テスト数（docs-only タスクの場合は 0 を記録）                                |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | number (0.0〜100.0)      | 平均コードカバレッジ（%）（docs-only タスクの場合は 0 を記録）                 |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number (整数 0以上)      | そのタスクで更新したシステム仕様書のファイル数                                 |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | number (整数 0以上)      | そのタスクの Phase 12 で検出・記録した未タスク数                               |

### 6.1 運用ルール

- **writer**: Phase 12 closeout を実行するタスク担当者（人間）
- **更新タイミング**: 各タスクの Phase 12 closeout 時（`taskMetrics` に 1 エントリ追加、rate 系フィールドを再計算）
- **運用責任**: タスク担当者。自動更新スクリプトは現状 0 件（将来は `log_usage.js` 拡張で自動化予定）
- 手動更新時は commit メッセージに `chore(evals): qualityInsights update` を付与する
- validator は導入済みだが、`qualityInsights.*` の詳細妥当性までは未検証
- `taskMetrics.{TASK_ID}` エントリは完了タスクごとに追記し、削除しない
- validator 化は UNASSIGNED-EVALS-VALIDATOR-GUARD-001 の設計検討後に実施する（手動値の書式検証）
- reader 0 件である状態も「既知の制約」として §7 に明記

---

## 7. 既知の制約（validator=1 件、ただし完全ではない）

本スキーマには、**構造体フィールドを機械的に検証する validator が 1 件存在する**。

### 7.1 事実

- `skill-fixture-runner/scripts/validate-evals.js` は L1 JSON パース / L2 top-level 必須キー / L3 dual root 一致を検証する
- `skill-fixture-runner/scripts/validate-skill-structure.js` は引き続き EVALS.json の存在性のみを扱う
- `validate-schemas.js` は `schemas/*.json` 管下のみを扱い、EVALS.json 自体は扱わない

### 7.2 影響

- `skillName/skill_name`・`currentLevel/current_level`・`metrics` の欠落は自動検出できる
- `qualityInsights.*` や `phaseMetrics.*` の詳細妥当性はまだ自動検出できない
- 方言統一時の破壊的変更は依然として手動検証と consumer 監査に依存する

### 7.3 代替の手動検証運用

- schema 変更時は §5.1 の 7 ステップを必ず実施
- `schema-change-guide.md` §7 の 3 カテゴリ手動検証（静的参照 / dual root 一致 / JSON パース）は引き続き primary guard
- `validate-evals.js --all-skills --check-dual-root` を close-out 時の必須 replay に追加する

### 7.4 残課題

- `qualityInsights.*` の詳細検証
- `phaseMetrics.*` / `levelCriteria.*` の構造検証
- 方言統一後の strict default 化
- CI 必須チェック化の是非判断

---

## 8. 変更履歴

| Date       | 変更内容                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-04-21 | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 close-out sync: `validate-evals.js` 導入に合わせ、validator=0 件表記を validator=1 件へ更新。L1/L2/L3 の対象範囲と残制約を明文化。 |
| 2026-04-21 | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 Phase 1-12 完了に伴う更新。§2 を legacy スキーマに改訂、§3.1 を snake_case v1 正本確定に更新。全スキル EVALS.json（`.claude/skills/` + `.agents/skills/`）が snake_case v1 に統一済み。 |
| 2026-04-21 | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 close-out sync: `validate-evals.js` 導入に合わせ、validator=0 件表記を validator=1 件へ更新。L1/L2/L3 の対象範囲と残制約を明文化。 |
| 2026-04-19 | 初版作成。TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 Task 2 `system-spec-update-summary.md` §4.1.1 / §4.2.1 / §4.3.1 のドラフトを正本化。camelCase v2 / snake_case v1 / qualityInsights / validator=0 件 を明示。 |
| 2026-04-21 | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 Phase 5 で §3 を追補。`levels` 行の「配列構造」誤記を「静的オブジェクト」に修正。§3.3（`average_satisfaction` 独立定義）/ §3.4（`levels.{N}` ツリー構造定義）を新設。 |
| 2026-04-21 | §6 update。UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 により `qualityInsights.taskMetrics` 構造を実際の EVALS.json 実装（タスクIDキー辞書）に修正。flat フィールド（`createdCount` 等）を削除し `{TASK_ID}.completedPhases` 等に置換。§6.1 に writer・更新タイミング・運用責任を追記。 |
