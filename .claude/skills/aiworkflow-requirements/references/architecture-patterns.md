# 機能追加パターン アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 機能追加パターン

### 新機能追加の手順

新しいワークフロー機能を追加する場合の手順を以下に示す。

**ステップ1: フォルダ作成**

- apps/web/src/features/に新しい機能名のフォルダを作成する
- フォルダ名はケバブケース（例: youtube-summarize）を使用する

**ステップ2: スキーマ定義**

- schema.ts ファイルに入出力スキーマを定義する
- Zodを使用して型安全なバリデーションを実装する
- 入力フィールドと出力フィールドを明確に分離する

**ステップ3: Executor実装**

- executor.ts ファイルに IWorkflowExecutor インターフェースを実装する
- type プロパティにワークフロー識別子を設定する
- execute メソッドで入力バリデーション、処理、出力バリデーションを行う

**ステップ4: テスト作成**

- executor.test.ts ファイルにユニットテストを作成する
- 正常系、異常系、境界値のテストケースを網羅する

**ステップ5: Registry登録**

- features/registry.ts にエグゼキューターを登録する
- ワークフロータイプとエグゼキューターのマッピングを追加する

**ステップ6: API Route作成（必要な場合）**

- apps/web/src/app/api/v1/に対応するルートを作成する

### 機能構成のベストプラクティス

**必須ファイル**:

| ファイル         | 役割                      |
| ---------------- | ------------------------- |
| schema.ts        | 入出力スキーマ定義（Zod） |
| executor.ts      | ビジネスロジック実装      |
| executor.test.ts | ユニットテスト            |

**オプションファイル**:

| ファイル/フォルダ | 用途                       |
| ----------------- | -------------------------- |
| api.ts            | 機能固有のAPIハンドラー    |
| hooks/            | 機能固有のReact Hooks      |
| components/       | 機能固有のUIコンポーネント |

### この構造の利点

| 利点                 | 説明                                              |
| -------------------- | ------------------------------------------------- |
| 変更の局所化         | 機能追加は新規フォルダ作成のみで完結              |
| 削除の容易性         | フォルダごと削除すれば機能を除去可能              |
| 影響範囲の限定       | 機能間の独立性により他機能への影響ゼロ            |
| テストの同居         | 実装とテストが同じ場所にあり管理しやすい          |
| 共通インフラの再利用 | AIクライアント等は shared/infrastructure から取得 |

---

## Environment Backend サービス（Desktop Main Process）

### 概要

Environment BackendはElectronのMain Processで動作し、エージェント出力からHTMLコードブロックを抽出し、XSS対策のサニタイズを行い、安全なプレビュー機能を提供する。Facadeパターンを採用し、外部からは単一のサービスインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/services/environment/`

### コンポーネント構成

```
Main Process (Electron)
├── EnvironmentService (Facade - エントリポイント)
│   ├── ContentExtractor (コードブロック抽出)
│   ├── ContentSanitizer (HTMLサニタイズ - DOMPurify)
│   └── TempFileManager (一時ファイル管理)
└── IPC Handlers (Renderer通信)
    └── agentHandlers.ts
