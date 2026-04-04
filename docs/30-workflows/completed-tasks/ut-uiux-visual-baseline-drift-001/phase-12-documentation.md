# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| Phase名    | ドキュメント更新                  |
| タスクID   | UT-UIUX-VISUAL-BASELINE-DRIFT-001 |
| 前Phase    | Phase 11: 手動テスト              |
| 次Phase    | Phase 13: PR作成                  |
| ステータス | 未実施                            |
| 作成日     | 2026-04-03                        |
| 機能名     | ut-uiux-visual-baseline-drift-001 |
| 成果物     | `outputs/phase-12/`               |

---

## 目的

Visual Baseline Drift 是正の経緯・判断根拠・対処内容をドキュメントに記録し、タスク仕様書のステータスを完了に更新する。これにより、将来同様の事象が発生した際の参照資料となる。

---

## 背景

Phase 11 の手動テストが完了し、全ての視認確認が済んだ状態でこのPhaseに入る。  
Phase 12 では実施した作業の記録を残す。特に「なぜ baseline 更新を行ったか（または行わなかったか）」という判断根拠の記録は、チームのナレッジとして重要である。

---

## Phase 12 必須成果物（skill準拠）

| 成果物                   | パス                                                     | 役割                                                 |
| ------------------------ | -------------------------------------------------------- | ---------------------------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 2パート構成の説明文書                                |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | 完了記録・Step 1/2 判定・no-op 根拠                  |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル・同期結果・validator 実行結果           |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力                                          |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | next action / 改善点なしの明記                       |
| Phase12準拠チェック      | `outputs/phase-12/phase12-task-spec-compliance-check.md` | planned wording / artifact parity / root consistency |
| 判断根拠記録（補助）     | `outputs/phase-12/decision-record.md`                    | diff 原因と対処の要点を集約する補助記録              |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイドを 2 パート構成で作成する

**目的**: Phase 4〜11 の変更内容を、初学者向けと開発者向けの 2 層で説明できる実装ガイドを作成する。

**出力**: `outputs/phase-12/implementation-guide.md`

**必須要件**:

- Part 1 は中学生レベルで書く
- Part 1 には日常の例え話を必ず入れ、`たとえば` を最低 1 回含める
- Part 1 は「なぜ必要か」を先に説明し、その後に「何をするか」を説明する
- Part 2 は開発者向けに、TypeScript の型定義、API / コマンドの使い方、エラー処理、エッジケース、設定可能パラメータを含める
- Part 2 には `colorScheme` と `maxDiffPixels`、baseline 更新、UI 修正、再検証コマンドを含める
- Part 2 では `git restore` を用いた安全な差し戻し方法も記載する

**Part 1 の説明対象**:

- baseline drift がなぜ起きるか
- UI 変更起因と Regression 起因の違い
- baseline 更新と UI 修正の選び分け

**Part 2 の説明対象**:

- 主要ファイル
  - `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts`
  - `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/`
  - `apps/desktop/playwright.config.ts`
  - `apps/desktop/e2e/ui-ux/test-targets.config.ts`
- 代表コマンド
  - `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2`
  - `pnpm --filter @repo/desktop exec playwright test --update-snapshots --project=ui-ux-layer2`
- 想定エラーと対処
  - 対象外 snapshot が更新された
  - `colorScheme` の設定が環境依存になった
  - `maxDiffPixels` が過大になった

### タスク2: system spec update summary を作成し、台帳を同期する

**目的**: Phase 4〜11 の判断結果を正本に同期し、必要な spec update の要否を明記する。

**出力**:

- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/decision-record.md`（補助）

**必須要件**:

1. `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md` の status を完了へ更新する
2. `artifacts.json` と `outputs/artifacts.json` の status / title / phase artifact 名を一致させる
3. Phase 4 の `diff-analysis.md` と Phase 11 の `manual-test-result.md` を根拠として、TC-11-05 / TC-11-06 / TC-11-07 の判定結果を整理する
4. `colorScheme` と `maxDiffPixels` の変更がある場合だけ、`aiworkflow-requirements` 側の spec update が必要かを判定する
5. spec update が不要なら、その理由を no-op として明記する

**記述すべき内容**:

- Step 1 の完了記録
- Step 2 の判定結果
- current / baseline の区別
- canonical root / mirror policy
- 変更した / 変更しなかった spec の理由

### タスク3: documentation changelog を作成する

**目的**: 今回の Phase 12 で変更した内容を、機械検証しやすい形で記録する。

**出力**: `outputs/phase-12/documentation-changelog.md`

**必須要件**:

- 変更したファイル一覧
- 実行した検証コマンドと結果
- current と baseline の区別
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点同期結果
- 未来形の表現を残さない
- discovered-issues.md を更新した場合はその内容も記録する

### タスク4: unassigned task detection を作成する

**目的**: この task から派生した follow-up を 0 件でも明示し、必要なら formalize する。

**出力**: `outputs/phase-12/unassigned-task-detection.md`

**必須要件**:

- 0 件でも summary を残す
- 1 件以上なら unassigned-task へ formalize する path を記録する
- baseline 起因の既知ドリフトと、今回の差分起因を分けて記録する

### タスク5: skill feedback report を作成する

**目的**: この Phase 12 実施で得た改善点を記録し、次回以降の task spec 作成に反映する。

**出力**: `outputs/phase-12/skill-feedback-report.md`

**必須要件**:

- 改善点がある場合は next action を書く
- 改善点がない場合でも `なし` と理由を書く
- `task-specification-creator` と `aiworkflow-requirements` のどちらに関する学びかを明示する

### タスク6: Phase12準拠チェックを実施する

**目的**: Phase 12 の必須成果物・planned wording・artifact parity を最終確認する。

**出力**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

**必須要件**:

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

**検証コマンド例**:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001 --phase 12
```

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001 \
  --phase 12 --artifacts "implementation-guide.md,system-spec-update-summary.md,documentation-changelog.md,unassigned-task-detection.md,skill-feedback-report.md,phase12-task-spec-compliance-check.md,decision-record.md"
```

---

## 参照資料

| 参照資料                 | パス                                                                                         | 内容                           |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 差分原因判定結果 | `outputs/phase-4/diff-analysis.md`                                                           | 判断根拠ドキュメントの元データ |
| Phase 11 手動テスト結果  | `outputs/phase-11/manual-test-result.md`                                                     | 視認確認の記録                 |
| 未タスク仕様書           | `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md`                     | ステータス更新対象             |
| artifacts.json           | `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/artifacts.json`         | Phase完了記録                  |
| outputs/artifacts.json   | `docs/30-workflows/completed-tasks/ut-uiux-visual-baseline-drift-001/outputs/artifacts.json` | Phase完了記録の mirror 側      |

---

## 成果物

| 成果物                     | パス                                                     | 内容                                         |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | 2 パート構成の説明ガイド                     |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | 判定根拠・Step 1/2 結果・no-op 根拠          |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧・検証結果・同期結果         |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | follow-up の formalize 可否                  |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | next action / 改善点なしの明記               |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須成果物・命名・planned wording の最終確認 |
| 判断根拠記録（補助）       | `outputs/phase-12/decision-record.md`                    | Phase 13 で再利用する判定要点                |

---

## 完了条件

- [ ] `docs/30-workflows/completed-tasks/UT-UIUX-VISUAL-BASELINE-DRIFT-001.md` のステータスを「完了」に更新した
- [ ] `artifacts.json` と `outputs/artifacts.json` の台帳を同期した
- [ ] `outputs/phase-12/implementation-guide.md` を 2 パート構成で作成した
- [ ] `outputs/phase-12/system-spec-update-summary.md` に Step 1 / Step 2 の結果を記録した
- [ ] `outputs/phase-12/documentation-changelog.md` に変更ファイルと検証結果を記録した
- [ ] `outputs/phase-12/unassigned-task-detection.md` に follow-up 判定を記録した
- [ ] `outputs/phase-12/skill-feedback-report.md` に改善フィードバックを記録した
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` に完了前チェックを記録した
- [ ] `outputs/phase-12/decision-record.md` に PR 用の判定要点を記録した
- [ ] planned wording が `outputs/phase-12/*.md` に残っていない
- [ ] `artifacts.json` の phase-12 ステータスを「完了」に更新した
