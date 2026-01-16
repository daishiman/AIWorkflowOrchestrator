# Phase 2: IPC設計書

## 概要

Environment Backend（AGENT-007）のIPC（Inter-Process Communication）設計。

## チャンネル定義

### 定義場所

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // Agent Environment channels
  AGENT_EXTRACT_CONTENT: "agent:extract-content",
  AGENT_GET_PREVIEW: "agent:get-preview",
  AGENT_CLEANUP_TEMP: "agent:cleanup-temp",
} as const;
```

## チャンネル仕様

### agent:extract-content

| 項目 | 値                                       |
| ---- | ---------------------------------------- |
| 方向 | Renderer → Main                          |
| 目的 | テキストからコンテンツを抽出・サニタイズ |

**引数:**

```typescript
{
  text: string; // エージェント出力テキスト
  executionId: string; // 実行ID
}
```

**戻り値:**

```typescript
PreviewContent;
```

### agent:get-preview

| 項目 | 値                                         |
| ---- | ------------------------------------------ |
| 方向 | Renderer → Main                            |
| 目的 | キャッシュされたプレビューコンテンツを取得 |

**引数:**

```typescript
{
  executionId: string; // 実行ID
}
```

**戻り値:**

```typescript
PreviewContent | null;
```

### agent:cleanup-temp

| 項目 | 値                           |
| ---- | ---------------------------- |
| 方向 | Renderer → Main              |
| 目的 | 一時ファイルをクリーンアップ |

**引数:** なし

**戻り値:**

```typescript
void
```

## ハンドラ実装

### 配置場所

```
apps/desktop/src/main/ipc/agentHandlers.ts
```

### 実装パターン

```typescript
export function registerEnvironmentHandlers(
  environmentService: EnvironmentService,
): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_EXTRACT_CONTENT,
    async (_e, { text, executionId }) => {
      return environmentService.extractAndSanitize(text, executionId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_GET_PREVIEW,
    async (_e, { executionId }) => {
      return environmentService.getPreviewContent(executionId);
    },
  );

  ipcMain.handle(IPC_CHANNELS.AGENT_CLEANUP_TEMP, async () => {
    await environmentService.cleanupTempFiles();
  });
}
```

## Preload API

### 配置場所

```
apps/desktop/src/preload/api.ts
```

### インターフェース

```typescript
agent: {
  extractContent: (text: string, executionId: string) =>
    Promise<PreviewContent>;
  getPreviewContent: (executionId: string) => Promise<PreviewContent | null>;
  cleanupTempFiles: () => Promise<void>;
}
```

## セキュリティ考慮

| 項目              | 対策                                  |
| ----------------- | ------------------------------------- |
| Context Isolation | 有効（preload経由でのみアクセス可能） |
| 入力検証          | executionId、textの存在チェック       |
| 出力サニタイズ    | HTMLはDOMPurifyでサニタイズ済み       |

## 完了条件

- [x] 3つのIPCチャンネルが定義されている
- [x] 各チャンネルの引数・戻り値が定義されている
- [x] ハンドラ実装パターンが定義されている
- [x] セキュリティ考慮が記載されている
