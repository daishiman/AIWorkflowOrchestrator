# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| タスクID   | UNASSIGNED-EMB-005-A                                     |
| タスク名   | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス） |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-20                                               |
| 前Phase    | 5: 実装（Green）                                         |
| 次Phase    | 7: カバレッジ確認                                        |
| Issue      | #2312                                                    |

## 目的

Phase 5 で Green 化した `XenovaTransformerEncoder` 単体テストに加えて、`LateChunkingService` との統合テストおよび追加境界ケース・回帰テストを追加し、AC-6（`generateChunkEmbeddings()` 動作）を達成する。`XenovaTransformerEncoder` 本体の実装には変更を加えず、テストファイルのみを追加・拡充する。

## 実行タスク

### タスク 1: LateChunkingService 統合テストの作成

**目的**: AC-6 を達成するため、`XenovaTransformerEncoder` を `LateChunkingService` に DI して `generateChunkEmbeddings()` が動作することを確認する。

**実行手順**:

1. `packages/shared/src/services/embedding/__tests__/late-chunking/` 配下に `xenova-encoder-integration.test.ts` を新規作成する
2. `vi.mock("@xenova/transformers")` で実モデルを差し替えつつ、`LateChunkingService` 本体は実装をそのまま使う
3. 既存 `late-chunking-service.test.ts` のフィクスチャ生成パターン（`hiddenStates` モックの構築方法）を踏襲する
4. `pnpm --filter @repo/shared test -- --run xenova-encoder-integration` で PASS を確認する

**統合テストケース一覧**:

| テストID    | 区分     | 対象                                  | 期待挙動                                                                                 |
| ----------- | -------- | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| XENC-INT-01 | 結合正常 | `generateChunkEmbeddings(text, [c1])` | 1 チャンク入力で `ChunkEmbeddingResult[]` が 1 件返り、`embedding.length === hiddenSize` |
| XENC-INT-02 | 結合正常 | 複数チャンク（3 件）                  | `chunkId` が一致し、`tokenCount` が `TokenRange` から導出される                          |
| XENC-INT-03 | 結合正常 | mean pooling                          | `poolingStrategy: "mean"` で平均値が返る（`HiddenStatePooler` 連携）                     |
| XENC-INT-04 | 結合正常 | DI 互換性                             | `new LateChunkingService(new XenovaTransformerEncoder())` がコンパイル/実行可能          |
| XENC-INT-05 | 結合異常 | エンコード失敗                        | `encoder.encode` が `EmbeddingError` を投げると `generateChunkEmbeddings` が伝搬する     |
| XENC-INT-06 | 結合異常 | OOM 伝搬                              | `OutOfMemoryError` が `LateChunkingService` を通り抜けて呼び出し元に届く                 |

**擬似コード（テスト構成方針）**:

```typescript
import { LateChunkingService } from "../../late-chunking/late-chunking-service";
import { XenovaTransformerEncoder } from "../../late-chunking/xenova-transformer-encoder";

// vi.mock("@xenova/transformers") で from_pretrained / tokenizer / model をモック
// fixture: hiddenSize=8, seqLen=12, offset_mapping=[0,3,3,5,...]

describe("XenovaTransformerEncoder × LateChunkingService 統合", () => {
  it("XENC-INT-01: generateChunkEmbeddings が 1 チャンクで動作する", async () => {
    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);
    const result = await service.generateChunkEmbeddings("hello world", [
      { startChar: 0, endChar: 11, chunkId: "c1" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.embedding).toHaveLength(HIDDEN_SIZE);
  });
});
```

### タスク 2: 追加境界ケースの拡充

**目的**: Phase 4 の境界ケース（XENC-BOUNDARY-01〜04）を補強し、CJK・絵文字・大規模テキストなど offset_mapping の特殊ケースを検証する。

**実行手順**:

1. Phase 4 で作成した `xenova-transformer-encoder.test.ts` の `describe("BOUNDARY", ...)` ブロックに以下のケースを追記する
2. 既存 18 ケースのテスト ID と重複しない採番（`XENC-BOUNDARY-05` 以降）を使用する
3. `pnpm --filter @repo/shared test -- --run xenova-transformer-encoder` で全 PASS を確認する

**追加境界ケース一覧**:

