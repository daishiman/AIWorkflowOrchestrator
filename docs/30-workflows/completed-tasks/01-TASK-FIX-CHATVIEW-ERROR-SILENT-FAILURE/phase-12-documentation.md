# Phase 12: ドキュメント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 12                                      |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-11-manual-test.md`               |

## 目的

Task 01 の実装結果と監査結果を、template 準拠の Phase 12 成果物 6 種へ固定する。今回は `manual-test-result.md` / `screenshot-plan.md` / `screenshot-coverage.md` の参照名、formalize 済みの未タスク 2 件、canonical system spec 更新、mirror parity を同時に記録する。

## 実行タスク

### Task 1: `outputs/phase-12/implementation-guide.md` を作成する

出力先: `outputs/phase-12/implementation-guide.md`

- Part 1: 中学生レベルの概念説明、日常の例え、なぜ必要か→何をするかの順序
- Part 2: 技術者向けの詳細、対象ファイル、型/インターフェース、error handling、edge case、検証結果
- 本 task では Task 01 の責務だけを扱い、`chatError` / `clearChatError` / `ERROR_MESSAGES` と Phase 11 証跡の対応を明記する
- Phase 11 のスクリーンショット名は `TC-11-01-default-light.png` 〜 `TC-11-05-auto-cleared-dark.png` に固定する

### Task 2: `outputs/phase-12/system-spec-update-summary.md` を作成し、system spec を同期する

出力先: `outputs/phase-12/system-spec-update-summary.md`

Step 1-A:

- workflow-local の完了記録と canonical `.claude/skills/...` 更新内容を同じ summary に記録する
- `manual-test-result.md` / `screenshot-plan.md` / `screenshot-coverage.md` / `documentation-changelog.md` への反映を記録する

Step 1-B / 1-C:

- 実装状況テーブル、関連タスクテーブル、未タスクリンクを確認する
- `task-ut-chatview-error-banner-i18n-001.md` / `task-ut-ai-chat-error-code-inventory-001.md` の formalize を記録する

Step 2:

- canonical system spec と log の更新実績を整理する
  - `workflow-ai-chat-llm-integration-fix.md`
  - `llm-ipc-types.md`
  - `error-handling-core.md`
  - `ui-ux-llm-selector.md`
  - `llm-streaming.md`
  - `arch-state-management-core.md`
  - `quick-reference.md`
  - `task-workflow.md`
  - `task-workflow-completed-chat-lifecycle-tests.md`
  - `task-workflow-backlog.md`
  - `lessons-learned-current.md`
  - `lessons-learned-ipc-preload-runtime.md`
- `generate-index.js` 実行と `.agents/skills/` mirror sync を summary に固定する

### Task 3: `outputs/phase-12/documentation-changelog.md` を作成する

出力先: `outputs/phase-12/documentation-changelog.md`

- Step 1 / Step 2 の変更ファイル一覧
- validator 結果
- current 実装と spec の差分要約
- Phase 11 の 5 つのスクリーンショット参照名
- 「該当なし」も明記する

### Task 4: `outputs/phase-12/unassigned-task-detection.md` を作成する

出力先: `outputs/phase-12/unassigned-task-detection.md`

- 0件でも必須
- Phase 10 の MINOR 指摘、TODO/FIXME/HACK、今回監査で scope 外と判断した項目を列挙する
- 未タスク化した 2 件は正式配置済みとして参照する
  - `docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md`
  - `docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md`

### Task 5: `outputs/phase-12/skill-feedback-report.md` を作成する

出力先: `outputs/phase-12/skill-feedback-report.md`

- task-specification-creator に対する改善点
- aiworkflow-requirements に対する改善点
- canonical / mirror / workflow-local 三層運用の改善点

### Task 6: `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する

出力先: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 1〜5 の完了確認
- 正式ファイル名の照合
- planned wording 残存確認
- Phase 11 / 12 の未解決事項を一段落で明記する

## Phase 10 MINOR 追跡テーブル

