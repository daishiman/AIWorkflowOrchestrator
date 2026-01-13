# Environment Backend 実装ガイド

## Part 1: 概念的な説明（中学生でもわかる版）

### Environment Backendとは何か？

Environment Backendは、AIアシスタント（エージェント）が作成したHTMLやコードを**安全にプレビュー**するための仕組みです。

**たとえ話**で説明すると：

> 郵便で届いた手紙を考えてみてください。手紙の中に「この薬を飲んでください」と書いてあっても、実際に飲む前に「これは本当に安全なのか？」と確認しますよね。
> Environment Backendは、AIが作ったコードを表示する前に「悪意のあるコードが含まれていないか」をチェックする**セキュリティガード**のような役割を果たします。

### なぜ必要なのか？（XSS対策の重要性）

**XSS（クロスサイトスクリプティング）**は、悪意のあるコードがウェブページに紛れ込み、あなたの情報を盗んだり、勝手に操作したりする攻撃です。

**具体例**：

- `<script>alert('ハッキング!')</script>` → 勝手にプログラムが実行される
- `<img onerror="悪意のあるコード">` → 画像読み込みエラーを装った攻撃
- `<a href="javascript:悪意のあるコード">` → リンクをクリックすると攻撃される

Environment Backendは、これらの危険なコードを**自動的に削除**して、安全なHTMLだけを表示します。

### どのように動作するか（データフロー）

```
【ステップ1】AIがHTMLを生成
     ↓
【ステップ2】ContentExtractorがコードブロックを抽出
     ↓
【ステップ3】ContentSanitizerが危険なコードを除去
     ↓
【ステップ4】TempFileManagerが一時ファイルとして保存
     ↓
【ステップ5】安全なHTMLをプレビュー表示
     ↓
【ステップ6】使い終わったらファイルを削除
```

### まとめ

| 質問         | 答え                           |
| ------------ | ------------------------------ |
| 何をするの？ | AIが作ったHTMLを安全に表示する |
| なぜ必要？   | 悪意のあるコードから守るため   |
| どうやって？ | 危険なコードを自動で削除する   |

---

## Part 2: 技術的な詳細（開発者・技術者向け）

### 型定義ドキュメント

```typescript
// ContentType - サポートするコンテンツタイプ
export type ContentType = "html" | "markdown" | "css" | "javascript" | "text";

// ExtractedContent - 抽出されたコンテンツ
export interface ExtractedContent {
  id: string;
  type: ContentType;
  content: string;
  language?: string;
  order: number;
  extractedAt: Date;
}

// SanitizedContent - サニタイズ済みコンテンツ
export interface SanitizedContent {
  id: string;
  type: ContentType;
  originalContent: string;
  sanitizedContent: string;
  removedElements: string[];
  sanitizedAt: Date;
}

// PreviewContent - プレビュー用コンテンツ
export interface PreviewContent {
  executionId: string;
  contents: SanitizedContent[];
  tempFilePath?: string;
  createdAt: Date;
}
```

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                    Renderer Process                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              AgentStateManager                   │    │
│  │                                                  │    │
│  │    preloadAPI.agent.extractContent()            │    │
│  │    preloadAPI.agent.getPreviewContent()         │    │
│  │    preloadAPI.agent.cleanupTempFiles()          │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │ IPC                              │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│                       ▼                                   │
│                 Main Process                              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │           EnvironmentService (Facade)            │    │
│  │                                                  │    │
│  │   ┌───────────────┐  ┌───────────────────────┐  │    │
│  │   │ContentExtractor│  │   ContentSanitizer    │  │    │
│  │   │               │  │   (DOMPurify)         │  │    │
│  │   └───────────────┘  └───────────────────────┘  │    │
│  │                                                  │    │
│  │   ┌───────────────┐                             │    │
│  │   │TempFileManager │                             │    │
│  │   │               │                             │    │
│  │   └───────────────┘                             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### コンポーネント詳細

