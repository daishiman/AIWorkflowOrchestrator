# Late Chunking: 責務分離・専用サービス層抽出 - タスク指示書

## メタ情報

```yaml
issue_number: 2314
task_id: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001
task_name: Late Chunking 責務分離・専用サービス層抽出
category: リファクタリング
target_feature: packages/shared/src/services/embedding/late-chunking/
priority: 高
scale: 中規模
status: 実施済み
source_phase: UNASSIGNED-EMB-005 review wave Phase 10-12
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001         |
| タスク名     | Late Chunking: 責務分離・専用サービス層抽出           |
| 分類         | リファクタリング                                      |
| 対象機能     | packages/shared/src/services/embedding/late-chunking/ |
| 優先度       | 高                                                    |
| 見積もり規模 | 中規模                                                |
| ステータス   | 実施済み                                              |
| 発見元       | UNASSIGNED-EMB-005 review wave Phase 10-12            |
| 発見日       | 2026-04-19                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`packages/shared/src/services/chunking/chunking-service.ts` は現在、以下の複数の責務を単一クラスに抱えている。

1. **チャンキング戦略のファサード**: `FixedChunkingStrategy` / `SentenceChunkingStrategy` 等の統合
2. **Contextual Embeddings処理**: LLMを使ったコンテキスト生成とチャンク拡張
3. **Late Chunking処理**: トークン境界変換・セグメントプーリング・フォールバック処理

このうち Late Chunking は独立した数学的アルゴリズム（チャンク境界 → トークン範囲変換、オーバーラップ検出、プーリング戦略）を持ち、将来的な機能拡張（pooling戦略の追加、観測可能性の向上）も予見される。

UNASSIGNED-EMB-005 review wave では、`chunking-service.ts` にLate Chunking処理を混在させたまま機能追加を繰り返した結果、ファイルが638行に膨れ上がり、Late Chunking固有のロジック（`determineChunkBoundaries` / `poolTokenEmbeddings` / `hasTokenOverlap` 等）が `ChunkingService` のprivateメソッドとして埋没した。

### 1.2 問題点・課題

**問題1: `ChunkingService` の単一責任原則違反**

`chunking-service.ts` は「チャンキング戦略の統合」が本来の責務であるが、Late Chunkingの具体的なアルゴリズム（トークン位置変換・プーリング）が混在している。このため：

- Late Chunkingアルゴリズムを単独でテストできない（`ChunkingService` の全依存をモックする必要がある）
- `poolTokenEmbeddings()` や `charPositionToTokenIndex()` などの内部処理が `private` に隠れており、挙動の把握が困難
- Late Chunking固有の設定（`poolingStrategy` / `maxSequenceLength`）が `LateChunkingOptions` として定義されているが、それを解釈するロジックが分散している

**問題2: Late Chunking固有テストの観測可能性が低い**

`ChunkingService` を通じたテストでは、Late Chunkingの内部ステップ（境界変換の正確性・プーリング重みの計算）を直接検証できない。UNASSIGNED-EMB-005 review wave で「mockでは困難」と報告された根本原因がこれである。

**問題3: 将来の機能拡張（プーリング戦略追加等）で `ChunkingService` がさらに肥大化する**

token-level hidden statesを使う真のLate Chunking（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001）や、EmbeddingPipelineへの統合（TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001）を実施すると、責務混在が悪化する。

### 1.3 放置した場合の影響

- `chunking-service.ts` のテスト困難性が蓄積し、Late Chunkingアルゴリズムの回帰バグ検出が遅れる
- 後続タスク（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001、TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001）で `ChunkingService` への追加変更が生じた際に、影響範囲特定が困難になる
- `poolTokenEmbeddings` 等のアルゴリズム部品を他のコンテキストで再利用できない

---

## 2. 何を達成するか（What）

### 2.1 目的

`ChunkingService` からLate Chunking処理ロジックを抽出し、独立した `LateChunkingService` クラスとして `packages/shared/src/services/embedding/late-chunking/` に移動する。`ChunkingService` は `LateChunkingService` に委譲するファサードとして薄くなる。

### 2.2 最終ゴール

1. `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts` が存在し、以下のメソッドを持つ
   - `applyLateChunking(text, chunks, options)`: Late Chunking処理の統括エントリーポイント
   - `determineChunkBoundaries(chunks, text)`: チャンク境界 → トークン範囲変換
   - `poolTokenEmbeddings(segmentEmbeddings, boundaries, strategy)`: プーリング処理
2. `ChunkingService` の `applyLateChunking()` が `LateChunkingService` に処理を委譲する形になっている
3. Late Chunking固有のロジックを `LateChunkingService` 単独でテストできる（`ChunkingService` のモックが不要）
4. 公開API（`ChunkingService.chunk()` の入出力）が変化しない（呼び出し元への影響ゼロ）

### 2.3 スコープ

**含むもの**:

- `LateChunkingService` クラスの新設（`packages/shared/src/services/embedding/late-chunking/`）
- `ChunkingService.applyLateChunking()` / `getTokenEmbeddings()` / `determineChunkBoundaries()` / `poolTokenEmbeddings()` / `hasTokenOverlap()` / `calculateOverlapTokens()` / `findNearestSegment()` / `averageEmbeddings()` / `charPositionToTokenIndex()` の移動
- `LateChunkingService` の単体テスト新設
- `ChunkingService` の既存テストが引き続きPASSすることの確認
- `packages/shared/src/services/embedding/late-chunking/index.ts` の作成

**含まないもの**:

- `LateChunkingOptions` 型定義の移動（`chunking/types.ts` に残す。型は chunking 層の公開インターフェースの一部）
- `IEmbeddingClient.getTokenEmbeddings()` の追加（TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 が対応）
- `EmbeddingPipeline` との統合（TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 が対応）
- Contextual Embeddings処理の分離（別タスクとして検討）

### 2.4 成果物

| ファイル                                                                                     | 変更種別 | 内容                                             |
| -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts`                | 新規     | Late Chunking処理ロジックの独立クラス            |
| `packages/shared/src/services/embedding/late-chunking/index.ts`                              | 新規     | パッケージエクスポート                           |
| `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` | 新規     | `LateChunkingService` の単体テスト               |
| `packages/shared/src/services/chunking/chunking-service.ts`                                  | 修正     | Late Chunking処理を `LateChunkingService` に委譲 |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`       | 修正     | 委譲後も既存テストがPASS することを確認          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 が完了していること（`IEmbeddingClient.getTokenEmbeddings?()` が定義済みであること）
- `chunking-service.ts` のLate Chunking関連メソッド（L358〜L586）を熟読していること
- TypeScript クラスの依存注入パターン（コンストラクタ注入）を理解していること

### 3.2 依存タスク

| タスクID                                        | 関係               | 理由                                                                         |
| ----------------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001       | 先行タスク（必須） | `IEmbeddingClient.getTokenEmbeddings?()` が定義済みであることが前提          |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | 後続タスク         | 本タスクで作成した `LateChunkingService` を `EmbeddingPipeline` から利用する |

### 3.3 必要な知識

- TypeScript クラスの抽出リファクタリング（Extract Class パターン）
- コンストラクタ注入（依存性注入）の設計
- Vitestでの内部メソッドのテスト手法（`public` に昇格させるか、間接的に検証するか）
- モノレポにおけるパッケージ間の参照（`packages/shared` 内のサブモジュール間参照）

### 3.4 推奨アプローチ

**Extract Class パターン**:

`LateChunkingService` を `ChunkingService` から切り出す。`ChunkingService` はコンストラクタで `LateChunkingService` を受け取るか、内部で生成する。外部APIは変えない。

```typescript
// LateChunkingService の公開API設計
export class LateChunkingService {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly embeddingClient: IEmbeddingClient,
  ) {}

  async applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]> { ... }

  // アルゴリズムメソッドを internal/public に昇格（テスト可能化）
  determineChunkBoundaries(
    chunks: Chunk[],
    text: string,
  ): Array<{ startToken: number; endToken: number }> { ... }

  poolTokenEmbeddings(
    segmentEmbeddings: Array<{ startToken: number; endToken: number; embedding: number[] }>,
    boundaries: Array<{ startToken: number; endToken: number }>,
    strategy: "mean" | "cls" | "attention",
  ): number[][] { ... }
}
```

**`ChunkingService` の変更方針**:

`applyLateChunking()` は `LateChunkingService` に委譲するだけになる。コンストラクタで `LateChunkingService` を遅延生成するか、`embeddingClient` が設定されたタイミングで生成する。

---

## 4. 実行手順（Phase構成）

### Phase 1: 要件定義

- `chunking-service.ts` のLate Chunking関連メソッド一覧を作成する
  - `applyLateChunking()` L358-L397
  - `getTokenEmbeddings()` L402-L429
  - `determineChunkBoundaries()` L434-L447
  - `charPositionToTokenIndex()` L454-L464
  - `poolTokenEmbeddings()` L469-L505
  - `hasTokenOverlap()` L507-L515
  - `calculateOverlapTokens()` L517-L526
  - `findNearestSegment()` L528-L552
  - `averageEmbeddings()` L554-L586
- 各メソッドの依存関係を図示する（`tokenizer` / `embeddingClient` への依存箇所）
- `LateChunkingService` の公開メソッドと内部メソッドを決定する
  - `applyLateChunking()`: public（エントリーポイント）
  - `determineChunkBoundaries()`: public（テスト可能化のため昇格）
  - `poolTokenEmbeddings()`: public（テスト可能化のため昇格）
  - `hasTokenOverlap()` / `calculateOverlapTokens()` / `findNearestSegment()` / `averageEmbeddings()` / `charPositionToTokenIndex()` / `getTokenEmbeddings()`: private（実装詳細）
- `ChunkingService` が `LateChunkingService` をどのように取得するかを決定する（コンストラクタ注入 vs 内部生成）

### Phase 2: 設計

**設計事項1: `LateChunkingService` のコンストラクタシグネチャ**

```typescript
export class LateChunkingService {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly embeddingClient: IEmbeddingClient,
  ) {}
}
```

`tokenizer` と `embeddingClient` は `ChunkingService` からそのまま引き渡す。

**設計事項2: `ChunkingService` への `LateChunkingService` の組み込み方法**

オプションA: コンストラクタで受け取る（DI対応）

```typescript
constructor(
  tokenizer: ITokenizer,
  embeddingClient?: IEmbeddingClient,
  llmClient?: ILLMClient,
  lateChunkingService?: LateChunkingService, // 新規（省略可）
) {
  this.lateChunkingService = lateChunkingService
    ?? (embeddingClient ? new LateChunkingService(tokenizer, embeddingClient) : undefined);
}
```

オプションB: `embeddingClient` が設定された場合に内部で自動生成

オプションAを採用する。理由はテスト時に `LateChunkingService` をモックできるため。

**設計事項3: ディレクトリ構造**

```
packages/shared/src/services/embedding/late-chunking/
  LateChunkingService.ts
  index.ts
  __tests__/
    LateChunkingService.test.ts
