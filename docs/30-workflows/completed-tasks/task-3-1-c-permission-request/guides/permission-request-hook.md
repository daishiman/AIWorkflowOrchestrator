# PermissionRequest Hook 統合 - 実装ガイド

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-3-1-C                  |
| 作成日   | 2026-01-25                  |
| 機能名   | PermissionRequest Hook 統合 |

---

## Part 1: 概念的説明（初学者・非技術者向け）

### 概要

PermissionRequest Hook は、Claude Agent SDK のスキル実行時に、
ユーザーからの承認が必要なツール操作について確認を求める機能です。

### 機能の目的

- **安全性の確保**: 危険な操作の前にユーザーの確認を得る
- **透明性の向上**: 実行される操作を事前に表示する
- **制御の提供**: ユーザーが操作を許可または拒否できる

### 動作フロー

1. スキル実行中にツール操作が発生
2. 権限確認が必要な場合、ダイアログが表示される
3. ユーザーが「許可」または「拒否」を選択
4. 選択に応じて操作が続行または中止される

### 対応ツール

| ツール | 説明             | 表示例                              |
| ------ | ---------------- | ----------------------------------- |
| Bash   | コマンド実行     | コマンドを実行: `ls -la`            |
| Write  | ファイル作成     | ファイルを作成: `/path/to/file`     |
| Edit   | ファイル編集     | ファイルを編集: `/path/to/file`     |
| Read   | ファイル読み取り | ファイルを読み取り: `/path/to/file` |
| Glob   | ファイル検索     | ファイルを検索: `*.ts`              |
| Grep   | テキスト検索     | テキストを検索: `pattern`           |
| Task   | サブタスク実行   | サブタスクを実行: `description`     |

### セキュリティ機能

- **機密情報の保護**: パスワード、トークン、シークレットなどは自動的に非表示
- **長文の省略**: 500文字を超える引数は省略して表示
- **タイムアウト**: 30秒以内に応答がない場合、自動的にキャンセル

---

## Part 2: 技術的詳細（開発者向け）

### アーキテクチャ

```
Main Process                      Renderer Process
┌─────────────────────┐           ┌─────────────────────┐
│    SkillExecutor    │           │  PermissionDialog   │
│                     │           │                     │
│  ┌───────────────┐  │           │                     │
│  │ Permission    │  │   IPC     │                     │
│  │ Resolver      │◄─┼───────────┼─────────────────────┤
│  └───────────────┘  │           │                     │
│                     │           │                     │
│  sendPermission ────┼───────────┼──► onPermission     │
│  Request()          │           │    Request()        │
│                     │           │                     │
│  handlePermission ◄─┼───────────┼──  sendResponse()   │
│  Response()         │           │                     │
└─────────────────────┘           └─────────────────────┘
```

### 主要コンポーネント

#### 1. SkillExecutor

スキル実行エンジン。Permission 関連の4つのメソッドを持つ。

```typescript
// 引数をサニタイズ（機密情報除去、長文省略）
sanitizeArgs(args: Record<string, unknown>): Record<string, unknown>

// 権限リクエストの理由を生成
getPermissionReason(toolName: string, args: Record<string, unknown>): string

// 権限応答を処理
handlePermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string
): void

// 権限リクエストを送信
async sendPermissionRequest(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal
): Promise<PermissionResponse>
```

#### 2. PermissionResolver

権限リクエストの待機と解決を管理するクラス。

```typescript
// 権限応答を待機
async waitForResponse(
  requestId: string,
  signal?: AbortSignal,
  timeoutMs?: number
): Promise<PermissionResponse>

// 権限応答を解決
resolveRequest(response: PermissionResponse): void

// 特定のリクエストをキャンセル
cancelRequest(requestId: string, reason?: string): void

// 全てのリクエストをキャンセル
cancelAllRequests(reason?: string): void
```

#### 3. IPC チャネル

```typescript
// packages/shared/src/ipc/channels.ts
export const SKILL_CHANNELS = {
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
};
```

### 使用方法

#### Main Process 側

```typescript
import { SkillExecutor } from "./services/skill/SkillExecutor";

// SkillExecutor のインスタンス作成
const executor = new SkillExecutor(mainWindow);

// IPC ハンドラの登録
ipcMain.on(SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE, (_, response) => {
  executor.handlePermissionResponse(
    response.requestId,
    response.approved,
    response.rememberChoice,
    response.rejectReason,
  );
});
```

#### Renderer Process 側

```typescript
// 権限リクエストの受信
ipcRenderer.on(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, (_, request) => {
  // request: { executionId, requestId, toolName, args, reason }
  showPermissionDialog(request);
});

// 権限応答の送信
function sendPermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string,
) {
  ipcRenderer.send(SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE, {
    requestId,
    approved,
    rememberChoice,
    rejectReason,
  });
}
```

### 定数

```typescript
// 機密キーパターン
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "bearer",
  "key",
  "apikey",
  "api_key",
  "credential",
  "auth",
  "access_token",
  "refresh_token",
  "private_key",
];

// タイムアウト（ミリ秒）
const PERMISSION_REQUEST_TIMEOUT_MS = 30000;
```

### 型定義

```typescript
// 権限応答
interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}

// 権限リクエスト
interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason: string;
}
```

---

## 関連ファイル

| ファイル                                                     | 説明               |
| ------------------------------------------------------------ | ------------------ |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`      | スキル実行エンジン |
| `apps/desktop/src/main/services/skill/PermissionResolver.ts` | 権限解決クラス     |
| `packages/shared/src/ipc/channels.ts`                        | IPC チャネル定義   |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
