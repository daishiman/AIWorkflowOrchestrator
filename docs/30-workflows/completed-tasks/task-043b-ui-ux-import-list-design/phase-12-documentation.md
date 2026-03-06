# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 11                              |
| 後続Phase  | Phase 13                              |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

Phase 12 の必須5タスクを、UI仕様タスク向けに具体化し、system spec 更新先と N/A 判定条件を固定する。

## 背景

本フェーズは `phase-1-requirements.md`、`phase-2-design.md`、`phase-5-implementation.md`、`phase-6-test-expansion.md`、`phase-7-coverage-check.md`、`phase-8-refactoring.md`、`phase-9-quality-assurance.md`、`phase-10-final-review.md`、`phase-11-manual-test.md` を入力にする。UI task であるため、主更新先は `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`、`.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`、`.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md` になる。

## Atent Team 編成

| SubAgent | 関心ごと           | 主担当内容                                   |
| -------- | ------------------ | -------------------------------------------- |
| B1       | 実装ガイド         | Part 1 / Part 2 の implementation-guide 作成 |
| B2       | system spec 同期   | UI / workflow / lesson learned の更新先整理  |
| B3       | 更新履歴と未タスク | changelog、unassigned、feedback の出力       |
| B4       | Step 2 判定        | 新規 I/F 追加の有無と N/A 根拠の記録         |

## 実行タスク

- Task 12-1 実装ガイド作成: Part 1 は中学生向け、Part 2 は技術者向けで記述する
- Task 12-2 システム仕様更新: UI正本、workflow 正本、lessons 正本を更新する
- Task 12-3 更新履歴作成: documentation-changelog を出力する
- Task 12-4 未タスク検出: 0件でも unassigned-task-detection を出力する
- Task 12-5 フィードバック作成: 0件でも skill-feedback-report を出力する

## 参照資料

### 依存Phase

| 資料名                             | パス                                                    | 用途             |
| ---------------------------------- | ------------------------------------------------------- | ---------------- |
| 依存Phase 1 仕様                   | `phase-1-requirements.md`                               | 要件再確認       |
| 依存Phase 2 仕様                   | `phase-2-design.md`                                     | UI設計再確認     |
| 依存Phase 5 仕様                   | `phase-5-implementation.md`                             | 実装境界再確認   |
| 依存Phase 6 仕様                   | `phase-6-test-expansion.md`                             | edge case 再確認 |
| 依存Phase 7 仕様                   | `phase-7-coverage-check.md`                             | gate 再確認      |
| 依存Phase 8 仕様                   | `phase-8-refactoring.md`                                | refactor 条件    |
| 依存Phase 9 仕様                   | `phase-9-quality-assurance.md`                          | 品質監査         |
| 依存Phase 10 仕様                  | `phase-10-final-review.md`                              | 最終判定         |
| 依存Phase 11 仕様                  | `phase-11-manual-test.md`                               | 手動検証         |
| 依存Phase 11 成果物                | `outputs/phase-11/manual-test-result.md`                | 検証証跡         |
| 要件定義書                         | `outputs/phase-1/requirements-definition.md`            | Phase 1 成果物   |
| 受け入れ基準                       | `outputs/phase-1/acceptance-criteria.md`                | Phase 1 成果物   |
| スコープ定義                       | `outputs/phase-1/scope-definition.md`                   | Phase 1 成果物   |
| UI状態棚卸し                       | `outputs/phase-1/ui-state-inventory.md`                 | Phase 1 成果物   |
| 情報アーキテクチャ                 | `outputs/phase-2/information-architecture.md`           | Phase 2 成果物   |
| UI状態マトリクス                   | `outputs/phase-2/ui-state-matrix.md`                    | Phase 2 成果物   |
| A11y操作契約                       | `outputs/phase-2/a11y-interaction-contract.md`          | Phase 2 成果物   |
| 文言ガイド                         | `outputs/phase-2/copy-guidelines.md`                    | Phase 2 成果物   |
| 実装計画                           | `outputs/phase-5/implementation-plan.md`                | Phase 5 成果物   |
| コンポーネント境界図               | `outputs/phase-5/component-boundary-map.md`             | Phase 5 成果物   |
| selector-action対応表              | `outputs/phase-5/selector-action-map.md`                | Phase 5 成果物   |
| import flow wireframe              | `outputs/phase-5/import-flow-wireframe.md`              | Phase 5 成果物   |
| リファクタリング計画               | `outputs/phase-8/refactoring-plan.md`                   | Phase 8 成果物   |
| 文言トークン正規化                 | `outputs/phase-8/copy-token-normalization.md`           | Phase 8 成果物   |
| 品質レポート                       | `outputs/phase-9/quality-report.md`                     | Phase 9 成果物   |
| アクセシビリティ適合チェックリスト | `outputs/phase-9/accessibility-compliance-checklist.md` | Phase 9 成果物   |
| UX整合監査                         | `outputs/phase-9/ux-consistency-audit.md`               | Phase 9 成果物   |
| 最終レビュー結果                   | `outputs/phase-10/final-review-result.md`               | Phase 10 成果物  |
| Go/No-Goチェックリスト             | `outputs/phase-10/go-no-go-checklist.md`                | Phase 10 成果物  |
| 依存関係レビュー                   | `outputs/phase-10/dependency-review.md`                 | Phase 10 成果物  |
| 手動テスト計画                     | `outputs/phase-11/manual-test-plan.md`                  | Phase 11 成果物  |
| スクリーンショット計画             | `outputs/phase-11/screenshot-plan.json`                 | Phase 11 成果物  |
| スクリーンショットカバレッジ       | `outputs/phase-11/screenshot-coverage.md`               | Phase 11 成果物  |
| 発見課題一覧                       | `outputs/phase-11/discovered-issues.md`                 | Phase 11 成果物  |
| スクリーンショット証跡             | `outputs/phase-11/screenshots`                          | Phase 11 成果物  |