```

### ファイル構成

| ファイル | 責務 |
|---------|------|
| `ContentExtractor.ts` | Markdownからコードブロック抽出 |
| `ContentSanitizer.ts` | DOMPurifyによるXSS対策 |
| `TempFileManager.ts` | 一時ファイル作成・管理・削除 |
| `EnvironmentService.ts` | Facadeサービス（外部API） |
| `index.ts` | エクスポート |
| `agentHandlers.ts` | IPCハンドラ（ipc/配下） |

### 型定義

| 型名 | 定義場所 | 説明 |
|-----|---------|------|
| `ContentType` | `packages/shared/src/types/agent.ts` | サポートするコンテンツタイプ |
| `ExtractedContent` | `packages/shared/src/types/agent.ts` | 抽出されたコンテンツ |
| `SanitizedContent` | `packages/shared/src/types/agent.ts` | サニタイズ済みコンテンツ |
| `PreviewContent` | `packages/shared/src/types/agent.ts` | プレビュー用コンテンツ |

### IPC APIチャネル

| チャネル | 引数 | 戻り値 | 説明 |
|---------|------|--------|------|
| `agent:extract-content` | `text: string` | `PreviewContent` | テキストからコンテンツ抽出・サニタイズ |
| `agent:get-preview` | `executionId: string` | `PreviewContent \| null` | プレビュー用コンテンツ取得 |
| `agent:cleanup-temp` | なし | `void` | 一時ファイルクリーンアップ |

### セキュリティ対策

**XSS防止（ContentSanitizer）**:
- scriptタグ除去
- iframeタグ除去
- イベントハンドラ除去（onclick, onerror, onload等）
- javascript:プロトコル除去
- data:プロトコル制限

**ファイルセキュリティ（TempFileManager）**:
- ファイルパーミッション: 0o600（オーナーのみ）
- UUIDベースファイル名（推測不可）
- 自動クリーンアップ機構

---

## Zustand Sliceパターン（Desktop）

### 概要

デスクトップアプリ（Electron）では、Zustandを使用した状態管理を採用。
機能単位でSliceを分離し、型安全性と保守性を確保する。

**実装場所**: `apps/desktop/src/renderer/store/slices/`

### Sliceの基本構造

各SliceはStateCreator型を使用して定義し、状態とアクションを分離する。

**必須ファイル構成**:

| ファイル             | 役割                        |
| -------------------- | --------------------------- |
| `{name}Slice.ts`     | Slice定義（状態+アクション）|
| `__tests__/{name}Slice.test.ts` | ユニットテスト    |

**Slice定義パターン**:

| 要素             | 説明                       |
| ---------------- | -------------------------- |
| `{Name}State`    | 状態のインターフェース     |
| `{Name}Actions`  | アクションのインターフェース |
| `{Name}Slice`    | State + Actions の統合型   |
| `initial{Name}State` | 初期状態オブジェクト   |
| `create{Name}Slice` | StateCreator関数        |

### 既存Slice一覧

| Slice名      | 責務                       | 実装ファイル                    |
| ------------ | -------------------------- | ------------------------------- |
| `uiSlice`    | UI状態（currentView等）    | `store/slices/uiSlice.ts`       |
| `authSlice`  | 認証状態                   | `store/slices/authSlice.ts`     |
| `chatSlice`  | チャット状態               | `store/slices/chatSlice.ts`     |
| `agentSlice` | エージェント・スキル管理   | `store/slices/agentSlice.ts`    |

### agentSlice詳細

**状態定義**:

| プロパティ         | 型                      | 説明               |
| ------------------ | ----------------------- | ------------------ |
| `skills`           | `Skill[]`               | スキル一覧         |
| `selectedSkill`    | `Skill \| null`         | 選択中のスキル     |
| `skillFilter`      | `string`                | フィルター文字列   |
| `skillCategory`    | `string \| null`        | カテゴリフィルター |
| `executionStatus`  | `AgentExecutionStatus`  | 実行状態           |
| `currentExecutionId` | `string \| null`      | 実行ID             |
| `executionOutput`  | `string[]`              | 実行出力           |
| `isLoading`        | `boolean`               | ローディング状態   |
| `error`            | `string \| null`        | エラーメッセージ   |

**アクション定義**:

| アクション           | 引数                     | 説明               |
| -------------------- | ------------------------ | ------------------ |
| `setSkills`          | `skills: Skill[]`        | スキル一覧設定     |
| `selectSkill`        | `skill: Skill \| null`   | スキル選択         |
| `setSkillFilter`     | `filter: string`         | フィルター設定     |
| `setSkillCategory`   | `category: string \| null` | カテゴリ設定     |
| `setExecutionStatus` | `status: AgentExecutionStatus` | 実行状態設定 |
| `appendOutput`       | `output: string`         | 出力追加           |
| `clearExecution`     | -                        | 実行クリア         |
| `resetAgentState`    | -                        | 状態リセット       |

### 新規Slice追加手順

**ステップ1: Slice定義**

- `store/slices/{name}Slice.ts` を作成
- State、Actions、Slice インターフェースを定義
- initialStateとcreateSlice関数を実装

**ステップ2: Store統合**

- `store/index.ts` でSliceをimport
- createStoreのcombine関数にSliceを追加

**ステップ3: View追加（必要な場合）**

- `views/{Name}View/index.tsx` を作成
- `App.tsx` のrenderView関数にcaseを追加
- `components/AppDock/index.tsx` のnavItemsに追加

**ステップ4: テスト作成**

- `store/slices/__tests__/{name}Slice.test.ts` を作成
- 全アクションのテストを実装

---

## スキル管理サービス（Desktop Main Process）

### 概要

スキル管理バックエンドはElectronのMain Processで動作し、SKILL.mdファイルで定義されたスキルのスキャン・インポート・管理を担当する。Facadeパターンを採用し、外部からは単一のサービスインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/services/skill/`

