# Phase 5: API仕様書

## EnvironmentService API

### 1. initialize()

初期化処理（一時ディレクトリ作成）

```typescript
async initialize(): Promise<void>
```

**使用例:**

```typescript
const service = new EnvironmentService();
await service.initialize();
```

---

### 2. extractAndSanitize()

テキストからコードブロックを抽出し、サニタイズ処理を行う

```typescript
async extractAndSanitize(
  text: string,
  executionId: string
): Promise<PreviewContent>
```

**パラメータ:**
| 名前 | 型 | 説明 |
|------|-----|------|
| text | string | エージェント出力テキスト（コードブロック含む） |
| executionId | string | 実行ID（キャッシュキー） |

**戻り値:** `PreviewContent`

```typescript
{
  executionId: string;      // 実行ID
  contents: SanitizedContent[];  // サニタイズ済みコンテンツ配列
  tempFilePath?: string;    // 一時ファイルパス（プレビュー用）
  createdAt: Date;          // 作成日時
}
```

**使用例:**

```typescript
const text = `
\`\`\`html
<div onclick="alert('xss')">Hello</div>
\`\`\`
`;

const result = await service.extractAndSanitize(text, "exec-123");
// result.contents[0].sanitizedContent = "<div>Hello</div>"
```

---

### 3. getPreviewContent()

キャッシュからプレビューコンテンツを取得

```typescript
getPreviewContent(executionId: string): PreviewContent | null
```

**パラメータ:**
| 名前 | 型 | 説明 |
|------|-----|------|
| executionId | string | 実行ID |

**戻り値:** `PreviewContent | null`

**使用例:**

```typescript
const cached = service.getPreviewContent("exec-123");
if (cached) {
  console.log(cached.tempFilePath);
}
```

---

### 4. cleanupTempFiles()

一時ファイルとキャッシュをクリーンアップ

```typescript
async cleanupTempFiles(): Promise<void>
```

**使用例:**

```typescript
await service.cleanupTempFiles();
```

---

## IPC チャンネル仕様

### agent:extract-content

**リクエスト:**

```typescript
{
  text: string; // 抽出対象テキスト
  executionId: string; // 実行ID
}
```

**レスポンス:** `PreviewContent`

---

### agent:get-preview-content

**リクエスト:**

```typescript
{
  executionId: string; // 実行ID
}
```

**レスポンス:** `PreviewContent | null`

---

### agent:cleanup-temp-files

**リクエスト:** なし

**レスポンス:** `{ success: boolean }`

---

## 型定義

### ContentType

```typescript
type ContentType = "html" | "markdown" | "css" | "javascript" | "text";
```

### ExtractedContent

```typescript
interface ExtractedContent {
  id: string; // UUID
  type: ContentType; // コンテンツタイプ
  content: string; // 抽出されたコンテンツ
  language?: string; // 言語指定（オプション）
  order: number; // 出現順序
  extractedAt: Date; // 抽出日時
}
```

### SanitizedContent

```typescript
interface SanitizedContent {
  id: string; // UUID（ExtractedContentから継承）
  type: ContentType; // コンテンツタイプ
  originalContent: string; // サニタイズ前のコンテンツ
  sanitizedContent: string; // サニタイズ後のコンテンツ
  removedElements: string[]; // 除去された要素リスト
  sanitizedAt: Date; // サニタイズ日時
}
```

### PreviewContent

```typescript
interface PreviewContent {
  executionId: string; // 実行ID
  contents: SanitizedContent[]; // サニタイズ済みコンテンツ配列
  tempFilePath?: string; // 一時ファイルパス
  createdAt: Date; // 作成日時
}
```