```

**設計事項4: テストケース一覧**

| テストID | 対象                                             | 条件                         | 期待動作                                               |
| -------- | ------------------------------------------------ | ---------------------------- | ------------------------------------------------------ |
| SEP-01   | `LateChunkingService.applyLateChunking()`        | 単一チャンク、`mean` pooling | `embeddingDimension > 0` のチャンクを返す              |
| SEP-02   | `LateChunkingService.applyLateChunking()`        | 複数チャンク、`cls` pooling  | 各チャンクに異なる `embeddingDimension` が設定される   |
| SEP-03   | `LateChunkingService.determineChunkBoundaries()` | テキスト先頭チャンク         | `startToken=0` を返す                                  |
| SEP-04   | `LateChunkingService.determineChunkBoundaries()` | テキスト末尾チャンク         | `endToken` が全トークン数以下である                    |
| SEP-05   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりセグメントあり・`mean` | セグメントの平均ベクトルを返す                         |
| SEP-06   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりセグメントなし         | 最近傍セグメントのベクトルにフォールバックする         |
| SEP-07   | `LateChunkingService.poolTokenEmbeddings()`      | `attention` pooling          | トークン重なり数で重み付けされた平均を返す             |
| SEP-08   | `ChunkingService.chunk()`                        | `lateChunking.enabled=true`  | `LateChunkingService.applyLateChunking()` に委譲される |
| SEP-09   | `ChunkingService.chunk()`                        | `lateChunking.enabled=false` | `LateChunkingService` が呼ばれない                     |

### Phase 3: 設計レビュー

- Phase 2 の設計事項 1〜4 をレビューする
- コンストラクタ注入（オプションA）が既存の `ChunkingService` 呼び出し元に影響しないことを確認する（新引数はオプショナルのため影響なし）
- `LateChunkingOptions` 型が `chunking/types.ts` に残ることで循環参照が発生しないことを確認する
- ディレクトリ構造が `packages/shared/src/services/embedding/` の既存サブモジュール（`pipeline/` / `providers/`）と整合していることを確認する
- PASS / MINOR / MAJOR / CRITICAL の判定を行い、MAJOR 以上は Phase 2 に差し戻す

### Phase 4: テスト作成（TDD）

`packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` を新規作成する。

```typescript
import { describe, it, expect, vi } from "vitest";
import { LateChunkingService } from "../LateChunkingService";
import type {
  ITokenizer,
  IEmbeddingClient,
} from "../../../chunking/interfaces";
import type { Chunk } from "../../../chunking/types";