### コンポーネント構成

```
Main Process (Electron)
├── SkillService (Facade - エントリポイント)
│   ├── SkillScanner (スキル検出・パス検証)
│   ├── SkillParser (SKILL.md解析)
│   └── SkillImportManager (インポート管理・永続化)
└── IPC Handlers (Renderer通信)
    └── skillHandlers.ts
```

### ファイル構成

| ファイル                 | 責務                           |
| ------------------------ | ------------------------------ |
| `SkillScanner.ts`        | ディレクトリスキャン・パス検証 |
| `SkillParser.ts`         | SKILL.md解析・構造化           |
| `SkillImportManager.ts`  | インポート状態管理・永続化     |
| `SkillService.ts`        | Facadeサービス（外部API）      |
| `index.ts`               | エクスポート                   |
| `skillHandlers.ts`       | IPCハンドラ（ipc/配下）        |

### 型定義

| 型名                | 定義場所                           | 説明                     |
| ------------------- | ---------------------------------- | ------------------------ |
| `Skill`             | `packages/shared/src/types/skill.ts` | スキル情報               |
| `Anchor`            | `packages/shared/src/types/skill.ts` | 知識のアンカー           |
| `EnvironmentConfig` | `packages/shared/src/types/skill.ts` | 環境設定                 |
| `SkillScanResult`   | `packages/shared/src/types/skill.ts` | スキャン結果             |
| `ImportResult`      | `packages/shared/src/types/skill.ts` | インポート結果           |
| `RemoveResult`      | `packages/shared/src/types/skill.ts` | 削除結果                 |

### IPC APIチャネル

| チャネル              | 引数                | 戻り値             | 説明                     |
| --------------------- | ------------------- | ------------------ | ------------------------ |
| `skill:list-available`| `basePath: string`  | `Skill[]`          | スキルスキャン           |
| `skill:list-imported` | なし                | `Skill[]`          | インポート済み取得       |
| `skill:import`        | `skillIds: string[]`| `ImportResult`     | スキルインポート         |
| `skill:remove`        | `skillId: string`   | `RemoveResult`     | インポート解除           |
| `skill:get-detail`    | `skillId: string`   | `Skill \| null`    | スキル詳細取得           |

### データフロー

```
1. Renderer → IPC Channel → Main Process
2. Main Process → SkillService → Scanner/Parser/Manager
3. 結果 → IPC Channel → Renderer
```

### SkillService（Facade）API

| メソッド              | 引数                | 戻り値               | 説明               |
| --------------------- | ------------------- | -------------------- | ------------------ |
| `scanAvailableSkills` | `basePath: string`  | `Promise<Skill[]>`   | スキルスキャン     |
| `getImportedSkills`   | -                   | `Promise<Skill[]>`   | インポート済み取得 |
| `importSkills`        | `skillIds: string[]`| `Promise<ImportResult>` | インポート     |
| `removeSkill`         | `skillId: string`   | `Promise<RemoveResult>` | 削除           |
| `getSkillById`        | `skillId: string`   | `Promise<Skill \| null>` | 詳細取得     |
| `clearCache`          | -                   | `void`               | キャッシュクリア   |

