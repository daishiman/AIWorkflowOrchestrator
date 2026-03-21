# 未タスク検出レポート

## TASK-FIX-LLM-CONFIG-PERSISTENCE

### 検出件数: 2件

### UT-FIX-LLM-PERSIST-ENCRYPT-001: persist storage暗号化の検討

- **説明**: 現在のpersist storageはlocalStorageに平文で保存されている。selectedProviderId/selectedModelIdは機密情報ではないが、将来的にpersist対象フィールドが増えた場合のセキュリティ強化として暗号化の検討が必要
- **優先度**: LOW
- **関連仕様書**: arch-state-management.md
- **ステータス**: 未着手
- **指示書**: [`docs/30-workflows/unassigned-task/UT-FIX-LLM-PERSIST-ENCRYPT-001.md`](../../unassigned-task/UT-FIX-LLM-PERSIST-ENCRYPT-001.md)

### UT-FIX-LLM-FETCHPROVIDERS-RETRY-001: fetchProviders失敗時のリトライとバリデーション連携

- **説明**: fetchProvidersが失敗した場合、永続化値のバリデーションがスキップされる（providers空配列で判断保留）。リトライ成功時にバリデーションが確実に実行されるかの検証が必要
- **優先度**: MEDIUM
- **関連仕様書**: arch-state-management.md, llm-ipc-types.md
- **ステータス**: 未着手
- **指示書**: [`docs/30-workflows/unassigned-task/UT-FIX-LLM-FETCHPROVIDERS-RETRY-001.md`](../../unassigned-task/UT-FIX-LLM-FETCHPROVIDERS-RETRY-001.md)
