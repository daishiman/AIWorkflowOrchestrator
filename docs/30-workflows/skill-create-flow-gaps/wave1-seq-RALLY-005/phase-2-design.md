# Phase 2: 設計

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 2              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 1        |
| 後続Phase  | Phase 3        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                       | 実行形態                  |
| ---------- | ------------------------------------------ | ------------------------- |
| SubAgent-D | Phase 1結果を元に3ファイルの変更仕様を確定 | **直列**（Phase 1完了後） |

## 変更箇所

### 変更1: `packages/shared/src/types/skillCreator.ts` — seqNo 型追加

`WorkflowSnapshot` 型に `seqNo?: number` フィールドを追加する。

```typescript
export type WorkflowSnapshot = {
  // ... 既存フィールド
  /**
   * 更新順序を示すシーケンス番号。
   * push/pull 競合解消に使用する。大きい値が新しい状態を示す。
   */
  seqNo?: number;
};
```

seqNo がサーバー側で付与できない場合は `updatedAt?: string`（ISO8601）を代替として使用する。

### 変更2: `apps/desktop/src/main/ipc/creatorHandlers.ts` — seqNo 付与

`getWorkflowState` および `onWorkflowStateChanged` push の両方で返す snapshot に seqNo（またはサーバー側 updatedAt）を付与する。

```typescript
// snapshot 返却時に seqNo を付与する例
return {
  ...workflowSnapshot,
  seqNo: workflowSnapshot.seqNo ?? Date.now(),
};
```

### 変更3: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — 競合ガード実装

```typescript
// [設計方針] workflowSnapshot の更新権限
// 正規ソース: IPC invoke 戻り値（submitWorkflowInput / getWorkflowState の resolve 値）
// 補完ソース: onWorkflowStateChanged push イベント
//
// push は invoke が進行中の場合は pendingPushRef に入れ、
// invoke 完了後に適用する。
// push の seqNo が現在 snapshot 以下の場合は無視する。

const workflowSnapshotRef = useRef(workflowSnapshot);
useEffect(() => {
  workflowSnapshotRef.current = workflowSnapshot;
}, [workflowSnapshot]);

const pendingPushRef = useRef<WorkflowSnapshot | null>(null);

const handleWorkflowStateChanged = useCallback(
  (snapshot: WorkflowSnapshot) => {
    if (isSubmitting) {
      pendingPushRef.current = snapshot;
      return;
    }
    const currentSeqNo = workflowSnapshotRef.current?.seqNo ?? 0;
    const incomingSeqNo = snapshot.seqNo ?? Date.now();
    if (incomingSeqNo <= currentSeqNo) {
      return; // 古い push は無視
    }
    applyWorkflowSnapshot(snapshot);
  },
  [isSubmitting, applyWorkflowSnapshot],
);
```

isSubmitting が false に戻ったタイミングで pendingPushRef を適用する useEffect を追加する。

```typescript
useEffect(() => {
  if (!isSubmitting && pendingPushRef.current) {
    const pending = pendingPushRef.current;
    pendingPushRef.current = null;
    const currentSeqNo = workflowSnapshotRef.current?.seqNo ?? 0;
    const incomingSeqNo = pending.seqNo ?? Date.now();
    if (incomingSeqNo > currentSeqNo) {
      applyWorkflowSnapshot(pending);
    }
  }
}, [isSubmitting, applyWorkflowSnapshot]);
```

## フォールバック戦略

seqNo がサーバー側で提供できない場合:

- フォールバック1: `updatedAt`（ISO8601タイムスタンプ）で比較する
- フォールバック2: seqNo/updatedAt が両方ない場合は isSubmitting 中の push のみキューイングし、古さ判定はスキップする

いずれの戦略も「isSubmitting 中は push を保留する」最低保証は維持する。

## 検証方法

1. 単体テスト: push が isSubmitting 中に届いた場合に pendingPushRef に格納されることを確認
2. 単体テスト: 古い seqNo の push が届いた場合に applyWorkflowSnapshot が呼ばれないことを確認
3. 単体テスト: isSubmitting が false に戻ったときに pendingPush が適用されることを確認
4. `pnpm typecheck` でエラーなしを確認
5. `pnpm lint` でエラーなしを確認

## 完了条件

- [ ] 3ファイルの変更仕様が全て確定している
- [ ] フォールバック戦略が決定されている
- [ ] 設計方針コメントの文言が確定している

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビュー
