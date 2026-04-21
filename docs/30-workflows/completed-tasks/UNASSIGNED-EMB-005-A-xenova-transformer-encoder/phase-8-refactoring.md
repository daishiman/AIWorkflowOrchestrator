# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 8                             |
| タスクID   | UNASSIGNED-EMB-005-A          |
| タスク名   | XenovaTransformerEncoder 実装 |
| ステータス | 完了                          |
| 作成日     | 2026-04-20                    |
| 前Phase    | 7: カバレッジ確認             |
| 次Phase    | 9: 品質保証                   |

---

## 目的

Phase 5/6 で実装した `xenova-transformer-encoder.ts` の重複・密結合・型不整合を整理し、SOLID 原則（特に SRP / DIP）と TypeScript strict 化（`any` 除去）を満たす。リファクタリングは「挙動不変」を最優先とし、Phase 6 のテスト（戻り値構造・エラー型）に変化が生じないことを保証する。共通化が利益を上回らない場合は導入見送りと判断し、`refactoring-log.md` に判断根拠を残す。

---

## 実行タスク

### タスク1: 重複削除候補の洗い出し

`xenova-transformer-encoder.ts` 内および `late-chunking/` 配下を横断し、重複・類似コードを特定する。

**重複候補（記入例）**:

| 候補ID | 重複内容                                                      | 出現箇所                                    | 対応方針                              |
| ------ | ------------------------------------------------------------- | ------------------------------------------- | ------------------------------------- |
| D-01   | `RangeError` または "OOM" 文字列マッチによる例外分類          | `loadModel()` の catch、`encode()` の catch | `toEmbeddingError()` ヘルパへ集約     |
| D-02   | `tokenizer` / `model` ロード処理の try/catch                  | `loadModel()` 内部                          | `loadModelInternal()` に切り出し      |
| D-03   | `offset_mapping` flat → `[number, number][]` 変換             | `encode()` 内インライン展開                 | `transformOffsetMapping()` ヘルパ抽出 |
| D-04   | `last_hidden_state` / `hidden_states.at(-1)` のフォールバック | `encode()` 末尾ロジック                     | `selectHiddenState()` ヘルパ抽出      |
| D-05   | `EmbeddingError` 二重ラップ防止ガード                         | 全 catch 節で類似分岐                       | `toEmbeddingError()` で吸収           |

**実行手順**:

1. 重複候補を行番号付きで記録する
2. 各候補の「重複量（行数 × 出現回数）」と「集約後の見込み行数」を記録する
3. 「集約利得 > 集約コスト（新規ヘルパの読み解き負荷）」を満たす候補のみ次タスクへ送る

**成果物**: `outputs/phase-8/refactoring-log.md` の「重複候補一覧」セクション

---

### タスク2: プライベートヘルパの抽出

タスク1 で採用した候補をモジュール内 private ヘルパとして切り出す。

```typescript
// xenova-transformer-encoder.ts 内 module-private（export しない）
function transformOffsetMapping(tensor: {
  data: ArrayLike<number>;
}): [number, number][];

function selectHiddenState(modelOutput: {
  last_hidden_state?: { dims: number[]; data: Float32Array };
  hidden_states?: Array<{ dims: number[]; data: Float32Array }>;
}): { dims: number[]; data: Float32Array };

function sliceHiddenStates(tensor: {
  dims: [number, number, number];
  data: Float32Array;
}): Float32Array[];

function toEmbeddingError(
  cause: unknown,
  context: "loadModel" | "encode",
  modelName: string,
): EmbeddingError | OutOfMemoryError;

async function loadModelInternal(
  modelName: string,
): Promise<{ tokenizer: unknown; model: unknown }>;
```

**実行手順**:

1. `XenovaTransformerEncoder` のメソッドから純関数化可能な処理を上記ヘルパへ移動する
2. ヘルパは module-private（export しない）とし、テスト容易性は公開 API 経由で確保する
3. 抽出後、`encode()` / `loadModel()` 本体が「フロー記述」のみになるまでスリム化する
4. 抽出前後の行数差分を記録する