// モックトークナイザーとモック埋め込みクライアントを用意

describe("LateChunkingService", () => {
  describe("applyLateChunking", () => {
    // SEP-01, SEP-02
  });

  describe("determineChunkBoundaries", () => {
    // SEP-03, SEP-04
  });

  describe("poolTokenEmbeddings", () => {
    // SEP-05, SEP-06, SEP-07
  });
});

describe("ChunkingService integration with LateChunkingService", () => {
  // SEP-08, SEP-09
});
```

### Phase 5: 実装

**Step 1: `packages/shared/src/services/embedding/late-chunking/` ディレクトリを作成する**

**Step 2: `LateChunkingService.ts` を作成する**

`chunking-service.ts` の以下のメソッドをそのまま移動する（ロジックの変更なし）:

- `applyLateChunking()` → public
- `determineChunkBoundaries()` → public
- `poolTokenEmbeddings()` → public
- `getTokenEmbeddings()` → private
- `charPositionToTokenIndex()` → private
- `hasTokenOverlap()` → private
- `calculateOverlapTokens()` → private
- `findNearestSegment()` → private
- `averageEmbeddings()` → private

**Step 3: `index.ts` を作成する**

```typescript
export { LateChunkingService } from "./LateChunkingService";
```

**Step 4: `chunking-service.ts` を修正する**

- Late Chunking関連のprivateメソッドをすべて削除する
- `applyLateChunking()` を `this.lateChunkingService.applyLateChunking(...)` への委譲に書き換える
- コンストラクタに `lateChunkingService?: LateChunkingService` を追加する
- `LateChunkingService` のインポートを追加する

**Step 5: 既存の `ChunkingService` テストが PASS することを確認する**

`chunking-service.integration.test.ts` を実行し、Late Chunking関連テストが委譲後もPASSすることを確認する。

### Phase 6: テスト拡充

- SEP-01〜SEP-09 のテストが全件 PASS することを確認する
- `LateChunkingService` を `vi.fn()` でモックし、`ChunkingService` が正しく委譲することを確認するテストを追加する
- `lateChunkingService` 引数を省略した場合に自動生成される動作テストを追加する

### Phase 7: カバレッジ確認

```bash
pnpm --filter @repo/shared test --coverage -- LateChunkingService
pnpm --filter @repo/shared test --coverage -- chunking-service
```

- `LateChunkingService` の全public・privateメソッドがカバーされていることを確認する
- `ChunkingService` の委譲ロジックがカバーされていることを確認する

### Phase 8: リファクタリング

- `LateChunkingService.ts` に JSDoc コメントを付与する（移動前に `chunking-service.ts` にあったコメントを活用）
- テストの重複モックセットアップを `beforeEach` に集約する
- `ChunkingService` の `applyLateChunking()` が委譲のみになったことを確認し、残留ロジックがないか点検する
- 不要な import の削除（`chunking-service.ts` から Late Chunking用の型 import が不要になる場合）

### Phase 9: 品質保証

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/shared lint

# テスト（全件）
pnpm --filter @repo/shared test

# LateChunkingService のテストのみ
pnpm --filter @repo/shared test -- LateChunkingService

# ChunkingService の統合テスト
pnpm --filter @repo/shared test -- chunking-service.integration
```

