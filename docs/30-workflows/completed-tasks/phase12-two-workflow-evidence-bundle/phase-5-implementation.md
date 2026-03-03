# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| 機能名 | phase12-two-workflow-evidence-bundle |
| 作成日 | 2026-03-03                           |

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行い、2workflow 同時監査の証跡集約テンプレート・チェックリスト・監査手順を完成させる（Green 状態）。

## 実行タスク

- 証跡集約テンプレート作成: 2workflow 同時監査の結果を同一フォーマットで記録する Markdown テンプレートを作成する
- チェックリスト定義作成: Task 1/3/4/5 の実体確認チェックリストを定型化する
- スクリーンショット検証手順作成: UI タスクでのスクリーンショット証跡の取得日・ファイル実在を検証する手順を定義する
- current/baseline 分離記録セクション実装: `currentViolations` と `baseline` を分離して記録するセクションをテンプレートに追加する
- 台帳同期ルール文書化: `task-workflow.md` / `lessons-learned.md` への台帳同期ルールを文書化する
- 検証ユーティリティ実装: テストを Green にするためのバリデーション関数を実装する

## 参照資料

| 資料名                | パス                                                                                                                | 説明                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書            | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-1/requirements-definition.md` | Phase 1 成果物（受け入れ基準）     |
| 設計書                | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-2/architecture-design.md`     | Phase 2 成果物（テンプレート設計） |
| 設計レビュー          | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-3/design-review-result.md`    | Phase 3 成果物                     |
| テスト仕様書          | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-4/test-specification.md`      | Phase 4 成果物（テスト設計）       |
| テストケース          | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-4/test-cases.md`              | Phase 4 成果物（ケース一覧）       |
| テストカバレッジ基準  | `.claude/skills/task-specification-creator/references/coverage-standards.md`                                        | カバレッジ目標値                   |
| 仕様更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                      | 更新手順の正本                     |
| verify-all-specs      | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                                             | 2workflow 監査スクリプト（既存）   |
| validate-phase-output | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`                                        | Phase 出力検証スクリプト（既存）   |

## 実行手順

### ステップ 1: 証跡集約テンプレート作成

以下のパスに証跡集約テンプレートを作成する:

**配置先**: `.claude/skills/task-specification-creator/assets/evidence-bundle-template.md`

テンプレートに含める必須セクション:

| セクション                       | 内容                                                    | フォーマット                                             |
| -------------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| ヘッダー                         | タスク ID、タスク名、実行日、実行者                     | Markdown テーブル                                        |
| workflow 結果セクション          | `aiworkflow-requirements` の `verify-all-specs` 結果    | JSON コードブロック内に `workflowResults` スキーマで記録 |
| workflow 結果セクション          | `task-specification-creator` の `verify-all-specs` 結果 | 同一の `workflowResults` スキーマで記録                  |
| Phase 出力検証セクション         | `validate-phase-output` の各 Phase 結果                 | JSON コードブロック内に `phaseResults` スキーマで記録    |
| Task 実体確認チェックリスト      | Task 1/3/4/5 の完了チェック                             | Markdown チェックリスト                                  |
| violations セクション            | `currentViolations` と `baseline` の分離記録            | JSON コードブロック                                      |
| スクリーンショット証跡セクション | 画像ファイルパスと取得日                                | Markdown テーブル                                        |
| 台帳同期確認セクション           | `task-workflow.md` / `lessons-learned.md` 同期チェック  | Markdown チェックリスト                                  |

### ステップ 2: 検証ユーティリティ実装

以下のパスにバリデーション関数を実装する:

**配置先**: `.claude/skills/task-specification-creator/scripts/evidence-bundle-validator.ts`

実装する関数:

| 関数名                | 引数                                | 戻り値                                                                       | 責務                                                                          |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `parseWorkflowResult` | `rawOutput: string`                 | `WorkflowResult`                                                             | `verify-all-specs` / `validate-phase-output` の出力を共通スキーマにパースする |
| `validateChecklist`   | `checklist: ChecklistItem[]`        | `{ status: 'complete' \| 'incomplete', missingItems: string[] }`             | チェックリスト全項目の記入状態を検証し、未記入項目を返す                      |
| `evaluateViolations`  | `current: number, baseline: number` | `{ verdict: 'pass' \| 'fail', currentViolations: number, baseline: number }` | `currentViolations === 0` で合格判定し、baseline は監視値として分離記録する   |
| `verifyScreenshot`    | `filePath: string`                  | `{ exists: boolean, capturedAt: string \| null }`                            | 画像ファイルの実在確認と更新日時の取得を行う                                  |

