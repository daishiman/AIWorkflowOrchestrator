# Implementation Guide: executeAsync() エラーメッセージ伝搬パス統一

**タスクID**: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001  
**完了日**: 2026-04-06

---

## Part 1: 中学生レベルの説明

### なぜ必要か

たとえば、お使いを頼まれた子供が「買い物できなかった」と伝えるだけでなく「閉店日だったから買えなかった」という理由まで伝えることで、親は次の対応（別の店に行く、明日に延期するなど）を判断できます。

以前のコードでは、スキル実行（`executeAsync()`）が失敗したとき、画面（Renderer）には「失敗した」という事実は伝わっていましたが、「なぜ失敗したか」という理由（エラーメッセージ）が伝わらないことがありました。

これにより、ユーザーは「APIキーを設定してください」などの重要なヒントを画面で確認できていませんでした。

### 何をするか

エラーが起きたとき、エラーメッセージを**常に**画面に届けるよう、条件を修正しました。

具体的には：

- 修正前：「スナップショット（現在の状態）がない場合だけ」エラーメッセージを送っていた
- 修正後：スナップショットの有無にかかわらず、常にエラーメッセージを送るようにした

---

## Part 2: 技術者レベルの説明

### 対象ファイル

- **実装**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`executeAsync()` メソッド）
- **テスト**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`

### executeAsync() の 3 パス

| パス                            | 説明                                             | 変更内容                                                           |
| ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| structured error パス           | `execute()` が `{ success: false }` を返した場合 | `if (!snapshot)` 条件を削除し常に `onWorkflowStateSnapshot` を呼ぶ |
| catch パス                      | `execute()` が例外をスローした場合               | `if (!snapshot)` 条件を削除し常に `onWorkflowStateSnapshot` を呼ぶ |
| terminal_handoff / success パス | 正常終了した場合                                 | **変更なし**                                                       |

### `onWorkflowStateSnapshot` のシグネチャ

```typescript
onWorkflowStateSnapshot?: (
  planId: string,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  error?: string, // 第3引数: エラーメッセージ（optional）
) => void;
```

### Before/After コードスニペット

**Before（structured error パス）**:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}
```

**After（structured error パス）**:

```typescript
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

**Before（catch パス）**:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {
    this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
  }
```

**After（catch パス）**:

```typescript
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
```

### テストシナリオ T-01〜T-06

| テストID | シナリオ                                                                 | 検証ポイント                                                         |
| -------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| T-01     | structured error でsnapshotが存在する場合もerror.messageが第3引数に渡る  | `onWorkflowStateSnapshot` の第3引数が `error.message` と一致         |
| T-02     | catchパスでsnapshotが存在する場合もerrorMessageが第3引数に渡る           | 第3引数が `errorMessage` となる                                      |
| T-03     | terminal_handoff パスでは第3引数が `undefined`                           | 正常系への影響なし                                                   |
| T-04     | success パスでは第3引数が `undefined`                                    | 正常系への影響なし                                                   |
| T-05     | structured error パスでsnapshot=undefinedの場合も伝搬される              | `snapshot ?? null` の null 分岐と structured error 伝搬が固定される  |
| T-06     | catchパスで非Errorの値を受け取った場合も `String(error)` が第3引数に渡る | `String(error)` ルートと `snapshot ?? null` の null 分岐が固定される |

### 技術的注意点

- `onWorkflowStateSnapshot` は `workflowEngine.onPhaseChanged` と structured error パスの両方から呼ばれる可能性がある（正常動作）
- `snapshot ?? null` により TypeScript の `SkillCreatorWorkflowUiSnapshot | null` 型を保証する
- IPC チャンネル `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` のシグネチャ変更なし