### キャッシュ機構

- スキャン結果はメモリにキャッシュ（TTLベース無効化）
- `clearCache()`で手動クリア可能
- アプリ再起動でキャッシュはクリア

### 永続化

- インポート状態は`electron-store`で永続化
- アプリ再起動後もインポート状態を維持
- ストレージキー: `importedSkillIds`

---

## Claude Code CLI連携パターン（Desktop Main Process）

### 概要

Claude Code CLI連携はElectronのMain Processで動作し、`claude`コマンド（CLIツール）をchild_process.spawnで起動してスキル実行・セッション管理・ストリーミング出力を提供する。Facadeパターンを採用し、外部からは単一のManagerインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/claude-cli/`

### コンポーネント構成

```
Main Process (Electron)
├── ClaudeCliManager (Facade - エントリポイント)
│   ├── ProcessManager (プロセス生成・監視・終了)
│   ├── SessionManager (セッションライフサイクル管理)
│   └── SkillScanner (スキルディレクトリスキャン)
└── IPC Handlers (Renderer通信)
    └── ipc-handler.ts
```

### ファイル構成

| ファイル                | 責務                          |
| ----------------------- | ----------------------------- |
| `ProcessManager.ts`     | 子プロセス生成・監視・終了    |
| `SessionManager.ts`     | セッションライフサイクル管理  |
| `SkillScanner.ts`       | スキルディレクトリスキャン    |
| `ClaudeCliManager.ts`   | Facadeサービス（外部API）     |
| `ipc-handler.ts`        | IPCハンドラ                   |
| `index.ts`              | エクスポート                  |

### 型定義

| 型名                    | 定義場所                               | 説明                     |
| ----------------------- | -------------------------------------- | ------------------------ |
| `ClaudeCliResult<T>`    | `packages/shared/src/claude-cli/types.ts` | Result Pattern型       |
| `SessionStatus`         | `packages/shared/src/claude-cli/types.ts` | セッション状態         |
| `ClaudeCliSkill`        | `packages/shared/src/claude-cli/types.ts` | スキル情報             |
| `SessionSummary`        | `packages/shared/src/claude-cli/types.ts` | セッション概要         |
| `OutputEvent`           | `packages/shared/src/claude-cli/types.ts` | 出力イベント           |

### IPC APIチャネル

| チャネル                         | 引数                       | 戻り値                               | 説明               |
| -------------------------------- | -------------------------- | ------------------------------------ | ------------------ |
| `claude-cli:check-installation`  | なし                       | `ClaudeCliResult<CliInstallationStatus>` | CLI存在確認      |
| `claude-cli:list-skills`         | `ListSkillsRequest`        | `ClaudeCliResult<ScanResult>`        | スキル一覧取得     |
| `claude-cli:get-skill-detail`    | `GetSkillDetailRequest`    | `ClaudeCliResult<ClaudeCliSkillDetail>` | スキル詳細取得  |
| `claude-cli:execute-script`      | `ExecuteScriptRequest`     | `ClaudeCliResult<ExecuteScriptResponse>` | スクリプト実行  |
| `claude-cli:terminate-session`   | `TerminateSessionRequest`  | `ClaudeCliResult<TerminateSessionResponse>` | セッション終了 |
| `claude-cli:list-sessions`       | なし                       | `ClaudeCliResult<SessionSummary[]>`  | セッション一覧     |
| `claude-cli:get-session`         | `GetSessionRequest`        | `ClaudeCliResult<SessionDetail>`     | セッション詳細     |

### データフロー

```
1. Renderer → IPC Channel → Main Process
2. Main Process → ClaudeCliManager → ProcessManager/SessionManager/SkillScanner
3. 結果/ストリーミング → IPC Channel → Renderer
```

### ClaudeCliManager（Facade）API

| メソッド              | 引数                         | 戻り値                                    | 説明               |
| --------------------- | ---------------------------- | ----------------------------------------- | ------------------ |
| `checkInstallation`   | -                            | `Promise<ClaudeCliResult<...>>`           | CLI存在確認        |
| `listSkills`          | `ListSkillsRequest`          | `Promise<ClaudeCliResult<ScanResult>>`    | スキル一覧         |
| `getSkillDetail`      | `GetSkillDetailRequest`      | `Promise<ClaudeCliResult<...>>`           | スキル詳細         |
| `executeScript`       | `ExecuteScriptRequest`       | `Promise<ClaudeCliResult<...>>`           | スクリプト実行     |
| `terminateSession`    | `TerminateSessionRequest`    | `Promise<ClaudeCliResult<...>>`           | セッション終了     |
| `listSessions`        | -                            | `Promise<ClaudeCliResult<...>>`           | セッション一覧     |
| `getSession`          | `GetSessionRequest`          | `Promise<ClaudeCliResult<...>>`           | セッション詳細     |
| `shutdown`            | -                            | `Promise<void>`                           | シャットダウン     |

### イベント駆動（EventEmitter）

| イベント          | ペイロード                  | 説明                   |
| ----------------- | --------------------------- | ---------------------- |
| `sessionCreated`  | `{ sessionId, skillName }`  | セッション作成時       |
| `sessionDestroyed`| `{ sessionId }`             | セッション破棄時       |
| `statusChanged`   | `{ sessionId, oldStatus, newStatus }` | 状態変更時   |
| `output`          | `{ sessionId, type, content, timestamp }` | 出力発生時 |

### 設計原則

- **Facadeパターン**: ClaudeCliManagerが外部との唯一のインターフェース
- **Result Pattern**: 全APIがClaudeCliResult<T>を返却
- **EventEmitter**: ストリーミング出力とセッション状態変更の通知
- **セッション分離**: 各セッションは独立したプロセスで実行
- **リソース制限**: 最大10セッションまで同時実行可能

### 関連タスク

- claude-code-cli-integration（2026-01-17完了）

---

## IPC Handler Registration Pattern（Desktop Main Process）

### 概要

Electron IPCハンドラーはメインプロセスで一元的に登録される。
全てのIPCハンドラーは `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers` 関数から呼び出される必要がある。

**実装場所**: `apps/desktop/src/main/ipc/index.ts`

### 登録パターン

IPCハンドラーの登録には3つのパターンがある:

| パターン | 引数 | 使用例 |
|---------|------|--------|
| Pattern 1: mainWindow + store | `mainWindow`, `store` | `registerChatHandlers`, `registerAuthHandlers` |
| Pattern 2: storeのみ | `store` | `registerSlideHandlers` |
| Pattern 3: mainWindow + service | `mainWindow`, `service` | `registerSkillHandlers`, `registerAgentHandlers` |

### SkillHandlers登録例（Pattern 3）

```typescript
// apps/desktop/src/main/ipc/index.ts

