# Claude CLI Renderer API 型定義書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| バージョン | 1.0.0      |
| 作成日     | 2026-01-17 |
| Phase      | 2          |
| ステータス | 完了       |

---

## 1. 型定義概要

Claude CLI Renderer APIの型定義は以下の場所に配置されている:

| 定義場所                            | 内容                              |
| ----------------------------------- | --------------------------------- |
| `apps/desktop/src/preload/types.ts` | Preload API固有の型               |
| `packages/shared/src/claude-cli/`   | 共通型定義（Main/Rendererで共有） |

---

## 2. メインインターフェース

### 2.1 ClaudeCliAPI

**定義場所**: `apps/desktop/src/preload/types.ts` (1313-1337行)

```typescript
export interface ClaudeCliAPI {
  checkInstallation: () => Promise<ClaudeCliResult<CliInstallationStatus>>;
  listSkills: (
    request?: ClaudeCliListSkillsRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliScanResult>>;
  getSkillDetail: (
    request: ClaudeCliGetSkillDetailRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliSkillDetail>>;
  executeScript: (
    request: ClaudeCliExecuteScriptRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliExecuteScriptResponse>>;
  terminateSession: (
    request: ClaudeCliTerminateSessionRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliTerminateSessionResponse>>;
  listSessions: () => Promise<ClaudeCliResult<ClaudeCliSessionSummary[]>>;
  getSession: (
    request: ClaudeCliGetSessionRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliSessionDetail>>;
  onSessionOutput: (
    callback: (event: ClaudeCliSessionOutputEvent) => void,
  ) => () => void;
  onSessionStatus: (
    callback: (event: ClaudeCliSessionStatusEvent) => void,
  ) => () => void;
}
```

---

## 3. リクエスト型

### 3.1 ClaudeCliListSkillsRequest

**用途**: スキル一覧取得リクエスト

```typescript
interface ClaudeCliListSkillsRequest {
  workingDirectory?: string;
  includeGlobal?: boolean;
}
```

### 3.2 ClaudeCliGetSkillDetailRequest

**用途**: スキル詳細取得リクエスト

```typescript
interface ClaudeCliGetSkillDetailRequest {
  skillName: string;
  workingDirectory?: string;
}
```

### 3.3 ClaudeCliExecuteScriptRequest

**用途**: スクリプト実行リクエスト

```typescript
interface ClaudeCliExecuteScriptRequest {
  script: string;
  workingDirectory?: string;
  args?: string[];
}
```

### 3.4 ClaudeCliTerminateSessionRequest

**用途**: セッション終了リクエスト

```typescript
interface ClaudeCliTerminateSessionRequest {
  sessionId: string;
}
```

### 3.5 ClaudeCliGetSessionRequest

**用途**: セッション詳細取得リクエスト

```typescript
interface ClaudeCliGetSessionRequest {
  sessionId: string;
}
```

---

## 4. レスポンス型

### 4.1 ClaudeCliResult<T>

**用途**: すべてのAPI呼び出しの結果型

```typescript
type ClaudeCliResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };
```

### 4.2 CliInstallationStatus

**用途**: CLIインストール状況

```typescript
interface CliInstallationStatus {
  installed: boolean;
  version?: string;
  path?: string;
}
```

### 4.3 ClaudeCliScanResult

**用途**: スキルスキャン結果

```typescript
interface ClaudeCliScanResult {
  skills: Array<{
    name: string;
    description?: string;
    path: string;
  }>;
  totalCount: number;
}
```

### 4.4 ClaudeCliSkillDetail

**用途**: スキル詳細情報

```typescript
interface ClaudeCliSkillDetail {
  name: string;
  description?: string;
  path: string;
  commands: string[];
  metadata?: Record<string, unknown>;
}
```

---

## 5. イベント型

### 5.1 ClaudeCliSessionOutputEvent

**定義場所**: `apps/desktop/src/preload/types.ts` (1301-1305行)

```typescript
export interface ClaudeCliSessionOutputEvent {
  sessionId: string;
  type: "stdout" | "stderr";
  content: string;
}
```

### 5.2 ClaudeCliSessionStatusEvent

**定義場所**: `apps/desktop/src/preload/types.ts` (1307-1311行)

```typescript
export interface ClaudeCliSessionStatusEvent {
  sessionId: string;
  oldStatus?: string;
  newStatus: string;
}
```

---

## 6. グローバル型宣言

### 6.1 Window インターフェース拡張

**定義場所**: `apps/desktop/src/preload/types.ts` (1340-1348行)

```typescript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    slideApi: SlideApi;
    agentAPI: AgentExecutionAPI;
    agentSDKAPI: AgentSDKAPI;
    slideSettingsAPI: SlideSettingsAPI;
    claudeCliAPI: ClaudeCliAPI;
  }
}
```

---

## 7. 型インポート/エクスポート

### 7.1 @repo/sharedからのインポート

**定義場所**: `apps/desktop/src/preload/types.ts` (1269-1283行)

```typescript
import type {
  CliInstallationStatus,
  ScanResult as ClaudeCliScanResult,
  ClaudeCliSkillDetail,
  SessionSummary as ClaudeCliSessionSummary,
  SessionDetail as ClaudeCliSessionDetail,
  ListSkillsRequest as ClaudeCliListSkillsRequest,
  GetSkillDetailRequest as ClaudeCliGetSkillDetailRequest,
  ExecuteScriptRequest as ClaudeCliExecuteScriptRequest,
  ExecuteScriptResponse as ClaudeCliExecuteScriptResponse,
  TerminateSessionRequest as ClaudeCliTerminateSessionRequest,
  TerminateSessionResponse as ClaudeCliTerminateSessionResponse,
  GetSessionRequest as ClaudeCliGetSessionRequest,
  Result as ClaudeCliResult,
} from "@repo/shared";
```

### 7.2 型エクスポート

**定義場所**: `apps/desktop/src/preload/types.ts` (1285-1299行)

```typescript
export type {
  CliInstallationStatus,
  ClaudeCliScanResult,
  ClaudeCliSkillDetail,
  ClaudeCliSessionSummary,
  ClaudeCliSessionDetail,
  ClaudeCliListSkillsRequest,
  ClaudeCliGetSkillDetailRequest,
  ClaudeCliExecuteScriptRequest,
  ClaudeCliExecuteScriptResponse,
  ClaudeCliTerminateSessionRequest,
  ClaudeCliTerminateSessionResponse,
  ClaudeCliGetSessionRequest,
  ClaudeCliResult,
};
```

---

## 8. 型整合性確認

| 型                      | Preload定義   | Shared定義 | 整合性  |
| ----------------------- | ------------- | ---------- | ------- |
| `CliInstallationStatus` | ✅ インポート | ✅ 定義元  | ✅ 一致 |
| `ClaudeCliScanResult`   | ✅ インポート | ✅ 定義元  | ✅ 一致 |
| `ClaudeCliSkillDetail`  | ✅ インポート | ✅ 定義元  | ✅ 一致 |
| `ClaudeCliResult`       | ✅ インポート | ✅ 定義元  | ✅ 一致 |

---

## 9. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-17 | 初版作成 |
