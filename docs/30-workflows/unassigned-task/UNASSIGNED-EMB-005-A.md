# XenovaTransformerEncoder 実装 - タスク指示書

## メタ情報

```yaml
issue_number: 2312
task_id: UNASSIGNED-EMB-005-A
status: open
priority: medium
scale: medium
task_type: FEATURE
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UNASSIGNED-EMB-005-A                                           |
| タスク名     | xenova-transformer-encoder-implementation                      |
| 分類         | 機能追加                                                       |
| 対象機能     | Late Chunking - IEncoder実装クラス（@xenova/transformers連携） |
| 優先度       | **中**                                                         |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未着手                                                         |
| 発見元       | UNASSIGNED-EMB-005 Phase 12 未タスク検出                       |
| 発見日       | 2026-04-19                                                     |
| depends_on   | UNASSIGNED-EMB-005（完了済み）                                 |
| 並行可能     | なし（単独タスク）                                             |
| 関連タスク   | UNASSIGNED-EMB-005                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UNASSIGNED-EMB-005 で Late Chunking 機能を実装した。そのコアは `IEncoder` インターフェースによる抽象化である。

```typescript
// packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts
export interface EncoderOutput {
  hiddenStates: Float32Array[];
  offsetMapping: [number, number][];
}

export interface IEncoder {
  encode(text: string): Promise<EncoderOutput>;
}
```

`LateChunkingService` は DI（依存性注入）パターンで `IEncoder` を受け取る設計になっているが、
具体的な実装クラスが存在しない。現状ではユーザーが自前でアダプターコードを書く必要があり、
実運用への参入障壁が高い。

```typescript
// LateChunkingService はコンストラクタで IEncoder を受け取るが、
// 使える実装クラスが存在しない
export class LateChunkingService implements ILateChunkingService {
  constructor(private readonly encoder: IEncoder) { ... }
}
```

### 1.2 問題点・課題

- `IEncoder` を実装した具体クラスが存在しないため、`LateChunkingService` をすぐに利用できない
- ユーザーが `@xenova/transformers` の API を直接扱う必要があり、Late Chunking のセットアップコストが高い
- `AutoTokenizer` / `AutoModel` の呼び出しパターンを毎回手書きすると、バグが混入しやすい
- エラーハンドリング（モデル読み込み失敗・OOM）が各利用箇所で重複実装される

### 1.3 放置した場合の影響

- Late Chunking 機能が「インターフェース定義のみで動かない」状態が継続する
- ドキュメントや使用例を書けないため、外部への公開・紹介が困難になる
- 将来 Electron 環境で動作確認が必要になったとき、実装とテストを同時に追う必要が生じる

---

## 2. 何を達成するか（What）

### 2.1 目的

`@xenova/transformers` の `AutoTokenizer` と `AutoModel` を使用して `IEncoder` を実装する
`XenovaTransformerEncoder` クラスを提供し、`LateChunkingService` をすぐに使える状態にする。

### 2.2 最終ゴール

- `XenovaTransformerEncoder` クラスが `IEncoder` を完全に実装している
- モデル名をコンストラクタで設定可能（デフォルト: `Xenova/all-MiniLM-L6-v2`）
- モデル読み込み失敗・OOM 等のエラーを適切にハンドリングし `EmbeddingError` に変換する
- ユニットテストが全件 PASS する
- `LateChunkingService` と組み合わせた統合的な使用例がテストで示されている

### 2.3 スコープ

#### 含むもの

- `XenovaTransformerEncoder` クラスの実装
- `@xenova/transformers` の `AutoTokenizer` / `AutoModel` を用いた `encode()` メソッド実装
- `hiddenStates` と `offsetMapping` の正しい抽出ロジック
- エラーハンドリング（モデル読み込み失敗・テキストエンコード失敗・OOM）
- ユニットテストおよび `LateChunkingService` との統合テスト
- `index.ts` へのエクスポート追加

#### 含まないもの

- `LateChunkingService` 本体の変更（UNASSIGNED-EMB-005 完了済み）
- `@xenova/transformers` 以外のバックエンド対応（OpenAI API 等）
- Electron 環境での E2E 動作確認（別タスクのスコープ）
- fine-tuning・カスタムモデルの対応

### 2.4 成果物

| 種別         | 成果物                          | 配置先                                                                                              |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| 実装         | XenovaTransformerEncoder クラス | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`                |
| テスト       | ユニットテスト・統合テスト      | `packages/shared/src/services/embedding/late-chunking/__tests__/xenova-transformer-encoder.test.ts` |
| エクスポート | index.ts への追加               | `packages/shared/src/services/embedding/late-chunking/index.ts`                                     |