| コンポーネント抽出ガイド | `outputs/phase-8/component-extraction-guideline.md` | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                        |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 主要UI一覧と完了タスク更新                  |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 機能仕様、苦戦箇所、証跡導線更新            |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | SkillManagementPanel 責務図更新             |
| タスク運用           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 完了台帳と検証証跡更新                      |
| 教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | duplicate import / focus drift の教訓化     |
| Skill管理I/F         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | public I/F を増やした場合だけ Step 2 で更新 |
| API仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPC 境界変更が出た場合だけ Step 2 で更新    |
| topic-map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                     | Step 1-D 行番号再同期                       |
| aiworkflow LOGS      | `.claude/skills/aiworkflow-requirements/LOGS.md`                                  | Step 1-A 仕様更新履歴                       |
| aiworkflow SKILL     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                 | Step 1-A 変更履歴バージョン追記             |
| task-spec LOGS       | `.claude/skills/task-specification-creator/LOGS.md`                               | Step 1-A スキル使用履歴                     |
| task-spec SKILL      | `.claude/skills/task-specification-creator/SKILL.md`                              | Step 1-A 変更履歴バージョン追記             |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`    | Step 1-A〜1-G と Step 2 の詳細              |
| Phase 11/12 ガイド   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`       | Phase 12 完了チェックリスト                 |

## Task 12 実行マトリクス

| Task                         | 必須 | 主担当  | 出力                                            | 備考                                     |
| ---------------------------- | ---- | ------- | ----------------------------------------------- | ---------------------------------------- |
| Task 12-1 実装ガイド作成     | 必須 | B1      | `implementation-guide.md`                       | Part 1 は中学生レベル、Part 2 は技術詳細 |
| Task 12-2 システム仕様更新   | 必須 | B2 / B4 | `spec-update-summary.md`, `phase12-step-log.md` | Step 1-A〜1-G + Step 2 を含む            |
| Task 12-3 更新履歴作成       | 必須 | B3      | `documentation-changelog.md`                    | `更新なし` の場合も理由を記録            |
| Task 12-4 未タスク検出       | 必須 | B3      | `outputs/phase-12/unassigned-task-detection.md` | 0件でも出力必須                          |
| Task 12-5 フィードバック作成 | 必須 | B3      | `skill-feedback-report.md`                      | 改善点なしでも出力必須                   |

## 実行手順

