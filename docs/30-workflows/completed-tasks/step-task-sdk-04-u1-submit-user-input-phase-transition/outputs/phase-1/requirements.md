# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 1                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |
| AC対象 | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7   |

## 目的

`submitUserInput()` が回答内容（reason + selectedOptionId）に応じて canonical な phase semantics を更新するための要件を定義する。

## Step 0: P50チェック（既実装状態の調査）

### 対象ファイルの現在の実装状態

| ファイル                                                                        | 現状                                                                                      | 備考                                                       |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` L273-310 | `submitUserInput()` 存在。`awaitingUserInput = null` + `verifyResult.message` 更新のみ    | phase 遷移ロジックなし                                     |
| `packages/shared/src/types/skillCreator.ts` L394-419                            | `SkillCreatorAwaitingUserInputReason` = `"plan_review" \| "verification_review"` 定義済み | kind 4種（single_select/free_text/secret/confirm）定義済み |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L128-147  | `submitUserInput()` は engine にデリゲート。snapshot をそのまま返却                       | 変更不要の可能性高                                         |
| `apps/desktop/src/main/ipc/creatorHandlers.ts` L246-285                         | IPC handler 実装済み。`emitWorkflowStateChanged()` で renderer に push                    | 変更不要の可能性高                                         |

### 既存テストカバレッジ

| テストファイル                                  | カバー範囲                                              | 不足                               |
| ----------------------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| `SkillCreatorWorkflowEngine.test.ts` L373-410   | `awaitingUserInput` のクリア、stale requestId rejection | **phase 遷移の検証なし**           |
| `skillCreatorHandlers.runtime.test.ts` L314付近 | facade 呼び出しと state-changed event 発火              | **遷移後 snapshot の内容検証なし** |

## 機能要件

### FR-1: plan_review 回答による phase 遷移

| 条件                   | 回答 (selectedOptionId) | 期待する遷移                        |
| ---------------------- | ----------------------- | ----------------------------------- |
| reason = `plan_review` | `ready_to_execute`      | `currentPhase` → `"execute"` へ遷移 |
| reason = `plan_review` | `needs_changes`         | `currentPhase` → `"plan"` へ戻る    |

**詳細**:

- `ready_to_execute`: ユーザーが計画を承認し、実行フェーズへ進む意思を示した
- `needs_changes`: ユーザーが計画に修正を要求。textValue にフィードバック内容が含まれる可能性あり

### FR-2: verification_review 回答による phase/verifyResult 遷移

| 条件                           | 回答 (selectedOptionId) | 期待する遷移                                                              |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------- |
| reason = `verification_review` | `approve`               | `verifyResult.nextAction` → `"handoff"`, `verifyResult.status` → `"pass"` |
| reason = `verification_review` | `improve`               | `verifyResult.nextAction` → `"improve"`, `verifyResult.status` 維持       |
| reason = `verification_review` | `reject`                | `verifyResult.nextAction` → `"review"`, workflow を再計画フェーズへ       |

**詳細**:

- `approve`: 検証結果を承認し、成果物のハンドオフへ進む
- `improve`: 検証結果に基づき改善サイクルを実行する
- `reject`: 検証結果を不合格とし、plan 再策定へ戻る

### FR-3: engine state owner の一元化

- phase 遷移の判定ロジックは `SkillCreatorWorkflowEngine` にのみ実装する
- `RuntimeSkillCreatorFacade` と IPC handler は snapshot のパススルーに徹する
- renderer は `skill-creator:workflow-state-changed` イベントで受け取った snapshot を表示するのみ

### FR-4: artifact 記録の拡充

- 回答後の phase 遷移を `phase_transition` kind の artifact として記録する
- artifact には `fromPhase`, `toPhase`, `reason`, `selectedOptionId` を含める

## 非機能要件

| ID    | 要件                                                                         | 優先度 |
| ----- | ---------------------------------------------------------------------------- | ------ |
| NFR-1 | phase 遷移は同期的に完了し、snapshot 返却時に反映済みであること              | must   |
| NFR-2 | 既存の `awaitingUserInput` クリアと stale requestId 検証は破壊しないこと     | must   |
| NFR-3 | 未知の reason が渡された場合は既存動作（クリアのみ）にフォールバックすること | should |

## 受け入れ基準（検証可能な形式）

| ID   | 基準                                                                        | 検証コマンド                                       |
| ---- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| AC-1 | `plan_review` + `ready_to_execute` → `currentPhase` が `"execute"` に遷移   | `vitest run --grep "plan_review ready_to_execute"` |
| AC-2 | `plan_review` + `needs_changes` → `currentPhase` が `"plan"` に戻る         | `vitest run --grep "plan_review needs_changes"`    |
| AC-3 | `verification_review` + `approve` → `verifyResult.nextAction` = `"handoff"` | `vitest run --grep "verification_review approve"`  |
| AC-4 | `verification_review` + `improve` → `verifyResult.nextAction` = `"improve"` | `vitest run --grep "verification_review improve"`  |
| AC-5 | `verification_review` + `reject` → `currentPhase` が再計画状態に遷移        | `vitest run --grep "verification_review reject"`   |
| AC-6 | facade snapshot が engine の内部 state と構造的に等価                       | `vitest run --grep "facade snapshot"`              |
| AC-7 | IPC handler が `workflow-state-changed` で最新 snapshot を送信              | `vitest run --grep "state-changed event"`          |

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                                              | 内容                               |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| IPC System Core   | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                        | skill-creator IPC 契約定義         |
| Electron Services | `.agents/skills/aiworkflow-requirements/references/arch-electron-services.md`                     | engine / facade 責務分離           |
| Phase12 Lifecycle | `.agents/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | same-wave sync と close-out ルール |

### コードベース

| 資料名       | パス                                                                                  | 説明          |
| ------------ | ------------------------------------------------------------------------------------- | ------------- |
| Engine 実装  | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | state owner   |
| Shared Types | `packages/shared/src/types/skillCreator.ts`                                           | 型定義        |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                 | public bridge |
| IPC Handler  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                        | IPC boundary  |
| Engine Test  | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 既存テスト    |

## 成果物

| 成果物              | パス                                     | 説明                             |
| ------------------- | ---------------------------------------- | -------------------------------- |
| 要件定義書          | `outputs/phase-1/requirements.md`        | 本ドキュメント                   |
| spec-extraction-map | `outputs/phase-1/spec-extraction-map.md` | system spec ↔ code anchor 対応表 |

## 完了条件

- [x] 機能要件（FR-1〜FR-4）が抽出されている
- [x] 受け入れ基準（AC-1〜AC-7）が検証可能な形で定義されている
- [x] FR/NFR分類と優先度が設定されている
- [x] P50チェックにより既実装状態が確認されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 2: 設計
