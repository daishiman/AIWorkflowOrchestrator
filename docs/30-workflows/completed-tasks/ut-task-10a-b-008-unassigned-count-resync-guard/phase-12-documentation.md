# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| Phase      | 12                                                                                |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard                                   |
| タスクID   | UT-TASK-10A-B-008                                                                 |
| タスク名   | 未タスク件数再計算同期ガード                                                      |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase  | Phase 13                                                                          |
| 作成日     | 2026-03-06                                                                        |
| ステータス | completed                                                                         |

## 目的

active set 再計算ガードの実装ガイド、システム仕様同期、更新履歴、未タスク検出結果、スキル改善記録を一式で整え、次回の同種タスクで再利用できる状態にする。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと                  | 実行順序     | 役割                                                                                                                           |
| -------- | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| A        | Task 12-1 実装ガイド      | 先行         | Part 1 と Part 2 の実装ガイドを作成する                                                                                        |
| B        | Task 12-2 仕様同期        | A と並列     | `task-workflow.md`、`task-workflow-rules.md`、`ui-ux-feature-components.md`、`lessons-learned.md` の更新要否と同期順を確定する |
| C        | Task 12-3 / 12-4 証跡整理 | A/B 後に直列 | `documentation-changelog.md`、`spec-update-summary.md`、`unassigned-task-detection.md`、`artifacts.json` 同期ルールを整える    |
| D        | Task 12-5 スキル改善      | C 後に直列   | task-specification-creator / aiworkflow-requirements / skill-creator の改善点を記録する                                        |

## 実行タスク

| Task      | 内容                                                                        | 主成果物                                        |
| --------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| Task 12-1 | 実装ガイド作成（Part 1: 中学生向け概念説明、Part 2: 技術詳細）              | `outputs/phase-12/implementation-guide.md`      |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements とスキル運用記録の同期）  | `outputs/phase-12/spec-update-summary.md`       |
| Task 12-3 | ドキュメント更新履歴作成と `artifacts.json` / `outputs/artifacts.json` 同期 | `outputs/phase-12/documentation-changelog.md`   |
| Task 12-4 | 未タスク検出と必要時の指示書登録                                            | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成                                            | `outputs/phase-12/skill-feedback-report.md`     |

- Task 12-1: 実装ガイド作成（Part 1 は日常例え中心、Part 2 は active set 導出・台帳更新順・TypeScript 型定義・API/CLI シグネチャ・設定/定数一覧・検証コマンドを明記）
- Task 12-2: システムドキュメント更新（Step 1-A〜1-G と Step 2 を記録し、`task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` を主更新対象にする）
- Task 12-3: ドキュメント更新履歴作成（`documentation-changelog.md`、`artifacts.json`、`outputs/artifacts.json`、`phase-12-documentation.md` の整合を取る）
- Task 12-4: 未タスク検出（0件でも出力し、1件以上なら `docs/30-workflows/unassigned-task/` への配置と関連台帳登録まで定義する）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも「改善点なし」と記録する）

## 参照資料

### 前Phase成果物

