# [#2311] test(embedding): CJK（日本語）テキストのoffset_mappingテストケース追加 [UNASSIGNED-EMB-005-B]

## メタ情報

```yaml
task_id: UNASSIGNED-EMB-005-B
task_name: UNASSIGNED
category: -
target_feature: -
priority: low
scale: small
status: open
source_phase: -
created_date: 2026-04-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UNASSIGNED-EMB-005-B.md
```

| 項目       | 内容  |
| ---------- | ----- |
| 優先度     | low   |
| 規模       | small |
| ステータス | open  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UNASSIGNED-EMB-005` にて Late Chunking 機能（`TokenBoundaryCalculator` を含む）を実装した。
この実装ではテキストをトークン単位で分割し、各チャンクの埋め込みベクトルを計算するために `offset_mapping` を利用している。

`offset_mapping` とは、トークナイザーが各トークンを元テキストのどの文字位置（char offset）に対応させるかを示すマッピング情報であり、
`[startChar, endChar]` の配列として表現される。

ただし、UNASSIGNED-EMB-005 での実装時にテストは**英語テキスト中心**で行われた。
現在の `token-boundary-calculator.test.ts` は 5 件のテストケースを持つが、すべて ASCII 英語テキストを対象としている。

### 1.2 問題点・課題

CJK 文字（日本語・中国語・韓国語）は 1 文字が 3 バイト（UTF-8）を占める。
JavaScript の `string` は UTF-16 単位でインデックスを数えるため、英語テキストと比べてオフセット計算が複雑になる。

具体的な問題は以下の通りである。

| 問題                         | 内容                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| バイト境界とチャー境界のズレ | ASCII では 1 文字 = 1 バイト = 1 チャーだが、日本語は 1 文字 = 3 バイト（UTF-8）= 1 チャー（UTF-16）   |
| サロゲートペアによる境界ずれ | 絵文字等は 1 コードポイントが 2 チャー（サロゲートペア）を消費するため、`string.length` と直感が異なる |
| トークナイザーごとの差異     | sentencepiece は単語ではなくバイト境界でトークン分割するため、wordpiece と異なる offset_mapping を生成 |
| 混在テキストのオフセット計算 | 「Hello、世界！」のように CJK と ASCII が混在する場合に境界計算が特に複雑になる                        |

これらのケースが未テストのまま残ると、実際に日本語テキストを含む文書を Late Chunking で処理した際に
チャンク境界がずれ、埋め込みベクトルの品質が低下するリスクがある。

### 1.3 放置した場合の影響

- 日本語テキストを含む文書で `TokenBoundaryCalculator` が誤ったトークン範囲を計算しても、テストで検出できない
- 本番環境で初めてバグが発見される可能性があり、修正コストが増大する
- CJK 対応を謳った機能が実態として未検証のまま公開されるリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`token-boundary-calculator.test.ts` に CJK テキストを対象としたテストケースを追加し、
`TokenBoundaryCalculator` が日本語・中国語・韓国語・絵文字を含むテキストでも
正しく offset_mapping を処理できることを自動テストで保証する。

### 2.2 最終ゴール

- ひらがな・カタカナ・漢字混在テキストの offset 計算テスト追加（最低 3 ケース）
- CJK 文字と ASCII が混在するテキストのテスト追加（最低 2 ケース）
- サロゲートペア（絵文字等）を含むテキストのテスト追加（最低 1 ケース）
- チャンク境界が CJK 文字の途中に来るケースの境界値テスト追加（最低 2 ケース）
- 全テストケースが PASS する

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/services/embedding/__tests__/late-chunking/token-boundary-calculator.test.ts` へのテストケース追加
- モックの `offset_mapping` を CJK テキストに対応した値で設定
- テストヘルパー（CJK オフセット計算用ユーティリティ）が必要な場合のみ追加

#### 含まないもの

- `TokenBoundaryCalculator` 本体の実装変更（テスト追加のみ）
- 他のテストファイルへの変更
- 実際のトークナイザー（transformers.js 等）の組み込み（モックで代替）
- `LateChunkingService` の統合テストへの CJK 対応（別タスクとして切り出す）

### 2.4 成果物

| 種別   | 成果物                                  | 配置先                                                                                             |
| ------ | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| テスト | CJK テキスト対応テストケース（8件以上） | `packages/shared/src/services/embedding/__tests__/late-chunking/token-boundary-calculator.test.ts` |

