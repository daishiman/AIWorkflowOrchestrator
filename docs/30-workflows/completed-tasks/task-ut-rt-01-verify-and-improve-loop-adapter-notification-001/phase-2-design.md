# Phase 2: 設計

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 2                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

最小変更で通知統一を実現する実装方針を確定する。

## 実行タスク

- Task 2-1: 通知追加箇所の設計
- Task 2-2: `recordImproveFailureSnapshot()` の設計確認
- Task 2-3: 変更ファイル一覧の確定

## 参照資料

| 資料名                     | パス                                                                   | 説明                     |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物             | [phase-1-requirements.md](phase-1-requirements.md)                     | FR/AC/エッジケース定義   |
| 対象実装ファイル           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | 設計の実装対象           |
| SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | recordImproveFailure確認 |

## 実行手順

### Step 1: Task 2-1 通知追加箇所の設計

`verifyAndImproveLoop()` 内の `improve()` エラーハンドリング（L434〜L450付近）を以下に更新する:

**変更方針**:

```typescript
// エラーレスポンスチェック
if ("success" in improveResult && !improveResult.success) {
  const errorCode = improveResult.error.code;
  const errorMessage = improveResult.error.message;

  // 追加: runtime guard と統一した通知呼び出し
  try {
    this.notificationService?.notify("スキル作成失敗", errorMessage);
  } catch {
    // 通知の失敗はループ結果に影響しない
  }

  const snapshot = this.recordImproveFailureSnapshot(
    planId,
    `improve が ${errorCode} で失敗しました: ${errorMessage}`,
  );
  return {
    finalStatus: "error",
    totalAttempts: attemptCount,
    finalChecks: checks,
    loopExhausted: false,
    errorCode,
    errorMessage,
    workflowSnapshot: snapshot,
  };
}
```

**設計根拠**:

- `try/catch` でラップして通知失敗がループ結果に影響しないようにする（E-2対策）
- optional chaining `?.` で `notificationService` が未設定でも安全（E-1対策）
- `_executeInternal()` の通知パターンと同一にして統一感を持たせる

### Step 2: Task 2-2 `recordImproveFailureSnapshot()` の設計確認

現行の `recordImproveFailureSnapshot()` は:

1. `workflowEngine.recordImproveFailure()` が存在する場合は委譲
2. なければフォールバックとして `currentPhase: "improve"` を維持し `verifyResult` を更新

**設計判断**: phase を `"improve"` のまま保持する（`"review"` に戻さない）のが正しい設計。

理由:

- `improve()` がエラーで終了した場合、ユーザーは「改善を試みたが失敗した」状態にいる
- `"review"` に戻すと「まだレビュー前」という誤解を招く
- `verifyResult.nextAction: "improve"` で「改善が必要」を示すのが適切

**`recordImproveFailureSnapshot()` の動作確認**:

```typescript
// phase を "improve" のまま保持し、verifyResult だけを更新する
return {
  ...existingSnapshot,
  currentPhase: "improve", // "review" に戻さない
  verifyResult: {
    status: "fail",
    message,
    nextAction: "improve",
    updatedAt,
  },
};
```

### Step 3: Task 2-3 変更ファイル一覧

| 種別       | ファイルパス                                                                                                      | 変更内容                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 通知追加   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                             | `improve()` エラーブロックに `notify()` 呼び出し追加（約5行） |
| テスト追加 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`（既存 or 新規） | `verifyAndImproveLoop` + adapter エラー シナリオ追加          |

**新規作成ファイル**: なし（既存ファイルの修正のみ）

## 統合テスト連携【必須】

| 連携アクション   | 内容                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| 統合ポイント確認 | `INotificationService.notify()` の呼び出し契約の確認                     |
| API契約          | `RuntimeSkillCreatorVerifyAndImproveResult.errorCode` フィールドの型確認 |

## 成果物

| 成果物                               | 配置先                             |
| ------------------------------------ | ---------------------------------- |
| 通知追加設計（TypeScript擬似コード） | 本ファイル内（上記 Step 1 に記載） |
| recordImproveFailureSnapshot設計確認 | 本ファイル内（上記 Step 2 に記載） |
| 変更ファイル一覧                     | 本ファイル内（上記 Step 3 に記載） |

## 完了条件

- [ ] 通知追加箇所の実装方針が確定している
- [ ] `recordImproveFailureSnapshot()` の phase 保持方針が確定している
- [ ] 変更ファイルが2ファイル（実装+テスト）に絞られている
- [ ] エッジケース E-1〜E-5 の全てに対処が設計されている

## タスク100%実行確認【必須】

Phase 2 完了時に以下を確認すること:

- [ ] Task 2-1（通知追加箇所の設計）を完全に実行した
- [ ] Task 2-2（recordImproveFailureSnapshot設計確認）を完全に実行した
- [ ] Task 2-3（変更ファイル一覧）を完全に実行した

## 次Phase

→ [Phase 3: 設計レビューゲート](phase-3-design-review.md)

**Phase 2→3 の遷移条件**: 実装方針が確定し、変更ファイルが特定されていること