型定義:

```typescript
interface WorkflowResult {
  workflowName: string; // "aiworkflow-requirements" | "task-specification-creator"
  timestamp: string; // ISO 8601 形式
  totalSpecs: number;
  passedSpecs: number;
  failedSpecs: number;
  violations: { file: string; rule: string; message: string }[];
}

interface ChecklistItem {
  taskId: string; // "task1" | "task3" | "task4" | "task5"
  label: string;
  isChecked: boolean;
}
```

### ステップ 3: Task 1/3/4/5 実体確認チェックリスト定義

以下のパスにチェックリスト定義を作成する:

**配置先**: `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`

定義する項目:

| Task ID | チェック項目                                                       | 確認対象ファイル                                                                                  |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Task 1  | `implementation-guide.md` Part 1（中学生レベル概念説明）が存在する | `outputs/phase-12/implementation-guide.md`                                                        |
| Task 1  | `implementation-guide.md` Part 2（開発者向け実装詳細）が存在する   | `outputs/phase-12/implementation-guide.md`                                                        |
| Task 1  | API/IPC/コンポーネントドキュメントが存在する                       | `outputs/phase-12/api-documentation.md` or `ipc-documentation.md` or `component-documentation.md` |
| Task 3  | `documentation-changelog.md` が作成されている                      | `outputs/phase-12/documentation-changelog.md`                                                     |
| Task 3  | 全 Step の完了結果が記録されている                                 | `outputs/phase-12/documentation-changelog.md` 内の Step 完了セクション                            |
| Task 4  | `unassigned-task-detection.md` が作成されている（0 件でも必須）    | `outputs/phase-12/unassigned-task-detection.md`                                                   |
| Task 4  | 検出した未タスクが 3 ステップ全完了している                        | `unassigned-task/` 指示書 + `task-workflow.md` テーブル + 関連仕様書リンク                        |
| Task 5  | `aiworkflow-requirements/LOGS.md` が更新されている                 | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                  |
| Task 5  | `task-specification-creator/LOGS.md` が更新されている              | `.claude/skills/task-specification-creator/LOGS.md`                                               |
| Task 5  | `aiworkflow-requirements/SKILL.md` 変更履歴が更新されている        | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                 |
| Task 5  | `task-specification-creator/SKILL.md` 変更履歴が更新されている     | `.claude/skills/task-specification-creator/SKILL.md`                                              |

### ステップ 4: スクリーンショット検証手順作成

以下のパスに監査手順を作成する:

**配置先**: `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`

手順に含める項目:

1. スクリーンショットファイルの命名規則: `{task-id}_{screen-name}_{YYYY-MM-DD}.png`
2. ファイル実在確認: `fs.existsSync(filePath)` による検証
3. 取得日確認: `fs.statSync(filePath).mtime` でファイル更新日時を取得し、Phase 11 実行日以降であることを確認
4. 証跡テンプレートへの記録: パス・取得日・検証結果を証跡テンプレートのスクリーンショット証跡セクションに転記

### ステップ 5: 台帳同期ルール文書化

以下のパスに同期ルールを作成する:

**配置先**: `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`

ルール定義:

| 同期先                                  | 同期タイミング         | 同期内容                                                                                |
| --------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| `task-workflow.md` 残課題テーブル       | Phase 12 Task 4 完了時 | 検出した未タスクの ID、タイトル、ステータスを追加                                       |
| `task-workflow.md` 完了タスクセクション | Phase 12 完了時        | 完了タスク ID、完了日、成果物サマリーを追加                                             |
| `lessons-learned.md`                    | Phase 12 完了時        | 本タスク実行中に発見した教訓（Pitfall パターン）を追加                                  |
| `LOGS.md`（2ファイル）                  | Phase 12 Task 5 完了時 | タスク完了記録を `aiworkflow-requirements` と `task-specification-creator` の両方に追加 |

