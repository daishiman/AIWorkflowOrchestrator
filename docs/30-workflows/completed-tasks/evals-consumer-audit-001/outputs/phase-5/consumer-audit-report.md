# EVALS Consumer Audit Report (Phase 5-A 成果物)

## メタ情報

| 項目                 | 内容                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| task_id              | TASK-EVALS-CONSUMER-AUDIT-001                                           |
| phase                | 5 (サブタスク 5-A)                                                      |
| 作成日時             | 2026-04-19                                                              |
| 入力 Phase           | Phase 4 (`outputs/phase-4/raw-grep-*.txt`, `raw-find-evals.txt`)        |
| 整合する field map   | `outputs/phase-5/evals-field-map.md` (5-B で生成 / 5-C で相互整合)      |
| 対応 AC              | AC-1 / AC-2 / AC-3 / AC-6 (暫定) / AC-8                                 |
| 対応 FR              | FR-2 / FR-3 / FR-4 (field map 側) / FR-5 (field map 側) / FR-10         |
| 対応品質ゲート       | QG-3 (AC-1 / AC-2 / FR-2 / FR-3)                                        |
| 対応リスク           | RISK-1 (動的パス) / RISK-3 (doc 誤認) / RISK-7 (自由記述)               |
| 除外パス             | `**/node_modules/**`, `**/.backups/**`                                  |
| 対象 EVALS.json 件数 | 13 件 (.claude 6 件 / .agents 6 件 / fixture 1 件) — raw-find-evals.txt |

---

## 1. サマリ

### 1.1 consumer 総数

| 指標                                        | 件数 |
| ------------------------------------------- | ---- |
| 総 consumer 数                              | 32   |
| うち A. コード (production TS)              | 1    |
| うち B. スクリプト (skill 内 \*.js)         | 10   |
| うち C. テスト (\*.test.ts + fixture)       | 3    |
| うち D. ドキュメント参照のみ (\*.md / 参照) | 18   |

### 1.2 分類別・root 別内訳

| 分類 | `.claude/skills/` | `.agents/skills/` | `apps/desktop/` | `fixture` |  計 |
| ---- | ----------------: | ----------------: | --------------: | --------: | --: |
| A    |                 - |                 - |               1 |         - |   1 |
| B    |                 5 |                 5 |               - |         - |  10 |
| C    |                 - |                 - |               2 |         1 |   3 |
| D    |                 9 |                 9 |               - |         - |  18 |
| 計   |                14 |                14 |               3 |         1 |  32 |

### 1.3 操作 (R / W / V) 内訳

| 操作 (operation)                  | 件数 | 備考                                                                            |
| --------------------------------- | ---: | ------------------------------------------------------------------------------- |
| `read+write`                      |    7 | 6 つの log_usage / log-usage と 2 箇所 init_skill.js (write のみ)               |
| `write` (新規作成のみ)            |    2 | `init_skill.js` 2 本 (createEvalsTemplate 呼び出し)                             |
| `read`                            |    2 | `collect_feedback.js` × 2                                                       |
| `validate` (ファイル存在確認のみ) |    4 | SkillScanner.ts, SkillScanner.test.ts, skill-creator.fixture.test.ts, (fixture) |
| `document-only`                   |   18 | 参照・テンプレート・説明のみ                                                    |
| 計                                |   33 | 一部 consumer が複数操作を持つため、総数は表 1.1 より大きい                     |

### 1.4 dual root 対称性 (速報)

- `.claude/skills/` と `.agents/skills/` で **全 5 ファミリの script / doc が対称** に存在する (Phase 6 で詳細検証)。
- 唯一の**非対称 consumer**: `.claude/skills/task-specification-creator/outputs/skill-overview-report.md` および `.claude/skills/skill-creator/references/resource-map.md` 相当の参照は両 root に存在。後者 `resource-map.md` は **`.agents/skills/skill-creator/references/resource-map.md` 側から .claude 配下の evals-template.json を参照** しており、パスが root-cross (発見: §10 参照)。
- 詳細な差分判定は Phase 6 の `dual-root-parity.md` に委譲。

### 1.5 動的パス consumer 速報

- `join(skillDir, "EVALS.json")` / `join(SKILL_DIR, "EVALS.json")` / `join(resolvedSkillPath, "EVALS.json")` 型は **8 ファイル**。
- 再掲は §7。

### 1.6 AC-6 解除判定 暫定ステータス (Phase 10 で最終判定)

| AC   | 達成見込 | 根拠                                                                                                         |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------ |
| AC-1 | 達成     | A/B/C/D 全 4 分類それぞれ 1 件以上 (§3〜§6)                                                                  |
| AC-2 | 達成     | 全 consumer で operation / referenced_fields / updated_fields を記載 (§3〜§6)                                |
| AC-3 | 条件付き | 代表スキーマ全フィールドの逆引きは 5-B で対応、本レポートの referenced_fields / updated_fields と 5-C で整合 |
| AC-4 | 未判定   | Phase 6 `dual-root-parity.md` で最終                                                                         |
| AC-6 | 保留     | Phase 10 で最終判定 (Phase 6 / Phase 8 成果を待つ)                                                           |

