# Phase 4: テスト作成（Red）

## メタ情報

| 項目       | 内容                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 4                                                                                                                            |
| タスクID   | UNASSIGNED-EMB-005-A                                                                                                         |
| タスク名   | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス）                                                                     |
| ステータス | 完了                                                                                                                         |
| 作成日     | 2026-04-20                                                                                                                   |
| 入力       | outputs/phase-3/gate-decision.md（進行可確認済み）, outputs/phase-2/class-design.md, outputs/phase-2/error-decision-table.md |
| Issue      | #2312                                                                                                                        |

## 目的

TDD の Red フェーズとして、`XenovaTransformerEncoder` の実装に先立ち、Phase 2 設計に対応するユニットテストファイルを 1 本作成する。本フェーズではテスト対象クラスがまだ存在しないため、`import` 解決失敗または契約未充足によりテストが FAIL（Red）する状態が正しい。テストID 命名・AAA 構造・モック戦略・アサーション方針が Phase 2 の設計と完全に一致していることを確認し、Phase 5 の Green 化へ受け渡す。

## 実行タスク

### 対象ファイル

| 種別 | パス                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| 新規 | `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-transformer-encoder.test.ts`          |
| 参照 | `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`                                |
| 参照 | `packages/shared/src/services/embedding/__tests__/late-chunking/late-chunking-service.test.ts`（モック流儀） |

### モック戦略

`@xenova/transformers` 全体を `vi.mock()` でモジュール差し替えする。`vi.hoisted()` で生成したファクトリ関数 `mockTokenizerFn` / `mockModelFn` を `AutoTokenizer.from_pretrained` / `AutoModel.from_pretrained` の戻り値として返す。テストごとに `mockResolvedValueOnce` / `mockRejectedValueOnce` で挙動を切り替える。

```typescript
// 擬似コード（テスト記述方針）
const {
  mockTokenizerFromPretrained,
  mockModelFromPretrained,
  mockTokenize,
  mockInfer,
} = vi.hoisted(() => ({
  mockTokenizerFromPretrained: vi.fn(),
  mockModelFromPretrained: vi.fn(),
  mockTokenize: vi.fn(),
  mockInfer: vi.fn(),
}));

vi.mock("@xenova/transformers", () => ({
  AutoTokenizer: { from_pretrained: mockTokenizerFromPretrained },
  AutoModel: { from_pretrained: mockModelFromPretrained },
}));
```

### テストケース一覧