| MINOR ID | 指摘内容                                | 解決予定Phase | 解決確認Phase | 解決方法                                                       | ステータス |
| -------- | --------------------------------------- | ------------- | ------------- | -------------------------------------------------------------- | ---------- |
| M-01     | エラーメッセージ i18n 対応              | Phase 12      | Phase 12      | `task-ut-chatview-error-banner-i18n-001.md` として formalize   | formalized |
| M-02     | `ai.chat` error code inventory の明文化 | Phase 12      | Phase 12      | `task-ut-ai-chat-error-code-inventory-001.md` として formalize | formalized |

## 参照資料

| 資料名                           | パス                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 2 設計書                   | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`                       |
| Phase 5 実装                     | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md`               |
| Phase 6 テスト拡充               | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-6-test-expansion.md`               |
| Phase 7 カバレッジ確認           | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-7-coverage-check.md`               |
| Phase 8 リファクタリング         | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-8-refactoring.md`                  |
| Phase 9 品質保証                 | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-9-quality-assurance.md`            |
| Phase 10 最終レビュー            | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-10-final-review.md`                |
| Phase 11 手動テスト              | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-11-manual-test.md`                 |
| Phase 11 手動テスト結果          | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/manual-test-result.md`  |
| Phase 11 画面カバレッジ          | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshot-coverage.md` |
| task-workflow                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                  |
| Phase 12 テンプレート            | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`                      |
| phase-11-12-guide                | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                           |
| spec-update-workflow             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                        |
| aiworkflow-requirements skill    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                     |
| task-specification-creator skill | `.claude/skills/task-specification-creator/SKILL.md`                                                  |

## 実行手順

### Step 1: Phase 11 と current implementation を読み、Task 01 の実装差分を固定する

```bash
sed -n '1,260p' apps/desktop/src/renderer/store/slices/chatSlice.ts
sed -n '1,260p' apps/desktop/src/renderer/views/ChatView/index.tsx
sed -n '1,220p' apps/desktop/src/main/ipc/aiHandlers.ts
```

### Step 2: `outputs/phase-12/implementation-guide.md` を作成する

validator 要件に従い Part 1 / Part 2 を揃える。

### Step 3: `outputs/phase-12/system-spec-update-summary.md` を作成し、必要な system spec を更新する

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

mirror parity を確認するため、`.claude/skills/` と `.agents/skills/` の差分も確認する。

### Step 4: `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` を作成する

未タスクは 0 件でも出力する。

### Step 5: `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、正式ファイル名と Task 1〜5 完了を確認する

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE
```

必要がある場合は `manual-test-result.md` と `screenshot-coverage.md` の TC-ID / 参照名一致も確認する。

## 成果物

| 成果物                        | パス                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase 12 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-12-documentation.md`                              |
| 実装ガイド                    | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/implementation-guide.md`               |
| 仕様書更新サマリー            | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/system-spec-update-summary.md`         |
| documentation-changelog       | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出                  | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/unassigned-task-detection.md`          |
| skill feedback                | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/skill-feedback-report.md`              |
| compliance check              | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

### Task 1: 実装ガイド

- [ ] `outputs/phase-12/implementation-guide.md` に Part 1 / Part 2 を作成した

### Task 2: system spec update summary

- [ ] `outputs/phase-12/system-spec-update-summary.md` に Step 1 / Step 2 の結果を記録した
- [ ] 今回必要な requirements 抽出導線の改善有無を明記した
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、mirror parity を確認した

### Task 3: documentation changelog

- [ ] `outputs/phase-12/documentation-changelog.md` を作成した
- [ ] validator 結果と変更ファイル一覧を記録した

### Task 4: unassigned task detection

- [ ] `outputs/phase-12/unassigned-task-detection.md` を作成した
- [ ] 0件の場合も理由と確認ソースを記録した

### Task 5: skill feedback

- [ ] `outputs/phase-12/skill-feedback-report.md` を作成した

### Task 6: compliance check

- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成した
- [ ] 正式ファイル名と Task 1〜5 の完了を照合した

## 次Phase

Phase 13: 完了（`phase-13-pr-creation.md`）
