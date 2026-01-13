# Phase 2: アーキテクチャ設計書

## 概要

| 項目     | 内容                |
| -------- | ------------------- |
| タスクID | AGENT-007           |
| タスク名 | Environment Backend |
| 作成日   | 2025-01-13          |
| パターン | Facade + Strategy   |

## コンポーネント構成図

```
Main Process (Electron)
├── EnvironmentService (Facade - エントリポイント)
│   ├── ContentExtractor (コードブロック抽出)
│   ├── ContentSanitizer (HTML安全化 - DOMPurify)
│   └── TempFileManager (一時ファイル管理)
└── IPC Handlers (Renderer通信)
    └── agentHandlers.ts (registerEnvironmentHandlers)
```

## データフロー

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
│  │   └───────────────┘                             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 設計原則

### Facadeパターン

- `EnvironmentService` が外部インターフェースを提供
- 内部コンポーネントの複雑さを隠蔽
- 単一のエントリポイントでテスト容易性を確保

### 単一責任原則

| コンポーネント     | 単一責任                 |
| ------------------ | ------------------------ |
| ContentExtractor   | コードブロック抽出のみ   |
| ContentSanitizer   | HTMLサニタイズのみ       |
| TempFileManager    | ファイル管理のみ         |
| EnvironmentService | オーケストレーションのみ |

### 依存関係注入

```typescript
export class EnvironmentService {
  constructor(
    private extractor: ContentExtractor = new ContentExtractor(),
    private sanitizer: ContentSanitizer = new ContentSanitizer(),
    private tempFileManager: TempFileManager = new TempFileManager(),
  ) {}
}
```

## セキュリティ設計

### DOMPurify設定

```typescript
const sanitized = this.purify.sanitize(content, {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base"],
  FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onfocus"],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
});
```

### ファイルパーミッション

```typescript
await fs.writeFile(filepath, content, {
  encoding: "utf-8",
  mode: 0o600, // owner read/write only
});
```

## 統合ポイント

| 統合ポイント        | 契約定義                          |
| ------------------- | --------------------------------- |
| Main→Renderer (IPC) | PreviewContent型での返却          |
| Renderer→Main (IPC) | text, executionIdパラメータ       |
| サービス間          | ExtractedContent→SanitizedContent |

## 完了条件

- [x] コンポーネント構成図が作成されている
- [x] データフロー図が作成されている
- [x] セキュリティ設計が完成している
- [x] 統合ポイントが定義されている