// 1. インポート
import { registerSkillHandlers } from "./skillHandlers";
import {
  SkillScanner,
  SkillParser,
  SkillImportManager,
  SkillService,
} from "../services/skill";
import Store from "electron-store";
import path from "path";
import { app } from "electron";

// 2. registerAllIpcHandlers 関数内で依存関係をインスタンス化
export const registerAllIpcHandlers = (
  mainWindow: BrowserWindow,
  store: Store,
): void => {
  // ... 他のハンドラー登録 ...

  // Register Skill Management handlers (SKILL-IPC-001)
  const skillBasePath = path.join(app.getPath("userData"), ".claude", "skills");
  const skillStore = new Store({ name: "skills" });
  const skillScanner = new SkillScanner(skillBasePath);
  const skillParser = new SkillParser();
  const skillImportManager = new SkillImportManager(skillStore);
  const skillService = new SkillService(
    skillScanner,
    skillParser,
    skillImportManager,
  );
  registerSkillHandlers(mainWindow, skillService);
};
```

### 新規IPCハンドラー追加手順

1. **ハンドラーファイル作成**: `apps/desktop/src/main/ipc/{name}Handlers.ts`
2. **サービス作成（必要な場合）**: `apps/desktop/src/main/services/{name}/`
3. **index.tsに登録追加**: `registerAllIpcHandlers` 関数内で呼び出し
4. **テスト作成**: ハンドラーとサービスのユニットテスト

### セキュリティ要件

全てのIPCハンドラーは `validateIpcSender` を使用してsender検証を行うこと:

```typescript
import { validateIpcSender } from "../security/ipcSecurity";