---

## 3. どのように実装するか（How）

### 3.1 実装アプローチ

`TokenBoundaryCalculator` の単体テストでは、`IEncoder` インターフェースをモックすることで
実際のトークナイザーを使わずに `offset_mapping` を直接指定できる。
このため、CJK テキストに対応したテストケースは、CJK 文字の各文字位置（char offset）を
正確にモック化した `offset_mapping` を設定することで実現する。

### 3.2 テストケース一覧

#### TC-CJK-01: 純粋な日本語テキスト（ひらがな）

```typescript
it("TC-CJK-01: ひらがなテキストでchar境界が正しくトークン境界にマッピングされる", () => {
  // テキスト: "あいうえお" (5文字, 各1チャー)
  // offset_mapping: [[0,1],[1,2],[2,3],[3,4],[4,5]]
  // チャンク境界: startChar=2, endChar=4 → "うえ" に対応するトークン範囲
  const offsetMapping: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
  ];
  // チャンク境界 char 2..4 → token index 2..4
  const result = calculator.charBoundaryToTokenBoundary(2, 4, offsetMapping);
  expect(result).toEqual({ startToken: 2, endToken: 4 });
});
```

#### TC-CJK-02: 漢字・ひらがな・カタカナ混在テキスト

```typescript
it("TC-CJK-02: 漢字・ひらがな・カタカナが混在するテキストでトークン境界が正しく計算される", () => {
  // テキスト: "日本語テスト" (6文字)
  // sentencepiece 系モデルを想定したoffset_mapping
  const offsetMapping: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
  ];
  const result = calculator.charBoundaryToTokenBoundary(0, 3, offsetMapping);
  expect(result).toEqual({ startToken: 0, endToken: 3 });
});
```

#### TC-CJK-03: CJK と ASCII の混在テキスト

```typescript
it("TC-CJK-03: 日本語とASCIIが混在するテキストでトークン境界が正しく計算される", () => {
  // テキスト: "Hello世界" (7文字: 5ASCII + 2CJK)
  // ASCII部分は wordpiece でサブワード分割される可能性あり
  // ここでは簡略化して1対1マッピングとする
  const offsetMapping: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
  ];
  // チャンク境界がASCII末尾とCJK先頭をまたぐケース
  const result = calculator.charBoundaryToTokenBoundary(3, 6, offsetMapping);
  expect(result).toEqual({ startToken: 3, endToken: 6 });
});
```

#### TC-CJK-04: CJK 文字がチャンク境界に来るケース

```typescript
it("TC-CJK-04: チャンク境界がCJK文字の直後に来る場合にトークン境界が正しく計算される", () => {
  // テキスト: "東京は日本の首都です" (9文字)
  const offsetMapping: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
  ];
  // チャンク境界が "東京は" (char 0..3) に対応
  const result = calculator.charBoundaryToTokenBoundary(0, 3, offsetMapping);
  expect(result).toEqual({ startToken: 0, endToken: 3 });
});
```

#### TC-CJK-05: サロゲートペア（絵文字）を含むテキスト

```typescript
it("TC-CJK-05: サロゲートペア（絵文字）を含むテキストでchar境界とtoken境界が正しく対応する", () => {
  // テキスト: "😀あいう" (😀は2チャー消費: str.length=5, codePointCount=4)
  // offset_mapping はコードポイント単位ではなくchar単位で記録されることが多い
  // トークナイザーによって絵文字の扱いが異なる点を考慮したモック
  const offsetMapping: [number, number][] = [
    [0, 2], // 😀 (サロゲートペア: チャー0-2)
    [2, 3], // あ
    [3, 4], // い
    [4, 5], // う
  ];
  // チャンク境界: char 2..5 → "あいう" に対応するトークン
  const result = calculator.charBoundaryToTokenBoundary(2, 5, offsetMapping);
  expect(result).toEqual({ startToken: 1, endToken: 4 });
});
```

#### TC-CJK-06: チャンク境界が CJK トークンの中間に来る場合（境界値テスト）

