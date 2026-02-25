# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 12                                                                     |
| タスクID   | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                              |
| 機能名     | ut-imp-unassigned-audit-scope-control-001                              |
| 前提Phase  | Phase 11                                                               |
| 後続Phase  | Phase 13                                                               |
| ステータス | 完了（2026-02-25 再確認済み）                                          |
| Issue      | [#898](https://github.com/daishiman/AIWorkflowOrchestrator/issues/898) |
| 作成日     | 2026-02-25                                                             |

## 目的

Phase 12 必須5タスク（実装ガイド、仕様更新、更新履歴、未タスク検出、スキル改善）を完了し、仕様と運用の整合を確定する。

## 背景

Phase 11までの全成果を文書化し、システム仕様との整合を確定する最終文書化工程。必須5タスク（実装ガイド/仕様更新/更新履歴/未タスク検出/スキル改善）を全て完了する。Phase 12は漏れが最も発生しやすいPhaseであり、チェックリストの逐次確認が必須。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する。

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する。
2. 特に以下の再発ポイントをチェックする。
   - P1 / P25: `LOGS.md` 2ファイル更新漏れ
   - P2 / P27: `topic-map.md` 再生成漏れ
   - P3: 未タスク管理3ステップ（指示書/台帳登録/関連仕様登録）の未完了
   - P4: 全Step完了前の早期「完了」記載
   - P28: `skill-feedback-report.md` 未作成

## 実行タスク

- SubAgent-A（Task 1）: `implementation-guide.md` を Part 1（中学生向け）/Part 2（技術者向け）で作成する。
- SubAgent-B（Task 2）: Step 1-A/1-B/1-C/1-D と Step 2 判定を実施し、`task-workflow.md` と関連仕様を更新する。
- SubAgent-C（Task 3）: 更新履歴（`documentation-changelog.md`）と `artifacts.json` を更新する。
- SubAgent-D（Task 4）: 未タスク検出を実施し、0件時も `unassigned-task-detection.md` を出力する。
- Lead（Task 5）: `skill-feedback-report.md` を作成し、未タスク検出時は指示書作成・台帳登録・リンク検証まで完了する。

## サブフェーズ（Task 1〜5）

### Task 1: 実装ガイド作成【必須】

| パート | 対象読者             | 必須要件                                                       |
| ------ | -------------------- | -------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 日常例えを含む / 専門用語は即時説明 / 「なぜ必要か」を先に説明 |
| Part 2 | 開発者・技術者       | 型定義 / APIシグネチャ / エッジケース / 設定可能パラメータ     |

### Task 2: システム仕様更新【必須】

#### Step 1-A: タスク完了記録（必須）

- 該当仕様書に「完了タスク」セクションを追加する。
- 関連ドキュメントに実装ガイドへのリンクを追加する。
- 変更履歴を更新する。
- `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` を更新する。
- `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴を更新する。

#### Step 1-B: 実装状況テーブル更新（該当時必須）

- 実装完了なら `完了`、仕様書作成のみなら `spec_created` を設定する。

#### Step 1-C: 関連タスクテーブル更新（該当時必須）

- `grep -rn "UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001" .claude/skills/aiworkflow-requirements/references/` で関連記載を検索し、ステータスを同期する。

#### Step 1-D: topic-map 再生成（仕様更新時必須）

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` の行番号同期を確認する。

#### Step 1-E: 未タスク登録の3ステップ完了（検出時必須）

1. `docs/30-workflows/unassigned-task/` に指示書を作成する。
2. `task-workflow.md` 残課題テーブルへ登録する。
3. 関連仕様書の残課題テーブルへ登録し、`verify-unassigned-links.js` で整合を確認する。

#### Step 2: システム仕様更新判定（条件付き）

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| API仕様変更                 | テスト追加のみ             |

### Task 3: ドキュメント更新履歴作成【必須】

- `documentation-changelog.md` を生成し、Step 1-A〜1-E / Step 2 の実施結果を記録する。
- `artifacts.json` を更新し、Phase 12成果物を登録する。

### Task 4: 未タスク検出【必須・0件でも出力】

| ソース               | 確認項目             |
| -------------------- | -------------------- |
| Phase 3レビュー結果  | MINOR判定の指摘事項  |
| Phase 10レビュー結果 | MINOR判定の指摘事項  |
| Phase 11手動テスト   | スコープ外の発見事項 |
| 各Phase成果物        | TODO/FIXME/将来対応  |
| コードベース         | TODO/FIXME/HACK/XXX  |

### Task 5: スキルフィードバックレポート【必須】

| セクション         | 記載内容                                                     |
| ------------------ | ------------------------------------------------------------ |
| ワークフロー改善点 | Phase実行中に発見した改善提案                                |
| 技術的教訓         | 実装時に得られた再発防止知見                                 |
| スキル改善提案     | task-specification-creator/aiworkflow-requirementsへの改善案 |
| 新規Pitfall候補    | `.claude/rules/06-known-pitfalls.md` への追加候補            |

## 参照資料

| 参照資料             | パス                                                                                        | 内容                                |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1              | `phase-1-requirements.md`                                                                   | 目的と受入基準の再確認              |
| Phase 2              | `phase-2-design.md`                                                                         | 設計反映内容                        |
| Phase 5              | `phase-5-implementation.md`                                                                 | 実装反映内容                        |
| Phase 6              | `phase-6-test-expansion.md`                                                                 | 追加検証の反映内容                  |
| Phase 7              | `phase-7-coverage-check.md`                                                                 | 網羅判定の反映内容                  |
| Phase 8              | `phase-8-refactoring.md`                                                                    | 構造変更の反映内容                  |
| Phase 9              | `phase-9-quality-assurance.md`                                                              | 品質保証結果の反映内容              |
| Phase 10             | `phase-10-final-review.md`                                                                  | レビュー結果                        |
| Phase 11             | `phase-11-manual-test.md`                                                                   | 手動確認結果                        |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 必須タスク定義                      |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1/2 実施規約                   |
| 未タスクガイド       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 未タスク検出と登録手順              |
| 残課題台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 登録先                              |
| 残課題運用規則       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 品質ゲート                          |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 苦戦箇所の記録方針                  |
| 実装パターン集       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | baseline/current 分離運用の再発防止 |
| 要件定義             | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 成果物                      |
| 受入基準             | `outputs/phase-1/acceptance-criteria.md`                                                    | Phase 1 成果物                      |
| SubAgent責務分担     | `outputs/phase-1/subagent-responsibilities.md`                                              | Phase 1 成果物                      |
| 仕様参照抽出         | `outputs/phase-1/aiworkflow-spec-extraction.md`                                             | Phase 1 成果物                      |
| 設計書               | `outputs/phase-2/scope-control-design.md`                                                   | Phase 2 成果物                      |
| 入出力仕様           | `outputs/phase-2/cli-contract.md`                                                           | Phase 2 成果物                      |
| テストマッピング     | `outputs/phase-2/design-test-mapping.md`                                                    | Phase 2 成果物                      |
| リスク分析           | `outputs/phase-2/risk-analysis.md`                                                          | Phase 2 成果物                      |
| 実装ログ             | `outputs/phase-5/implementation-log.md`                                                     | Phase 5 成果物                      |
| 差分サマリー         | `outputs/phase-5/diff-summary.md`                                                           | Phase 5 成果物                      |
| 影響分析             | `outputs/phase-5/impact-analysis.md`                                                        | Phase 5 成果物                      |
| Green証跡            | `outputs/phase-5/post-implementation-green.log`                                             | Phase 5 成果物                      |
| リファクタログ       | `outputs/phase-8/refactoring-log.md`                                                        | Phase 8 成果物                      |
| 回帰確認             | `outputs/phase-8/regression-check.md`                                                       | Phase 8 成果物                      |
| 責務分割図           | `outputs/phase-8/responsibility-map.md`                                                     | Phase 8 成果物                      |
| 品質レポート         | `outputs/phase-9/quality-report.md`                                                         | Phase 9 成果物                      |
| 再現性ログ           | `outputs/phase-9/reproducibility-log.md`                                                    | Phase 9 成果物                      |
| 運用評価             | `outputs/phase-9/operation-readiness.md`                                                    | Phase 9 成果物                      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                                   | Phase 10 成果物                     |
| 指摘一覧             | `outputs/phase-10/final-review-findings.md`                                                 | Phase 10 成果物                     |
| 是正計画             | `outputs/phase-10/remediation-plan.md`                                                      | Phase 10 成果物                     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                    | Phase 11 成果物                     |
| 発見事項             | `outputs/phase-11/manual-findings.md`                                                       | Phase 11 成果物                     |
| 実行証跡             | `outputs/phase-11/command-transcript.md`                                                    | Phase 11 成果物                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料                             | パス                                                                                        | 内容                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録先の台帳                                  |
| task-workflow-rules                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 仕様更新時の品質ゲートと更新ルール                    |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | ドキュメント品質基準                                  |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | Phase 12漏れパターンの教訓（P1-P4, P25-P28, P43）     |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | baseline/current 分離監査の運用パターンと落とし穴対策 |

## 実行手順

1. Task 1として実装ガイドを2パートで作成する（Part 1: 日常例え、Part 2: 型/API/エッジケース）。
2. Task 2 Step 1-Aを実施する（完了タスク記録、関連ドキュメント追記、`LOGS.md` x2、`SKILL.md` x2 更新）。
3. Task 2 Step 1-Bを実施する（実装状況テーブルを `完了` または `spec_created` に更新）。
4. Task 2 Step 1-Cを実施する（`grep -rn "UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001" .claude/skills/aiworkflow-requirements/references/` で関連タスク表を検索し更新）。
5. Task 2 Step 1-Dを実施する（仕様書更新がある場合は `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で `topic-map.md` を再生成）。
6. Task 2 Step 2を判定する（インターフェース/型/API変更がある場合のみシステム仕様本文を更新し、更新不要時は理由を `documentation-changelog.md` に明記）。
7. Task 3としてドキュメント更新履歴を作成し、`artifacts.json` を更新する。
8. Task 4として未タスク検出を実施し、baseline/current を分離して記録する（0件時も出力）。
9. Task 5としてスキル改善レポートを作成し、改善点なしの場合も「改善点なし」と明記する。
10. 未タスクが検出された場合は、指示書作成・`task-workflow.md` 登録・関連仕様登録・`verify-unassigned-links.js` 実行まで完了する。
11. 仕様変更がある場合は `quick_validate.js` を実行して SKILL frontmatter 検証を行う。

### Task 3 実行コマンド（推奨）

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出,outputs/phase-12/skill-feedback-report.md:スキル改善レポート"

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                    | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用外（ドキュメント更新のため）            | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用外（ドキュメント更新のため）            | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用外（ドキュメント更新のため）            | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 適用外（ドキュメント更新のため）            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | Phase 12必須5タスクの完了と成果物整合性確認 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物             | パス                                            | 説明               |
| ------------------ | ----------------------------------------------- | ------------------ |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1/Part 2 構成 |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`       | Step実施記録       |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 変更履歴           |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | 検出結果           |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案     |
| リンク整合ログ     | `outputs/phase-12/verify-unassigned-links.log`  | 参照整合検証       |
| 未完了タスク指示書 | `docs/30-workflows/unassigned-task/*.md`        | 検出時のみ作成     |

## 完了条件

- [ ] 実装ガイド（Part 1: 中学生向け）が日常例えを含み、専門用語の即時説明を満たす
- [ ] 実装ガイド（Part 2: 技術者向け）が型/API/エッジケース/設定値を含む
- [ ] 【Task 2 Step 1-A】完了タスク記録・関連ドキュメント追記・変更履歴追記を完了
- [ ] 【Task 2 Step 1-A】`aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の2ファイル更新を完了
- [ ] 【Task 2 Step 1-A】`aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴更新を完了
- [ ] 【Task 2 Step 1-B】実装状況テーブルを `完了` または `spec_created` に更新（該当時）
- [ ] 【Task 2 Step 1-C】関連タスクテーブルのステータス更新を完了（該当時）
- [ ] 【Task 2 Step 1-D】`topic-map.md` 再生成要否を判定し、必要時は再生成済み
- [ ] 【Task 2 Step 1-E】未タスク検出時に指示書作成・台帳登録・関連仕様登録を完了
- [ ] 【Task 2 Step 2】システム仕様更新要否を判定し、結果を `documentation-changelog.md` に記録
- [ ] `documentation-changelog.md` と `artifacts.json` が更新されている
- [ ] 未タスク検出レポートが baseline/current 分離で出力され、0件時も明記されている
- [ ] 未タスク検出時は指示書作成・台帳登録・関連仕様登録・リンク検証を完了
- [ ] `verify-unassigned-links.js` が `ALL_LINKS_EXIST` を返している
- [ ] `quick_validate.js` で更新した SKILL が `Skill is valid!` を満たす
- [ ] スキル改善レポートが作成され、改善点なしの場合も明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が所定パスに生成済み
- [ ] 実行結果と完了条件の一致を確認済み

## 実行結果（2026-02-25 再確認）

| 確認項目               | 結果 | 証跡                                                                                                                                      |
| ---------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Task 1〜5 実施         | PASS | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                  |
| Phase 12 構造検証      | PASS | `outputs/phase-12/validate-phase-rerun6.log`                                                                                              |
| 全体整合検証           | PASS | `outputs/phase-12/verify-all-specs-strict-rerun6.log`                                                                                     |
| 未タスクリンク整合     | PASS | `outputs/phase-12/verify-unassigned-links-rerun6.log`                                                                                     |
| skill-creator 構造検証 | PASS | `outputs/phase-12/quick-validate-aiworkflow-skillcreator-rerun4.log`, `outputs/phase-12/quick-validate-task-spec-skillcreator-rerun4.log` |

## 依存関係

- **前提**: Phase 11
- **後続**: Phase 13

## サブタスク管理

- [ ] 参照資料の確認を完了
- [ ] 実行タスク（SubAgent担当）を完了
- [ ] 成果物作成と配置を完了
- [ ] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001 --phase 12` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 13: PR作成（phase-13-pr-creation.md）
