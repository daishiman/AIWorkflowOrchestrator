# Function Calling 設計ガイド

## 概要

Function Callingは、AIに構造化されたツール呼び出しを
させるための仕組みです。

## 基本構造

### 関数定義

```typescript
interface FunctionDefinition {
  name: string; // 関数名（snake_case推奨）
  description: string; // 関数の説明（AIが判断に使用）
  parameters: JSONSchema; // パラメータのJSON Schema
}
```

### 例: データ抽出関数

```typescript
const extractDataFunction = {
  name: "extract_structured_data",
  description: "テキストから構造化データを抽出する",
  parameters: {
    type: "object",
    properties: {
      entities: {
        type: "array",
        description: "抽出されたエンティティのリスト",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: {
              type: "string",
              enum: ["person", "organization", "location"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
          required: ["name", "type", "confidence"],
        },
      },
      relationships: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: { type: "string" },
            target: { type: "string" },
            relation: { type: "string" },
          },
        },
      },
    },
    required: ["entities"],
  },
};
```

## 設計原則

### 1. 明確な関数名

**すべきこと**:

- snake_case形式
- 動詞+名詞の形式
- 具体的な動作を示す

```typescript
// ✅ 良い例
"extract_user_info";
"analyze_sentiment";
"generate_summary";

// ❌ 悪い例
"process"; // 曖昧
"doStuff"; // camelCase
"UserExtractor"; // 名詞のみ
```

### 2. 詳細な説明

```typescript
// ✅ 良い例
description: "ユーザーのレビューテキストから感情分析を行い、" +
  "ポジティブ/ネガティブ/ニュートラルのスコアを返す";

// ❌ 悪い例
description: "感情分析";
```

### 3. パラメータの説明

```typescript
parameters: {
  type: "object",
  properties: {
    text: {
      type: "string",
      description: "分析対象のテキスト（最大5000文字）",
      maxLength: 5000
    },
    language: {
      type: "string",
      description: "テキストの言語コード（ISO 639-1）",
      enum: ["ja", "en", "zh", "ko"]
    }
  }
}
```

## ユースケース別パターン

### パターン1: データ変換

```typescript
const transformFunction = {
  name: "transform_data",
  description: "入力データを指定された形式に変換する",
  parameters: {
    type: "object",
    properties: {
      input_format: { type: "string", enum: ["json", "csv", "yaml"] },
      output_format: { type: "string", enum: ["json", "csv", "yaml"] },
      data: { type: "string" },
    },
    required: ["input_format", "output_format", "data"],
  },
};
```

### パターン2: 情報抽出

```typescript
const extractFunction = {
  name: "extract_information",
  description: "文書から特定の情報を抽出する",
  parameters: {
    type: "object",
    properties: {
      document_type: {
        type: "string",
        enum: ["invoice", "contract", "resume"],
        description: "文書の種類",
      },
      fields_to_extract: {
        type: "array",
        items: { type: "string" },
        description: "抽出するフィールド名のリスト",
      },
    },
    required: ["document_type", "fields_to_extract"],
  },
};
```

### パターン3: 判定・分類

```typescript
const classifyFunction = {
  name: "classify_content",
  description: "コンテンツを分類し、カテゴリとスコアを返す",
  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["news", "blog", "academic", "social", "other"],
        description: "主要カテゴリ",
      },
      subcategories: {
        type: "array",
        items: { type: "string" },
        maxItems: 3,
        description: "サブカテゴリ（最大3つ）",
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "分類の信頼度",
      },
    },
    required: ["category", "confidence"],
  },
};
```

## 複数関数の設計

### 関数セットの設計

```typescript
const functionSet = [
  {
    name: "search_database",
    description: "データベースを検索する",
  },
  {
    name: "create_record",
    description: "新しいレコードを作成する",
  },
  {
    name: "update_record",
    description: "既存のレコードを更新する",
  },
  {
    name: "delete_record",
    description: "レコードを削除する",
  },
];
```

### 関数選択の誘導

AIが適切な関数を選択できるよう:

- 各関数の説明を明確に差別化
- 重複する機能を避ける
- ユースケースを説明に含める

## エラーハンドリング

### 関数呼び出し失敗時

```typescript
interface FunctionCallError {
  function_name: string;
  error_code: "invalid_params" | "execution_failed" | "timeout";
  error_message: string;
  suggested_action?: string;
}
```

### リトライ戦略

1. パラメータエラー → エラー内容をフィードバックして再試行
2. 実行エラー → 代替関数を検討
3. タイムアウト → パラメータを簡略化して再試行