---

## 3. どのように実装するか（How）

### 3.1 実装手順

#### Phase 1: `@xenova/transformers` の型確認・依存追加

```bash
# @xenova/transformers が既にインストールされているか確認
pnpm --filter @repo/shared list | grep xenova

# 未インストールの場合は追加
pnpm --filter @repo/shared add @xenova/transformers
```

#### Phase 2: `XenovaTransformerEncoder` クラスの実装

```typescript
// packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts

import type { IEncoder, EncoderOutput } from "./late-chunking-types";
import { EmbeddingError, OutOfMemoryError } from "./late-chunking-types";

const DEFAULT_MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

export class XenovaTransformerEncoder implements IEncoder {
  private readonly modelName: string;
  private tokenizer: unknown = null;
  private model: unknown = null;

  constructor(modelName: string = DEFAULT_MODEL_NAME) {
    this.modelName = modelName;
  }

  private async loadModel(): Promise<void> {
    if (this.tokenizer && this.model) return;
    try {
      const { AutoTokenizer, AutoModel } = await import("@xenova/transformers");
      this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
      this.model = await AutoModel.from_pretrained(this.modelName, {
        output_hidden_states: true,
      });
    } catch (cause) {
      if (
        cause instanceof RangeError ||
        (cause as Error)?.message?.includes("OOM")
      ) {
        throw new OutOfMemoryError(
          `モデル読み込み中にメモリ不足が発生しました: ${this.modelName}`,
          { cause },
        );
      }
      throw new EmbeddingError(
        `モデルの読み込みに失敗しました: ${this.modelName}`,
        { cause },
      );
    }
  }

  async encode(text: string): Promise<EncoderOutput> {
    await this.loadModel();
    try {
      // AutoTokenizer でトークナイズ（offset mapping 付き）
      const inputs = await (this.tokenizer as any)(text, {
        return_offsets_mapping: true,
      });
      const offsetMappingRaw: [number, number][] = Array.from(
        inputs.offset_mapping.data as number[],
      ).reduce<[number, number][]>((acc, _, i, arr) => {
        if (i % 2 === 0) acc.push([arr[i], arr[i + 1]]);
        return acc;
      }, []);

      // AutoModel で推論（hidden states を取得）
      const outputs = await (this.model as any)(inputs);
      const lastHiddenState =
        outputs.last_hidden_state ?? outputs.hidden_states?.at(-1);
      if (!lastHiddenState) {
        throw new EmbeddingError(
          "モデルの出力から hidden states を取得できませんでした",
        );
      }

      const seqLen: number = lastHiddenState.dims[1];
      const hiddenSize: number = lastHiddenState.dims[2];
      const rawData = lastHiddenState.data as Float32Array;

      const hiddenStates: Float32Array[] = Array.from(
        { length: seqLen },
        (_, i) => rawData.slice(i * hiddenSize, (i + 1) * hiddenSize),
      );

      return { hiddenStates, offsetMapping: offsetMappingRaw };
    } catch (cause) {
      if (cause instanceof EmbeddingError) throw cause;
      if (
        cause instanceof RangeError ||
        (cause as Error)?.message?.includes("OOM")
      ) {
        throw new OutOfMemoryError(
          "テキストエンコード中にメモリ不足が発生しました",
          { cause },
        );
      }
      throw new EmbeddingError("テキストのエンコードに失敗しました", { cause });
    }
  }
}
```

#### Phase 3: `index.ts` へのエクスポート追加

```typescript
// 既存の export 群の末尾に追加
export { XenovaTransformerEncoder } from "./xenova-transformer-encoder";
```

#### Phase 4: ユニットテストの作成

```typescript
// packages/shared/src/services/embedding/late-chunking/__tests__/xenova-transformer-encoder.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { XenovaTransformerEncoder } from "../xenova-transformer-encoder";
import { EmbeddingError, OutOfMemoryError } from "../late-chunking-types";

// @xenova/transformers をモック
vi.mock("@xenova/transformers", () => ({
  AutoTokenizer: {
    from_pretrained: vi.fn(),
  },
  AutoModel: {
    from_pretrained: vi.fn(),
  },
}));

describe("XenovaTransformerEncoder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("encode() が EncoderOutput を返す", async () => {
    // モックセットアップ・テスト実装
  });

  it("モデル読み込み失敗時に EmbeddingError をスローする", async () => {
    // エラーハンドリングのテスト
  });

  it("OOM 発生時に OutOfMemoryError をスローする", async () => {
    // OOM エラーのテスト
  });

  it("カスタムモデル名を受け付ける", async () => {
    // コンストラクタオプションのテスト
  });
});
```

