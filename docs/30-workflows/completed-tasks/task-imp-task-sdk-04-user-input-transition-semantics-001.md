# TASK-SDK-04-U1: submitUserInput の phase transition semantics を実装へ反映する

## メタ情報

```yaml
issue_number: 1672
task_id: TASK-SDK-04-U1
task_name: submitUserInput の phase transition semantics を実装へ反映する
category: 実装改善
target_feature: Skill Creator workflow user interaction bridge
priority: 高
scale: 中規模
status: 未実施
source_phase: TASK-SDK-04 Phase 12 再監査
created_date: 2026-03-27
dependencies:
  - TASK-SDK-04
parent_workflow: docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui
spec_path: docs/30-workflows/unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md
```

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-SDK-04-U1                                                 |
| タスク名     | submitUserInput の phase transition semantics を実装へ反映する |
| 分類         | 実装改善                                                       |
| 対象機能     | `SkillCreatorWorkflowEngine.submitUserInput()`                 |
| 優先度       | 高                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-SDK-04 Phase 12 再監査                                    |
| 発見日       | 2026-03-27                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task04 で `awaitingUserInput` と UI host は実装されたが、回答送信後の workflow semantics が未接続である。

### 1.2 問題点・課題

- `submitUserInput()` が `awaitingUserInput` を消すだけで、`plan_review` / `verification_review` の回答を `currentPhase` や `verifyResult.nextAction` に反映しない
- `ready_to_execute` / `needs_changes` / confirm 回答の意味が engine owner に存在せず、renderer 側からは no-op に見える
- test は「質問が消える」ことしか見ておらず、phase 遷移の不在を検出できない

### 1.3 放置した場合の影響

- review UI が表示されても workflow が進まない
- 回答内容と engine state がずれ、Task05 以降の consumer が誤前提で実装される
- UI bridge が transport only にならず、意味論だけ欠落した半実装になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`submitUserInput()` が request kind と reason に応じて canonical な phase semantics を更新する。

### 2.2 最終ゴール

1. `plan_review` 回答が execute 進行または plan 修正待ちへ反映される
2. `verification_review` / confirm 回答が verify/improve/handoff のいずれかへ反映される
3. engine test と IPC/runtime test が新 semantics を固定する

### 2.3 スコープ

#### 含むもの

- `SkillCreatorWorkflowEngine.submitUserInput()` の phase 遷移
- `RuntimeSkillCreatorFacade` / IPC response の snapshot 同期
- runtime / IPC test の追加

#### 含まないもの

- Task05 以降の詳細 review UI 拡張
- persistence / resume token の仕様拡張

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `awaitingUserInput.reason` が meaning source である
- renderer は owner ではなく host に留める

### 3.2 必要な知識

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`

### 3.3 推奨アプローチ

1. request reason ごとの期待 phase 遷移表を先に決める
2. engine 実装で state update を一元化する
3. test を reason/option ごとに追加する

### 3.4 苦戦箇所

| ID   | 内容                                        | 解決策                                                                    |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------- |
| U1-1 | kind と reason が混ざると意味論が曖昧になる | `reason` を主、`kind` を入力バリデーション用に分離する                    |
| U1-2 | review return と improve 導線が衝突しやすい | `verifyResult.nextAction` と `currentPhase` の owner を engine に固定する |

---

## 4. 実行手順

### Step 1: semantics 定義

1. `plan_review` / `verification_review` / `confirm` の期待遷移を表にする
2. snapshot 更新対象を洗い出す

### Step 2: 実装

1. `submitUserInput()` に reason 別分岐を追加する
2. facade / IPC response の snapshot を current state へ揃える

### Step 3: テスト

1. engine test に phase 遷移検証を追加する
2. IPC/runtime test で回答後 snapshot を固定する

---

## 5. 完了条件

- [ ] 回答送信後に canonical phase が更新される
- [ ] `plan_review` / `verification_review` の意味が test で固定される
- [ ] UI host が no-op にならない

## 6. 関連タスク

| タスクID       | 関係     | 説明                          |
| -------------- | -------- | ----------------------------- |
| TASK-SDK-04    | 親タスク | interaction bridge / phase UI |
| TASK-SDK-04-U2 | 近接課題 | execute binding drift 是正    |
| TASK-SDK-04-U3 | 近接課題 | evidence/path sync            |

## 7. 検証方法

```bash
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## 8. リスクと対策

| リスク                                  | 影響度 | 対策                                                  |
| --------------------------------------- | ------ | ----------------------------------------------------- |
| phase 遷移追加で既存 review flow を壊す | 高     | 既存 snapshot テストと新 semantics テストを併走させる |
| renderer が独自判定を持ち始める         | 中     | semantics owner を engine に固定する                  |

## 9. 参照情報

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/implementation-guide.md`
