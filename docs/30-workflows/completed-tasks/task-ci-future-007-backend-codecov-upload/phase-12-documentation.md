# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 12                                        |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

TASK-CI-FUTURE-007 の実装成果を `task-specification-creator` と `aiworkflow-requirements` の正本へ同期する。
この Phase では実装コードは触らず、仕様・台帳・履歴・未タスク・フィードバックを分離して記録する。

---

## 中学生レベル概念説明

このフェーズでやることは、ひとことで言うと「テストがどこまで確認できたかを記録・公開する仕組みを整える」ことです。

### カバレッジとは何か

テストを実行したとき、「プログラムのどの部分を実行できたか」を記録したものがカバレッジです。
たとえば100行のコードがあって、テストが70行分を通過できたなら、カバレッジは70%です。
カバレッジが高いほど、「テストがコードをしっかり確認できている」ことを意味します。

### Codecov とは何か

Codecov は、カバレッジの結果をグラフや数値でわかりやすく見せてくれるサービスです。
毎回の CI 実行でカバレッジを Codecov にアップロードすると、「前回より下がった・上がった」を自動で比較してくれます。
学校の成績表のように、テストの「網羅度」が見えるようになります。

### フラグとは何か

Codecov では、異なるパッケージのカバレッジを区別するために「フラグ」というラベルを使います。
たとえば `desktop` フラグは Electron アプリのカバレッジ、`backend` フラグはバックエンドのカバレッジです。
フラグを使うことで、「どのパッケージのカバレッジが改善・悪化したか」を個別に追跡できます。

### シャードとは何か

シャードとは、テストを複数のグループに分割して並列実行する仕組みです。
たとえば100個のテストを2シャードに分けると、50個ずつ2台のマシンで同時に実行できます。
これにより、テスト全体の実行時間を半分に短縮できます。
シャードをまたいでカバレッジを収集する場合は、各シャードの結果を最後に結合する必要があります。

Phase 12 では、次の6つをまとめて整えます。

1. わかりやすい実装ガイドを書く（中学生レベルと技術者レベルの2パート構成）
2. どの仕様書をどう直したかを記録する
3. 変更の履歴を残す
4. まだ残っている課題を見つけて記録する
5. このスキルと仕様書がちゃんと合っているかを確認する
6. 最後に、変更内容の整合性をもう一度チェックする

---

## 事前チェック【必須】

Phase 12 を始める前に、次を先に確認する。

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する
2. `LOGS.md` は `aiworkflow-requirements` と `task-specification-creator` の両方を更新対象に含める
3. `SKILL.md` の変更履歴テーブルを両方更新対象に含める
4. `topic-map.md` / `keywords.json` の再生成が必要かを確認する
5. 仕様策定時の仮置き表現（「仕様策定のみ」「実行予定」「保留として記録」）を残さない
6. Phase 13 は user approval がない限り blocked のままにする

---

## 実行タスク

| Task      | 内容                                                                          | 主成果物                                                 |
| --------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 2パート構成の実装ガイド作成                                                   | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec update summary 作成                                               | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | documentation changelog と artifacts.json / outputs/artifacts.json / 履歴同期 | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | unassigned task detection 作成                                                | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | skill feedback report 作成                                                    | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check 作成                                       | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 2パート構成の実装ガイド作成
- Task 12-2: system spec update summary 作成
- Task 12-3: documentation changelog と artifacts.json / outputs/artifacts.json / 履歴同期
- Task 12-4: unassigned task detection 作成
- Task 12-5: skill feedback report 作成
- Task 12-6: phase12-task-spec-compliance-check 作成

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと。

---

## 参照資料

