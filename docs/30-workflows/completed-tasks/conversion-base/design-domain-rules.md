# ドメインルール定義 - 変換基盤

## 1. 概要

ファイル変換基盤のドメインルール（ビジネスルール、制約、ポリシー）を明文化し、実装の指針とする。

---

## 2. 優先度管理のドメインルール

### 2.1 優先度の定義

| 優先度範囲 | 分類           | 用途                         | 例                                          |
| ---------- | -------------- | ---------------------------- | ------------------------------------------- |
| 50 ~ 100   | CRITICAL～HIGH | 最適化された専用コンバーター | PDF専用コンバーター、高度なMarkdownパーサー |
| 10 ~ 49    | MEDIUM         | 標準コンバーター             | 一般的なMarkdownコンバーター                |
| 0 ~ 9      | LOW～NORMAL    | デフォルトコンバーター       | プレーンテキストコンバーター                |
| -10 ~ -1   | FALLBACK       | フォールバックコンバーター   | 汎用テキスト抽出（最終手段）                |

### 2.2 優先度値オブジェクト設計

```typescript
/**
 * 変換優先度を表す値オブジェクト
 *
 * ドメインルール:
 * - 優先度は整数値で表現
 * - 高い値ほど優先度が高い
 * - 同一優先度の場合は登録順（FIFO）
 */
export class Priority {
  private constructor(private readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Priority must be an integer");
    }
  }

  /**
   * 事前定義された優先度レベル
   */
  static readonly CRITICAL = new Priority(100);
  static readonly HIGH = new Priority(50);
  static readonly MEDIUM = new Priority(25);
  static readonly NORMAL = new Priority(10);
  static readonly LOW = new Priority(5);
  static readonly FALLBACK = new Priority(-5);

  /**
   * カスタム優先度を生成
   */
  static custom(value: number): Priority {
    return new Priority(value);
  }

  /**
   * 他の優先度より高いかを判定
   */
  isHigherThan(other: Priority): boolean {
    return this.value > other.value;
  }

  /**
   * 他の優先度と等しいかを判定
   */
  equals(other: Priority): boolean {
    return this.value === other.value;
  }

  /**
   * 数値として取得
   */
  toNumber(): number {
    return this.value;
  }

  /**
   * 文字列として取得
   */
  toString(): string {
    if (this.value >= 50) return "HIGH";
    if (this.value >= 10) return "MEDIUM";
    if (this.value >= 0) return "NORMAL";
    return "FALLBACK";
  }
}
```

**使用例**:

```typescript
const converter = {
  id: "markdown-converter",
  priority: Priority.HIGH.toNumber(), // 50
};

// 優先度比較
if (Priority.custom(converter.priority).isHigherThan(Priority.NORMAL)) {
  console.log("高優先度コンバーター");
}
```

---

## 3. タイムアウトのドメインルール

### 3.1 タイムアウト時間の基準

| ファイルサイズ | 標準タイムアウト   | 根拠                                   |
| -------------- | ------------------ | -------------------------------------- |
| 1MB以下        | 30秒               | 通常のテキストファイルは数秒で処理完了 |
| 1～10MB        | 60秒（デフォルト） | Markdown、コードファイル等             |
| 10～50MB       | 120秒              | 大規模ドキュメント                     |
| 50～100MB      | 180秒              | 非常に大きなファイル                   |
| 100MB超        | 変換不可           | メモリ・パフォーマンス上の理由         |

### 3.2 タイムアウトルールの実装

```typescript
/**
 * ファイルサイズに応じた推奨タイムアウトを取得
 *
 * @param fileSizeBytes - ファイルサイズ（バイト）
 * @returns 推奨タイムアウト（ミリ秒）、または変換不可の場合null
 */
export function getRecommendedTimeout(fileSizeBytes: number): number | null {
  const sizeMB = fileSizeBytes / (1024 * 1024);

  if (sizeMB > 100) {
    return null; // 変換不可
  } else if (sizeMB > 50) {
    return 180000; // 180秒
  } else if (sizeMB > 10) {
    return 120000; // 120秒
  } else if (sizeMB > 1) {
    return 60000; // 60秒（デフォルト）
  } else {
    return 30000; // 30秒
  }
}
```

### 3.3 タイムアウトポリシー

| ポリシー                   | 内容                                                       |
| -------------------------- | ---------------------------------------------------------- |
| デフォルトタイムアウト     | 60秒（1～10MBファイル向け）                                |
| 最小タイムアウト           | 10秒（テスト環境等）                                       |
| 最大タイムアウト           | 180秒（100MB以下ファイル向け）                             |
| タイムアウト超過時の動作   | TIMEOUT エラーを返し、リソースを解放                       |
| タイムアウト設定の優先順位 | 個別指定 > サービスデフォルト > システムデフォルト（60秒） |

---

## 4. ファイルパス検証のドメインルール

