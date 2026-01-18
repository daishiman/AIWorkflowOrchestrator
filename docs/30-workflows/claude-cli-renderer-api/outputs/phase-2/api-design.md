# Claude CLI Renderer API 設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| バージョン | 1.0.0      |
| 作成日     | 2026-01-17 |
| Phase      | 2          |
| ステータス | 完了       |

---

## 1. API概要

`window.claudeCliAPI`は、Renderer ProcessからClaude CLI機能にアクセスするためのPreload APIである。contextBridge経由で安全に公開される。

---

## 2. API定義

### 2.1 ClaudeCliAPI インターフェース

```typescript
interface ClaudeCliAPI {
  // CLI存在確認
  checkInstallation: () => Promise<ClaudeCliResult<CliInstallationStatus>>;

  // スキル管理
  listSkills: (
    request?: ClaudeCliListSkillsRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliScanResult>>;
  getSkillDetail: (
    request: ClaudeCliGetSkillDetailRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliSkillDetail>>;

  // スクリプト実行
  executeScript: (
    request: ClaudeCliExecuteScriptRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliExecuteScriptResponse>>;

  // セッション管理
  terminateSession: (
    request: ClaudeCliTerminateSessionRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliTerminateSessionResponse>>;
  listSessions: () => Promise<ClaudeCliResult<ClaudeCliSessionSummary[]>>;
  getSession: (
    request: ClaudeCliGetSessionRequest,
  ) => Promise<ClaudeCliResult<ClaudeCliSessionDetail>>;

  // ストリーミングイベント購読
  onSessionOutput: (
    callback: (event: ClaudeCliSessionOutputEvent) => void,
  ) => () => void;
  onSessionStatus: (
    callback: (event: ClaudeCliSessionStatusEvent) => void,
  ) => () => void;
}
```

---

## 3. メソッド詳細

### 3.1 checkInstallation

**目的**: Claude CLIのインストール状況を確認する

**シグネチャ**:

```typescript
checkInstallation(): Promise<ClaudeCliResult<CliInstallationStatus>>
```

**戻り値**:

```typescript
interface CliInstallationStatus {
  installed: boolean;
  version?: string;
  path?: string;
}
```

### 3.2 listSkills

**目的**: 利用可能なスキル一覧を取得する

**シグネチャ**:

```typescript
listSkills(request?: ClaudeCliListSkillsRequest): Promise<ClaudeCliResult<ClaudeCliScanResult>>
```

**引数**:

```typescript
interface ClaudeCliListSkillsRequest {
  workingDirectory?: string;
  includeGlobal?: boolean;
}
```

### 3.3 getSkillDetail

**目的**: 特定スキルの詳細情報を取得する

**シグネチャ**:

```typescript
getSkillDetail(request: ClaudeCliGetSkillDetailRequest): Promise<ClaudeCliResult<ClaudeCliSkillDetail>>
```

**引数**:

```typescript
interface ClaudeCliGetSkillDetailRequest {
  skillName: string;
  workingDirectory?: string;
}
```

### 3.4 executeScript

**目的**: Claude CLIスクリプトを実行する

**シグネチャ**:

```typescript
executeScript(request: ClaudeCliExecuteScriptRequest): Promise<ClaudeCliResult<ClaudeCliExecuteScriptResponse>>
```

**引数**:

```typescript
interface ClaudeCliExecuteScriptRequest {
  script: string;
  workingDirectory?: string;
  args?: string[];
}
```

### 3.5 terminateSession

**目的**: 実行中のセッションを終了する

**シグネチャ**:

```typescript
terminateSession(request: ClaudeCliTerminateSessionRequest): Promise<ClaudeCliResult<ClaudeCliTerminateSessionResponse>>
```

**引数**:

```typescript
interface ClaudeCliTerminateSessionRequest {
  sessionId: string;
}
```

### 3.6 listSessions

**目的**: 実行中のセッション一覧を取得する

**シグネチャ**:

```typescript
listSessions(): Promise<ClaudeCliResult<ClaudeCliSessionSummary[]>>
```

### 3.7 getSession

**目的**: 特定セッションの詳細を取得する

**シグネチャ**:

```typescript
getSession(request: ClaudeCliGetSessionRequest): Promise<ClaudeCliResult<ClaudeCliSessionDetail>>
```

**引数**:

```typescript
interface ClaudeCliGetSessionRequest {
  sessionId: string;
}
```

### 3.8 onSessionOutput

**目的**: セッション出力をリアルタイムで購読する

**シグネチャ**:

```typescript
onSessionOutput(callback: (event: ClaudeCliSessionOutputEvent) => void): () => void
```

**イベント型**:

```typescript
interface ClaudeCliSessionOutputEvent {
  sessionId: string;
  type: "stdout" | "stderr";
  content: string;
}
```

**戻り値**: unsubscribe関数

### 3.9 onSessionStatus

**目的**: セッション状態変更を購読する

**シグネチャ**:

```typescript
onSessionStatus(callback: (event: ClaudeCliSessionStatusEvent) => void): () => void
```

**イベント型**:

```typescript
interface ClaudeCliSessionStatusEvent {
  sessionId: string;
  oldStatus?: string;
  newStatus: string;
}
```

**戻り値**: unsubscribe関数

---

## 4. 結果型

### 4.1 ClaudeCliResult

すべてのAPI呼び出しは`ClaudeCliResult<T>`型を返す:

```typescript
type ClaudeCliResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };
```

---

## 5. 使用例

### 5.1 CLI存在確認

```typescript
const result = await window.claudeCliAPI.checkInstallation();
if (result.ok) {
  console.log(`CLI version: ${result.value.version}`);
}
```

### 5.2 スキル一覧取得

```typescript
const result = await window.claudeCliAPI.listSkills({
  workingDirectory: "/path/to/project",
});
if (result.ok) {
  result.value.skills.forEach((skill) => console.log(skill.name));
}
```

### 5.3 ストリーミング出力購読

```typescript
const unsubscribe = window.claudeCliAPI.onSessionOutput((event) => {
  console.log(`[${event.sessionId}] ${event.type}: ${event.content}`);
});

// クリーンアップ
unsubscribe();
```

---

## 6. 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-17 | 初版作成 |
