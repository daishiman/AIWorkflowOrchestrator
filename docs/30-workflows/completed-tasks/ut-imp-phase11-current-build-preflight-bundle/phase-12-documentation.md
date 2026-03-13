# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001                                 |
| Phase      | 12                                                                                |
| Phase名    | ドキュメント                                                                      |
| カテゴリ   | 改善                                                                              |
| 優先度     | 中                                                                                |
| ステータス | completed                                                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase  | Phase 13                                                                          |

## 目的

実装ガイド、system spec 更新、documentation changelog、未タスク監査、skill feedback の 5 タスクを一括で完了し、preflight bundle の知見を正本仕様へ反映する。

## 実行タスク

- タスク1: 実装ガイドを作成する
- タスク2: system spec を更新する
- タスク3: documentation changelog と準拠チェックを作成する
- タスク4: 未タスク監査を作成する
- タスク5: skill feedback を作成する

### タスク1: 実装ガイド作成

**目的**: 初学者向け説明と開発者向け説明を同じ bundle 名で残す

**Part 1: 中学生レベル説明**

- 例え話: 「登校前の持ち物チェック表を 1 枚にまとめるイメージ。教科書、宿題、上履き、連絡帳を別々に確認すると抜けやすいので、1 枚の表で出発前に確認する。」
- 何をしたか: build 前提の確認を 1 コマンドへまとめた
- なぜか: screenshot 実行の失敗理由をすぐ分けるため

**Part 2: 開発者向け説明**

- shared preflight core、thin CLI wrapper、capture consumer の責務分離
- CLI 引数、JSON schema、exit code、metadata 形式
- capture script との接続点
- failure bucket ごとの guidance
- current と baseline の記録ルール

### タスク2: system spec 更新

**目的**: 正本仕様へ preflight bundle の導線を残す

**更新対象**:

