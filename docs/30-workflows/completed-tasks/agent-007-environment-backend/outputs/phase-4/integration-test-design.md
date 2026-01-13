# 統合テスト設計書

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 4                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |
| 状態   | 完了                          |

## 概要

本ドキュメントは、Environment Backendの統合テスト設計を定義する。コンポーネント間の連携とIPCを通じたエンドツーエンドの動作を検証する。

## 統合テスト範囲

### テスト対象

```
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    agentAPI                              ││
│  │  - extractContent()                                      ││
│  │  - getPreviewContent()                                   ││
│  │  - cleanupTempFiles()                                    ││
│  └────────────────────────┬────────────────────────────────┘│
└───────────────────────────┼─────────────────────────────────┘
                            │ IPC
                            ▼
┌───────────────────────────┴─────────────────────────────────┐
│                     Main Process                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               EnvironmentService (Facade)                ││
│  │  ┌───────────────┐ ┌──────────────┐ ┌────────────────┐ ││
│  │  │ContentExtractor│ │ContentSanitizer│ │TempFileManager│ ││
│  │  └───────────────┘ └──────────────┘ └────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 統合レベル

| レベル | 範囲                       | テスト種別         |
| ------ | -------------------------- | ------------------ |
| L1     | 単一コンポーネント         | 単体テスト         |
| L2     | Facade内コンポーネント間   | コンポーネント統合 |
| L3     | IPC経由（Main-Renderer間） | IPC統合            |
| L4     | エンドツーエンド           | E2E                |

## 統合テストシナリオ

### シナリオ1: コンテンツ抽出〜プレビュー生成

```
Given: エージェント出力テキストが存在
When: extractContent APIを呼び出す
Then:
  - コードブロックが抽出される
  - HTMLがサニタイズされる
  - 一時ファイルが生成される
  - PreviewContentが返却される
```

**データフロー**:

```
text → ContentExtractor → ExtractedContent[]
                              ↓
                        ContentSanitizer → SanitizedContent[]
                              ↓
                        TempFileManager → tempFilePath
                              ↓
                        PreviewCache → cache
                              ↓
                        PreviewContent
```

**検証ポイント**:

| チェック項目       | 検証方法                    |
| ------------------ | --------------------------- |
| 抽出結果の正確性   | contents配列の検証          |
| サニタイズの完全性 | XSSベクター除去確認         |
| ファイル生成       | tempFilePathの存在確認      |
| キャッシュ登録     | getPreviewContentで取得可能 |

### シナリオ2: キャッシュ取得

```
Given: 既にextractContentで抽出済み
When: getPreviewContent APIを呼び出す
Then: キャッシュされたPreviewContentが返却される
```

**検証ポイント**:

| チェック項目       | 検証方法                 |
| ------------------ | ------------------------ |
| executionIdの一致  | 同一executionIdで取得    |
| コンテンツの一致   | 内容が変化していないこと |
| 存在しないIDの処理 | null返却                 |

### シナリオ3: クリーンアップ

```
Given: 一時ファイルが存在しキャッシュに登録済み
When: cleanupTempFiles APIを呼び出す
Then:
  - 一時ファイルが削除される
  - キャッシュがクリアされる
