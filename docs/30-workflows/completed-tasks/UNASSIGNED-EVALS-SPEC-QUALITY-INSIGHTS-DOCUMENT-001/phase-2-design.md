# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 2                                                                                                                                                        |
| タスクID   | UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001                                                                                                      |
| ステータス | completed                                                                                                                                                |
| 作成日     | 2026-04-21                                                                                                                                               |
| 入力       | outputs/phase-1/field-inventory.md, outputs/phase-1/writer-survey.md, outputs/phase-1/requirements-definition.md, outputs/phase-1/acceptance-criteria.md |

## 目的

> **2026-04-21 current facts 補正**: Phase 2 設計時の「11フィールド」は、`taskMetrics` 配下の確認ポイントを含めた設計上の数え方だった。close-out 後の正本は 10 実フィールド + 11 検証ポイントである。

Phase 1 で確定したフィールド棚卸し結果・writer調査結果・追記要件を入力として、`qualityInsights` 11フィールドの仕様設計・writer設計・validator設計案・正本仕様への追記箇所を確定する。後続のPhase 4（ドキュメント作成）が迷いなく実施できる状態にすることが目的である。

## 実行タスク

### Step 1: qualityInsights 11フィールドの仕様設計（フィールド定義表）

Phase 1 の `field-inventory.md` を入力として、各フィールドの正式仕様を定義する。

#### フィールド定義表（設計案）

