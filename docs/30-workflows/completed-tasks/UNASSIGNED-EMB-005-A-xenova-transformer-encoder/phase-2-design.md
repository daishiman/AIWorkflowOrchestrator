# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 2                                                                                                                                                     |
| タスクID   | UNASSIGNED-EMB-005-A                                                                                                                                  |
| タスク名   | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス）                                                                                              |
| ステータス | 完了                                                                                                                                                  |
| 作成日     | 2026-04-20                                                                                                                                            |
| 入力       | outputs/phase-1/contract-snapshot.md, outputs/phase-1/usage-scenarios.md, outputs/phase-1/acceptance-criteria.md, outputs/phase-1/scope-definition.md |

## 目的

Phase 1 で確定した契約とスコープを元に、`XenovaTransformerEncoder` クラスの具体設計（フィールド・メソッド・契約準拠方針・遅延ロード戦略・テンソル変換アルゴリズム・エラー分類）を確定する。実装本体は書かず、TypeScript の型シグネチャ・擬似コード・契約定義レベルで Phase 4 以降の実装と Phase 5/6 のテストが迷わない粒度の設計書を成果物として残す。

## 実行タスク

### Step 1: クラス設計

`XenovaTransformerEncoder` クラスの公開 API と内部状態を以下の通り設計する。

```typescript
// クラス契約（型シグネチャのみ。本体は Phase 4 で実装）
export class XenovaTransformerEncoder implements IEncoder {
  private readonly modelName: string;
  private tokenizer: unknown; // @xenova/transformers の AutoTokenizer インスタンス（型は any 境界）
  private model: unknown; // @xenova/transformers の AutoModel インスタンス（同上）

  constructor(modelName?: string); // 既定値: "Xenova/all-MiniLM-L6-v2"

  private loadModel(): Promise<void>; // 冪等な遅延ロード
  encode(text: string): Promise<EncoderOutput>; // IEncoder 契約
}
```

設計上のポイント:

- `IEncoder` 契約を `implements` で宣言し、TypeScript コンパイラに準拠を保証させる（AC-1）
- `tokenizer` / `model` は `unknown` 型で保持し、利用直前に型アサーションで境界を局所化する（`@xenova/transformers` の型定義不安定性を吸収）
- `modelName` は `readonly` で immutable とし、コンストラクタ後の差し替えを禁止する
- 既定モデル名 `Xenova/all-MiniLM-L6-v2` は AC-5 と元仕様書 §3.2 に従う

### Step 2: `loadModel()` 遅延ロード戦略

**冪等性**: 2回目以降の呼び出しでは即座に return する。

```typescript
// 擬似コード
private async loadModel(): Promise<void> {
  if (this.tokenizer && this.model) return; // 冪等ガード
  try {
    const { AutoTokenizer, AutoModel } = await import("@xenova/transformers"); // 動的 import
    this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
    this.model = await AutoModel.from_pretrained(this.modelName, {
      output_hidden_states: true, // hidden_states を必ず取得
    });
  } catch (cause) {
    throw classifyLoadError(cause, this.modelName); // EmbeddingError or OutOfMemoryError
  }
}
```

設計上のポイント:

- 動的 `import("@xenova/transformers")` を採用することで、`XenovaTransformerEncoder` をインポートしただけではライブラリ本体がロードされず、未使用環境（テスト環境のモック注入時など）でのロード時間ゼロを実現する
- `from_pretrained` の戻り値は `unknown` で受け、`encode()` 内で型アサーションする
- `output_hidden_states: true` を明示し、`AutoModel` の挙動が将来変わっても契約が崩れないようにする
- 並行 `loadModel()` 呼び出しによる二重ロードは Phase 3 のレビュー観点とし、必要であれば内部で Promise キャッシュを導入する

### Step 3: `encode()` 内部フロー

```text
encode(text)
  ├─ await loadModel()                                         # 遅延初期化
  ├─ inputs = tokenizer(text, { return_offsets_mapping: true })# トークナイズ + offset
  ├─ offsetMapping = convertOffsetTensor(inputs.offset_mapping)# Float32Array → [number, number][]
  ├─ outputs = await model(inputs)                             # 推論
  ├─ lastHiddenState = outputs.last_hidden_state ?? outputs.hidden_states.at(-1)
  ├─ if !lastHiddenState → throw EmbeddingError("hidden states 取得失敗")
  ├─ hiddenStates = sliceHiddenStates(lastHiddenState)         # [seqLen, hiddenSize] → Float32Array[]
  └─ return { hiddenStates, offsetMapping }
```

設計上のポイント:

- `last_hidden_state` を第一候補、`hidden_states.at(-1)` を fallback として双方の API 形状に対応
- 中間生成物の型は `unknown` を経由し、`hiddenStates: Float32Array[]` / `offsetMapping: [number, number][]` の最終契約のみ静的に保証する（AC-2）
- 例外発生時は `EmbeddingError` 系へ正規化してから再スロー（AC-3 / AC-4）

