# TASK-EMB-LATE-CHUNKING-SPEC-RECONCILE-001: Late Chunking 仕様責務再整理

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| タスクID   | TASK-EMB-LATE-CHUNKING-SPEC-RECONCILE-001                      |
| 優先度     | 中                                                             |
| 依存       | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001（完了済み）          |
| 関連タスク | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001（bridge 契約追加元） |
| 作成日     | 2026-04-21                                                     |
| issue番号  | #2372                                                          |

---

## 目的

encoder-based canonical spec（`LateChunkingService`）と `ChunkingService` bridge 契約の責務境界を明文化し、将来の仕様判断が二重化しない一本化された設計ドキュメントを整備する。

---

## 背景

TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 の Phase 12 で、以下の未解決事項が検出された。

aiworkflow 正本（`references/`）は encoder-based late chunking を canonical としており、`LateChunkingService` がその中心を担っている。一方、今回の実装では `ChunkingService` に late chunking bridge 契約を追加した。この bridge 契約は正本へ直ちに吸収しようとすると、既存 `LateChunkingService` との責務再整理が必要になるため、Phase 12 では no-op 判定のうえ本タスクとして follow-up 化した。

両者の責務が文書化されないまま放置されると、以下のリスクが生じる。

- 新規開発者が `LateChunkingService` と `ChunkingService` のどちらを拡張すべきか判断できない
- encoder-based 実装と bridge 実装の機能重複が拡大する
- aiworkflow 正本と実装コードの乖離が継続する

---

## スコープ

### 含む

- `LateChunkingService`（encoder-based canonical）と `ChunkingService`（bridge）の責務境界の明文化
- aiworkflow 正本（`references/`）への責務境界ドキュメントの反映
- `ChunkingService` bridge 契約と `LateChunkingService` インターフェースの整合確認
- 責務分担に基づくコード上のコメント・型定義の補完（必要な場合）
- ドキュメント更新に対応するユニットテストのコメント整備

### 含まない

- `LateChunkingService` の実装変更（責務整理が目的であり、動作変更は別タスク）
- real provider 層への `getTokenEmbeddings` 対応（REAL_PROVIDER_TOKEN_EMBEDDINGS_SUPPORT として別管理）
- encoder-based late chunking アルゴリズム自体の改善

---

## 受入基準

- [ ] `LateChunkingService`（encoder-based canonical）と `ChunkingService` bridge の責務が設計ドキュメントに明文化されていること
- [ ] aiworkflow 正本（`references/`）に責務境界が反映されていること
- [ ] 両インターフェースの契約上の重複・矛盾が解消または明示的に許容として記録されていること
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること
- [ ] 新規開発者がどちらを拡張すべきか判断できる指針がドキュメントに存在すること

---

## 苦戦箇所

- **正本の広範な参照が必要**: `references/` 配下の encoder-based late chunking 仕様全体を読み込んだうえで `ChunkingService` bridge との差異を特定する必要があり、影響範囲が広い
- **責務境界の曖昧さ**: 現時点では「ChunkingService は bridge、LateChunkingService は encoder-based canonical」という暗黙の合意はあるが、それぞれの拡張ポイントや呼び出し経路が文書化されておらず、整理の出発点を定めるのが難しい
- **後方互換性の担保**: 責務を明文化する過程でインターフェース変更が必要と判明した場合、既存の `ChunkingService` 利用箇所への影響を最小化しつつ設計を修正する必要がある

---

## 完了条件

- [ ] 責務境界ドキュメントが `references/` または所定の設計ドキュメントパスに存在すること
- [ ] `LateChunkingService` と `ChunkingService` bridge の役割が一意に定義されていること
- [ ] 既存の動作が変わらないこと（後方互換）
- [ ] 全テストが PASS すること
