# 依存整合マトリクス

## パッケージ依存

| パッケージ           | 用途              | 現在の依存 | 備考               |
| -------------------- | ----------------- | ---------- | ------------------ |
| `vitest`             | テスト実行        | 既存       | 追加不要           |
| `typescript`         | 型チェック        | 既存       | 追加不要           |
| Node.js Float16Array | Float16メモリ削減 | Node 20+   | ランタイム確認済み |

## Phase間依存

| 後続Phase | 依存する成果物                     |
| --------- | ---------------------------------- |
| Phase 3   | Phase 2全成果物                    |
| Phase 4   | Phase 2: service-api-design.md     |
| Phase 5   | Phase 4: test-specification.md     |
| Phase 6   | Phase 5: implementation-summary.md |

## コンポーネント間依存

```
LateChunkingService
  → TokenBoundaryCalculator (依存)
  → HiddenStatePooler (依存)
  → WindowSplitter (依存)
  → IEncoder (インターフェース経由)

EmbeddingService
  → LateChunkingService (オプション依存)
```

モック可能な境界: `IEncoder` インターフェース（テスト時に差し替え）