| フィールド名                                    | 型                       | 必須/省略可    | 値域・制約           | 説明                                                                     |
| ----------------------------------------------- | ------------------------ | -------------- | -------------------- | ------------------------------------------------------------------------ |
| `patternAdoptionRate`                           | number                   | 省略可         | 0.0〜1.0             | スキルの成功パターンがタスク実行で採用された割合                         |
| `coverageTargetHitRate`                         | number                   | 省略可         | 0.0〜1.0             | カバレッジ目標値に到達したタスクの割合                                   |
| `unassignedTaskDetectionRate`                   | number                   | 省略可         | 0.0〜1.0             | Phase 12 で未タスク検出が正しく実施されたタスクの割合                    |
| `notes`                                         | string                   | 省略可         | 自由記述・上限なし   | スキル改善・タスク実行に関する自由記述メモ（Phase 12 closeout 時に追記） |
| `taskMetrics`                                   | Record\<string, object\> | 省略可         | キー: タスクID文字列 | 完了済みタスクごとの詳細メトリクスを格納するオブジェクト                 |
| `taskMetrics.{TASK_ID}.completedPhases`         | number                   | 必須（存在時） | 整数・1〜13          | そのタスクで完了したPhase数                                              |
| `taskMetrics.{TASK_ID}.totalTests`              | number                   | 必須（存在時） | 整数・0以上          | そのタスクで作成・実行した総テスト数（docs-only: 0 を記録）              |
| `taskMetrics.{TASK_ID}.avgCoverage`             | number                   | 必須（存在時） | 0.0〜100.0           | そのタスクにおける平均コードカバレッジ（%）（docs-only: 0 を記録）       |
| `taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number                   | 必須（存在時） | 整数・0以上          | そのタスクで更新したシステム仕様書のファイル数                           |
| `taskMetrics.{TASK_ID}.unassignedTasksDetected` | number                   | 必須（存在時） | 整数・0以上          | そのタスクのPhase 12で検出・記録した未タスク数                           |

> 注記: `taskMetrics` はオブジェクトの1フィールドであるが、配下の5サブフィールドを含めて合計11フィールドとして数える。
> Phase 1 の調査結果に基づいて上記フィールド数が11であることを確認し、差分がある場合は本表を更新すること。

#### フィールド設計の根拠

- `patternAdoptionRate` / `coverageTargetHitRate` / `unassignedTaskDetectionRate`: スキルのself-improvement-cycle評価に使用する指標。0〜1の正規化率として定義することで複数スキル間の比較を可能にする。
- `notes`: 長文のフリーテキストであり、自動集計が困難なため手動管理とする。
- `taskMetrics`: タスクIDをキーとした動的オブジェクト。各タスク完了時に1エントリを追加する運用とする。

### Step 2: writer・更新タイミング・運用責任の設計

Phase 1 の `writer-survey.md` を入力として、各フィールドのwriter・更新タイミング・運用責任を設計する。

#### writer設計表

| フィールド名                                   | writer          | 更新タイミング                              | 自動/手動 | 運用責任者   |
| ---------------------------------------------- | --------------- | ------------------------------------------- | --------- | ------------ |
| `patternAdoptionRate`                          | Phase 12 実行者 | タスクPhase 12 closeout 時                  | 手動      | タスク担当者 |
| `coverageTargetHitRate`                        | Phase 12 実行者 | タスクPhase 12 closeout 時                  | 手動      | タスク担当者 |
| `unassignedTaskDetectionRate`                  | Phase 12 実行者 | タスクPhase 12 closeout 時                  | 手動      | タスク担当者 |
| `notes`                                        | Phase 12 実行者 | タスクPhase 12 closeout 時（追記）          | 手動      | タスク担当者 |
| `taskMetrics.{TASK_ID}.*`（全5サブフィールド） | Phase 12 実行者 | タスクPhase 12 closeout 時（1エントリ追加） | 手動      | タスク担当者 |

#### 設計方針の根拠

- **手動管理を正式化**: 現状では `qualityInsights.*` の自動更新スクリプトが存在しない。自動化は別タスクに分離し、本タスクでは「手動更新が正式な運用」として明文化する。
- **更新タイミングを Phase 12 closeout に固定**: Phase 12 は `documentation-changelog.md` / `skill-feedback-report.md` / `unassigned-task-detection.md` を作成するフェーズであり、スキルのquality evaluation を行うタイミングとして適切である。
- **更新手順の明文化**: 単に「手動」とするだけでなく、「どのデータを参照して各フィールドを計算するか」を `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` 等の現行ガイドへ追記する設計とする（本タスクのスコープ内で追記）。

#### 自動化の将来方針（スコープ外）

以下は本タスクのスコープ外であるが、将来の自動化タスクへの引き継ぎとして設計書に記録する。

- `patternAdoptionRate` / `coverageTargetHitRate` / `unassignedTaskDetectionRate` は `phase-12-documentation-guide.md` に記載された数値から機械的に算出可能であり、スクリプト化の候補となる
- `taskMetrics.*` は各タスクの `artifacts.json` から集計可能であり、`log-usage.js` 系スクリプトの拡張として実装できる

### Step 3: validator導入の設計案

Phase 1 の validator導入要件に基づいて、設計案を定義する。

#### validator設計案（実装はスコープ外）

| 検証項目                                   | 検証方法                                         | 実行タイミング   |
| ------------------------------------------ | ------------------------------------------------ | ---------------- |
| `qualityInsights` セクションの存在確認     | キー存在チェック（`"qualityInsights" in evals`） | EVALS.json更新後 |
| rate系フィールドの値域確認（0.0〜1.0）     | 数値範囲チェック                                 | EVALS.json更新後 |
| `taskMetrics` 配下の必須サブフィールド確認 | 各エントリに5サブフィールドが存在するかチェック  | EVALS.json更新後 |
| `notes` の型確認（string）                 | typeof チェック                                  | EVALS.json更新後 |

validator実装のアプローチ案:

- **JSON Schema**: `EVALS.json` 全体に対してJSON Schemaを定義し、`ajv` 等で検証する
- **custom script**: `validate-evals.js` を `.claude/skills/task-specification-creator/scripts/` に追加する
- **既存validator拡張**: `validate-skill-structure.js` の拡張として実装する

> 注記: 上記はいずれも本タスクのスコープ外（コード変更禁止）である。本タスクでは「どのvalidatorを実装すべきか」の設計案を文書化するのみとし、実装は別タスクとして未タスク記録に追加する。

### Step 4: 正本仕様への追記箇所の特定

Phase 1 の `requirements-definition.md` を入力として、正本仕様への追記箇所を確定する。

#### 追記候補ファイルの評価

| 候補ファイル                                                                     | 評価                                                                                  | 採用/却下 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------- |
| `.claude/skills/task-specification-creator/references/self-improvement-cycle.md` | EVALS.json の利用方法が記載されており、qualityInsights の説明を追加するのに適切       | 採用候補  |
| TASK-EVALS-CONSUMER-AUDIT-001 の `evals-field-map.md`（存在する場合）            | qualityInsightsフィールドの詳細定義を追記するのに最適。存在しない場合は新規作成を検討 | 採用候補  |
| `.claude/skills/task-specification-creator/references/` 配下の新規ファイル       | `evals-quality-insights-spec.md` を新規作成する。既存ファイルへの追記が困難な場合のみ | 条件付き  |

#### 追記内容の設計

各追記先ファイルに対して、以下の構造で記載する。

```markdown
## qualityInsights フィールド仕様

