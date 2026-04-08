# Phase 9: 因果ループチェック — UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 目的

approval request フローにおける無限ループ・循環依存・副作用連鎖がないことを確認する。

---

## チェック1: useEffect の依存配列

```typescript
useEffect(() => {
  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.onApprovalRequest) return;
  const unsubscribe = skillCreatorApi.onApprovalRequest((payload) => {
    setPendingApproval(payload);
  });
  return unsubscribe;
}, []); // 依存配列: 空
```

**分析**:

- 依存配列が `[]` のため、マウント時に1回のみ実行される
- `setPendingApproval` は安定した関数参照（React の useState から取得）
- ループ条件なし

**判定: 問題なし**

---

## チェック2: handleApprove / handleReject の副作用連鎖

```
handleApprove() → respondToApproval() → setPendingApproval(null)
                                       ↓
                               pendingApproval = null
                                       ↓
                         {pendingApproval ? <ApprovalSheet/> : null}
                                       ↓
                               ApprovalSheet 非表示
```

**分析**:

- `setPendingApproval(null)` → 再レンダリング → approval-sheet 非表示
- 再レンダリングで useEffect が再実行されない（依存配列が `[]`）
- approval callback は再購読されない
- 循環なし

**判定: 問題なし**

---

## チェック3: 多重購読シナリオでのループ

TC-APPR-11 で検証済み。複数の `onApprovalRequest` 呼び出しは独立した listener として登録され、
それぞれの unsubscribe で独立して解除される。listener 間の相互呼び出しなし。

**判定: 問題なし**

---

## チェック4: コンポーネントライフサイクルとの整合

| ライフサイクル | 動作                                      | 問題 |
| -------------- | ----------------------------------------- | ---- |
| マウント       | useEffect でサブスクライブ                | なし |
| approval 受信  | setPendingApproval → 再レンダリング       | なし |
| approve/reject | setPendingApproval(null) → 再レンダリング | なし |
| アンマウント   | useEffect cleanup → unsubscribe           | なし |

---

## 総合判定: 因果ループなし

無限ループ・循環依存・意図しない副作用連鎖は検出されなかった。
