# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| Phase名    | ドキュメント更新             |
| 対象タスク | TASK-CI-FUTURE-005           |
| 前提Phase  | Phase 11: 手動テスト         |
| 次Phase    | Phase 13: PR作成（条件付き） |
| ステータス | pending                      |
| 作成日     | 2026-04-15                   |

## 目的

実装ガイド・システム仕様書更新・ドキュメント更新履歴・未タスク検出・スキルフィードバック・準拠確認の
6 タスクを完了する。TASK-CI-FUTURE-005 の CI-M-01 解決を公式記録に残す。

## 実行タスク

### Task 1（必須）: 実装ガイド作成（2パート構成）

#### Part 1（中学生レベル）: GitHub Actions のキューイングって何？

**なぜこれが必要なのか？**

たとえば、学校の給食を想像してください。給食当番が 20 人いて、全員が同時に料理を取りに行くと、
配膳口が混雑して「ちょっと待ってね」という状態になりますよね。
これが「キューイング（順番待ち）」です。

GitHub Actions の CI（自動テスト）でも同じことが起きます。
テストを 17 個のグループに分けて同時に実行しようとすると、
GitHub のサーバーが「20 個同時は上限だよ」と言って、
少しだけ待たせることがあります。

**何を確認したの？**

「実際にどれくらい待たされるのか」を計測しました。
60 秒以内なら問題なし。60 秒より長いなら、グループ数を 17 から 16 に減らします。

#### Part 2（技術者向け）: 計測実装の詳細

**計測コマンド**:

```bash
# キューイング時間の算出
gh run view <run-id> --json jobs \
  | jq '[.jobs[]
      | select(.name | startswith("test-desktop") and .startedAt != null)
      | (.startedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)
    ] | max'
```

**キューイング時間の定義**:

```
キューイング時間 = startedAt（実行開始時刻） - createdAt（キュー投入時刻）
```

**判定閾値**: 60 秒

**データソース**: GitHub Actions の `gh run view --json jobs` API

**制約**:

- 単一 Run での計測（複数 Run の平均ではない）
- `startedAt` が null のジョブは計測対象外
- GitHub インフラの負荷状況に依存する可能性がある

### Task 2（必須）: システム仕様書更新（Step 1-A 〜 Step 1-C / docs-only / spec_created）

#### Step 1-A: タスク完了記録

以下のファイルに TASK-CI-FUTURE-005 の完了記録を追加する：

**更新対象ファイル**:

| ファイル                                                                              | 更新内容                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                      | TASK-CI-FUTURE-005 完了記録を追加          |
| `.claude/skills/task-specification-creator/LOGS.md`                                   | TASK-CI-FUTURE-005 仕様書作成記録を追加    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`        | TASK-CI-FUTURE-005 spec_created 記録を追加 |
| `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-3-design-review.md` | CI-M-01 指摘を「解決済み」に更新           |

**docs-only のため、Step 1-B は `spec_created` として記録する。**

**完了記録テンプレート**:

```markdown
## TASK-CI-FUTURE-005 完了記録

- タスク名: CI-M-01 実測確認（キューイング時間1分超判定）
- 完了日: [実施日]
- 計測結果: 最大キューイング時間 [X] 秒
- 判定: シャード数 17 継続 / 16 への戻し
- CI-M-01 解決: ✅ 解決済み
```

#### Step 1-B: 実装状況テーブル更新

`docs/30-workflows/unassigned-task/TASK-CI-FUTURE-005-queuing-time-verification.md` の
ステータスを「未実施」→「spec_created」に更新する。

#### Step 1-C: 関連タスクテーブル更新

TASK-CI-OPT-001 の Phase 3 設計レビュー書（`docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-3-design-review.md`）の
MINOR 追跡テーブルにある CI-M-01 の状態を「解決済み」に更新する。

#### Step 2（条件付き）: システム仕様更新

本タスクは新規インターフェース・型定義の追加がないため、Step 2 は N/A。

**N/A の理由**: CI ログ計測のみで、プロダクトコードへの変更なし。

### Task 3（必須）: ドキュメント更新履歴作成

`outputs/phase-12/documentation-changelog.md` に以下を記録する：

```markdown
# TASK-CI-FUTURE-005 ドキュメント更新履歴

## Step 1-A: タスク完了記録

- `.claude/skills/aiworkflow-requirements/LOGS.md`: 追記 / N/A
- `.claude/skills/task-specification-creator/LOGS.md`: 追記 / N/A
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`: TASK-CI-FUTURE-005 を spec_created で追記 / N/A
- `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-3-design-review.md`: CI-M-01 を「解決済み」に更新 / N/A

## Step 1-B: 実装状況テーブル更新

- TASK-CI-FUTURE-005 ステータス: 未実施 → spec_created

## Step 1-C: 関連タスクテーブル更新

- CI-M-01 指摘ステータス: 未解決 → 解決済み

## Step 2: システム仕様更新

- 判定: N/A（新規インターフェースなし）
- 根拠: `outputs/phase-12/system-spec-update-summary.md`

## Step 6: 準拠確認

- 判定: PASS / FAIL
- 根拠: `outputs/phase-12/phase12-task-spec-compliance-check.md`
```