### ステップ 6: TDD Green 状態の確認

全テストを実行し、すべてが成功状態（Green）であることを確認する:

```bash
cd .claude/skills/task-specification-creator && pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts
```

## 統合テスト連携【必須】

実装完了後、以下のスクリプト連携を検証する:

| 実装項目           | 内容                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| スクリプト入力連携 | `verify-all-specs` の stdout 出力を `parseWorkflowResult` でパースし、テンプレートに格納する処理が正常動作する |
| チェックリスト連携 | チェックリスト定義ファイルから `validateChecklist` 用の入力を生成する処理が正常動作する                        |
| violations 連携    | `verify-all-specs` の violations 出力から `evaluateViolations` 用の入力を生成する処理が正常動作する            |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| アーキテクチャ     | テンプレート・ユーティリティ設計   | `aiworkflow-requirements: architecture-*.md` |
| データ整合性       | 2workflow 結果の統合フォーマット   | Phase 2 設計書                               |
| エラーハンドリング | パース失敗・ファイル未検出時の処理 | `aiworkflow-requirements: error-handling.md` |

## 実装時の注意事項（既知の Pitfall 対策）

| Pitfall ID | 注意事項                                     | 対策                                                                                                    |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P1/P25     | LOGS.md 2ファイル更新漏れ                    | チェックリスト定義で `aiworkflow-requirements` と `task-specification-creator` の両方を明示的に要求する |
| P3/P38     | 未タスク管理の 3 ステップ不完全              | チェックリストの Task 4 項目で 3 ステップ（指示書・テーブル・リンク）全てをチェック項目化する           |
| P4         | documentation-changelog への早期「完了」記載 | チェックリストの Task 3 項目で「全 Step 完了結果が記録されている」を個別チェック項目にする              |

## 設計変更記録（該当する場合）

実装中に Phase 2 の設計から乖離が発生した場合、以下を記録する:

- [ ] 乖離内容と理由を `outputs/phase-5/design-changes.md` に記録
- [ ] Phase 2 設計書への影響を評価し、Phase 10 レビューで検証できるようにする

## 成果物

| 成果物                     | パス                                                                                                               | 説明                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 実装サマリー               | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-5/implementation-summary.md` | 実装内容の要約                           |
| 証跡集約テンプレート       | `.claude/skills/task-specification-creator/assets/evidence-bundle-template.md`                                     | 2workflow 証跡統合テンプレート           |
| 検証ユーティリティ         | `.claude/skills/task-specification-creator/scripts/evidence-bundle-validator.ts`                                   | バリデーション関数群                     |
| チェックリスト定義         | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                             | Task 1/3/4/5 実体確認項目                |
| スクリーンショット検証手順 | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`                        | UI 証跡検証手順                          |
| 台帳同期ルール             | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`                                      | task-workflow/lessons-learned 同期ルール |

## 完了条件

- [ ] 証跡集約テンプレートが作成されている（`assets/evidence-bundle-template.md`）
- [ ] 検証ユーティリティの 4 関数（`parseWorkflowResult` / `validateChecklist` / `evaluateViolations` / `verifyScreenshot`）が実装されている
- [ ] チェックリスト定義が作成されている（11 チェック項目）
- [ ] スクリーンショット検証手順が作成されている
- [ ] 台帳同期ルールが文書化されている
- [ ] Phase 4 の全 14 テストが成功状態（Green）で実行される
- [ ] 実装サマリー（`outputs/phase-5/implementation-summary.md`）が作成されている
- [ ] **設計書（Phase 2 成果物）から意図的に変更した箇所がある場合、変更理由を Phase 5 成果物に記録し、Phase 2 成果物も更新している**
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1-4 成果物、監査スクリプトのソースコード）
2. 証跡集約テンプレート作成
3. 検証ユーティリティ実装（4 関数）
4. チェックリスト定義作成
5. スクリーンショット検証手順作成
6. 台帳同期ルール文書化
7. TDD Green 状態の確認
8. 成果物の作成・配置（implementation-summary.md）
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle --phase 5
```

## 次のPhase

Phase 6: テスト拡充