1. Task 12-1 で `implementation-guide.md` を作成し、Part 1 に日常例え、Part 2 に技術詳細、型、APIシグネチャ、エッジケースを含める。
2. Task 12-2 Step 1-A で `.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`、`.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`、`.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md` に完了タスクと関連ドキュメントを追記し、`LOGS.md` 2ファイルと `SKILL.md` 2ファイルの変更履歴も更新する。
3. Task 12-2 Step 1-B で本 workflow の状態を `spec_created` または `completed` と同期し、task-043b は UI仕様タスクなので「仕様書のみなら `spec_created`、実装まで完了したら `completed`」を明記する。
4. Task 12-2 Step 1-C で `grep -rn "TASK-10A-E-B\\|task-043b-ui-ux-import-list-design" .claude/skills/aiworkflow-requirements/references` を実行し、関連タスク表、未タスク候補、完了台帳、検証証跡のリンク更新対象を洗い出す。
5. Task 12-2 Step 1-D で `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` の見出し行番号を再同期する。
6. Task 12-2 Step 1-E で未タスクを検出した場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` と関連仕様書へ登録した後、`verify-unassigned-links.js` と `audit-unassigned-tasks.js` で current / baseline を分離記録する。
7. Task 12-2 Step 1-F は CI/CD や DevOps ファイルに変更がある場合のみ実施し、本 task-043b 単体では通常 `N/A` とする。
8. Task 12-2 Step 1-G で `quick_validate.js` を 3スキルに対して実行し、Error 0件、Warning の要監視 / 要対応分類、補助経路利用有無を `spec-update-summary.md` に記録する。
9. Task 12-2 Step 2 で新規 public I/F、IPC、定数、テスト戦略変更がある場合だけ `interfaces-agent-sdk-skill.md` または `api-ipc-agent.md` を更新し、IPC の引数 / 戻り値 / エラー契約まで変わる場合は `outputs/phase-12/ipc-documentation.md` も更新する。変更がなければ `更新なし` の根拠を `documentation-changelog.md` と `spec-update-summary.md` の両方へ残す。
10. Task 12-3 で `documentation-changelog.md` を生成し、Step 1-A〜1-G と Step 2 の結果、ソースコード変更の有無、`更新なし` 判定理由を記録する。
11. Task 12-4 で Phase 11、`discovered-issues.md`、A11y 違反、レビューの MINOR 指摘から未タスクを検出し、0件でもサマリーを出力する。
12. Task 12-5 でテンプレート、ワークフロー、自動検証の改善点を評価し、改善なしでも `skill-feedback-report.md` を出力する。
13. 最後に `artifacts.json` と `outputs/artifacts.json` を同期し、`phase-12-documentation.md` のステータスと完了チェックリストを成果物実体へ一致させる。

## 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design

rg -n "TASK-10A-E-B|task-043b-ui-ux-import-list-design" .claude/skills/aiworkflow-requirements/references

node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

test -f docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD

node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                                                | 仕様参照先                                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | UI task であっても新規IPC/Preload/API追加なしを確認し、仕様更新が Renderer 内に閉じているか確認する                  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                          |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョンの更新先が揃っているか確認する                              | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`          |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 view 非侵食が更新先仕様書へ反映されるか確認する                              | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に留まるか、変更がある場合だけ Step 2 を発火する | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                      |
| エラーハンドリング | error alert、retry、stale error クリア、擬似失敗防止の知見が `lessons-learned.md` と workflow 台帳へ残るか確認する   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                          |
| テスタビリティ     | test / manual / spec verify / audit の証跡が台帳と成果物へ同期しているか確認する                                     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/task-specification-creator/references/quality-standards.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                       | 仕様参照先                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract の仕様同期を行う          | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えないことを明記する             | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel の再利用前提を台帳へ記録する                         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを `N/A` 根拠とともに記録する                            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約維持を仕様更新へ反映する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物               | パス                                            | 説明                             |
| -------------------- | ----------------------------------------------- | -------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 / Part 2                  |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜1-G と Step 2 の記録   |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 更新差分と `更新なし` 根拠       |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 0件でも出力                      |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 0件でも出力                      |
| Step log             | `outputs/phase-12/phase12-step-log.md`          | Task 12-2 の各Step記録           |
| 条件付き IPC文書     | `outputs/phase-12/ipc-documentation.md`         | public I/F または IPC 更新時のみ |

