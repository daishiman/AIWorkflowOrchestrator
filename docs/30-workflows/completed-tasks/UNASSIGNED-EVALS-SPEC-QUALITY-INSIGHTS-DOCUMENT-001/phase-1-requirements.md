# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 1                                                   |
| タスクID   | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001 |
| ステータス | completed                                           |
| 作成日     | 2026-04-21                                          |

## 目的

> **2026-04-21 current facts 補正**: Phase 1 では当初「11フィールド」前提で棚卸しを始めたが、最終的な実装実態は 10 実フィールド + 11 検証ポイントだった。以降は `outputs/phase-1/field-inventory.md` と `outputs/phase-1/requirements-definition.md` を正本とする。

`qualityInsights.*` 11フィールドの現在の実装状態を調査し、フィールドの棚卸し・writer現状調査・正本仕様への追記要件を定義する。曖昧な前提のまま設計フェーズに進まず、このフェーズで事実ベースの情報を収集し、受け入れ基準（AC）を確定する。

## 実行タスク

### Step 0: P50チェック（qualityInsightsの現在の実装状態を確認）

docs-only タスクの起点確認として、以下を実施する。

- `task-specification-creator` の `EVALS.json` を読み込み、`qualityInsights` セクションの全フィールドを把握する（`.claude/skills/task-specification-creator/EVALS.json`）
- 他スキル（`skill-creator`・`aiworkflow-requirements`・`github-issue-manager`・`int-test-skill`・`skill-fixture-runner`）の `EVALS.json` を読み込み、`qualityInsights` セクションの有無を確認する
- `.agents/skills/` 配下の対応ファイルについても同様に確認し、`.claude/skills/` との差分を記録する
- `references/` 配下に `qualityInsights` フィールドの定義が既に記載されているファイルがあるかを検索する（`grep -rn "qualityInsights"` 相当）
- TASK-EVALS-CONSUMER-AUDIT-001 の成果物（`consumer-audit-report.md`・`evals-field-map.md`）が存在する場合は参照し、調査の重複を避ける

P50チェックの目的は「既に定義済みの仕様書が存在しないか」を確認することで、verify_existing モードへの移行判断を早期に行うことである。

### Step 1: qualityInsights 11フィールドの棚卸し

`task-specification-creator/EVALS.json` を正本として、`qualityInsights` セクションに含まれる全フィールドを列挙する。

各フィールドについて以下を記録する。

| フィールド名 | 型  | 現在の値（サンプル） | 現在の定義箇所 |
| ------------ | --- | -------------------- | -------------- |
| （列挙結果） |     |                      |                |

調査対象フィールド（代表例・Step 0調査後に確定）:

- `patternAdoptionRate`
- `coverageTargetHitRate`
- `unassignedTaskDetectionRate`
- `notes`
- `taskMetrics`（オブジェクト。配下フィールドも列挙）
  - `taskMetrics.{TASK_ID}.completedPhases`
  - `taskMetrics.{TASK_ID}.totalTests`
  - `taskMetrics.{TASK_ID}.avgCoverage`
  - `taskMetrics.{TASK_ID}.systemSpecsUpdated`
  - `taskMetrics.{TASK_ID}.unassignedTasksDetected`

Step 0の結果で追加フィールドが判明した場合は上記リストに追記し、合計11フィールドに達することを確認する。11フィールドに満たない/超える場合はその理由を記録する。

### Step 2: writer・更新トリガーの現状調査

`qualityInsights.*` の各フィールドを「誰が・いつ・どのトリガーで」更新しているかを調査する。

調査方法:

- `.claude/skills/task-specification-creator/scripts/` 配下の全スクリプトを確認し、`qualityInsights` を参照・更新しているスクリプトを特定する
- `.agents/skills/task-specification-creator/scripts/` 配下についても同様に確認する
- `log-usage.js` / `log_usage.js` / `collect_feedback.js` / `init_skill.js` 等の既知consumerが `qualityInsights` を扱っているか確認する
- TASK-EVALS-CONSUMER-AUDIT-001 の `evals-field-map.md` が存在する場合は参照する

調査結果を以下の表にまとめる。

