# Phase 2: 設計

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 2                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

Phase 1 の要件（FR-1〜FR-4, AC-1〜AC-7）を実装可能な設計に落とし込む。変更は `SkillCreatorWorkflowEngine.submitUserInput()` メソッド内への reason 別分岐追加が主であり、concern 数は 2（engine ロジック + テスト）のため単一設計書で記述する。

## Concern Topology

| Concern                     | 変更対象                                                                     | 変更種別     | lane |
| --------------------------- | ---------------------------------------------------------------------------- | ------------ | ---- |
| C1: Engine phase transition | `SkillCreatorWorkflowEngine.ts`                                              | ロジック追加 | main |
| C2: Artifact recording      | `SkillCreatorWorkflowEngine.ts`                                              | ロジック追加 | main |
| C3: Test suite              | `SkillCreatorWorkflowEngine.test.ts`, `skillCreatorHandlers.runtime.test.ts` | テスト追加   | test |

> lane 数: 2（main + test）。3以下の制約を満たす。

## 設計詳細

### C1: Engine Phase Transition Logic

#### Phase 遷移表（Canonical Transition Table）

```
submitUserInput(planId, submission)
  │
  ├── reason = "plan_review"
  │     ├── selectedOptionId = "ready_to_execute"
  │     │     └── state.currentPhase = "execute"
  │     │
  │     ├── selectedOptionId = "needs_changes"
  │     │     └── state.currentPhase = "plan"
  │     │         (textValue があれば verifyResult.message に保存 — 既存ロジック)
  │     │
  │     └── (unknown option)
  │           └── フォールバック: awaitingUserInput クリアのみ（既存動作）
  │
  ├── reason = "verification_review"
  │     ├── selectedOptionId = "approve"
  │     │     └── state.verifyResult = { status: "pass", nextAction: "handoff", ... }
  │     │
  │     ├── selectedOptionId = "improve"
  │     │     └── state.verifyResult = { ...existing, nextAction: "improve", ... }
  │     │
  │     ├── selectedOptionId = "reject"
  │     │     └── state.verifyResult = { status: "fail", nextAction: "review", ... }
  │     │         state.currentPhase = "plan"
  │     │
  │     └── (unknown option)
  │           └── フォールバック: awaitingUserInput クリアのみ
  │
  └── reason = (unknown)
        └── フォールバック: awaitingUserInput クリアのみ（NFR-3）
```

#### 実装方針

`submitUserInput()` メソッドの `state.awaitingUserInput = null;` の直後に、reason 別の private メソッドを呼び出す switch-case を追加する。

```typescript
// 追加する private メソッド
private applyPhaseTransition(
  state: SkillCreatorWorkflowState,
  reason: SkillCreatorAwaitingUserInputReason,
  submission: SkillCreatorUserInputSubmission,
): void {
  switch (reason) {
    case "plan_review":
      this.applyPlanReviewTransition(state, submission);
      break;
    case "verification_review":
      this.applyVerificationReviewTransition(state, submission);
      break;
    default:
      // NFR-3: unknown reason はフォールバック（何もしない）
      break;
  }
}
```

#### 各 transition メソッドの詳細

**applyPlanReviewTransition:**

```typescript
private applyPlanReviewTransition(
  state: SkillCreatorWorkflowState,
  submission: SkillCreatorUserInputSubmission,
): void {
  switch (submission.selectedOptionId) {
    case "ready_to_execute":
      state.currentPhase = "execute";
      break;
    case "needs_changes":
      state.currentPhase = "plan";
      break;
    // unknown option: no-op (fallback)
  }
}
```

**applyVerificationReviewTransition:**

```typescript
private applyVerificationReviewTransition(
  state: SkillCreatorWorkflowState,
  submission: SkillCreatorUserInputSubmission,
): void {
  const base = state.verifyResult ?? {
    status: "fail" as const,
    nextAction: "review" as const,
    updatedAt: nowIso(),
  };

  switch (submission.selectedOptionId) {
    case "approve":
      state.verifyResult = {
        ...base,
        status: "pass",
        nextAction: "handoff",
        updatedAt: nowIso(),
      };
      break;
    case "improve":
      state.verifyResult = {
        ...base,
        nextAction: "improve",
        updatedAt: nowIso(),
      };
      break;
    case "reject":
      state.verifyResult = {
        ...base,
        status: "fail",
        nextAction: "review",
        updatedAt: nowIso(),
      };
      state.currentPhase = "plan";
      break;
    // unknown option: no-op
  }
}
```