### Phase 10: 最終レビュー

- Phase 2 の設計事項 1〜4 がすべて実装に反映されていることを確認する
- SEP-01〜SEP-09 が全件 PASS していることを確認する
- `chunking-service.ts` からLate Chunking固有ロジックが完全に除去されていることを確認する
- `LateChunkingService` 単体でテスト可能であること（`ChunkingService` のモックが不要）を確認する
- PASS / MINOR は Phase 11 へ進む。MAJOR は Phase 8 に差し戻す

### Phase 11: 手動テスト

統合テスト（SEP-01〜SEP-09）が主検証手段のため、手動テストは最小限とする。

```bash
# Late Chunking オプション有効でのチャンキング動作確認
# metadata.lateChunking.applied === true であることを確認
# metadata.lateChunking.embeddingDimension > 0 であることを確認
pnpm --filter @repo/shared test -- --reporter=verbose chunking-service
```

### Phase 12: ドキュメント更新

本タスクで変更した内容を以下のドキュメントに反映する。

- `LateChunkingService.ts` に以下の JSDoc を追加する
  - クラスレベル: Late Chunkingの原理と本クラスの責務を説明
  - `applyLateChunking()`: パラメータと戻り値の説明
  - `determineChunkBoundaries()` / `poolTokenEmbeddings()`: アルゴリズムの概要と座標系（文字位置 → トークン位置）の説明