| フィールド名 | 現在のwriter | 更新トリガー | 自動/手動 | 更新頻度 |
| ------------ | ------------ | ------------ | --------- | -------- |
| （調査結果） |              |              |           |          |

特に「writerが不在・更新トリガー不明」のフィールドを「未管理フィールド」として明示する。

### Step 3: 正本仕様への追記要件定義

Step 1・Step 2の調査結果をもとに、正本仕様への追記要件を定義する。

#### 3-1: 追記対象ファイルの特定

以下の候補ファイルから、どのファイルに追記するかを判定する。

- `.claude/skills/task-specification-creator/references/` 配下の仕様ファイル（`self-improvement-cycle.md` 等）
- `EVALS.json` のスキーマ定義が記載されるべき正本ファイル（TASK-EVALS-CONSUMER-AUDIT-001 の成果物 `evals-field-map.md` 等）
- `references/` 配下に新規ファイルとして `evals-quality-insights-spec.md` を作成するか既存ファイルへ追記するか

追記先の判定基準:

- 既存ファイルに追記可能な場合は既存ファイルへ追記する（新規ファイル作成を避ける）
- 既存ファイルが500行を超える場合は責務分離を検討する

#### 3-2: validator導入要件

validator（フィールドの存在・型・値域を検証するスクリプトまたはスキーマ）の導入要否を判定する。

- 現状でvalidatorが0件であることを確認する
- silent break防止のためにvalidatorが必要かどうかを判定する
- 必要な場合は「どのような検証を行うか」「どのタイミングで実行するか」を要件として定義する
- 実装コードは本タスクのスコープ外であることを明記する

#### 3-3: 他スキルへの波及要件

以下のスキルについて、`qualityInsights` セクションを追加すべきかどうかを判定し、要件として記録する。

- `int-test-skill`: qualityInsightsが有効かどうか（スキル成熟度指標が存在するか）
- `github-issue-manager`: 同様に判定する
- その他のスキル: opt-in方針かopt-out方針かを決定する

## 参照資料

- `.claude/skills/task-specification-creator/EVALS.json`（現行qualityInsights実装の正本）
- `.agents/skills/task-specification-creator/EVALS.json`（dual root確認）
- `.claude/skills/*/EVALS.json`（他スキルのqualityInsights有無確認）
- `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`（EVALS.json構造説明文書）
- `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`（発見元・consumer audit情報）
- TASK-EVALS-CONSUMER-AUDIT-001 の成果物（存在する場合）

## 実行手順

1. Step 0のP50チェックを実施し、既存仕様書の存在を確認する
2. `task-specification-creator/EVALS.json` を読み込み、`qualityInsights` セクションを抽出する
3. `outputs/phase-1/field-inventory.md` にフィールド棚卸し結果を記載する
4. 他スキルの `EVALS.json` を読み込み、`qualityInsights` セクション有無を確認する
5. スクリプト調査を実施し、writer・更新トリガーを `outputs/phase-1/writer-survey.md` に記載する
6. 追記対象ファイル・validator要件・波及要件を `outputs/phase-1/requirements-definition.md` に記載する
7. 受け入れ基準（AC-1〜AC-N）を確定し、`outputs/phase-1/acceptance-criteria.md` に記載する

## 統合テスト連携

Phase 1は調査・分析フェーズであるためコード変更は行わない。以下を統合ポイントとして確認する。

- TASK-EVALS-CONSUMER-AUDIT-001 の成果物が存在する場合は参照し、調査内容の重複を避ける
- `qualityInsights` フィールドを参照しているconsumerが本フェーズの調査で新たに判明した場合は、TASK-EVALS-CONSUMER-AUDIT-001 の `consumer-audit-report.md` への追記を要件として記録する（実施は後続フェーズ）

docs-only タスクとして、以下の接続要件を要件定義に明記する。

- 正本仕様はACの入力として参照されること
- consumer audit結果との整合が仕様書に明示されること
- dual root（.claude/ と .agents/）のどちらを正本とするかが仕様に記載されること

## 多角的チェック観点

