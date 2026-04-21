# Phase 2: 設計

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Phase    | 2                                                    |
| タスクID | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001        |
| 前Phase  | [phase-1-requirements.md](phase-1-requirements.md)   |
| 次Phase  | [phase-3-design-review.md](phase-3-design-review.md) |

> current fact: 設計時想定の `LateChunkingService` は、実装では `ChunkingLateChunkingAdapter` に読み替える。

## 目的

Phase 1 で固定した 9 メソッド inventory と public/private 分類をもとに、`LateChunkingService` のコンストラクタシグネチャ・`ChunkingService` への組み込み方法・ディレクトリ構造・テストケース一覧（SEP-01〜SEP-09）を設計する。

## 設計方針

| 観点         | 方針                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 抽出パターン | Extract Class パターン。ロジックはコピー移動のみ（改変禁止）                                                                   |
| DI 境界      | `ITokenizer` / `IEmbeddingClient` は `chunking/interfaces.ts` に残し、`LateChunkingService` は `chunking/interfaces.ts` を参照 |
| 型配置       | `LateChunkingOptions` は `chunking/types.ts` に残す（逆方向参照禁止）                                                          |
| 後方互換     | `ChunkingService` コンストラクタの既存 3 引数呼び出しを壊さない                                                                |
| テスト観測性 | public 昇格 3 メソッド（`applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`）を単体テスト可能にする       |

---

## 設計事項 1: `LateChunkingService` のコンストラクタシグネチャ

```typescript
import type {
  ITokenizer,
  IEmbeddingClient,
} from "../../chunking/interfaces";
import type {
  Chunk,
  LateChunkingOptions,
} from "../../chunking/types";

export class LateChunkingService {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly embeddingClient: IEmbeddingClient,
  ) {}

  // public メソッド
  async applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]> {
    // ロジック本体（chunking-service.ts L358-L397 からコピー移動）
  }

  determineChunkBoundaries(
    chunks: Chunk[],
    text: string,
  ): Array<{ startToken: number; endToken: number }> {
    // chunking-service.ts L434-L447 からコピー移動
  }

  poolTokenEmbeddings(
    segmentEmbeddings: Array<{
      startToken: number;
      endToken: number;
      embedding: number[];
    }>,
    boundaries: Array<{ startToken: number; endToken: number }>,
    strategy: "mean" | "cls" | "attention",
  ): number[][] {
    // chunking-service.ts L469-L505 からコピー移動
  }

  // private メソッド（6 件）
  private async getTokenEmbeddings(text: string, tokenIds: number[]): Promise<number[][]> { ... }
  private charPositionToTokenIndex(text: string, charPosition: number): number { ... }
  private hasTokenOverlap(segment: { startToken: number; endToken: number }, boundary: { startToken: number; endToken: number }): boolean { ... }
  private calculateOverlapTokens(segment: { startToken: number; endToken: number }, boundary: { startToken: number; endToken: number }): number { ... }
  private findNearestSegment(boundary: { startToken: number; endToken: number }, segments: Array<{ startToken: number; endToken: number; embedding: number[] }>): { startToken: number; endToken: number; embedding: number[] } | null { ... }
  private averageEmbeddings(embeddings: number[][]): number[] { ... }
}
```

### DI 境界の型配置判断

| 型                    | 配置先                                 | 理由                                                                               |
| --------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `ITokenizer`          | `chunking/interfaces.ts`（移動しない） | 既存の chunking 層で共有される Port 定義のため                                     |
| `IEmbeddingClient`    | `chunking/interfaces.ts`（移動しない） | 先行タスクで `getTokenEmbeddings?()` が追加済み。chunking 層の公開インターフェース |
| `LateChunkingOptions` | `chunking/types.ts`（移動しない）      | chunking 層の公開インターフェースの一部。逆方向参照禁止ルールのため維持            |
| `Chunk`               | `chunking/types.ts`（移動しない）      | 既存の chunking 層の公開型                                                         |

---

## 設計事項 2: `ChunkingService` への `LateChunkingService` の組み込み方法

### オプションA（採用）: コンストラクタ第 4 引数で受け取る

