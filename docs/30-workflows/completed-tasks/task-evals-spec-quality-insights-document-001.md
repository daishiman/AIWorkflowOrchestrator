# qualityInsights フィールド群の正本化 - タスク指示書

## メタ情報

```yaml
issue_number: null
task_id: UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001
task_name: qualityInsights 11 フィールドの役割・writer・運用責任を正本仕様へ追加
category: 要件
target_feature: EVALS.json スキーマ仕様（representative / task-specification-creator 系）
priority: 中
scale: 小規模
status: completed
completed_date: 2026-04-19
completed_in: TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 9 / Phase 12
created_date: 2026-04-19
dependencies: []
spec_path: docs/30-workflows/completed-tasks/task-evals-spec-quality-insights-document-001.md
```

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001                      |
| タスク名     | qualityInsights 11 フィールドの役割・writer・運用責任を正本仕様へ追加    |
| 分類         | 要件                                                                     |
| 対象機能     | EVALS.json スキーマ仕様（representative / task-specification-creator系） |
| 優先度       | 中                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 完了（2026-04-19）                                                       |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 9 / Phase 12                         |
| 発見日       | 2026-04-19                                                               |
| 関連タスク   | （独立・他タスク非依存）                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-EVALS-CONSUMER-AUDIT-001 の Phase 5 field-map 及び Phase 9 spec-alignment-report.md により、
`qualityInsights.*`（全 11 フィールド）は **representative スキーマ（task-specification-creator 系）
固有** の構造であり、正本仕様（`.claude/skills/aiworkflow-requirements/references/`
および `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`）には
**フィールド一覧・writer・運用責任のいずれも未記載** であることが判明した。

対象フィールド（Phase 5 §3.8 より）:

- `qualityInsights`（object ルート）
- `qualityInsights.patternAdoptionRate`（number 0-1）
- `qualityInsights.coverageTargetHitRate`（number）
- `qualityInsights.unassignedTaskDetectionRate`（number）
- `qualityInsights.notes`（freeform string / RISK-7 該当）
- `qualityInsights.taskMetrics`（object / 任意キー `TASK-xxx`）
- `qualityInsights.taskMetrics.<TASK_ID>.completedPhases`（number）
- `qualityInsights.taskMetrics.<TASK_ID>.totalTests`（number）
- `qualityInsights.taskMetrics.<TASK_ID>.avgCoverage`（number）
- `qualityInsights.taskMetrics.<TASK_ID>.systemSpecsUpdated`（number）
- `qualityInsights.taskMetrics.<TASK_ID>.unassignedTasksDetected`（number）

### 1.2 問題点・課題

- Phase 5 field-map で `writers=（手動）` / `readers=（実 read なし）` / `validators=なし` と確定しており、
  script 系の自動書き換えが一切存在しない（silent break 検知不可）。
- 誰が / いつ / どのトリガーで更新するかが正本に書かれていないため、運用知識が属人化している。
- `qualityInsights.notes` は自由記述（freeform string）で型チェック不能、RISK-7 対象。
- 同じ camelCase v2 系スキルである int-test-skill / github-issue-manager へ波及させるか、
  それとも task-specification-creator 固有で留めるかの判断が正本未定義。

### 1.3 放置した場合の影響

- representative スキーマの一貫性崩壊: 新規 writer が勝手にスキーマを増殖させる余地が残る。
- 運用漏れ: qualityInsights が長期未更新でも気付かず、品質評価に使えない。
- 他スキルへの波及混乱: camelCase v2 系を横展開する際、qualityInsights を持たせるか否かで判断根拠が無い。
- 将来の validator 実装時（UNASSIGNED-EVALS-SPEC-ALIGN-003 と連動）に検証ルールが書けない。

---

## 2. 何を達成するか（What）

### 2.1 目的

`qualityInsights.*` 11 フィールドの **フィールド定義 / writer（手動更新主体）/ 更新トリガー /
運用責任** を正本仕様（task-specification-creator 系 references）に追記し、
camelCase v2 系スキル横展開時の判断基準を明文化する。

### 2.2 最終ゴール

- `qualityInsights.*` 11 フィールドが正本仕様で一覧化されている。
- 各フィールドの **writer = 手動** であることと、更新主体・トリガー・頻度が明記されている。
- **validator 未整備のため silent break する** という運用リスクが正本で告知されている。
- 他 camelCase v2 系スキル（int-test-skill / github-issue-manager）への適用可否が判断できる。

### 2.3 スコープ

#### 含むもの

- `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` への追記、
  または新規 reference（例: `evals-quality-insights.md`）の作成。
- Phase 5 field-map §3.8 の 11 行を正本側に転記（readers / writers / validators / notes 含む）。
- 手動更新の運用ルール（誰が / いつ / トリガー）を文書化。
- 他 camelCase v2 系スキルへの波及方針を 1 項目として記述。

#### 含まないもの

- `EVALS.json` 実データの書き換え。
- validator 実装（これは UNASSIGNED-EVALS-SPEC-ALIGN-003 / task-evals-spec-validator-zero-document-001 で扱う）。
- snake_case v1 系スキーマへの qualityInsights 導入（範囲外）。
- log_usage.js などの script 側への自動 writer 追加。

### 2.4 成果物

| 成果物                 | パス                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| 正本追記（主候補）     | `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`      |
| 新規 reference（代替） | `.claude/skills/task-specification-creator/references/evals-quality-insights.md`      |
| 参照根拠               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §3.8  |
| 整合確認               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 5 の field-map が確定済み（§3.8 に 11 行存在）。
- Phase 9 の spec-alignment-report で `qualityInsights` が正本未記載と判定済み。
- 正本修正は Phase 1 制約で本監査タスクでは実施しないため、別タスク（本タスク）に切り出している。

### 3.2 依存タスク

| タスクID                                          | ステータス | 関係                                                 |
| ------------------------------------------------- | ---------- | ---------------------------------------------------- |
| TASK-EVALS-CONSUMER-AUDIT-001                     | 実施中     | Phase 5 / Phase 9 の成果物を根拠として参照           |
| UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001 | 未実施     | validator 未整備リスクの別タスク。記述の相互参照可能 |

### 3.3 必要な知識

- EVALS.json スキーマ 4 系統（representative / camel-minimal / legacy-snake-v1 / legacy-snake-min）の違い。
- Phase 5 field-map の読み方（readers / writers / validators / risk_on_change / notes）。
- `.claude/skills/*/references/` の更新方針（aiworkflow-requirements / task-specification-creator 両経路）。
- Markdown 表形式での 11 フィールド列挙。

### 3.4 推奨アプローチ

1. Phase 5 field-map §3.8 の 11 行をそのまま転記できる表を正本に作成。
2. 表の直後に運用ルールを箇条書きで追加:
   - writer（手動更新主体）= タスク完了時に task-specification-creator が人手で更新
   - トリガー = 各 TASK Phase 12 完了時、または quarterly レビュー
   - validator 未整備のため silent break リスクがあることを注記
3. 他 camelCase v2 系スキルへの適用可否を「現時点では task-specification-creator 固有」と明記
   （将来拡張する場合は別タスクで合意を取る）。
4. `aiworkflow-requirements/references/` 側にも相互参照リンクを追加するか検討。

### 3.5 参考資料

- `.claude/skills/task-specification-creator/EVALS.json`（qualityInsights 実例データ）
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` §3.8
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/skill-feedback-report.md`

---

## 4. 苦戦箇所記録

### 4.1 記録1: writer が自動化されていない

`qualityInsights.*` は representative スキーマのみに存在し、log_usage.js などの
script 側には writer が存在しない。Phase 5 の writers 欄は **全 11 行で `（手動）`** と記録されている。
そのため「誰が書き換えるか」を正本で明文化しなければ、存在自体が忘れられる可能性がある。

**対処方針**:

- 正本に writer = 手動（task-specification-creator 運用担当）を明記。
- 更新主体・タイミング・トリガーを 3 点セットで記述する。

### 4.2 記録2: 更新トリガーと運用責任が未定義

手動更新前提だが、「どのイベントで更新するのか」が正本に無い。
実データ（EVALS.json）には `TASK-7D` / `TASK-8A` / `TASK-7C` / `TASK-SKILL-RETRY-001` 等の
task 単位レコードが存在するため、TASK 完了時に記入していると推測できるが、
**ルールとして文書化されていないため属人運用** になっている。

**対処方針**:

- 更新トリガーを「各 TASK の Phase 12 完了時 + 月次レビュー」と明示。
- 責任主体を「task-specification-creator スキル利用者（タスク起案者）」と定義。

### 4.3 記録3: validator=0 件のため silent break を自動検出できない

Phase 5 field-map §4 で `validators=なし` が全 11 行で記録されており、値が欠落／型崩壊しても
**自動的に検出する仕組みが無い**。特に `qualityInsights.notes` は freeform string で RISK-7 該当、
手動更新漏れが表面化しない。

**対処方針**:

- 正本に「validator 未整備による silent break リスク」を注記。
- UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001 への相互参照を追加し、
  将来 validator を入れる際の足掛かりにする。

### 4.4 記録4: 他 camelCase v2 系スキルへの波及判断が未定義

`qualityInsights` は representative（task-specification-creator）固有だが、
同じ camelCase v2 系に分類される int-test-skill / github-issue-manager（Phase 5 §2 参照）にも
横展開するかの判断材料が正本に無い。横展開すれば一貫性は上がるが、手動運用負荷も増える。

**対処方針**:

- 現時点では **task-specification-creator 固有** として明記。
- 横展開する場合は新規タスクを切って合意形成するルールを正本に追加。

---

## 5. 完了条件

- [ ] `qualityInsights.*` 11 フィールドの一覧が正本仕様（task-specification-creator 系 references）に記載されている
- [ ] 各フィールドが **手動更新フィールド**（writer=手動）であることが明示されている
- [ ] 更新主体 / 更新トリガー / 更新頻度の 3 点が明記されている
- [ ] validator 未整備による silent break リスクが注記されている
- [ ] 他 camelCase v2 系スキル（int-test-skill / github-issue-manager）への波及方針が明記されている
- [ ] Phase 5 field-map §3.8 / Phase 9 spec-alignment-report.md への参照リンクが追加されている
- [ ] Markdown lint / references/ の読み込みテストが壊れていない

---

## 完了記録

- **完了ステータス**: completed
- **完了日**: 2026-04-19
- **完了方法**: aiworkflow-requirements skill への反映（UPDATE-SPEC-002）
- **実装場所**:
  - `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §6（qualityInsights 11 フィールド正本化）
  - `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md` §6（dual-root mirror）
- **完了の根拠**: TASK-EVALS-CONSUMER-AUDIT-001 Phase-12 close-out に続く skill 反映 wave（TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE）で UPDATE-SPEC-002 として実装完了
- **関連**: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/system-spec-update-summary.md` UPDATE-SPEC-002
