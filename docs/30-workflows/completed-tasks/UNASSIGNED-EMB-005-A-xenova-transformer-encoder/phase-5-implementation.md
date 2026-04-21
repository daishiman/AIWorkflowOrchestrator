# Phase 5: 実装（Green）

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| Phase      | 5                                                                   |
| タスクID   | UNASSIGNED-EMB-005-A                                                |
| タスク名   | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス）            |
| ステータス | 完了                                                                |
| 作成日     | 2026-04-20                                                          |
| タスク種別 | NON_VISUAL（UI 変更なし）                                           |
| 入力       | Phase 4 で作成した `xenova-transformer-encoder.test.ts`（Red 状態） |
| Issue      | #2312                                                               |

## 目的

TDD の Green フェーズとして、Phase 4 のユニットテスト 18 ケースをすべて PASS させる `XenovaTransformerEncoder` クラスの本体実装を行う。Phase 2 の擬似コード設計に従い、`AutoTokenizer` / `AutoModel` の呼び出し、遅延ロードの冪等性、`offset_mapping` テンソル変換、エラー分類（`EmbeddingError` / `OutOfMemoryError`）、`index.ts` のエクスポート追加までを完了させる。`LateChunkingService` 本体や既存型定義には一切手を加えない。

## 実装対象

| 種別 | パス                                                                                 | 作業内容                                                        |
| ---- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 新規 | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` | `XenovaTransformerEncoder` クラス + 内部ヘルパ                  |
| 編集 | `packages/shared/src/services/embedding/late-chunking/index.ts`                      | `XenovaTransformerEncoder` の `export` を追加（AC-7）           |
| 編集 | `packages/shared/package.json`                                                       | `@xenova/transformers` を `dependencies` に追加（未導入時のみ） |

変更しないファイル（確認のみ）:

- `late-chunking-types.ts`（契約の正本）
- `late-chunking-service.ts` / `hidden-state-pooler.ts` / `token-boundary-calculator.ts` / `window-splitter.ts`
- `xenova-transformer-encoder.test.ts`（Phase 4 で確定済み）

## 実行手順

### Step 1: 依存パッケージ追加（未インストール時のみ）

```bash
pnpm --filter @repo/shared list | grep "@xenova/transformers" \
  || pnpm --filter @repo/shared add @xenova/transformers
```

確認事項:

- `packages/shared/package.json` の `dependencies` に `@xenova/transformers` が追記されること
- `pnpm-lock.yaml` が更新されること
- 既存ビルド（`pnpm --filter @repo/shared build`）が壊れていないこと

### Step 2: `xenova-transformer-encoder.ts` の作成

Phase 2 設計（`class-design.md` / `encode-flow.md`）に従い、以下の契約レベル擬似コードで本体を実装する。詳細ロジックは設計書を正本とする。

```typescript
// 契約レベル擬似コード（実装本体は設計書を参照）
import {
  EncoderOutput,
  IEncoder,
  OutOfMemoryError,
} from "./late-chunking-types";
import { EmbeddingError } from "../types/errors";

const DEFAULT_MODEL = "Xenova/all-MiniLM-L6-v2";

export class XenovaTransformerEncoder implements IEncoder {
  private readonly modelName: string;
  private tokenizer: unknown;
  private model: unknown;
  private loadingPromise: Promise<void> | null = null; // 並行二重ロード防止
  constructor(modelName: string = DEFAULT_MODEL);
  private async loadModel(): Promise<void>; // 動的 import + from_pretrained、冪等
  async encode(text: string): Promise<EncoderOutput>; // tokenize→infer→slice→classify
}

