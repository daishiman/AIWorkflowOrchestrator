# T-01-3: ファイル・変換ドメインユーティリティ設計書

## 概要

| 項目             | 内容                                            |
| ---------------- | ----------------------------------------------- |
| タスクID         | T-01-3                                          |
| フェーズ         | Phase 1: 設計                                   |
| 目的             | utils.ts に定義するユーティリティ関数の詳細設計 |
| 成果物           | ユーティリティ関数の詳細設計書                  |
| 担当エージェント | .claude/agents/logic-dev.md                                      |

---

## 1. 設計方針

### 1.1 設計原則

1. **純粋関数**: 副作用を持たない純粋関数として設計
2. **型安全**: 入出力に適切な型を使用し、T-01-1の型定義と整合
3. **単一責務**: 各関数は1つの明確な責務のみを持つ
4. **テスト容易性**: モック不要でテスト可能な設計
5. **エラー処理**: Result型を使用した明示的なエラーハンドリング

### 1.2 依存関係

```typescript
// packages/shared/src/types/rag/file/utils.ts

import type { FileType, FileCategory } from "./types";
import { FileTypes, FileCategories } from "./types";
import type { Result } from "../result";
import { ok, err } from "../result";
import type { RAGError } from "../errors";
import { createRAGError, ErrorCodes } from "../errors";
```

---

## 2. ファイルタイプ関連関数

### 2.1 getFileTypeFromExtension（拡張子からファイルタイプ取得）

**責務**: ファイル拡張子からMIMEタイプを推定する

```typescript
/**
 * 拡張子からファイルタイプを取得
 *
 * @description ファイル拡張子をMIMEタイプにマッピングする
 * @param extension - ファイル拡張子（ドット付きまたはなし、例: ".ts" または "ts"）
 * @returns 対応するFileType、未知の拡張子の場合はUNKNOWN
 *
 * @example
 * getFileTypeFromExtension(".ts") // => "text/typescript"
 * getFileTypeFromExtension("md")  // => "text/markdown"
 * getFileTypeFromExtension(".xyz") // => "application/octet-stream"
 */
export const getFileTypeFromExtension = (extension: string): FileType => {
  // 拡張子を正規化（小文字化、ドット除去）
  const normalizedExt = extension.toLowerCase().replace(/^\./, "");

  // 拡張子マッピングテーブル
  const extensionMap: Record<string, FileType> = {
    // テキスト系
    txt: FileTypes.TEXT,
    text: FileTypes.TEXT,
    md: FileTypes.MARKDOWN,
    markdown: FileTypes.MARKDOWN,
    html: FileTypes.HTML,
    htm: FileTypes.HTML,
    csv: FileTypes.CSV,
    tsv: FileTypes.TSV,

    // コード系
    js: FileTypes.JAVASCRIPT,
    mjs: FileTypes.JAVASCRIPT,
    cjs: FileTypes.JAVASCRIPT,
    ts: FileTypes.TYPESCRIPT,
    mts: FileTypes.TYPESCRIPT,
    cts: FileTypes.TYPESCRIPT,
    tsx: FileTypes.TYPESCRIPT,
    jsx: FileTypes.JAVASCRIPT,
    py: FileTypes.PYTHON,
    pyw: FileTypes.PYTHON,
    json: FileTypes.JSON,
    yaml: FileTypes.YAML,
    yml: FileTypes.YAML,
    xml: FileTypes.XML,

    // ドキュメント系
    pdf: FileTypes.PDF,
    docx: FileTypes.DOCX,
    xlsx: FileTypes.XLSX,
    pptx: FileTypes.PPTX,
  };

  return extensionMap[normalizedExt] ?? FileTypes.UNKNOWN;
};
```

**マッピングテーブル**:

