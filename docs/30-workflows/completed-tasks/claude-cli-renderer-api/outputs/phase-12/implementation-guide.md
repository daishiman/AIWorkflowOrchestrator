# Claude CLI Renderer API 実装ガイド

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| バージョン | 1.0.0      |
| 作成日     | 2026-01-17 |
| Phase      | 12         |
| ステータス | 完了       |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## Claude CLI Renderer APIとは

Claude CLI Renderer APIは、AIWorkflowOrchestratorアプリケーションのUI（画面）から、Claude Code CLI（コマンドラインツール）の機能を利用するための橋渡し役です。

### 身近な例えで説明

レストランに例えると：

- **お客さん（UI）**: 画面上のボタンやフォームを操作するユーザー
- **ウェイター（Renderer API）**: お客さんの注文を厨房に伝える役目
- **厨房（Main Process）**: 実際に料理を作る場所（Claude CLI機能）
- **メニュー（API）**: 注文できる料理の一覧（利用できる機能）

Renderer APIは「ウェイター」として、ユーザーの操作を安全に厨房へ伝え、結果を持ち帰ってきます。

## なぜこのAPIが必要なのか

### セキュリティ上の理由

Electronアプリケーションでは、画面（Renderer Process）とシステム機能（Main Process）は分離されています。これはセキュリティのためです。

直接アクセスを許可すると、悪意のあるWebコンテンツがシステム機能を悪用する危険があります。そのため、「許可された操作だけを安全に実行する」仕組みが必要です。

### 機能的な理由

- **スキル一覧表示**: どんなAIスキルが利用可能かを確認
- **スクリプト実行**: AIにタスクを実行させる
- **セッション管理**: 実行中のタスクを監視・停止

これらの機能をUIから利用するために、このAPIが必要です。

## どのように使用するのか（概念レベル）

### 基本的な流れ

1. **ユーザーがボタンをクリック**
2. **UIがAPIを呼び出す**（例：スキル一覧を取得）
3. **APIが安全にMain Processに依頼を送る**
4. **Main ProcessがClaude CLIを実行**
5. **結果がUIに返される**
6. **画面に結果を表示**

### 利用できる主な機能

| 機能             | できること                       |
| ---------------- | -------------------------------- |
| インストール確認 | Claude CLIがPCにあるか確認       |
| スキル一覧       | 使えるAIスキルの一覧を取得       |
| スキル詳細       | 特定スキルの詳細情報を取得       |
| スクリプト実行   | AIにタスクを実行させる           |
| セッション管理   | 実行中タスクの確認・停止         |
| 出力監視         | 実行中の出力をリアルタイムで受信 |

---

# Part 2: 技術的詳細（開発者向け）

## APIリファレンス

### 概要

`window.claudeCliAPI`としてRenderer Processに公開されるAPI群。すべてのメソッドは`safeInvoke`/`safeOn`パターンでホワイトリスト検証を行う。

### 型定義

```typescript
interface ClaudeCliAPI {
  // インストール確認
  checkInstallation(): Promise<ClaudeCliResult<CliInstallationStatus>>;

  // スキル管理
  listSkills(
    request?: ClaudeCliListSkillsRequest,
  ): Promise<ClaudeCliResult<ClaudeCliScanResult>>;
  getSkillDetail(
    request: ClaudeCliGetSkillDetailRequest,
  ): Promise<ClaudeCliResult<SkillManifest>>;

  // スクリプト実行
  executeScript(
    request: ClaudeCliExecuteScriptRequest,
  ): Promise<ClaudeCliResult<ClaudeCliExecuteResult>>;
  terminateSession(
    request: ClaudeCliTerminateSessionRequest,
  ): Promise<ClaudeCliResult<void>>;

  // セッション管理
  listSessions(): Promise<ClaudeCliResult<ClaudeCliSession[]>>;
  getSession(
    request: ClaudeCliGetSessionRequest,
  ): Promise<ClaudeCliResult<ClaudeCliSession | null>>;

  // ストリーミングイベント
  onSessionOutput(
    callback: (event: ClaudeCliSessionOutputEvent) => void,
  ): () => void;
  onSessionStatus(
    callback: (event: ClaudeCliSessionStatusEvent) => void,
  ): () => void;
}

// 共通レスポンス型
type ClaudeCliResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
```

### 各メソッドの詳細

#### checkInstallation()

Claude CLIのインストール状態を確認します。

**戻り値**:

```typescript
ClaudeCliResult<CliInstallationStatus>;

interface CliInstallationStatus {
  installed: boolean;
  version?: string;
  path?: string;
}
```

#### listSkills(request?)

利用可能なスキルの一覧を取得します。

**パラメータ**:

```typescript
interface ClaudeCliListSkillsRequest {
  directory?: string; // スキャン対象ディレクトリ
  includeBuiltin?: boolean; // 組み込みスキルを含むか
}
```

**戻り値**: `ClaudeCliResult<ClaudeCliScanResult>`

#### getSkillDetail(request)

特定スキルの詳細情報を取得します。

**パラメータ**:

```typescript
interface ClaudeCliGetSkillDetailRequest {
  skillId: string;
}
```

**戻り値**: `ClaudeCliResult<SkillManifest>`

