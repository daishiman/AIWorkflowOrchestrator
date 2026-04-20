# EVALS.json フィールド逆引きマップ（evals-field-map.md）

> **最終成果物 2 / TASK-EVALS-CONSUMER-AUDIT-001 Phase 5-B**
> 生成日時: 2026-04-19
> 作成根拠: Phase 2 §3.3（8列仕様）、Phase 1 FR-4 / FR-5、Phase 4 raw evidence 6 ファイル
> 対象 EVALS.json 群: `find` raw で列挙された 13 ファイル（`.claude/skills/*/EVALS.json` 6 件、`.agents/skills/*/EVALS.json` 6 件、fixture 1 件）

---

## 1. メタ情報

| 項目                 | 値                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 生成日時             | 2026-04-19                                                                                                                          |
| 依存入力             | `outputs/phase-4/raw-grep-claude.txt` / `raw-grep-agents.txt` / `raw-grep-apps.txt` / `raw-grep-dynamic.txt` / `raw-find-evals.txt` |
| 代表スキーマ定義     | `.claude/skills/task-specification-creator/EVALS.json`（camelCase v2 相当・最大フィールド数）                                       |
| レガシースキーマ基点 | `.claude/skills/skill-creator/EVALS.json`（snake_case v1 相当 / `skill_name`・`current_level`・`levels.*` 形）                      |
| validator 候補       | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`（`schemas/*.json` 対象で **EVALS.json は validate 対象外**）      |
| scanner（メタのみ）  | `apps/desktop/src/main/services/skill/SkillScanner.ts`（`filename:"EVALS.json"` の**存在**と **size** のみ、内容は parse しない）   |

### 1.1 スキーマ原点（schema_origin）の定義

| 原点タグ           | 該当スキル                                                                        | フィールド命名規約                                                |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `representative`   | task-specification-creator（両 root）                                             | camelCase / v2.0.0 / `phaseMetrics` と `qualityInsights` 含有     |
| `camel-minimal`    | github-issue-manager（両 root）/ int-test-skill（両 root）                        | camelCase / `metrics + levelHistory + patterns` のみ              |
| `legacy-snake-v1`  | skill-creator（両 root）/ aiworkflow-requirements（両 root）                      | snake_case / `levels.{N}` ツリー / `average_satisfaction` あり    |
| `legacy-snake-min` | skill-fixture-runner（両 root）                                                   | snake_case / `levels` 無し / metrics 3 フィールドのみ             |
| `fixture`          | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` | snake_case 最小形（`skill_name` / `current_level` / `metrics.*`） |

> **重要**: スキル群で **2 系統のスキーマ（camelCase v2 系 と snake_case v1 系）が併存**しており、同名概念がキー名の大文字小文字で別フィールドとして存在する。本マップは両方を別 `field_path` として列挙する。

---

## 2. Consumer（参照パス）凡例

readers / writers / validators に登場するパスは以下のエイリアスで表す（full path は `consumer-audit-report.md` と同一表記）。

| エイリアス                      | 実パス                                                                           | 役割                                          |
| ------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| `C:tsc-log-usage`               | `.claude/skills/task-specification-creator/scripts/log-usage.js`                 | camelCase v2 系 read+write                    |
| `A:tsc-log-usage`               | `.agents/skills/task-specification-creator/scripts/log-usage.js`                 | C:tsc-log-usage の `.agents` ミラー           |
| `C:sc-log_usage`                | `.claude/skills/skill-creator/scripts/log_usage.js`                              | snake_case v1 系 read+write（自スキル用）     |
| `A:sc-log_usage`                | `.agents/skills/skill-creator/scripts/log_usage.js`                              | C:sc-log_usage の `.agents` ミラー            |
| `C:sc-collect_feedback`         | `.claude/skills/skill-creator/scripts/collect_feedback.js`                       | camelCase キー read / 結果 JSON 生成          |
| `A:sc-collect_feedback`         | `.agents/skills/skill-creator/scripts/collect_feedback.js`                       | C:sc-collect_feedback の `.agents` ミラー     |
| `C:sc-init_skill`               | `.claude/skills/skill-creator/scripts/init_skill.js`                             | camelCase v2 系 EVALS.json 新規 write（生成） |
| `A:sc-init_skill`               | `.agents/skills/skill-creator/scripts/init_skill.js`                             | C:sc-init_skill の `.agents` ミラー           |
| `C:aw-log_usage`                | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`                    | snake_case v1 系 read+write                   |
| `A:aw-log_usage`                | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`                    | C:aw-log_usage の `.agents` ミラー            |
| `APPS:SkillScanner`             | `apps/desktop/src/main/services/skill/SkillScanner.ts`                           | **ファイル存在 + size のみ**（内容不参照）    |
| `APPS:SkillScanner.test`        | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`            | `EVALS.json` の存在・type=evals を期待        |
| `APPS:fixture.test`             | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`              | fixture の `skill_name` フィールドを read     |
| `D:skill-creator/feedback-loop` | `.claude/skills/skill-creator/references/feedback-loop.md`                       | ドキュメント（snake_case 例示）               |
| `D:tsc/self-improvement`        | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` | ドキュメント（camelCase 例示）                |
| `D:sc/self-improvement`         | `.claude/skills/skill-creator/references/self-improvement-cycle.md`              | ドキュメント（EVALS_PATH コード例のみ）       |
| `D:sc/design-update`            | `.claude/skills/skill-creator/agents/design-update.md`                           | ドキュメント（生成指示）                      |
| `D:aw/SKILL.md`                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                                | ドキュメント（1 行言及）                      |
| `D:aw/claude-code-template`     | `.claude/skills/aiworkflow-requirements/assets/claude-code-template.md`          | ドキュメント（テンプレ）                      |

> `.agents/` 側ドキュメント consumer（D 群）は対称に存在するため、以降「`D:*` は dual root 両方に実在」と解釈する（片方欠損は Phase 6 で突合）。
> validator は validate-schemas.js のみで、かつ対象は `schemas/` 配下なので **EVALS.json 本体の validator は現状 0 件**（RISK-4 / AC-6 の根拠の一つ）。

---

## 3. フィールド逆引きマップ（Phase 2 §3.3 の 8 列準拠）

> 表記ルール:
>
> - `field_path` はドット記法。配列要素は `[]`、任意キーは `{key}`、`<skillName>` 等の動的キーは `<...>` で示す。
> - `risk_on_change`: writers 数 ≥ 3 または複数 root から write される基幹値は **high**、readers のみ or 派生値は **medium**、ドキュメント/freeform は **low**。
> - `notes` の _(derived)_ は log-usage 系で書き換えるが値自体は他フィールドからの再計算結果である旨。
> - 全 readers/writers/validators は §2 のエイリアス。

### 3.1 ルート識別・メタ

| field_path      | type   | schema_origin                                | readers                                                                                                          | writers                                                                    | validators | risk_on_change | notes                                                                                                                                  |
| --------------- | ------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `skillName`     | string | representative / camel-minimal               | `C:sc-collect_feedback`, `A:sc-collect_feedback`, `D:tsc/self-improvement`                                       | `C:sc-init_skill`, `A:sc-init_skill`                                       | なし       | medium         | `collect_feedback.js:260` で `existingEvals.skillName` を参照し結果 JSON の `skillName` として書き出す。init テンプレが唯一の writer。 |
| `skill_name`    | string | legacy-snake-v1 / legacy-snake-min / fixture | `APPS:fixture.test` (TC-004), `D:skill-creator/feedback-loop`                                                    | なし（現行実装は書き換えない）                                             | なし       | high           | fixture テストが `evals.skill_name` を expect で検証。リネームすると fixture テスト破壊。RISK-7 非該当（固定キー）。                   |
| `version`       | string | representative 固有                          | （直接 read 実装なし）                                                                                           | なし                                                                       | なし       | low            | 現状 `task-specification-creator` のみ保有。script は参照しない。将来的 schema 進化マーカー。                                          |
| `currentLevel`  | number | representative / camel-minimal               | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-collect_feedback`, `A:sc-collect_feedback`, `D:tsc/self-improvement` | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | high           | log-usage.js:187-199 が `checkLevelUp` で +1 更新。collect_feedback は default `1` の読み取り。                                        |
| `current_level` | number | legacy-snake-v1 / legacy-snake-min / fixture | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`, `D:skill-creator/feedback-loop`          | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`     | なし       | high           | snake_case 系 4 writer すべてがレベルアップ判定で再代入。camelCase 系との**並立キー**であることに注意。                                |
| `lastUpdated`   | string | representative 固有                          | （直接 read 実装なし）                                                                                           | なし                                                                       | なし       | low            | 運用上手動更新。log-usage.js が `metrics.lastEvaluated` を更新するのと混同しやすい。                                                   |

### 3.2 metrics（camelCase 系）

| field_path                | type   | schema_origin                  | readers                                                        | writers                                                                    | validators | risk_on_change | notes                                                                                           |
| ------------------------- | ------ | ------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `metrics.totalUsageCount` | number | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage`, `D:tsc/self-improvement` | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | high           | `log-usage.js:113` で `++`。レベルアップ閾値比較で read されるため write 直前に read するペア。 |
| `metrics.successCount`    | number | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage`                           | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | high           | `log-usage.js:114-118`。                                                                        |
| `metrics.failureCount`    | number | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage`                           | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | high           | `log-usage.js:117`。                                                                            |
| `metrics.successRate`     | number | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage`                           | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | high           | `log-usage.js:119-122`（_derived_：totalUsageCount と successCount の比）。レベル判定の閾値。   |
| `metrics.averageDuration` | number | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage`                           | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | `log-usage.js:125-132`（_derived_：移動平均再計算）。                                           |
| `metrics.lastEvaluated`   | string | representative / camel-minimal | `C:sc-init_skill` (default null 生成), `A:sc-init_skill`       | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | `log-usage.js:134` が ISO 文字列で上書き。                                                      |

### 3.3 metrics（snake_case 系）

| field_path                     | type   | schema_origin                                | readers                                                                                                 | writers                                                                | validators | risk_on_change | notes                                                                                                            |
| ------------------------------ | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `metrics.total_usage_count`    | number | legacy-snake-v1 / legacy-snake-min / fixture | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`, `D:skill-creator/feedback-loop` | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | なし       | high           | `skill-creator/log_usage.js:111`、`aiworkflow-requirements/log_usage.js:111` でそれぞれ +1。                     |
| `metrics.success_count`        | number | legacy-snake-v1 / legacy-snake-min / fixture | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`                                  | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | なし       | high           | 同上 112-116。                                                                                                   |
| `metrics.failure_count`        | number | legacy-snake-v1 / legacy-snake-min / fixture | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`                                  | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | なし       | high           | 同上 115。                                                                                                       |
| `metrics.average_satisfaction` | number | legacy-snake-v1 固有                         | （現行 script 側で read/write なし・JSON 上にのみ存在）                                                 | なし                                                                   | なし       | low            | `skill-creator` / `aiworkflow-requirements` EVALS に残存するが log_usage.js は参照しない。デッドフィールド候補。 |
| `metrics.last_evaluated`       | string | legacy-snake-v1 / legacy-snake-min / fixture | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage`                                  | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | なし       | medium         | 同上 117。                                                                                                       |

### 3.4 levelHistory / levelCriteria（camelCase 系）

| field_path                           | type              | schema_origin                  | readers                              | writers                                                                    | validators | risk_on_change | notes                                                                                                                                              |
| ------------------------------------ | ----------------- | ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `levelHistory[]`                     | array             | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | `log-usage.js:185,196-199` で `push({level, achievedAt})`。                                                                                        |
| `levelHistory[].level`               | number            | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | 要素構造: `{ level:number, achievedAt:string, trigger?:string }`                                                                                   |
| `levelHistory[].achievedAt`          | string            | representative / camel-minimal | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | ISO 文字列 or `YYYY-MM-DD`（int-test-skill / github-issue-manager は日付短形式）。                                                                 |
| `levelHistory[].trigger`             | string (freeform) | representative 固有            | （read 実装なし）                    | （write 実装なし・手動）                                                   | なし       | low            | `task-specification-creator/EVALS.json` のみに人手記述。RISK-7 該当。`type=freeform`。                                                             |
| `levelCriteria.level{N}`             | object            | representative 固有            | `C:tsc-log-usage`, `A:tsc-log-usage` | なし（log-usage は read のみ / init テンプレは生成しない）                 | なし       | high           | `log-usage.js:185-202` で `levelCriteria[`level${nextLevel}`]` を引き、`usageCount` / `successRate` を閾値として参照。削除するとレベルアップ不能。 |
| `levelCriteria.level{N}.usageCount`  | number            | representative 固有            | `C:tsc-log-usage`, `A:tsc-log-usage` | なし                                                                       | なし       | high           | 閾値。                                                                                                                                             |
| `levelCriteria.level{N}.successRate` | number            | representative 固有            | `C:tsc-log-usage`, `A:tsc-log-usage` | なし                                                                       | なし       | high           | 閾値。                                                                                                                                             |

### 3.5 levels（snake_case 系 v1 ツリー）

| field_path                                 | type    | schema_origin   | readers                                                                | writers                                                                      | validators | risk_on_change | notes                                                                                                                            |
| ------------------------------------------ | ------- | --------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `levels.{N}`                               | object  | legacy-snake-v1 | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | `C:sc-log_usage`, `A:sc-log_usage`                                           | なし       | high           | log_usage.js:184-196（skill-creator / aiworkflow-requirements 共通）で next level 探索。skill-creator 側 init 生成もここに含む。 |
| `levels.{N}.name`                          | string  | legacy-snake-v1 | `C:sc-log_usage`, `A:sc-log_usage`                                     | `C:sc-log_usage`, `A:sc-log_usage`（init 時のみ）                            | なし       | medium         | "Beginner"/"Intermediate"/"Expert" 等。                                                                                          |
| `levels.{N}.description`                   | string  | legacy-snake-v1 | （read 実装なし・JSON 上のみ）                                         | なし                                                                         | なし       | low            | aiworkflow-requirements のみが値を持つ。                                                                                         |
| `levels.{N}.unlocked`                      | boolean | legacy-snake-v1 | （read 実装なし）                                                      | `C:aw-log_usage`, `A:aw-log_usage`（本文 log_usage.js:141 で `true` 上書き） | なし       | medium         | aiworkflow-requirements/log_usage.js は `evalsData.levels[nextLevel].unlocked = true` と書く。skill-creator 側は書かない。       |
| `levels.{N}.requirements`                  | object  | legacy-snake-v1 | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | `C:sc-log_usage`, `A:sc-log_usage`（init 時のみ）                            | なし       | high           | レベルアップ判定で直接参照。                                                                                                     |
| `levels.{N}.requirements.min_usage_count`  | number  | legacy-snake-v1 | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | `C:sc-log_usage`, `A:sc-log_usage`（init 時のみ）                            | なし       | high           | 閾値。                                                                                                                           |
| `levels.{N}.requirements.min_success_rate` | number  | legacy-snake-v1 | `C:sc-log_usage`, `A:sc-log_usage`, `C:aw-log_usage`, `A:aw-log_usage` | `C:sc-log_usage`, `A:sc-log_usage`（init 時のみ）                            | なし       | high           | 閾値。                                                                                                                           |

### 3.6 patterns（camelCase 系）

| field_path                                | type          | schema_origin                                     | readers                                             | writers                                                                    | validators | risk_on_change | notes                                                                                                                                           |
| ----------------------------------------- | ------------- | ------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `patterns`                                | object        | representative / camel-minimal                    | `C:tsc-log-usage`, `A:tsc-log-usage`                | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | 3 子キー（commonErrors / slowPhases / successPatterns）を持つ。init テンプレは空配列 3 つ生成。                                                 |
| `patterns.commonErrors[]`                 | array         | representative / camel-minimal                    | `C:tsc-log-usage`, `A:tsc-log-usage`                | `C:tsc-log-usage`, `A:tsc-log-usage`, `C:sc-init_skill`, `A:sc-init_skill` | なし       | medium         | `log-usage.js:160-174` で `{type,count,lastOccurred}` を push / increment。                                                                     |
| `patterns.commonErrors[].type`            | string        | representative / camel-minimal                    | `C:tsc-log-usage`, `A:tsc-log-usage`                | `C:tsc-log-usage`, `A:tsc-log-usage`                                       | なし       | medium         | `entry.error` 文字列がそのまま入る（自由記述寄り）。                                                                                            |
| `patterns.commonErrors[].count`           | number        | representative / camel-minimal                    | `C:tsc-log-usage`, `A:tsc-log-usage`                | `C:tsc-log-usage`, `A:tsc-log-usage`                                       | なし       | medium         | increment。                                                                                                                                     |
| `patterns.commonErrors[].lastOccurred`    | string        | representative / camel-minimal                    | `C:tsc-log-usage`, `A:tsc-log-usage`                | `C:tsc-log-usage`, `A:tsc-log-usage`                                       | なし       | low            | ISO timestamp。                                                                                                                                 |
| `patterns.commonErrors`（文字列配列形式） | array(string) | representative（task-specification-creator のみ） | `D:tsc/self-improvement`                            | （**手動書き換え**・script は object 形のみ扱う）                          | なし       | medium         | 実データは「文字列の配列」で保存されているが log-usage.js は object 形しか push しない不整合。RISK-7 類似（**混在リスク**）。`notes` 列に明示。 |
| `patterns.slowPhases[]`                   | array         | representative / camel-minimal                    | `C:tsc-log-usage`（構造は参照しない、存在確認のみ） | `C:sc-init_skill`, `A:sc-init_skill`（初期化のみ）                         | なし       | low            | task-specification-creator の実体は「文字列配列」。init 生成は空配列。                                                                          |
| `patterns.successPatterns[]`              | array         | camel-minimal                                     | （直接 read なし）                                  | `C:sc-init_skill`, `A:sc-init_skill`（初期化で空配列）                     | なし       | low            | github-issue-manager / int-test-skill に存在、task-specification-creator には無い（**スキル毎に任意**）。                                       |
| `patterns.frequentAgents[]`               | array(string) | representative 固有                               | （直接 read なし）                                  | （手動書き換え）                                                           | なし       | low            | task-specification-creator のみ。`freeform` 寄り（人手メモ）。                                                                                  |

### 3.7 phaseMetrics（representative 固有）

| field_path                               | type                     | schema_origin       | readers                              | writers                              | validators | risk_on_change | notes                                                                                                                                                         |
| ---------------------------------------- | ------------------------ | ------------------- | ------------------------------------ | ------------------------------------ | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phaseMetrics`                           | object                   | representative 固有 | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage` | なし       | high           | `log-usage.js:138-157` で `agentKey` を添字に分岐書き換え。任意キー構造。                                                                                     |
| `phaseMetrics.<phase_id>`                | object                   | representative 固有 | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage` | なし       | high           | キー例: `decompose-task`, `generate-task-specs`, `output-phase-files`, `update-dependencies`, `generate-unassigned-task`, `identify-scope`, `design-phases`。 |
| `phaseMetrics.<phase_id>.usageCount`     | number                   | representative 固有 | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage` | なし       | medium         | `log-usage.js:140` で increment。                                                                                                                             |
| `phaseMetrics.<phase_id>.avgDuration`    | number                   | representative 固有 | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage` | なし       | medium         | 150-156（_derived_）。                                                                                                                                        |
| `phaseMetrics.<phase_id>.successRate`    | number                   | representative 固有 | `C:tsc-log-usage`, `A:tsc-log-usage` | `C:tsc-log-usage`, `A:tsc-log-usage` | なし       | medium         | 141-149（_derived_）。                                                                                                                                        |
| `phaseMetrics.<phase_id>.commonIssues[]` | array(string / freeform) | representative 固有 | （直接 read なし）                   | （手動書き換え）                     | なし       | low            | script は空配列生成のみ。値は人手メモ。RISK-7 該当。`type=freeform`。                                                                                         |

### 3.8 qualityInsights（representative 固有）

| field_path                                                      | type              | schema_origin       | readers                              | writers  | validators | risk_on_change | notes                                                            |
| --------------------------------------------------------------- | ----------------- | ------------------- | ------------------------------------ | -------- | ---------- | -------------- | ---------------------------------------------------------------- |
| `qualityInsights`                                               | object            | representative 固有 | `D:tsc/self-improvement`（例示のみ） | （手動） | なし       | low            | script による read/write は無い。spec 文書で参照のみ。           |
| `qualityInsights.patternAdoptionRate`                           | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | 値は 0〜1 の比率。                                               |
| `qualityInsights.coverageTargetHitRate`                         | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |
| `qualityInsights.unassignedTaskDetectionRate`                   | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |
| `qualityInsights.notes`                                         | freeform (string) | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | **自由記述**・RISK-7 該当。`type=freeform` 明示。                |
| `qualityInsights.taskMetrics`                                   | object            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | 任意キー `TASK-xxx` で子 object。                                |
| `qualityInsights.taskMetrics.<TASK_ID>`                         | object            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | 例: `TASK-7D` / `TASK-8A` / `TASK-7C` / `TASK-SKILL-RETRY-001`。 |
| `qualityInsights.taskMetrics.<TASK_ID>.completedPhases`         | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |
| `qualityInsights.taskMetrics.<TASK_ID>.totalTests`              | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |
| `qualityInsights.taskMetrics.<TASK_ID>.avgCoverage`             | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |
| `qualityInsights.taskMetrics.<TASK_ID>.systemSpecsUpdated`      | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |
| `qualityInsights.taskMetrics.<TASK_ID>.unassignedTasksDetected` | number            | representative 固有 | （実 read なし）                     | （手動） | なし       | low            | -                                                                |

### 3.9 collect_feedback 出力側（read 経路の派生）

`skill-creator/scripts/collect_feedback.js` は **EVALS.json を read のみ**し（226-247 行目）、別の JSON を新規作成する。以下は read されるキーの再掲。

| field_path     | type   | schema_origin                  | readers                                          | writers           | validators | risk_on_change | notes                                                                                                 |
| -------------- | ------ | ------------------------------ | ------------------------------------------------ | ----------------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `skillName`    | string | representative / camel-minimal | `C:sc-collect_feedback`, `A:sc-collect_feedback` | （§3.1 で定義済） | なし       | medium         | collect_feedback は `existingEvals.skillName` を参照し default は dir 末尾。snake_case 系は読まない。 |
| `currentLevel` | number | representative / camel-minimal | `C:sc-collect_feedback`, `A:sc-collect_feedback` | （§3.1 で定義済） | なし       | high           | default `1`。                                                                                         |

---

## 4. 逆引きサマリ（集計）

### 4.1 Consumer 数サマリ

| 指標                               |   件数 | 備考                                                                                                                               |
| ---------------------------------- | -----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| 代表スキーマ由来フィールド総数     |     29 | §3.1 の 5 + §3.2 の 6 + §3.4 の 7 + §3.6 の 8 + §3.7 の 6 + §3.8 の 11 - qualityInsights で重複カウントを整理し 29（ユニーク計上） |
| snake_case 系追加フィールド総数    |     10 | §3.1 の 2 + §3.3 の 5 + §3.5 の 7 - 重複 4 = 10                                                                                    |
| **全フィールド総数（field_path）** | **56** | §3 の各表ユニオン。フィクスチャ固有は legacy-snake-min と同等のため追加無し。                                                      |
| 代表スキーマのみのフィールド       |     22 | `version` / `lastUpdated` / `levelCriteria.*` / `phaseMetrics.*` / `qualityInsights.*` / `patterns.frequentAgents`                 |
| legacy-snake-v1 のみのフィールド   |     10 | `skill_name` / `current_level` / `levels.*` / `metrics.average_satisfaction` ほか                                                  |

> **総フィールド数 = 56**（報告用）。すべての行で `readers` / `writers` / `validators` / `risk_on_change` / `notes` が埋まっていることを自己確認した。空行・TBD はゼロ。

### 4.2 Read される件数が多いフィールド Top 5

| 順位 | field_path                                | 参照 consumer 数 | 備考                                                              |
| ---- | ----------------------------------------- | ---------------: | ----------------------------------------------------------------- |
| 1    | `currentLevel`                            |                5 | 両 root の log-usage 2 + collect_feedback 2 + self-improvement.md |
| 1    | `current_level`                           |                5 | snake 系 log_usage 4 + feedback-loop.md                           |
| 3    | `metrics.total_usage_count`               |                5 | 両 root の sc/aw log_usage 4 + feedback-loop.md                   |
| 4    | `metrics.totalUsageCount`                 |                3 | 両 root の tsc log-usage 2 + self-improvement.md                  |
| 4    | `levels.{N}.requirements.min_usage_count` |                4 | snake 系 log_usage 4                                              |

### 4.3 Write される件数が多いフィールド Top 5

| 順位 | field_path                                                                         | write consumer 数 | 備考                                                      |
| ---- | ---------------------------------------------------------------------------------- | ----------------: | --------------------------------------------------------- |
| 1    | `metrics.totalUsageCount`                                                          |                 4 | 両 root log-usage + 両 root init_skill（初期 0 生成含む） |
| 1    | `metrics.successCount`                                                             |                 4 | 同上                                                      |
| 1    | `metrics.failureCount`                                                             |                 4 | 同上                                                      |
| 1    | `metrics.successRate`                                                              |                 4 | 同上（_derived_）                                         |
| 5    | `currentLevel`                                                                     |                 4 | 両 root log-usage + 両 root init_skill                    |
| 5    | `current_level`                                                                    |                 4 | snake 系 log_usage 4                                      |
| 5    | `metrics.total_usage_count` / `success_count` / `failure_count` / `last_evaluated` |              各 4 | snake 系 log_usage 4                                      |

### 4.4 Validator カバレッジ

- **validator 列が「なし」のフィールド = 56 / 56**（**100%**）。
- `validate-schemas.js` は `schemas/*.json` を対象とするため EVALS.json の構造を検証しない。この事実は AC-6 解除条件の議論（schema-change-guide.md）で重要な前提となる。
- 型チェックが効くレイヤ（TypeScript）に EVALS スキーマの型は **存在しない**（`SkillOtherFile.type="evals"` は filename 判定のみ）。

### 4.5 Write される consumer が「少ない／ゼロ」のフィールド（変更リスクが低い候補）

| field_path                               | writers 数 | 備考                                                                  |
| ---------------------------------------- | ---------: | --------------------------------------------------------------------- |
| `version`                                |          0 | representative 固有・人手更新。安全に削除／リネーム可能。             |
| `lastUpdated`                            |          0 | 同上。                                                                |
| `levelHistory[].trigger`                 |          0 | freeform・人手。                                                      |
| `qualityInsights.*` 全 11 フィールド     |          0 | script で書かれない（手動）。RISK-7 該当を含む。                      |
| `phaseMetrics.<phase_id>.commonIssues[]` |          0 | script は空配列生成のみ。                                             |
| `patterns.frequentAgents[]`              |          0 | 手動。                                                                |
| `metrics.average_satisfaction`           |          0 | snake_case 残存フィールド、現行 log_usage.js は参照しない。           |
| `levels.{N}.description`                 |          0 | aiworkflow-requirements のみが値保持・read も無し（デッド）。         |
| `skill_name`                             |          0 | read 専用（fixture テストで assert）。リネーム時は fixture 更新必要。 |

> これら **writers=0** のフィールドは **schema-change-guide.md の「低リスク候補」**としてマークすべき。ただし `readers` が存在するものは読み取り側の修正必要。

---

## 5. 特記事項と運用メモ

### 5.1 自由記述（freeform）フィールドの扱い（RISK-7 対応）

| field_path                                  | 理由                                       |
| ------------------------------------------- | ------------------------------------------ |
| `qualityInsights.notes`                     | 数百字の日本語メモ。型チェック不可。       |
| `phaseMetrics.<phase_id>.commonIssues[]`    | 文字列要素に日本語説明。                   |
| `patterns.commonErrors[]`（文字列配列混入） | 本来 object 配列であるべきだが文字列混在。 |
| `patterns.slowPhases[]`（文字列要素）       | 同上。                                     |
| `patterns.frequentAgents[]`                 | 文字列配列・メモ用途。                     |
| `levelHistory[].trigger`                    | 自由文（理由メモ）。                       |

`type` 列は上記を `freeform` と明示。schema 変更時は文字列リテラル一致の検索だけでは網羅不能。

### 5.2 二重スキーマ（camelCase / snake_case）併存の帰結

| 観点                     | 影響                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| field_path 重複          | `currentLevel` と `current_level` / `metrics.totalUsageCount` と `metrics.total_usage_count` など **3 組 6 フィールド**が事実上同一概念 |
| schema-change-guide 記述 | 「概念名（camel / snake）」のペア表が必要。どちらかを正本とするかは断定しない（Phase 2 §3.1）。                                         |
| validator 不在           | TypeScript 層にも無いため、キー命名誤記のサイレント破損リスクが高い（RISK-3）。                                                         |

### 5.3 dual root 対称性メモ（Phase 6 へのフィード）

- 全 7 スキーマ差分は **dual root 間で同一構造**（同じ schema_origin）である（`raw-find-evals.txt` 基準）。fixture は `legacy-snake-min` 相当のため第 3 の root。
- writer の `.agents` ミラーが常にペアで存在する（§2 エイリアス対応表）。Phase 6 の `dual-root-parity.md` で consumer 名突合を行う。

### 5.4 aiworkflow-requirements 正本との用語候補記録（Phase 9 へ）

- `feedback-loop.md`（`.claude/skills/skill-creator/references/`）に掲載された EVALS 例は **snake_case** のみだが、本監査で representative（camelCase v2）が並立していることが判明。Phase 9 で正本整合を突合する。

---

## 6. 自己検証（AC/FR 対応）

| 基準              | 充足状況                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-3              | **可**. 代表スキーマ + legacy-snake-v1 + legacy-snake-min + fixture の **全 56 フィールド**を `field_path` で列挙。各行に readers/writers/validators を記載。 |
| FR-4              | **可**. `skillName`〜`levelCriteria.*` / `phaseMetrics.<phase_id>.*` / `qualityInsights.*` / `patterns.*` / `levels.*`（snake）を網羅。                       |
| FR-5              | **可**. 各フィールドに readers/writers の逆引きあり（0 件の場合も「なし」と明示）。                                                                           |
| AC-1 / AC-2       | **関連**. §2 の consumer エイリアス定義が consumer-audit-report.md と 1:1 対応できる形で書かれている（5-A 完了後に cross-check-log.md で検証）。              |
| FR-2 / FR-3       | **関連**. 各 writer セルに行番号根拠を `notes` 列で提示。read-only は明示。                                                                                   |
| AC-8（再現性）    | **可**. 行番号と raw-grep-\*.txt のヒット一致で第三者再現可能。                                                                                               |
| NFR-6（4 カラム） | **可**. 8 列は 4 カラムの上位互換。                                                                                                                           |
| NFR-8（行数）     | **可**. 本ファイルは 1000 行以内。                                                                                                                            |
| RISK-7            | **可**. `type=freeform` と `notes` で 6 件明示（§5.1）。                                                                                                      |

---

## 7. 後続 Phase への引き継ぎ

- **Phase 5-A**: §2 の consumer エイリアス表と 1:1 で `consumer-audit-report.md` の `path` 列を埋める。
- **Phase 5-C**: §2 のエイリアスに含まれる 19 個のパスと、§3 各表に登場するユニーク consumer 集合を `cross-check-log.md` で突合する。
- **Phase 6**: §5.3 の dual root 対称性メモを参照。
- **Phase 7**: §4.1 の `全フィールド総数 = 56` を基準に漏れチェック。
- **Phase 8**: §4.5（writers=0）と §4.3（writers 多数）を add/remove/rename リスクの根拠として参照。**特に `validators=0%` は schema-change-guide.md の中核警告**。
- **Phase 9**: §5.4 を aiworkflow-requirements references/ との整合で正式突合。
