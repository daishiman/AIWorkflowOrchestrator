# Phase 12 ドキュメント変更ログ

## タスクID: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001

---

## 新規作成ファイル

### 1. `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`

| 項目       | 内容     |
| ---------- | -------- |
| 変更種別   | 新規作成 |
| 実施 Phase | Phase 5  |
| 行数       | 264 行   |

**内容:**

`ChunkingService` から抽出した Late Chunking アルゴリズム専用サービス層。public 3 メソッド（`applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`）と private 7 メソッドで構成される。

既存の `LateChunkingService`（token-level）との命名衝突を避けるため `ChunkingLateChunkingAdapter` として命名。ロジックは `ChunkingService` からのコピー移動のみで実装改変なし。

**設計根拠:**

- `ChunkingService` の SRP 遵守（Late Chunking 算術処理を分離）
- private メソッドを public に昇格することでテスト観測性を確保
- `ITokenizer` / `IEmbeddingClient` インターフェースに依存し、具体実装に非依存

---

### 2. `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts`

| 項目       | 内容                        |
| ---------- | --------------------------- |
| 変更種別   | 新規作成                    |
| 実施 Phase | Phase 6                     |
| テスト数   | SEP-01 〜 SEP-09（9ケース） |

**テスト一覧:**

| テストID | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| SEP-01   | 単一チャンク・mean pooling で `applied=true` かつ `embeddingDimension > 0` を返す     |
| SEP-02   | 複数チャンク・cls pooling で各チャンクに `applied=true` を設定する                    |
| SEP-03   | `maxSequenceLength` 以下のテキストは単一セグメントで処理される                        |
| SEP-04   | `determineChunkBoundaries` は各チャンクの `position.end` を返す                       |
| SEP-05   | `poolTokenEmbeddings` mean 戦略で均等平均を返す                                       |
| SEP-06   | `poolTokenEmbeddings` cls 戦略で先頭セグメントを返す                                  |
| SEP-07   | `poolTokenEmbeddings` attention 戦略でオーバーラップ重み付け平均を返す                |
| SEP-08   | `ChunkingService` → `ChunkingLateChunkingAdapter` への委譲確認（integration.test.ts） |
| SEP-09   | 4番目引数省略時は自動生成アダプタを使用する確認（integration.test.ts）                |

---

## 修正ファイル

### 3. `packages/shared/src/services/embedding/late-chunking/index.ts`

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 変更種別   | 変更（既存ファイルへの追記） |
| 実施 Phase | Phase 7                      |

**変更内容:**

`ChunkingLateChunkingAdapter` のエクスポートを追加。

```diff
+ export { ChunkingLateChunkingAdapter } from "./chunking-late-chunking-adapter";
  export { LateChunkingService } from "./late-chunking-service";
  export { TokenBoundaryCalculator } from "./token-boundary-calculator";
  // ... 既存エクスポートは変更なし
```

**設計根拠:**

パッケージ外からのインポートを `packages/shared/src/services/embedding/late-chunking/` 経由で統一。個別ファイルへの直接インポートを不要にする。

---

### 4. `packages/shared/src/services/chunking/chunking-service.ts`

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| 変更種別   | 変更（委譲実装 + コンストラクタ引数追加） |
| 実施 Phase | Phase 8                                   |

**変更内容（主要箇所）:**

1. `ChunkingLateChunkingAdapter` のインポート追加
2. コンストラクタに 4 番目オプショナル引数 `lateChunkingAdapter?: ChunkingLateChunkingAdapter` を追加
3. コンストラクタ内で `lateChunkingAdapter ?? (embeddingClient ? new ChunkingLateChunkingAdapter(...) : undefined)` により自動生成
4. `applyLateChunking()` 内部処理をアダプタへ委譲

**後方互換性:**

- 既存の 3 引数呼び出し `new ChunkingService(tokenizer, embeddingClient, llmClient)` は変更なしで動作する
- 公開 API `chunk()` の入出力シグネチャは無変化

---

### 5. `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| 変更種別   | 変更（SEP-08 / SEP-09 テスト追加） |
| 実施 Phase | Phase 9                            |

**変更内容:**

- SEP-08: `ChunkingLateChunkingAdapter` モックを 4 番目引数で注入し、`applyLateChunking` が呼ばれることを確認
- SEP-09: 4 番目引数省略時に内部自動生成アダプタが使われることを確認（回帰テスト）

---

## ドキュメント変更

### 6. `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 変更種別   | 変更（アーキテクチャ図更新） |
| 実施 Phase | Phase 12                     |

`ChunkingLateChunkingAdapter` を embedding パイプライン構成図に追加。`ChunkingService` → アダプタ委譲モデルを反映。

---

### 7. `docs/00-requirements/05-architecture.md`

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| 変更種別   | 変更（コンポーネント一覧更新） |
| 実施 Phase | Phase 12                       |

`late-chunking/` ディレクトリのコンポーネント一覧に `chunking-late-chunking-adapter.ts` を追加。`LateChunkingService`（token-level）と `ChunkingLateChunkingAdapter`（chunking 委譲層）の区別を明記。

---

## 変更統計

| 変更種別                 | ファイル数 |
| ------------------------ | ---------- |
| 新規作成（実装）         | 1          |
| 新規作成（テスト）       | 1          |
| 変更（エクスポート追記） | 1          |
| 変更（委譲実装）         | 1          |
| 変更（テスト追加）       | 1          |
| 変更（ドキュメント更新） | 2          |
| **合計**                 | **7**      |
