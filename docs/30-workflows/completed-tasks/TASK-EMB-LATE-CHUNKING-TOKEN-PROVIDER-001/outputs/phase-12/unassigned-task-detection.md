# Unassigned Task Detection

## 判定

2 件

## 未タスク候補

| ID                                       | 内容                                                                            | 理由                                                                 | 影響                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `REAL_PROVIDER_TOKEN_EMBEDDINGS_SUPPORT` | real provider 層へ `getTokenEmbeddings` 相当の正式対応を追加する                | 今回は mock と `ChunkingService` bridge のみ                         | 実運用 provider では token-level provider 未接続のまま |
| `LATE_CHUNKING_SPEC_RECONCILIATION`      | encoder-based canonical spec と `ChunkingService` bridge 契約の責務を再整理する | aiworkflow 正本は `LateChunkingService` 中心で、今回追加契約を未反映 | 将来の仕様判断が二重化する恐れ                         |

## 今回 open にしなかった項目

- `chunk()` 本流未接続: current wave で解消済み
- fallback 件数不整合: current wave で解消済み
