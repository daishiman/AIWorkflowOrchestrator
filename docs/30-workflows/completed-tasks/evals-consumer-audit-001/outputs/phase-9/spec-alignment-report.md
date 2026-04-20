# EVALS Spec Alignment Report

> Phase 9 成果物 / TASK-EVALS-CONSUMER-AUDIT-001
> 監査のみ（`references/` の修正は行わない / dual root 正本断定は行わない）。

---

## メタ情報

| 項目                      | 内容                                                                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task_id                   | TASK-EVALS-CONSUMER-AUDIT-001                                                                                                                                                                                                                |
| phase_id                  | 9                                                                                                                                                                                                                                            |
| 生成日時                  | 2026-04-19                                                                                                                                                                                                                                   |
| 作業ブランチ              | `.worktrees/task-20260419-160952-wt-9`                                                                                                                                                                                                       |
| 依存成果物                | `phase-5/consumer-audit-report.md` / `phase-5/evals-field-map.md` / `phase-6/dual-root-parity.md` / `phase-8/schema-change-guide.md`                                                                                                         |
| 正本側対象                | `.claude/skills/aiworkflow-requirements/references/*.md`（`SKILL.md` は正本 skill 本体メタ）／補助: `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`                                                         |
| 対応 AC / FR              | AC-6（TASK-CONFLICT-PREVENT-001）解除条件の間接充足 / FR-9（未タスク記録）                                                                                                                                                                   |
| 対応 Quality Gate         | QG-8（Phase 2 定義）                                                                                                                                                                                                                         |
| 正本不変性                | **維持**（`git status` で `.claude/skills/aiworkflow-requirements/references/` 以下に変更なし。`.claude/skills/task-specification-creator/references/self-improvement-cycle.md` も変更なし）。本 Phase の書き込みは `outputs/phase-9/*` のみ |
| 備考（Phase 2 §3.1 準拠） | dual root（`.claude` / `.agents`）のどちらが正本かは本 Phase で断定しない                                                                                                                                                                    |

---

## 1. 目的（Why）

`aiworkflow-requirements` skill の `references/` 配下（および補助として `task-specification-creator/references/self-improvement-cycle.md`）は、プロジェクト全体の正本仕様集である。Phase 5/6/8 で作成した監査成果物（consumer 一覧・field map・dual root 差分・schema-change-guide）と、正本側の EVALS 関連記述に**齟齬がないか**を検証する。齟齬があれば「修正済」「未タスク化」「許容」のいずれかに分類し、FR-9 に従い未タスク候補として後続 Phase 12 へ引き継ぐ。

本 Phase は**文書監査のみ**である。コード実装・正本修正・テスト・PR 作成は一切行わない（Phase 1 制約・Phase 2 §3.1 dual root 正本断定禁止 に準拠）。

---

## 2. 検証対象（正本側 / 監査成果物側）

### 2.1 正本側（突合元）

| 区分                                | パス                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| aiworkflow-requirements references/ | `.claude/skills/aiworkflow-requirements/references/` 配下全 `*.md`（本 Phase で grep 対象）                         |
| 補助: self-improvement-cycle        | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`（EVALS.json 構造・レベル判定説明） |
| skill 本体                          | `.claude/skills/aiworkflow-requirements/SKILL.md`（description と変更履歴のみ確認）                                 |

### 2.2 監査成果物側（突合先）

| 成果物                   | パス                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| consumer-audit-report.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` |
| evals-field-map.md       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       |
| dual-root-parity.md      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      |
| schema-change-guide.md   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   |

### 2.3 検索コマンド（再現性）

```bash
# references/ 配下の EVALS 関連記述抽出
rg -n 'EVALS(\.json)?|evals[_-]?path|currentLevel|levelHistory|qualityInsights|levelCriteria|phaseMetrics|skillName' \
   .claude/skills/aiworkflow-requirements/references/ -g '*.md'

# task-specification-creator 側
rg -n 'EVALS|currentLevel|levelHistory|qualityInsights|levelCriteria' \
   .claude/skills/task-specification-creator/references/self-improvement-cycle.md
```

