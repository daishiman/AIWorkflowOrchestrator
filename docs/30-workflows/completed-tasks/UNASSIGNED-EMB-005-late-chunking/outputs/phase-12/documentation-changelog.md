# ドキュメント更新履歴

## 2026-04-19 - UNASSIGNED-EMB-005 Late Chunking実装

### 新規作成ドキュメント

| ドキュメント         | 場所                                         |
| -------------------- | -------------------------------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` |
| 受入条件             | `outputs/phase-1/acceptance-criteria.md`     |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`     |
| サービス層API設計書  | `outputs/phase-2/service-api-design.md`      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`   |

### baseline vs current

| 項目                                 | baseline             | current                   |
| ------------------------------------ | -------------------- | ------------------------- |
| Late Chunking実装                    | なし（stub）         | 完全実装                  |
| テスト件数 (embedding/late-chunking) | 0                    | 31件                      |
| EmbeddingService公開API              | embed/embedBatch/... | + generateChunkEmbeddings |