```

**検証ポイント**:

| チェック項目     | 検証方法                |
| ---------------- | ----------------------- |
| ファイル削除     | ファイル不在確認        |
| キャッシュクリア | getPreviewContentでnull |

## IPCテスト設計

### チャネル別テスト

#### agent:extract-content

| テストID | 入力                    | 期待出力           |
| -------- | ----------------------- | ------------------ |
| IPC-001  | 有効なtext, executionId | PreviewContent     |
| IPC-002  | 空のtext                | 空contents配列     |
| IPC-003  | 不正なexecutionId（空） | エラーまたは空結果 |
| IPC-004  | 型不正（textが数値）    | エラー             |

#### agent:get-preview-content

| テストID | 入力                  | 期待出力       |
| -------- | --------------------- | -------------- |
| IPC-005  | 存在するexecutionId   | PreviewContent |
| IPC-006  | 存在しないexecutionId | null           |
| IPC-007  | 空のexecutionId       | null           |

#### agent:cleanup-temp-files

| テストID | 入力 | 期待出力 |
| -------- | ---- | -------- |
| IPC-008  | なし | true     |

### エラーハンドリングテスト

| テストID | シナリオ         | 期待動作               |
| -------- | ---------------- | ---------------------- |
| ERR-001  | サニタイズ失敗   | 該当コンテンツスキップ |
| ERR-002  | ファイル保存失敗 | tempFilePathなし返却   |
| ERR-003  | ファイル削除失敗 | 処理継続、true返却     |

## セキュリティテスト

### XSS攻撃ベクターテスト

| テストID | 攻撃ベクター                        | 期待動作        |
| -------- | ----------------------------------- | --------------- |
| SEC-001  | `<script>alert('XSS')</script>`     | scriptタグ除去  |
| SEC-002  | `<img onerror="alert('XSS')">`      | onerror属性除去 |
| SEC-003  | `<div onclick="...">`               | onclick属性除去 |
| SEC-004  | `<iframe src="evil.com">`           | iframeタグ除去  |
| SEC-005  | `<base href="evil.com">`            | baseタグ除去    |
| SEC-006  | `<body onload="...">`               | onload属性除去  |
| SEC-007  | `<style>body{display:none}</style>` | styleタグ除去   |

### ファイルシステムセキュリティテスト

| テストID | シナリオ                     | 期待動作           |
| -------- | ---------------------------- | ------------------ |
| SEC-008  | ファイルパーミッション確認   | 0o600で作成        |
| SEC-009  | ディレクトリトラバーサル防止 | 制限されたパスのみ |

## テスト実行手順

### 事前条件

1. Electronアプリがビルド済み
2. テスト用一時ディレクトリが利用可能
3. モックサーバーが起動済み（必要に応じて）

### 実行コマンド

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test:integration

# 特定シナリオのみ
pnpm --filter @repo/desktop test:integration -- --grep "シナリオ1"

# カバレッジ付き
pnpm --filter @repo/desktop test:integration:coverage
```

### テストデータ

````typescript
// テスト用入力データ
const testInputs = {
  // 正常系
  validHtml: "```html\n<div>Hello World</div>\n```",
  validMarkdown: "```markdown\n# Heading\n```",
  multipleBlocks: "```html\n<div>First</div>\n```\n```css\n.class{}\n```",

  // XSS攻撃パターン
  xssScript: '```html\n<script>alert("XSS")</script>\n```',
  xssOnclick: '```html\n<button onclick="evil()">Click</button>\n```',
  xssIframe: '```html\n<iframe src="evil.com"></iframe>\n```',

  // エッジケース
  emptyText: "",
  noCodeBlocks: "Plain text without code blocks",
  onlyDangerous: "```html\n<script>only script</script>\n```",
};

// 期待される出力
const expectedOutputs = {
  validHtml: {
    contentsLength: 1,
    type: "html",
    hasTempFile: true,
  },
  xssScript: {
    sanitizedContent: "",
    removedElements: ["script"],
  },
};
````

## モック戦略

### ファイルシステムモック

```typescript
vi.mock("node:fs", () => ({
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  },
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
}));
```

### IPCモック（Renderer側テスト用）

```typescript
const mockIpcRenderer = {
  invoke: vi.fn().mockImplementation((channel, args) => {
    switch (channel) {
      case "agent:extract-content":
        return Promise.resolve(mockPreviewContent);
      case "agent:get-preview-content":
        return Promise.resolve(mockPreviewContent);
      case "agent:cleanup-temp-files":
        return Promise.resolve(true);
    }
  }),
};
```

## 成功基準

| 基準               | 目標値 |
| ------------------ | ------ |
| テストパス率       | 100%   |
| 行カバレッジ       | 80%+   |
| 分岐カバレッジ     | 60%+   |
| セキュリティテスト | 100%   |

## 参照資料

| 資料名               | パス                                   |
| -------------------- | -------------------------------------- |
| IPC設計書            | outputs/phase-2/ipc-design.md          |
| アーキテクチャ設計書 | outputs/phase-2/architecture-design.md |
| セキュリティ要件     | references/security-implementation.md  |
