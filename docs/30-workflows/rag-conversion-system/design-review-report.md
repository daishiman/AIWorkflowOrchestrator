# 設計レビューレポート

**レビュー日**: 2025-12-25
**フェーズ**: Phase 2 (T-02-1)
**レビュー対象**: MarkdownConverter, CodeConverter, YAMLConverter 設計書

---

## 1. レビュー概要

### 1.1 レビュー対象ドキュメント

| ドキュメント            | パス                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| MarkdownConverter設計書 | `docs/30-workflows/rag-conversion-system/design-markdown-converter.md` |
| CodeConverter設計書     | `docs/30-workflows/rag-conversion-system/design-code-converter.md`     |
| YAMLConverter設計書     | `docs/30-workflows/rag-conversion-system/design-yaml-converter.md`     |

### 1.2 参照した既存実装

| ファイル                                                    | 内容                          |
| ----------------------------------------------------------- | ----------------------------- |
| `packages/shared/src/services/conversion/base-converter.ts` | BaseConverter 抽象クラス      |
| `packages/shared/src/services/conversion/types.ts`          | 型定義（ExtractedMetadata等） |
| `packages/shared/src/types/rag/index.ts`                    | Result型、RAGError            |

---

## 2. レビュー結果サマリー

| 観点               | MarkdownConverter | CodeConverter | YAMLConverter | 総合      |
| ------------------ | ----------------- | ------------- | ------------- | --------- |
| BaseConverter継承  | PASS              | PASS          | PASS          | **PASS**  |
| 型整合性           | PASS              | PASS          | **MAJOR**     | **MAJOR** |
| エラーハンドリング | PASS              | PASS          | PASS          | **PASS**  |
| 正規表現パターン   | PASS              | PASS          | MINOR         | **MINOR** |
| 単一責務の原則     | PASS              | PASS          | PASS          | **PASS**  |

**総合判定**: **MAJOR** - 修正必要

---

## 3. 詳細レビュー結果

### 3.1 BaseConverter継承

**評価**: PASS

#### MarkdownConverter

- `extends BaseConverter` で継承を明示
- `doConvert()` を protected async で実装
- BaseConverter のヘルパーメソッド (`getTextContent()`, `trimContent()`) を活用

#### CodeConverter

- `extends BaseConverter` で継承を明示
- `doConvert()` を protected async で実装
- BaseConverter のヘルパーメソッドを活用

#### YAMLConverter

- `extends BaseConverter` で継承を明示
- `doConvert()` を protected async で実装
- BaseConverter のヘルパーメソッドを活用

---

### 3.2 型整合性 (ExtractedMetadata)

**評価**: MAJOR

#### ExtractedMetadata 実際の定義

```typescript
export interface ExtractedMetadata {
  readonly title: string | null;
  readonly author: string | null;
  readonly language: "ja" | "en";
  readonly wordCount: number;
  readonly lineCount: number;
  readonly charCount: number;
  readonly headers: Array<{ level: number; text: string }>;
  readonly codeBlocks: number;
  readonly links: string[];
  readonly custom: Record<string, unknown>;
}
```

#### MarkdownConverter: PASS

すべてのフィールドが正しく設計されている。

#### CodeConverter: PASS

すべてのフィールドが正しく設計されている。

#### YAMLConverter: **MAJOR** - 重大な問題

設計書の `extractYAMLMetadata()` メソッドで以下の問題を発見:

**問題1: 存在しないフィールドを使用**

```typescript
// 設計書のコード（問題あり）
return {
  title: fileName,
  headers: [],
  description: `YAML file with...`,  // ← 存在しないフィールド！
  keywords: structure.topLevelKeys,   // ← 存在しないフィールド！
  language: options.language ?? "ja",
  custom: { ... },
};
```

`description` と `keywords` は `ExtractedMetadata` に定義されていない。

**問題2: 必須フィールドの欠落**

以下の必須フィールドが設計から欠落している:

| フィールド   | 型               | 状態     |
| ------------ | ---------------- | -------- |
| `author`     | `string \| null` | **欠落** |
| `wordCount`  | `number`         | **欠落** |
| `lineCount`  | `number`         | **欠落** |
| `charCount`  | `number`         | **欠落** |
| `codeBlocks` | `number`         | **欠落** |
| `links`      | `string[]`       | **欠落** |

---

### 3.3 エラーハンドリング

**評価**: PASS

すべてのコンバーターで以下のパターンが正しく設計されている:

```typescript
try {
  // 変換処理
  return ok({ convertedContent, extractedMetadata, processingTime });
} catch (error) {
  return err(
    createRAGError(
      ErrorCodes.CONVERSION_FAILED,
      `Failed to convert...: ${error instanceof Error ? error.message : String(error)}`,
      { converterId, fileId, mimeType },
      error as Error,
    ),
  );
}
```

---

### 3.4 正規表現パターン

**評価**: MINOR

#### MarkdownConverter: PASS

- 9個のパターンを定義
- 非貪欲マッチング (`*?`) を使用
- コードブロック内外の分離処理を実装

#### CodeConverter: PASS

- 8個のパターンを定義
- 設計書で制限事項（コメント内・文字列内の誤検知）を明記

#### YAMLConverter: MINOR

**問題: コメント検出の誤検知**

現在の設計:

```typescript
if (line.includes("#")) {
  hasComments = true;
}
```

この実装では、文字列内の `#` も検出してしまう:

```yaml
# これは本当のコメント
url: "https://example.com/#section" # ← 誤検知
password: "test#123" # ← 誤検知
```

**推奨対応**: 行頭コメントのみを検出するか、ドキュメントで許容範囲として明記

---

### 3.5 単一責務の原則

**評価**: PASS

すべてのコンバーターで明確な責務分離が設計されている:

| コンバーター      | 責務                         |
| ----------------- | ---------------------------- |
| MarkdownConverter | Markdown正規化と構造抽出     |
| CodeConverter     | コード構造抽出とMarkdown整形 |
| YAMLConverter     | YAML構造解析とMarkdown整形   |

---

## 4. 指摘事項一覧

### 4.1 MAJOR (重大) - 修正必須

| ID   | 対象          | 問題                                                        | 推奨対応                                                                  |
| ---- | ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| M-01 | YAMLConverter | `description` フィールドは `ExtractedMetadata` に存在しない | 削除し、`custom.description` に移動                                       |
| M-02 | YAMLConverter | `keywords` フィールドは `ExtractedMetadata` に存在しない    | 削除し、`custom.keywords` に移動（または `custom.topLevelKeys` のみ使用） |
| M-03 | YAMLConverter | `author` フィールドが欠落                                   | `author: null` を追加                                                     |
| M-04 | YAMLConverter | `wordCount` フィールドが欠落                                | YAML内容から計算するロジックを追加                                        |
| M-05 | YAMLConverter | `lineCount` フィールドが欠落                                | YAML内容から計算するロジックを追加                                        |
| M-06 | YAMLConverter | `charCount` フィールドが欠落                                | YAML内容から計算するロジックを追加                                        |
| M-07 | YAMLConverter | `codeBlocks` フィールドが欠落                               | `codeBlocks: 1` を追加（YAML全体を1ブロックとして扱う）                   |
| M-08 | YAMLConverter | `links` フィールドが欠落                                    | `links: []` を追加                                                        |

### 4.2 MINOR (軽微) - 対応推奨

| ID   | 対象          | 問題                                  | 推奨対応                                       |
| ---- | ------------- | ------------------------------------- | ---------------------------------------------- |
| m-01 | YAMLConverter | コメント検出で文字列内の `#` を誤検知 | 行頭コメントのみ検出、または制限事項として明記 |

---

## 5. 修正提案

### 5.1 YAMLConverter `extractYAMLMetadata()` 修正案

```typescript
private extractYAMLMetadata(
  content: string,
  structure: YAMLStructure,
  options: ConverterOptions,
): ExtractedMetadata {
  const fileName = options.filePath?.split("/").pop() ?? "unknown.yaml";
  const lines = content.split("\n");

  return {
    // 必須フィールド
    title: fileName,
    author: null,
    language: (options.language as "ja" | "en") ?? "ja",
    wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
    lineCount: lines.length,
    charCount: content.length,
    headers: [],  // YAMLにヘッダー概念なし
    codeBlocks: 1,  // YAML全体を1ブロックとして扱う
    links: [],
    // カスタムフィールド（YAML固有情報）
    custom: {
      hasComments: structure.hasComments,
      maxIndentDepth: structure.maxIndentDepth,
      topLevelKeys: structure.topLevelKeys,
      totalLines: structure.totalLines,
    },
  };
}
```

### 5.2 YAMLConverter コメント検出改善案（オプション）

```typescript
// 改善前
if (line.includes("#")) {
  hasComments = true;
}

// 改善後（行頭コメントのみ検出）
const trimmedLine = line.trim();
if (trimmedLine.startsWith("#") || /^[^"']*#/.test(line)) {
  hasComments = true;
}
```

---

## 6. 判定結果

### 6.1 初回判定

**MAJOR** - Phase 1（設計）への差し戻し

### 6.2 修正対応

| ID         | 対応内容                                                  | 状態     |
| ---------- | --------------------------------------------------------- | -------- |
| M-01〜M-08 | YAMLConverter設計書の `extractYAMLMetadata()` を修正      | **完了** |
| m-01       | コメント検出の制限事項を設計書に明記（セクション8.4追加） | **完了** |

### 6.3 再評価結果

**PASS** - Phase 3（テスト作成）へ進行可能

### 6.4 修正後の確認

- [x] `extractYAMLMetadata()` が `ExtractedMetadata` 型に準拠
- [x] 全必須フィールド（`title`, `author`, `language`, `wordCount`, `lineCount`, `charCount`, `headers`, `codeBlocks`, `links`, `custom`）が正しく設計
- [x] 存在しないフィールド（`description`, `keywords`）を削除
- [x] コメント検出の制限事項を明記

---

## 7. レビュー完了条件

- [x] 全レビュー観点でチェックが完了している
- [x] レビュー結果がPASSまたはMINOR（対応済み）である
- [x] 指摘事項がすべて解決されている

---

## 変更履歴

| 日付       | バージョン | 変更内容                                          |
| ---------- | ---------- | ------------------------------------------------- |
| 2025-12-25 | 1.0.0      | 初版作成（Phase 2: 設計レビュー完了）             |
| 2025-12-25 | 1.1.0      | YAMLConverter設計書修正後の再評価、PASS判定に更新 |