**成果物**: `outputs/phase-8/refactoring-log.md` の「ヘルパ抽出 Before/After」セクション

---

### タスク3: SOLID 観点レビューと改善

| 原則 | チェック項目                                                                                      | 判定欄 |
| ---- | ------------------------------------------------------------------------------------------------- | ------ |
| SRP  | クラスは「IEncoder の Xenova 実装」のみを責務とし、汎用 ML ユーティリティを含まない               |        |
| SRP  | エラー変換 / テンソル変換 / モデルロードがそれぞれ独立ヘルパに分離されている                      |        |
| OCP  | 新規モデルベンダ追加が `IEncoder` 別実装で対応可能（本クラスを変更不要）                          |        |
| LSP  | `IEncoder` 代替として `LateChunkingService` に DI した際、契約違反（型 / 例外）が発生しない       |        |
| ISP  | クライアント（`LateChunkingService`）が利用しないメソッドを公開していない                         |        |
| DIP  | `LateChunkingService` は `IEncoder` 抽象に依存し、`XenovaTransformerEncoder` 具象に依存していない |        |

**実行手順**: 各項目に「OK / 改善要 / 該当なし」を記入し、改善要は修正方針と影響範囲を記録、修正後再判定する。

**成果物**: `outputs/phase-8/refactoring-log.md` の「SOLID 観点判定」セクション

---

### タスク4: any 型除去と型境界の厳密化

`@xenova/transformers` の不安定型に起因する `any` を排除し、Phase 2 設計の「unknown + 局所アサーション」方針に揃える。型エイリアスが 3 件以上発生する場合は別ファイルに分離する。

**型拡張定義の分離案**:

```typescript
// packages/shared/src/services/embedding/late-chunking/types/xenova-types.ts
export type XenovaTensor<T extends ArrayLike<number> = Float32Array> = {
  dims: number[];
  data: T;
};
export type XenovaTokenizerOutput = {
  input_ids: XenovaTensor;
  attention_mask: XenovaTensor;
  offset_mapping: XenovaTensor<Int32Array | Float32Array>;
};
export type XenovaModelOutput = {
  last_hidden_state?: XenovaTensor;
  hidden_states?: XenovaTensor[];
};
export type XenovaTokenizer = (
  text: string,
  options?: { return_offsets_mapping?: boolean },
) => Promise<XenovaTokenizerOutput>;
export type XenovaModel = (
  inputs: XenovaTokenizerOutput,
) => Promise<XenovaModelOutput>;
```

**実行手順**:

1. `: any` 出現箇所を grep で抽出
2. `unknown` + ローカル型アサーション、または `import type` 経由の専用エイリアスへ置換
3. `pnpm --filter @repo/shared typecheck` でエラーゼロを確認

**成果物**: `outputs/phase-8/refactoring-log.md` の「any 除去 Before/After」、（分離時）`types/xenova-types.ts`

---

### タスク5: 挙動不変保証テスト戦略

リファクタリング前後で外部観測可能挙動が一切変化しないことを保証する。

```bash
# 前後でテストランナー JSON 出力を取得して比較
pnpm --filter @repo/shared test -- --run \
  src/services/embedding/late-chunking/__tests__/xenova-transformer-encoder.test.ts \
  --reporter=json --outputFile=outputs/phase-8/before.json
# （リファクタリング後）
pnpm --filter @repo/shared test -- --run \
  src/services/embedding/late-chunking/__tests__/xenova-transformer-encoder.test.ts \
  --reporter=json --outputFile=outputs/phase-8/after.json
diff outputs/phase-8/before.json outputs/phase-8/after.json
```

差分発生時は巻き戻して原因を特定。検証対象は `encode()` 戻り値（`hiddenStates.length` / `offsetMapping`）と例外型・`cause`。**成果物**: `before.json` / `after.json`、`refactoring-log.md` の「挙動不変確認」