```typescript
import { LateChunkingService } from "../embedding/late-chunking";

export class ChunkingService {
  private readonly lateChunkingService?: LateChunkingService;

  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly embeddingClient?: IEmbeddingClient,
    private readonly llmClient?: ILLMClient,
    lateChunkingService?: LateChunkingService,
  ) {
    this.lateChunkingService =
      lateChunkingService ??
      (embeddingClient
        ? new LateChunkingService(tokenizer, embeddingClient)
        : undefined);
  }

  // applyLateChunking は委譲のみに簡素化
  private async applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]> {
    if (!this.lateChunkingService) {
      return chunks; // embeddingClient 未設定時の既存挙動を維持
    }
    return this.lateChunkingService.applyLateChunking(text, chunks, options);
  }
}
```

### 採否比較

| 案          | 方法                                     | 採否   | 理由                                                                                                      |
| ----------- | ---------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| オプションA | コンストラクタ第 4 引数で受け取る        | 採用   | テスト時に `vi.fn()` 化した `LateChunkingService` を注入できる。既存の 3 引数呼び出しを破壊しない         |
| オプションB | `embeddingClient` 設定時に内部で自動生成 | 不採用 | SEP-08/SEP-09（委譲確認テスト）で `LateChunkingService` のメソッド呼び出しを spy できず、観測性が不足する |

---

## 設計事項 3: ディレクトリ構造

```
packages/shared/src/services/embedding/
├── pipeline/                    # 既存
├── providers/                   # 既存
└── late-chunking/               # 新設
    ├── LateChunkingService.ts   # 新規
    ├── index.ts                 # 新規（パッケージエクスポート）
    └── __tests__/
        └── LateChunkingService.test.ts  # 新規
```

### `index.ts` の内容

```typescript
/**
 * Late Chunking 処理の責務を担うサービス層。
 * ChunkingService から抽出された独立アルゴリズム層。
 */
export { LateChunkingService } from "./LateChunkingService";
```

### 参照方向マップ（逆方向参照禁止の固定）

```
chunking/chunking-service.ts
    ↓ import
embedding/late-chunking/LateChunkingService.ts
    ↓ import
chunking/interfaces.ts  (ITokenizer, IEmbeddingClient)
chunking/types.ts        (Chunk, LateChunkingOptions)
```

- `chunking → embedding/late-chunking` の単方向のみ許可
- `embedding/late-chunking → chunking`（types/interfaces 参照）は許可
- `chunking/interfaces.ts` や `chunking/types.ts` が `embedding/late-chunking` を import することは禁止

---

## 設計事項 4: テストケース一覧（SEP-01〜SEP-09）

### `LateChunkingService` 単体テスト

| テストID | 対象メソッド                                     | 入力条件                                | 期待動作                                                       |
| -------- | ------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------- |
| SEP-01   | `LateChunkingService.applyLateChunking()`        | 単一チャンク、`pooling="mean"`          | `metadata.lateChunking.applied=true`、`embeddingDimension > 0` |
| SEP-02   | `LateChunkingService.applyLateChunking()`        | 複数チャンク、`pooling="cls"`           | 各チャンクの `embeddingDimension > 0`                          |
| SEP-03   | `LateChunkingService.determineChunkBoundaries()` | チャンク `position.start=0`             | `startToken=0`                                                 |
| SEP-04   | `LateChunkingService.determineChunkBoundaries()` | チャンク `position.end=text.length`     | `endToken <= totalTokens`                                      |
| SEP-05   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりセグメントあり、`strategy="mean"` | セグメントの数値平均ベクトル                                   |
| SEP-06   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりなし                              | 最近傍セグメントのベクトル（フォールバック）                   |
| SEP-07   | `LateChunkingService.poolTokenEmbeddings()`      | 重なりあり、`strategy="attention"`      | トークン重なり数で重み付けされた平均                           |

### `ChunkingService` 統合テスト（委譲確認）

| テストID | 対象                      | 入力条件                     | 期待動作                                                  |
| -------- | ------------------------- | ---------------------------- | --------------------------------------------------------- |
| SEP-08   | `ChunkingService.chunk()` | `lateChunking.enabled=true`  | `lateChunkingService.applyLateChunking()` が 1 回呼ばれる |
| SEP-09   | `ChunkingService.chunk()` | `lateChunking.enabled=false` | `lateChunkingService.applyLateChunking()` が呼ばれない    |

### モック実装雛型（Phase 4 でのテスト作成高速化）

