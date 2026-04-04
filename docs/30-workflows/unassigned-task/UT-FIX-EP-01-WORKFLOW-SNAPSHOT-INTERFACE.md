# UT-FIX-EP-01-WORKFLOW-SNAPSHOT-INTERFACE: onWorkflowStateSnapshot の interface 明示化

## メタ情報

```yaml
issue_number: 1915
```

## メタ情報

| 項目         | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-FIX-EP-01-WORKFLOW-SNAPSHOT-INTERFACE                    |
| タスク名     | onWorkflowStateSnapshot callback 契約の型インターフェース化 |
| 優先度       | 低                                                          |
| 分類         | リファクタリング / 型安全性向上                             |
| 見積もり規模 | 小規模                                                      |
| 検出元       | TASK-FIX-EP-01 Phase 3（設計レビュー）, Phase 10            |
| 作成日       | 2026-04-04                                                  |
| ステータス   | 未着手                                                      |

## 概要

`RuntimeSkillCreatorFacade` の `onWorkflowStateSnapshot` コールバックが暗黙的な関数型として定義されている。callback 契約を `interface` または `type` として独立定義し、引数の意味（planId, snapshot, errorMessage）を明確化することで、メソッド境界の可読性と保守性を向上させる。

## 影響範囲

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `onWorkflowStateSnapshot` プロパティの型定義
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — コールバック設定箇所

## 対応方針

1. `OnWorkflowStateSnapshotCallback` インターフェースを定義:
   ```typescript
   export type OnWorkflowStateSnapshotCallback = (
     planId: string,
     snapshot: SkillCreatorWorkflowUiSnapshot | null,
     errorMessage?: string,
   ) => void;
   ```
2. `RuntimeSkillCreatorFacade` の `onWorkflowStateSnapshot` プロパティの型を更新
3. `creatorHandlers.ts` のコールバック設定箇所の型が一致することを確認
4. 既存テストが全 PASS することを確認

## 苦戦箇所（TASK-FIX-EP-01 からの知見）

- **早期失敗時の引数バリエーション**: `executeAsync` が early failure した場合、`snapshot` が `null` で `errorMessage` が設定されるケースがある。この引数パターンを型で明示することで、将来の呼び出し元が誤ったパターンで呼ぶリスクを低減できる
- **推奨**: UT-SC-01-DIP-INTERFACE（DIP 準拠インターフェース化）と合わせて対応すると、Facade 全体の型安全性が向上する

## 参照

- TASK-FIX-EP-01 Phase 3 設計レビュー: MINOR 指摘
- UT-SC-01-DIP-INTERFACE: 関連する DIP 準拠化タスク
- `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/unassigned-task-detection.md`: U-5