結果は `outputs/phase-9/raw-refs-hits.txt` に保存。

---

## 3. 正本内 EVALS 関連記述の分類結果（A/B/C/D/E）

### 3.1 ヒット概要

| 検索条件                             | ヒットファイル数 | ヒット件数 | 備考                                                    |
| ------------------------------------ | ---------------: | ---------: | ------------------------------------------------------- |
| `EVALS.json` 完全一致（references/） |                8 |          9 | 7 件は `L-WC-001` の merge 戦略表（同一テキストの重複） |
| `currentLevel` / `levelHistory` 等   |                0 |          0 | references/ 側は詳細フィールド構造を記述していない      |
| `EVALS` 系 総合（`skillName` 含む）  |               多 |        389 | ただし `skillName` はワークフロー計装など別用途が多数   |
| self-improvement-cycle.md（補助）    |                1 |          5 | EVALS.json 構造・`currentLevel`・`metrics.*` 記載あり   |

### 3.2 EVALS ユニーク言及（重複除外した 9 件 + 補助 1 件）

| #   | ref_path                                                                | ref_line | 言及要旨                                                                                          | 分類（A-E）                                         |
| --- | ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | `references/claude-code-overview.md`                                    | 127      | 標準フォルダ構造の列挙に `EVALS.json` を含む                                                      | **E**（単なる言及。構造詳細なし）                   |
| 2   | `references/claude-code-overview.md`                                    | 272      | Skill 作成時チェックリスト「EVALS.json が存在し、有効なJSON」                                     | **D**（存在性チェック＝運用ルール言及）             |
| 3   | `references/arch-electron-services-details-part1.md`                    | 115      | `OTHER_FILES` 定数表: `EVALS.json` → type=`evals`                                                 | **B**（consumer 言及＝SkillScanner の OTHER_FILES） |
| 4   | `references/logs-archive-2026-01-skill-selector-todo-scan-template.md`  | 22       | 「EVALS.json: 使用回数 +1（28→29）」ログ                                                          | **E**（運用ログ。正本の仕様記述ではない）           |
| 5   | `references/lessons-learned-current-2026-04.md`                         | 713      | L-WC-001「EVALS.json は JSON 構造体。merge=ours + post-merge 再生成」                             | **C**（dual root / merge 戦略に該当）               |
| 6   | `references/lessons-learned-current-2026-04-wizard-integration.md`      | 202      | L-WC-001 同一記述                                                                                 | **C**（重複）                                       |
| 7   | `references/lessons-learned-2026-04-early-part-2.md`                    | 349      | L-WC-001 同一記述                                                                                 | **C**（重複）                                       |
| 8   | `references/lessons-learned-2026-04-early.md`                           | 579      | L-WC-001 同一記述                                                                                 | **C**（重複）                                       |
| 9   | `references/lessons-learned-health-policy-worktree-2026-04.md`          | 48       | L-WC-001 同一記述                                                                                 | **C**（重複）                                       |
| 10  | 補助: `task-specification-creator/references/self-improvement-cycle.md` | 97-123   | EVALS.json 構造例（`skillName` / `currentLevel` / `metrics.*` / `phaseMetrics.*` / `patterns.*`） | **A**（スキーマ構造言及）                           |
| 11  | 補助: `task-specification-creator/references/self-improvement-cycle.md` | 126-131  | レベルアップ基準表（Level 2: 10回/80%、Level 3: 50回/90%）                                        | **A**（スキーマ構造言及＝`levelCriteria` 相当）     |
| 12  | 補助: `task-specification-creator/references/self-improvement-cycle.md` | 202      | `- **メトリクス**: See [EVALS.json](../EVALS.json)` ドキュメントリンク                            | **E**（単なるリンク）                               |

### 3.3 分類サマリ

| 分類 | カテゴリ              | 件数 | うち references/ 内 |
| ---- | --------------------- | ---: | ------------------: |
| A    | スキーマ構造言及      |    2 |                   0 |
| B    | consumer 言及         |    1 |                   1 |
| C    | dual root / merge戦略 |    5 |                   5 |
| D    | 変更運用言及          |    1 |                   1 |
| E    | 単なる言及・ログ      |    3 |                   2 |
| 計   |                       |   12 |                   9 |