### 4.1 FilePath値オブジェクト設計

```typescript
/**
 * ファイルパスを表す値オブジェクト
 *
 * ドメインルール:
 * - 空文字列不可
 * - null/undefined不可
 * - トリム後の文字列が空でないこと
 */
export class FilePath {
  private constructor(private readonly value: string) {}

  /**
   * ファイルパスを生成
   *
   * @param path - パス文字列
   * @returns FilePath または エラー
   */
  static create(path: string): Result<FilePath, RAGError> {
    // 空チェック
    if (!path || path.trim() === "") {
      return err(
        createRAGError(
          ErrorCodes.VALIDATION_ERROR,
          "File path cannot be empty",
        ),
      );
    }

    return ok(new FilePath(path.trim()));
  }

  /**
   * 文字列として取得
   */
  toString(): string {
    return this.value;
  }

  /**
   * パスの拡張子を取得
   */
  getExtension(): string | null {
    const match = this.value.match(/\.([^.]+)$/);
    return match ? match[1] : null;
  }

  /**
   * ファイル名（拡張子なし）を取得
   */
  getBaseName(): string {
    const parts = this.value.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.[^.]+$/, "");
  }

  /**
   * 等価性を判定
   */
  equals(other: FilePath): boolean {
    return this.value === other.value;
  }
}
```

**使用例**:

```typescript
const pathResult = FilePath.create("/path/to/document.md");

if (pathResult.success) {
  const filePath = pathResult.data;
  console.log(filePath.toString()); // "/path/to/document.md"
  console.log(filePath.getExtension()); // "md"
  console.log(filePath.getBaseName()); // "document"
} else {
  console.error(pathResult.error.message); // "File path cannot be empty"
}
```

---

## 5. MIMEタイプと用語の定義

### 5.1 用語の統一

| 用語                           | 定義                       | 使用箇所         | 例                                 |
| ------------------------------ | -------------------------- | ---------------- | ---------------------------------- |
| **ファイル形式（FileFormat）** | ユーザー向けの形式名       | UI、ドキュメント | "Markdown", "PDF", "テキスト"      |
| **ファイルタイプ（FileType）** | システム内部の形式識別子   | 定数定義         | "pdf", "markdown", "text"          |
| **MIMEタイプ（MimeType）**     | RFC 6838準拠の技術的識別子 | 変換処理内部     | "text/markdown", "application/pdf" |

### 5.2 型定義での使い分け

```typescript
/**
 * ファイル形式（ユーザー向け）
 *
 * UIでの表示に使用。
 */
export type FileFormat = "Markdown" | "PDF" | "Plain Text" | "HTML" | "Code";

/**
 * ファイルタイプ（システム内部）
 *
 * 定数として使用。
 */
export type FileType = "markdown" | "pdf" | "text" | "html" | "code";

/**
 * MIMEタイプ（技術的識別子）
 *
 * 変換処理で使用。RFC 6838準拠。
 */
export type MimeType = string;

// 変換テーブル
export const FileFormatMapping = {
  "text/markdown": {
    format: "Markdown" as FileFormat,
    type: "markdown" as FileType,
  },
  "application/pdf": { format: "PDF" as FileFormat, type: "pdf" as FileType },
  "text/plain": {
    format: "Plain Text" as FileFormat,
    type: "text" as FileType,
  },
  "text/html": { format: "HTML" as FileFormat, type: "html" as FileType },
} as const;
```

---

## 6. 同時実行制御のドメインルール

### 6.1 同時実行数の基準

| 環境                 | 推奨同時実行数  | 根拠                     |
| -------------------- | --------------- | ------------------------ |
| 開発環境（ローカル） | 3               | CPUコア数が少ない可能性  |
| テスト環境           | 2               | テストの安定性優先       |
| 本番環境（標準）     | 5（デフォルト） | バランスの取れた設定     |
| 本番環境（高性能）   | 10              | 十分なリソースがある場合 |

### 6.2 リソース管理ポリシー

```typescript
/**
 * 同時実行制御のドメインルール
 */
export const ConcurrencyRules = {
  /**
   * 最小同時実行数
   */
  MIN_CONCURRENT_CONVERSIONS: 1,

  /**
   * デフォルト同時実行数
   */
  DEFAULT_CONCURRENT_CONVERSIONS: 5,

  /**
   * 最大同時実行数
   */
  MAX_CONCURRENT_CONVERSIONS: 10,

  /**
   * 推奨値を取得
   */
  getRecommended(environment: "development" | "test" | "production"): number {
    switch (environment) {
      case "development":
        return 3;
      case "test":
        return 2;
      case "production":
        return 5;
    }
  },
} as const;
```

---

## 7. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容                       |
| ---------- | ---------- | ------ | ------------------------------ |
| 2025-12-20 | 1.0.0      | AI     | 初版作成（ドメインルール定義） |