```typescript
// packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LateChunkingService } from "../LateChunkingService";
import type {
  ITokenizer,
  IEmbeddingClient,
} from "../../../chunking/interfaces";
import type { Chunk, LateChunkingOptions } from "../../../chunking/types";

// モックトークナイザー
class MockTokenizer implements ITokenizer {
  encode(text: string): number[] {
    return text.split("").map((_, i) => i + 1);
  }

  decode(tokenIds: number[]): string {
    return tokenIds.map((id) => String.fromCharCode(64 + id)).join("");
  }

  // 戻り値を制御するヘルパー
  private _encodeReturnValue: number[] | null = null;
  setEncodeReturnValue(value: number[]) {
    this._encodeReturnValue = value;
  }
}

// モック埋め込みクライアント
class MockEmbeddingClient implements IEmbeddingClient {
  async getEmbedding(text: string): Promise<number[]> {
    return [0.1, 0.2, 0.3];
  }

  async getTokenEmbeddings?(
    text: string,
    tokenIds: number[],
  ): Promise<number[][]> {
    return tokenIds.map(() => [0.1, 0.2, 0.3]);
  }
}

describe("LateChunkingService", () => {
  let tokenizer: MockTokenizer;
  let embeddingClient: MockEmbeddingClient;
  let service: LateChunkingService;

  beforeEach(() => {
    tokenizer = new MockTokenizer();
    embeddingClient = new MockEmbeddingClient();
    service = new LateChunkingService(tokenizer, embeddingClient);
  });

  describe("applyLateChunking", () => {
    it("SEP-01: 単一チャンク、mean pooling で applied=true を返す", async () => {
      // ...
    });

    it("SEP-02: 複数チャンク、cls pooling で各チャンクに embeddingDimension > 0 を設定する", async () => {
      // ...
    });
  });

  describe("determineChunkBoundaries", () => {
    it("SEP-03: position.start=0 のチャンクで startToken=0 を返す", () => {
      // ...
    });

    it("SEP-04: position.end=text.length のチャンクで endToken <= totalTokens を返す", () => {
      // ...
    });
  });

  describe("poolTokenEmbeddings", () => {
    it("SEP-05: 重なりあり・mean で数値平均ベクトルを返す", () => {
      // ...
    });

    it("SEP-06: 重なりなしで最近傍セグメントのベクトルにフォールバックする", () => {
      // ...
    });

    it("SEP-07: 重なりあり・attention でトークン重なり数で重み付けした平均を返す", () => {
      // ...
    });
  });
});

describe("ChunkingService integration with LateChunkingService", () => {
  it("SEP-08: lateChunking.enabled=true で applyLateChunking が 1 回呼ばれる", async () => {
    const mockLateChunkingService = {
      applyLateChunking: vi.fn().mockResolvedValue([]),
    } as unknown as LateChunkingService;
    // const service = new ChunkingService(tokenizer, embeddingClient, undefined, mockLateChunkingService);
    // ...
    // expect(mockLateChunkingService.applyLateChunking).toHaveBeenCalledTimes(1);
  });

  it("SEP-09: lateChunking.enabled=false で applyLateChunking が呼ばれない", async () => {
    // ...
    // expect(mockLateChunkingService.applyLateChunking).not.toHaveBeenCalled();
  });
});
```

---

## SubAgent lane plan

| Lane | 対象                                                              | 出力                                |
| ---- | ----------------------------------------------------------------- | ----------------------------------- |
| A    | `ChunkingService` コード監査（L358-L586 の 9 メソッド依存先確認） | `solution-design.md` 内の依存マップ |
| B    | コンストラクタシグネチャ・組み込み方法（オプションA）設計         | `constructor-signature.md`          |
| C    | ディレクトリ構造・参照方向マップ・SEP テストケース一覧整流        | `validation-path.md`                |

## 検証導線

1. `chunking-service.ts` L358-L586 の 9 メソッドを Phase 1 inventory と照合する
2. `LateChunkingService` コンストラクタの `ITokenizer` / `IEmbeddingClient` 取得経路を明示する
3. `ChunkingService` コンストラクタ第 4 引数のオプショナル性と既存 3 引数呼び出しの非破壊性を確認する
4. `chunking/types.ts`・`chunking/interfaces.ts` が `embedding/late-chunking/` を参照しないことを `grep` で確認する想定を記録する
5. SEP-01〜SEP-09 の入力条件・期待動作を command 単位で定義する

## 依存関係整合