| 拡張子            | FileType                        |
| ----------------- | ------------------------------- |
| txt, text         | text/plain                      |
| md, markdown      | text/markdown                   |
| html, htm         | text/html                       |
| csv               | text/csv                        |
| tsv               | text/tab-separated-values       |
| js, mjs, cjs, jsx | text/javascript                 |
| ts, mts, cts, tsx | text/typescript                 |
| py, pyw           | application/x-python            |
| json              | application/json                |
| yaml, yml         | application/x-yaml              |
| xml               | application/xml                 |
| pdf               | application/pdf                 |
| docx              | application/vnd.openxml...doc   |
| xlsx              | application/vnd.openxml...sheet |
| pptx              | application/vnd.openxml...pres  |
| (その他)          | application/octet-stream        |

---

### 2.2 getFileTypeFromPath（パスからファイルタイプ取得）

**責務**: ファイルパスから拡張子を抽出し、MIMEタイプを推定する

```typescript
/**
 * ファイルパスからファイルタイプを取得
 *
 * @description ファイルパスの拡張子からMIMEタイプを推定
 * @param filePath - ファイルパス（絶対または相対）
 * @returns 対応するFileType
 *
 * @example
 * getFileTypeFromPath("/path/to/file.ts") // => "text/typescript"
 * getFileTypeFromPath("README.md")        // => "text/markdown"
 */
export const getFileTypeFromPath = (filePath: string): FileType => {
  // パスから拡張子を抽出
  const lastDotIndex = filePath.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
    return FileTypes.UNKNOWN;
  }

  const extension = filePath.slice(lastDotIndex);
  return getFileTypeFromExtension(extension);
};
```

---

### 2.3 getFileCategoryFromType（タイプからカテゴリ取得）

**責務**: MIMEタイプからファイルカテゴリを推定する

```typescript
/**
 * ファイルタイプからカテゴリを取得
 *
 * @description MIMEタイプを用途に基づくカテゴリに分類
 * @param fileType - FileType（MIMEタイプ）
 * @returns 対応するFileCategory
 *
 * @example
 * getFileCategoryFromType("text/typescript") // => "code"
 * getFileCategoryFromType("application/pdf") // => "document"
 */
export const getFileCategoryFromType = (fileType: FileType): FileCategory => {
  const categoryMap: Record<FileType, FileCategory> = {
    // テキスト系 → TEXT
    [FileTypes.TEXT]: FileCategories.TEXT,
    [FileTypes.MARKDOWN]: FileCategories.TEXT,
    [FileTypes.HTML]: FileCategories.TEXT,
    [FileTypes.CSV]: FileCategories.TEXT,
    [FileTypes.TSV]: FileCategories.TEXT,

    // コード系 → CODE
    [FileTypes.JAVASCRIPT]: FileCategories.CODE,
    [FileTypes.TYPESCRIPT]: FileCategories.CODE,
    [FileTypes.PYTHON]: FileCategories.CODE,
    [FileTypes.JSON]: FileCategories.CODE,
    [FileTypes.YAML]: FileCategories.CODE,
    [FileTypes.XML]: FileCategories.CODE,

    // ドキュメント系
    [FileTypes.PDF]: FileCategories.DOCUMENT,
    [FileTypes.DOCX]: FileCategories.DOCUMENT,

    // スプレッドシート
    [FileTypes.XLSX]: FileCategories.SPREADSHEET,

    // プレゼンテーション
    [FileTypes.PPTX]: FileCategories.PRESENTATION,

    // その他
    [FileTypes.UNKNOWN]: FileCategories.OTHER,
  };

  return categoryMap[fileType] ?? FileCategories.OTHER;
};
```

**カテゴリマッピング**:

| FileType                  | FileCategory |
| ------------------------- | ------------ |
| text/plain                | text         |
| text/markdown             | text         |
| text/html                 | text         |
| text/csv                  | text         |
| text/tab-separated-values | text         |
| text/javascript           | code         |
| text/typescript           | code         |
| application/x-python      | code         |
| application/json          | code         |
| application/x-yaml        | code         |
| application/xml           | code         |
| application/pdf           | document     |
| application/vnd...docx    | document     |
| application/vnd...xlsx    | spreadsheet  |
| application/vnd...pptx    | presentation |
| application/octet-stream  | other        |

---

## 3. ハッシュ関連関数