### 3.2 確認コマンド

```bash
# テスト実行
pnpm --filter @repo/shared test -- --run xenova-transformer-encoder

# 型チェック
pnpm --filter @repo/shared typecheck

# @xenova/transformers のインストール確認
pnpm --filter @repo/shared list | grep xenova
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                                       | 検証方法              |
| ------ | ------------------------------------------------------------------------------------------ | --------------------- |
| AC-1   | `XenovaTransformerEncoder` が `IEncoder` インターフェースを実装している                    | TypeScript コンパイル |
| AC-2   | `encode()` が `hiddenStates: Float32Array[]` と `offsetMapping: [number, number][]` を返す | ユニットテスト        |
| AC-3   | モデル読み込み失敗時に `EmbeddingError` がスローされる                                     | ユニットテスト        |
| AC-4   | OOM 発生時に `OutOfMemoryError` がスローされる                                             | ユニットテスト        |
| AC-5   | コンストラクタでカスタムモデル名を指定できる                                               | ユニットテスト        |
| AC-6   | `LateChunkingService` に渡して `generateChunkEmbeddings()` が動作する                      | 統合テスト            |
| AC-7   | `index.ts` から `XenovaTransformerEncoder` がエクスポートされている                        | コードレビュー        |
| AC-8   | 全テストが PASS し、`pnpm typecheck` が PASS する                                          | CI                    |

---

## 5. フェーズ別実行計画

### Phase 1: 依存確認・パッケージ追加

- `@xenova/transformers` のインストール状況を確認
- 未インストールの場合は `pnpm --filter @repo/shared add @xenova/transformers` を実行
- `package.json` の変更を確認

### Phase 2: 型定義・インターフェース確認

- `late-chunking-types.ts` の `IEncoder` / `EncoderOutput` / `EmbeddingError` / `OutOfMemoryError` を確認
- `@xenova/transformers` の型定義（`AutoTokenizer.from_pretrained` / `AutoModel.from_pretrained` 戻り値）を把握

### Phase 3: `XenovaTransformerEncoder` 骨格作成

- ファイル作成: `xenova-transformer-encoder.ts`
- クラス定義・コンストラクタ・`loadModel()` の骨格実装
- TypeScript コンパイルエラーがないことを確認

### Phase 4: `encode()` メソッド実装

- `AutoTokenizer` でのトークナイズ（`return_offsets_mapping: true`）
- `AutoModel` での推論・`last_hidden_state` 取得
- `hiddenStates: Float32Array[]` への変換（シーケンス長 × hidden size）
- `offsetMapping: [number, number][]` の抽出

### Phase 5: エラーハンドリング実装

- モデル読み込み失敗 → `EmbeddingError` に変換
- OOM エラー（`RangeError` / OOM メッセージ含む） → `OutOfMemoryError` に変換
- `encode()` 内の try-catch で再スロー

### Phase 6: ユニットテスト作成（`@xenova/transformers` モック）

- `vi.mock("@xenova/transformers", ...)` でモック化
- 正常系: `encode()` が正しい `EncoderOutput` 形状を返す
- 異常系: モデル読み込み失敗・OOM・エンコード失敗

### Phase 7: 統合テスト作成

- `XenovaTransformerEncoder` を `LateChunkingService` に渡す
- `generateChunkEmbeddings()` がエンドツーエンドで動作することを確認

### Phase 8: `index.ts` へのエクスポート追加

- `XenovaTransformerEncoder` を `index.ts` から export
- 既存エクスポートへの影響がないことを確認

### Phase 9: 型チェック・テスト全件実行

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared test -- --run
```

### Phase 10: レビュー・ドキュメント整備

- コードコメント・JSDoc の整備
- エラーハンドリングのカバレッジ確認
- 使用例コメントを `xenova-transformer-encoder.ts` ファイルヘッダーに追記

### Phase 11: CI 確認・PR 作成

- `pnpm lint` / `pnpm typecheck` / テストが全て PASS
- PR 作成・レビュー依頼

### Phase 12: 概念説明（中学生レベル）

Late Chunking と `XenovaTransformerEncoder` の関係を平易に説明する。

**Late Chunking とは？**

長い文章を AI に読ませるとき、全部を一度に渡すのではなく「段落ごと」「文ごと」に区切って処理することがあります。
これを「チャンキング」と呼びます。