| 資料名                    | パス                                                                                                                  | 説明                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                                              | non-visual smoke test の結果                               |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                                             | AC-1〜AC-5 の最終照合結果                                  |
| Phase 9 品質チェック結果  | `outputs/phase-9/quality-check-result.md`                                                                             | 前段の品質ゲート結果                                       |
| Phase 8 リファクタ結果    | `outputs/phase-8/refactoring-result.md`                                                                               | コメント・命名整理の確認                                   |
| Phase 7 カバレッジ確認    | `outputs/phase-7/coverage-check-result.md`                                                                            | main push / PR の収集条件確認                              |
| Phase 6 テスト拡張結果    | `outputs/phase-6/test-expansion-result.md`                                                                            | シャード別検証の確認                                       |
| Phase 5 実装結果          | `outputs/phase-5/implementation-result.md`                                                                            | 実装差分の確認                                             |
| Phase 2 設計決定記録      | `outputs/phase-2/design-decisions.md`                                                                                 | backend カバレッジ設計の確認                               |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md`                                                                              | Phase 12 で回収する前提の確認元                            |
| index.md                  | `docs/30-workflows/task-ci-future-007-backend-codecov-upload/index.md`                                                | Phase 12 完了後に Phase 1-12 の status を完了へ更新する    |
| artifacts.json            | `docs/30-workflows/task-ci-future-007-backend-codecov-upload/artifacts.json`                                          | Phase 12 完了後に status を `phase12_completed` へ更新する |
| AC 検証記録               | `outputs/phase-10/ac-verification.md`                                                                                 | Phase 10 成果物                                            |
| 手動テストレポート        | `outputs/phase-11/manual-test-report.md`                                                                              | Phase 11 成果物                                            |
| 発見された問題            | `outputs/phase-11/discovered-issues.md`                                                                               | Phase 11 成果物                                            |
| CI 実行時間計測           | `outputs/phase-11/ci-timing-measurements.md`                                                                          | Phase 11 成果物                                            |
| キャプチャメタデータ      | `outputs/phase-11/phase11-capture-metadata.json`                                                                      | Phase 11 成果物                                            |
| 品質チェック結果          | `outputs/phase-9/quality-check-result.md`                                                                             | Phase 9 成果物                                             |
| 台帳正本                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `task-workflow-completed.md`           | 未タスク移管と完了記録                                     |
| Phase 12 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` / `phase-template-phase12-detail.md` | 出力名・必須タスクの根拠                                   |
| CI 設定ファイル           | `.github/workflows/ci.yml`                                                                                            | backend カバレッジ追加・条件分岐の確認元                   |
| vitest 設定ファイル       | `apps/backend/vitest.config.ts`                                                                                       | coverage 設定変更の確認元                                  |

---

## 実行手順

### Task 12-1: 実装ガイド作成

`implementation-guide.md` は 2パート構成とする。

#### Part 1: 中学生レベルの説明

- なぜ必要かを先に書く
- 日常のたとえ話を最低1つ入れる
- 専門用語を使う場合は、その場で簡単に説明する
- 以下の内容を順番を崩さずに説明する

**説明すべき概念:**

1. **なぜカバレッジを収集するか**: コードのどこが未テストか見えるようにするため
2. **なぜ main push 時のみか**: PR ごとに毎回アップロードすると Codecov の無料枠を消費しすぎるため
3. **フラグ `backend` とは何か**: `desktop` とカバレッジを区別するためのラベル
4. **シャード別収集と結合**: 2 シャードに分けたテストのカバレッジを最後に1つに合わせる仕組み

#### Part 2: 技術者向け詳細

- `VITEST_SHARDED_COVERAGE` 環境変数の役割を説明する
- `vitest.config.ts` の coverage 設定（provider・reporter・outputDir）を説明する
- `ci.yml` での条件分岐の書き方を説明する
  - `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
- Codecov の `flags` オプションと `backend` フラグの効果を説明する
- 変更前後の比較表（カバレッジ収集あり/なし・フラグ設定）を記載する
- エッジケースと注意点を列挙する
  - シャード数が変わった場合のカバレッジ結合への影響
  - `VITEST_SHARDED_COVERAGE` が未設定の場合の動作
- `## 視覚証跡` を追加し、UI/UX 変更なしのため Phase 11 スクリーンショット不要を明記する

### Task 12-2: system spec update summary 作成

`system-spec-update-summary.md` には、実際に更新すべき正本を1か所にまとめる。