- `packages/shared/src/services/embedding/late-chunking/index.ts` のコメントに「Late Chunking処理の責務を担うサービス層」と記載する
- 本タスク仕様書（`TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md`）の「ステータス」を「実施済み」に更新する
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md` の「依然として残る本体スコープ」から「`packages/shared/src/services/embedding/late-chunking/` への責務分離」を削除する

### Phase 13: PR作成

ユーザーの明示的承認を得た後に実施する。

```bash
# ブランチ作成
git checkout -b refactor/emb-late-chunking-service-separation-001

# コミット
git commit -m "refactor(embedding): TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 Late Chunking処理をLateChunkingServiceに責務分離"

# push
git push -u origin refactor/emb-late-chunking-service-separation-001

# PR 作成
gh pr create \
  --title "refactor(embedding): TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 Late Chunking責務分離・専用サービス層抽出" \
  --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts` が存在する
- [ ] `LateChunkingService` が `applyLateChunking()` / `determineChunkBoundaries()` / `poolTokenEmbeddings()` を public メソッドとして持つ
- [ ] `ChunkingService.applyLateChunking()` が `LateChunkingService.applyLateChunking()` に委譲している
- [ ] `ChunkingService` のコンストラクタが `lateChunkingService?: LateChunkingService` を受け入れる
- [ ] SEP-01〜SEP-09 のテストが全件 PASS している
- [ ] `LateChunkingService` 単体でテストが実行可能である（`ChunkingService` への依存なし）

### 後方互換要件

- [ ] `ChunkingService.chunk()` の入出力シグネチャが変化しない
- [ ] 既存の `chunking-service.integration.test.ts` がすべて PASS している
- [ ] `ChunkingService` の既存のコンストラクタ呼び出し（`new ChunkingService(tokenizer, embeddingClient, llmClient)`）が型エラーなしで動作する

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする
- [ ] `LateChunkingService` の全public・privateメソッドがカバレッジで網羅されている
- [ ] `chunking-service.ts` からLate Chunking固有のアルゴリズムメソッドが完全に除去されている
- [ ] `any` 型の新規使用がない

### ドキュメント要件

- [ ] `LateChunkingService` に クラスおよびメソッドレベルの JSDoc コメントが付与されている
- [ ] 本タスク仕様書のステータスが「実施済み」に更新されている
- [ ] `UNASSIGNED-EMB-005` の残課題リストが更新されている

---

## 6. 検証方法

### テストケース

| テストID | 対象                                             | 入力/操作                           | 期待結果                                                       | 備考                |
| -------- | ------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------- | ------------------- |
| SEP-01   | `LateChunkingService.applyLateChunking()`        | 単一チャンク、`mean` pooling        | `metadata.lateChunking.applied=true`、`embeddingDimension > 0` | 基本動作            |
| SEP-02   | `LateChunkingService.applyLateChunking()`        | 複数チャンク、`cls` pooling         | 各チャンクの `embeddingDimension > 0`                          | 複数チャンク        |
| SEP-03   | `LateChunkingService.determineChunkBoundaries()` | チャンク `position.start=0`         | `startToken=0`                                                 | 先頭境界            |
| SEP-04   | `LateChunkingService.determineChunkBoundaries()` | チャンク `position.end=text.length` | `endToken <= totalTokens`                                      | 末尾境界            |
| SEP-05   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりセグメントあり、`mean`        | セグメントの数値平均ベクトル                                   | meanプーリング      |
| SEP-06   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりなし                          | 最近傍セグメントのベクトル（フォールバック）                   | フォールバック      |
| SEP-07   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりあり、`attention`             | トークン重なり数で重み付け                                     | attentionプーリング |
| SEP-08   | `ChunkingService.chunk()`                        | `lateChunking.enabled=true`         | `LateChunkingService.applyLateChunking()` が1回呼ばれる        | 委譲確認            |
| SEP-09   | `ChunkingService.chunk()`                        | `lateChunking.enabled=false`        | `LateChunkingService` が呼ばれない                             | 非適用確認          |

### 実行コマンド

```bash
# LateChunkingService の全テスト
pnpm --filter @repo/shared test -- LateChunkingService