| 資料名                       | パス                                         | 用途                       |
| ---------------------------- | -------------------------------------------- | -------------------------- |
| Phase 1 要件定義             | `outputs/phase-1/requirements-definition.md` | ガイドの説明範囲を確認する |
| Phase 2 台帳同期設計         | `outputs/phase-2/ledger-sync-design.md`      | 仕様同期の順序を確認する   |
| Phase 5 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 変更内容を確認する         |
| Phase 6 回帰テスト計画       | `outputs/phase-6/regression-test.md`         | 再利用手順を確認する       |
| Phase 7 カバレッジ報告       | `outputs/phase-7/coverage-report.md`         | 重点説明箇所を確認する     |
| Phase 8 再利用ガードパターン | `outputs/phase-8/reusable-guard-pattern.md`  | ガイドへ転記する           |
| Phase 9 品質報告             | `outputs/phase-9/quality-report.md`          | 検証結果を確認する         |
| Phase 10 最終レビュー結果    | `outputs/phase-10/final-review-result.md`    | 通過条件を確認する         |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`     | 手動確認結果を確認する     |

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                                                                        | 用途                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| プロジェクト概要             | `.claude/skills/aiworkflow-requirements/references/overview.md`                             | 今回のドキュメント同期を仕様全体の目的と成功基準へ位置づける |
| 仕様記述ガイド               | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                      | 仕様書の命名・記述粒度を確認する                             |
| 開発ガイドライン             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 更新順・記録順・証跡粒度を確認する                           |
| 実装パターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 複数台帳同期と再利用ガードの記述パターンを確認する           |
| タスク運用正本               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録と残課題表を同期する                                 |
| タスクワークローフェーズ定義 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                 | Phase 12 の責務とドキュメント粒度を確認する                  |
| タスク運用ルール             | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 未タスク配置先、完了移管、リンク整合条件を同期する           |
| UI機能仕様正本               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillAnalysisView の関連未タスク表を同期する                 |
| UI/UX コンポーネント規約     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | SkillAnalysisView の既存 UI 文脈を確認する                   |
| 教訓正本                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 固定レンジ依存回避と `current` 判定ルールを同期する          |
| パターン集                   | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | Phase 12 成功/失敗パターンと未タスク3ステップを同期する      |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | ドキュメント更新の完了条件を確認する                         |
| リソースマップ               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 今回必要な仕様参照の抽出根拠とする                           |

### Phase 12 ガイド

| 資料名               | パス                                                                                    | 用途                                           |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| create ワークフロー  | `.claude/skills/task-specification-creator/references/create-workflow.md`               | 全Phaseで aiworkflow 参照を持つ前提を確認する  |
| Phase 11/12 ガイド   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Task 12-1〜12-5 と Phase 12 完了条件を確認する |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-A〜1-G と Step 2 の順序を確認する       |
| Phase テンプレート   | `.claude/skills/task-specification-creator/references/phase-templates.md`               | 実行タスクの表 + 箇条書き必須ルールを確認する  |
| 実装ガイド作成ガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1 / Part 2 の説明粒度を確認する           |

### スキル運用記録

| 資料名               | パス                                                          | 用途                                  |
| -------------------- | ------------------------------------------------------------- | ------------------------------------- |
| aiworkflow LOGS      | `.claude/skills/aiworkflow-requirements/LOGS.md`              | Step 1-A の更新対象を確認する         |
| aiworkflow SKILL     | `.claude/skills/aiworkflow-requirements/SKILL.md`             | Step 1-A の変更履歴更新対象を確認する |
| aiworkflow topic-map | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` | Step 1-D の再生成対象を確認する       |
| task-spec LOGS       | `.claude/skills/task-specification-creator/LOGS.md`           | Step 1-A の更新対象を確認する         |
| task-spec SKILL      | `.claude/skills/task-specification-creator/SKILL.md`          | Step 1-A の変更履歴更新対象を確認する |

### スクリプト

| 資料名                       | パス                                                                                    | 用途                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| documentation changelog 生成 | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` | Task 12-3 の更新履歴生成に使う                                |
| Phase 出力検証               | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`            | Phase 12 の構造整合を確認する                                 |
| 仕様書検証                   | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                 | 13 Phase 全体の整合を確認する                                 |
| artifacts スキーマ検証       | `.claude/skills/task-specification-creator/scripts/validate-schema.js`                  | `artifacts.json` と `outputs/artifacts.json` の整合を確認する |
| リンク検証                   | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`          | 未タスクリンク参照切れを確認する                              |
| 未タスク監査                 | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`           | `current` と `baseline` を分離して記録する                    |
| 未タスク候補検出             | `.claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js`          | Task 12-4 の補助確認に使う                                    |
| aiworkflow 索引再生成        | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`                      | topic-map と keywords を再生成する                            |
| workflow 索引再生成          | `.claude/skills/task-specification-creator/scripts/generate-index.js`                   | workflow 側の索引と依存参照を再同期する                       |
| SKILL 検証                   | `.claude/skills/skill-creator/scripts/quick_validate.js`                                | 3スキルの Error 0件を確認する                                 |

## 実行手順

### Task 12-1: 実装ガイド作成

1. Part 1 では「なぜ必要か」を先に説明し、固定レンジで数える危険を日常の棚卸しや名簿管理に例えて説明する。
2. Part 1 では専門用語を避け、使う場合はその場で言い換える。
3. Part 2 では active set 導出手順、3台帳更新順、`current` / `baseline` 判定、検証コマンド、エッジケースを具体的なコマンドと対象ファイル名つきで説明する。
4. Part 2 では更新対象を主対象と補助対象に分ける。
5. 主対象は `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` とする。
6. 補助対象は `task-workflow-rules.md`、`ui-ux-components.md`、`spec-guidelines.md` とし、ルール変更や文言変更が発生した場合のみ更新要否を判断する。

### Task 12-2: システムドキュメント更新

#### Step 1-A: タスク完了記録

1. 該当仕様書に `## 完了タスク` セクションを追加する。
2. `## 関連ドキュメント` に `implementation-guide.md` へのリンクを追加する。
3. `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` の変更履歴に本タスクを追記する。
4. `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の両方へ完了記録を追加する。
5. `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の変更履歴テーブルを両方更新する。