> references/ 内に **スキーマ構造の詳細記述（分類 A）は存在しない**。A に該当するのは補助ファイル `self-improvement-cycle.md`（task-specification-creator 側）のみ。このため正本側のスキーマ記述面の整合対象は限定的である。

---

## 4. 突合テーブル（カテゴリ別）

### 4.1 スキーマ構造言及（A）

| ref_path                                                          | ref_line | ref_excerpt                                                                                                                                                  | audit_source       | audit_evidence                                                                                                                                                                                                                                                                                   | alignment | finding                                                                  | proposed_action |
| ----------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------ | --------------- |
| `task-specification-creator/references/self-improvement-cycle.md` | 97-123   | `{ skillName, currentLevel, metrics: { totalUsageCount, successCount, failureCount, successRate, averageDuration, lastEvaluated }, phaseMetrics, patterns }` | evals-field-map.md | §3.1〜§3.2 / §3.6 / §3.7 で `skillName` / `currentLevel` / `metrics.totalUsageCount` / `metrics.successCount` / `metrics.failureCount` / `metrics.successRate` / `metrics.averageDuration` / `metrics.lastEvaluated` / `phaseMetrics.*` / `patterns.commonErrors` / `patterns.slowPhases` を列挙 | `aligned` | -                                                                        | -               |
| `task-specification-creator/references/self-improvement-cycle.md` | 126-131  | 「Level 2: 10回以上 / 80%以上」「Level 3: 50回以上 / 90%以上」                                                                                               | evals-field-map.md | §3.4: `levelCriteria.level{N}.usageCount` / `levelCriteria.level{N}.successRate` 定義。数値自体は EVALS.json 実データ依存（正本側は例示のみ）                                                                                                                                                    | `aligned` | 正本は例示・閾値実体は各 EVALS.json 側。正本文書とスキーマキー命名は一致 | -               |

### 4.2 consumer 言及（B）

| ref_path                                             | ref_line | ref_excerpt                                       | audit_source             | audit_evidence                                                                                                                  | alignment | finding | proposed_action |
| ---------------------------------------------------- | -------- | ------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- | --------------- |
| `references/arch-electron-services-details-part1.md` | 115      | `\| EVALS.json \| evals \|`（OTHER_FILES 定数表） | consumer-audit-report.md | §3.1 `apps/desktop/src/main/services/skill/SkillScanner.ts` に `OTHER_FILES = { filename: "EVALS.json", type: "evals" }` を記載 | `aligned` | -       | -               |

### 4.3 dual root 同期言及（C）

| ref_path                                                                                                                                                                                                                                                           | ref_line | ref_excerpt                                                      | audit_source        | audit_evidence                                                                                                                                                                                                                                                     | alignment | finding                                                                                                                                | proposed_action |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| L-WC-001: `lessons-learned-current-2026-04.md:713` / `lessons-learned-current-2026-04-wizard-integration.md:202` / `lessons-learned-2026-04-early-part-2.md:349` / `lessons-learned-2026-04-early.md:579` / `lessons-learned-health-policy-worktree-2026-04.md:48` | 各行     | 「EVALS.json は JSON 構造体 → `merge=ours` + post-merge 再生成」 | dual-root-parity.md | §1 で `.claude` / `.agents` の 6 スキル全件が bit-for-bit 一致（`cmp -s` IDENTICAL、SHA-256 同一）。§4 で「片方欠損 0 件」を確認。merge 戦略自体（ours + 再生成）は dual-root-parity.md のスコープ外だが、**結果として両 root が完全同期している**状態と矛盾しない | `aligned` | 正本は merge 戦略の指針、監査は実態スナップショットの bit-一致を報告しており論点は独立。いずれも「dual root は両方を揃える」方向で一致 | -               |

### 4.4 変更運用言及（D）

