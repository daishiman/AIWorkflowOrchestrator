# PlainTextConverter実装 - タスク指示書

## メタ情報

```yaml
issue_number: 611
```

## メタ情報

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | CONV-DEBT-001                                                                    |
| タスク名     | PlainTextConverter実装                                                           |
| 分類         | 要件                                                                             |
| 対象機能     | ファイル変換パイプライン（text/plain対応）                                       |
| 優先度       | 中                                                                               |
| 見積もり規模 | 小規模                                                                           |
| ステータス   | 未実施                                                                           |
| 発見元       | Phase 12（interfaces-converter.md / architecture-file-conversion.md 技術的負債） |
| 発見日       | 2026-01-31                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ファイル変換パイプラインでは`MarkdownConverter`、`HTMLConverter`、`CSVConverter`、`JSONConverter`が実装済みだが、`PlainTextConverter`は`interfaces-converter-implementations.md`で仕様が定義されているにもかかわらず未実装である。`architecture-file-conversion.md`の技術的負債テーブルにも`CONV-DEBT-001`として記録されている（優先度: Medium、見積工数: 4h）。また、`technology-devops.md`では`PlainTextConverter完了後`にPDFConverter導入を予定しており、後続コンバーター実装のブロッカーとなっている。

### 1.2 問題点・課題

- `.txt`ファイルがRAGパイプラインに取り込めない
- BOM付きテキストファイルの正規化処理がない
- 改行コードの統一処理（CRLF→LF）がない
- 後続コンバーター（PDF、Docx、Excel）実装の前提条件が未達

### 1.3 放置した場合の影響

- プレーンテキストファイルがRAG検索対象に含まれず、情報の欠落が発生する
- PDFConverterなど後続コンバーターの導入が遅延する
- 既存のConverterFactoryが`text/plain`を処理できず、エラーを返す

---

## 2. 何を達成するか（What）

### 2.1 目的

`PlainTextConverter`を`FileConverter`インターフェース準拠で実装し、`.txt`ファイルのRAGパイプライン取り込みを可能にする。

### 2.2 最終ゴール

- `PlainTextConverter`が`text/plain`のMIMEタイプを処理できる
- BOM除去・改行コード正規化・連続空行制限が実装されている
- `ConverterFactory`に登録され、自動的に`.txt`ファイルが処理される
- 既存コンバーターと同等の品質基準（テストカバレッジ90%以上）を満たす

### 2.3 スコープ

#### 含むもの

- `PlainTextConverter`クラス実装（`FileConverter`インターフェース準拠）
- BOM除去処理（UTF-8 BOM U+FEFF）
- 改行コード正規化（CRLF/CR → LF統一）
- 連続空行の制限（3行以上 → 2行に正規化）
- 末尾改行の正規化（1つの改行で終了）
- `ConverterFactory`への登録
- 単体テスト・統合テスト

#### 含まないもの

- エンコーディング自動検出（UTF-8のみ対応）
- 文字コード変換（Shift-JIS、EUC-JP等）
- PDFConverter等の後続コンバーター実装
- チャンク分割ロジックの変更

### 2.4 成果物

| 成果物                            | 説明                                                  |
| --------------------------------- | ----------------------------------------------------- |
| `plain-text-converter.ts`（新規） | `packages/shared/src/services/conversion/converters/` |
| テストファイル（新規）            | 単体テスト + 統合テスト                               |
| `ConverterFactory`（更新）        | `text/plain`の登録追加                                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `FileConverter`インターフェースが定義済みであること
- `ConverterFactory`のコンバーター登録機構が実装済みであること
- 既存コンバーター（Markdown、HTML、CSV、JSON）の実装パターンを理解していること

### 3.2 依存タスク

- なし（独立タスク）

### 3.3 必要な知識

- `FileConverter`インターフェース（`convert(input: ConversionInput): Promise<ConversionResult>`）
- BOMバイトシーケンス（UTF-8: 0xEF 0xBB 0xBF、文字列: U+FEFF）
- 改行コード種別（LF: `\n`、CR: `\r`、CRLF: `\r\n`）
- 既存コンバーターの実装パターン（`interfaces-converter-implementations.md`参照）

### 3.4 推奨アプローチ

1. 既存コンバーター（CSVConverterが最もシンプル）を参考にクラス構造を作成
2. TDDで実装（Red→Green→Refactor）
3. BOM除去 → 改行正規化 → 空行制限 → 末尾正規化 の順で処理チェーンを構築
4. `ConverterFactory`に登録し統合テストで確認

---

## 4. 実行手順

### Phase構成

Phase 1（テスト作成・実装）→ Phase 2（統合・検証）の2Phase構成。

### Phase 1: TDD実装

#### 目的

PlainTextConverterをTDDサイクルで実装する。

#### 手順