# ChunkingService の統合テスト（委譲確認）
pnpm --filter @repo/shared test -- chunking-service.integration

# カバレッジ付き実行
pnpm --filter @repo/shared test --coverage -- LateChunkingService
```

---

## 7. リスクと対策

| リスク                                                                                                        | 影響度 | 発生確率 | 対策                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChunkingService` コンストラクタ変更が呼び出し元に影響する                                                    | 中     | 低       | 新引数 `lateChunkingService` はオプショナルにし、既存の3引数呼び出しを壊さない                                                                                                                       |
| `LateChunkingOptions` 型の import が `embedding/late-chunking/` から `chunking/types.ts` への逆方向参照になる | 高     | 中       | `LateChunkingOptions` は `chunking/types.ts` に残す。`LateChunkingService` が `chunking/types.ts` を参照するのは一方向参照のため問題なし                                                             |
| `chunking-service.ts` のメソッド移動時にアルゴリズムのバグを混入する                                          | 高     | 低       | Phase 5 ではロジックをコピー移動し、テスト（SEP-01〜SEP-07）を先に書いてから移動する（TDDによる保護）                                                                                                |
| `LateChunkingService` のプライベートメソッドが実質的にテストされない                                          | 中     | 中       | `public` に昇格した `determineChunkBoundaries()` / `poolTokenEmbeddings()` の境界値テストで内部の private メソッド（`hasTokenOverlap` / `findNearestSegment` 等）をカバーする                        |
| `embedding/late-chunking/` から `chunking/` への参照が循環参照を引き起こす                                    | 高     | 低       | 依存方向を `chunking → embedding/late-chunking` ではなく `chunking-service.ts` が `embedding/late-chunking` を参照する方向にする。`chunking/interfaces.ts` は `embedding/late-chunking` を参照しない |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                                          | パス                                                                                   | 説明                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| UNASSIGNED-EMB-005 review wave index            | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`                          | 本タスクの発見元                   |
| TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001       | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001.md`       | 先行タスク（インターフェース拡張） |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001 | `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001.md` | 後続タスク（パイプライン統合）     |

### 関連ファイル