ipcMain.handle("channel:action", async (event, args) => {
  validateIpcSender(event, mainWindow);
  // ... handler logic ...
});
```

### 関連タスク

- **SKILL-IPC-001**: `registerSkillHandlers` が `registerAllIpcHandlers` から呼び出されていなかったバグを修正（2026-01-16完了）

---

## Claude CLI Renderer API（Preload API）

### 概要

Claude CLI Renderer APIはElectronのPreloadスクリプトで提供され、Renderer Process（UI）からMain ProcessのClaude CLI機能を安全に呼び出すためのAPIインターフェースを提供する。`contextBridge`経由で`window.claudeCliAPI`として公開される。

**実装場所**: `apps/desktop/src/preload/index.ts`

### コンポーネント構成

```
Renderer Process (UI)
    │
    ▼ window.claudeCliAPI
Preload Script (contextBridge)
├── safeInvoke (ホワイトリスト検証付きIPC呼び出し)
├── safeOn (ホワイトリスト検証付きイベント購読)
└── claudeCliAPI オブジェクト
    │
    ▼ IPC Channels
Main Process
└── ClaudeCliManager (Facade)
```

### ファイル構成

| ファイル                              | 責務                           |
| ------------------------------------- | ------------------------------ |
| `preload/index.ts`                    | claudeCliAPIオブジェクト定義   |
| `preload/channels.ts`                 | IPCチャンネル名定数定義        |
| `preload/types.ts`                    | ClaudeCliAPI型定義             |
| `main/claude-cli/ipc-handler.ts`      | Main Process側IPCハンドラ      |

### API定義

| メソッド              | 引数                           | 戻り値                                    | 説明               |
| --------------------- | ------------------------------ | ----------------------------------------- | ------------------ |
| `checkInstallation()` | なし                           | `Promise<ClaudeCliResult<CliInstallationStatus>>` | CLI存在確認  |
| `listSkills()`        | `ClaudeCliListSkillsRequest?`  | `Promise<ClaudeCliResult<ScanResult>>`    | スキル一覧取得     |
| `getSkillDetail()`    | `ClaudeCliGetSkillDetailRequest`| `Promise<ClaudeCliResult<SkillManifest>>` | スキル詳細取得     |
| `executeScript()`     | `ClaudeCliExecuteScriptRequest`| `Promise<ClaudeCliResult<ExecuteResult>>` | スクリプト実行     |
| `terminateSession()`  | `ClaudeCliTerminateSessionRequest`| `Promise<ClaudeCliResult<void>>`       | セッション終了     |
| `listSessions()`      | なし                           | `Promise<ClaudeCliResult<Session[]>>`     | セッション一覧     |
| `getSession()`        | `ClaudeCliGetSessionRequest`   | `Promise<ClaudeCliResult<Session\|null>>` | セッション詳細     |
| `onSessionOutput()`   | `(event: OutputEvent) => void` | `() => void`                              | 出力イベント購読   |
| `onSessionStatus()`   | `(event: StatusEvent) => void` | `() => void`                              | 状態イベント購読   |

### IPCチャンネル定義

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  CLAUDE_CLI_CHECK_INSTALLATION: "claude-cli:check-installation",
  CLAUDE_CLI_LIST_SKILLS: "claude-cli:list-skills",
  CLAUDE_CLI_GET_SKILL_DETAIL: "claude-cli:get-skill-detail",
  CLAUDE_CLI_EXECUTE_SCRIPT: "claude-cli:execute-script",
  CLAUDE_CLI_TERMINATE_SESSION: "claude-cli:terminate-session",
  CLAUDE_CLI_LIST_SESSIONS: "claude-cli:list-sessions",
  CLAUDE_CLI_GET_SESSION: "claude-cli:get-session",
  CLAUDE_CLI_SESSION_OUTPUT: "claude-cli:session-output",
  CLAUDE_CLI_SESSION_STATUS: "claude-cli:session-status",
} as const;
```

