# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 4 — テスト作成 (TDD: Red)                       |
| タスクID | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| 総数     | 14テストケース                                  |

## 全14テストケース

---

### evidence-bundle-template.test.ts（フォーマット統一テスト）

| ID    | テストケース名                                            | 検証内容                                         | 対応AC |
| ----- | --------------------------------------------------------- | ------------------------------------------------ | ------ |
| T4-01 | verify-all-specsの結果がJSON形式で記録される              | WorkflowResult型にパース可能であること           | AC-1-1 |
| T4-02 | validate-phase-outputの結果が同一フォーマットで記録される | 同一スキーマで記録されること                     | AC-1-2 |
| T4-03 | 2workflowの結果を1テンプレートに統合記録できる            | 2つのWorkflowResultを統合して1テンプレートに出力 | AC-1-3 |

#### T4-01: verify-all-specs結果のJSON形式記録

- **入力**: verify-all-specsの生出力文字列
- **期待**: `parseWorkflowResult(rawOutput)` が `WorkflowResult` 型を返す
- **検証**: 返り値が `workflowName`, `timestamp`, `totalSpecs`, `passedSpecs`, `failedSpecs`, `violations` を持つ

#### T4-02: validate-phase-output結果の同一フォーマット記録

- **入力**: validate-phase-outputの生出力文字列
- **期待**: `parseWorkflowResult(rawOutput)` が同一の `WorkflowResult` 型を返す
- **検証**: T4-01と同一のスキーマで記録される

#### T4-03: 2workflow結果の統合記録

- **入力**: 2つの `WorkflowResult` オブジェクト
- **期待**: 1つのテンプレートに両方の結果が統合される
- **検証**: 統合結果が `spec_created` と `completed` の両エントリを持つ

---

### evidence-bundle-checklist.test.ts（チェックリスト完全性テスト）

| ID    | テストケース名                                    | 検証内容                                     | 対応AC |
| ----- | ------------------------------------------------- | -------------------------------------------- | ------ |
| T4-04 | Task1実体確認で未記入項目があれば未完了判定       | Part1/2チェックfalseの場合incompleteを返す   | AC-2-1 |
| T4-05 | Task3 changelog未記入で未完了判定                 | changelogチェックfalseの場合incompleteを返す | AC-2-2 |
| T4-06 | Task4未タスク検出チェック未記入で未完了判定       | detectionチェックfalseの場合incompleteを返す | AC-2-1 |
| T4-07 | Task5 LOGS.md 2ファイル更新チェック未記入で未完了 | LOGSチェックfalseの場合incompleteを返す      | AC-2-1 |
| T4-08 | 全項目記入済みで完了判定                          | 全項目trueの場合completeを返す               | AC-2-1 |

#### T4-04: Task1実体確認 — 未記入項目で未完了判定

- **入力**: `[{taskId: "1-1", label: "Part 1", isChecked: false}, {taskId: "1-2", label: "Part 2", isChecked: true}]`
- **期待**: `validateChecklist(checklist)` が `{status: "incomplete", missingItems: ["1-1"]}` を返す

#### T4-05: Task3 changelog — 未記入で未完了判定

- **入力**: `[{taskId: "3-1", label: "changelog存在", isChecked: false}]`
- **期待**: `validateChecklist(checklist)` が `{status: "incomplete", missingItems: ["3-1"]}` を返す

#### T4-06: Task4未タスク検出 — 未記入で未完了判定

- **入力**: `[{taskId: "4-1", label: "detection存在", isChecked: false}]`
- **期待**: `validateChecklist(checklist)` が `{status: "incomplete", missingItems: ["4-1"]}` を返す

#### T4-07: Task5 LOGS.md — 2ファイル更新未記入で未完了判定

- **入力**: `[{taskId: "5-2", label: "aiworkflow LOGS", isChecked: true}, {taskId: "5-3", label: "task-spec LOGS", isChecked: false}]`
- **期待**: `validateChecklist(checklist)` が `{status: "incomplete", missingItems: ["5-3"]}` を返す

#### T4-08: 全項目記入済み — 完了判定

- **入力**: 全11項目が `isChecked: true` のチェックリスト
- **期待**: `validateChecklist(checklist)` が `{status: "complete", missingItems: []}` を返す

---

### evidence-bundle-violations.test.ts（current/baseline分離テスト）

| ID    | テストケース名                              | 検証内容                                   | 対応AC |
| ----- | ------------------------------------------- | ------------------------------------------ | ------ |
| T4-09 | currentViolations=0かつbaseline>0で合格判定 | `{current:0, baseline:5}` の場合passを返す | AC-4-1 |
| T4-10 | currentViolations>0で不合格判定             | `{current:3, baseline:5}` の場合failを返す | AC-4-1 |
| T4-11 | currentとbaselineが別フィールドで記録       | 独立キー存在確認                           | AC-4-2 |

#### T4-09: current=0, baseline>0 — 合格判定

- **入力**: `evaluateViolations(0, 5)`
- **期待**: `{verdict: "pass", currentViolations: 0, baseline: 5}` を返す

#### T4-10: current>0 — 不合格判定

- **入力**: `evaluateViolations(3, 5)`
- **期待**: `{verdict: "fail", currentViolations: 3, baseline: 5}` を返す

#### T4-11: current/baselineの独立フィールド

- **入力**: `evaluateViolations(0, 5)`
- **期待**: 返り値に `currentViolations` と `baseline` が独立したキーとして存在する

---

### evidence-bundle-screenshot.test.ts（スクリーンショット実在テスト）

| ID    | テストケース名                       | 検証内容                                 | 対応AC |
| ----- | ------------------------------------ | ---------------------------------------- | ------ |
| T4-12 | 存在する画像ファイルパスで検証成功   | 一時ファイル作成後 `exists: true` を返す | AC-3-1 |
| T4-13 | 存在しない画像ファイルパスで検証失敗 | 不在パスで `exists: false` を返す        | AC-3-2 |
| T4-14 | 取得日(ファイル更新日時)が取得できる | mtime を `capturedAt` として記録する     | AC-3-3 |

#### T4-12: 存在するファイルで検証成功

- **入力**: 一時ディレクトリに作成したPNGファイルのパス
- **期待**: `verifyScreenshot(filePath)` が `{exists: true, capturedAt: <Date>}` を返す

#### T4-13: 存在しないファイルで検証失敗

- **入力**: `/tmp/non-existent-screenshot.png`
- **期待**: `verifyScreenshot(filePath)` が `{exists: false, capturedAt: null}` を返す

#### T4-14: ファイル更新日時の取得

- **入力**: 一時ディレクトリに作成したPNGファイルのパス
- **期待**: `verifyScreenshot(filePath).capturedAt` が `Date` 型であり、ファイルの `mtime` と一致する