```bash
# 変更対象の仕様書を再生成・確認する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 構造検証を実施する
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js
```

#### Step 1-A: LOGS.md 更新

- `.claude/skills/task-specification-creator/LOGS.md` に TASK-CI-FUTURE-007 完了記録を追加する
- `.agents/skills/task-specification-creator/LOGS.md` に同内容を同期する（mirror同期）
- 変更日時・変更内容・影響範囲を記録する

#### Step 1-B: 実装状況テーブル更新

- `artifacts.json` の TASK-CI-FUTURE-007 の status を `spec_created` から `phase12_completed` へ更新する
- `outputs/artifacts.json` を root `artifacts.json` と同じ completed 状態へ同期する
- 変更内容:
  - `.github/workflows/ci.yml`: backend カバレッジ収集ステップ追加・Codecov アップロードに `flags: backend` 設定・main push 条件分岐追加
  - `apps/backend/vitest.config.ts`: coverage 設定追加（必要な場合のみ）
- `codecov.yml`: `backend` flag 定義を追加

#### Step 1-C: 関連タスクテーブル更新

- 未タスクとして残すものは明示して分類する
- 関連する未実施の改善案を unassigned task detection で別途管理する
- 今回の変更は CI 設定のみで、アプリケーションコードの変更はないことを明記する

#### Step 2: 新規インターフェース追加なし

- 今回の変更は CI 設定ファイル（`ci.yml`）と Vitest 設定ファイルのみ
- 新規インターフェース / 型 / 定数 / API 変更はない
- 更新不要な理由を `system-spec-update-summary.md` に明記する

### Task 12-3: documentation changelog と履歴同期

`documentation-changelog.md` では、変更の前後と根拠を短く記録する。

```bash
# documentation changelog を生成
node scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/task-ci-future-007-backend-codecov-upload

# Phase 12 完了登録と artifacts.json 同期
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-ci-future-007-backend-codecov-upload \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:system spec update summary,outputs/phase-12/documentation-changelog.md:documentation changelog,outputs/phase-12/unassigned-task-detection.md:unassigned task detection,outputs/phase-12/skill-feedback-report.md:skill feedback report,outputs/phase-12/phase12-task-spec-compliance-check.md:phase12 compliance check"

# 仮置き表現が残っていないことを確認
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/task-ci-future-007-backend-codecov-upload/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "仮置き表現なし"

# .claude 正本と .agents mirror の parity を確認
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

記録する内容:

- 変更対象ファイル（`.github/workflows/ci.yml`、`apps/backend/vitest.config.ts`、`codecov.yml`）
- 変更理由（backend カバレッジ収集・Codecov `backend` フラグ追加・main push 厳密条件）
- current（変更後の設定値）/ baseline（変更前の設定値）
- validator 実行結果
- `artifacts.json` と `outputs/artifacts.json` の parity
- Phase 11 の実測証跡（`manual-test-report.md` / `ci-timing-measurements.md`）
- 仮置き表現が残っていないことの確認

あわせて次を更新する。

- `aiworkflow-requirements/LOGS.md`
- `task-specification-creator/LOGS.md`
- `aiworkflow-requirements/SKILL.md`
- `task-specification-creator/SKILL.md`
- `.claude` を正本にし、`.agents` mirror がある場合は同一 wave で同期する

### Task 12-4: unassigned task detection

`unassigned-task-detection.md` には、0件でも必ず結果を書く。

確認元:

- Phase 3 の MINOR 指摘
- Phase 10 の MINOR / residual issue
- Phase 11 の non-visual smoke test で出た所見
- `TODO` / `FIXME` / `HACK` / `XXX`

未タスク候補として記録すべき改善案（0件でも出力する）:

- `test-web` 以外のジョブ（`test-shared` を含む他ジョブ）への backend カバレッジ拡張
- カバレッジ閾値（threshold）の設定（一定以下になった場合に CI を失敗させる）
- Codecov ダッシュボードへの PR コメント自動投稿設定
- シャード数変更時のカバレッジ結合スクリプトの自動調整

```bash
# Phase 12 の未タスク候補を確認する
rg -n "TODO|FIXME|HACK|XXX" \
  docs/30-workflows/task-ci-future-007-backend-codecov-upload \
  .claude/skills/aiworkflow-requirements/references/task-workflow-*.md