- **網羅性**: `qualityInsights` 配下のサブフィールド（`taskMetrics.{TASK_ID}.*` 等の動的キー）を見落とさず11件全て列挙しているか
- **dual root**: `.claude/skills/` と `.agents/skills/` の `EVALS.json` が同一内容かを確認したか
- **writer漏れ**: `qualityInsights` を更新するスクリプトが他のスキルのスクリプト配下にも存在しないかを確認したか
- **verify_existing**: 既存の `references/` ファイルに同一内容が存在しないかを確認したか（重複作成防止）
- **スコープ逸脱防止**: この調査フェーズでコード変更や仕様変更を行っていないことを確認する

## サブタスク管理

| サブタスクID | 内容                               | 担当Step |
| ------------ | ---------------------------------- | -------- |
| ST-1-01      | P50チェック・既存仕様書の確認      | Step 0   |
| ST-1-02      | qualityInsights 11フィールドの列挙 | Step 1   |
| ST-1-03      | 他スキルのqualityInsights有無確認  | Step 1   |
| ST-1-04      | writer・更新トリガーの調査         | Step 2   |
| ST-1-05      | 追記対象ファイルの特定             | Step 3-1 |
| ST-1-06      | validator導入要件の定義            | Step 3-2 |
| ST-1-07      | 他スキルへの波及要件の定義         | Step 3-3 |
| ST-1-08      | 受け入れ基準（AC）の確定           | Step 3   |

## 成果物

- `outputs/phase-1/field-inventory.md`（qualityInsights 全フィールドの棚卸し一覧。フィールド名・型・現在値サンプル・現在の定義箇所を列形式で記載）
- `outputs/phase-1/writer-survey.md`（writer・更新トリガー調査結果。フィールドごとのwriter・自動/手動・更新頻度を列形式で記載。未管理フィールドを末尾に明示）
- `outputs/phase-1/requirements-definition.md`（正本仕様への追記要件。追記先ファイル候補・validator導入要件・他スキル波及要件を記載）
- `outputs/phase-1/acceptance-criteria.md`（受け入れ基準 AC-1〜AC-N の一覧）

## 受け入れ基準（AC）

| AC   | 内容                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| AC-1 | `task-specification-creator/EVALS.json` と `evals-schema-spec.md` の `qualityInsights` 現行定義が突合されている |
| AC-2 | `qualityInsights` 現行11項目の型・意味・writer・更新主体が事実ベースで棚卸しされている                          |
| AC-3 | 正本 update/no-op の判定根拠が記録されている                                                                    |
| AC-4 | validator=0件 の扱いが current facts と後続タスク境界で整理されている                                           |
| AC-5 | 他スキルへの波及方針が opt-in / opt-out の判断軸付きで記録されている                                            |

## 完了条件

- [ ] `qualityInsights` セクションの全フィールドが `field-inventory.md` に漏れなく列挙されている（11フィールドまたは実際のフィールド数）
- [ ] 各フィールドの型・現在値サンプル・現在の定義箇所が記載されている
- [ ] 他スキルの `qualityInsights` 有無が全スキルについて確認されている
- [ ] writer・更新トリガーが全フィールドについて調査されており、未管理フィールドが明示されている
- [ ] 正本仕様への追記対象ファイルが特定されている
- [ ] validator導入の要否判定が記載されている
- [ ] 他スキルへの波及要件（opt-in/opt-out方針）が記載されている
- [ ] 受け入れ基準（AC-1〜AC-N）が確定している

## タスク100%実行確認【必須】

以下を順番に確認すること。

1. `field-inventory.md` のフィールド数が `task-specification-creator/EVALS.json` の `qualityInsights` セクションのフィールド数と一致しているか
2. `writer-survey.md` のフィールド数が `field-inventory.md` のフィールド数と一致しているか（全フィールドに対してwriter調査が完了しているか）
3. `requirements-definition.md` に追記先ファイル・validator要件・波及要件が3点とも記載されているか
4. `acceptance-criteria.md` の各ACが measurable（達成の可否が判定できる）な記述になっているか
5. P50チェックで既存の仕様書が見つかった場合、それをStep 3の追記先候補として記録したか

## 次Phase

Phase 2（設計）へ進む。`field-inventory.md`・`writer-survey.md`・`requirements-definition.md`・`acceptance-criteria.md` を入力として、qualityInsights 11フィールドの仕様設計・writer設計・validator設計・追記箇所の特定を行う。