### 3.1 calculateFileHash（ファイルハッシュ計算）

**責務**: ファイル内容のSHA-256ハッシュを計算する

```typescript
/**
 * ファイルコンテンツのSHA-256ハッシュを計算
 *
 * @description Web Crypto APIを使用してSHA-256ハッシュを計算
 * @param content - ハッシュ対象のコンテンツ（文字列またはArrayBuffer）
 * @returns 64文字の16進数ハッシュ文字列を含むResult
 *
 * @example
 * const result = await calculateFileHash("Hello, World!");
 * if (result.success) {
 *   console.log(result.data); // "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
 * }
 */
export const calculateFileHash = async (
  content: string | ArrayBuffer,
): Promise<Result<string, RAGError>> => {
  try {
    // 文字列の場合はArrayBufferに変換
    const buffer =
      typeof content === "string" ? new TextEncoder().encode(content) : content;

    // SHA-256ハッシュを計算
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    // ArrayBufferを16進数文字列に変換
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return ok(hashHex);
  } catch (error) {
    return err(
      createRAGError(
        ErrorCodes.INTERNAL_ERROR,
        "ハッシュ計算に失敗しました",
        {
          content:
            typeof content === "string"
              ? content.slice(0, 100)
              : "[ArrayBuffer]",
        },
        error instanceof Error ? error : undefined,
      ),
    );
  }
};
```

**仕様**:

- **入力**: 文字列または ArrayBuffer
- **出力**: 64文字の16進数文字列（小文字）
- **アルゴリズム**: SHA-256
- **エラー処理**: Result型でラップ

---

### 3.2 calculateFileHashSync（同期版ハッシュ計算 - Node.js専用）

**責務**: Node.js環境での同期的なハッシュ計算

```typescript
/**
 * ファイルコンテンツのSHA-256ハッシュを同期計算（Node.js専用）
 *
 * @description crypto.createHash を使用した同期的なハッシュ計算
 * @param content - ハッシュ対象のコンテンツ
 * @returns 64文字の16進数ハッシュ文字列を含むResult
 *
 * @note ブラウザ環境では使用不可
 */
export const calculateFileHashSync = (
  content: string | Buffer,
): Result<string, RAGError> => {
  try {
    // Node.js crypto モジュールを動的インポート
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    return ok(hash);
  } catch (error) {
    return err(
      createRAGError(
        ErrorCodes.INTERNAL_ERROR,
        "同期ハッシュ計算に失敗しました（Node.js環境が必要です）",
        {},
        error instanceof Error ? error : undefined,
      ),
    );
  }
};
```

---

## 4. ファイルサイズ関連関数

### 4.1 formatFileSize（ファイルサイズフォーマット）

**責務**: バイト数を人間が読みやすい形式にフォーマットする

```typescript
/**
 * ファイルサイズを人間が読みやすい形式にフォーマット
 *
 * @description バイト数をKB/MB/GB単位に変換
 * @param bytes - ファイルサイズ（バイト単位）
 * @param decimals - 小数点以下の桁数（デフォルト: 2）
 * @returns フォーマットされたサイズ文字列
 *
 * @example
 * formatFileSize(1024)        // => "1.00 KB"
 * formatFileSize(1536, 1)     // => "1.5 KB"
 * formatFileSize(1048576)     // => "1.00 MB"
 * formatFileSize(0)           // => "0 Bytes"
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes < 0) {
    throw new Error("ファイルサイズは0以上である必要があります");
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm))} ${sizes[safeIndex]}`;
};
```

**フォーマット仕様**:

| 範囲                 | 単位  | 例          |
| -------------------- | ----- | ----------- |
| 0                    | Bytes | "0 Bytes"   |
| 1 - 1023             | Bytes | "512 Bytes" |
| 1024 - 1048575       | KB    | "1.00 KB"   |
| 1048576 - 1073741823 | MB    | "1.00 MB"   |
| 1073741824+          | GB    | "1.00 GB"   |

---

### 4.2 parseFileSize（ファイルサイズパース）

**責務**: フォーマットされたサイズ文字列をバイト数に変換する

```typescript
/**
 * フォーマットされたファイルサイズをバイト数にパース
 *
 * @description "1.5 MB" などの文字列をバイト数に変換
 * @param sizeString - フォーマットされたサイズ文字列
 * @returns バイト数を含むResult
 *
 * @example
 * parseFileSize("1.5 MB") // => ok(1572864)
 * parseFileSize("512 KB") // => ok(524288)
 * parseFileSize("invalid") // => err(...)
 */