```typescript
it("TC-CJK-06: チャンク境界がCJKトークンの内側に来た場合に最近傍トークン境界を返す", () => {
  // テキスト: "漢字Test" で "漢" が1トークンに対応しているが
  // チャンク境界が "漢" の途中（存在しないchar位置）を指している場合
  // TokenBoundaryCalculatorは最近傍のトークン境界に丸める
  const offsetMapping: [number, number][] = [
    [0, 2], // "漢字" が1トークンにまとめられるケース
    [2, 4], // "Te"
    [4, 5], // "st" の残り
  ];
  // チャンク境界 startChar=1 は "漢字" トークン[0,2] の途中 → token 0に丸め
  const result = calculator.charBoundaryToTokenBoundary(1, 5, offsetMapping);
  // 実装の丸め方針（切り捨て or 切り上げ）に応じて期待値を確定すること
  expect(result.startToken).toBeGreaterThanOrEqual(0);
  expect(result.endToken).toBeLessThanOrEqual(3);
});
```

#### TC-CJK-07: 韓国語テキスト（ハングル）

```typescript
it("TC-CJK-07: 韓国語（ハングル）テキストでトークン境界が正しく計算される", () => {
  // テキスト: "안녕하세요" (5文字, 各1チャー)
  const offsetMapping: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
  ];
  const result = calculator.charBoundaryToTokenBoundary(1, 4, offsetMapping);
  expect(result).toEqual({ startToken: 1, endToken: 4 });
});
```

#### TC-CJK-08: 中国語テキスト（簡体字）と ASCII の混在

```typescript
it("TC-CJK-08: 中国語と数字が混在するテキストでトークン境界が正しく計算される", () => {
  // テキスト: "第1章：序論" (7文字: CJK + ASCII + CJK)
  const offsetMapping: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
  ];
  const result = calculator.charBoundaryToTokenBoundary(0, 3, offsetMapping);
  expect(result).toEqual({ startToken: 0, endToken: 3 });
});
```

### 3.3 確認コマンド

```bash
# テスト単体実行
pnpm --filter @repo/shared vitest run packages/shared/src/services/embedding/__tests__/late-chunking/token-boundary-calculator.test.ts

# 全 late-chunking テスト実行
pnpm --filter @repo/shared vitest run packages/shared/src/services/embedding/__tests__/late-chunking/

# 型チェック
pnpm --filter @repo/shared typecheck
```

---

## 4. 実行手順（Phase 1-13）

| Phase    | 名称              | 主な作業                                                                                     |
| -------- | ----------------- | -------------------------------------------------------------------------------------------- |
| Phase 1  | 要件確認          | AC の確定・テストケース数と対象スコープの確定                                                |
| Phase 2  | 設計              | モックの `offset_mapping` 設計・各 CJK テキストのトークン境界の期待値を事前計算              |
| Phase 3  | 設計レビュー      | `TokenBoundaryCalculator` の実装との整合性確認・テストが実装の仕様を正しく反映しているか確認 |
| Phase 4  | テスト作成（Red） | TC-CJK-01〜TC-CJK-08 を記述し、まず Red（失敗）であることを確認                              |
| Phase 5  | 実装（Green）     | テストが PASS するように `TokenBoundaryCalculator` の既存実装を確認・必要に応じて修正        |
| Phase 6  | テスト拡充        | エッジケース（空テキスト・全角記号・長文 CJK）追加                                           |
| Phase 7  | カバレッジ確認    | `pnpm --filter @repo/shared test` でカバレッジを計測し、CJK パスが通っていることを確認       |
| Phase 8  | リファクタリング  | テストコードの共通ヘルパー抽出・モック定義の整理                                             |
| Phase 9  | 品質保証          | lint・typecheck・全テスト通過確認                                                            |
| Phase 10 | 最終レビュー      | AC 全件チェック・テストの説明文が日本語で分かりやすいか確認                                  |
| Phase 11 | 手動テスト        | N/A（テスト強化タスクのため、CI での自動テスト実行をもって代替）                             |
| Phase 12 | ドキュメント更新  | 実装ガイド・未タスク検出・スキルフィードバック作成・本仕様書の苦戦箇所セクション更新         |
| Phase 13 | PR 作成           | レビュー依頼・マージ                                                                         |

---

