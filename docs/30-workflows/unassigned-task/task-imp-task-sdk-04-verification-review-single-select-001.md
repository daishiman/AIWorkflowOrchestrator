# TASK-SDK-04-U1-F1: verification_review request を single_select kind に変更する

## メタ情報

```yaml
task_id: TASK-SDK-04-U1-F1
task_name: verification_review request を single_select kind に変更する
category: 実装改善
target_feature: SkillCreatorWorkflowEngine verification review UX
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-SDK-04-U1 Phase 12 実装波
created_date: 2026-03-28
dependencies:
  - TASK-SDK-04-U1
parent_workflow: docs/30-workflows/step-task-sdk-04-u1-submit-user-input-phase-transition
spec_path: docs/30-workflows/unassigned-task/task-imp-task-sdk-04-verification-review-single-select-001.md
```

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-SDK-04-U1-F1                                              |
| タスク名     | verification_review request を single_select kind に変更する   |
| 分類         | 実装改善                                                       |
| 対象機能     | `SkillCreatorWorkflowEngine.createVerificationReviewRequest()` |
| 優先度       | 中                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-SDK-04-U1 Phase 12 実装波                                 |
| 発見日       | 2026-03-28                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SDK-04-U1 で `submitUserInput()` に reason 別の phase transition semantics を実装した。engine は `selectedOptionId` に基づいて approve/improve/reject を判定するが、`createVerificationReviewRequest()` が `free_text` kind のままであるため、UI で選択肢が表示されない。

### 1.2 問題点・課題

- `createVerificationReviewRequest()` は `free_text` kind でリクエストを生成する
- engine の `applyVerificationReviewTransition()` は `selectedOptionId` で approve/improve/reject を判定する
- UI（renderer）は request kind に応じてフォーム部品を出し分けるため、`free_text` では選択肢が表示されない
- 現状では renderer 側から selectedOptionId を送信する導線がない

### 1.3 放置した場合の影響

- verification review 画面で approve/improve/reject を選べない
- engine の遷移ロジックが実質的に到達不能になる
- ユーザーは free_text 入力のみで verification review を完了するため、phase 遷移が起きない

---

## 2. 何を達成するか（What）

### 2.1 目的

`createVerificationReviewRequest()` を `single_select` kind に変更し、approve/improve/reject の 3 選択肢を提示する。

### 2.2 最終ゴール

1. verification_review request が `single_select` kind で 3 つのオプション（approve, improve, reject）を含む
2. renderer が選択肢を表示し、selectedOptionId を送信できる
3. engine の `applyVerificationReviewTransition()` が正しく到達する

### 2.3 スコープ

#### 含むもの

- `createVerificationReviewRequest()` の kind / options 変更
- `recordExecutionFailure()` と `recordVerifyFailure()` 内の呼び出し調整
- engine test の更新
- 既存 free_text validation テストの調整

#### 含まないもの

- renderer 側の UI コンポーネント変更（renderer は既存の single_select handling で動作する想定）
- 新規 IPC チャンネルの追加
- Task05 以降の review detail UI 拡張

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `applyVerificationReviewTransition()` が selectedOptionId ベースで動作済み（TASK-SDK-04-U1 で実装済み）
- renderer の single_select kind handling が汎用的に動作する

### 3.2 必要な知識

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — `createVerificationReviewRequest()` 関数
- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorUserInputKind`, `SkillCreatorUserInputOption`

### 3.3 推奨アプローチ

1. `createVerificationReviewRequest()` を `single_select` kind に変更
2. options に `[{id: "approve", label: "承認する"}, {id: "improve", label: "改善を要求する"}, {id: "reject", label: "却下して再計画する"}]` を追加
3. 既存テストで `textValue` を使っていた箇所を `selectedOptionId` に変更
4. free_text だった既存テストケースの更新

### 3.4 苦戦箇所

| ID   | 内容                                                                                                                             | 解決策                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| F1-1 | `recordExecutionFailure` と `recordVerifyFailure` の両方が `createVerificationReviewRequest` を使うため、変更影響が 2 箇所に及ぶ | 関数自体を変更すれば両方に自動反映される。テストは各呼び出し元を個別に確認     |
| F1-2 | 既存の free_text validation テストが壊れる                                                                                       | validation は kind ベースで分岐するため、テストを single_select 用に書き換える |

---

## 4. 実行手順

### Step 1: request 関数の変更

1. `createVerificationReviewRequest()` の `kind` を `"single_select"` に変更
2. `options` に approve/improve/reject の 3 選択肢を追加
3. `placeholder` を削除（single_select では不要）

### Step 2: テスト更新

1. verification_review 関連テストの submission を `textValue` から `selectedOptionId` に変更
2. TASK-SDK-04-U1 で追加した AC-3〜AC-5 テストの `textValue` を削除
3. 新規テスト: `validateUserInputSubmission` が options 外の selectedOptionId を拒否することを確認

### Step 3: 回帰確認

1. 既存テスト全件パスを確認
2. typecheck パスを確認

---

## 5. 完了条件

- [ ] `createVerificationReviewRequest()` が `single_select` kind で approve/improve/reject options を返す
- [ ] TASK-SDK-04-U1 の AC-3〜AC-5 テストが `selectedOptionId` のみで動作する（`textValue` 不要）
- [ ] `validateUserInputSubmission` が verification_review の不正 selectedOptionId を拒否する
- [ ] 既存テスト全件パス

## 6. 関連タスク

| タスクID       | 関係       | 説明                            |
| -------------- | ---------- | ------------------------------- |
| TASK-SDK-04-U1 | 親タスク   | phase transition semantics 実装 |
| TASK-SDK-04    | 祖父タスク | interaction bridge / phase UI   |

## 7. 検証方法

```bash
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## 8. リスクと対策

| リスク                                                                   | 影響度 | 対策                                                                                                               |
| ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| free_text 入力が使えなくなり、ユーザーのフィードバックテキストが失われる | 中     | 選択肢に加えて textValue も任意で受け付ける設計を検討。または improve/reject 選択後に free_text 入力画面を別途表示 |

## 9. 参照情報

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — `createVerificationReviewRequest()` L657-672
- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorUserInputKind`, `SkillCreatorUserInputOption`
- `docs/30-workflows/step-task-sdk-04-u1-submit-user-input-phase-transition/outputs/phase-12/unassigned-task-detection.md`