| テストID         | 区分   | 対象                        | 期待挙動                                                                             | AC   |
| ---------------- | ------ | --------------------------- | ------------------------------------------------------------------------------------ | ---- |
| XENC-NORMAL-01   | 正常系 | `encode("hello")`           | 戻り値が `{ hiddenStates: Float32Array[], offsetMapping: [number,number][] }` の形状 | AC-2 |
| XENC-NORMAL-02   | 正常系 | `encode("hello")`           | `hiddenStates.length === offsetMapping.length`（seqLen 整合）                        | AC-2 |
| XENC-NORMAL-03   | 正常系 | コンストラクタ既定値        | `modelName` 未指定で `Xenova/all-MiniLM-L6-v2` が `from_pretrained` に渡る           | AC-5 |
| XENC-NORMAL-04   | 正常系 | カスタムモデル名            | `new XenovaTransformerEncoder("Xenova/bge-small-en")` が両 API に伝播                | AC-5 |
| XENC-NORMAL-05   | 正常系 | 遅延ロード冪等性            | `encode` を 2 回呼び出しても `from_pretrained` は各 API 1 回のみ呼ばれる             | 設計 |
| XENC-NORMAL-06   | 正常系 | implements 検証             | `IEncoder` 互換（`encode` メソッド存在・`Promise<EncoderOutput>` 返却）              | AC-1 |
| XENC-ERROR-01    | 異常系 | モデル読み込み失敗          | `AutoModel.from_pretrained` が reject → `EmbeddingError` をスロー                    | AC-3 |
| XENC-ERROR-02    | 異常系 | Tokenizer 読み込み失敗      | `AutoTokenizer.from_pretrained` が reject → `EmbeddingError`                         | AC-3 |
| XENC-ERROR-03    | 異常系 | OOM（loadModel）            | `RangeError("Out of memory")` reject → `OutOfMemoryError`                            | AC-4 |
| XENC-ERROR-04    | 異常系 | OOM（encode）               | 推論時の `RangeError` → `OutOfMemoryError`                                           | AC-4 |
| XENC-ERROR-05    | 異常系 | エンコード一般失敗          | `model(inputs)` が reject → `EmbeddingError`                                         | AC-3 |
| XENC-ERROR-06    | 異常系 | hidden states 欠落          | `last_hidden_state` / `hidden_states` 共に undefined → `EmbeddingError`              | AC-3 |
| XENC-ERROR-07    | 異常系 | cause 保持                  | スロー例外の `cause` に元エラーが含まれる                                            | 設計 |
| XENC-ERROR-08    | 異常系 | 二重ラップ防止              | 既に `EmbeddingError` のとき再ラップせずそのまま再スロー                             | 設計 |
| XENC-BOUNDARY-01 | 境界   | 空文字列                    | `encode("")` で `hiddenStates: []`, `offsetMapping: []` を返す                       | 設計 |
| XENC-BOUNDARY-02 | 境界   | 長文（seqLen=512）          | hiddenStates 長が seqLen と一致する                                                  | 設計 |
| XENC-BOUNDARY-03 | 境界   | offset_mapping 形状         | flat `[s0,e0,s1,e1,...]` → `[number,number][]` 変換結果が正確                        | AC-2 |
| XENC-BOUNDARY-04 | 境界   | hiddenStates スライス独立性 | 返却 `Float32Array` が元バッファを共有しない（slice コピー）                         | 設計 |

### AAA 構成方針

各テストケースは Arrange / Act / Assert を明確に分離する。

- **Arrange**: `mockTokenize.mockResolvedValueOnce({ ... })` 等でモック挙動を設定し、`new XenovaTransformerEncoder()` をインスタンス化
- **Act**: `await encoder.encode(text)` または `encoder.encode(text)` の Promise 取得
- **Assert**: 戻り値構造・モック呼び出し回数・スロー例外型/メッセージ/cause を検証

### モックヘルパ

`__tests__/late-chunking/` 配下にヘルパ `createXenovaMockOutputs(seqLen, hiddenSize)` を本テストファイル内 helper として定義し、`{ last_hidden_state: { dims: [1, seqLen, hiddenSize], data: Float32Array } }` 形状を生成する。`offset_mapping` も `Int32Array(seqLen * 2)` で生成する。

## 参照資料

- `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`（契約）
- `packages/shared/src/services/embedding/__tests__/late-chunking/late-chunking-service.test.ts`（モック流儀）
- `outputs/phase-2/class-design.md` / `encode-flow.md` / `error-decision-table.md`
- `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`
- Issue #2312 AC-1〜AC-8

## 実行手順

1. `packages/shared/src/services/embedding/__tests__/late-chunking/` 配下に `xenova-transformer-encoder.test.ts` を新規作成する
2. ファイル冒頭にタスクID・対象クラス・テストID 一覧（XENC-\*）をコメントで明記する
3. `vi.hoisted()` / `vi.mock("@xenova/transformers")` を上記モック戦略どおりに設定する
4. 上記テストケース一覧の 18 ケースを `describe` / `it` 階層で記述する（コードは Phase 5 で本体が無いため Red）
5. `pnpm --filter @repo/shared test -- --run xenova-transformer-encoder` で実行し、`Cannot find module './xenova-transformer-encoder'` 等の import エラーで FAIL することを確認する（Red 状態）
6. 既存 late-chunking テストが PASS していることを `pnpm --filter @repo/shared test -- --run late-chunking` で確認する

## 統合テスト連携

Phase 4 ではユニットテストのみを作成し、`LateChunkingService` との統合テストは Phase 6 で扱う。本フェーズで追加したテストが既存 `late-chunking-service.test.ts` / `hidden-state-pooler.test.ts` 等の挙動に影響しないことを `pnpm --filter @repo/shared test -- --run late-chunking` で確認する。

