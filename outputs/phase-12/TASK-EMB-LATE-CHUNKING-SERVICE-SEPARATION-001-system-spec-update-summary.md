# Phase 12 システム仕様更新サマリー

## タスクID: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001

---

## 更新判定

**更新あり**

本タスクで新規クラス `ChunkingLateChunkingAdapter` が追加され、`ChunkingService` の責務が変化した。アーキテクチャ仕様およびシステム仕様に反映が必要。

---

## 同期対象ファイルの更新結果

### 1. `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 状態     | 更新済み（本 Phase-12 作業で ChunkingLateChunkingAdapter の追加を反映）                      |
| 更新内容 | embedding パイプライン構成図に `ChunkingLateChunkingAdapter` コンポーネントを追加            |
| 更新箇所 | Late Chunking 処理フローの記述を「ChunkingService 内部実装」から「アダプタ委譲モデル」に改訂 |
| 備考     | mirror ファイル（`.agents/skills/` 側）も同期対象                                            |

**更新内容のサマリ:**

変更前:

```
ChunkingService
  └── applyLateChunking() [内部実装: determineChunkBoundaries / poolTokenEmbeddings]
```

変更後:

```
ChunkingService
  └── applyLateChunking() ──委譲──→ ChunkingLateChunkingAdapter
                                      ├── applyLateChunking()
                                      ├── determineChunkBoundaries()
                                      └── poolTokenEmbeddings()
```

### 2. `docs/00-requirements/05-architecture.md`

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 状態     | 更新済み（本 Phase-12 作業で反映）                                                                  |
| 更新内容 | Embedding サービス層のコンポーネント一覧に `ChunkingLateChunkingAdapter` を追加                     |
| 更新箇所 | `packages/shared/src/services/embedding/late-chunking/` の配下クラス記述を最新化                    |
| 備考     | `LateChunkingService`（token-level）と `ChunkingLateChunkingAdapter`（chunking 委譲層）の区別を明記 |

**更新内容のサマリ:**

変更前（旧記述）:

```
late-chunking/
  ├── late-chunking-service.ts    # トークンレベルの Late Chunking 実装
  ├── token-boundary-calculator.ts
  ├── hidden-state-pooler.ts
  └── window-splitter.ts
```

変更後（現記述）:

```
late-chunking/
  ├── late-chunking-service.ts              # トークンレベルの Late Chunking 実装
  ├── chunking-late-chunking-adapter.ts     # ChunkingService 向け Late Chunking 委譲アダプタ（新規）
  ├── token-boundary-calculator.ts
  ├── hidden-state-pooler.ts
  └── window-splitter.ts
```

### 3. `.claude/skills/aiworkflow-requirements/LOGS.md`

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 状態     | 更新済み（本 Phase-12 作業で末尾に追記）                                         |
| 追記内容 | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 完了エントリ（実装結果・品質確認） |
| 備考     | append-only 運用のため既存内容は変更なし                                         |

### 4. `.agents/skills/aiworkflow-requirements/` mirror 状態

| 項目 | 内容                                                  |
| ---- | ----------------------------------------------------- |
| 状態 | 部分 sync 済み（LOGS.md・references/ は反映済み）     |
| 備考 | full rsync --delete による完全同期は FU-01 として記録 |

---

## 変更サマリー

| ファイル                                                                                                | 変更種別           | Phase    |
| ------------------------------------------------------------------------------------------------------- | ------------------ | -------- |
| `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`                | 新規作成           | Phase 5  |
| `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts` | 新規作成           | Phase 6  |
| `packages/shared/src/services/embedding/late-chunking/index.ts`                                         | 変更（追記）       | Phase 7  |
| `packages/shared/src/services/chunking/chunking-service.ts`                                             | 変更（委譲実装）   | Phase 8  |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`                  | 変更（テスト追加） | Phase 9  |
| `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`                  | 変更（更新）       | Phase 12 |
| `.agents/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`                  | 変更（mirror）     | Phase 12 |
| `docs/00-requirements/05-architecture.md`                                                               | 変更（更新）       | Phase 12 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                                        | 追記               | Phase 12 |
| `.agents/skills/aiworkflow-requirements/LOGS.md`                                                        | 追記               | Phase 12 |

---

## 未完了事項（スコープ外）

- `.agents/skills/` full sync（rsync --delete）: FU-01 として記録
- `ChunkingLateChunkingAdapter` の詳細 API ドキュメント（JSDoc 充実化）: 本タスクスコープ外
