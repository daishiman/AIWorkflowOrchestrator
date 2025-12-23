# 既存インターフェースとの統合方針

## 1. 概要

本ドキュメントでは、新規設計の`IConverter`インターフェースと既存のコンバーター関連インターフェース（存在する場合）との統合方針を定義します。

---

## 2. 既存インターフェースの調査結果

### 2.1 調査範囲

調査したディレクトリ:

- `packages/shared/src/features/rag/domain/interfaces/`
- `packages/shared/src/services/`
- `packages/shared/src/types/rag/`

### 2.2 調査結果

**結果**: 既存のコンバーター関連インターフェース（IDocumentConverter等）は**見つかりませんでした**。

これは以下のいずれかを意味します:

1. まだ実装されていない（本タスクが初実装）
2. 別の名称で定義されている
3. 別のディレクトリに配置されている

---

## 3. 統合方針（既存インターフェースが発見された場合）

### 3.1 パターンA: 既存インターフェースを置き換え

**適用条件**:

- 既存インターフェースが古い設計である
- 機能が不足している
- 新規設計の方が優れている

**移行戦略**:

```typescript
// ステップ1: 既存インターフェースを@deprecatedにマーク
/**
 * @deprecated Use IConverter instead
 */
export interface IDocumentConverter {
  // ... 既存定義
}

// ステップ2: アダプターパターンで互換性を提供
export class DocumentConverterAdapter implements IDocumentConverter {
  constructor(private readonly converter: IConverter) {}

  async convert(content: Buffer | string, metadata: DocumentMetadata) {
    const input: ConverterInput = {
      fileId: generateFileId(),
      filePath: "",
      mimeType: metadata.mimeType,
      content,
      encoding: "utf-8",
    };

    const result = await this.converter.convert(input);

    if (result.success) {
      return {
        content: result.data.convertedContent,
        metadata: result.data.extractedMetadata,
      };
    } else {
      throw new Error(result.error.message);
    }
  }
}

// ステップ3: 既存コードを段階的に移行
// ステップ4: 既存インターフェースを削除
```

---

### 3.2 パターンB: 既存インターフェースと共存

**適用条件**:

- 既存インターフェースが広く使用されている
- 移行コストが高い
- 異なる用途で使用されている

**共存戦略**:

```typescript
// 既存インターフェース: ドキュメント変換専用
export interface IDocumentConverter {
  convert(
    content: Buffer | string,
    metadata: DocumentMetadata,
  ): Promise<ConvertedDocument>;
}

// 新規インターフェース: 汎用ファイル変換
export interface IConverter {
  convert(
    input: ConverterInput,
    options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>>;
}

// ブリッジ: 相互変換を提供
export class ConverterBridge {
  static toDocumentConverter(converter: IConverter): IDocumentConverter {
    // IConverter → IDocumentConverter
  }

  static fromDocumentConverter(converter: IDocumentConverter): IConverter {
    // IDocumentConverter → IConverter
  }
}
```

---

### 3.3 パターンC: 既存インターフェースが存在しない（推奨）

**適用条件**:

- 既存インターフェースが見つからない（現状）
- 本タスクが初実装

**実装戦略**:

1. 新規設計の`IConverter`をそのまま実装
2. 将来的に別のインターフェースが必要になった場合は、パターンBで共存

**推奨理由**:

- 最もシンプル
- 技術的負債がない
- 将来の拡張も容易

---

## 4. 現時点での結論

**採用パターン**: **パターンC（既存インターフェースが存在しない）**

**根拠**:

- 既存のコンバーター関連インターフェースが見つからない
- 新規設計をそのまま実装可能
- 将来的に既存インターフェースが発見された場合は、パターンA/Bで対応

---

## 5. 実装時の注意事項

### 5.1 既存コードの確認

実装開始前に以下を確認:

1. `packages/shared/src/`配下の全ファイルでコンバーター関連のインターフェース検索
2. 発見された場合は、このドキュメントを更新し、適切なパターンを選択

### 5.2 将来の互換性

新規設計は以下を考慮し、将来の統合が容易:

- Result型の使用（既存パターンと一貫）
- エラーハンドリングの統一（RAGError使用）
- Branded Type（FileId等）の使用

---

## 6. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容                                       |
| ---------- | ---------- | ------ | ---------------------------------------------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成（既存インターフェース調査結果を記録） |