| 更新先                                                                                                | 更新内容                                                                         |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | preflight bundle 名、実行順、manual test 導線                                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | 完了記録または backlog 状態の更新                                                |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | build 先行、4 bucket 分離、guidance 設計                                         |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       | representative screenshot workflow の再利用メモ                                  |
| `.claude/skills/skill-creator/references/patterns.md`                                                 | Playwright browser preflight と serial failure simulation の再利用パターンを追加 |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`                   | browser install preflight と serial failure simulation の完了チェックを追加      |
| `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`                          | 仕様書別 SubAgent 実行ログテンプレートへ同ルールを追加                           |
| `.claude/skills/skill-creator/references/resource-map.md`                                             | 上記 capability を入口から辿れる説明へ更新                                       |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                  | current と baseline の分離記録を参照する箇所の確認                               |

**Step 1-A: タスク完了記録と canonical root 同期**

1. user 指定 root である `.claude/skills/**` を canonical root として扱う。
2. `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md`、必要時は `.claude/skills/skill-creator/LOGS.md` を更新する。
3. `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md`、必要時は `.claude/skills/skill-creator/SKILL.md` の変更履歴を更新する。
4. `.agents/skills/**` が mirror root として存在する場合は drift を確認し、差分有無を `documentation-changelog.md` に記録する。

**Step 1-B: 実装状況テーブル更新**

1. 本タスクが実装完了なら `completed`、仕様書作成のみなら `spec_created` を使う。
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` と関連 workflow 表の status を同期する。

**Step 1-C: 関連タスクテーブル更新**

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md`、`.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` 内の関連タスク表を確認する。
2. 未タスク候補、関連タスク、完了タスクの表記を current state に合わせる。

**Step 1-D: index / 台帳再生成**

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、topic-map と keywords を再生成する。
2. `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle --regenerate` を実行し、workflow index を再生成する。
3. `artifacts.json` と `outputs/artifacts.json` が一致していることを確認する。

**Step 1-E: 未タスク指示書作成・登録**

1. `outputs/phase-12/unassigned-task-detection.md` で新規未タスクが 1 件以上見つかった場合は、正しい root に指示書を物理作成する。
2. active/current workflow 由来の backlog は `docs/30-workflows/unassigned-task/`、completed workflow 由来は `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` に配置する。
3. `.claude/skills/aiworkflow-requirements/references/task-workflow.md`、関連仕様書、workflow 本文の関連タスク表へ同じ task ID を登録する。
4. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、リンク整合を確認する。

**Step 2: 条件付きシステム仕様更新**

1. 新規インターフェース、型、定数、設定値が増えた場合のみ仕様本文を更新する。
2. 変更がない場合も `documentation-changelog.md` に「更新不要」の理由を記録する。

### タスク3: documentation changelog と準拠チェック

**目的**: Phase 12 の実施順と抜け漏れを残さない

**成果物**:

| 成果物                                                   | 内容                   |
| -------------------------------------------------------- | ---------------------- |
| `outputs/phase-12/documentation-changelog.md`            | Step ごとの実施結果    |
| `outputs/phase-12/spec-update-summary.md`                | 更新した正本仕様の一覧 |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック  |

**必須記録項目**:

- Step 1-A: canonical root、LOGS.md×2、SKILL.md×2、mirror drift
- Step 1-B: `completed` または `spec_created`
- Step 1-C: 関連タスク表の同期結果
- Step 1-D: aiworkflow index 再生成、workflow index 再生成、`artifacts.json` 二重台帳同期
- Step 1-E: 未タスク指示書の作成先、台帳登録、`verify-unassigned-links.js` の結果
- Step 2: 本文更新の有無と理由

### タスク4: 未タスク監査

**目的**: new backlog 候補を current と baseline に分離して記録し、1 件以上検出された場合は未タスク指示書まで作成する

**監査ルール**:

| 項目           | ルール                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| current 監査   | `audit-unassigned-tasks --json --diff-from HEAD` の結果を記録する                                                                            |
| baseline 監査  | `audit-unassigned-tasks --json` の結果を別欄へ記録する                                                                                       |
| 0件報告        | new backlog が 0 件でも report を作る                                                                                                        |
| canonical root | `.claude/skills/**` を正本として扱い、mirror 差分の確認結果を記録する                                                                        |
| 3ステップ登録  | 1件以上検出時は「指示書作成 -> `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 登録 -> 関連仕様書リンク」を全て実施する |
| リンク検証     | Step 1-E 後に `verify-unassigned-links.js` を実行し、結果を残す                                                                              |

### タスク5: skill feedback

**目的**: 今回の workflow 作成・実装導線で再利用価値のある改善点を、skill 正本へ返す

**対象スキル**:

| スキル                                      | 取り扱い                                                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements`    | 必須。resource-map / quick-reference / workflow guard 導線の有効性を評価する                                                |
| `.claude/skills/task-specification-creator` | 必須。Phase 12 Task 1-5、Step 1-A〜1-E、validator 期待値との差分を評価する                                                  |
| `.claude/skills/skill-creator`              | 必須。今回の user 要求により、Playwright browser preflight と serial failure simulation をテンプレートと pattern へ還元する |

**記録ルール**:

| 項目           | ルール                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| 0件報告        | 改善点が 0 件でも `skill-feedback-report.md` を必ず作成する                                                 |
| canonical root | `.claude/skills/**` を正本として扱い、mirror root の drift は別欄で記録する                                 |
| 同値転記       | `skill-feedback-report.md`、`documentation-changelog.md`、`spec-update-summary.md` に同じ改善内容を転記する |
| 再利用性       | validator では拾えないズレも、次回 workflow 生成へ再利用できる単位で書く                                    |

## 参照資料

| 参照資料                 | パス                           | 説明                     |
| ------------------------ | ------------------------------ | ------------------------ |
| Phase 1 要件定義         | `phase-1-requirements.md`      | AC と bucket 定義        |
| Phase 2 設計             | `phase-2-design.md`            | contract と sync plan    |
| Phase 5 実装             | `phase-5-implementation.md`    | 実装対象                 |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`    | CLI と metadata coverage |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`    | command log              |
| Phase 8 リファクタリング | `phase-8-refactoring.md`       | helper 境界              |
| Phase 9 品質保証         | `phase-9-quality-assurance.md` | quality report           |
| Phase 10 最終レビュー    | `phase-10-final-review.md`     | gate 判定                |
| Phase 11 手動テスト      | `phase-11-manual-test.md`      | manual test 成果物       |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 抽出入口         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                      | 必要仕様を最小集合へ絞る入口               |
| 検索順序         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                   | 検索語の分割と読む順番                     |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | preflight bundle の導線追加先              |
| task 台帳        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  | backlog または completed の同期先          |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | 4 bucket と build 先行の追記先             |
| feature catalog  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       | representative workflow 参照先             |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core 採用理由の文書化               |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | guidance / exit code / blocked の仕様同期  |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | Phase 11/12 証跡と strict validator の整合 |
| Phase 12 手順    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        | system spec 更新手順                       |
| Phase 12 定義    | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                | 準拠チェック項目                           |
| 未タスク監査     | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                  | current と baseline の分離記録             |

## 実行手順

### ステップ1: 実装ガイドと system spec 更新を閉じる

shared core、thin CLI wrapper、capture consumer の実装意図を Part 1/2 と system spec の両方へ同期する。

### ステップ2: current/baseline と canonical root を監査する

未タスク監査、mirror drift、LOGS/SKILL 更新、二重台帳同期を current state に合わせて記録する。

### ステップ3: skill feedback を再利用単位へ還元する

今回の改善点を `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` の 3 skill へ返し、current build screenshot 系 task の初動を短縮する。

## 統合テスト連携

- Phase 11 で記録した success path と failure path を Part 2 の実装ガイドへ引き継ぐ。
- current と baseline の監査結果は task-workflow と lessons-learned の更新根拠にする。
- canonical root / mirror drift の確認結果は Phase 13 の PR 情報へ引き継ぐ。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                                          | 主要仕様                                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ     | shared core 採用理由と破棄案を実装ガイドへ残せているかを見る                     | `architecture-implementation-patterns.md`                                                                                                                                                                                    |
| エラーハンドリング | guidance / exit code / blocked の説明が Part 2 と正本仕様で一致するかを見る      | `error-handling.md`                                                                                                                                                                                                          |
| 品質               | Phase 11/12 の証跡と strict validator の結果がそろっているかを見る               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                                     |
| 文書同期           | canonical root、current/baseline、unassigned link 検証が同値で記録されるかを見る | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |

## 成果物

| 成果物               | パス                                                     | 内容                           |
| -------------------- | -------------------------------------------------------- | ------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 と Part 2               |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`                | 更新した正本仕様の一覧         |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | Step ごとの結果                |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`          | current と baseline の監査記録 |
| skill feedback       | `outputs/phase-12/skill-feedback-report.md`              | スキル改善点                   |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了条件の確認        |

## 完了条件

- [ ] 実装ガイドの Part 1 と Part 2 が作成されている
- [ ] system spec の更新先が 4 件以上記録されている
- [ ] LOGS.md×2 と SKILL.md×2 の更新手順が記録されている
- [ ] `.claude` 正本更新後の mirror 確認結果が記録されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の同期確認が記録されている
- [ ] current と baseline の監査結果が別欄で記録されている
- [ ] 新規未タスクが 1 件以上ある場合、Step 1-E の 3 ステップ登録と link 検証結果が記録されている
- [ ] skill feedback と準拠チェックが個別成果物として作成されている

## 次Phase

Phase 13: PR作成へ進む。
