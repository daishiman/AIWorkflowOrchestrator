# Phase 2: 設計

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 2              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 1        |
| 後続Phase  | Phase 3        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                            | 実行形態                  |
| ---------- | ------------------------------- | ------------------------- |
| SubAgent-D | Phase 1結果を元に変更仕様を確定 | **直列**（Phase 1完了後） |

## 変更箇所

### 変更対象: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

#### 現状（L675-708 付近）

```typescript
useEffect(() => {
  const planId =
    storePlanId ?? activePlanResult?.planId ?? workflowSnapshot?.planId;
  const skillCreatorApi = getSkillCreatorApi();
  if (!planId || !skillCreatorApi?.getWorkflowState) {
    return;
  }
  void skillCreatorApi
    .getWorkflowState(planId)
    .then((result) => {
      // ... applyWorkflowSnapshot(result.data) 等
    })
    .catch(...);
}, [
  activePlanResult?.planId,
  setHandoffGuidance,
  setWorkflowError,
  setWorkflowSnapshot,
  storePlanId,
  workflowSnapshot?.planId, // ← 循環リスクの原因
]);
```

#### 変更後

```typescript
// workflowSnapshot?.planId を useRef に退避し、依存配列から除外する
const workflowSnapshotPlanIdRef = useRef(workflowSnapshot?.planId);
useEffect(() => {
  workflowSnapshotPlanIdRef.current = workflowSnapshot?.planId;
}, [workflowSnapshot?.planId]);

useEffect(() => {
  // フォールバックは ref 経由で参照（依存配列に不要）
  const planId =
    storePlanId ?? activePlanResult?.planId ?? workflowSnapshotPlanIdRef.current;
  const skillCreatorApi = getSkillCreatorApi();
  if (!planId || !skillCreatorApi?.getWorkflowState) {
    return;
  }
  void skillCreatorApi
    .getWorkflowState(planId)
    .then((result) => {
      // ... applyWorkflowSnapshot(result.data) 等
    })
    .catch(...);
}, [
  activePlanResult?.planId,
  setHandoffGuidance,
  setWorkflowError,
  setWorkflowSnapshot,
  storePlanId,
  // workflowSnapshot?.planId は除外済み → 循環なし
]);
```

### 設計判断の根拠

- エフェクトの本来の目的は「planId が確定したタイミングで一度だけ getWorkflowState を呼ぶ」こと
- `workflowSnapshot?.planId` はフォールバックとして使われているが、`storePlanId` または `activePlanResult?.planId` が存在する場合は使われない
- RALLY-005 で invoke が正規ソースと確立されたため、フォールバックの `workflowSnapshot?.planId` への依存をトリガーにする必要性は低い
- ref 経由で参照することで「値は最新を使いつつ、依存配列のトリガーとはならない」を実現する

### 注意事項

実装前に L675-708 のエフェクト本体が「planId 変更時に必ず実行すべき処理」を含むかを精査する。planId 変更時の初期化処理が必要な場合は、planId 専用の useEffect を別途追加し、循環を起こす処理のみ ref 化する。

## 検証方法

1. `pnpm lint` で `exhaustive-deps` 警告が出ないことを確認
2. 単体テストでエフェクトが `storePlanId` 変化時にのみ再実行されることを確認
3. `workflowSnapshot` 更新後にエフェクトが再実行されないことを確認
4. `pnpm typecheck` でエラーなしを確認

## 完了条件

- [ ] 変更仕様が確定している
- [ ] `workflowSnapshotPlanIdRef` の設計が確定している
- [ ] 設計判断の根拠が文書化されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 3: 設計レビュー