普通の方法では、区切ってから各ブロックを別々にAIに渡すため、ブロック間の「文脈のつながり」が失われてしまいます。
**Late Chunking** は「まず文章全体を AI に読ませてから、後でブロックに分割する」方法です。
こうすることで、文脈を保ったまま各ブロックの特徴量（ベクトル）を作れます。

**IEncoder とは？**

AI に文章を読ませて「隠れた意味のデータ（hidden states）」を取り出す道具です。
どんな AI モデルを使うかは問わず、「encode()」という操作で統一されたデータ形式を返す約束（インターフェース）になっています。

**XenovaTransformerEncoder とは？**

「`@xenova/transformers`」という人気のライブラリを使って `IEncoder` を実装した具体的なクラスです。
ブラウザや Node.js（Electron含む）で動く Transformer モデルを手軽に呼び出せます。

たとえて言うと：

- `IEncoder` → 「何か飲み物を出してください」という注文書
- `XenovaTransformerEncoder` → 「Xenova ブランドの自販機」
- `@xenova/transformers` → 自販機の中に入っている実際の機械

### Phase 13: 完了確認チェックリスト

- [ ] `xenova-transformer-encoder.ts` が作成されている
- [ ] `XenovaTransformerEncoder` が `IEncoder` を implements している
- [ ] `encode()` が `EncoderOutput` を返す
- [ ] モデル名をコンストラクタで指定できる
- [ ] エラーハンドリングが実装されている（`EmbeddingError` / `OutOfMemoryError`）
- [ ] ユニットテストが全件 PASS
- [ ] 統合テストが全件 PASS
- [ ] `index.ts` に `XenovaTransformerEncoder` のエクスポートが追加されている
- [ ] `pnpm typecheck` が PASS
- [ ] PR がマージされ、CI が全件 PASS

---

## 6. 苦戦箇所と知見

### 6.1 IEncoder の抽象化設計

**苦戦した点**: UNASSIGNED-EMB-005 で `IEncoder` を抽象化した際、外部モデル呼び出しに必要な情報（`hiddenStates` / `offsetMapping`）を `EncoderOutput` に含めたが、具体的な実装クラスがなかったため実運用時にユーザーがアダプターコードを自前で書く必要があった。

**知見**:

1. インターフェースを定義したら、同時に「リファレンス実装」を1つ提供することで、利用者の参入障壁が大きく下がる
2. `IEncoder` のような薄い抽象化レイヤーは、異なるバックエンド（Xenova / ONNX / OpenAI API等）への切り替えを容易にする設計として正しいが、使えるデフォルト実装がないと「形だけ」になってしまう

### 6.2 `@xenova/transformers` の Electron 環境対応

**苦戦した点**: `@xenova/transformers` はブラウザ / Node.js 両対応のライブラリだが、Electron のメインプロセスとレンダラープロセスでの動作挙動が異なる。モデルファイルのキャッシュパスやメモリ制限がプロセスによって変わる。

**知見**:

- Electron のメインプロセス（Node.js）で使う場合は通常の `require` 形式で動作する
- レンダラープロセスで使う場合は `contextIsolation` の設定に注意が必要
- モデルのキャッシュ先（`env.cacheDir`）を Electron の `app.getPath('userData')` に設定すると、OS 間の互換性が高まる
- OOM はモデルサイズに依存するため、`Xenova/all-MiniLM-L6-v2`（小規模モデル）をデフォルトにすることで問題を回避しやすい

### 6.3 `offset_mapping` のデータ変換

**苦戦した点**: `@xenova/transformers` の `AutoTokenizer` が返す `offset_mapping` は `Tensor` オブジェクト形式であり、`[number, number][]` の配列に変換する処理が必要。flat な `Float32Array` / `Int32Array` として `[start0, end0, start1, end1, ...]` のように格納されているため、2要素ずつ取り出す変換が必要。

**知見**: `data` プロパティにアクセスして `reduce` で2要素ずつタプルに変換するパターンが安全。

```typescript
const offsetMapping = Array.from(tensor.data as number[]).reduce<
  [number, number][]
>((acc, _, i, arr) => {
  if (i % 2 === 0) acc.push([arr[i], arr[i + 1]]);
  return acc;
}, []);
```

---

## 関連リンク

- [UNASSIGNED-EMB-005 仕様書](../UNASSIGNED-EMB-005-late-chunking/)
- [late-chunking-types.ts](../../../../packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts)
- [late-chunking-service.ts](../../../../packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts)
- [index.ts](../../../../packages/shared/src/services/embedding/late-chunking/index.ts)
- [@xenova/transformers GitHub](https://github.com/xenova/transformers.js)