#### Step 1-B: 実装状況テーブル更新

1. 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認する。
2. 実装状況テーブルがある場合は、実装完了なら `completed`、仕様書作成のみなら `spec_created` を使う。
3. 既存型再利用のみでも、実装状況テーブル更新の要否は必ず確認する。

#### Step 1-C: 関連タスクテーブル更新

1. `grep -rn "UT-TASK-10A-B-008\\|task-10a-b-unassigned-count-resync-guard" .claude/skills/aiworkflow-requirements/references` で関連タスクテーブルを全件確認する。
2. `task-workflow.md` を canonical ledger、`ui-ux-feature-components.md` を derived ledger とみなし、derived 側が stale の場合でも canonical へ巻き戻さず同期する。未タスク配置ルールや UI 配置ルールの文言差分が発生した場合のみ `task-workflow-rules.md` と `ui-ux-components.md` の関連タスク欄も同期する。
3. 未タスク候補が出た場合は配置先を `docs/30-workflows/unassigned-task/` か `docs/30-workflows/completed-tasks/unassigned-task/` のどちらに置くべきか明記する。

#### Step 1-D: topic-map 再生成

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` と `keywords.json` を再生成する。
2. `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard --regenerate` を実行し、workflow 側索引を再同期する。
3. 生成差分に今回追加した見出しが反映されていることを確認する。

#### Step 1-E: 未タスク指示書作成・登録（1件以上検出時のみ）

1. `unassigned-task-detection.md` に検出件数を記録する。
2. 1件以上ある場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` と関連仕様書へ同じ ID を登録する。
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認する。