| ref_path                             | ref_line | ref_excerpt                         | audit_source           | audit_evidence                                                                                                                                                                                 | alignment | finding                                                                                                             | proposed_action |
| ------------------------------------ | -------- | ----------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- | --------------- |
| `references/claude-code-overview.md` | 272      | 「EVALS.json が存在し、有効なJSON」 | schema-change-guide.md | §2.1 前提条件で「変更対象フィールドが field-map §3 に列挙」「`.claude` / `.agents` 両 root 同時更新」「fixture EVALS.json 連動更新」を規定。§7 検証コマンドで `node -e JSON.parse(...)` を提示 | `aligned` | 正本の「有効な JSON」要件を schema-change-guide.md の検証手順が具体化（JSON パースチェックで validator 不在を補う） | -               |
| `references/claude-code-overview.md` | 127      | 標準フォルダ構造の列挙              | -                      | スキーマ詳細なし。構造のみの言及                                                                                                                                                               | `n/a`     | -                                                                                                                   | -               |

---

## 5. スキーマ構造フィールド集合 diff（ステップ 6 結果）

### 5.1 正本側（`references/` 配下）に登場する EVALS フィールド名

| フィールド名 | 正本ソース                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| （0 件）     | `references/` 内には EVALS の構造体フィールド名（`skillName` / `currentLevel` / `metrics.*` 等）の**キー名記載は一切存在しない**（正規表現: バッククォート囲みのキー名がキー形式で登場するヒット 0 件） |

### 5.2 補助側（`self-improvement-cycle.md`）に登場する EVALS フィールド名（集合 R）

```
skillName, currentLevel, metrics.totalUsageCount, metrics.successCount,
metrics.failureCount, metrics.successRate, metrics.averageDuration,
metrics.lastEvaluated, phaseMetrics, phaseMetrics.<agent>.successRate,
phaseMetrics.<agent>.avgDuration, phaseMetrics.<agent>.usageCount,
patterns.commonErrors[].type, patterns.commonErrors[].count,
patterns.commonErrors[].lastOccurred, patterns.slowPhases[].phase,
patterns.slowPhases[].avgDuration
```

計 17 ユニーク（camelCase 系のみ）。

### 5.3 実態側（`evals-field-map.md` §3）の代表スキーマ由来フィールド集合（抜粋・集合 A）

```
skillName, version, currentLevel, lastUpdated, metrics.totalUsageCount,
metrics.successCount, metrics.failureCount, metrics.successRate,
metrics.averageDuration, metrics.lastEvaluated, levelHistory[],
levelHistory[].level, levelHistory[].achievedAt, levelHistory[].trigger,
levelCriteria.level{N}, levelCriteria.level{N}.usageCount,
levelCriteria.level{N}.successRate, patterns, patterns.commonErrors[].*,
patterns.slowPhases[], patterns.successPatterns[], patterns.frequentAgents[],
phaseMetrics.<phase_id>.*, qualityInsights.*
```

計 56 ユニーク（camelCase v2 系 + snake_case v1 系 + freeform 込、詳細は field-map §4.1）。

### 5.4 集合 diff

| diff                                        | 内容                                                                                                                                                                                                                                                     | 件数 | 意味                                                                                                                                                  |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R − A**（正本にのみ登場・実態にない）     | （なし）正本の `self-improvement-cycle.md` が用いる全フィールド名は実態 field map に存在                                                                                                                                                                 |    0 | 整合                                                                                                                                                  |
| **A − R**（実態にのみ登場・正本に記載なし） | `version`, `lastUpdated`, `levelHistory[*]`, `levelCriteria.*`, `patterns.successPatterns[]`, `patterns.frequentAgents[]`, `qualityInsights.*`（11 フィールド）、snake_case v1 系全フィールド（10 フィールド）、`phaseMetrics.<phase_id>.commonIssues[]` |   22 | 正本の「例示」が実態の最小サブセットにとどまる。正本の記載漏れではなく**例示の粒度選択**（`self-improvement-cycle.md` §3.1 は「構造例」と明示）である |

> 判定: **A − R は「例示 vs 実装拡張」の差であり不整合ではない**。`self-improvement-cycle.md` は `task-specification-creator` スキル固有の自己改善ループ説明で、EVALS.json スキーマの網羅的仕様書ではない。したがって R − A = 0 が成立していれば `aligned`。実装側が `levelHistory` / `levelCriteria` / `qualityInsights` / snake_case 系等を追加で持っていても、正本例示との矛盾は生じない。

