# Phase 2: 型定義設計書

## 概要

Environment Backend（AGENT-007）の型定義設計。

## 型定義

### ContentType

サポートするコンテンツタイプを定義。

```typescript
export type ContentType = "html" | "markdown" | "css" | "javascript" | "text";
```

### ExtractedContent

抽出されたコンテンツの構造。

```typescript
export interface ExtractedContent {
  id: string; // ユニークID（UUID）
  type: ContentType; // コンテンツタイプ
  content: string; // 抽出されたコンテンツ
  language?: string; // コードブロックの言語指定
  order: number; // 出現順序
  extractedAt: Date; // 抽出日時
}
```

### SanitizedContent

サニタイズ済みコンテンツの構造。

```typescript
export interface SanitizedContent {
  id: string; // 元のExtractedContentと同じID
  type: ContentType; // コンテンツタイプ
  originalContent: string; // サニタイズ前のコンテンツ
  sanitizedContent: string; // サニタイズ後のコンテンツ
  removedElements: string[]; // 除去された要素のリスト
  sanitizedAt: Date; // サニタイズ日時
}
```

### PreviewContent

プレビュー用コンテンツの構造。

```typescript
export interface PreviewContent {
  executionId: string; // 実行ID
  contents: SanitizedContent[]; // サニタイズ済みコンテンツ配列
  tempFilePath?: string; // 一時ファイルパス（存在する場合）
  createdAt: Date; // 作成日時
}
```

## 型の関連図

```
ExtractedContent[]
        │
        ▼ ContentSanitizer.sanitize()
SanitizedContent[]
        │
        ▼ EnvironmentService.extractAndSanitize()
PreviewContent
```

## 配置場所

```
packages/shared/src/types/agent.ts
```

## エクスポート

```typescript
// packages/shared/src/types/agent.ts
export type { ContentType, ExtractedContent, SanitizedContent, PreviewContent };
```

## 完了条件

- [x] ContentType型が定義されている
- [x] ExtractedContent型が定義されている
- [x] SanitizedContent型が定義されている
- [x] PreviewContent型が定義されている
- [x] 型の関連が明確化されている
