# Phase 8: リファクタリング記録

## 命名整理

| state 変数          | 役割                             | 整合性                                        |
| ------------------- | -------------------------------- | --------------------------------------------- |
| `request`           | textarea の draft input          | OK - ユーザー編集対象                         |
| `approvedSkillSpec` | plan 承認時の canonical snapshot | OK - "approved" + "Spec" で意図明確           |
| `localPlanResult`   | plan 結果のローカルキャッシュ    | OK - store と dual 管理の意図が名前から読める |
| `storePlanId`       | store 側の plan ID               | OK - "store" prefix で所有者明確              |

命名の混在なし。draft / approved / plan metadata の3つの責務が名前から区別できる。

## Clear 動作の対称性

### handleCancelPlan の状態クリア

```
setLocalPlanResult(null)       ← plan 結果クリア
setApprovedSkillSpec(null)     ← approved snapshot クリア
clearGenerationState()         ← generation 系 state クリア
setActiveWorkflowId(null)      ← workflow ID クリア
setVerifyDetail(null)          ← verify detail クリア
setVerifyDetailError(null)     ← verify error クリア
```

6つの state が対称的にクリアされる。片消しなし。

## リファクタリング判定

- **大規模再構成**: 不要
- **理由**: `approvedSkillSpec` は1箇所で set、1箇所で read、1箇所で clear。最小複雑性を達成済み
- **追加の抽象化**: 不要。custom hook 化は過剰（この state は `SkillLifecyclePanel` に閉じている）
- **旧コードの残存**: `handleExecutePlan` 内に `request.trim()` の参照なし（M-3 で完全置換済み）

## 不要な分岐

- `approvedSkillSpec ?? undefined` の nullish coalescing は API 互換のために必要（削除不可）
- 新たに追加された条件分岐はなし
