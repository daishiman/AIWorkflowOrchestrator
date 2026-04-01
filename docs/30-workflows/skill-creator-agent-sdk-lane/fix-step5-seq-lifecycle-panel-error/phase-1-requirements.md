# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 1                                  |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

スコープ・受入条件・インベントリを固定し、Phase 2 の設計に進める状態にする。P50 チェック（既実装コードの重複作成防止）を実施し、変更対象ファイル（1 ファイル）の現在状態を確認する。

## 前提条件（必須）

| 前提タスク                   | 内容                                                                                                              | 確認方法                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| TASK-FIX-ENV-STRIPPING       | `SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY }` が `env: { ...process.env, ANTHROPIC_API_KEY }` に修正済み | `grep -n "env:" apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| TASK-FIX-EXECUTE-PLAN-FF-001 | `skill-creator:execute-plan` が fire-and-forget 化されており、`WORKFLOW_STATE_CHANGED` が届く状態                 | `grep -n "accepted" apps/desktop/src/main/ipc/creatorHandlers.ts`      |

## 実行タスク

1. 前提条件チェック: 上記 2 タスクが完了済みであることを確認する
2. P50 チェック: 現在の実装状態を確認し、重複実装を防ぐ
3. 変更対象ファイルのインベントリ作成（1 ファイル）
4. 受入条件（AC）の定義（AC-1 〜 AC-5）
5. タスク分類の確定（UI task・Renderer 側変更を含む）
6. `WorkflowPhaseSnapshot` の `phase` 型定義場所の確認（既存型を使う）
7. スコープ外の確認（型定義変更・Redux store 変更・他コンポーネント変更は含まない）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容           |
| ------------------ | ------------------------------------------------------------------------------ | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | システム全体像 |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク記録 |

## 実行手順

### ステップ 1: P50 チェック（既実装状態確認）

```bash
# バグ箇所の現状確認
grep -n "setWorkflowError" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# onWorkflowStateChanged コールバックの現状確認
grep -n "onWorkflowStateChanged" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 修正が既に行われていないか確認
grep -n "snapshot.phase" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

確認ポイント:

- `setWorkflowError(null)` が `if` ブロックで囲まれていないこと（未修正の状態）
- `snapshot.phase !== 'failed'` の条件分岐が既に存在しないこと

### ステップ 2: 変更対象ファイルのインベントリ確認

```bash
# 1 ファイルの存在確認
ls apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 対象行の確認（531〜544 行付近）
sed -n '525,550p' apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

各ファイルの現状を確認し、インベントリに記録する。

### ステップ 3: `WorkflowPhaseSnapshot.phase` の型定義場所の確認

```bash
# WorkflowPhaseSnapshot 型の定義場所を確認
grep -rn "WorkflowPhaseSnapshot" apps/desktop/src/ --include="*.ts" --include="*.tsx"
grep -rn "WorkflowPhaseSnapshot" packages/shared/src/ --include="*.ts"

# WorkflowPhase 型の定義場所を確認
grep -rn "WorkflowPhase" apps/desktop/src/ --include="*.ts" --include="*.tsx"
grep -rn "WorkflowPhase" packages/shared/src/ --include="*.ts"

# 'failed' リテラルが型定義に含まれているか確認
grep -rn "'failed'" packages/shared/src/ --include="*.ts"
```

確認ポイント:

- `snapshot.phase` の型が `WorkflowPhase` または `string` であることを確認する
- `'failed'` リテラルが既存の型定義と整合していることを確認する
- 新規型定義は不要（既存型を再利用する）

### ステップ 4: 受入条件の確定

以下の受入条件を確定し、`outputs/phase-1/spec-extraction-map.md` に記録する:

| ID   | 受入条件                                                                                                   | 確認方法                   |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------------------- |
| AC-1 | `phase === 'failed'` の snapshot を受け取ったとき、`setWorkflowError(null)` が呼ばれないこと               | ユニットテスト（Phase 4）  |
| AC-2 | `phase !== 'failed'` の snapshot を受け取ったとき、`setWorkflowError(null)` が呼ばれること（既存動作維持） | ユニットテスト（Phase 4）  |
| AC-3 | `handoffBundle` の処理は `phase` に関わらず変わらないこと                                                  | ユニットテスト（Phase 4）  |
| AC-4 | 既存テストが全て PASS すること                                                                             | 既存テスト PASS（Phase 9） |
| AC-5 | UI 上でスキル生成エラー発生時にエラーメッセージが表示されたままになること（消えなくなること）              | 手動テスト（Phase 11）     |

### ステップ 5: タスク分類の確定

- **種別**: UI task（Renderer 側変更を含む）
- **UI 変更**: なし（UIコンポーネントの構造・レイアウト変更なし）
- **Renderer 側**: `SkillLifecyclePanel.tsx` のロジック変更（表示条件の修正）
- **IPC 変更**: なし
- **テスト分類**: Unit Test（React コンポーネントのフック動作テスト）

### ステップ 6: スコープ外の確認

以下は本タスクのスコープ外であることを確認し、成果物に記録する:

| スコープ外項目                       | 理由                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| `setWorkflowError` の型定義変更      | 型変更なし（呼び出しタイミングの条件追加のみ）             |
| Redux store の変更                   | store 構造の変更なし（セッター関数の呼び出し条件のみ変更） |
| 他コンポーネントの変更               | `SkillLifecyclePanel.tsx` 以外のコンポーネントは変更しない |
| `WorkflowPhaseSnapshot` の型定義変更 | 既存型を再利用するため型定義の変更なし                     |

## 多角的チェック観点

- `snapshot.phase` の型が `string` の場合と `WorkflowPhase` リテラルユニオン型の場合で、`!== 'failed'` の比較方法が変わるか確認したか
- `setWorkflowError` の呼び出しが `SkillLifecyclePanel.tsx` 内で他の場所にもあるか確認したか（スコープを絞るため）
- TASK-FIX-EXECUTE-PLAN-FF-001 が完了していなければ `phase: 'failed'` スナップショットが届かないため、前提条件を確認したか

## 成果物

| 成果物             | パス                                     | 説明                                                     |
| ------------------ | ---------------------------------------- | -------------------------------------------------------- |
| スペック抽出マップ | `outputs/phase-1/spec-extraction-map.md` | AC-1〜AC-5、インベントリ、型定義場所確認、スコープ外項目 |

## 完了条件

- [ ] 前提条件チェック: TASK-FIX-ENV-STRIPPING と TASK-FIX-EXECUTE-PLAN-FF-001 の完了が確認されている
- [ ] P50 チェックが完了し、`setWorkflowError(null)` が `if` ブロックで囲まれていないこと（未修正）が確認されている
- [ ] 1 つの変更対象ファイルのインベントリが `spec-extraction-map.md` に記録されている
- [ ] `WorkflowPhaseSnapshot.phase` の型定義場所が確認され、`'failed'` との比較方法が明確になっている
- [ ] AC-1 〜 AC-5 が全て `spec-extraction-map.md` に明記されている
- [ ] タスク分類（UI task・Renderer 側変更）が確定している
- [ ] スコープ外項目（型定義変更・Redux store 変更・他コンポーネント変更）が明記されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-1/spec-extraction-map.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 2: 設計 へ進む
