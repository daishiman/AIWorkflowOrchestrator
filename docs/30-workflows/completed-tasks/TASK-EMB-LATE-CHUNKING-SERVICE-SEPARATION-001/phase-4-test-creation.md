# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 4                                                            |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                |
| タスク種別 | NON_VISUAL code task                                         |
| 目的       | SEP-01〜SEP-09 を TDD Red フェーズで新規作成し失敗を確認する |
| 前Phase    | [phase-3-design-review.md](phase-3-design-review.md)         |
| 次Phase    | [phase-5-implementation.md](phase-5-implementation.md)       |

> current fact: 本 Phase の test target は `__tests__/chunking-late-chunking-adapter.test.ts` として着地している。

## 目的

Phase 2 設計事項 4 で固定した SEP-01〜SEP-09 を、`packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` に新規作成する。TDD Red フェーズとして、`LateChunkingService.ts` が未実装の状態でテストを書き、全件が FAIL することを確認する。テストはロジックの記述を含まず、Phase 5 の Green フェーズへ完全に引き渡せる粒度で固定する。

## private method テスト方針の明記【必須】

| 方針                    | 本タスクでの採用 | 理由                                                                                                                                                                                 |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| public API 経由（推奨） | 採用             | Phase 1 で 3 メソッド（`applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`）を public 昇格済み。残 6 メソッドは public 3 メソッドの境界値テストで間接カバーする |
| キャスト経由            | 不採用           | public 昇格済みのためキャストは不要                                                                                                                                                  |

本タスクでは public API 経由の検証のみを採用し、`(service as unknown as LateChunkingServicePrivate).method()` 形式のアクセスは禁止する。

## 実行タスク

### Task 1: テストファイル新規作成

`packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` を新規作成する。ディレクトリが存在しない場合は作成する。

### Task 2: Mock クラスの実装

2 つの Mock クラスをテストファイル内に定義する。

| Mock クラス           | 実装するインターフェース                       | 実装内容                                                                                                                                |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `MockTokenizer`       | `ITokenizer`（`chunking/interfaces.ts`）       | `encode(text)` は `text.split("").map((_, i) => i + 1)` を返す。`decode(tokenIds)` は `String.fromCharCode(64 + id)` を連結する         |
| `MockEmbeddingClient` | `IEmbeddingClient`（`chunking/interfaces.ts`） | `getEmbedding(text)` は `[0.1, 0.2, 0.3]` を返す。`getTokenEmbeddings?(text, tokenIds)` は `tokenIds.map(() => [0.1, 0.2, 0.3])` を返す |

### Task 3: `beforeEach` による共通セットアップ

`describe("LateChunkingService")` ブロック内で以下を `beforeEach` に集約する。

```typescript
let tokenizer: MockTokenizer;
let embeddingClient: MockEmbeddingClient;
let service: LateChunkingService;

beforeEach(() => {
  tokenizer = new MockTokenizer();
  embeddingClient = new MockEmbeddingClient();
  service = new LateChunkingService(tokenizer, embeddingClient);
});
```

`describe("ChunkingService integration with LateChunkingService")` ブロック内では、`LateChunkingService` のモックを `vi.fn()` で構築し、`ChunkingService` コンストラクタ第 4 引数に注入する。

### Task 4: SEP-01〜SEP-07（LateChunkingService 単体）の記述

以下 7 件のテストを TDD Red として記述する。ロジック実装は行わず、入力生成・呼び出し・Assertion のみ記述する。