// 内部ヘルパ（module-private）
function convertOffsetTensor(t: {
  data: ArrayLike<number>;
}): [number, number][];
function sliceHiddenStates(t: {
  dims: [number, number, number];
  data: Float32Array;
}): Float32Array[];
function classifyError(
  cause: unknown,
  ctx: "load" | "encode",
  model: string,
): Error;
```

実装上の遵守事項:

- `AutoTokenizer.from_pretrained` を先に呼び、その後 `AutoModel.from_pretrained` を呼ぶ呼び出し順序を Phase 2 設計と揃える
- 動的 `import("@xenova/transformers")` を使用し、テストから `vi.mock()` で差し替え可能にする
- `tokenizer` / `model` は `unknown` で保持し、利用直前に局所的な型アサーションを行う（`any` 漏洩禁止）
- `convertOffsetTensor` は `tensor.data` を `Array.from()` で配列化し、2 要素ずつタプル化（奇数長は末尾要素破棄）
- `sliceHiddenStates` は `Float32Array.slice()` を使い、元バッファから独立コピーを生成（GC 効率）
- `classifyError` で「既に `EmbeddingError` 系なら再ラップせずそのまま再スロー」を最初に処理する
- `OutOfMemoryError` 判定は `cause instanceof RangeError || /out of memory|oom/i.test(cause?.message ?? "")` で行う

### Step 3: `index.ts` への export 追加（AC-7）

`packages/shared/src/services/embedding/late-chunking/index.ts` の末尾に 1 行追加する。

```typescript
export { XenovaTransformerEncoder } from "./xenova-transformer-encoder";
```

確認事項:

- 既存 4 クラス・型のエクスポート行を変更しない
- 名前付きエクスポートとし、default export は使用しない

### Step 4: テスト実行と Green 化確認

```bash
pnpm --filter @repo/shared test -- --run xenova-transformer-encoder
```

期待される結果:

| テストID             | 期待結果 |
| -------------------- | -------- |
| XENC-NORMAL-01〜06   | PASS     |
| XENC-ERROR-01〜08    | PASS     |
| XENC-BOUNDARY-01〜04 | PASS     |

すべてが PASS しない場合は Phase 4 のテスト記述ではなく実装側を修正する（テスト改竄禁止）。例外として、Phase 4 で記述したアサーションが Phase 2 設計と矛盾している場合のみ Phase 4 へ差し戻す。

### Step 5: 全体回帰テストと型チェック

```bash
pnpm --filter @repo/shared test
pnpm --filter @repo/shared typecheck
```

確認事項:

- 既存 late-chunking テスト群（`late-chunking-service.test.ts` 等）が PASS していること
- `pnpm typecheck` が PASS し、`AC-1`（`implements IEncoder`）が静的に保証されていること
- ビルドエラー・型エラーが 0 件であること

## 注意事項・NON_VISUAL

- `late-chunking-types.ts` / `late-chunking-service.ts` 変更禁止、テスト改竄禁止
- `@xenova/transformers` は ESM-only。`tsconfig` の `module` が `ESNext` 系であることを確認
- 動的 import が Vite バンドルで問題なら `external` 指定を Phase 6 で判断
- 追加・変更は `packages/shared` のサービス層と `package.json` のみで UI 変更なし → NON_VISUAL

## 参照資料

- Phase 2 設計書（`class-design.md` / `encode-flow.md` / `error-decision-table.md`）、Phase 4 テスト
- 契約: `late-chunking-types.ts` / エラー基底: `services/embedding/types/errors.ts`
- system spec 正本: `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`
- API 正本: `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`

## 統合テスト連携

`LateChunkingService` への注入確認は Phase 6 で扱う。本フェーズでは `XenovaTransformerEncoder` 単体テスト（Phase 4 の 18 ケース）の Green 化と既存 late-chunking テストの非回帰確認のみを完了条件とする。

## 多角的チェック観点

- 型安全性: `implements IEncoder` 宣言があり、`encode()` の戻り値が `Promise<EncoderOutput>` に推論されているか
- 設計準拠: Phase 2 の `encode-flow.md` のフロー（loadModel → tokenizer → convertOffset → model → fallback → slice）と一致しているか
- エラー分類: `error-decision-table.md` の 5 行すべてが実装で網羅されているか
- 並行性: `loadingPromise` キャッシュにより並行 `encode()` 呼び出しでも `from_pretrained` が各 1 回のみ実行されるか
- 二重ラップ防止: `classifyError` で `EmbeddingError` 系を先に弾いているか
- export 整合: `index.ts` から `XenovaTransformerEncoder` が名前付きエクスポートされているか（AC-7）
- 依存最小化: `@xenova/transformers` 以外の新規依存追加が無いこと

## 受け入れ基準（Phase 5 固有）

| AC番号 | 条件                                                                                         | 検証方法          |
| ------ | -------------------------------------------------------------------------------------------- | ----------------- |
| P5-AC1 | `xenova-transformer-encoder.ts` が新規作成され `XenovaTransformerEncoder` を export している | ファイル/grep     |
| P5-AC2 | `index.ts` に `export { XenovaTransformerEncoder }` が追加されている                         | grep              |
| P5-AC3 | `@xenova/transformers` が `packages/shared/package.json` の `dependencies` に追加されている  | package.json 確認 |
| P5-AC4 | `pnpm --filter @repo/shared test -- --run xenova-transformer-encoder` で全 18 ケース PASS    | テスト実行        |
| P5-AC5 | `pnpm --filter @repo/shared typecheck` が PASS（AC-1 静的保証）                              | typecheck 実行    |
| P5-AC6 | `pnpm --filter @repo/shared test` 全体が PASS（既存 late-chunking 非回帰）                   | テスト実行        |
| P5-AC7 | `late-chunking-types.ts` / `late-chunking-service.ts` への変更が無い                         | `git diff` 確認   |

## サブタスク管理

| サブタスクID | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| ST-5-01      | `@xenova/transformers` の依存追加（未導入時のみ）                             |
| ST-5-02      | `xenova-transformer-encoder.ts` 本体実装                                      |
| ST-5-03      | 内部ヘルパ `convertOffsetTensor` / `sliceHiddenStates` / `classifyError` 実装 |
| ST-5-04      | `index.ts` への export 追加                                                   |
| ST-5-05      | Phase 4 テストの Green 化確認                                                 |
| ST-5-06      | typecheck と全体テストの非回帰確認                                            |

## 成果物

- `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`
- `packages/shared/src/services/embedding/late-chunking/index.ts`（1 行追加）
- `packages/shared/package.json` / `pnpm-lock.yaml`（依存追加時のみ）
- `outputs/phase-5/green-test-result.md`（全 PASS のテスト ID 一覧と実行ログ）
- `outputs/phase-5/typecheck-result.md`（typecheck PASS のログ）

## 完了条件

- [ ] `xenova-transformer-encoder.ts` が作成され、Phase 2 設計に準拠している
- [ ] `index.ts` に export が追加されている（AC-7）
- [ ] `@xenova/transformers` が依存に追加されている
- [ ] Phase 4 のテスト 18 ケースが全 PASS（AC-1〜AC-5 達成）
- [ ] `pnpm typecheck` が PASS
- [ ] 既存 late-chunking テストが PASS（非回帰）
- [ ] `late-chunking-types.ts` / `late-chunking-service.ts` への変更が無い
- [ ] `green-test-result.md` / `typecheck-result.md` が作成されている

## タスク100%実行確認【必須】

1. Phase 4 の 18 テストすべてが PASS していることをログで確認したか
2. `pnpm typecheck` の出力に 0 errors が記録されているか
3. `git diff packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts` で差分が無いことを確認したか
4. `index.ts` の export 行が名前付きエクスポートで追加されているか
5. `@xenova/transformers` がインストールされ、`pnpm-lock.yaml` が更新されているか
6. `green-test-result.md` に実行日時・テスト ID・実行時間が記録されているか

## 次Phase

Phase 6（テスト拡充）へ進む。`LateChunkingService` との統合テスト（AC-6）、CJK / 絵文字 / 大規模テキストなど追加境界ケース、および回帰テスト観点を追加する。Phase 5 で生成した実装をベースに、E2E に近い結合テストで Late Chunking パイプライン全体の動作を保証する。
