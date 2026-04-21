# Refactor Decision Log - Phase 8

## 基本方針

本タスク（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001）の制約:

- **ロジック改変ゼロ**: Late Chunking 本体ロジックはコピー移動のみ
- **テスト挙動の不変性**: Before/After で metadata.lateChunking.applied / embeddingDimension が同値
- **後方互換性**: 既存 3 引数コンストラクタが非破壊

→ Phase 8 での積極的リファクタは上記制約に抵触するため、**軽微な JSDoc 整備のみ**を実施する。

## 決定 1: 抽出クラス名の最終確定

| 候補                            | 採用 / 却下 | 理由                                                                                      |
| ------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `LateChunkingService`（仕様書） | 却下        | 既存の真 token-level 実装（`late-chunking-service.ts`）と衝突                             |
| `ChunkingLateChunkingAdapter`   | **採用**    | 「Chunking サービスからの切り出しであり、Late Chunking への委譲アダプタ」という役割を明示 |

## 決定 2: public / private 境界

| メソッド                   | 可視性  | 理由                                                          |
| -------------------------- | ------- | ------------------------------------------------------------- |
| `applyLateChunking`        | public  | `ChunkingService` からの委譲エントリポイント                  |
| `determineChunkBoundaries` | public  | テスト観測性向上（SEP-03 / SEP-04 の直接検証に必須）          |
| `poolTokenEmbeddings`      | public  | テスト観測性向上（SEP-05 / SEP-06 / SEP-07 の直接検証に必須） |
| `getTokenEmbeddings`       | private | `applyLateChunking` 内部実装（外部契約ではない）              |

## 決定 3: 未到達コード（防御 if）の扱い

対象: `chunking-late-chunking-adapter.ts:118-120`

```typescript
if (!this.embeddingClient) {
  throw new ChunkingError("Embedding client is required");
}
```

- 現行経路では `applyLateChunking` 側で先にガードされるため到達不能
- **保持を選択**（削除すると「ロジック改変」に該当）
- 判断根拠: `embeddingClient` が public フィールドではないため、将来 DI 切り替えやコンストラクタ変更があった場合の安全弁として価値がある

## 決定 4: `ChunkingService` 委譲メソッドの形

```typescript
private async applyLateChunking(
  text: string,
  chunks: Chunk[],
  options: LateChunkingOptions,
): Promise<Chunk[]> {
  if (!this.lateChunkingAdapter) {
    throw new ChunkingError("Embedding client is required for Late Chunking");
  }
  return this.lateChunkingAdapter.applyLateChunking(text, chunks, options);
}
```

- **早期リターンガード**: エラーメッセージ文言は Before と同一（"Embedding client is required for Late Chunking"）
- **委譲のみ**: 変換ロジックは一切持たない（ファサードのみ）
- **private のまま保持**: 外部からは `chunk()` 経由でのみアクセス可能（既存 public API を変えない）

## 決定 5: 自動 Adapter 生成のコンストラクタ内挙動

```typescript
this.lateChunkingAdapter =
  lateChunkingAdapter ??
  (embeddingClient
    ? new ChunkingLateChunkingAdapter(tokenizer, embeddingClient)
    : undefined);
```

- 引数明示 > 自動生成 > undefined の優先順
- `embeddingClient` が無ければ自動生成も諦める（Adapter 側が `embeddingClient` を必須とするため）
- DI 注入パスを残すことで、SEP-08 / SEP-09 の委譲確認テストが成立する

## コード品質確認

- JSDoc: Adapter クラス・全 public メソッドに日本語 JSDoc あり（Phase 5 で整備済み、Phase 8 追加変更なし）
- import 整理: 型 import (`type`) と値 import が分離され、lint 準拠
- 参照方向: 一方向（chunking → embedding/late-chunking）、循環なし
- dead code: なし（Phase 5 で削除済み 3 メソッドは参照元も消滅）

## Phase 9 引き継ぎ

- 品質ゲート対象:
  - `pnpm run typecheck`（package: @repo/shared）
  - `pnpm run lint`（該当 2 ファイル）
  - targeted test: Adapter 単体 7 件 + Service 統合 24 件 = 31 件 PASS 維持
