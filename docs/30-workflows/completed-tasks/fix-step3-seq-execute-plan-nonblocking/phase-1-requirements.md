# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 1                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1h                           |

## 目的

スコープ・受入条件・インベントリを固定し、Phase 2 の設計に進める状態にする。P50 チェック（既実装コードの重複作成防止）を実施し、4 つの変更対象ファイルの現在状態を確認する。

## 一次レビュー

task-specification-creator の要求に合わせ、この Phase で論点を先に固定する。

| 観点         | 一次結論                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点     | 長時間 `execute-plan` の同期応答をやめ、Main/Facade/Engine/snapshot relay を分離してタイムアウトを解消すること                   |
| 依存境界     | Main は受付のみ、Facade/Engine はバックグラウンド実行、Renderer は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の snapshot を購読する |
| 価値とコスト | 価値は 30 分タスクの継続実行。コストは handler / facade / engine / test / docs の局所修正に限定する                              |
| 優先順位     | 1. fire-and-forget 化 2. snapshot relay の整合 3. consumer 契約の影響確認 4. Phase 12 同期                                       |
| 4条件        | 矛盾なし・漏れなし・整合性あり・依存関係整合を Phase 3, 9, 10, 12 で再確認する                                                   |

## 実行タスク

1. P50 チェック: `git log` と `grep` で現在の実装状態を確認し、重複実装を防ぐ
2. 変更対象ファイルのインベントリ作成（4 ファイル）
3. 受入条件（AC）の定義（AC-1 〜 AC-6）
4. タスク分類の確定（UI 非変更の code 実装 task）
   - UI の見た目変更はなし
   - `executePlan` consumer の契約影響は Phase 3 / 9 で確認する
5. 命名規則の確認（camelCase: TypeScript、kebab-case: IPC チャンネル名）
6. スコープ外の確認（TASK-NOTIFICATION-SERVICE-001、TASK-FIX-IPC-TIMEOUT-001 は含まない）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容                      |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | システム全体像            |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク記録            |

## 実行手順

### ステップ 1: P50 チェック（既実装状態確認）

```bash
# execute-plan チャンネルの現状確認
grep -rn "execute-plan" apps/desktop/src/ --include="*.ts"

# CHANNEL_TIMEOUTS の現状確認
grep -n "CHANNEL_TIMEOUTS" apps/desktop/src/preload/ipc-utils.ts

# executeAsync の存在確認（既に実装済みかどうか）
grep -rn "executeAsync" apps/desktop/src/main/services/runtime/ --include="*.ts"

# onPhaseChanged の存在確認
grep -rn "onPhaseChanged" apps/desktop/src/main/services/runtime/ --include="*.ts"

# SKILL_CREATOR_WORKFLOW_STATE_CHANGED の確認（活用可能インフラ）
grep -rn "SKILL_CREATOR_WORKFLOW_STATE_CHANGED" apps/desktop/src/ --include="*.ts"
```

確認ポイント:

- `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan"` が既に存在することを確認し、重複追加しないこと
- `RuntimeSkillCreatorFacade` に `executeAsync` が既に存在することを確認し、再実装しないこと
- `SkillCreatorWorkflowEngine` に `onPhaseChanged` が既に存在することを確認し、型や責務を重複させないこと
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルが既に定義されていること（活用可能）

### ステップ 2: 変更対象ファイルのインベントリ確認

