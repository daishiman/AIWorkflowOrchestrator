# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 12                              |
| Phase名    | ドキュメント更新                |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 11: 手動テスト            |
| 次Phase    | Phase 13: PR作成                |
| ステータス | completed                       |
| 作成日     | 2026-04-14                      |

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

> `runCreateWorkflow` は「スキルを作るときの準備をする係」です。
> 今まではこの係が「何もしない」状態でしたが、
> 今回の修正で「agentファイルというレシピを読んで、スキルの設計図を作る」ようになります。
> ちょうど「料理人が料理を始める前にレシピを確認する」ようなイメージです。
> レシピが見つからなくても、料理人は最低限の材料で料理を続けることができます。
> これが「フォールバック（null返却）」の仕組みです。

**なぜ必要か**:

`create` モードでスキルを作成する際、これまで `runCreateWorkflow` が何も処理をしていなかったため、
LLMによる SKILL.md 内容生成が行われず、スキルの設計図が空のまま作成されてしまっていました。
`resourceLoader.loadAgent` を呼び出すことで、agentファイルからレシピを読み込み、
正しい構造計画JSONを生成できるようになります。

**何をするか**:

`SkillCreatorService.ts` の `runCreateWorkflow` メソッドと `createSkill()` のswitch文を修正し、
`create` モード時にagentファイルの読み込みと構造計画JSON生成の経路を一本化します。

### Part 2（開発者・技術者レベル）

**必須要素**:

- TypeScriptの型定義: `runCreateWorkflow` の戻り型を `void` から `StructurePlanJson | null` に変更する
- APIシグネチャ変更: `runCreateWorkflow(options: CreateSkillOptions): Promise<StructurePlanJson | null>`
- データハンドオフ: `runCreateWorkflow` の戻り値は `createSkill` 内で `const structurePlan` として受け取り、後続処理へ明示引数で渡す
- エラーハンドリング: `loadAgent` 失敗時は例外をキャッチして `null` を返す（フォールバック）
- エッジケース: `options.description` は型上必須の `string`。空文字は許容し、`undefined` は入力破損として別途バリデーション対象にする
- 設定可能パラメータ: `options.name`・`options.description` の2系統で構造計画JSONを構成する
- 変更ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（行574-577修正・switch文修正）
- テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

成果物: `outputs/phase-12/implementation-guide.md`

## Task 12-2: システム仕様更新（2ステップ）【必須】

### Step 1-A: 完了タスク記録

- `docs/30-workflows/TASK-SC-IMP-CREATE-WORKFLOW-001/index.md` と `docs/30-workflows/skill-creator-workflow-fix-lane/index.md` に TASK-SC-IMP-CREATE-WORKFLOW-001 完了記録を追加する
- `artifacts.json` の status を `pending` から `completed` に更新する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に完了タスク記録を追加する
- `.claude/skills/task-specification-creator/SKILL.md` / `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- 更新要否の判定理由（current facts / no-op / update）を記録する

### Step 1-B: 実装状況テーブル更新

- `TASK-SC-IMP-CREATE-WORKFLOW-001` のステータスを `completed` として記録する
- `runCreateWorkflow` の空実装修正完了を記録する

### Step 1-C: 関連タスクテーブル更新

- `TASK-SC-FIX-GENERATE-SKILL-MD-001`（タスクA）と `TASK-SC-IMP-CREATE-WORKFLOW-001` の依存関係を current facts に反映する
- タスクAが先行必須（depends_on）であることを明記する

### Step 2: システム仕様更新

- `SkillCreatorService` の `runCreateWorkflow` / `createSkill` の state contract を `system-spec-update-summary.md` に記録する
- `createSkill` の create モードで hidden property（例: `_structurePlan`）を使わず、local variable handoff で接続する current facts を記録する
- `loadAgent` 呼び出しパターン・フォールバック機構・タスクA連携の current facts と no-op / update 判定を残す
- `artifacts.json` と `outputs/artifacts.json` の同期結果を final evidence として記録する

成果物: `outputs/phase-12/system-spec-update-summary.md`

## Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整備したファイルを列挙する
- 修正した2ファイルと追加・更新したテストファイル、validator結果、current/baseline 区別を記録する
- 変更一覧は current facts と baseline facts を分けて記録する

成果物: `outputs/phase-12/documentation-changelog.md`

## Task 12-4: 未タスク検出

- `unassigned-task-detection.md` に 0件でも結論を残す
- `runCreateWorkflow` の修正以外に派生した未解決課題がないことを確認する
- `StructurePlanJson` 型の `@repo/shared/types` 移行が未タスクとして残る場合は候補として記録する
- 該当なしの場合も「該当なし」と current facts を明記する

成果物: `outputs/phase-12/unassigned-task-detection.md`

## Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に改善観点を残す
- `void` から `StructurePlanJson | null` への戻り型変更パターンを防ぐレビューチェックリストの追加提案などを記録する
- 論点→採用思考法→結論の対応表を入れ、30思考法の traceability を残す

成果物: `outputs/phase-12/skill-feedback-report.md`

## Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` で6成果物の存在、validator結果、artifacts parity、planned wording 0件を束ねる
- PASS / FAIL と不足点を明示し、PASS の断言は根拠が揃った場合のみ行う

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 資料名               | パス                                                                                   | 説明                   |
| -------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| 設計書               | `outputs/phase-2/design.md`                                                            | 30思考法の記録         |
| 実装計画             | `outputs/phase-5/implementation-plan.md`                                               | current contractの根拠 |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`                                              | 境界ケース             |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                   | AC対応表               |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`                                                | 最小複雑性の判断       |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`                                                    | 準拠根拠               |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                              | 総合判定               |
| Phase 12ガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須成果物基準         |
| system spec 正本     | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | current facts の基準   |
| ワークフロー正本     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | current facts の基準   |

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

- [x] 必須6成果物が揃っている
- [x] 計画系文言が除去されている
- [x] skill準拠結果が記録されている
- [x] 30思考法の総括が残っている
- [x] 本Phase内の全タスクを100%実行完了
- [x] 矛盾なし・漏れなし・整合性あり・依存関係整合の4条件をすべて満たしている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