| テストID | ファイル内テスト名                                                                   | 対象メソッド               | 入力条件                                              | Assertion                                                                                                    |
| -------- | ------------------------------------------------------------------------------------ | -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| SEP-01   | `SEP-01: 単一チャンク、mean pooling で applied=true を返す`                          | `applyLateChunking`        | `chunks.length===1`、`options.poolingStrategy="mean"` | `result[0].metadata.lateChunking.applied === true`、`result[0].metadata.lateChunking.embeddingDimension > 0` |
| SEP-02   | `SEP-02: 複数チャンク、cls pooling で各チャンクに embeddingDimension > 0 を設定する` | `applyLateChunking`        | `chunks.length===3`、`options.poolingStrategy="cls"`  | `result.length === 3`、各 `result[i].metadata.lateChunking.embeddingDimension > 0`                           |
| SEP-03   | `SEP-03: position.start=0 のチャンクで startToken=0 を返す`                          | `determineChunkBoundaries` | `chunks[0].position.start === 0`                      | `boundaries[0].startToken === 0`                                                                             |
| SEP-04   | `SEP-04: position.end=text.length のチャンクで endToken <= totalTokens を返す`       | `determineChunkBoundaries` | `chunks[last].position.end === text.length`           | `boundaries[last].endToken <= tokenizer.encode(text).length`                                                 |
| SEP-05   | `SEP-05: 重なりあり・mean で数値平均ベクトルを返す`                                  | `poolTokenEmbeddings`      | 重なりセグメント 2 件、`strategy="mean"`              | 戻り値が各セグメントの要素ごとの算術平均に一致                                                               |
| SEP-06   | `SEP-06: 重なりなしで最近傍セグメントのベクトルにフォールバックする`                 | `poolTokenEmbeddings`      | 境界と重ならないセグメントのみ                        | 戻り値が `findNearestSegment` が返すセグメントの `embedding` に一致（public 観測値で確認）                   |
| SEP-07   | `SEP-07: 重なりあり・attention でトークン重なり数で重み付けした平均を返す`           | `poolTokenEmbeddings`      | 重なりセグメント 2 件、`strategy="attention"`         | 戻り値が `overlap_tokens` で重み付けした加重平均に一致                                                       |

### Task 5: SEP-08〜SEP-09（ChunkingService 委譲確認）の記述

`describe("ChunkingService integration with LateChunkingService")` ブロックで以下 2 件を記述する。

| テストID | ファイル内テスト名                                                       | 入力条件                                 | Assertion                                                                          |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| SEP-08   | `SEP-08: lateChunking.enabled=true で applyLateChunking が 1 回呼ばれる` | `options.lateChunking.enabled === true`  | `mockLateChunkingService.applyLateChunking` が `toHaveBeenCalledTimes(1)` を満たす |
| SEP-09   | `SEP-09: lateChunking.enabled=false で applyLateChunking が呼ばれない`   | `options.lateChunking.enabled === false` | `mockLateChunkingService.applyLateChunking` が `not.toHaveBeenCalled()` を満たす   |

SEP-08/09 では `vi.fn().mockResolvedValue([])` で `applyLateChunking` をスタブし、`new ChunkingService(tokenizer, embeddingClient, undefined, mockLateChunkingService)` の形で注入する。

### Task 6: Red 状態の確認

テスト実行により全 9 件が FAIL することを確認し、エラーメッセージを記録する。

```bash
pnpm --filter @repo/shared test -- LateChunkingService
```

期待結果:

- `LateChunkingService.ts` が未作成のため `Cannot find module '../LateChunkingService'` エラーが発生する、もしくはクラスが未定義で全件 FAIL する
- Red 状態のテスト出力を `outputs/phase-4/test-scenarios.md` に貼り付ける

## テストマトリクス