## 5. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                       | 検証方法           |
| ------ | -------------------------------------------------------------------------- | ------------------ |
| AC-1   | TC-CJK-01〜TC-CJK-05 の 5 件が全て PASS する                               | vitest run         |
| AC-2   | TC-CJK-06〜TC-CJK-08 の 3 件（境界値・韓国語・中国語混在）が全て PASS する | vitest run         |
| AC-3   | 既存の英語テキスト対象の 5 件のテストが引き続き PASS する（回帰テスト）    | vitest run         |
| AC-4   | `pnpm --filter @repo/shared typecheck` が PASS する                        | typecheck コマンド |
| AC-5   | `pnpm lint` が PASS する                                                   | lint コマンド      |
| AC-6   | サロゲートペア（絵文字）テスト TC-CJK-05 が PASS する                      | vitest run         |

---

## 6. 苦戦箇所と知見（UNASSIGNED-EMB-005 実装時の経験より）

### 6.1 CJK 文字のoffset_mapping 処理の複雑性

**苦戦した点**: `TokenBoundaryCalculator` は `offset_mapping` に基づいてチャーオフセット（char offset）から
トークンインデックスへの変換を行う。英語テキストでは 1 文字 = 1 トークンが多く直感的だが、
CJK テキストではトークナイザーの種類によって同じ文字が異なる粒度でトークン分割される。

例えば sentencepiece は「東京」を `["東", "京"]` と 1 文字単位に分割することが多いが、
wordpiece 系は `["東京"]` として 2 文字をまとめて 1 トークンにすることもある。
この違いにより、同じチャンク境界を指定しても `offset_mapping` の値が異なり、
テストの期待値をどちらのトークナイザーを想定して設計するかが難しかった。

**知見**: テストではモックの `offset_mapping` を自分で設定するため、特定のトークナイザーに依存しない。
ただし、本番環境で使用する実際のトークナイザー（transformers.js 等）の出力と
テストのモックが整合しているかを別途確認する統合テストが必要になる可能性がある。
これは別タスクとして切り出すことを推奨する。

### 6.2 サロゲートペアとJavaScriptの`string.length`の落とし穴

**苦戦した点**: JavaScript の `string.length` は UTF-16 コードユニット数を返す。
絵文字等のサロゲートペアは 2 コードユニットを消費するため、`"😀".length === 2` となる。
この場合、`offset_mapping` が `[0, 2]`（char 0〜2）を返すと、
チャンク境界の計算で直感とズレが生じる。

**知見**: `TokenBoundaryCalculator` が内部で `Array.from()` または `[...str]` によって
コードポイント単位でイテレートしているか、あるいは UTF-16 コードユニット単位か確認すること。
テストケース TC-CJK-05 はこの点を明示的に検証するため、実装の実際の挙動に合わせて期待値を調整する。

### 6.3 テストケース期待値の事前計算

**苦戦した点**: CJK 文字を含むテキストの `offset_mapping` をモックで設定する際、
正しいチャンク境界とトークンインデックスの対応を手動で計算する必要がある。
英語と異なり直感が働きにくく、期待値のミスが起きやすい。

**知見**: テスト記述前に以下の表を作成して期待値を整理することを推奨する。

```
テキスト: "日本語テスト"
インデックス: 0=日, 1=本, 2=語, 3=テ, 4=ス, 5=ト
offset_mapping: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]
チャンク境界 [0, 3] → token [0, 3]（"日本語"）
チャンク境界 [3, 6] → token [3, 6]（"テスト"）
```

このような表を各テストケースのコメントとして残すことで、将来の保守者が意図を理解しやすくなる。

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                                                                          |
| ----------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `TokenBoundaryCalculator` が CJK 未対応で実装を要する | 高     | 中       | Phase 5 で実装確認し、必要に応じて `TokenBoundaryCalculator` を修正する（本タスクスコープ内） |
| サロゲートペアの取り扱いが実装とテストで不一致        | 高     | 中       | TC-CJK-05 を Red/Green サイクルで慎重に検証し、期待値を実装の実際の挙動に合わせて調整する     |
| モックの offset_mapping が実際のトークナイザーと乖離  | 中     | 中       | コメントに「想定トークナイザー」を明記し、統合テストの必要性を別タスクとして記録する          |
| 既存 5 件のテストへの回帰影響                         | 低     | 低       | テストケース追加のみのため既存テストへの影響は最小限。AC-3 で回帰確認を必須とする             |
| esbuild mismatch による vitest 起動失敗               | 中     | 低       | `pnpm install` を実行することで解消する（過去タスクで実績あり）                               |