### ホワイトリストパターン

```typescript
// apps/desktop/src/preload/channels.ts
export const ALLOWED_INVOKE_CHANNELS = [
  IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION,
  IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS,
  IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL,
  IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT,
  IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION,
  IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS,
  IPC_CHANNELS.CLAUDE_CLI_GET_SESSION,
  // ... 他のチャンネル
];

export const ALLOWED_ON_CHANNELS = [
  IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
  IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
  // ... 他のチャンネル
];
```

### safeInvoke/safeOnセキュリティパターン

```typescript
// apps/desktop/src/preload/index.ts
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const handler = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
```

### 実装パターン

```typescript
// apps/desktop/src/preload/index.ts
const claudeCliAPI: ClaudeCliAPI = {
  checkInstallation: () =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_CHECK_INSTALLATION),
  listSkills: (request?: ClaudeCliListSkillsRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_LIST_SKILLS, request || {}),
  getSkillDetail: (request: ClaudeCliGetSkillDetailRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_GET_SKILL_DETAIL, request),
  executeScript: (request: ClaudeCliExecuteScriptRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_EXECUTE_SCRIPT, request),
  terminateSession: (request: ClaudeCliTerminateSessionRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_TERMINATE_SESSION, request),
  listSessions: () => safeInvoke(IPC_CHANNELS.CLAUDE_CLI_LIST_SESSIONS),
  getSession: (request: ClaudeCliGetSessionRequest) =>
    safeInvoke(IPC_CHANNELS.CLAUDE_CLI_GET_SESSION, request),
  onSessionOutput: (callback: (event: ClaudeCliSessionOutputEvent) => void) =>
    safeOn<ClaudeCliSessionOutputEvent>(
      IPC_CHANNELS.CLAUDE_CLI_SESSION_OUTPUT,
      callback,
    ),
  onSessionStatus: (callback: (event: ClaudeCliSessionStatusEvent) => void) =>
    safeOn<ClaudeCliSessionStatusEvent>(
      IPC_CHANNELS.CLAUDE_CLI_SESSION_STATUS,
      callback,
    ),
};

// contextBridge経由で公開
contextBridge.exposeInMainWorld("claudeCliAPI", claudeCliAPI);
```

### セキュリティ要件

| 要件               | 実装                              | 確認方法                    |
| ------------------ | --------------------------------- | --------------------------- |
| ホワイトリスト     | ALLOWED_INVOKE/ON_CHANNELS        | 定義外チャンネルはエラー    |
| contextIsolation   | `contextBridge.exposeInMainWorld` | BrowserWindow設定で有効     |
| 型安全性           | ClaudeCliResult<T>型              | TypeScript型チェック        |
| メモリリーク防止   | unsubscribe関数パターン           | イベント購読解除機能        |

### データフロー

```
1. Renderer (UI) → window.claudeCliAPI.{method}()
2. Preload → safeInvoke/safeOn (ホワイトリスト検証)
3. Preload → ipcRenderer.invoke/on (IPC呼び出し)
4. Main Process → ClaudeCliManager (実処理)
5. Main Process → ipcMain.handle (レスポンス)
6. Preload → Promise解決/イベントコールバック
7. Renderer (UI) → 結果受け取り
```

### 使用例

```typescript
// Renderer Process (React Component)
const checkCliStatus = async () => {
  const result = await window.claudeCliAPI.checkInstallation();
  if (result.success) {
    console.log(`CLI installed: ${result.data.installed}`);
  }
};

// ストリーミング出力の購読
useEffect(() => {
  const unsubscribe = window.claudeCliAPI.onSessionOutput((event) => {
    console.log(`[${event.sessionId}] ${event.type}: ${event.content}`);
  });
  return () => unsubscribe(); // クリーンアップ
}, []);
```

### テスト