### 概要

qualityInsights セクションはスキルの品質評価指標を管理する。
metrics セクション（自動更新）とは異なり、手動更新が前提である。

### フィールド定義

（Step 1 のフィールド定義表を転記）

### writer・更新タイミング

（Step 2 の writer設計表を転記）

### 運用手順

Phase 12 closeout 時に以下を実施する。

1. completedPhases: Phase 12 まで完了した場合は 12 を記入する
2. totalTests: 本タスクのテスト数を記入する（docs-only: 0）
3. avgCoverage: 平均カバレッジを記入する（docs-only: 0）
4. systemSpecsUpdated: 更新したシステム仕様書のファイル数を記入する
5. unassignedTasksDetected: 検出した未タスク数を記入する
6. rate系フィールド: 過去タスクの taskMetrics から算出する
7. notes: スキル改善知見を追記する

### 他スキルへの展開方針

（Step 5 の設計結果を転記）
```

### Step 5: 他スキルへの展開方針の設計

Phase 1 の波及要件に基づいて、他スキルへの `qualityInsights` 展開方針を設計する。

#### 展開方針設計表

| スキル名                   | qualityInsights の有無 | 展開方針                                                 |
| -------------------------- | ---------------------- | -------------------------------------------------------- |
| task-specification-creator | あり（正本）           | 変更なし。仕様定義の対象とする                           |
| skill-creator              | なし（現時点）         | opt-in: usage count が10以上に達した時点で追加を推奨する |
| aiworkflow-requirements    | なし（現時点）         | opt-in: 同上                                             |
| github-issue-manager       | なし（現時点）         | opt-in: 同上                                             |
| int-test-skill             | なし（現時点）         | opt-in: 同上                                             |
| skill-fixture-runner       | なし（現時点）         | opt-in: 同上                                             |

展開方針: **opt-in** を採用する。理由は以下のとおり。

- 各スキルの成熟度・usage countに応じて追加タイミングが異なるため、強制展開は適切でない
- `task-specification-creator` が唯一の有効なサンプルであり、他スキルへの追加に際しては本仕様書を参照して手動追加する運用とする

## 参照資料

- `outputs/phase-1/field-inventory.md`（フィールド定義設計の入力）
- `outputs/phase-1/writer-survey.md`（writer設計の入力）
- `outputs/phase-1/requirements-definition.md`（追記先特定の入力）
- `outputs/phase-1/acceptance-criteria.md`（設計の制約条件）
- `.claude/skills/task-specification-creator/EVALS.json`（設計の参照元）
- `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`（追記候補ファイル）
- `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`（consumer audit情報）

## 実行手順

1. Phase 1 の全成果物ファイルを読み込む
2. `task-specification-creator/EVALS.json` の `qualityInsights` セクションを再確認し、設計に反映する
3. `outputs/phase-2/field-spec.md` にフィールド定義表（Step 1）を記載する
4. `outputs/phase-2/writer-design.md` にwriter設計表・設計方針（Step 2）を記載する
5. `outputs/phase-2/validator-design.md` にvalidator設計案（Step 3）を記載する
6. `outputs/phase-2/spec-addition-plan.md` に追記箇所・追記内容・展開方針（Step 4-5）を記載する

## 統合テスト連携

Phase 2 はdocs-only設計フェーズであるためコード変更は行わない。以下を統合ポイントとして確認する。

- **統合ポイント 1（正本整合性）**: 設計したフィールド定義表が現行の `EVALS.json` 実装と整合しているか。実装と仕様が乖離する場合は乖離内容を `outputs/phase-2/field-spec.md` に明記する
- **統合ポイント 2（consumer audit整合性）**: TASK-EVALS-CONSUMER-AUDIT-001 の consumer一覧と、本設計の writer設計が矛盾していないか確認する
- **統合ポイント 3（dual root整合性）**: `.claude/` と `.agents/` のどちらへ追記するかを設計書に明記する（原則: `.claude/` に正本を置き、`.agents/` へ同期）
- **統合ポイント 4（波及設計）**: 展開方針（opt-in）が他スキルの現行 `EVALS.json` 構造と矛盾しないことを確認する

docs-only タスクとして、以下の統合ポイント/契約を設計に反映する。

- 追記内容は読者（Claude / 人間）が単独で理解できる自己完結した記述であること
- validator設計案は「未実装である」ことを明示し、実装タスクへの引き継ぎ情報（候補ファイル・アプローチ）を含めること

## 多角的チェック観点

- **完全性**: Step 1〜5 が全て実施されており、成果物ファイルが4ファイル全て作成されているか
- **整合性**: フィールド定義表・writer設計表・validator設計案・追記計画が相互に矛盾していないか
- **スコープ遵守**: 設計書にコード実装（スクリプト作成・EVALS.json変更）が混入していないか
- **docs-only適切性**: `totalTests`/`avgCoverage`の「docs-only: 0を記録」という設計が正確に記述されているか
- **追記先の適切性**: 追記先ファイルが既存の仕様構造と整合しており、冗長な新規ファイル作成を避けているか

## サブタスク管理

| サブタスクID | 内容                           | 担当Step |
| ------------ | ------------------------------ | -------- |
| ST-2-01      | フィールド定義表の設計         | Step 1   |
| ST-2-02      | writer設計表・設計方針の策定   | Step 2   |
| ST-2-03      | 自動化将来方針の記録           | Step 2   |
| ST-2-04      | validator設計案の策定          | Step 3   |
| ST-2-05      | 追記候補ファイルの評価と確定   | Step 4   |
| ST-2-06      | 追記内容の設計（テンプレート） | Step 4   |
| ST-2-07      | 他スキルへの展開方針の設計     | Step 5   |

## 成果物

- `outputs/phase-2/field-spec.md`（qualityInsights 11フィールドの正式仕様定義表。型・必須/省略可・値域・説明を列形式で記載）
- `outputs/phase-2/writer-design.md`（writer設計表・更新タイミング・運用責任・自動化将来方針を記載）
- `outputs/phase-2/validator-design.md`（validator設計案。検証項目・検証方法・実行タイミング・実装アプローチ候補を記載。実装はスコープ外であることを明記）
- `outputs/phase-2/spec-addition-plan.md`（正本仕様への追記計画。追記先ファイル・追記内容テンプレート・他スキル展開方針を記載）

## 完了条件

- [ ] フィールド定義表に11フィールド全てが定義されている（Phase 1 の `field-inventory.md` と件数が一致している）
- [ ] 各フィールドに型・必須/省略可・値域・説明が記載されている
- [ ] writer設計表に全フィールドのwriter・更新タイミング・自動/手動・運用責任者が記載されている
- [ ] 手動管理を正式化する設計方針の根拠が記載されている
- [ ] validator設計案が「実装はスコープ外」と明記した上で記載されている
- [ ] 追記先ファイルが特定されており、追記内容のテンプレートが用意されている
- [ ] 他スキルへの展開方針（opt-in）とその根拠が記載されている

## タスク100%実行確認【必須】

以下を順番に確認すること。

1. `field-spec.md` のフィールド数が `outputs/phase-1/field-inventory.md` のフィールド数と一致しているか
2. `writer-design.md` のフィールド数が `field-spec.md` のフィールド数と一致しているか（全フィールドにwriterが設計されているか）
3. `validator-design.md` に「実装はスコープ外」の明記があるか
4. `spec-addition-plan.md` に追記先ファイル・追記内容テンプレート・展開方針が3点とも記載されているか
5. `outputs/phase-2/` 配下に4ファイル全てが作成されているか

## 次Phase

Phase 3（設計レビュー）へ進む。`field-spec.md`・`writer-design.md`・`validator-design.md`・`spec-addition-plan.md` を入力として、設計の妥当性をreviewし、Phase 4（ドキュメント作成）への進行可否を判定する。