### Step 4: `offset_mapping` テンソル変換アルゴリズム

`@xenova/transformers` の `AutoTokenizer` は `offset_mapping` を flat な数値配列 `[start0, end0, start1, end1, ...]` として返す。これを `[number, number][]` へ変換する純粋関数を内部ヘルパとして設計する。

```typescript
// 擬似コード（純関数として切り出し、テスト容易性を確保）
function convertOffsetTensor(tensor: {
  data: ArrayLike<number>;
}): [number, number][] {
  const flat = Array.from(tensor.data);
  const result: [number, number][] = [];
  for (let i = 0; i < flat.length; i += 2) {
    result.push([flat[i], flat[i + 1]]);
  }
  return result;
}
```

設計上のポイント:

- 純関数として切り出すことで Phase 6 のユニットテストで境界条件（空配列・奇数長・大きな値）を独立に検証可能
- `tensor.data` の型は `Float32Array` / `Int32Array` / `BigInt64Array` のいずれにもなり得るため、`ArrayLike<number>` で抽象化
- 奇数長入力時の挙動は「末尾要素を破棄」または「`undefined` を含むタプルを禁止」のいずれかを Phase 3 レビューで決定

### Step 5: `hiddenStates` スライスアルゴリズム

`lastHiddenState.data` は `[seqLen × hiddenSize]` の flat な `Float32Array`。これを `Float32Array[]`（長さ `seqLen`、各要素長 `hiddenSize`）へ分割する。

```typescript
// 擬似コード
function sliceHiddenStates(tensor: {
  dims: [number, number, number]; // [batch, seqLen, hiddenSize]
  data: Float32Array;
}): Float32Array[] {
  const seqLen = tensor.dims[1];
  const hiddenSize = tensor.dims[2];
  return Array.from({ length: seqLen }, (_, i) =>
    tensor.data.slice(i * hiddenSize, (i + 1) * hiddenSize),
  );
}
```

設計上のポイント:

- `slice()` を使うことで元 `Float32Array` のメモリ参照から独立し、GC 解放を可能にする（メモリ効率）
- `dims[0]`（batch 次元）は本タスクで常に 1 を前提とする（マルチバッチ対応はスコープ外）
- `seqLen === 0` のとき空配列を返す（後段 `LateChunkingService` が早期 return する設計と整合）

### Step 6: エラーハンドリング設計

エラー分類のディシジョンテーブルを以下に定める。

| 発生箇所               | エラー種別                                          | 投げる例外         | メッセージ例                                            |
| ---------------------- | --------------------------------------------------- | ------------------ | ------------------------------------------------------- |
| `loadModel()` ネット系 | HTTPエラー / モデル未発見                           | `EmbeddingError`   | `モデルの読み込みに失敗しました: {model}`               |
| `loadModel()` メモリ系 | `RangeError` または `message` に "OOM" を含む例外   | `OutOfMemoryError` | `モデル読み込み中にメモリ不足が発生しました`            |
| `encode()` 推論系      | tokenizer/model 呼び出しの一般例外                  | `EmbeddingError`   | `テキストのエンコードに失敗しました`                    |
| `encode()` メモリ系    | `RangeError` または `message` に "OOM" を含む例外   | `OutOfMemoryError` | `テキストエンコード中にメモリ不足が発生しました`        |
| `encode()` 出力欠落    | `last_hidden_state` も `hidden_states` も undefined | `EmbeddingError`   | `モデルの出力から hidden states を取得できませんでした` |

設計上のポイント:

- `cause` を必ず保持し、デバッグ可能性を維持する（`new EmbeddingError(msg, { cause })`）
- 既に `EmbeddingError` 系であれば再ラップせずそのまま再スロー（二重ラップ防止）
- 例外分類は内部ヘルパ `classifyError(cause, context)` に集約し、Phase 6 で単体テスト可能にする

### Step 7: 依存パッケージと型境界

- 追加依存: `@xenova/transformers`（未インストールの場合 `pnpm --filter @repo/shared add @xenova/transformers` を Phase 4 で実行）
- 型境界: `@xenova/transformers` から import する型は `AutoTokenizer` / `AutoModel` のみ。それ以外は `unknown` で受け、本クラス内部に閉じる
- 動的 import を採用することで、`packages/shared` の他コードが `@xenova/transformers` を強制ロードしない設計を維持する
- ESM/CJS 両対応: `@xenova/transformers` は ESM のみ提供のため、`packages/shared` のビルド設定（`tsconfig`/`module`）が ESM 互換であることを Phase 3 で確認する

### Step 8: ファイル配置とエクスポート設計

- 新規ファイル: `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`
- `index.ts` への追加（AC-7）:

```typescript
// 既存エクスポートの末尾に1行追加
export { XenovaTransformerEncoder } from "./xenova-transformer-encoder";
```

- ヘルパ関数（`convertOffsetTensor` / `sliceHiddenStates` / `classifyError`）はファイル内 module-private とし、外部公開しない