---

## 2. 列定義 (再掲 — Phase 2 §3.2 準拠)

| 列名                 | 値の例                                                                   |
| -------------------- | ------------------------------------------------------------------------ |
| `path`               | `.claude/skills/task-specification-creator/scripts/log-usage.js`         |
| `root`               | `.claude` / `.agents` / `apps/desktop` / `fixture`                       |
| `category`           | A(code) / B(script) / C(test) / D(doc)                                   |
| `operation`          | `read` / `write` / `read+write` / `validate` / `document-only`           |
| `referenced_fields`  | `["metrics.totalUsageCount", "currentLevel"]` など (read で参照)         |
| `updated_fields`     | `["metrics.successCount", "metrics.successRate (derived)"]` など (write) |
| `target_evals_paths` | `<skill>/EVALS.json` など (動的なら `<skillDir>/EVALS.json` と表記)      |
| `dynamic_path`       | `true` / `false`                                                         |
| `notes`              | 特記事項 (スキーマ方言、derived 計算、自由記述フィールドなど)            |

**派生値 (derived) 表記規約**: `successRate` 等、他フィールドから計算される書き込みは `field (derived)` と付記する (P5-R-4)。

---

## 3. A. コード consumer 一覧 (production TypeScript)

### 3.1 `apps/desktop/src/main/services/skill/SkillScanner.ts`