export const parseFileSize = (sizeString: string): Result<number, RAGError> => {
  const units: Record<string, number> = {
    bytes: 1,
    byte: 1,
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
    pb: 1024 ** 5,
  };

  const match = sizeString.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (!match) {
    return err(
      createRAGError(
        ErrorCodes.VALIDATION_ERROR,
        `無効なファイルサイズ形式です: ${sizeString}`,
        { input: sizeString },
      ),
    );
  }

  const [, numberPart, unitPart] = match;
  const value = parseFloat(numberPart);
  const unit = unitPart.toLowerCase();

  if (isNaN(value) || value < 0) {
    return err(
      createRAGError(
        ErrorCodes.VALIDATION_ERROR,
        `無効な数値です: ${numberPart}`,
        { input: sizeString },
      ),
    );
  }

  const multiplier = units[unit];
  if (multiplier === undefined) {
    return err(
      createRAGError(
        ErrorCodes.VALIDATION_ERROR,
        `不明な単位です: ${unitPart}`,
        { input: sizeString, unit: unitPart },
      ),
    );
  }

  return ok(Math.round(value * multiplier));
};
```

---

## 5. バリデーション関連関数

### 5.1 isValidFileExtension（有効な拡張子チェック）

**責務**: 拡張子がサポートされているかチェックする

```typescript
/**
 * 拡張子がサポートされているかチェック
 *
 * @description getFileTypeFromExtensionでUNKNOWN以外が返るかを確認
 * @param extension - ファイル拡張子
 * @returns サポートされている場合true
 *
 * @example
 * isValidFileExtension(".ts")  // => true
 * isValidFileExtension(".xyz") // => false
 */
export const isValidFileExtension = (extension: string): boolean => {
  return getFileTypeFromExtension(extension) !== FileTypes.UNKNOWN;
};
```

---

### 5.2 isValidHash（有効なハッシュチェック）

**責務**: ハッシュ文字列がSHA-256形式として有効かチェックする

```typescript
/**
 * ハッシュ文字列がSHA-256形式として有効かチェック
 *
 * @description 64文字の16進数文字列であることを確認
 * @param hash - 検証対象のハッシュ文字列
 * @returns 有効な場合true
 *
 * @example
 * isValidHash("dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f") // => true
 * isValidHash("invalid") // => false
 */
export const isValidHash = (hash: string): boolean => {
  return /^[0-9a-f]{64}$/.test(hash);
};
```

---

### 5.3 validateFileSize（ファイルサイズ検証）

**責務**: ファイルサイズが制限内かチェックする

```typescript
/**
 * ファイルサイズが制限内かチェック
 *
 * @description 最大サイズ以下であることを確認
 * @param size - ファイルサイズ（バイト）
 * @param maxSize - 最大サイズ（バイト、デフォルト: 10MB）
 * @returns 検証結果を含むResult
 *
 * @example
 * validateFileSize(1024, 1048576) // => ok(true)
 * validateFileSize(10485761)      // => err(...) (デフォルト10MB超過)
 */