# CI 設定ファイルの確認
rg -n "TODO|FIXME|HACK|XXX" \
  .github/workflows/ci.yml \
  apps/backend/vitest.config.ts
```

未タスクが出た場合は `docs/30-workflows/unassigned-task/` に正式な指示書を作成する。

### Task 12-5: skill feedback report

`skill-feedback-report.md` には、改善点がなくても `改善点なし` と書く。

確認観点:

- `task-specification-creator` スキルのフォーマットが今回のタスクに適合していたか
- Phase 12 のテンプレートに不足・過剰があったか
- CI カバレッジアップロードタスク特有の観点でスキル改善が必要かどうか

### Task 12-6: phase12-task-spec-compliance-check

`phase12-task-spec-compliance-check.md` には、次を確認する。

- Task 12-1 〜 12-6 が全て完了している
- `implementation-guide.md` が 2 パート構成である（Part 1: 中学生レベル、Part 2: 技術者向け）
- `implementation-guide.md` に `## 視覚証跡` があり、Phase 11 スクリーンショット不要を明記している
- `system-spec-update-summary.md` が artifacts / outputs.artifacts 同期を含む
- `documentation-changelog.md` が current / baseline を含む
- `unassigned-task-detection.md` が 0件でも出力されている
- `skill-feedback-report.md` が省略されていない
- `manual-test-report.md` / `ci-timing-measurements.md` が生成されている
- `implementation-guide.md` に `## 視覚証跡` があり、Phase 11 スクリーンショット不要が明記されている

```bash
# Phase 12 完了チェック
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-ci-future-007-backend-codecov-upload --phase 12
```

---

## 統合テスト連携

- Phase 11 の non-visual smoke test 結果を Phase 12 の根拠に使う
- 仕様書更新後に、Phase 10 の AC 記録と矛盾しないことを確認する
- Phase 13 は user approval 取得まで blocked のまま維持する

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-12-1 | 実装ガイド作成                     | 完了       |
| T-12-2 | system spec update summary 作成    | 完了       |
| T-12-3 | documentation changelog 同期       | 完了       |
| T-12-4 | unassigned task detection          | 完了       |
| T-12-5 | skill feedback report 作成         | 完了       |
| T-12-6 | phase12-task-spec-compliance-check | 完了       |

---

## 成果物

| 成果物                     | 配置先                                                   | 形式     |
| -------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | Markdown |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| phase 12 compliance check  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] 実装ガイドが 2 パート構成で作成されている（Part 1: 中学生レベル、Part 2: 技術者向け）
- [ ] system spec update summary が Step 1-A 〜 2 を含んでいる
- [ ] documentation changelog が current / baseline / validator を含んでいる
- [ ] `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` が更新されている
- [ ] `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` が更新されている
- [ ] `.claude` 正本と `.agents` mirror の差分が揃っている
- [ ] `topic-map.md` と `keywords.json` の再生成要否が確認されている
- [ ] unassigned task detection が 0件でも出力されている
- [ ] skill feedback report が省略されていない
- [ ] phase12-task-spec-compliance-check が PASS である
- [ ] 仮置き表現が残っていない

---

## タスク100%実行確認【必須】

- [ ] T-12-1: 実装ガイド作成を完了済み
- [ ] T-12-2: system spec update summary を完了済み
- [ ] T-12-3: documentation changelog と履歴同期を完了済み
- [ ] T-12-4: unassigned task detection を完了済み
- [ ] T-12-5: skill feedback report を完了済み
- [ ] T-12-6: phase12-task-spec-compliance-check を完了済み

---

## 次Phase

**Phase 13: PR作成** — ユーザーの明示承認がある場合のみ blocked を解除する。

**Phase 13 開始条件**: user approval がない限り blocked のまま維持する。