| ファイル                                                                                     | 変更種別 | 内容                          |
| -------------------------------------------------------------------------------------------- | -------- | ----------------------------- |
| `packages/shared/src/services/chunking/chunking-service.ts`                                  | 修正     | Late Chunking処理を委譲に変更 |
| `packages/shared/src/services/embedding/late-chunking/LateChunkingService.ts`                | 新規     | Late Chunking処理ロジック     |
| `packages/shared/src/services/embedding/late-chunking/index.ts`                              | 新規     | エクスポート                  |
| `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` | 新規     | 単体テスト                    |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`       | 修正     | 委譲後の動作確認              |

### 対象コードの位置

| メソッド名                   | 現在の位置                      | 移動先                             |
| ---------------------------- | ------------------------------- | ---------------------------------- |
| `applyLateChunking()`        | `chunking-service.ts` L358-L397 | `LateChunkingService.ts`           |
| `getTokenEmbeddings()`       | `chunking-service.ts` L402-L429 | `LateChunkingService.ts` (private) |
| `determineChunkBoundaries()` | `chunking-service.ts` L434-L447 | `LateChunkingService.ts` (public)  |
| `charPositionToTokenIndex()` | `chunking-service.ts` L454-L464 | `LateChunkingService.ts` (private) |
| `poolTokenEmbeddings()`      | `chunking-service.ts` L469-L505 | `LateChunkingService.ts` (public)  |
| `hasTokenOverlap()`          | `chunking-service.ts` L507-L515 | `LateChunkingService.ts` (private) |
| `calculateOverlapTokens()`   | `chunking-service.ts` L517-L526 | `LateChunkingService.ts` (private) |
| `findNearestSegment()`       | `chunking-service.ts` L528-L552 | `LateChunkingService.ts` (private) |
| `averageEmbeddings()`        | `chunking-service.ts` L554-L586 | `LateChunkingService.ts` (private) |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                                         | 症状                                                                                                                                                                                                | 原因                                                                                                                  | 対応                                                                                                                                                                                                          | 再発防止                                                                                                                                     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Late Chunking内部処理の観測可能性の低さ                                          | `chunking-service.ts` の `private` メソッドでは `poolTokenEmbeddings()` の重み計算等を直接検証できず、バグが隠れやすい                                                                              | TypeScriptの `private` により直接アクセス不可。`ChunkingService` 経由では入出力のみ検証でき、中間状態が見えない       | `LateChunkingService` への抽出で `public` メソッドに昇格させ、直接テスト可能にする。内部処理も境界値テストで間接的にカバーする                                                                                | 新サービスクラスの設計時は「テスト可能性」を公開API設計の判断基準の一つとして明示する                                                        |
| 座標系変換の複雑性（文字位置 → トークン位置 → セグメント位置の3層変換）          | `charPositionToTokenIndex()` の近似精度がトークナイザー実装に依存し、boundary変換の正確性をモックで検証しにくい                                                                                     | `encode(text.slice(0, charPosition)).length` という近似は文字エンコーディングやサブワードトークナイザーで誤差が生じる | `determineChunkBoundaries()` のテスト（SEP-03, SEP-04）では「`startToken >= 0` かつ `endToken <= totalTokens`」という範囲チェックで許容する。厳密な一致ではなく単調性を検証する                               | `LateChunkingService.determineChunkBoundaries()` の JSDoc に「トークナイザー実装による近似誤差がある」と明記し、呼び出し元の期待値を調整する |
| `embedding/late-chunking/` が `chunking/types.ts` を参照する場合の循環参照リスク | `LateChunkingOptions` 型が `chunking/types.ts` に存在するため、`embedding/late-chunking/LateChunkingService.ts` がこれを import すると `chunking → embedding → chunking` の循環が生じる可能性がある | モノレポのサブモジュール間参照が双方向になることで TypeScript のコンパイルが循環 import エラーを検出する              | `LateChunkingOptions` を `chunking/types.ts` に残し、`chunking-service.ts` が `embedding/late-chunking/` を参照する一方向にする。`embedding/late-chunking/` は `chunking/` の型を import してよい（逆は不可） | Phase 3 の設計レビューに「import の方向チェック」を必須項目として追加する                                                                    |
| `ChunkingService` コンストラクタの後方互換維持                                   | `lateChunkingService` を追加するとコンストラクタオーバーロードや引数順序の変更が発生する                                                                                                            | TypeScript のコンストラクタはオーバーロードが複雑                                                                     | 4番目のオプショナル引数として追加し、既存の3引数呼び出しを壊さない。引数の順序は `tokenizer, embeddingClient, llmClient, lateChunkingService`                                                                 | コンストラクタ変更の際は「既存呼び出し元の確認」をPhase 1の必須ステップとして明記する                                                        |

### 発見経緯

UNASSIGNED-EMB-005 の review wave（2026-04-19）において、`chunking-service.ts` が638行に達し、Late Chunking固有のアルゴリズム（`poolTokenEmbeddings` / `hasTokenOverlap` 等）が `ChunkingService` の private メソッドとして埋没していることが確認された。Phase 10 のfinal reviewにて「Late Chunkingの観測可能性が低くmockでは困難」と明記され、責務分離の必要性が確定した。review waveのスコープが「コードの改善」に限定されており、クラス抽出は対象外として本タスクが分離された。