---

## 参照資料

| 参照資料                        | パス                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 2 クラス設計              | `outputs/phase-2/class-design.md`                                                    |
| Phase 2 エラーテーブル          | `outputs/phase-2/error-decision-table.md`                                            |
| Phase 7 カバレッジレポート      | `outputs/phase-7/coverage-report.md`                                                 |
| `xenova-transformer-encoder.ts` | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts` |
| `IEncoder` 契約 / 規約          | `late-chunking-types.ts`（変更禁止） / `CLAUDE.md`                                   |
| system spec 正本                | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                 |

---

## 成果物

| 成果物               | パス                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                                       |
| 型補助ファイル       | `packages/shared/src/services/embedding/late-chunking/types/xenova-types.ts`（導入時のみ） |
| 挙動不変スナップ     | `outputs/phase-8/before.json` / `outputs/phase-8/after.json`                               |
| 更新済み実装         | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`       |

---

## 統合テスト連携

- `LateChunkingService` × `XenovaTransformerEncoder` の統合テスト（AC-6）がリファクタリング後も同等挙動を維持することを確認
- ヘルパ抽出により公開 API（`encode()` シグネチャ・戻り値型）が変化していないことをスナップショット差分ゼロで保証
- `IEncoder` 契約に対する LSP 違反が発生していないことを再確認

---

## 多角的チェック観点

| 観点                 | チェック内容                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| 重複削減の費用対効果 | 抽出ヘルパが「呼び出し側 1 箇所」のみで終わっていないか（過剰抽出の予防）     |
| 公開 API 不変性      | `constructor` / `encode` の引数・戻り値型が一切変化していないか               |
| 型境界の局所化       | `unknown` → 型アサーションがヘルパ入口に集約され、クラス本体に流出しないか    |
| any 完全排除         | `// eslint-disable` や `as any` を導入していないか                            |
| 挙動不変             | `before.json` / `after.json` の差分がゼロか（タイムスタンプ等のノイズを除く） |
| カバレッジ維持       | リファクタリング後も Phase 7 の 4 指標が 80% を割らないか                     |

---

## サブタスク管理

| サブタスクID | 内容                                    | ステータス |
| ------------ | --------------------------------------- | ---------- |
| ST-8-01      | 重複削除候補の洗い出し                  | 未実施     |
| ST-8-02      | プライベートヘルパ抽出                  | 未実施     |
| ST-8-03      | SOLID 観点レビューと改善                | 未実施     |
| ST-8-04      | any 型除去と型境界の厳密化              | 未実施     |
| ST-8-05      | 挙動不変保証テスト（before/after diff） | 未実施     |

---

## ゲート判定

| 判定基準                                   | 条件         | 次のアクション                    |
| ------------------------------------------ | ------------ | --------------------------------- |
| `before.json` と `after.json` の差分がゼロ | 挙動不変     | Phase 9 へ進む                    |
| 差分発生                                   | 挙動変化     | リファクタリング巻き戻し → 再試行 |
| `any` 出現件数 0 件                        | 型厳密化達成 | Phase 9 へ進む                    |
| Phase 7 のカバレッジ 4 指標が 80% を維持   | 既存品質維持 | Phase 9 へ進む                    |
| いずれか未達                               | ゲート不合格 | 該当 Phase（5/6/タスク 4）へ戻る  |

---

## 完了条件

- [ ] 重複候補の洗い出しと採用判断が `refactoring-log.md` に記録されている
- [ ] 抽出したヘルパが module-private で実装されている
- [ ] SOLID 観点判定が完了し、改善要項目が解消されている
- [ ] `any` の出現がゼロ、または `unknown` + ローカルアサーションへ置換済み
- [ ] 型補助ファイルを導入する場合、`types/xenova-types.ts` が作成され import されている
- [ ] `before.json` と `after.json` の差分がゼロであることを確認している
- [ ] Phase 7 のカバレッジ 4 指標が維持されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-9-quality.md`