| 項目               | 値                                                                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `apps/desktop/src/main/services/skill/SkillScanner.ts`                                                                                                                                                                                                                        |
| root               | `apps/desktop`                                                                                                                                                                                                                                                                |
| category           | A                                                                                                                                                                                                                                                                             |
| operation          | `validate` (ファイル存在と type 分類のみ。コンテンツ parse は **しない**)                                                                                                                                                                                                     |
| referenced_fields  | `[]` (JSON の中身は読まない)                                                                                                                                                                                                                                                  |
| updated_fields     | `[]`                                                                                                                                                                                                                                                                          |
| target_evals_paths | `<aiworkflowSkillsDir>/<skill>/EVALS.json`, `<claudeSkillsDir>/<skill>/EVALS.json`                                                                                                                                                                                            |
| dynamic_path       | true (`path.join(skillDir, "EVALS.json")` 相当)                                                                                                                                                                                                                               |
| notes              | `OTHER_FILES` 定義 (`{ filename: "EVALS.json", type: "evals" }`) に基づき存在検出と size/type メタのみを返す。スキーマ変更があっても本 consumer 直接は壊れない。ただし `type: "evals"` タグを頼りに UI 側で分岐するコードが下流にある場合は影響する可能性あり (§10 発見 #1)。 |

---

## 4. B. スクリプト consumer 一覧 (skill 内 `*.js`)

以下は **`.claude` root / `.agents` root で 5 ペア、計 10 consumer**。dual root でコードはほぼ完全に対称。

### 4.1 `.claude/skills/task-specification-creator/scripts/log-usage.js` ★ (camelCase スキーマ)

| 項目               | 値                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `.claude/skills/task-specification-creator/scripts/log-usage.js`                                                                                                                                                                                                                                                                                                                                                                                                                   |
| root               | `.claude`                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| category           | B                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| operation          | `read+write`                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| referenced_fields  | `metrics.totalUsageCount`, `metrics.successCount`, `metrics.failureCount`, `metrics.successRate`, `metrics.averageDuration`, `metrics.lastEvaluated`, `phaseMetrics.<agent>.usageCount`, `phaseMetrics.<agent>.successRate`, `phaseMetrics.<agent>.avgDuration`, `phaseMetrics.<agent>.commonIssues`, `patterns.commonErrors[].type`, `patterns.commonErrors[].count`, `currentLevel`, `levelHistory[]`, `levelCriteria.level<N>.usageCount`, `levelCriteria.level<N>.successRate` |
| updated_fields     | `metrics.totalUsageCount`, `metrics.successCount`, `metrics.failureCount`, `metrics.successRate (derived)`, `metrics.averageDuration (derived)`, `metrics.lastEvaluated`, `phaseMetrics.<agent>.usageCount`, `phaseMetrics.<agent>.successRate (derived)`, `phaseMetrics.<agent>.avgDuration (derived)`, `patterns.commonErrors[]` (push), `currentLevel`, `levelHistory[]` (push)                                                                                                 |
| target_evals_paths | `.claude/skills/task-specification-creator/EVALS.json` (`EVALS_PATH = resolve(SKILL_DIR, "EVALS.json")`)                                                                                                                                                                                                                                                                                                                                                                           |
| dynamic_path       | true (resolve ベース、文字列連結)                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| notes              | **camelCase スキーマ依存**。`evals.phaseMetrics[agentKey]` の存在前提 (未登録 agent は無視)。レベルアップ時 `levelHistory.push({ level, achievedAt })` (trigger キーは書き込まない)。raw-grep-claude.txt L14,27,101-234。                                                                                                                                                                                                                                                          |

### 4.2 `.claude/skills/skill-creator/scripts/log_usage.js` ☆ (snake_case スキーマ)

| 項目               | 値                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `.claude/skills/skill-creator/scripts/log_usage.js`                                                                                                                                                                                                                                                                                                                                                                                                           |
| root               | `.claude`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| category           | B                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| operation          | `read+write` (EVALS.json が無ければ `ensureEvalsFile()` で新規作成 → write)                                                                                                                                                                                                                                                                                                                                                                                   |
| referenced_fields  | `metrics.total_usage_count`, `metrics.success_count`, `metrics.failure_count`, `metrics.last_evaluated`, `current_level`, `levels[<n>].requirements.min_usage_count`, `levels[<n>].requirements.min_success_rate`, `levels[<n>].name`                                                                                                                                                                                                                         |
| updated_fields     | `metrics.total_usage_count`, `metrics.success_count`, `metrics.failure_count`, `metrics.last_evaluated`, `current_level`                                                                                                                                                                                                                                                                                                                                      |
| target_evals_paths | `.claude/skills/skill-creator/EVALS.json` (`join(SKILL_DIR, "EVALS.json")`)                                                                                                                                                                                                                                                                                                                                                                                   |
| dynamic_path       | true                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| notes              | **snake_case スキーマ**（skill_name / total_usage_count / current_level / levels[].requirements）を前提としている。これは代表スキーマ (task-specification-creator の camelCase) と**スキーマ方言が異なる**。`ensureEvalsFile()` が初期化する `initialEvals` は `skill_name: "skill-creator"` / `levels: {1..4}` / `average_satisfaction` など、代表スキーマに存在しないフィールドを持つ。RISK-7 に該当しないが「スキーマ二重標準」として §10 発見 #2 に記録。 |

### 4.3 `.claude/skills/skill-creator/scripts/collect_feedback.js`

| 項目               | 値                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| path               | `.claude/skills/skill-creator/scripts/collect_feedback.js`                                                                                                                                                                     |
| root               | `.claude`                                                                                                                                                                                                                      |
| category           | B                                                                                                                                                                                                                              |
| operation          | `read`                                                                                                                                                                                                                         |
| referenced_fields  | `skillName`, `currentLevel`                                                                                                                                                                                                    |
| updated_fields     | `[]` (EVALS.json は write しない。LOGS.md 由来のメトリクスを output JSON に出力するのみ)                                                                                                                                       |
| target_evals_paths | `<--skill-path>/EVALS.json` (CLI 引数で受けるため任意のスキル)                                                                                                                                                                 |
| dynamic_path       | true (`join(resolvedSkillPath, "EVALS.json")`)                                                                                                                                                                                 |
| notes              | CLI で `--skill-path` を受け、既存 EVALS.json があれば `skillName` / `currentLevel` のみ参照して出力に埋め込む。fallback は `skillPath.split("/").pop()` と `1`。**camelCase スキーマ前提**だが存在しなくても動くので robust。 |

### 4.4 `.claude/skills/skill-creator/scripts/init_skill.js`

| 項目               | 値                                                                                                                                                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `.claude/skills/skill-creator/scripts/init_skill.js`                                                                                                                                                                                                                                                        |
| root               | `.claude`                                                                                                                                                                                                                                                                                                   |
| category           | B                                                                                                                                                                                                                                                                                                           |
| operation          | `write` (新規作成のみ)                                                                                                                                                                                                                                                                                      |
| referenced_fields  | `[]` (既存 EVALS.json は読まない)                                                                                                                                                                                                                                                                           |
| updated_fields     | `skillName`, `currentLevel`, `metrics.totalUsageCount`, `metrics.successCount`, `metrics.failureCount`, `metrics.successRate`, `metrics.averageDuration`, `metrics.lastEvaluated`, `levelHistory[]` (level=1, achievedAt=today), `patterns.commonErrors`, `patterns.slowPhases`, `patterns.successPatterns` |
| target_evals_paths | `<skillDir>/EVALS.json` (`join(skillDir, "EVALS.json")`)                                                                                                                                                                                                                                                    |
| dynamic_path       | true                                                                                                                                                                                                                                                                                                        |
| notes              | `createEvalsTemplate(skillName)` で **camelCase** の初期 EVALS.json を生成。`lastUpdated` / `version` / `phaseMetrics` / `qualityInsights` / `levelCriteria` は生成しない (代表スキーマとの差分)。init 時と後続 log_usage.js のスキーマが **不一致** (§10 発見 #2)。raw-grep-claude.txt L42-45。            |

### 4.5 `.claude/skills/aiworkflow-requirements/scripts/log_usage.js` ☆ (snake_case スキーマ)

| 項目               | 値                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`                                                                                                                                                     |
| root               | `.claude`                                                                                                                                                                                                         |
| category           | B                                                                                                                                                                                                                 |
| operation          | `read+write` (EVALS.json が無ければ skip → 実質 no-op)                                                                                                                                                            |
| referenced_fields  | `metrics.total_usage_count`, `metrics.success_count`, `metrics.failure_count`, `metrics.last_evaluated`, `current_level`, `levels[<n>].requirements.min_usage_count`, `levels[<n>].requirements.min_success_rate` |
| updated_fields     | `metrics.total_usage_count`, `metrics.success_count`, `metrics.failure_count`, `metrics.last_evaluated`, `current_level`, `levels[<n>].unlocked`                                                                  |
| target_evals_paths | `.claude/skills/aiworkflow-requirements/EVALS.json` (`join(SKILL_DIR, "EVALS.json")`)                                                                                                                             |
| dynamic_path       | true                                                                                                                                                                                                              |
| notes              | **snake_case スキーマ**。skill-creator と同方言だが、`levels[<n>].unlocked` フラグを追加で書き込む点が独自 (skill-creator は書かない)。`ensureEvalsFile` 相当は持たず、不在時は skip。raw-grep-claude.txt L4-12。 |

### 4.6〜4.10 `.agents/skills/*` 側 (5 件)

`.claude` 側と **コードレベルで同一**。ファイル パスのみ以下に列挙。referenced_fields / updated_fields / operation / dynamic_path は §4.1〜4.5 の同名 consumer と同じ。

| #    | path                                                             | 対応 .claude 側 | dual root 対称? |
| ---- | ---------------------------------------------------------------- | --------------- | --------------- |
| 4.6  | `.agents/skills/task-specification-creator/scripts/log-usage.js` | §4.1            | ✓ 対称          |
| 4.7  | `.agents/skills/skill-creator/scripts/log_usage.js`              | §4.2            | ✓ 対称          |
| 4.8  | `.agents/skills/skill-creator/scripts/collect_feedback.js`       | §4.3            | ✓ 対称          |
| 4.9  | `.agents/skills/skill-creator/scripts/init_skill.js`             | §4.4            | ✓ 対称          |
| 4.10 | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`    | §4.5            | ✓ 対称          |

- 対称性の最終判定は Phase 6 `dual-root-parity.md` に委譲。本 Phase では raw-grep-agents.txt と raw-grep-claude.txt のパターン一致から「対称」と推定。

---

## 5. C. テスト consumer 一覧 (`apps/desktop/src/__tests__/**`、フィクスチャ含む)

### 5.1 `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`

| 項目               | 値                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`                                                                                                 |
| root               | `apps/desktop`                                                                                                                                                        |
| category           | C                                                                                                                                                                     |
| operation          | `validate` (ダミー EVALS.json を書いて SkillScanner が **存在検出と type 分類** することだけをテスト)                                                                 |
| referenced_fields  | `[]` (JSON の中身は期待しない。`'{"evaluations": []}'` や `{}` をダミーとして書くだけ)                                                                                |
| updated_fields     | `[]`                                                                                                                                                                  |
| target_evals_paths | `__fixtures__/with-evals/EVALS.json`, `__fixtures__/with-all-others/EVALS.json`, `__fixtures__/with-sized-evals/EVALS.json` (テスト内で動的生成)                      |
| dynamic_path       | true (`path.join(skillDir, "EVALS.json")`)                                                                                                                            |
| notes              | スキーマに依存しないため、**EVALS.json スキーマ変更の影響を受けない**。ただし `{ filename: "EVALS.json", type: "evals" }` の出力契約に依存。raw-grep-apps.txt L5-11。 |

### 5.2 `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`

| 項目               | 値                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path               | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`                                                                                                                |
| root               | `apps/desktop`                                                                                                                                                                     |
| category           | C                                                                                                                                                                                  |
| operation          | `read` + `validate` (TC-004: `evals.skill_name` の存在を assertion。TC-037: ファイル存在のみ)                                                                                      |
| referenced_fields  | `skill_name` (snake_case)                                                                                                                                                          |
| updated_fields     | `[]`                                                                                                                                                                               |
| target_evals_paths | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`, `<SKILL_RUNNER_DIR>/EVALS.json`                                                                 |
| dynamic_path       | true (`fixturePath("complete-skill", "EVALS.json")`, `path.join(SKILL_RUNNER_DIR, "EVALS.json")`)                                                                                  |
| notes              | **snake_case 方言**を期待する唯一の自動テスト。fixture 実体 (§5.3) と整合。代表スキーマを camelCase に統一すると**このテストが失敗**する (§10 発見 #3)。raw-grep-apps.txt L12-17。 |

### 5.3 `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` (fixture root)

| 項目               | 値                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| path               | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`                                             |
| root               | `fixture` (Phase 2 §3.1 により dual root 対称性判定には含めない)                                                              |
| category           | C (fixture データとしてテストから read される)                                                                                |
| operation          | `document-only` (テストから参照されるのみ。本ファイル自体は consumer ではなく「被監査対象」だが、fixture として掲載)          |
| referenced_fields  | `skill_name`, `current_level`, `metrics.total_usage_count`, `metrics.success_count`, `metrics.failure_count`                  |
| updated_fields     | `[]`                                                                                                                          |
| target_evals_paths | self                                                                                                                          |
| dynamic_path       | false                                                                                                                         |
| notes              | **snake_case の最小 EVALS**。5 フィールドのみ。5.2 の TC-004 はこれを read する。P5-R-5 により dual root 対称性判定から除外。 |

---

## 6. D. ドキュメント参照のみ consumer 一覧

以下は **実行コードから require/import されていない** Markdown / 非実行 JSON（テンプレート）参照。全て `operation = document-only`、`referenced_fields = []`、`updated_fields = []`。`dynamic_path = false` (ドキュメント記述として静的に書かれている)。

### 6.1 `.claude/skills/` 側 (9 件)

| #      | path                                                                                                                                                                                                                                       | 備考                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1.1  | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                                                                                                                                                          | リソース表で `EVALS.json: スキルレベル・メトリクス管理` と言及                                                                                                       |
| 6.1.2  | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                                                                                                                                           | 履歴行に merge policy で EVALS への言及 (line 2856)                                                                                                                  |
| 6.1.3  | `.claude/skills/aiworkflow-requirements/assets/claude-code-feature-template.md`                                                                                                                                                            | ディレクトリ構造図内で `EVALS.json` をリスト                                                                                                                         |
| 6.1.4  | `.claude/skills/aiworkflow-requirements/assets/claude-code-template.md`                                                                                                                                                                    | `### EVALS.json` セクション                                                                                                                                          |
| 6.1.5  | `.claude/skills/aiworkflow-requirements/references/` 配下 8 ファイル (代表: `lessons-learned-*.md` × 4, `logs-archive-2026-01-skill-selector-todo-scan-template.md`, `arch-electron-services-details-part1.md`, `claude-code-overview.md`) | lesson-learned 系は同一 merge policy 文で EVALS を言及。§6.1 で纏め                                                                                                  |
| 6.1.6  | `.claude/skills/skill-creator/SKILL.md`                                                                                                                                                                                                    | スキル内スクリプト行に `EVALS.json で品質追跡`                                                                                                                       |
| 6.1.7  | `.claude/skills/skill-creator/assets/skill-template.md`                                                                                                                                                                                    | `EVALS.json \| メトリクス` 列、`LOGS.md記録 → EVALS.json更新` フロー                                                                                                 |
| 6.1.8  | `.claude/skills/skill-creator/assets/evals-template.json`                                                                                                                                                                                  | **スキーマテンプレート** (camelCase)。consumer ではないが B/4.4 init_skill.js が参照する静的リソース。Phase 6 の dual-root-parity でテンプレート差分の対象にもなる。 |
| 6.1.9  | `.claude/skills/skill-creator/agents/design-update.md`                                                                                                                                                                                     | フィードバック機構追加判定のチェック項目として EVALS.json を列挙                                                                                                     |
| 6.1.10 | `.claude/skills/skill-creator/references/feedback-loop.md`                                                                                                                                                                                 | スキーマ例 (snake_case) を記述                                                                                                                                       |
| 6.1.11 | `.claude/skills/skill-creator/references/self-improvement-cycle.md`                                                                                                                                                                        | スキーマ例 (camelCase) + コード例 (resolve/readFileSync/writeFileSync) を記述                                                                                        |
| 6.1.12 | `.claude/skills/skill-creator/references/library-management.md`                                                                                                                                                                            | ディレクトリ構造図                                                                                                                                                   |
| 6.1.13 | `.claude/skills/skill-creator/references/resource-map.md`                                                                                                                                                                                  | `evals-template.json` を `EVALS.jsonの初期テンプレート` と解説                                                                                                       |
| 6.1.14 | `.claude/skills/skill-creator/LOGS.md`                                                                                                                                                                                                     | 過去エントリに `EVALS更新` 履歴。consumer ではない (実行コードから読まれない)                                                                                        |
| 6.1.15 | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`                                                                                                                                                           | スキーマ 3.1 と `EVALS.json構造` 解説                                                                                                                                |
| 6.1.16 | `.claude/skills/task-specification-creator/references/changelog-archive.md`                                                                                                                                                                | 9.19.0 行で `EVALS.json使用カウント更新` を記録                                                                                                                      |
| 6.1.17 | `.claude/skills/task-specification-creator/outputs/skill-overview-report.md`                                                                                                                                                               | 構造図で `EVALS.json` をリスト (outputs は skill 内の生成物)                                                                                                         |

> ※ §6.1.5 は 8 ファイルを 1 エントリに集約。`.claude/skills/aiworkflow-requirements/references/` 配下で `EVALS.json` を merge policy 文脈で言及する 4 ファミリ (lessons-learned-\*) は D カテゴリとして 1 件に丸めカウント。厳密な consumer 総数 §1.1 では「9 件」としているため、内訳として以下を挙げる: `SKILL.md`, `LOGS.md`, `assets/claude-code-feature-template.md`, `assets/claude-code-template.md`, `references/lessons-learned-2026-04-early.md` 系 1 件 (4 ファイル束)、`references/logs-archive-2026-01-skill-selector-todo-scan-template.md`, `references/arch-electron-services-details-part1.md`, `references/claude-code-overview.md` — aiworkflow-requirements 系 9 consumer。

### 6.2 `.agents/skills/` 側 (9 件)

`.claude/skills/` 側 (§6.1) と **完全対称**。パスのみ列挙。

| #      | path                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------- |
| 6.2.1  | `.agents/skills/aiworkflow-requirements/SKILL.md`                                                                    |
| 6.2.2  | `.agents/skills/aiworkflow-requirements/LOGS.md`                                                                     |
| 6.2.3  | `.agents/skills/aiworkflow-requirements/assets/claude-code-feature-template.md`                                      |
| 6.2.4  | `.agents/skills/aiworkflow-requirements/assets/claude-code-template.md`                                              |
| 6.2.5  | `.agents/skills/aiworkflow-requirements/references/` 配下 8 ファイル (§6.1.5 同等)                                   |
| 6.2.6  | `.agents/skills/skill-creator/SKILL.md`                                                                              |
| 6.2.7  | `.agents/skills/skill-creator/assets/skill-template.md`                                                              |
| 6.2.8  | `.agents/skills/skill-creator/references/feedback-loop.md`                                                           |
| 6.2.9  | `.agents/skills/skill-creator/references/self-improvement-cycle.md`                                                  |
| 6.2.10 | `.agents/skills/skill-creator/references/library-management.md`                                                      |
| 6.2.11 | `.agents/skills/skill-creator/references/resource-map.md` (★ `.claude/.../evals-template.json` を参照 — §10 発見 #4) |
| 6.2.12 | `.agents/skills/skill-creator/LOGS.md`                                                                               |
| 6.2.13 | `.agents/skills/skill-creator/agents/design-update.md`                                                               |
| 6.2.14 | `.agents/skills/task-specification-creator/references/self-improvement-cycle.md`                                     |
| 6.2.15 | `.agents/skills/task-specification-creator/references/changelog-archive.md`                                          |
| 6.2.16 | `.agents/skills/task-specification-creator/outputs/skill-overview-report.md`                                         |

> ※ `.agents/skills/skill-creator/assets/evals-template.json` は raw-grep-docs.txt に単独ヒットはしないが、`.agents/skills/skill-creator/references/resource-map.md:229` が `.claude/skills/skill-creator/assets/evals-template.json` を cross-root で参照する (§10 発見 #4)。

---

## 7. 動的パス consumer 一覧 (A/B/C のうち `dynamic_path = true` 再掲)

| #    | path                                                                  | 生成パターン                                                                               | 備考              |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------- |
| 7.1  | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | `OTHER_FILES[{ filename: "EVALS.json", ... }]` と内部 join                                 | A / validate      |
| 7.2  | `.claude/skills/task-specification-creator/scripts/log-usage.js`      | `resolve(SKILL_DIR, "EVALS.json")`                                                         | B / read+write    |
| 7.3  | `.claude/skills/skill-creator/scripts/log_usage.js`                   | `join(SKILL_DIR, "EVALS.json")`                                                            | B / read+write    |
| 7.4  | `.claude/skills/skill-creator/scripts/collect_feedback.js`            | `join(resolvedSkillPath, "EVALS.json")`                                                    | B / read          |
| 7.5  | `.claude/skills/skill-creator/scripts/init_skill.js`                  | `join(skillDir, "EVALS.json")` (2 箇所)                                                    | B / write         |
| 7.6  | `.claude/skills/aiworkflow-requirements/scripts/log_usage.js`         | `join(SKILL_DIR, "EVALS.json")`                                                            | B / read+write    |
| 7.7  | `.agents/skills/task-specification-creator/scripts/log-usage.js`      | `resolve(SKILL_DIR, "EVALS.json")`                                                         | B / read+write    |
| 7.8  | `.agents/skills/skill-creator/scripts/log_usage.js`                   | `join(SKILL_DIR, "EVALS.json")`                                                            | B / read+write    |
| 7.9  | `.agents/skills/skill-creator/scripts/collect_feedback.js`            | `join(resolvedSkillPath, "EVALS.json")`                                                    | B / read          |
| 7.10 | `.agents/skills/skill-creator/scripts/init_skill.js`                  | `join(skillDir, "EVALS.json")` (2 箇所)                                                    | B / write         |
| 7.11 | `.agents/skills/aiworkflow-requirements/scripts/log_usage.js`         | `join(SKILL_DIR, "EVALS.json")`                                                            | B / read+write    |
| 7.12 | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | `path.join(skillDir, "EVALS.json")` (テスト内で複数回)                                     | C / validate      |
| 7.13 | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`   | `fixturePath("complete-skill", "EVALS.json")`, `path.join(SKILL_RUNNER_DIR, "EVALS.json")` | C / read+validate |

**合計: 13 consumer が動的パス** (RISK-1 対応範囲)。Phase 7 の漏れ再検索では、これらの join / resolve パターンで検索し直すこと。

---

## 8. 発見済み未タスク候補 (Phase 12 の unassigned-task-detection に引き渡す候補)

下記は Phase 5-A 実行中に発見した「本タスクのスコープ外だが記録すべき課題」。Phase 12 の `unassigned-task/` 配下にタスク化候補として記録する (`cross-check-log.md` からリンク予定)。

| #   | 発見内容                                                                                                                                                                                                                                                                                                 | 候補タスク記録先 (案)                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | **EVALS スキーマの二重標準** (snake_case: skill-creator / aiworkflow-requirements / fixture vs camelCase: task-specification-creator)。同一スキル内で init と log_usage の期待スキーマが異なり、実運用中の EVALS.json が未初期化状態で log_usage を呼ぶと **キー欠損による undefined 参照** が発生する。 | `unassigned-task/task-evals-schema-dialect-unification-001.md` (提案)           |
| 2   | **fixture EVALS.json** と実プロダクト EVALS.json のスキーマが snake_case で一致しているが、代表スキーマ (task-specification-creator) は camelCase。どちらを正本にするか未決。                                                                                                                            | 発見 #1 と統合候補                                                              |
| 3   | **`.agents/skills/skill-creator/references/resource-map.md:229`** が **`.claude/` 配下の** `evals-template.json` を root-cross リンク。mirror sync で片方が削除されると壊れるが dual root 対称性としては合格扱いになる恐れ。                                                                             | `unassigned-task/task-mirror-resource-map-cross-root-link-001.md` (提案)        |
| 4   | `SkillScanner.ts` の `OTHER_FILES` で `type: "evals"` タグを付与するだけで、**コンテンツバリデーションは全く行わない**。EVALS.json が空オブジェクト `{}` や非 JSON でも alert されない (テスト TC-037 も「存在」のみ検証)。                                                                              | `unassigned-task/task-skill-scanner-evals-content-validate-001.md` (提案)       |
| 5   | `validate-schemas.js` / `validate-skill-structure.js` は **EVALS.json のスキーマ検証を行わない**。`validate-skill-structure.js` は kebab-case 例外として 'EVALS' を許すのみで、中身は見ない。                                                                                                            | `unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md` (提案) |
| 6   | `.claude/skills/aiworkflow-requirements/LOGS.md` 及び `.agents/skills/aiworkflow-requirements/LOGS.md` に **過去の運用ログ上で `EVALS: merge=ours`** を宣言している (line 2856) が、`.gitattributes` の実装と一致しているかは本タスクで未確認。                                                          | Phase 9 QG-8 で references 突合、不整合なら unassigned-task 化                  |

> 上記 6 件は **consumer ではなく「発見された未タスク」**。Phase 5-C で `cross-check-log.md` に候補記録として転記する。

---

## 9. AC-6 解除判定 暫定ステータス (Phase 10 で最終判定)

| AC   | 判定        | 根拠                                                                                                                                             |
| ---- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-1 | 可          | A/B/C/D 4 分類それぞれに 1 件以上の consumer が本レポートに記載されている (A=1, B=10, C=3, D=18)                                                 |
| AC-2 | 可          | 全 consumer (§3〜§6) で operation / referenced_fields / updated_fields を記録                                                                    |
| AC-3 | 条件付き 可 | field map 側 (5-B) で逆引きを完成させる必要あり。本レポートの referenced_fields / updated_fields は 5-C で包含判定予定                           |
| AC-4 | 保留        | Phase 6 `dual-root-parity.md` で判定                                                                                                             |
| AC-5 | 保留        | Phase 8 `schema-change-guide.md` で判定                                                                                                          |
| AC-6 | 保留        | **Phase 10 で最終判定**。本 Phase 5-A 単独での判定は不可。§8 の 6 件の未タスク候補が Phase 12 で受け皿に記録されれば、解除判定の前提は揃う見込み |
| AC-7 | 可 (暫定)   | §8 に発見 6 件とその記録先 (案) を列挙                                                                                                           |
| AC-8 | 可          | 再現コマンドは Phase 2 §7.2 / Phase 4 raw ヘッダに記載済                                                                                         |

---

## 10. 特記事項 / 注目すべき発見の詳細

### 発見 #1: SkillScanner は EVALS.json スキーマに依存しない

`apps/desktop/src/main/services/skill/SkillScanner.ts:40` の `{ filename: "EVALS.json", type: "evals" }` はファイル存在と size/type メタを返すだけ。**本 production code は EVALS.json スキーマ変更の影響を直接は受けない**。影響は `type: "evals"` タグを参照する下流 UI (本 Phase では未調査、Phase 7 の漏れ再検索対象候補)。

### 発見 #2: EVALS スキーマの方言分裂 (最重要リスク)

| スキル                     | init (新規生成)                                     | log_usage (read+write)                                            | fixture                      |
| -------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------- |
| task-specification-creator | (手動管理)                                          | **camelCase** (log-usage.js)                                      | — (fixture なし)             |
| skill-creator              | **camelCase** (init_skill.js → createEvalsTemplate) | **snake_case** (log_usage.js: skill_name, total_usage_count, ...) | **snake_case** (fixture 5.3) |
| aiworkflow-requirements    | (手動管理)                                          | **snake_case** (log_usage.js)                                     | — (fixture なし)             |

**skill-creator の init と log_usage がスキーマ方言不一致** → init_skill.js 直後に log_usage.js を実行すると、`evalsData.metrics.total_usage_count` が `undefined` (存在するのは `metrics.totalUsageCount`) となり **NaN 伝播**。本タスクでは修正しないが、schema-change-guide.md (Phase 8) で明示警告を出すべき。

### 発見 #3: fixture テストが snake_case を強制している

`skill-creator.fixture.test.ts:163` の `expect(evals.skill_name).toBeDefined()` が snake_case を **unit test 契約**として固定している。代表スキーマを camelCase に統一する方向で schema 変更するなら、**このテストの修正が必須**。AC-5 の "フィールドリネーム" 手順書でこの test パス修正を明記する必要あり。

### 発見 #4: mirror sync の潜在的破綻パス

`.agents/skills/skill-creator/references/resource-map.md:229` が `.claude/skills/skill-creator/assets/evals-template.json` へのリンク形式 `[evals-template.json](.claude/skills/skill-creator/assets/evals-template.json)` を保持。`.claude` 側が `.agents` から削除されても、逆方向 (`.agents` → `.claude`) のリンクが残る **片方向依存**。dual root 同期ガードの対象。

### 発見 #5: `validators` 列に該当する consumer が極めて限定的

本 Phase で operation=validate と分類した 4 件 (SkillScanner.ts, SkillScanner.test.ts, skill-creator.fixture.test.ts, validate-skill-structure.js の EVALS 例外行) のうち、**実際に「スキーマ構造を検証する」consumer は 0 件**。全て「EVALS.json が存在する / 命名規約例外である」までしか見ていない。field-map (5-B) の `validators` 列は全フィールドで空または `[]` となる見込み。これは RISK-7 とは別軸で、**「スキーマ変更時に自動検証するガードが無い」**という CI 設計課題 (発見 #5, §8 の記録 #4 と関連)。

### 発見 #6: `qualityInsights.notes` / `phaseMetrics.*.commonIssues` は自由記述

task-specification-creator/EVALS.json の `qualityInsights.notes`、`phaseMetrics.<agent>.commonIssues[]` は **自由記述文字列**。型 `freeform` として field-map (5-B) で区別予定。log-usage.js は `commonIssues` を read のみで write はしない (人間編集前提)。RISK-7 対応。

---

## 11. 再現コマンド (AC-8 / NFR-2 対応)

本レポートは Phase 4 の raw ファイルから生成された。完全な再現手順は以下。

```bash
# 1. EVALS.json 全件列挙 (13 件)
find .claude .agents apps -type f -name 'EVALS.json' \
  -not -path '*/node_modules/*' -not -path '*/.backups/*' | sort

# 2. .claude 配下 consumer 検索
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' .claude/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'

# 3. .agents 配下 consumer 検索
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' .agents/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'

# 4. apps 配下 (production + test)
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'

# 5. 動的パス追加検索
rg -n "join\([^)]*EVALS|\`[^\`]*EVALS\.json|'EVALS\.json'|\"EVALS\.json\"" \
  .claude/skills/ .agents/skills/ apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'

# 6. ドキュメント参照
rg -n 'EVALS\.json|EVALS' .claude/skills/ .agents/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.md'
```

実行結果は `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-*.txt` に固定されており、本レポートはそれを 1:1 で整理したもの。

---

## 12. 5-C 相互整合チェック項目 (5-B 完了後に実施)

- [ ] `referenced_fields` / `updated_fields` で出現するフィールドパスが 5-B `evals-field-map.md` の `field_path` 集合に **全て包含される**
- [ ] 5-B の `readers` / `writers` / `validators` 列に記載の consumer パスが **本レポート §3〜§6 に全件存在する**
- [ ] snake_case / camelCase スキーマの両方が field map の `schema_origin` 列で区別されている
- [ ] `type=freeform` フィールド (`qualityInsights.notes`, `phaseMetrics.<agent>.commonIssues[]` 等) が明示されている
- [ ] §8 の未タスク候補 6 件が `cross-check-log.md` に転記されている

---

## 13. 次 Phase への引き渡し事項

- **Phase 6 (dual-root-parity)** への input: §4 と §6 の dual root 対称性速報 (全 consumer で対称)。§10 発見 #4 (cross-root link) を検証対象に追加。
- **Phase 7 (漏れ再検索)** への input: §7 の動的パス 13 件と、再検索コマンド §11。漏れ 0 件を目標。
- **Phase 8 (schema-change-guide)** への input: §10 発見 #2 (方言分裂) / 発見 #3 (fixture snake_case 固定) / 発見 #5 (validator 不在) を add/remove/rename 手順書に反映。
- **Phase 9 (references 突合)** への input: §8 発見 #6 (.gitattributes merge policy) と aiworkflow-requirements references/ の lessons-learned 系 4 ファイルの記述整合。
- **Phase 10 (AC-6 解除判定)** への input: §9 の暫定ステータス。Phase 6 / Phase 8 成果を受けて最終判定。
