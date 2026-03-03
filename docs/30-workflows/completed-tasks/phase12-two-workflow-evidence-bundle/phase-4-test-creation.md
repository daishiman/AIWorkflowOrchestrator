# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | phase12-two-workflow-evidence-bundle |
| 作成日 | 2026-03-03                           |

## 目的

Phase 5 で実装する証跡集約テンプレート・チェックリストの構造検証テストを、実装より先に作成する（Red 状態）。

## 実行タスク

- テストシナリオ設計: Phase 1 の受け入れ基準から検証シナリオを導出する
- 構造検証テスト作成: 証跡集約テンプレートの Markdown 構造を Vitest で検証するテストを作成する
- チェックリスト完全性テスト作成: Task 1/3/4/5 実体確認チェックリストの未記入検出テストを作成する
- current/baseline 分離テスト作成: `currentViolations=0` と `baseline` の分離記録を検証するテストを作成する
- スクリーンショット実在テスト作成: UI スクリーンショットのファイル存在検証テストを作成する

## 参照資料

| 資料名                | パス                                                                                                                | 説明                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書            | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-1/requirements-definition.md` | Phase 1 成果物（受け入れ基準）     |
| 設計書                | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-2/architecture-design.md`     | Phase 2 成果物（テンプレート設計） |
| 設計レビュー          | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-3/design-review-result.md`    | Phase 3 成果物（設計妥当性確認）   |
| テストカバレッジ基準  | `.claude/skills/task-specification-creator/references/coverage-standards.md`                                        | カバレッジ目標値                   |
| 仕様更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                      | 更新手順の正本                     |
| 品質基準              | `.claude/skills/task-specification-creator/references/quality-standards.md`                                         | 品質基準の正本                     |
| verify-all-specs      | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                                             | 2workflow 監査スクリプト（既存）   |
| validate-phase-output | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`                                        | Phase 出力検証スクリプト（既存）   |

## 実行手順

### ステップ 1: テストシナリオ設計

Phase 1 の受け入れ基準から以下の 4 カテゴリのテストシナリオを導出する:

1. **フォーマット統一テスト**: `verify-all-specs` と `validate-phase-output` の出力が同一フォーマット（JSON 構造）で証跡テンプレートに記録されることを検証する
2. **チェックリスト完全性テスト**: Task 1（実装ガイド）/ Task 3（documentation-changelog）/ Task 4（未タスク検出）/ Task 5（LOGS.md 更新）の各項目が未記入の場合、未完了判定を返すことを検証する
3. **current/baseline 分離テスト**: `currentViolations` と `baseline` が別フィールドで記録され、合否判定は `currentViolations === 0` のみで行われることを検証する
4. **スクリーンショット実在テスト**: 指定パスの画像ファイル（`.png` / `.jpg`）が実在するかを `fs.existsSync` で検証するロジックのテストを作成する

### ステップ 2: テストファイル作成

テストファイルを以下のパスに作成する:

| テストファイル         | パス                                                                                             | テスト対象                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| テンプレート構造検証   | `.claude/skills/task-specification-creator/scripts/__tests__/evidence-bundle-template.test.ts`   | 証跡集約テンプレートの Markdown セクション構造  |
| チェックリスト検証     | `.claude/skills/task-specification-creator/scripts/__tests__/evidence-bundle-checklist.test.ts`  | Task 1/3/4/5 チェックリストの未記入検出ロジック |
| current/baseline 分離  | `.claude/skills/task-specification-creator/scripts/__tests__/evidence-bundle-violations.test.ts` | currentViolations と baseline の分離記録        |
| スクリーンショット検証 | `.claude/skills/task-specification-creator/scripts/__tests__/evidence-bundle-screenshot.test.ts` | UI スクリーンショットのファイル実在確認         |

### ステップ 3: テストケース実装

各テストファイルに以下のテストケースを実装する:

#### evidence-bundle-template.test.ts

| テストケース ID | テストケース名                                             | 検証内容                                                                                       |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| T4-01           | verify-all-specs の結果が JSON 形式で記録される            | `verify-all-specs` 出力を証跡テンプレートの `workflowResults` フィールドにパースして格納できる |
| T4-02           | validate-phase-output の結果が同一フォーマットで記録される | `validate-phase-output` 出力が `workflowResults` と同じスキーマで記録される                    |
| T4-03           | 2workflow の結果を1テンプレートに統合記録できる            | `aiworkflow-requirements` と `task-specification-creator` 両方の結果が1ファイルに記録される    |

#### evidence-bundle-checklist.test.ts