---

## 8. 参照情報

| 資料名                      | パス                                                                                               | 用途                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 対象テストファイル          | `packages/shared/src/services/embedding/__tests__/late-chunking/token-boundary-calculator.test.ts` | テストケース追加先                               |
| Late Chunking 型定義        | `packages/shared/src/services/embedding/late-chunking/late-chunking-types.ts`                      | `ChunkBoundary`・`TokenRange`・`EncoderOutput`型 |
| Late Chunking サービス実装  | `packages/shared/src/services/embedding/late-chunking/late-chunking-service.ts`                    | TokenBoundaryCalculator の使用コンテキスト確認   |
| 既存 late-chunking テスト群 | `packages/shared/src/services/embedding/__tests__/late-chunking/`                                  | 既存テストのパターン参照                         |
| 発見元タスク仕様書          | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/`                                              | UNASSIGNED-EMB-005 の実装経緯・設計方針          |

---

## 9. 完了条件チェックリスト

- [ ] TC-CJK-01: ひらがなテキストのテストが PASS する
- [ ] TC-CJK-02: 漢字・ひらがな・カタカナ混在テキストのテストが PASS する
- [ ] TC-CJK-03: CJK と ASCII 混在テキストのテストが PASS する
- [ ] TC-CJK-04: チャンク境界が CJK 文字直後に来るテストが PASS する
- [ ] TC-CJK-05: サロゲートペア（絵文字）を含むテキストのテストが PASS する
- [ ] TC-CJK-06: CJK トークン内部境界の境界値テストが PASS する
- [ ] TC-CJK-07: 韓国語（ハングル）テキストのテストが PASS する
- [ ] TC-CJK-08: 中国語と数字混在テキストのテストが PASS する
- [ ] 既存の英語テキスト対象テスト 5 件が全て引き続き PASS する
- [ ] `pnpm --filter @repo/shared typecheck` が PASS する
- [ ] `pnpm lint` が PASS する
- [ ] 各テストケースにコメントでテキスト・offset_mapping・期待値の対応表が記載されている

---

## 10. Phase 12 概念説明（中学生レベル）

### Late Chunking とは何か

「Late Chunking（遅延チャンキング）」を中学生向けに説明すると以下のようになる。

**テキストの「切り方」の工夫**

AIが長い文章を理解するとき、文章をいくつかの「塊（チャンク）」に分割して処理することがある。
普通の切り方（Early Chunking）では、先に文章を切ってからそれぞれをバラバラに処理するため、
前後の文脈が失われてしまう。

Late Chunking はこれを改善する手法で、「先に全体を読んでから後で切る」アプローチをとる。
全文を一度 AI に読ませてから、後でその理解結果を切り分けることで、
各チャンクが前後の文脈を保持したまま意味を表現できる。

### offset_mapping とは何か

**「どの言葉がどこにあるか」を記録するメモ**

AI がテキストを処理するとき、まず文章を「トークン（token）」と呼ばれる小さな単位に分割する。
英語では「Hello」が 1 トークンになったり、「unhappy」が「un」と「happy」の 2 トークンに分割されたりする。

`offset_mapping` は、「このトークンは元の文章の何文字目から何文字目に対応するか」を記録したメモである。
例えば「Hello」が文章の 0 文字目〜5 文字目なら、`[0, 5]` と記録する。

### なぜ CJK 文字が難しいか

**1文字の「重さ」が言語によって違う**

コンピューターは文字を数字（バイト）として記録している。

- 英語の「A」は 1 バイト（軽い）
- 日本語の「あ」は 3 バイト（重い）
- 絵文字「😀」は 4 バイト（さらに重い）

JavaScript というプログラミング言語では、絵文字 1 文字が「2 文字分の長さ」として数えられることがある。
これを「サロゲートペア」と呼ぶ。

このため、「何文字目から何文字目」という計算が、英語と日本語・絵文字では異なる方法で
行わなければならない。このタスクでは、そのような「難しいケース」を自動テストで確認することが目的である。

### このタスクの価値

現在のテストは英語しか確認していない。
日本語のテキストを処理するアプリを作るとき、テストが英語だけでは
「日本語でバグが起きても気づかない」という問題がある。

このタスクでテストを追加することで、
「日本語でも正しく動くことを毎回自動で確認できる」状態になる。