export const validateFileSize = (
  size: number,
  maxSize: number = 10 * 1024 * 1024,
): Result<true, RAGError> => {
  if (size < 0) {
    return err(
      createRAGError(
        ErrorCodes.VALIDATION_ERROR,
        "ファイルサイズは0以上である必要があります",
        { size },
      ),
    );
  }

  if (size > maxSize) {
    return err(
      createRAGError(
        ErrorCodes.VALIDATION_ERROR,
        `ファイルサイズが上限（${formatFileSize(maxSize)}）を超えています`,
        { size, maxSize, formatted: formatFileSize(size) },
      ),
    );
  }

  return ok(true);
};
```

---

## 6. ファイル名関連関数

### 6.1 extractFileName（パスからファイル名抽出）

**責務**: ファイルパスからファイル名を抽出する

```typescript
/**
 * ファイルパスからファイル名を抽出
 *
 * @description パスの最後のセグメントを取得
 * @param filePath - ファイルパス
 * @returns ファイル名
 *
 * @example
 * extractFileName("/path/to/file.ts") // => "file.ts"
 * extractFileName("C:\\Users\\file.ts") // => "file.ts"
 */
export const extractFileName = (filePath: string): string => {
  // Unix/Windowsの両方のパス区切りに対応
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || "";
};
```

---

### 6.2 extractFileExtension（パスから拡張子抽出）

**責務**: ファイルパスから拡張子を抽出する

```typescript
/**
 * ファイルパスから拡張子を抽出
 *
 * @description ドット付きの拡張子を取得
 * @param filePath - ファイルパス
 * @returns 拡張子（ドット付き）、拡張子がない場合は空文字列
 *
 * @example
 * extractFileExtension("/path/to/file.ts") // => ".ts"
 * extractFileExtension("README")            // => ""
 */
export const extractFileExtension = (filePath: string): string => {
  const fileName = extractFileName(filePath);
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return "";
  }

  return fileName.slice(lastDotIndex);
};
```

---

## 7. 関数一覧サマリー

| 関数名                   | カテゴリ       | 引数                             | 戻り値                       |
| ------------------------ | -------------- | -------------------------------- | ---------------------------- |
| getFileTypeFromExtension | ファイルタイプ | extension: string                | FileType                     |
| getFileTypeFromPath      | ファイルタイプ | filePath: string                 | FileType                     |
| getFileCategoryFromType  | ファイルタイプ | fileType: FileType               | FileCategory                 |
| calculateFileHash        | ハッシュ       | content: string \| ArrayBuffer   | Promise<Result<string, ...>> |
| calculateFileHashSync    | ハッシュ       | content: string \| Buffer        | Result<string, ...>          |
| formatFileSize           | ファイルサイズ | bytes: number, decimals?: number | string                       |
| parseFileSize            | ファイルサイズ | sizeString: string               | Result<number, ...>          |
| isValidFileExtension     | バリデーション | extension: string                | boolean                      |
| isValidHash              | バリデーション | hash: string                     | boolean                      |
| validateFileSize         | バリデーション | size: number, maxSize?: number   | Result<true, ...>            |
| extractFileName          | ファイル名     | filePath: string                 | string                       |
| extractFileExtension     | ファイル名     | filePath: string                 | string                       |

---

## 8. 設計検証チェックリスト

### 8.1 完了条件

- [x] getFileTypeFromExtension 関数の設計が完了
- [x] getFileCategoryFromType 関数の設計が完了
- [x] calculateFileHash 関数の設計が完了
- [x] formatFileSize 関数の設計が完了

### 8.2 追加で設計した関数

- [x] getFileTypeFromPath（パスからの型推定）
- [x] calculateFileHashSync（同期版ハッシュ）
- [x] parseFileSize（サイズ文字列パース）
- [x] isValidFileExtension（拡張子検証）
- [x] isValidHash（ハッシュ検証）
- [x] validateFileSize（サイズ制限検証）
- [x] extractFileName（ファイル名抽出）
- [x] extractFileExtension（拡張子抽出）

### 8.3 設計原則チェック

- [x] 全関数が純粋関数として設計されている
- [x] 適切な型が使用されている
- [x] エラー処理にResult型を使用している
- [x] 関数名が明確で意図が分かりやすい
- [x] JSDocコメントが充実している

---

## 9. 次のステップ

| 次タスク             | 内容             | 依存                   |
| -------------------- | ---------------- | ---------------------- |
| T-02-1: 設計レビュー | 設計の妥当性検証 | T-01-1, T-01-2, T-01-3 |
