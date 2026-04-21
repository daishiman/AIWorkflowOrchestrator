# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 7              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 6        |
| 後続Phase  | Phase 8        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                             | 実行形態 |
| ---------- | -------------------------------- | -------- |
| SubAgent-A | カバレッジレポート取得・閾値確認 | **直列** |

## カバレッジ確認コマンド

```bash
pnpm --filter @repo/desktop test -- --coverage
```

## 確認観点

- 修正した useEffect（L675-708 相当）のブランチカバレッジを確認する
- TC-1〜TC-5 で `storePlanId`/`activePlanResult?.planId` 変化時・`workflowSnapshot?.planId` のみ変化時・ref 参照・planId null の全分岐が網羅されていることを確認する
- `workflowSnapshotPlanIdRef` の更新 useEffect のカバレッジを確認する
- カバレッジ閾値（設定されている場合）を下回っていないことを確認する

## 完了条件

- [ ] カバレッジレポートが取得されている
- [ ] 新規追加コードのブランチカバレッジが 80% 以上である
- [ ] カバレッジ閾値違反がない

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8: リファクタリング