---

## 6. 齟齬深掘りと根本原因分類

### 6.1 齟齬候補の深掘り

上記 §4 / §5 の突合結果、**正本と監査成果物の間に明確な `misaligned` は検出されなかった**。ただし、以下 2 点は「正本が実態を網羅していない」という弱い不整合（`needs-review` 扱い）に該当し得る。

| 候補 ID | 観点                                                                                                                                                                            | 正本記述                                                             | 実態                                                                                                                                               | 根本原因分類                                                               | 分類判定     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| NR-1    | **snake_case v1 系（`current_level` / `metrics.total_usage_count` / `levels.*`）が `references/` 配下・`self-improvement-cycle.md` いずれにも記載なし**                         | 記載なし                                                             | `skill-creator` / `aiworkflow-requirements` / `skill-fixture-runner` / fixture が snake_case v1 系スキーマで稼働（evals-field-map.md §3.3 / §3.5） | **表記揺れ・スキーマ方言の正本未記載**                                     | `未タスク化` |
| NR-2    | **`qualityInsights.*` 11 フィールド（`patternAdoptionRate` / `coverageTargetHitRate` / `unassignedTaskDetectionRate` / `notes` / `taskMetrics.*`）が `references/` に記載なし** | 記載なし                                                             | `task-specification-creator/EVALS.json` に実データが存在。writer は手動、reader は実装上 0 件（evals-field-map.md §3.8）                           | **例示の粒度選択だが、「運用で参照するメトリクス」として正本言及が欲しい** | `未タスク化` |
| NR-3    | `validator=0 件`（EVALS.json の構造検証コンシューマがゼロ）の事実が正本に未記載                                                                                                 | 記載なし（`claude-code-overview.md:272` は存在性 + JSON 有効性のみ） | `evals-field-map.md §4.4` および `schema-change-guide.md §メタ情報` で validator=0 件・NaN サイレント破損リスクを明記                              | **監査で判明した新事実・正本に未反映**                                     | `未タスク化` |

### 6.2 `misaligned` が検出されなかった理由

- references/ 内の EVALS 記述は大半が **「存在性 + merge 戦略 + フォルダ構造」** の粒度であり、フィールド名・型・スキーマ変更手順には踏み込んでいない。
- 補助の `self-improvement-cycle.md` のスキーマ例示は `task-specification-creator` の representative 系（camelCase v2）に一致しており、記載のキー名は実態 field map のサブセット。
- Phase 6 で dual root bit-for-bit 一致、Phase 8 で dual root 同一 commit 更新を規定しており、正本の L-WC-001 merge 戦略「`.claude` / `.agents` どちらを触っても他方を追随させる」趣旨と矛盾しない。

### 6.3 許容された差異（`許容` 分類）

| 差異                                                                                                                  | 根拠                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 正本（`claude-code-overview.md:272`）が「EVALS.json が存在し、有効な JSON」のみで **内容バリデーションを課さない**    | 正本は skill 標準構造の存在性チェックリスト。スキーマ妥当性は別レイヤの責務。schema-change-guide.md が validator=0 件を明記して補完しており矛盾なし     |
| 正本が camelCase / snake_case 二重スキーマの**正本性を断定していない**                                                | Phase 2 §3.1「dual root 正本断定禁止」方針に合致。本監査も断定していないため整合                                                                        |
| `self-improvement-cycle.md` の EVALS 例示が `task-specification-creator` 固有（camelCase v2）のみ                     | `self-improvement-cycle.md` は task-specification-creator スキル自身の自己改善サイクル説明であり、他スキルの snake_case v1 系まで記述する責務を負わない |
| L-WC-001 が「JSON 構造 → `merge=ours` + post-merge 再生成」と述べるが、実態 dual root は bit-for-bit 一致で再生成不要 | 再生成は「両 root の片方だけが更新された場合に後段で解消する」救済策。今回は全スキル IDENTICAL のため再生成も不要で、救済策適用前に整合している         |

