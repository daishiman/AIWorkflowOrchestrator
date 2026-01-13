# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 5                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- 型定義追加: packages/shared/src/types/agent.tsに型定義を追加
- ContentExtractor実装: コードブロック抽出の実装
- ContentSanitizer実装: DOMPurifyによるサニタイズ実装
- TempFileManager実装: 一時ファイル管理の実装
- EnvironmentService実装: 統合サービスの実装
- IPC統合: agentHandlers・channelsの更新

## 参照資料

| 資料名       | パス                                     | 説明          |
| ------------ | ---------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                             | 内容               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------ |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | Facadeパターン設計 |
| セキュリティ実装   | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | XSS対策原則        |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | サニタイズ実装     |

## 実行手順

### 1. 依存パッケージ追加

```bash
# DOMPurify と jsdom を追加
pnpm --filter @repo/desktop add dompurify jsdom
pnpm --filter @repo/desktop add -D @types/dompurify @types/jsdom
```

### 2. 型定義追加

**ファイル**: `packages/shared/src/types/agent.ts`

```typescript
// 既存の型定義に追加

export type ContentType = "html" | "markdown" | "css" | "javascript" | "text";

export interface ExtractedContent {
  id: string;
  type: ContentType;
  content: string;
  language?: string;
  order: number;
  extractedAt: Date;
}

export interface SanitizedContent {
  id: string;
  type: ContentType;
  originalContent: string;
  sanitizedContent: string;
  removedElements: string[];
  sanitizedAt: Date;
}

export interface PreviewContent {
  executionId: string;
  contents: SanitizedContent[];
  tempFilePath?: string;
  createdAt: Date;
}
```

### 3. ContentExtractor実装

**ファイル**: `apps/desktop/src/main/services/environment/ContentExtractor.ts`

Phase 2設計に基づいて実装。

### 4. ContentSanitizer実装

**ファイル**: `apps/desktop/src/main/services/environment/ContentSanitizer.ts`

Phase 2設計に基づいて実装。DOMPurify設定:

```typescript
const config = {
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "base"],
  FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onfocus"],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
};
```

### 5. TempFileManager実装

**ファイル**: `apps/desktop/src/main/services/environment/TempFileManager.ts`

Phase 2設計に基づいて実装。パーミッション設定:

```typescript
await fs.writeFile(filepath, content.sanitizedContent, {
  encoding: "utf-8",
  mode: 0o600, // owner read/write only
});
```

### 6. EnvironmentService実装

**ファイル**: `apps/desktop/src/main/services/environment/EnvironmentService.ts`

Phase 2設計に基づいて実装。

### 7. index.ts作成

**ファイル**: `apps/desktop/src/main/services/environment/index.ts`

```typescript
export { ContentExtractor } from "./ContentExtractor";
export { ContentSanitizer } from "./ContentSanitizer";
export { TempFileManager } from "./TempFileManager";
export { EnvironmentService } from "./EnvironmentService";
```

### 8. IPCチャネル更新

**ファイル**: `apps/desktop/src/preload/channels.ts`

```typescript
// 追加
AGENT_EXTRACT_CONTENT: "agent:extract-content",
AGENT_GET_PREVIEW_CONTENT: "agent:get-preview-content",
AGENT_CLEANUP_TEMP_FILES: "agent:cleanup-temp-files",
```

### 9. agentHandlers更新

**ファイル**: `apps/desktop/src/main/ipc/agentHandlers.ts`

registerEnvironmentHandlers関数を追加。

### 10. Main Process初期化

**ファイル**: `apps/desktop/src/main/index.ts` (または適切な初期化ファイル)

```typescript
import { EnvironmentService } from "./services/environment";
import { registerEnvironmentHandlers } from "./ipc/agentHandlers";

// 初期化
const environmentService = new EnvironmentService();
await environmentService.initialize();
registerEnvironmentHandlers(environmentService);

// アプリ終了時のクリーンアップ
app.on("before-quit", async () => {
  await environmentService.cleanupTempFiles();
});
```

## 実装ファイル一覧

| ファイル           | パス                                                               | 状態 |
| ------------------ | ------------------------------------------------------------------ | ---- |
| 型定義             | `packages/shared/src/types/agent.ts`                               | 更新 |
| ContentExtractor   | `apps/desktop/src/main/services/environment/ContentExtractor.ts`   | 新規 |
| ContentSanitizer   | `apps/desktop/src/main/services/environment/ContentSanitizer.ts`   | 新規 |
| TempFileManager    | `apps/desktop/src/main/services/environment/TempFileManager.ts`    | 新規 |
| EnvironmentService | `apps/desktop/src/main/services/environment/EnvironmentService.ts` | 新規 |
| index.ts           | `apps/desktop/src/main/services/environment/index.ts`              | 新規 |
| channels.ts        | `apps/desktop/src/preload/channels.ts`                             | 更新 |
| agentHandlers.ts   | `apps/desktop/src/main/ipc/agentHandlers.ts`                       | 更新 |

## 統合テスト連携【必須】

Main/Renderer接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                |
| ------------------ | ----------------------------------- |
| IPC接続            | 3チャネル登録、PreviewContent型返却 |
| エラーハンドリング | try-catch、エラーオブジェクト返却   |
| 状態同期           | previewCacheによるキャッシュ        |

## 成果物

| 成果物     | パス                                          | 説明     |
| ---------- | --------------------------------------------- | -------- |
| 実装コード | `apps/desktop/src/main/services/environment/` | 機能実装 |
| 型定義     | `packages/shared/src/types/agent.ts`          | 型更新   |
| IPC更新    | `apps/desktop/src/main/ipc/agentHandlers.ts`  | IPC追加  |

## 完了条件

- [ ] 型定義が追加されている
- [ ] ContentExtractorが実装されている
- [ ] ContentSanitizerが実装されている
- [ ] TempFileManagerが実装されている
- [ ] EnvironmentServiceが実装されている
- [ ] IPCチャネルが追加されている
- [ ] agentHandlersが更新されている
- [ ] すべてのテストが成功状態（Green）
- [ ] フロント/バック接続が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 依存パッケージ追加
2. 型定義追加
3. ContentExtractor実装
4. ContentSanitizer実装
5. TempFileManager実装
6. EnvironmentService実装
7. index.ts作成
8. IPCチャネル更新
9. agentHandlers更新
10. Main Process初期化
11. Green状態の確認
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 5
```

## 次のPhase

Phase 6: テスト拡充
