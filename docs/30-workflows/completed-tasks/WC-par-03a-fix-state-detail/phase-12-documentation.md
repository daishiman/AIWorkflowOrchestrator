# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| Phase名    | ドキュメント更新             |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 11: 手動テスト         |
| 次Phase    | Phase 13: PR作成             |
| ステータス | completed                    |
| 作成日     | 2026-04-12                   |

## 目的

task-specification-creator の Phase 12 必須 6 成果物を canonical filename で揃え、
skill準拠と aiworkflow-requirements の current facts を documentation に固定する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件              |
| -------- | --------------------------------------- | --------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可            |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可            |
| C        | `system-spec-update-summary.md`         | Part 2 確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可            |
| E        | `unassigned-task-detection.md`          | D と並列可            |
| F        | `skill-feedback-report.md`              | E と並列可            |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行  |

## Task 12-1: 実装ガイド作成（2パート構成）【必須】

### Part 1（初学者・中学生レベル）

**日常生活での例え話**:

> スキルウィザードは「宿題を先生に正しく渡す提出箱」のようなものです。
> たとえば、前回書いたメモが箱の中に残ったままだと、
> 次の宿題に前回の答えが混ざってしまいます。
> 今回の修正では、前回の答えをきちんと消し、
> 途中でやめるための非常口を作り、
> 必要な情報をもう一度正しく渡せるようにします。

**なぜ必要か**:

内部状態が残ったままだと、前回の生成結果が次の試行に混ざります。
`generationLockRef` が閉じっぱなしだと次の生成も止まったままになります。
UI の表示と実際の状態をそろえることが、使いやすさと安全性の両方に必要です。

**何をするか**:

`ConversationRoundStep`、`GenerateStep`、`SkillCreateWizard` の3箇所をつないで、
リトライ・キャンセル・再計算・ロック解除の経路を一本化します。

### Part 2（開発者・技術者レベル）

**必須要素**:

- TypeScriptの型定義、APIシグネチャ/使用例、エラーハンドリング、エッジケース、設定可能パラメータ/定数一覧を含める
- `useEffect` 依存配列に `answers` を追加して `internalAnswers` の残留を防ぐ
- `GenerateStep` の template モードにキャンセルボタンを追加し、Step 0 へ戻れる導線を明示する
- `resolveExternalIntegration` を `q5` 変更後に再計算し、外部統合の表示値を最新化する
- `generationLockRef` を `finally` で必ず解除し、キャンセル・失敗・成功のいずれでも再実行可能にする
- 4件の修正箇所を file path 単位で明記する
- 設定可能パラメータ/定数は `answers`、`internalAnswers`、`q5`、`generationLockRef` の4系統で整理する

成果物: `outputs/phase-12/implementation-guide.md`

## Task 12-2: システム仕様更新（2ステップ）【必須】

### Step 1-A: 完了タスク記録