---

## 7. 未タスク候補リスト（FR-9 / RISK-6 対策）

> 本 Phase では**仕様書ファイルを作成しない**（Phase 12 で作成）。以下は引き継ぎリストのみ。

| candidate_id                    | category | ref_path                                                                                              | summary                                                                                                                                                                      | recommended_task_type | target_record_path                                                                   |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| UNASSIGNED-EVALS-SPEC-ALIGN-001 | A        | `.claude/skills/aiworkflow-requirements/references/`（新規追記対象）                                  | snake_case v1 系スキーマ（`current_level` / `levels.*` / `metrics.total_usage_count` / `metrics.average_satisfaction` 等）が正本未記載。camel/snake 併存の事実を正本化したい | 正本修正              | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`    |
| UNASSIGNED-EVALS-SPEC-ALIGN-002 | A        | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` または新規 reference | `qualityInsights.*` 11 フィールドが正本に未記載。運用で手動メンテする項目の出所が不明                                                                                        | 正本修正              | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md` |
| UNASSIGNED-EVALS-SPEC-ALIGN-003 | D        | `.claude/skills/aiworkflow-requirements/references/`（新規追記対象）                                  | EVALS.json の validator=0 件・NaN サイレント破損リスクが正本未記載。`claude-code-overview.md:272` に validator 実装タスクへのポインタ追記を推奨                              | 正本修正              | `docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`   |

> 3 件とも「正本が実態を網羅していない」という**未タスク化（別タスクで正本を補強）**扱い。本 Phase では正本を変更しない（Phase 1 制約）。

### 7.1 件数サマリ

| status               |           件数 |
| -------------------- | -------------: |
| 修正済               |              0 |
| 未タスク化           |              3 |
| 許容                 | 4（§6.3 列挙） |
| misaligned（未分類） |              0 |

### 7.2 target_record_path 健全性

全 3 件の `target_record_path` は `docs/30-workflows/unassigned-task/` 配下。既存 README（`docs/30-workflows/unassigned-task/README.md`）の命名規則に準拠。

---

## 8. 整合性総括（aligned / partial / misaligned）

### 8.1 判定: **partial**

**理由**:

- `misaligned` 件数 = **0**
- `needs-review` 相当（§6.1 NR-1/NR-2/NR-3）= **3** → 全件「未タスク化」で `docs/30-workflows/unassigned-task/` に記録先指定済み
- 4 件の差異は §6.3 により `許容` 分類

よって Phase 9 ステップ 8 の総括判定表に従い **partial**（needs-review のみ存在、明確な齟齬なし）を選択。

### 8.2 AC-6 解除判定への影響

- **未タスク化 3 件は AC-6 解除の直接障害にはならない**。監査成果物（4 件）は自己完結しており、AC-1〜AC-5 / AC-7 / AC-8 を自力で証拠付けている。
- 正本補強は「監査結果を正本にフィードバックする運用改善」であり、監査品質そのものとは独立。Phase 10 の AC-6 解除判定は、本レポートの `partial` を根拠として「解除可（ただし §7 の 3 件は Phase 12 で未タスク化）」を推奨できる。

### 8.3 FR-9 充足

- §7 に 3 件の未タスク候補を列挙、`target_record_path` 指定済み → **FR-9 PASS**（未タスク記録要件）

---

## 9. QG-8 判定

### 9.1 QG-8 基準（Phase 2 §QG-8）

- [x] `outputs/phase-9/spec-alignment-report.md` が存在
- [x] `outputs/phase-9/raw-refs-hits.txt` が存在（実行コマンド・タイムスタンプをファイル先頭に記録）
- [x] 正本内 EVALS 関連記述が分類 A〜E に仕分けされている（§3.2）
- [x] 分類 A〜D について突合テーブルが作成されている（§4.1〜§4.4）
- [x] フィールド集合 diff（ステップ 6）の結果が記録されている（§5）
- [x] 齟齬が全て「修正済 / 未タスク化 / 許容」のいずれかに分類されている（§7.1）
- [x] 未タスク候補が存在する場合、`target_record_path` が `docs/30-workflows/unassigned-task/` 配下を指している（§7 / §7.2）
- [x] 整合性総括が `aligned` / `partial` / `misaligned` のいずれかに明示（§8.1 = **partial**）
- [x] Phase 10 への引き継ぎ事項セクション存在（§10）
- [x] Phase 1 FR-9 / RISK-6 と整合（§8.3）
- [x] Phase 2 §3.1 の「dual root 正本断定禁止」に違反していない（本 Phase は dual root 正本を断定していない。§6.3 に明記）

### 9.2 QG-8: **PASS**

全チェック項目を満たし、QG-8 通過と判定する。

---

## 10. Phase 10 への引き継ぎ事項

| 項目                            | 値 / 参照                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 整合性総括                      | `partial`（§8.1）                                                                                                                    |
| misaligned 件数                 | 0                                                                                                                                    |
| needs-review（未タスク化）件数  | 3（§7）                                                                                                                              |
| 許容された差異                  | 4 件（§6.3）                                                                                                                         |
| AC-6 解除判定への影響           | **影響なし**（§8.2）。未タスク 3 件は Phase 12 で `unassigned-task/` へ記録する運用補強項目                                          |
| Phase 10 が参照すべきセクション | §4.1〜§4.4（突合テーブル）、§6（齟齬深掘り）、§7（未タスク候補）、§8（総括）、§9（QG-8 判定）                                        |
| AC-6 ステータス推奨             | **解除可**（条件付き）: §7 の 3 件を Phase 12 で `unassigned-task/` に記録することを前提                                             |
| Phase 12 への引き継ぎ           | §7 の 3 候補（UNASSIGNED-EVALS-SPEC-ALIGN-001/002/003）を `unassigned-task-detection.md` に反映。`target_record_path` をそのまま採用 |
| 正本不変性                      | `git status` 空（本 Phase は正本を変更していない）                                                                                   |

---

## 11. 自己検証（§6 自己検証コマンド相当）

| コマンド                                                                                                                                       | 期待結果               | 実施結果                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------- |
| `test -f outputs/phase-9/spec-alignment-report.md && test -f outputs/phase-9/raw-refs-hits.txt`                                                | OK 2 件                | **PASS**                          |
| `rg -n '分類A\|分類B\|分類C\|分類D\|分類E\|スキーマ構造言及\|consumer 言及\|dual root 同期言及\|変更運用言及' spec-alignment-report.md`        | 各カテゴリ名がヒット   | **PASS**（§3.3 / §4 各節見出し）  |
| `rg -n 'ref_path\|ref_line\|audit_source\|alignment\|proposed_action' spec-alignment-report.md`                                                | 突合テーブル列名ヒット | **PASS**（§4.1〜§4.4 の列ヘッダ） |
| `rg -n '整合性総括\|aligned\|partial\|misaligned' spec-alignment-report.md`                                                                    | 判定語彙ヒット         | **PASS**（§8）                    |
| `rg -o 'docs/30-workflows/unassigned-task/[^ )]+' spec-alignment-report.md \| sort -u`                                                         | 3 件                   | **PASS**（§7 の 3 行）            |
| `git status .claude/skills/aiworkflow-requirements/references/ .claude/skills/task-specification-creator/references/self-improvement-cycle.md` | 変更なし               | **PASS**（正本不変）              |

---

## 12. 参照資料

- Phase 1 要件定義: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`
- Phase 2 スコープ: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md`
- Phase 3 Phase 設計（Phase 9 章）: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`
- Phase 5 consumer-audit-report.md
- Phase 5 evals-field-map.md
- Phase 6 dual-root-parity.md
- Phase 8 schema-change-guide.md
- 未タスクテンプレート: `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- 生データ: `outputs/phase-9/raw-refs-hits.txt`

---

## 13. 変更履歴

| Date       | 変更内容                                                                    |
| ---------- | --------------------------------------------------------------------------- |
| 2026-04-19 | Phase 9 初版作成。QG-8 PASS 判定、整合性総括=partial、未タスク候補 3 件記録 |