### Task 4（必須）: 未タスク検出レポート作成

`outputs/phase-12/unassigned-task-detection.md` を作成する：

**検出ソース**:

| ソース              | 確認項目                                         | 件数   |
| ------------------- | ------------------------------------------------ | ------ |
| Phase 10 MINOR 指摘 | CI-M-01-A / CI-M-01-B / CI-M-01-C の残存未タスク | \_\_\_ |
| Phase 11 手動テスト | 新規発見事項                                     | \_\_\_ |
| 既知制限事項        | 複数 Run 計測の未タスク化要否                    | \_\_\_ |

**未タスク候補**:

| タスク名                             | 理由                                           | 優先度 | 未タスク化要否 |
| ------------------------------------ | ---------------------------------------------- | ------ | -------------- |
| CI キューイング計測の複数 Run 平均化 | 単一 Run 計測の限界（CI-M-01-B）を解消するため | 低     | 検討           |
| （Phase 11 実施後に追記）            |                                                |        |                |

**0件判定の場合も本ファイルは出力必須。**

正式名称は `unassigned-task-detection.md` であり、`unassigned-task-report.md` は使わない。

### Task 5（必須）: スキルフィードバックレポート作成

`outputs/phase-12/skill-feedback-report.md` を作成する：

| 観点             | 記録内容                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- |
| テンプレート改善 | NON_VISUAL タスク向けの計測コマンド実行フェーズ（Phase 5）のテンプレートに関する知見        |
| ワークフロー改善 | CI 計測タスクの特性上、前提条件（PR マージ確認）の自動チェックを Phase 1 に組み込む改善余地 |
| ドキュメント改善 | 計測結果の記録フォーマット（Run ID・計測値・判定根拠）の標準テンプレート化                  |

**改善点なしでも本ファイルは出力必須。**

### Task 6（必須）: phase12-task-spec-compliance-check 作成

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する：

| 確認対象       | 記録内容                                                                                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 1〜5      | 全タスク完了の確認                                                                                                                                                                                                                                                                     |
| Step 1-B       | `spec_created` で記録                                                                                                                                                                                                                                                                  |
| Step 2         | N/A の理由（`outputs/phase-12/system-spec-update-summary.md` に記録）                                                                                                                                                                                                                  |
| same-wave sync | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-3-design-review.md` / `.claude/skills/aiworkflow-requirements/LOGS.md` / `.claude/skills/task-specification-creator/LOGS.md` の同期 |
| 6成果物        | `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md`                                                                                     |
| 検証結果       | `verify-all-specs` / `verify-unassigned-links` / `validate-phase-output` / `quick_validate.js` / `diff -qr`                                                                                                                                                                            |
| 判定           | PASS / FAIL と根拠                                                                                                                                                                                                                                                                     |

**Task 1〜5 の全完了を確認してから作成する。**

## 参照資料

| 資料名                            | パス                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 1 要件定義                  | `outputs/phase-1/requirements.md`                                                           |
| Phase 2 設計書                    | `outputs/phase-2/design.md`                                                                 |
| Phase 5 成果物                    | `outputs/phase-5/measurement-result.md`                                                     |
| Phase 6 テスト拡充                | `outputs/phase-6/test-expansion.md`                                                         |
| Phase 7 カバレッジ報告            | `outputs/phase-7/coverage-report.md`                                                        |
| Phase 8 リファクタリング          | `outputs/phase-8/refactoring-notes.md`                                                      |
| Phase 9 QA レポート               | `outputs/phase-9/qa-report.md`                                                              |
| Phase 10 最終レビュー             | `outputs/phase-10/final-review.md`                                                          |
| Phase 11 手動テスト               | `outputs/phase-11/manual-test-result.md`                                                    |
| Phase 12 ドキュメントガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      |
| Phase 12 準拠チェックテンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` |

## 成果物

| 成果物                       | パス                                                     | 説明                                    |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）/ Part 2（技術者）      |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 更新内容の要約                          |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Step 1-A/B/C・Step 2・Step 6 の結果記録 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                         |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須                  |
| 仕様準拠チェック             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜6 の準拠確認                    |

## 完了条件

- [ ] Task 1（実装ガイド）: Part 1・Part 2 が作成されている
- [ ] Task 2（システム仕様更新）: Step 1-A/B/C が全て実施され、Step 1-B が `spec_created` で記録されている
- [ ] Task 2: Step 2 が N/A として記録されている
- [ ] Task 3（ドキュメント更新履歴）: 全 Step の結果と準拠確認の根拠が記録されている
- [ ] Task 4（未タスク検出）: 0件でも `unassigned-task-detection.md` が出力されている
- [ ] Task 5（スキルフィードバック）: 改善点なしでも出力されている
- [ ] Task 6（準拠確認）: `phase12-task-spec-compliance-check.md` が作成されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity が確認されている
- [ ] LOGS.md が 2 ファイル（aiworkflow-requirements・task-specification-creator）更新されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている（6件）
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 13: PR作成（条件付き）](./phase-13-pr-creation.md)