## 参照資料

- `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`（契約の正本）
- `packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts`（呼び出し側のシグネチャ）
- `packages/shared/src/services/embedding/late-chunking/index.ts`（エクスポート追加先）
- `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`（Late Chunking 契約の正本）
- `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`（embedding API の正本）
- Phase 1 成果物 `outputs/phase-1/contract-snapshot.md` / `usage-scenarios.md`
- `@xenova/transformers` README（`AutoTokenizer.from_pretrained` / `AutoModel.from_pretrained` の API 仕様）

## 成果物

- `outputs/phase-2/class-design.md`（クラス図・フィールド・メソッドシグネチャ）
- `outputs/phase-2/encode-flow.md`（`encode()` 内部フロー図と擬似コード）
- `outputs/phase-2/error-decision-table.md`（Step 6 のディシジョンテーブル）
- `outputs/phase-2/tensor-conversion-spec.md`（`offset_mapping` / `hiddenStates` 変換アルゴリズム仕様）
- `outputs/phase-2/dependency-and-type-boundary.md`（依存追加方針・型境界・ESM/CJS 互換性）

## 統合テスト連携

Phase 2 は設計フェーズであるため、コード変更は行わない。設計書のレビューを通じて Phase 4 のテスト Red 設計（既存パターン `late-chunking-service.test.ts` に準拠）と整合させ、Phase 6 のユニットテストでカバーすべき境界条件（空文字列・モデル名 invalid・OOM・出力欠落）が `error-decision-table.md` から導出可能であることを確認する。

## 多角的チェック観点

- 型安全性: `IEncoder` 契約に対し `implements` 宣言で静的検証されるか
- テスト容易性: ヘルパ関数（`convertOffsetTensor` / `sliceHiddenStates` / `classifyError`）が純関数として切り出され単体テスト可能か
- Electron 互換性: 動的 import が Electron メインプロセス（Node.js）/ レンダラープロセス両方で動作するか（contextIsolation 環境含む）
- メモリ効率: `Float32Array.slice()` による独立コピーで大きな hidden state テンソルが GC 対象になるか
- エラー伝搬: `cause` 保持により stack trace が失われないか、二重ラップが起きないか
- 並行性: 並行 `encode()` 呼び出し時に `loadModel()` が二重実行されないか（Phase 3 の追加レビュー観点）

## サブタスク管理

| サブタスクID | 内容                                       | 担当Step |
| ------------ | ------------------------------------------ | -------- |
| ST-2-01      | クラス設計（フィールド・メソッド）         | Step 1   |
| ST-2-02      | `loadModel()` 遅延ロード戦略               | Step 2   |
| ST-2-03      | `encode()` 内部フロー設計                  | Step 3   |
| ST-2-04      | `offset_mapping` 変換アルゴリズム設計      | Step 4   |
| ST-2-05      | `hiddenStates` スライス設計                | Step 5   |
| ST-2-06      | エラー分類ディシジョンテーブル             | Step 6   |
| ST-2-07      | 依存パッケージ・型境界・ESM 互換性         | Step 7   |
| ST-2-08      | ファイル配置と `index.ts` エクスポート設計 | Step 8   |

## 完了条件

- [ ] `XenovaTransformerEncoder` クラスのフィールド・メソッドシグネチャが `class-design.md` に確定している
- [ ] `loadModel()` の冪等性と動的 import 方針が `encode-flow.md` に明記されている
- [ ] `encode()` の内部フローが擬似コードレベルで `encode-flow.md` に書かれている
- [ ] `offset_mapping` / `hiddenStates` の変換アルゴリズムが `tensor-conversion-spec.md` に確定している
- [ ] エラー分類ディシジョンテーブルが `error-decision-table.md` に5行以上記載されている
- [ ] `@xenova/transformers` の型境界と ESM/CJS 互換性方針が `dependency-and-type-boundary.md` に記載されている
- [ ] `index.ts` への追加行が確定している

## タスク100%実行確認【必須】

1. AC-1（`implements IEncoder`）が `class-design.md` で型シグネチャとして表現されているか
2. AC-2（`hiddenStates` / `offsetMapping` の戻り値型）が `encode-flow.md` の最終 return で保証されているか
3. AC-3 / AC-4 のエラー種別が `error-decision-table.md` で網羅されているか
4. AC-5（カスタムモデル名）がコンストラクタシグネチャに反映されているか
5. AC-7（`index.ts` エクスポート）の追加行が確定しているか
6. 設計書内のコードブロックが擬似コード/型シグネチャに留まり、本体実装になっていないか

## 次Phase

Phase 3（設計レビュー）へ進む。`class-design.md` / `encode-flow.md` / `error-decision-table.md` / `tensor-conversion-spec.md` / `dependency-and-type-boundary.md` を入力として、型安全性・テスト容易性・Electron 互換性・メモリ効率・エラー伝搬・並行性の6観点で第三者視点レビューを行い、Phase 4（テスト Red）への進行可否を判定する。
