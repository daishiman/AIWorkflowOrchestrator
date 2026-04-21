# System Spec Update Summary

## 判定

**更新あり**

今回の変更は `ChunkingService` 内部の責務境界と `embedding/late-chunking/` 配下の構成に影響するため、summary のみで閉じずに正本仕様を更新した。

## 実施した同期

| 対象                                                                                   | 内容                                                                    |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `docs/00-requirements/05-architecture.md`                                              | Embedding Generation Pipeline 節に Late Chunking 責務分離を追記         |
| `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | `ChunkingLateChunkingAdapter` を Late Chunking コンポーネント構成へ追加 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                       | 本タスクの仕様同期記録を追加                                            |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                          | `node scripts/generate-index.js` 再生成                                 |
| `.agents/skills/aiworkflow-requirements/`                                              | canonical から mirror 同期                                              |

## 反映内容

### Late Chunking コンポーネント構成

- 既存 `LateChunkingService`: token-level `IEncoder` ベースの埋め込み生成
- 新規 `ChunkingLateChunkingAdapter`: `ChunkingService` 専用の Late Chunking 委譲先

### 依存方向

```text
ChunkingService
  -> ChunkingLateChunkingAdapter
      -> chunking/interfaces.ts
      -> chunking/types.ts
      -> chunking/errors.ts
```

### 更新不要としたもの

| 対象                                              | 理由                                         |
| ------------------------------------------------- | -------------------------------------------- |
| 外部公開 API 仕様                                 | `ChunkingService.chunk()` の利用契約は非破壊 |
| DB / IPC / UI 仕様                                | 今回の変更範囲外                             |
| ルート `outputs/phase-12/implementation-guide.md` | 他タスク成果物であり本タスクの正本ではない   |

## 注意点

- このタスクは `LateChunkingService` を置き換えていない
- 名前衝突回避のため `ChunkingLateChunkingAdapter` を採用
- 後続の pipeline integration では 2 系統の Late Chunking 責務を整理する必要がある
