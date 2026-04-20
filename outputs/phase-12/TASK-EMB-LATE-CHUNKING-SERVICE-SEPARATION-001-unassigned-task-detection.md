# Phase 12 未割り当てタスク検出

## タスクID: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001

---

## フォローアップタスク一覧

本タスク（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）のスコープ外として検出されたフォローアップ事項を記録します。
いずれも本タスクの完了判定には影響しません。

---

### 後続タスク: TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001

| 項目             | 内容                                                |
| ---------------- | --------------------------------------------------- |
| ID               | TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001     |
| タイトル         | Late Chunking アダプタの EmbeddingPipeline への統合 |
| 優先度           | 高                                                  |
| 本タスクスコープ | 外（後続タスク）                                    |
| ステータス       | 未着手（本タスク完了後に開始可）                    |

**背景:**

本タスクで `ChunkingLateChunkingAdapter` を独立クラスとして分離したことで、`EmbeddingPipeline` への組み込みが容易になった。現状では `ChunkingService` 経由でしか Late Chunking が実行できない構造になっており、`EmbeddingPipeline` から直接アダプタを呼び出すパスが存在しない。

**実施内容（想定）:**

- `EmbeddingPipeline` に `ChunkingLateChunkingAdapter` を DI で注入するインターフェースを追加
- `EmbeddingPipeline.process()` フローに Late Chunking ステップを組み込む
- パイプライン統合テストの新設

**依存関係:**

- 本タスク（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）: 完了済み（前提）
- TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001: 完了済み（先行タスク）

---

### 未フォーマライズ候補: TASK-EMB-CONTEXTUAL-SEPARATION-001

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| ID（案）         | TASK-EMB-CONTEXTUAL-SEPARATION-001                      |
| タイトル（案）   | Contextual Embeddings 処理の ChunkingService からの分離 |
| 優先度           | 中                                                      |
| 本タスクスコープ | 外（本タスク仕様書の「含まないもの」に明記）            |
| ステータス       | 未起票（タスク仕様書作成が必要）                        |

**背景:**

本タスクで Late Chunking を分離したが、`ChunkingService` にはもう一つの責務「Contextual Embeddings 処理（LLM を使ったコンテキスト生成）」が残っている。Late Chunking と同様に、以下の問題がある。

- `applyContextualEmbeddings()` および `generateContextForChunk()` が `ChunkingService` の private メソッドに埋没している
- LLM クライアントへの依存が `ChunkingService` のコンストラクタを複雑にしている
- Contextual Embeddings 処理を単独でテストできない

**実施内容（想定）:**

- `ContextualEmbeddingsAdapter` クラスを `packages/shared/src/services/embedding/contextual/` に新設
- `ChunkingService.applyContextualEmbeddings()` をアダプタに委譲
- 単体テストの新設

**推奨タイミング:** TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 完了後に着手

---

### 関連タスク（先行タスク・完了済み）: TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001

| 項目             | 内容                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| ID               | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001                                                                      |
| タイトル         | IEmbeddingClient へのトークンレベル埋め込み取得インターフェース追加                                            |
| ステータス       | 完了済み（本タスクの前提）                                                                                     |
| 本タスクとの関係 | 先行タスク。`IEmbeddingClient` インターフェースが整備済みであることが `ChunkingLateChunkingAdapter` の実装前提 |

---

## 本タスク必須スコープの完了確認

| 必須事項                                                                             | 状態                 |
| ------------------------------------------------------------------------------------ | -------------------- |
| `ChunkingLateChunkingAdapter` 新規作成                                               | 完了                 |
| `applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings` public 公開 | 完了                 |
| `ChunkingService.applyLateChunking()` のアダプタ委譲                                 | 完了                 |
| コンストラクタ後方互換（4番目オプショナル引数）                                      | 完了                 |
| `index.ts` へのエクスポート追加                                                      | 完了                 |
| SEP-01 〜 SEP-09 テスト実装・PASS                                                    | 完了                 |
| Phase 12 ドキュメント作成                                                            | 完了（本セッション） |

FU-01（パイプライン統合）・FU-02（Contextual Embeddings 分離）はいずれも本タスクの必須スコープ外であり、完了判定をブロックしません。
