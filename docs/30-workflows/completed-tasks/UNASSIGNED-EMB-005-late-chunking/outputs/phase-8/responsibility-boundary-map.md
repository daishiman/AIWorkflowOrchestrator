# 責務境界マップ

```
┌─────────────────────────────────────┐
│         EmbeddingService            │ ← Facade（変更最小）
│   + generateChunkEmbeddings()       │
└──────────────┬──────────────────────┘
               │ 委譲
┌──────────────▼──────────────────────┐
│       LateChunkingService           │ ← フロー制御
│   generateChunkEmbeddings()         │
└──┬───────────┬───────────┬──────────┘
   │           │           │
   ▼           ▼           ▼
┌──────┐ ┌──────────┐ ┌──────────┐
│Window│ │TokenBdry │ │HiddenStt │
│Split │ │Calculator│ │Pooler    │
│ er   │ │          │ │(mean/max/│
│      │ │          │ │ cls)     │
└──────┘ └──────────┘ └──────────┘
   ↑ 全コンポーネントはIEncoderを依存注入で受け取る
```