## 多角的チェック観点

- テストID 命名: 採番規則 `XENC-{NORMAL|ERROR|BOUNDARY}-NN` に準拠しているか
- モック粒度: `@xenova/transformers` の API（`from_pretrained` / `tokenizer(text, opts)` / `model(inputs)`）すべてをスパイしているか
- AC カバレッジ: AC-1/AC-2/AC-3/AC-4/AC-5 がテスト ID と紐付いているか（AC-6 は Phase 6、AC-7/AC-8 は Phase 5/7）
- AAA 分離: 各 `it` で Arrange/Act/Assert がコメントまたは空行で視認可能か
- Red 状態の正当性: 失敗理由が「実装未存在」または「契約未充足」であり、モックエラー・構文エラーではないこと
- 副作用なし: テスト間で `vi.clearAllMocks()` または `beforeEach` で状態リセットしているか

## 受け入れ基準（Phase 4 固有）

| AC番号 | 条件                                                                                      | 検証方法           |
| ------ | ----------------------------------------------------------------------------------------- | ------------------ |
| P4-AC1 | テストファイル `xenova-transformer-encoder.test.ts` が新規作成されている                  | ファイル存在確認   |
| P4-AC2 | XENC-NORMAL/ERROR/BOUNDARY の全 18 ケースが `it()` で定義されている                       | grep カウント      |
| P4-AC3 | `vi.mock("@xenova/transformers")` が宣言されている                                        | grep               |
| P4-AC4 | `pnpm --filter @repo/shared test -- --run xenova-transformer-encoder` が FAIL する（Red） | テスト実行         |
| P4-AC5 | FAIL の原因が「実装未存在」または「契約未充足」で、モック構文エラーが無い                 | テスト実行ログ確認 |
| P4-AC6 | 既存 late-chunking 関連テストが引き続き PASS している                                     | テスト実行         |

## サブタスク管理

| サブタスクID | 内容                                        | 担当 |
| ------------ | ------------------------------------------- | ---- |
| ST-4-01      | テストファイル骨格作成（`describe` ツリー） | -    |
| ST-4-02      | `vi.hoisted` / `vi.mock` モック設定         | -    |
| ST-4-03      | 正常系 6 ケース記述（XENC-NORMAL-01〜06）   | -    |
| ST-4-04      | 異常系 8 ケース記述（XENC-ERROR-01〜08）    | -    |
| ST-4-05      | 境界系 4 ケース記述（XENC-BOUNDARY-01〜04） | -    |
| ST-4-06      | Red 状態確認とログ記録                      | -    |

## 成果物

- `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-transformer-encoder.test.ts`（Red 状態）
- `outputs/phase-4/red-test-result.md`（FAIL 理由の実行ログ記録、テストID と AC のマッピング表）

## 完了条件

- [ ] `xenova-transformer-encoder.test.ts` が作成され、18 ケースが定義されている
- [ ] `vi.mock("@xenova/transformers")` でモックが設定されている
- [ ] テスト実行が FAIL し、原因が実装未存在であることが確認されている
- [ ] 既存 late-chunking テストが PASS している
- [ ] `red-test-result.md` に FAIL 理由・テストID 一覧・AC マッピングが記録されている

## タスク100%実行確認【必須】

1. テスト ID `XENC-NORMAL-01` 〜 `XENC-BOUNDARY-04` の 18 件すべてが定義されているか
2. AC-1/AC-2/AC-3/AC-4/AC-5 が少なくとも 1 つのテスト ID にマッピングされているか
3. Red の失敗が「実装未存在」起因のみで、モック設定エラーが含まれていないか
4. 既存 late-chunking テストが回帰していないか
5. `red-test-result.md` に実行コマンド・出力ログ・日時が記録されているか

## 次Phase

Phase 5（実装 Green）へ進む。Phase 4 で作成したテストを PASS させるための `XenovaTransformerEncoder` 本体実装と `index.ts` エクスポート追加、依存パッケージ追加（`@xenova/transformers`）を行う。Phase 4 のテストが Green 化した時点で AC-1〜AC-5 と AC-7 が達成される。