#### executeScript(request)

スクリプトを実行し、セッションを開始します。

**パラメータ**:

```typescript
interface ClaudeCliExecuteScriptRequest {
  script: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
}
```

**戻り値**: `ClaudeCliResult<ClaudeCliExecuteResult>`

#### terminateSession(request)

実行中のセッションを終了します。

**パラメータ**:

```typescript
interface ClaudeCliTerminateSessionRequest {
  sessionId: string;
}
```

**戻り値**: `ClaudeCliResult<void>`

#### listSessions()

アクティブなセッションの一覧を取得します。

**戻り値**: `ClaudeCliResult<ClaudeCliSession[]>`

#### getSession(request)

特定セッションの詳細を取得します。

**パラメータ**:

```typescript
interface ClaudeCliGetSessionRequest {
  sessionId: string;
}
```

**戻り値**: `ClaudeCliResult<ClaudeCliSession | null>`

#### onSessionOutput(callback)

セッション出力イベントを購読します。

**パラメータ**: `(event: ClaudeCliSessionOutputEvent) => void`
**戻り値**: `() => void` （購読解除関数）

#### onSessionStatus(callback)

セッション状態変更イベントを購読します。

**パラメータ**: `(event: ClaudeCliSessionStatusEvent) => void`
**戻り値**: `() => void` （購読解除関数）

---

## 使用例（コードサンプル）

### インストール確認

```typescript
const checkCli = async () => {
  const result = await window.claudeCliAPI.checkInstallation();
  if (result.success) {
    console.log(`CLI installed: ${result.data.installed}`);
    console.log(`Version: ${result.data.version}`);
  } else {
    console.error(`Error: ${result.error}`);
  }
};
```

### スキル一覧取得

```typescript
const fetchSkills = async () => {
  const result = await window.claudeCliAPI.listSkills({
    includeBuiltin: true,
  });
  if (result.success) {
    result.data.skills.forEach((skill) => {
      console.log(`${skill.name}: ${skill.description}`);
    });
  }
};
```

### スクリプト実行とストリーミング出力

```typescript
const runScript = async () => {
  // 出力イベントを購読
  const unsubscribe = window.claudeCliAPI.onSessionOutput((event) => {
    console.log(`[${event.sessionId}] ${event.type}: ${event.content}`);
  });

  // スクリプト実行
  const result = await window.claudeCliAPI.executeScript({
    script: "echo 'Hello, Claude!'",
    workingDirectory: "/path/to/project",
  });

  if (result.success) {
    console.log(`Session started: ${result.data.sessionId}`);
  }

  // 後でクリーンアップ
  // unsubscribe();
};
```

### セッション終了

```typescript
const stopSession = async (sessionId: string) => {
  const result = await window.claudeCliAPI.terminateSession({ sessionId });
  if (result.success) {
    console.log("Session terminated");
  }
};
```

---

## エラーハンドリング

### エラーレスポンスの形式

すべてのAPIは統一されたエラー形式を返します：

```typescript
{
  success: false,
  error: "エラーメッセージ",
  code: "ERROR_CODE"  // オプション
}
```

### 一般的なエラーコード

| コード                | 説明                       |
| --------------------- | -------------------------- |
| `CLI_NOT_INSTALLED`   | Claude CLIが見つからない   |
| `SESSION_NOT_FOUND`   | 指定セッションが存在しない |
| `SKILL_NOT_FOUND`     | 指定スキルが見つからない   |
| `EXECUTION_FAILED`    | スクリプト実行失敗         |
| `CHANNEL_NOT_ALLOWED` | 許可されていないチャンネル |

### 推奨エラーハンドリングパターン

```typescript
const safeApiCall = async <T>(
  apiCall: () => Promise<ClaudeCliResult<T>>,
): Promise<T | null> => {
  try {
    const result = await apiCall();
    if (result.success) {
      return result.data;
    }
    console.error(`API Error: ${result.error}`);
    return null;
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    return null;
  }
};
```

---

## セキュリティ考慮事項

### ホワイトリストパターン

すべてのIPC呼び出しは`safeInvoke`/`safeOn`関数でラップされ、ホワイトリスト検証を行います。

```typescript
// 許可されたチャンネルのみ呼び出し可能
const ALLOWED_INVOKE_CHANNELS = [
  "claude-cli:check-installation",
  "claude-cli:list-skills",
  "claude-cli:get-skill-detail",
  "claude-cli:execute-script",
  "claude-cli:terminate-session",
  "claude-cli:list-sessions",
  "claude-cli:get-session",
];

const ALLOWED_ON_CHANNELS = [
  "claude-cli:session-output",
  "claude-cli:session-status",
];
```

### contextBridge経由の公開

APIは`contextBridge.exposeInMainWorld`を使用して安全に公開されます。直接の`window`オブジェクト割り当ては行いません。

### メモリリーク防止

イベント購読関数は必ず`unsubscribe`関数を返し、コンポーネントのアンマウント時にリスナーを解除できます。

```typescript
useEffect(() => {
  const unsubscribe = window.claudeCliAPI.onSessionOutput(handleOutput);
  return () => unsubscribe(); // クリーンアップ
}, []);
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-17 | 初版作成 |