```bash
# 4 ファイルの存在確認
ls apps/desktop/src/preload/ipc-utils.ts
ls apps/desktop/src/main/ipc/creatorHandlers.ts
ls apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts
ls apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

各ファイルの現状を確認し、インベントリに記録する。

### ステップ 3: 受入条件の確定

以下の受入条件を確定し、`outputs/phase-1/spec-extraction-map.md` に記録する:

| ID   | 受入条件                                                                                                                                            | 確認方法                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| AC-1 | `ipcMain.handle('skill-creator:execute-plan')` が 100ms 以内に `{ accepted: true, planId }` を返す                                                  | ユニットテスト（Phase 4）          |
| AC-2 | バックグラウンドで `RuntimeSkillCreatorFacade.executeAsync()` が Agent SDK `query()` を呼ぶ                                                         | ユニットテスト（Phase 4）          |
| AC-3 | バックグラウンド実行の状態変化が `SkillCreatorExecuteAsyncPhase` の内部 hook と `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の snapshot 通知で観測できる | ユニットテスト（Phase 4 / 6）      |
| AC-4 | `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` が追加される                                                                        | ユニットテスト（Phase 4）          |
| AC-5 | 既存の `safeInvoke` 互換性は保ちつつ、`skillCreatorAPI.executePlan` の consumer 契約差分を明示する                                                  | 既存テスト PASS + Phase 3 / 9 記録 |
| AC-6 | `SkillCreatorWorkflowEngine.onPhaseChanged` callback が `planId / SkillCreatorExecuteAsyncPhase / progress` の型で定義される                        | TypeScript 型チェック（Phase 5）   |

### ステップ 4: タスク分類の確定

- **種別**: code 実装 task（UI 非変更）
- **UI 変更**: 原則なし。ただし `skillCreatorAPI.executePlan` の consumer 契約影響がある場合は Phase 3 / 9 で blocked 判定にする
- **IPC 変更**: `execute-plan` ハンドラーの動作変更（シグネチャは維持）
- **テスト分類**: Unit Test（ブロッキング→ 非ブロッキング動作）

### ステップ 5: 命名規則の確認

| 要素                  | 命名規則                | 例                                        |
| --------------------- | ----------------------- | ----------------------------------------- |
| TypeScript メソッド   | camelCase               | `executeAsync`, `onPhaseChanged`          |
| TypeScript プロパティ | camelCase               | `planId`, `workflowPhase`                 |
| IPC チャンネル名      | kebab-case              | `skill-creator:execute-plan`              |
| テストファイル名      | kebab-case + `.test.ts` | `creatorHandlers.fire-and-forget.test.ts` |

### ステップ 6: スコープ外の確認

以下は本タスクのスコープ外であることを確認し、成果物に記録する:

| スコープ外項目                           | 理由               | 別タスク                      |
| ---------------------------------------- | ------------------ | ----------------------------- |
| INotificationService                     | 別タスクで実装     | TASK-NOTIFICATION-SERVICE-001 |
| before-quit guard                        | 別タスクで実装     | 別タスク                      |
| CHANNEL_TIMEOUTS の per-channel 設定追加 | PR#1823 で完了済み | TASK-FIX-IPC-TIMEOUT-001      |

## 多角的チェック観点

- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルが既存インフラとして利用可能か確認したか
- `emitWorkflowStateChanged()` 既存メソッドが再利用可能か確認したか
- `SkillCreatorWorkflowEngine.workflows: Map<string, SkillCreatorWorkflowState>` が複数 planId 対応済みか確認したか
- AC-5 の `safeInvoke` 互換性と `skillCreatorAPI.executePlan` consumer 契約差分の両立が可能か確認したか
- PR#1823（TASK-FIX-IPC-TIMEOUT-001）の内容と重複がないか確認したか

## 成果物

| 成果物             | パス                                     | 説明                                                          |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------- |
| スペック抽出マップ | `outputs/phase-1/spec-extraction-map.md` | system spec と code anchor の対応表、AC-1〜AC-6、インベントリ |

## 完了条件

- [ ] P50 チェックが完了し、重複実装がないことが確認されている
- [ ] 4 つの変更対象ファイルのインベントリが `spec-extraction-map.md` に記録されている
- [ ] AC-1 〜 AC-6 が全て `spec-extraction-map.md` に明記されている
- [ ] タスク分類（UI 原則非変更 code 実装 task）が確定し、consumer 契約影響の確認条件が明記されている
- [ ] スコープ外項目（INotificationService、before-quit guard）が明記されている
- [ ] `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が活用可能なインフラとして確認されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-1/spec-extraction-map.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 2: 設計 へ進む