1. テストファイルを作成（Red）
   - BOM除去テスト
   - 改行コード正規化テスト（CRLF→LF、CR→LF）
   - 連続空行制限テスト（3行以上→2行）
   - 末尾改行正規化テスト
   - 空ファイルテスト
   - 大容量ファイルテスト
2. `PlainTextConverter`クラスを実装（Green）
   - `FileConverter`インターフェース実装
   - `supportedMimeTypes`プロパティ: `['text/plain']`
   - `priority`プロパティ: `0`
   - `convert()`メソッド実装
3. リファクタリング（Refactor）
   - 処理パイプラインの最適化
   - エッジケース対応

#### 成果物

- `plain-text-converter.ts`
- `plain-text-converter.test.ts`

#### 完了条件

- 全テストケースPASS
- Line Coverage 90%以上

### Phase 2: 統合・検証

#### 目的

ConverterFactoryへの統合と全体テストの実行。

#### 手順

1. `ConverterFactory`に`PlainTextConverter`を登録
2. `text/plain`のMIMEタイプ判定が正しく機能することを確認
3. 既存コンバーターのテストに回帰がないことを確認
4. 統合テスト実行

#### 成果物

- 更新された`ConverterFactory`
- 統合テスト結果

#### 完了条件

- `ConverterFactory.getConverter('text/plain')`が`PlainTextConverter`を返す
- 既存テスト全PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `text/plain`のMIMEタイプを処理できる
- [ ] UTF-8 BOMが正しく除去される
- [ ] CRLF/CRがLFに正規化される
- [ ] 3行以上の連続空行が2行に制限される
- [ ] 末尾が1つの改行で終了する
- [ ] 空ファイルが正常に処理される
- [ ] `ConverterFactory`に登録されている

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLint PASS
- [ ] Line Coverage 90%以上
- [ ] 既存コンバーターテストに回帰なし

### ドキュメント要件

- [ ] `interfaces-converter-implementations.md`の実装ステータス更新
- [ ] `architecture-file-conversion.md`の技術的負債テーブル更新（CONV-DEBT-001完了）

---

## 6. 検証方法

### テストケース

| テストケース   | 入力                         | 期待結果                       |
| -------------- | ---------------------------- | ------------------------------ |
| BOM除去        | BOM付きUTF-8テキスト         | BOMが除去された文字列          |
| CRLF正規化     | CRLF改行のテキスト           | LF改行に統一                   |
| CR正規化       | CR改行のテキスト             | LF改行に統一                   |
| 連続空行制限   | 5行連続の空行を含むテキスト  | 2行の空行に制限                |
| 末尾改行正規化 | 末尾に複数改行があるテキスト | 末尾が1つの改行                |
| 空ファイル     | 空文字列                     | 空文字列（エラーなし）         |
| 既にLF         | LF改行のテキスト             | 変更なし（冪等性）             |
| MIMEタイプ判定 | `text/plain`                 | PlainTextConverterが選択される |

### 検証手順

1. `pnpm --filter @repo/shared test -- plain-text` で単体テストPASS
2. `pnpm --filter @repo/shared test -- converter` で全コンバーターテストPASS
3. TypeScript型チェック通過確認

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                                    |
| -------------------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| エンコーディング非対応の問題     | 中     | 中       | UTF-8以外は明示的にエラーとし、将来のエンコーディング検出タスクに委ねる |
| 大容量ファイルでのメモリ使用     | 低     | 低       | 文字列処理のため問題は小さいが、ストリーミング対応は別タスク            |
| 既存ConverterFactoryの登録順影響 | 低     | 低       | priority=0（最低優先度）により他コンバーターを阻害しない                |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| コンバーター仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-converter.md`                 |
| コンバーター実装詳細         | `.claude/skills/aiworkflow-requirements/references/interfaces-converter-implementations.md` |
| ファイル変換アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-file-conversion.md`         |
| 技術ロードマップ（後続依存） | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`                    |

### 参考資料

- 既存コンバーター実装: `packages/shared/src/services/conversion/converters/`
- CSVConverter（最もシンプルな参考実装）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
architecture-file-conversion.md 技術的負債テーブル:
| CONV-DEBT-001 | PlainTextConverter未実装 | Medium | 4h |

technology-devops.md 導入計画:
| pdf-parse | PDFConverter実装時 | PlainTextConverter完了後 | +500KB |
```

### 補足事項

- 本タスク完了後、PDFConverter（`pdf-parse`ライブラリ）、DocxConverter（`mammoth`）、ExcelConverter（`xlsx`）の導入が可能になる
- priority=0は最低優先度を意味し、他のコンバーターがtext/plainを処理する場合はそちらが優先される設計
- `interfaces-converter-implementations.md`にPlainTextConverterの予定仕様（BOM除去、改行正規化等）が詳細に記載されている
