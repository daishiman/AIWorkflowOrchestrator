# Phase 8: リファクタリング

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 8              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 7        |
| 後続Phase  | Phase 9        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                     | 実行形態 |
| ---------- | ---------------------------------------- | -------- |
| SubAgent-A | コメント・命名の統一性確認・Prettier適用 | **直列** |

## リファクタリング方針

- 設計方針コメント（「workflowSnapshot?.planId を依存配列から除外した理由（循環防止）」）の文言が実装コードと設計ドキュメント間で統一されているか確認する
- `workflowSnapshotPlanIdRef` の命名が RALLY-005 で追加した `workflowSnapshotRef` との一貫性を保っているか確認する
- ref 更新用 useEffect のコメントが「値の最新化のみ目的」であることを明示しているか確認する
- Prettier フォーマットが適用済みであることを確認する

```bash
# フォーマット確認
pnpm --filter @repo/desktop format:check
```

## 完了条件

- [ ] 設計方針コメントが実装コードとドキュメント間で統一されている
- [ ] 命名が既存コードスタイルと一致している
- [ ] Prettier フォーマットが適用済みである

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証