## 完了条件

- [x] implementation-guide が Part 1 / Part 2 の構成で定義されている
- [x] UI / workflow / lessons / LOGS / SKILL / topic-map の更新先が特定されている
- [x] Step 1-A〜1-G と Step 2 の実施条件が定義されている
- [x] changelog、unassigned、feedback が 0件時も出力対象になっている
- [x] `artifacts.json` と `outputs/artifacts.json` の同期条件が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase 12 Task 2 判定基準

| 判定項目 | 実行条件                                            | 完了条件                                                                                                           |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Step 1-A | 全ケースで必須                                      | 完了タスク、関連ドキュメント、LOGS 2件、SKILL 2件の更新対象が記録されている                                        |
| Step 1-B | 全ケースで必須                                      | `spec_created` / `completed` の使い分け条件が記録されている                                                        |
| Step 1-C | 関連タスクまたは証跡がある場合                      | `grep` の結果に基づくリンク更新対象が記録されている                                                                |
| Step 1-D | 仕様書の見出し・行数に変更がある場合                | `topic-map.md` 再生成と行番号同期が記録されている                                                                  |
| Step 1-E | 未タスクを1件以上検出した場合                       | 指示書作成、台帳登録、`verify-unassigned-links.js`、`audit-unassigned-tasks.js` の結果が記録されている             |
| Step 1-F | CI/CD 変更がある場合                                | DevOps更新、または `N/A` 理由が記録されている                                                                      |
| Step 1-G | 全ケースで必須                                      | `quick_validate.js` 3件実行、Warning 分類、補助経路有無が記録されている                                            |
| Step 2   | new public I/F、IPC、定数、テスト戦略変更がある場合 | 更新対象仕様書または `更新なし` 理由が `spec-update-summary.md` と `documentation-changelog.md` の両方に記録される |

## Phase 12 完了チェックリスト

- [x] Task 12-1 Part 1 に日常生活の例え話が含まれている
- [x] Task 12-1 Part 2 に型定義、APIシグネチャ、使用例、エッジケースが含まれている
- [x] Step 1-A で `.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`、`.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`、`.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md` の更新対象が定義されている
- [x] Step 1-A で `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の両方を更新することが記録されている
- [x] Step 1-A で `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の変更履歴更新が記録されている
- [x] Step 1-B で task-043b の `spec_created` / `completed` 判定条件が記録されている
- [x] Step 1-C で `grep -rn` を用いた関連タスク探索が記録されている
- [x] Step 1-D で `generate-index.js` による `topic-map.md` 再同期が記録されている
- [x] Step 1-E で未タスク0件時の扱い、または 1件以上時の登録手順が記録されている
- [x] Step 1-E で `verify-unassigned-links.js` と `audit-unassigned-tasks.js` の current / baseline 分離記録が定義されている
- [x] Step 1-F の `N/A` 条件または DevOps更新条件が記録されている
- [x] Step 1-G で `quick_validate.js` を 3スキルへ実行する手順が記録されている
- [x] Step 2 の更新必要条件と `更新なし` 条件が記録されている
- [x] `spec-update-summary.md` と `documentation-changelog.md` の更新有無一致が記録されている
- [x] `outputs/phase-12/spec-update-summary.md`、`outputs/phase-12/documentation-changelog.md`、`outputs/phase-12/unassigned-task-detection.md`、`outputs/phase-12/skill-feedback-report.md` の4点が必須成果物として定義されている
- [x] `outputs/phase-12/ipc-documentation.md` の条件付き生成ルールが記録されている
- [x] `artifacts.json` と `outputs/artifacts.json` の同期条件が記録されている
- [x] 実行時に `phase-12-documentation.md` の `ステータス=completed` と完了チェックリストを同期することが記録されている

## サブタスク管理

1. 実装ガイド構成定義
2. Step 1-A〜1-G 手順定義
3. Step 2 判定条件定義
4. 未タスク / feedback / changelog 定義
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認
- [x] `spec-update-summary.md` と `documentation-changelog.md` の更新有無が一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の同期条件が明記されている

## 次のPhase

Phase 13: PR作成