#### Step 1-G: 検証コマンド順次実行

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
2. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
3. `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard --regenerate`
4. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`
5. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`
6. `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`
7. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard`
8. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard --json`
9. `node .claude/skills/task-specification-creator/scripts/validate-schema.js --schema schemas/artifact-definition.json --data docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/artifacts.json`
10. `node .claude/skills/task-specification-creator/scripts/validate-schema.js --schema schemas/artifact-definition.json --data docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/outputs/artifacts.json`
11. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
12. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json`
13. `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard --json` を実行し、Task 12-1 の内容要件を確認する。
14. すべての結果を `spec-update-summary.md` と `outputs/verification-report.md` に記録し、`quick_validate.js` の Warning は「許容 / 要監視 / 要対応」に分類する。

#### Step 2: システム仕様更新要否の判断

1. 本タスクでは `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` を主更新対象として扱い、`task-workflow.md` を canonical、`ui-ux-feature-components.md` を derived、Issue #996 / 元未タスク指示書を historical として記録する。
2. ルール変更がある場合のみ `task-workflow-rules.md`、`ui-ux-components.md`、`spec-guidelines.md` の更新要否を判断する。
3. derived ledger に stale な参照が残っている場合は canonical から同期し、historical source の固定レンジ要件で canonical を上書きしない。
4. `documentation-changelog.md` と `spec-update-summary.md` の両方に「更新あり / 更新なし」と理由を同じ文脈で残す。
5. 「既存型を再利用しているので更新不要」「内部変更のみなので Step 1-A 省略」といった誤判断を禁止する。

### Task 12-3: ドキュメント更新履歴作成と台帳同期

1. `generate-documentation-changelog.js` を使って `documentation-changelog.md` を生成し、不足分を手動補完する。
2. `artifacts.json` と `outputs/artifacts.json` の両方で Phase 12 成果物参照を同期し、`validate-schema.js` で二重検証する。
3. `outputs/verification-report.md` に `validate-phase-output` / `verify-all-specs` / `validate-schema` / audit の結果を集約する。
4. `phase-12-documentation.md` の完了条件と成果物表が実体と一致する前提で `completed` 化する。
5. `spec-update-summary.md` と `documentation-changelog.md` で更新有無の判定を一致させる。

### Task 12-4: 未タスク検出

1. Phase 10 / 11、`documentation-changelog.md`、`spec-update-summary.md`、`lessons-learned.md` をソースに未タスク候補を確認する。
2. 0件でも `unassigned-task-detection.md` を必ず出力する。
3. 1件以上ある場合は、指示書作成、`task-workflow.md` 登録、関連仕様書リンク追加までを 1 セットで定義する。
4. 合否判定は `audit-unassigned-tasks.js --json --diff-from HEAD` の `currentViolations.total` を使い、`baselineViolations.total` は監視値として別記録する。

### Task 12-5: スキルフィードバックレポート作成

1. task-specification-creator の不足、aiworkflow-requirements の参照抽出不足、skill-creator の検証運用上の気づきを分けて記録する。
2. 改善点がない場合でも `改善点なし` と明記する。
3. 新しい落とし穴がある場合は Phase 12 の教訓として再利用可能な文にする。

## 多角的チェック観点（関心分離）

| 観点            | 確認内容                                                                                                                    | 正本                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Part 1          | 中学生向け説明が日常例えで成立し、専門用語を置き去りにしていないか                                                          | `outputs/phase-12/implementation-guide.md`    |
| Part 2          | active set 導出、3台帳更新順、検証コマンド、エッジケースが具体化されているか                                                | `outputs/phase-12/implementation-guide.md`    |
| aiworkflow 抽出 | `overview.md`、`spec-guidelines.md`、`development-guidelines.md`、`task-workflow-rules.md` を必要資料として説明できているか | `outputs/phase-12/spec-update-summary.md`     |
| 情報源3層       | canonical / derived / historical の扱い分けが記録されているか                                                               | `outputs/phase-12/spec-update-summary.md`     |
| 仕様同期        | `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md` が同一ターンで更新される設計か                      | `outputs/phase-12/spec-update-summary.md`     |
| スキル運用      | LOGS 2件、SKILL 2件、topic-map 再生成、quick validate が同じフローに入っているか                                            | `outputs/phase-12/documentation-changelog.md` |
| 検証記録        | `current` / `baseline` 分離、verify/validate/schema/audit の順序、成果物台帳同期が記録されるか                              | `outputs/verification-report.md`              |

## 成果物

| 成果物               | パス                                            | 説明                                                 |
| -------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 と Part 2 の実装ガイドを記録する              |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | 更新対象、Step 1-A〜1-G / Step 2、検証結果を記録する |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 変更履歴と更新有無の判断理由を記録する               |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 実行後の残課題を 0件でも記録する                     |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | スキル改善点または改善点なしを記録する               |

## 完了条件

- [x] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で定義した
- [x] Task 12-1〜12-5 と Task 12-2 Step 1-A〜1-G / Step 2 を文書化した
- [x] `overview.md`、`spec-guidelines.md`、`development-guidelines.md`、`task-workflow-rules.md` を今回必要な aiworkflow 仕様として抽出した
- [x] canonical / derived / historical の3層分類を文書化した
- [x] LOGS 2件、SKILL 2件、topic-map 再生成、`quick_validate.js` 3本の手順を定義した
- [x] `verify-unassigned-links` → 索引再生成 → skill validate → `validate-phase-output` → `verify-all-specs` → schema validate → audit の順を固定した
- [x] `artifacts.json` / `outputs/artifacts.json` / `outputs/verification-report.md` / `phase-12-documentation.md` の同期手順を定義した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1/2/5/6/7/8/9/10/11 成果物の確認
2. SubAgent-A/B の並列作業
3. SubAgent-C による changelog / artifacts / 未タスク検出の直列整理
4. SubAgent-D のスキル改善記録
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の5ファイルを定義した
- [x] Task 12-1〜12-5、Step 1-A〜1-G / Step 2、検証順、台帳同期、情報源3層を固定した
- [x] 主更新対象 3仕様書と補助更新対象 3仕様書の判断基準を定義した
- [x] Phase 13 の引継ぎ入力を確定した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 13: PR作成
