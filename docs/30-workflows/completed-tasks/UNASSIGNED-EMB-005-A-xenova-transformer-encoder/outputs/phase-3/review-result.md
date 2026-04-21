# 設計レビュー結果

## 観点1: 型安全性 ✅ 承認

- `implements IEncoder` 宣言で `encode()` が `Promise<EncoderOutput>` に静的検証される（AC-1）
- `tokenizer`/`model` は `unknown` 型で保持し、利用直前に局所アサーション → `any` 漏洩ゼロ
- `convertOffsetTensor` / `sliceHiddenStates` の入出力型が明示されている
- 最終 return で `hiddenStates: Float32Array[]` / `offsetMapping: [number,number][]` が型推論される（AC-2）

**指摘なし。差し戻し不要。**

## 観点2: テスト容易性 ✅ 承認

- `convertOffsetTensor` / `sliceHiddenStates` / `classifyError` が純関数として切り出され、単体テスト可能
- 動的 `import("@xenova/transformers")` により `vi.mock()` で完全差し替え可能
- AC-3/AC-4 の注入パターン（`mockRejectedValueOnce(new RangeError("Out of memory"))`）がモックレベルで再現可能
- AC-6 の統合テストで `IEncoder` 互換性が DI で確認可能

**指摘なし。差し戻し不要。**

## 観点3: Electron / ESM 互換性 ✅ 承認（条件付き）

- 動的 `import("@xenova/transformers")` は Electron メインプロセス（Node.js）で動作する
- `@xenova/transformers` ESM-only → `tsconfig` の `module: "ESNext"` 確認を Phase 4/Step 1 で実施
- Electron レンダラーでの動作確認はスコープ外として明示済み（`scope-definition.md`）
- モデルキャッシュパス設定は利用者責務として明示済み

**条件: Phase 4 で tsconfig 確認を実施すること。差し戻し不要。**

## 観点4: メモリ効率 ✅ 承認

- `Float32Array.slice()` で独立コピー → 元テンソルが GC 対象になる
- `seqLen === 0` で空配列を返す設計が後段と整合
- OOM 検知が `loadModel()` / `encode()` の2系統で網羅（`error-decision-table.md`）
- モデルのメモリ常駐トレードオフは認識済み（初回ロード後はキャッシュ）

**指摘なし。差し戻し不要。**

## 観点5: エラー伝搬 ✅ 承認

- 全エラーパスで `{ cause }` を保持（stack trace 維持）
- `instanceof EmbeddingError` を最初にチェックし二重ラップを防止
- `last_hidden_state` / `hidden_states` 双方 undefined の `EmbeddingError` スローパスが設計済み
- エラーメッセージにモデル名を含める（load 系のみ）

**指摘なし。差し戻し不要。**

## 観点6: 並行性 ✅ 承認

- `loadingPromise: Promise<void> | null` キャッシュを採用
- 進行中のロードがある場合は同じ Promise を返す → 二重 `from_pretrained` を防止
- ロード失敗時は `loadingPromise = null` にリセット → 再試行可能
- コスト: フィールド1本のみ。過剰な複雑さにならない

**指摘なし。差し戻し不要。**

## 想定指摘への対応

| 指摘                                   | 対応                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| R-01: `unknown` 型でテスト操作しにくい | `vi.mock()` でモジュール全体差し替え。内部状態は触らない                      |
| R-02: 奇数長 offset_mapping            | 末尾要素破棄を採用（`tensor-conversion-spec.md` に確定済み）                  |
| R-03: 並行二重ロード                   | `loadingPromise` キャッシュで解決（`class-design.md` に明記）                 |
| R-04: OOM 検出の脆弱性                 | `RangeError` + 文字列マッチの2系統。将来の改善は `classifyError` 一箇所で対応 |
| R-05: 動的 import と Vite              | Phase 6 でビルドテスト。必要なら `optimizeDeps.exclude` を追加                |