| TC 番号 | ファイル内テスト名                                                                   | 対象メソッド/関数                               | 結果（Red） |
| ------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------- |
| SEP-01  | `SEP-01: 単一チャンク、mean pooling で applied=true を返す`                          | `LateChunkingService.applyLateChunking`         | FAIL        |
| SEP-02  | `SEP-02: 複数チャンク、cls pooling で各チャンクに embeddingDimension > 0 を設定する` | `LateChunkingService.applyLateChunking`         | FAIL        |
| SEP-03  | `SEP-03: position.start=0 のチャンクで startToken=0 を返す`                          | `LateChunkingService.determineChunkBoundaries`  | FAIL        |
| SEP-04  | `SEP-04: position.end=text.length のチャンクで endToken <= totalTokens を返す`       | `LateChunkingService.determineChunkBoundaries`  | FAIL        |
| SEP-05  | `SEP-05: 重なりあり・mean で数値平均ベクトルを返す`                                  | `LateChunkingService.poolTokenEmbeddings`       | FAIL        |
| SEP-06  | `SEP-06: 重なりなしで最近傍セグメントのベクトルにフォールバックする`                 | `LateChunkingService.poolTokenEmbeddings`       | FAIL        |
| SEP-07  | `SEP-07: 重なりあり・attention でトークン重なり数で重み付けした平均を返す`           | `LateChunkingService.poolTokenEmbeddings`       | FAIL        |
| SEP-08  | `SEP-08: lateChunking.enabled=true で applyLateChunking が 1 回呼ばれる`             | `ChunkingService.chunk` → `lateChunkingService` | FAIL        |
| SEP-09  | `SEP-09: lateChunking.enabled=false で applyLateChunking が呼ばれない`               | `ChunkingService.chunk` → `lateChunkingService` | FAIL        |

## Mock フィクスチャ構成

| フィクスチャ                             | 内容                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `MockTokenizer.encode`                   | 入力文字列を 1 文字 1 トークンで連番化する（`[1, 2, 3, ...]`）                               |
| `MockTokenizer.decode`                   | トークン ID を `String.fromCharCode(64 + id)` で変換し連結する                               |
| `MockEmbeddingClient.getEmbedding`       | 常に `[0.1, 0.2, 0.3]` を返す                                                                |
| `MockEmbeddingClient.getTokenEmbeddings` | 入力 `tokenIds` の長さ分、`[0.1, 0.2, 0.3]` を返す                                           |
| `mockLateChunkingService`                | `{ applyLateChunking: vi.fn().mockResolvedValue([]) }` を `LateChunkingService` 型にキャスト |

## Assertion パターン

| パターン             | 使用テスト     | 記述例                                                                                   |
| -------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| プロパティ等価       | SEP-01, SEP-03 | `expect(result[0].metadata.lateChunking.applied).toBe(true);`                            |
| 数値比較             | SEP-02, SEP-04 | `expect(dim).toBeGreaterThan(0);` / `expect(endToken).toBeLessThanOrEqual(totalTokens);` |
| 配列要素等価（近似） | SEP-05, SEP-07 | `expect(result[0]).toBeCloseTo(expectedMean[0], 5);` を要素ごとに適用                    |
| 参照先一致           | SEP-06         | `expect(result).toEqual(nearestSegment.embedding);`                                      |
| spy 呼び出し回数     | SEP-08         | `expect(mockLateChunkingService.applyLateChunking).toHaveBeenCalledTimes(1);`            |
| spy 非呼び出し       | SEP-09         | `expect(mockLateChunkingService.applyLateChunking).not.toHaveBeenCalled();`              |

## 統合テスト連携

- SEP-08 / SEP-09 は `ChunkingService` の委譲確認として統合テスト側に固定する。
- Phase 5 の Green では `chunking-service.integration.test.ts` を既存回帰と同時に通す。
- Phase 10 では本 Phase の SEP 定義と実装済み統合テストの一致を確認する。

## 参照資料

| 種別       | パス                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 前Phase    | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-3-design-review.md` |
| 設計事項 4 | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001/phase-2-design.md`        |
| 対象コード | `packages/shared/src/services/chunking/chunking-service.ts` L358-L586                      |
| 型参照     | `packages/shared/src/services/chunking/types.ts`                                           |
| Port 参照  | `packages/shared/src/services/chunking/interfaces.ts`                                      |
| skill      | `.claude/skills/task-specification-creator/references/phase-template-execution.md`         |

## Canonical Artifacts

| Artifact       | パス                                | 必須 |
| -------------- | ----------------------------------- | ---- |
| test scenarios | `outputs/phase-4/test-scenarios.md` | 必須 |
| mock fixtures  | `outputs/phase-4/mock-fixtures.md`  | 必須 |

`outputs/phase-4/test-scenarios.md` には SEP-01〜SEP-09 の入力条件・Assertion・Red 実行結果を記録する。`outputs/phase-4/mock-fixtures.md` には `MockTokenizer` / `MockEmbeddingClient` / `mockLateChunkingService` の構成と意図を記録する。

## TDD 検証セクション（Red 確認）

### Red 確認コマンド

```bash
pnpm install --frozen-lockfile
pnpm --filter @repo/shared test -- LateChunkingService 2>&1 | tee outputs/phase-4/red-run.log
```

### 期待される出力

- `Cannot find module '../LateChunkingService'` または `LateChunkingService is not defined` が表示される
- 9 件すべてが `FAIL` 状態である
- `Tests: 9 failed, 9 total` のサマリーが出力される

### Red 状態記録

| 項目         | 記録先                              |
| ------------ | ----------------------------------- |
| 実行コマンド | `outputs/phase-4/test-scenarios.md` |
| 実行ログ     | `outputs/phase-4/red-run.log`       |
| FAIL 件数    | `outputs/phase-4/test-scenarios.md` |

## 成果物

| 成果物         | パス                                |
| -------------- | ----------------------------------- |
| test scenarios | `outputs/phase-4/test-scenarios.md` |
| mock fixtures  | `outputs/phase-4/mock-fixtures.md`  |

## 完了条件

- [ ] `packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts` を新規作成した
- [ ] `MockTokenizer` / `MockEmbeddingClient` の 2 Mock クラスを定義した
- [ ] `beforeEach` による共通セットアップを配置した
- [ ] SEP-01〜SEP-07（LateChunkingService 単体）7 テストを記述した
- [ ] SEP-08〜SEP-09（ChunkingService 委譲）2 テストを記述した
- [ ] private method テスト方針（public API 経由）を本 Phase 仕様書に明記した
- [ ] Assertion パターン 6 種を全テストに適用した
- [ ] `pnpm --filter @repo/shared test -- LateChunkingService` で 9 件すべて FAIL する Red 状態を確認した
- [ ] `outputs/phase-4/test-scenarios.md` に Red 実行結果を記録した
- [ ] `outputs/phase-4/mock-fixtures.md` に Mock 構成を記録した

## タスク100%実行確認【必須】

- [ ] Task 1: テストファイル新規作成 完了
- [ ] Task 2: Mock クラスの実装 完了
- [ ] Task 3: beforeEach 共通セットアップ 完了
- [ ] Task 4: SEP-01〜SEP-07 の記述 完了
- [ ] Task 5: SEP-08〜SEP-09 の記述 完了
- [ ] Task 6: Red 状態の確認 完了

## Phase末端アクション【必須】

1. `outputs/phase-4/test-scenarios.md` / `outputs/phase-4/mock-fixtures.md` を作成し、Canonical Artifacts 一覧に登録する
2. Red 実行ログ（`outputs/phase-4/red-run.log`）を保存し、9 件 FAIL が再現できる状態を固定する
3. `index.md` の Phase 4 ステータスを `completed` に更新する
4. Phase 5 への handoff 情報（未実装の `LateChunkingService.ts` の期待シグネチャ）を `outputs/phase-4/test-scenarios.md` に明記する
5. コミット・push・PR 作成は実施しない

## 依存関係

| 依存関係             | 内容                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 前提 Phase           | Phase 3（設計レビュー）が PASS または MINOR 判定で完了していること                                                               |
| 前提成果物           | Phase 2 設計事項 4 の SEP-01〜SEP-09 テストケース一覧が `outputs/phase-2/validation-path.md` に固定されていること                |
| 前提コード           | `packages/shared/src/services/chunking/types.ts` に `Chunk` / `LateChunkingOptions` が存在すること                               |
| 前提インターフェース | `packages/shared/src/services/chunking/interfaces.ts` に `ITokenizer` と `IEmbeddingClient.getTokenEmbeddings?()` が存在すること |
| 後続 Phase           | Phase 5（実装・TDD Green）が本 Phase の Red 状態を Green に転換する                                                              |