| 依存        | 理由                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| Phase 1 → 2 | 9 メソッド inventory と public/private 分類が確定してから設計する             |
| Phase 2 → 3 | 設計事項 1〜4 の妥当性を 4 条件・30 思考法でレビューする                      |
| Phase 2 → 4 | SEP-01〜SEP-09 をテスト仕様として Phase 4 に引き渡す                          |
| Phase 2 → 5 | コンストラクタシグネチャ・ディレクトリ構造を実装指針として Phase 5 に引き渡す |

## 実行手順

1. Phase 1 の AC-1〜AC-5 を設計事項 1〜4 に展開する。
2. `LateChunkingService` の DI 境界、型配置、一方向参照を固定する。
3. SEP-01〜SEP-09 を単体テスト / 統合テストへ割り当てる。
4. 不採用案の理由まで記録して Phase 3 へ引き継ぐ。

## 統合テスト連携

- SEP-08 / SEP-09 を `ChunkingService` 統合テストとして固定する。
- Phase 5 以降は `chunking-service.integration.test.ts` を既存回帰の primary evidence として使う。
- Phase 10 では設計事項 4 と統合テスト実装の 1:1 対応を確認する。

## サブタスク管理

| サブタスク | 役割                      | 完了条件                            |
| ---------- | ------------------------- | ----------------------------------- |
| Lane A     | DI 境界と型配置の確定     | import 方向が一方向で固定されている |
| Lane B     | SEP-01〜SEP-09 の振り分け | 単体 / 統合の所属が明記されている   |
| Lane C     | 代替案比較                | 不採用理由が設計本文に残っている    |

## 参照資料

- [phase-1-requirements.md](phase-1-requirements.md)
- `packages/shared/src/services/chunking/chunking-service.ts` L358-L586
- `packages/shared/src/services/chunking/types.ts`
- `packages/shared/src/services/chunking/interfaces.ts`
- `.claude/skills/task-specification-creator/references/phase-template-core.md`

## 多角的チェック観点（AI が判断）

- **論理分析系**: コンストラクタ第 4 引数のオプショナル性が既存 3 引数呼び出しを破壊しないことを演繹的に証明する
- **構造分解系**: 設計事項 1〜4 を MECE に分け、重複・漏れを確認する
- **メタ・抽象系**: Extract Class パターンが SRP 違反の根本解決になるかをダブル・ループ思考で検証する
- **システム系**: `chunking → embedding/late-chunking` の一方向参照が循環参照を回避する因果を明示する
- **戦略・価値系**: public 昇格 3 メソッドのテスト観測性向上が「mock では困難」という真因の解消に直結するかを価値提案思考で確認する

## 成果物

| 成果物                | パス                                       |
| --------------------- | ------------------------------------------ |
| solution design       | `outputs/phase-2/solution-design.md`       |
| constructor signature | `outputs/phase-2/constructor-signature.md` |
| validation path       | `outputs/phase-2/validation-path.md`       |

## 完了条件

- [ ] 設計事項 1（コンストラクタシグネチャ）が明記されている
- [ ] 設計事項 2（オプションA 採用・オプションB 不採用理由）が明記されている
- [ ] 設計事項 3（ディレクトリ構造・参照方向マップ）が明記されている
- [ ] 設計事項 4（SEP-01〜SEP-09 テストケース一覧）が明記されている
- [ ] DI 境界の型配置判断（`LateChunkingOptions` を `chunking/types.ts` に残す方針）が記録されている
- [ ] 逆方向参照禁止ルールが記録されている
- [ ] モック実装雛型が `__tests__/LateChunkingService.test.ts` 用に記載されている
- [ ] SubAgent lane plan（Lane A/B/C）が定義されている
- [ ] 依存関係整合（Phase 1→2、2→3、2→4、2→5）が記録されている

## タスク100%実行確認【必須】

- [ ] 設計事項 1（コンストラクタシグネチャ） 完了
- [ ] 設計事項 2（組み込み方法オプションA） 完了
- [ ] 設計事項 3（ディレクトリ構造） 完了
- [ ] 設計事項 4（テストケース SEP-01〜SEP-09） 完了

## 次Phase

[phase-3-design-review.md](phase-3-design-review.md) で 30 思考法・4 条件・逆方向参照チェックにより設計妥当性を監査し、Phase 4 開始可否を判定する。
