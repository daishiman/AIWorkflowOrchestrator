# CJK（日本語）テキストの offset_mapping テストケース追加 - タスク指示書

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | UNASSIGNED-EMB-005-B                                    |
| タスク名     | cjk-offset-mapping-test-coverage                        |
| 分類         | テスト拡充                                              |
| 対象機能     | EmbeddingService - Late Chunking offset_mapping 検証    |
| 優先度       | **低**                                                  |
| 見積もり規模 | 小規模                                                  |
| ステータス   | 未着手                                                  |
| 発見元       | UNASSIGNED-EMB-005 Phase 12 未タスク検出                |
| 発見日       | 2026-04-19                                              |
| depends_on   | UNASSIGNED-EMB-005（完了済み）                          |
| 並行可能     | UNASSIGNED-EMB-005-A（IEncoder 実装クラス作成）と並行可 |
| 関連タスク   | UNASSIGNED-EMB-005                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UNASSIGNED-EMB-005 の Late Chunking 実装では、英語テキストを主な対象として
`offset_mapping` のテストを実施した。しかし、CJK（中国語・日本語・韓国語）文字は
1文字が複数バイト（UTF-8 で 3〜4 バイト）を占めるため、`offset_mapping` の
文字オフセットと バイトオフセットの乖離が発生しやすい。

### 1.2 問題点・課題

- 現在のテストケースは英語テキスト中心
- CJK 文字の multi-byte 特性により offset が正しく計算されない可能性
- 日本語混じりのドキュメント検索時に chunk 境界がずれるリスク
- サロゲートペアや異体字セレクタを含む文字列での動作が未検証

### 1.3 放置した場合の影響

- 日本語テキストの Late Chunking で chunk 境界が文字の途中になる可能性
- Embedding の品質低下（不正な chunk 分割による意味の断絶）
- 本番環境での CJK テキスト処理の信頼性が低い状態が継続する

---

## 2. 何を達成するか（What）

### 2.1 目的

日本語を含む CJK テキストに対して `offset_mapping` が正しく機能することを
テストで保証し、multi-byte 文字処理の信頼性を高める。

### 2.2 最終ゴール

- CJK テキストの `offset_mapping` テストケースが追加されている
- 文字オフセットとバイトオフセットの変換が正しく検証されている
- サロゲートペアを含む文字列でも正しく動作することが確認されている
- 既存テストに加えて CJK 向けカバレッジが向上している

### 2.3 スコープ

#### 含むもの

- 日本語テキスト（ひらがな・カタカナ・漢字）の offset_mapping テスト
- ASCII + 日本語混在テキストのテスト
- サロゲートペア（例: 𠮷）を含む文字列のテスト
- 空白・句読点を含む日本語テキストのテスト

#### 含まないもの

- `IEncoder` 実装クラスの作成（UNASSIGNED-EMB-005-A のスコープ）
- 中国語・韓国語専用のテストケース（日本語のみ優先対応）
- パフォーマンステスト

### 2.4 成果物

| 種別   | 成果物                          | 配置先                                                                                      |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| テスト | CJK offset_mapping テストケース | `packages/shared/src/services/embedding/__tests__/late-chunking/cjk-offset-mapping.test.ts` |

---

## 3. どのように実装するか（How）

### 3.1 テストケース設計

#### ケース 1: 純日本語テキスト

```typescript
it("日本語テキストの offset_mapping が正しく計算される", () => {
  const text = "自然言語処理";
  // 各文字のオフセットが文字単位で正しいことを検証
  // 期待: [0,1], [1,2], [2,3], [3,4], [4,5], [5,6]
});
```

#### ケース 2: ASCII + 日本語混在

```typescript
it("ASCII と日本語が混在するテキストの offset_mapping が正しい", () => {
  const text = "AI自然言語処理NLP";
  // ASCII部分と日本語部分でオフセットが連続していることを検証
});
```

#### ケース 3: サロゲートペアを含む文字列

```typescript
it("サロゲートペア文字を含む場合でも offset_mapping が正しい", () => {
  const text = "𠮷野家"; // 𠮷 は U+20BB7（サロゲートペア）
  // JavaScript の String.length では 2 にカウントされることに注意
  // Unicode コードポイント単位での offset が正しいことを検証
});
```

#### ケース 4: 句読点・空白を含む日本語

```typescript
it("句読点や空白を含む日本語テキストの offset_mapping が正しい", () => {
  const text = "今日は、いい天気です。";
  // 句読点の offset が正しいことを検証
});
```

### 3.2 確認コマンド

```bash
# テスト実行
pnpm --filter @repo/shared test -- --run cjk-offset-mapping

# 全 Late Chunking テスト実行
pnpm --filter @repo/shared test -- --run late-chunking

# 型チェック
pnpm --filter @repo/shared typecheck
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                            | 検証方法           |
| ------ | ----------------------------------------------- | ------------------ |
| AC-1   | 純日本語テキストの offset_mapping テストが PASS | vitest run         |
| AC-2   | ASCII + 日本語混在テキストのテストが PASS       | vitest run         |
| AC-3   | サロゲートペアを含む文字列のテストが PASS       | vitest run         |
| AC-4   | 句読点・空白を含む日本語テキストのテストが PASS | vitest run         |
| AC-5   | 既存の Late Chunking テストが全て引き続き PASS  | vitest run         |
| AC-6   | `pnpm typecheck`（shared）が PASS               | typecheck コマンド |

---

## 5. 苦戦箇所と知見（予測）

### 5.1 JavaScript の文字列とUnicode

**予測される問題**: JavaScript の `String.length` はコードユニット（UTF-16）単位の
長さを返すため、サロゲートペアを含む場合に期待値の計算が複雑になる。

**対処方針**: `Array.from(text).length` や `[...text].length` を使用して
Unicode コードポイント単位での長さを取得する。

### 5.2 Transformer モデルによる tokenization の差異

**予測される問題**: 使用する Transformer モデル（BERT, RoBERTa 等）によって
CJK 文字の tokenization 方式が異なる（文字単位 vs サブワード単位）。

**対処方針**: モックエンコーダーを使用したテストと、
実モデルを使用した統合テストを分離して管理する。

### 5.3 offset_mapping の単位

**予測される問題**: `offset_mapping` が文字オフセットを返すのか
バイトオフセットを返すのかが実装によって異なる可能性がある。

**対処方針**: `IEncoder` のインターフェース定義コメントで offset の単位を
明確に定義し、テストでその仕様を検証する。

---

## 関連リンク

- [UNASSIGNED-EMB-005 仕様書](../UNASSIGNED-EMB-005-late-chunking/index.md)
- [Phase 12 未タスク検出](../UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/unassigned-task-detection.md)
- [Late Chunking テストディレクトリ](../../../../packages/shared/src/services/embedding/__tests__/late-chunking/)