### C2: Artifact Recording

既存の `user_input_submission` artifact 記録の直後に、phase 遷移が発生した場合のみ `phase_transition` artifact を追加する。

```typescript
// submitUserInput() 内、applyPhaseTransition 呼び出し後
const afterPhase = state.currentPhase;
if (beforePhase !== afterPhase) {
  this.appendArtifact(state, afterPhase, "phase_transition", {
    fromPhase: beforePhase,
    toPhase: afterPhase,
    reason: request.reason,
    selectedOptionId: submission.selectedOptionId,
  });
}
```

### C3: 変更不要の確認

| コンポーネント                     | 変更要否 | 理由                                                              |
| ---------------------------------- | -------- | ----------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade`        | 不要     | engine にデリゲートするだけ。snapshot に遷移結果が含まれる        |
| IPC handler (`creatorHandlers.ts`) | 不要     | snapshot をパススルーし `emitWorkflowStateChanged` する既存フロー |
| Preload API                        | 不要     | `safeInvoke` でチャンネルを呼ぶだけ                               |
| Shared Types (`skillCreator.ts`)   | 不要     | `currentPhase` と `verifyResult` の既存型で表現可能               |

### IPC 4層整合性チェック

既存チャンネル `skill-creator:submit-user-input` のみ使用。新規チャンネル追加なし。

| 層                | 確認内容                                       | 状態    |
| ----------------- | ---------------------------------------------- | ------- |
| 1. 定数定義       | `IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT` | 既存 OK |
| 2. ホワイトリスト | preload allowedChannels                        | 既存 OK |
| 3. ハンドラ登録   | `ipcMain.handle()`                             | 既存 OK |
| 4. Preload API    | `contextBridge` exposure                       | 既存 OK |

## Validation Matrix

| テストケース                            | 入力                                                                  | 期待出力                                              | AC    |
| --------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- | ----- |
| plan_review + ready_to_execute          | reason=plan_review, selectedOptionId=ready_to_execute                 | currentPhase="execute"                                | AC-1  |
| plan_review + needs_changes             | reason=plan_review, selectedOptionId=needs_changes                    | currentPhase="plan"                                   | AC-2  |
| plan_review + needs_changes + textValue | reason=plan_review, selectedOptionId=needs_changes, textValue="fix X" | currentPhase="plan", verifyResult.message="fix X"     | AC-2  |
| verification_review + approve           | reason=verification_review, selectedOptionId=approve                  | verifyResult.nextAction="handoff", status="pass"      | AC-3  |
| verification_review + improve           | reason=verification_review, selectedOptionId=improve                  | verifyResult.nextAction="improve"                     | AC-4  |
| verification_review + reject            | reason=verification_review, selectedOptionId=reject                   | currentPhase="plan", verifyResult.nextAction="review" | AC-5  |
| unknown reason                          | reason=(未定義値)                                                     | awaitingUserInput=null のみ（既存動作）               | NFR-3 |
| unknown option                          | reason=plan_review, selectedOptionId=(未定義値)                       | awaitingUserInput=null のみ                           | NFR-3 |
| facade snapshot 整合                    | facade.submitUserInput() 呼び出し                                     | engine state と同一 snapshot                          | AC-6  |
| IPC state-changed event                 | IPC handler 経由呼び出し                                              | webContents.send に最新 snapshot                      | AC-7  |
| 既存: awaitingUserInput クリア          | 通常の submitUserInput                                                | awaitingUserInput=null                                | 既存  |
| 既存: stale requestId rejection         | requestId 不一致                                                      | Error thrown                                          | 既存  |

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料          | パス                                                                          | 内容       |
| ----------------- | ----------------------------------------------------------------------------- | ---------- |
| IPC System Core   | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`    | IPC 契約   |
| Electron Services | `.agents/skills/aiworkflow-requirements/references/arch-electron-services.md` | owner 境界 |

## 成果物

| 成果物 | パス                        | 説明           |
| ------ | --------------------------- | -------------- |
| 設計書 | `outputs/phase-2/design.md` | 本ドキュメント |

## 完了条件

- [x] Concern topology が定義されている（2 concern, 2 lane）
- [x] Phase 遷移表が全 reason × option の組み合わせで定義されている
- [x] 実装方針（private メソッド分割）が具体的コード例で示されている
- [x] Validation matrix が AC と対応している
- [x] IPC 4層整合性が確認されている
- [x] 変更不要コンポーネントの理由が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビュー
