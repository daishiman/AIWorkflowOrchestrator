# Phase 8: リファクタリング

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 8              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 7        |
| 後続Phase  | Phase 9        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                     | 実行形態 |
| ---------- | ---------------------------------------- | -------- |
| SubAgent-A | コメント・命名の統一性確認・Prettier適用 | **直列** |

## リファクタリング方針

- 設計方針コメント（「正規ソース」「補完ソース」）の文言が3ファイル間で統一されているか確認する
- `workflowSnapshotRef`・`pendingPushRef` の命名が既存コードスタイルと一致しているか確認する
- Prettier フォーマットが適用済みであることを確認する

```bash
# フォーマット確認
pnpm --filter @repo/desktop format:check
pnpm --filter @repo/shared format:check
```

## 完了条件

- [ ] 設計方針コメントが3ファイル間で統一されている
- [ ] 命名が既存コードスタイルと一致している
- [ ] Prettier フォーマットが適用済みである

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9: 品質保証