| テストID         | 対象                          | 期待挙動                                                                             |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| XENC-BOUNDARY-05 | CJK 文字列（"日本語テスト"）  | `offsetMapping` の `[start, end]` が UTF-16 コードユニット境界で正しい               |
| XENC-BOUNDARY-06 | 絵文字（"hello 🎉 world"）    | サロゲートペアを含んでも `offsetMapping` が壊れない                                  |
| XENC-BOUNDARY-07 | 大規模テキスト（seqLen=2048） | OOM を起こさず通常終了する（モック側で大サイズ Float32Array を返す）                 |
| XENC-BOUNDARY-08 | 単一トークン                  | `seqLen=1` で `hiddenStates.length === 1`、`offsetMapping.length === 1`              |
| XENC-BOUNDARY-09 | 奇数長 offset_mapping         | `convertOffsetTensor` が末尾要素を破棄して安全に動作する（設計確定後の挙動を固定化） |

### タスク 3: 回帰テスト観点の追加

**目的**: 将来 `@xenova/transformers` のバージョンアップや `late-chunking-types.ts` の変更による回帰を検出するための観点を整備する。

**実行手順**:

1. `xenova-transformer-encoder.test.ts` に `describe("REGRESSION", ...)` ブロックを追加する
2. 以下の回帰テストケースを記述する
3. PASS を確認する

**回帰テストケース一覧**:

| テストID    | 対象                             | 期待挙動                                                                 |
| ----------- | -------------------------------- | ------------------------------------------------------------------------ |
| XENC-REG-01 | `IEncoder` 契約の維持            | `XenovaTransformerEncoder` のインスタンスが `IEncoder` 型変数に代入可能  |
| XENC-REG-02 | `EncoderOutput` フィールド       | 戻り値オブジェクトのキーが `hiddenStates` / `offsetMapping` の 2 つのみ  |
| XENC-REG-03 | `last_hidden_state` API 形状変更 | `last_hidden_state` が undefined でも `hidden_states.at(-1)` で fallback |
| XENC-REG-04 | デフォルトモデル名               | `Xenova/all-MiniLM-L6-v2` がハードコードされていることをスナップショット |
| XENC-REG-05 | エラー型階層                     | `OutOfMemoryError` が `EmbeddingError` を継承していること（instanceof）  |

### タスク 4: 全体テスト PASS の確認

**目的**: 追加した統合テスト・境界ケース・回帰テストすべてを含めて `packages/shared` 全体が PASS することを確認する。

**実行手順**:

1. `pnpm --filter @repo/shared test` で全テストを実行
2. `pnpm --filter @repo/shared typecheck` で型チェック
3. 失敗テストがある場合は実装ではなくテストの記述ミスを疑い、Phase 5 完了状態に戻していないかを確認
4. PASS 結果を `outputs/phase-6/expansion-test-result.md` に記録する

## 参照資料

| 参照資料                       | パス                                                                                                | 内容                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 ユニットテスト         | `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-transformer-encoder.test.ts` | 既存 18 ケース・モック流儀   |
| LateChunkingService 既存テスト | `packages/shared/src/services/embedding/__tests__/late-chunking/late-chunking-service.test.ts`      | 統合テストの DI パターン参考 |
| Phase 5 実装                   | `packages/shared/src/services/embedding/late-chunking/xenova-transformer-encoder.ts`                | テスト対象                   |
| 契約                           | `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`                       | `IEncoder` / `EncoderOutput` |
| 元仕様書                       | `docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-A.md`                                         | AC-6 の検証手段              |
| system spec 正本               | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                                | Late Chunking 契約           |

## 成果物

| 成果物             | パス                                                                                                | 内容                                               |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 統合テストファイル | `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-encoder-integration.test.ts` | 新規（XENC-INT-01〜06）                            |
| 境界・回帰追加分   | `packages/shared/src/services/embedding/__tests__/late-chunking/xenova-transformer-encoder.test.ts` | 既存ファイルへ追記（BOUNDARY-05〜09 / REG-01〜05） |
| テスト結果記録     | `outputs/phase-6/expansion-test-result.md`                                                          | 全 PASS のテスト ID 一覧と実行時間                 |
| 統合テスト計画書   | `outputs/phase-6/integration-test-plan.md`                                                          | XENC-INT 系のフィクスチャ仕様                      |

## 統合テスト連携

- AC-6（`LateChunkingService` 統合）を `XENC-INT-01〜06` の 6 ケースで達成する
- `LateChunkingService` 本体には変更を加えず、`XenovaTransformerEncoder` を DI するシナリオのみで検証する
- 既存 `late-chunking-service.test.ts` の DI パターン（モック `IEncoder` 注入）と整合させ、フィクスチャ流儀を共通化する
- スナップショットを使用する場合は `__snapshots__/` 配下に配置し、Git 追跡対象に含める

## 多角的チェック観点

| 観点           | チェック内容                                                                  |
| -------------- | ----------------------------------------------------------------------------- |
| 統合カバレッジ | `generateChunkEmbeddings()` の正常・異常両系統がカバーされているか            |
| DI 互換性      | `IEncoder` 互換性が型レベル + 実行時の両方で確認されているか                  |
| 境界網羅性     | CJK・絵文字・大規模テキスト・単一トークン・奇数長 offset がカバーされているか |
| 回帰検出力     | `IEncoder` 契約・エラー型階層・デフォルトモデル名の変更を検出できるか         |
| エラー伝搬     | `EmbeddingError` / `OutOfMemoryError` が `LateChunkingService` 経由で届くか   |
| 実モデル不要   | すべてのテストが `vi.mock` で完結し、HuggingFace Hub へのアクセスが無いか     |
| CI 時間影響    | 追加テストによる CI 増分が 30 秒以内か                                        |

## 受け入れ基準（Phase 6 固有）

| AC番号 | 条件                                                                                  | 検証方法       |
| ------ | ------------------------------------------------------------------------------------- | -------------- |
| P6-AC1 | `xenova-encoder-integration.test.ts` が新規作成され、XENC-INT-01〜06 が定義されている | ファイル/grep  |
| P6-AC2 | `xenova-transformer-encoder.test.ts` に BOUNDARY-05〜09 / REG-01〜05 が追記されている | grep           |
| P6-AC3 | `pnpm --filter @repo/shared test` で全テスト PASS                                     | テスト実行     |
| P6-AC4 | `pnpm typecheck` が PASS                                                              | typecheck 実行 |
| P6-AC5 | 実モデルへのネットワークアクセスが発生しない（全モック）                              | コードレビュー |
| P6-AC6 | AC-6（`generateChunkEmbeddings()` 動作）が `XENC-INT-01〜04` で達成されている         | テスト実行ログ |

## サブタスク管理

| サブタスクID | 内容                                                | ステータス |
| ------------ | --------------------------------------------------- | ---------- |
| ST-6-01      | `xenova-encoder-integration.test.ts` 新規作成       | 未実施     |
| ST-6-02      | XENC-INT-01〜06 の 6 ケース実装                     | 未実施     |
| ST-6-03      | XENC-BOUNDARY-05〜09 を既存ファイルに追記           | 未実施     |
| ST-6-04      | XENC-REG-01〜05 を既存ファイルに追記                | 未実施     |
| ST-6-05      | `expansion-test-result.md` に PASS 記録             | 未実施     |
| ST-6-06      | `integration-test-plan.md` にフィクスチャ仕様を記録 | 未実施     |

## 完了条件

- [ ] `xenova-encoder-integration.test.ts` が作成され、6 ケースが PASS している
- [ ] 既存 `xenova-transformer-encoder.test.ts` に境界 5 ケース・回帰 5 ケースが追記されている
- [ ] `pnpm --filter @repo/shared test` で全テスト PASS（既存テスト含む）
- [ ] `pnpm typecheck` が PASS
- [ ] AC-6 が `XENC-INT-01〜04` のいずれかで達成されている
- [ ] `expansion-test-result.md` / `integration-test-plan.md` が作成されている
- [ ] 実モデルへのネットワークアクセスが無いことが確認されている

## タスク100%実行確認【必須】

- [ ] 統合テスト 6 ケース・境界 5 ケース・回帰 5 ケース、計 16 ケースが追加されているか
- [ ] AC-6 の達成根拠となるテスト ID が記録されているか
- [ ] `LateChunkingService` 本体への変更が無いことを `git diff` で確認したか
- [ ] `expansion-test-result.md` に実行日時・テスト ID・実行時間が記録されているか
- [ ] CI 時間増分が 30 秒以内であることを記録したか

## 次Phase

Phase 7（カバレッジ確認）へ進む。Phase 4〜6 で追加した全テストを対象に、`pnpm --filter @repo/shared test -- --coverage` を実行し、`xenova-transformer-encoder.ts` の Statements / Branches / Functions / Lines のカバレッジが基準値（90% 目安）を満たすことを確認する。未到達分があれば Phase 6 へ差し戻し、追加境界ケースで補完する。