| コンポーネント       | 責務                                     | 主要メソッド                                                     |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `ContentExtractor`   | Markdownテキストからコードブロックを抽出 | `extractCodeBlocks(text)`, `parseCodeBlock(match)`               |
| `ContentSanitizer`   | DOMPurifyを使用したHTML XSS対策          | `sanitize(content)`, `sanitizeHtml(html)`                        |
| `TempFileManager`    | 一時ファイルの作成・管理・削除           | `createTempFile(content)`, `cleanup()`, `cleanupAll()`           |
| `EnvironmentService` | Facadeパターンによる統合サービス         | `extractAndSanitize(text)`, `getPreviewContent(id)`, `cleanup()` |

### IPC チャンネル仕様

| チャンネル              | 引数                  | 戻り値                   | 説明                                   |
| ----------------------- | --------------------- | ------------------------ | -------------------------------------- |
| `agent:extract-content` | `text: string`        | `PreviewContent`         | テキストからコンテンツ抽出・サニタイズ |
| `agent:get-preview`     | `executionId: string` | `PreviewContent \| null` | プレビュー用コンテンツ取得             |
| `agent:cleanup-temp`    | なし                  | `void`                   | 一時ファイルクリーンアップ             |

### 使用例

```typescript
// Renderer Process側

// 1. コンテンツ抽出
const agentOutput = `
Here's a sample HTML:
\`\`\`html
<div class="container">
  <h1>Hello World</h1>
</div>
\`\`\`
`;
const content = await preloadAPI.agent.extractContent(agentOutput);

// 2. プレビュー取得
const preview = await preloadAPI.agent.getPreviewContent(content.executionId);

// 3. クリーンアップ
await preloadAPI.agent.cleanupTempFiles();
```

### セキュリティガイドライン

#### XSS対策（ContentSanitizer）

| 除去対象                | 例                             | 理由                       |
| ----------------------- | ------------------------------ | -------------------------- |
| scriptタグ              | `<script>...</script>`         | 任意のJavaScript実行防止   |
| iframeタグ              | `<iframe src="...">`           | 外部サイト埋め込み防止     |
| イベントハンドラ        | `onclick`, `onerror`, `onload` | インラインJavaScript防止   |
| javascript:プロトコル   | `href="javascript:..."`        | リンク経由のコード実行防止 |
| data:プロトコル（HTML） | `src="data:text/html,..."`     | Base64エンコード攻撃防止   |

#### ファイルセキュリティ（TempFileManager）

| 設定                   | 値                   | 理由                       |
| ---------------------- | -------------------- | -------------------------- |
| ファイルパーミッション | `0o600`              | オーナーのみ読み書き可能   |
| ファイル名             | UUIDベース           | 推測不可能なファイル名     |
| 保存先                 | OSの一時ディレクトリ | 標準的なクリーンアップ対象 |

### 依存関係

| パッケージ  | バージョン | 用途                   |
| ----------- | ---------- | ---------------------- |
| `dompurify` | ^3.x       | HTMLサニタイズ         |
| `jsdom`     | ^24.x      | Node.js環境でのDOM操作 |

### テスト結果

| メトリクス               | 結果 |
| ------------------------ | ---- |
| 総テスト数               | 98件 |
| パス                     | 98件 |
| カバレッジ（Statements） | 100% |
| カバレッジ（Branches）   | 100% |
| カバレッジ（Functions）  | 100% |
| カバレッジ（Lines）      | 100% |

### ファイル構成

```
apps/desktop/src/main/services/environment/
├── ContentExtractor.ts      # コードブロック抽出
├── ContentSanitizer.ts      # HTMLサニタイズ
├── TempFileManager.ts       # 一時ファイル管理
├── EnvironmentService.ts    # Facadeサービス
├── index.ts                 # エクスポート
└── __tests__/
    ├── ContentExtractor.test.ts
    ├── ContentSanitizer.test.ts
    ├── TempFileManager.test.ts
    └── EnvironmentService.test.ts
```
