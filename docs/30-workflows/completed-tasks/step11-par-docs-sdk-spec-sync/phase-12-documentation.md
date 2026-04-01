# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 12                                  |
| 機能名 | step-11-par-task-docs-sdk-spec-sync |
| 作成日 | 2026-03-31                          |

## 目的

docs-only same-wave remediation の implementation guide、system spec update summary、changelog、未タスク有無、skill feedback、compliance check を揃え、タスクを documentation wave で閉じる。

## 実行タスク

- Task 12-1: implementation guide を作成する
- Task 12-2: system spec update summary を作成する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned task detection を作成する
- Task 12-5: skill feedback report を作成する
- Task 12-6: Phase 12 compliance check を作成する

## 参照資料

| 資料名                       | パス                                                                                    | 説明                    |
| ---------------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件                 | `phase-1-requirements.md`                                                               | acceptance 基準         |
| Phase 2 設計                 | `phase-2-design.md`                                                                     | same-wave 更新順        |
| Phase 5 成果物               | `outputs/phase-5/implementation-sequencing.md`                                          | 実更新対象              |
| Phase 6 拡張テスト           | `outputs/phase-6/test-expansion-summary.md`                                             | guard                   |
| Phase 7 カバレッジ           | `outputs/phase-7/coverage-summary.md`                                                   | coverage                |
| Phase 8 正規化               | `outputs/phase-8/refactoring-summary.md`                                                | 正規化点                |
| Phase 9 QA                   | `outputs/phase-9/qa-summary.md`                                                         | QA 結果                 |
| Phase 10 最終レビュー        | `phase-10-final-review.md`                                                              | 最終 gate               |
| Phase 11 手動テスト          | `phase-11-manual-test.md`                                                               | manual evidence         |
| Phase 12 Documentation Guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Task 12-1〜12-6 の正本  |
| Step 1 Completion            | `.claude/skills/task-specification-creator/references/spec-update-step1-completion.md`  | Step 1-A〜1-G の正本    |
| Validation Matrix            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator matrix の正本 |
| Completion Checklist         | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | 完了条件の正本          |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                              | 内容                                |
| --------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------- |
| completed ledger      | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | current fact                        |
| lessons               | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | 未完了表現 0 件ルール               |
| task-workflow-backlog | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | follow-up / backlog の current fact |

## 実行手順

### ステップ1-A〜G: same-wave sync を正本どおりに固定する

| Step | 内容             | 主要更新先                                                                                                                                                                                     | 補足                         |
| ---- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| A    | 完了記録         | `phase-12-documentation.md`, `task-workflow.md`, `artifacts.json`, `outputs/artifacts.json`, `LOGS.md` x2, `SKILL.md` x2                                                                       | current facts を先に固定する |
| B    | 実装状況テーブル | `phase-12-documentation.md`                                                                                                                                                                    | `spec_created` を維持する    |
| C    | 関連タスク表     | `phase-12-documentation.md` / related tables                                                                                                                                                   | `grep` で横断確認する        |
| D    | index 再生成     | `index.md` / `topic-map.md`                                                                                                                                                                    | 見出し差分を反映する         |
| E    | 未タスク検出     | `unassigned-task-detection.md`                                                                                                                                                                 | 0件でも出力する              |
| F    | 補助更新         | `documentation-changelog.md` / `system-spec-update-summary.md` / lessons / backlog                                                                                                             | no-op 根拠を記録する         |
| G    | 検証             | `quick_validate` / `validate_all` / `verify-all-specs` / `validate-phase-output` / `validate-phase12-implementation-guide` / `verify-unassigned-links` / `audit-unassigned-tasks` / `diff -qr` | phase 9/12 へ結果を転記する  |

### ステップ2: 必須 6 成果物を揃える

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### ステップ3: same-wave 根拠を残す

- SDK-02 / SDK-04 の更新対象、実行順、no-op 根拠、validator 実測値を明記する。
- `.claude` 正本を更新した場合は mirror parity の要否も記録する。

### ステップ4: 未完了表現を禁止する

- `更新予定`、`後でやる`、`後続判断待ち`、`仕様策定のみ`、`実行予定`、`保留として記録` を残さない。

## 検証コマンド

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/step11-par-docs-sdk-spec-sync --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/step11-par-docs-sdk-spec-sync
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step11-par-docs-sdk-spec-sync
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/step11-par-docs-sdk-spec-sync/outputs/phase-12/unassigned-task-detection.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

## implementation guide のポイント

- docs-only タスクであることを冒頭に明記する
- Part 1 は日常の例え（たとえば）を必ず含め、専門用語を避け、「なぜ必要か」を先に書く
- Part 2 は TypeScript 型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能パラメータ / 定数一覧を省略しない
- SDK-02（system spec 3 ファイル）と SDK-04（index/ledger 4 ファイル）の 2 部構成で記述する
- 更新コマンドと検証コマンドをセットで記録する

## system spec update summary のポイント

- 更新した 7 ファイル（SDK-02: 3 件 / SDK-04: 4 件）の変更内容を一覧で記録する
- `task-workflow.md` / `resource-map.md` / `quick-reference.md` / `topic-map.md` / `LOGS.md` x2 / `SKILL.md` x2 / `artifacts.json` / `outputs/artifacts.json` の同期結果を明記する
- 変更しなかったファイルについて no-op 根拠を明記する
- コード変更が 0 件であることを確認事項として記録する

## documentation changelog のポイント

- 変更した file 一覧を current / baseline に分けて記録する
- validator 実行結果を実測値で残す
- `current` と `baseline` を分離して記録し、同じ表に混ぜない
- artifacts 同期結果を `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点で記録する
- 未完了表現を除去したことを明記する

## unassigned-task detection のポイント

- 0件でも summary を残す
- 1件以上なら formalize path を記録する
- 既存未タスクの再利用なら理由と物理配置確認を記録する
- current / baseline の差分を分離して記録する

## skill feedback のポイント

- 改善点があれば next action を書く
- 改善点がない場合も no-op 根拠を添えて「なし」と書く

## phase12 compliance check のポイント

- Task 12-1〜12-5 の全完了後に作成する
- 未完了表現が 0 件であることを確認する
- artifacts 同期と validator 実測値を根拠付きで閉じる
- PASS / PENDING を実績に合わせて使い分ける

## 成果物

| 成果物                     | パス                                                     | 説明                    |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| ドキュメント更新           | `phase-12-documentation.md`                              | documentation wave 本文 |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 実施内容の記録          |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | same-wave 対象一覧      |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validation   |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 有無          |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill 改善点            |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認       |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] same-wave 更新対象と no-op 根拠が明記されている
- [ ] 未完了表現が 0 件である
- [ ] validator 実測値が changelog と compliance check に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. 必須 6 成果物の作成
3. same-wave 根拠の記録
4. 成果物の配置と artifacts.json 同期
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] same-wave 対象と検証結果が outputs/phase-12 に揃っている