| テストカテゴリ             | テスト数 | 状態 |
| -------------------------- | -------- | ---- |
| チャンネル定義             | 10       | ✅   |
| ホワイトリスト登録         | 9        | ✅   |
| safeInvokeセキュリティ     | 7        | ✅   |
| safeOnセキュリティ         | 2        | ✅   |
| エラーハンドリング         | 4        | ✅   |
| ストリーミングイベント     | 8        | ✅   |
| 統合テストシナリオ         | 5        | ✅   |
| **合計**                   | **74**   | ✅   |

### 関連タスク

- **claude-cli-renderer-api**: Renderer API実装・検証・ドキュメント化（2026-01-17完了）

---

## chatEditSlice（Workspace Chat Edit状態管理）

### 概要

AIによるコード編集機能の状態管理Slice。ファイルコンテキスト、LLM生成結果、差分プレビューのUI状態を管理する。

**実装場所**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/`

### 状態定義

| プロパティ         | 型                | 説明                     |
| ------------------ | ----------------- | ------------------------ |
| `fileContexts`     | `FileContext[]`   | 添付ファイル一覧         |
| `activeContextId`  | `string \| null`  | アクティブなコンテキストID |
| `generatedResults` | `GeneratedResult[]`| 生成結果一覧            |
| `currentResultId`  | `string \| null`  | 現在表示中の結果ID       |
| `isLoading`        | `boolean`         | ローディング中           |
| `isDiffPreviewOpen`| `boolean`         | 差分プレビュー表示中     |
| `error`            | `string \| null`  | エラーメッセージ         |
| `isDragging`       | `boolean`         | ドラッグ中               |

### アクション定義

| アクション           | 引数                              | 説明                   |
| -------------------- | --------------------------------- | ---------------------- |
| `addFileContext`     | `Omit<FileContext, 'id'\|'addedAt'>` | ファイルコンテキスト追加 |
| `removeFileContext`  | `id: string`                      | コンテキスト削除       |
| `clearAllContexts`   | -                                 | 全クリア               |
| `setActiveContext`   | `id: string \| null`              | アクティブ設定         |
| `setGeneratedResult` | `result: GeneratedResult`         | 生成結果設定           |
| `approveResult`      | `resultId: string`                | 適用                   |
| `rejectResult`       | `resultId: string`                | 却下                   |
| `clearResults`       | -                                 | 結果クリア             |
| `openDiffPreview`    | `resultId: string`                | プレビュー表示         |
| `closeDiffPreview`   | -                                 | プレビュー非表示       |
| `setLoading`         | `loading: boolean`                | ローディング設定       |
| `setError`           | `error: string \| null`           | エラー設定             |
| `setDragging`        | `dragging: boolean`               | ドラッグ状態設定       |
| `reset`              | -                                 | 状態リセット           |

### 関連Hooks

| Hook名           | 責務                       |
| ---------------- | -------------------------- |
| `useFileContext` | ファイルコンテキスト管理   |
| `useDiffApply`   | 差分計算・適用ロジック     |

### 実装パターン

- **Helper関数分離**: 複雑なロジックをSlice外部に分離（`computeLCS`, `generateDiffHunks`等）
- **バリデーション内蔵**: `addFileContext`で`MAX_FILE_CONTEXTS`, `MAX_FILE_SIZE`チェック
- **Optional Chainingによる安全性**: `state.chatEdit?.fileContexts ?? []`パターン

### Store統合（予定）

```typescript
// apps/desktop/src/renderer/store/index.ts
import { createChatEditSlice, ChatEditSlice } from '@/renderer/features/workspace-chat-edit';

interface AppStore extends ChatEditSlice {
  // 他のSlice...
}

export const useStore = create<AppStore>()((set, get) => ({
  ...createChatEditSlice(set, get),
  // 他のSlice...
}));
```

### 品質メトリクス

- テストカバレッジ: Line 69.23%, Branch 89.74%, Function 95%
- 全122件の自動テスト成功

### 関連タスク

- workspace-chat-edit（2026-01-23完了：コアロジック）

---