- `docs/30-workflows/skill-wizard-bugfix-wave/index.md` に Wave C 完了記録を追加する
- `artifacts.json` の status を `pending` から `completed` に更新する
- `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/discovered-issues.md` / `outputs/phase-11/ui-sanity-visual-review.md` / `outputs/phase-11/screenshot-plan.json` / `outputs/phase-11/screenshot-coverage.md` / `outputs/phase-11/phase11-capture-metadata.json` / `outputs/phase-11/screenshots/*.png` を current facts として固定する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に完了タスク記録を追加する
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` を current facts に同期する
- `.claude/skills/task-specification-creator/SKILL.md` / `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- `.claude/skills/task-specification-creator/LOGS.md` / `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に state detail セクションを追加する
- `artifacts.json` / `outputs/artifacts.json` の title / type / status / phase artifact 名の parity を確認する
- 更新要否の判定理由（current facts / no-op / update）を記録する

### Step 1-B: 実装状況テーブル更新

- `TASK-SW-FIX-STATE-DETAIL-001` のステータスを `completed` として記録する
- 問題12・13・18・19の修正完了を記録する

### Step 1-C: 関連タスクテーブル更新

- `TASK-SW-FIX-UI-001` と `TASK-SW-FIX-STATE-DETAIL-001` の並列関係を current facts に反映する
- Wave C の依存関係が `TASK-SW-FIX-FEEDBACK-001` 起点であることを明記する

### Step 2: システム仕様更新

- `ConversationRoundStep` / `GenerateStep` / `SkillCreateWizard` の state contract を `system-spec-update-summary.md` に記録する
- `useEffect` 依存配列、キャンセル導線、`resolveExternalIntegration` 再計算、`generationLockRef` 解除の current facts と no-op / update 判定を残す
- `artifacts.json` と `outputs/artifacts.json` の同期結果を final evidence として記録する

成果物: `outputs/phase-12/system-spec-update-summary.md`

## Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整備したファイルを列挙する
- 修正した3ファイルと追加・更新したテストファイル、validator結果、current/baseline 区別を記録する
- 変更一覧は current facts と baseline facts を分けて記録する

成果物: `outputs/phase-12/documentation-changelog.md`

## Task 12-4: 未タスク検出

- `unassigned-task-detection.md` に 0件でも結論を残す
- 問題12・13・18・19 以外に派生した未解決課題がないことを確認する
- 1件以上の候補が出た場合は、関連ファイル調査結果と formalize path を記録する
- 該当なしの場合も「該当なし」と current facts を明記する

成果物: `outputs/phase-12/unassigned-task-detection.md`

## Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に改善観点を残す
- useEffect依存配列の見落としを防ぐレビューチェックリストの追加提案などを記録する
- 論点→採用思考法→結論の対応表を入れ、30思考法の traceability を残す

成果物: `outputs/phase-12/skill-feedback-report.md`

## Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` で 6 成果物の存在、validator結果、artifacts parity、planned wording 0件、Phase 11 evidence bundle の存在を束ねる
- PASS / FAIL と不足点を明示し、PASS の断言は根拠が揃った場合のみ行う

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 資料名               | パス                                                                                                                                                                                                                                                                                                                                                          | 説明                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 設計書               | `outputs/phase-2/design-document.md`                                                                                                                                                                                                                                                                                                                          | 30思考法の記録          |
| 実装記録             | `outputs/phase-5/implementation-record.md`                                                                                                                                                                                                                                                                                                                    | current contractの根拠  |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`                                                                                                                                                                                                                                                                                                                     | 境界ケース              |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                                                                                                                                                                                                                                                                                          | AC対応表                |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`                                                                                                                                                                                                                                                                                                                       | 最小複雑性の判断        |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`                                                                                                                                                                                                                                                                                                                           | 準拠根拠                |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                                                                                                                                                                                                                                                                                                     | 総合判定                |
| Phase 11証跡 bundle  | `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/manual-test-report.md` / `outputs/phase-11/discovered-issues.md` / `outputs/phase-11/ui-sanity-visual-review.md` / `outputs/phase-11/screenshot-plan.json` / `outputs/phase-11/screenshot-coverage.md` / `outputs/phase-11/phase11-capture-metadata.json` / `outputs/phase-11/screenshots/*.png` | UI 証跡の current facts |
| Phase 12ガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                                                                                                                                                                                                                                                                        | 必須成果物基準          |
| system spec 正本     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                                                                                                                                                                                                                                                                             | current facts の基準    |
| ワークフロー正本     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                                                                                                                                          | current facts の基準    |
| 完了ワークフロー     | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                                                                                                                                                                                                                                                                | completed 同期基準      |
| backlogワークフロー  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                                                                                                                                                                                                                                                                  | no-op / update 判定基準 |
| topic map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                                                                                                                                                                                                                                                                 | 用語・依存の整合        |

## 成果物

| 成果物               | パス                                                     | 説明               |
| -------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| 仕様更新サマリ       | `outputs/phase-12/system-spec-update-summary.md`         | 参照仕様と同期判定 |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`            | 変更一覧           |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 残課題有無         |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | skill改善案        |
| Phase 12準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物確認        |

## 完了条件

- [ ] 必須6成果物が揃っている
- [ ] `計画 / 予定 / TODO / will be / を予定 / 仕様策定のみ / 保留として記録` が `outputs/phase-12/*.md` に残っていない
- [ ] Phase 11 の evidence bundle（manual-test-result.md / manual-test-report.md / discovered-issues.md / ui-sanity-visual-review.md / screenshot-plan.json / screenshot-coverage.md / phase11-capture-metadata.json / screenshots/\*.png）が揃っている
- [ ] `screenshot-plan.json` と `phase11-capture-metadata.json` が現行タスク ID と一致している
- [ ] skill準拠結果が記録されている
- [ ] 30思考法の総括が残っている
- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 矛盾なし・漏れなし・整合性あり・依存関係整合の4条件をすべて満たしている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