| テストケース ID | テストケース名                                               | 検証内容                                                                                                                                   |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| T4-04           | Task 1 実体確認で未記入項目があれば未完了判定になる          | `implementation-guide.md` Part 1/Part 2 のチェックが false の場合、判定結果が `incomplete` になる                                          |
| T4-05           | Task 3 documentation-changelog 未記入で未完了判定になる      | `documentation-changelog.md` のチェックが false の場合、判定結果が `incomplete` になる                                                     |
| T4-06           | Task 4 未タスク検出チェック未記入で未完了判定になる          | `unassigned-task-detection.md` のチェックが false の場合、判定結果が `incomplete` になる                                                   |
| T4-07           | Task 5 LOGS.md 2ファイル更新チェック未記入で未完了判定になる | LOGS.md 2ファイル（`aiworkflow-requirements` / `task-specification-creator`）の更新チェックが false の場合、判定結果が `incomplete` になる |
| T4-08           | 全項目記入済みで完了判定になる                               | 全チェック項目が true の場合、判定結果が `complete` になる                                                                                 |

#### evidence-bundle-violations.test.ts

| テストケース ID | テストケース名                                       | 検証内容                                                                                  |
| --------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| T4-09           | currentViolations=0 かつ baseline>0 で合格判定になる | `currentViolations: 0, baseline: 5` の入力で合否判定が `pass` になる                      |
| T4-10           | currentViolations>0 で不合格判定になる               | `currentViolations: 3, baseline: 5` の入力で合否判定が `fail` になる                      |
| T4-11           | current と baseline が別フィールドで記録される       | 出力テンプレートの JSON に `currentViolations` と `baseline` が独立したキーとして存在する |

#### evidence-bundle-screenshot.test.ts

| テストケース ID | テストケース名                             | 検証内容                                                                              |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------------------------- |
| T4-12           | 存在する画像ファイルパスで検証成功になる   | テスト用の一時ファイル（`.png`）を作成し、検証関数が `true` を返す                    |
| T4-13           | 存在しない画像ファイルパスで検証失敗になる | 存在しないパスを渡した場合、検証関数が `false` を返す                                 |
| T4-14           | 取得日（ファイル更新日時）が取得できる     | `fs.statSync` で取得した `mtime` がテンプレートの `capturedAt` フィールドに記録される |

### ステップ 4: TDD Red 状態の確認

全テストを実行し、すべてが失敗状態（Red）であることを確認する:

```bash
cd .claude/skills/task-specification-creator && pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts
```

## 統合テスト連携【必須】

本タスクはドキュメント/運用改善タスクのため、統合テストの対象は監査スクリプトの入出力連携に限定する:

| シナリオカテゴリ     | 検証内容                                                               | テストファイル                                        |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| スクリプト連携テスト | `verify-all-specs` → 証跡テンプレート → チェックリスト判定の一連の流れ | `evidence-bundle-template.test.ts` 内の統合シナリオ   |
| データフローテスト   | 監査結果 JSON → テンプレート格納 → current/baseline 分離の流れ         | `evidence-bundle-violations.test.ts` 内の統合シナリオ |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                       | 仕様参照先                                   |
| ------------------ | ------------------------------ | -------------------------------------------- |
| アーキテクチャ     | テンプレート構造設計のため適用 | `aiworkflow-requirements: architecture-*.md` |
| データ整合性       | 2workflow 結果の統合のため適用 | Phase 2 設計書                               |
| エラーハンドリング | 未記入/欠損時の判定のため適用  | `aiworkflow-requirements: error-handling.md` |

## 成果物

| 成果物         | パス                                                                                                           | 説明                             |
| -------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| テスト仕様書   | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-4/test-specification.md` | テスト設計方針と戦略             |
| テストケース   | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-4/test-cases.md`         | 全 14 テストケースの一覧         |
| テストファイル | `.claude/skills/task-specification-creator/scripts/__tests__/evidence-bundle-*.test.ts`                        | 4 ファイルの Vitest テストコード |

## 完了条件

- [ ] 受け入れ基準（Phase 1）の各項目に対応するテストケースが存在する
- [ ] 4 つのテストファイルが作成されている（template / checklist / violations / screenshot）
- [ ] 全 14 テストケースが失敗状態（Red）で実行される
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+, Function 80%+）
- [ ] テスト仕様書（`outputs/phase-4/test-specification.md`）が作成されている
- [ ] テストケース一覧（`outputs/phase-4/test-cases.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-3 成果物、カバレッジ基準、品質基準）
2. テストシナリオ設計（4 カテゴリのシナリオ導出）
3. テストファイル作成（4 ファイル）
4. TDD Red 状態の確認
5. 成果物の作成・配置（test-specification.md、test-cases.md）
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
