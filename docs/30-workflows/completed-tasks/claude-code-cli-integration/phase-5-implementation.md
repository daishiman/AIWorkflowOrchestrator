# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 5                           |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを通過させる最小限の実装を行う。

## 実行タスク

### タスク1: 共有型定義の実装

**目的**: CLI統合で使用する共有型定義を実装する

**手順**:

1. ディレクトリ作成: `packages/shared/src/claude-cli/`
2. 型定義ファイル作成
3. Zodスキーマ実装
4. エクスポート設定

**実装ファイル**:

| ファイル       | 内容                       |
| -------------- | -------------------------- |
| `types.ts`     | TypeScript型定義           |
| `schemas.ts`   | Zodスキーマ                |
| `constants.ts` | 定数定義（チャンネル名等） |
| `errors.ts`    | エラー型定義               |
| `index.ts`     | エクスポート               |

**期待される成果物**:

- 共有型定義パッケージ

### タスク2: CLIプロセス管理の実装

**目的**: CLIプロセスのライフサイクル管理を実装する

**手順**:

1. ディレクトリ作成: `apps/desktop/src/main/claude-cli/`
2. プロセス管理クラス実装
3. イベントエミッター設定
4. エラーハンドリング実装

**実装ファイル**:

| ファイル                 | 内容                    |
| ------------------------ | ----------------------- |
| `cli-process-manager.ts` | プロセス管理クラス      |
| `cli-detector.ts`        | CLI検出・バージョン確認 |
| `process-monitor.ts`     | プロセス監視            |
| `index.ts`               | エクスポート            |

**主要クラス設計**:

```typescript
export class CliProcessManager {
  private processes: Map<string, ChildProcess>;
  private eventEmitter: EventEmitter;

  async checkCliAvailability(): Promise<CliAvailabilityResult>;
  async spawn(options: SpawnOptions): Promise<SpawnResult>;
  async kill(sessionId: string, force?: boolean): Promise<void>;
  onEvent(event: ProcessEvent, handler: EventHandler): void;
}
```

**期待される成果物**:

- CLIプロセス管理モジュール

### タスク3: スキル実行の実装

**目的**: スキル実行機能を実装する

**手順**:

1. スキルパス解決ロジック実装
2. コマンドビルダー実装
3. 出力パーサー実装
4. 実行エンジン実装

**実装ファイル**:

| ファイル             | 内容               |
| -------------------- | ------------------ |
| `skill-executor.ts`  | スキル実行エンジン |
| `skill-resolver.ts`  | スキルパス解決     |
| `command-builder.ts` | コマンド構築       |
| `output-parser.ts`   | 出力パース         |

**主要クラス設計**:

```typescript
export class SkillExecutor {
  constructor(
    private processManager: CliProcessManager,
    private sessionManager: SessionManager
  );

  async execute(request: CliExecuteRequest): Promise<CliExecuteResponse>;
  async listSkills(): Promise<CliSkillInfo[]>;
}
```

**期待される成果物**:

- スキル実行モジュール

### タスク4: セッション管理の実装

**目的**: 複数セッションの並列管理を実装する

**手順**:

1. セッション管理クラス実装
2. セッション状態管理実装
3. クリーンアップ処理実装
4. セッション制限実装

**実装ファイル**:

| ファイル             | 内容               |
| -------------------- | ------------------ |
| `session-manager.ts` | セッション管理     |
| `session-store.ts`   | セッション状態保持 |
| `session-cleanup.ts` | クリーンアップ処理 |

**主要クラス設計**:

```typescript
export class SessionManager {
  private sessions: Map<string, Session>;
  private maxSessions: number;

  createSession(options: SessionOptions): Session;
  getSession(sessionId: string): Session | undefined;
  listSessions(filter?: SessionFilter): Session[];
  destroySession(sessionId: string): Promise<void>;
  cleanupOrphanedSessions(): Promise<void>;
}
```

**期待される成果物**:

- セッション管理モジュール

### タスク5: IPC通信の実装

**目的**: Main-Renderer間IPC通信を実装する

**手順**:

1. IPCハンドラー実装
2. Preload API実装
3. チャンネル登録
4. エラーハンドリング実装

**実装ファイル**:

| ファイル                                          | 内容          |
| ------------------------------------------------- | ------------- |
| `apps/desktop/src/main/claude-cli/ipc-handler.ts` | IPCハンドラー |
| `apps/desktop/src/preload/claudeCliApi.ts`        | Preload API   |

**IPCハンドラー設計**:

```typescript
export function registerClaudeCliIpcHandlers(
  ipcMain: IpcMain,
  skillExecutor: SkillExecutor,
  sessionManager: SessionManager,
): void {
  ipcMain.handle("claude-cli:check", handleCheck);
  ipcMain.handle("claude-cli:list-skills", handleListSkills);
  ipcMain.handle("claude-cli:execute", handleExecute);
  ipcMain.handle("claude-cli:abort", handleAbort);
  ipcMain.handle("claude-cli:session:list", handleSessionList);
  ipcMain.handle("claude-cli:session:destroy", handleSessionDestroy);
}
```

**Preload API設計**:

```typescript
export const claudeCliAPI = {
  check: () => ipcRenderer.invoke("claude-cli:check"),
  listSkills: () => ipcRenderer.invoke("claude-cli:list-skills"),
  execute: (request: CliExecuteRequest) =>
    ipcRenderer.invoke("claude-cli:execute", request),
  abort: (sessionId: string) =>
    ipcRenderer.invoke("claude-cli:abort", sessionId),
  onStream: (callback: StreamCallback) =>
    ipcRenderer.on("claude-cli:stream", callback),
  onComplete: (callback: CompleteCallback) =>
    ipcRenderer.on("claude-cli:complete", callback),
  onError: (callback: ErrorCallback) =>
    ipcRenderer.on("claude-cli:error", callback),
};
```

**期待される成果物**:

- IPC通信モジュール
- Preload API

## 参照資料

| 資料名             | パス                                       | 説明          |
| ------------------ | ------------------------------------------ | ------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`   | Phase 2成果物 |
| IPC API仕様        | `outputs/phase-2/ipc-api-specification.md` | Phase 2成果物 |
| 型定義設計         | `outputs/phase-2/type-definitions.md`      | Phase 2成果物 |
| テストファイル     | Phase 4成果物                              | テスト仕様    |

### システム仕様（aiworkflow-requirements）

> 実装時に以下のシステム仕様を遵守してください。

| 参照資料                  | パス                                                                         | 内容             |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存パターン参照 |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティ要件 |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 実装パターン     |

## 統合テスト連携【必須】

Main/Renderer間接続の実装とテスト支援コード整備:

| 統合ポイント       | 実装内容                                 |
| ------------------ | ---------------------------------------- |
| Renderer → Main    | Preload APIの実装、型安全なinvoke        |
| Main → Renderer    | ストリーミングイベントの実装             |
| Main → CLI Process | child_process.spawn の設定、環境変数継承 |
| テスト支援         | モック/スタブの整備、テストヘルパー作成  |

## 成果物

| 成果物          | パス                                       | 説明             |
| --------------- | ------------------------------------------ | ---------------- |
| 共有型定義      | `packages/shared/src/claude-cli/`          | 型定義・スキーマ |
| CLIプロセス管理 | `apps/desktop/src/main/claude-cli/`        | プロセス管理     |
| Preload API     | `apps/desktop/src/preload/claudeCliApi.ts` | Renderer用API    |
| 実装レポート    | `outputs/phase-5/implementation-report.md` | 実装完了報告     |

## 完了条件

- [ ] 共有型定義が実装されている
- [ ] CLIプロセス管理が実装されている
- [ ] スキル実行機能が実装されている
- [ ] セッション管理が実装されている
- [ ] IPC通信が実装されている
- [ ] Phase 4で作成した全テストが通過する（Green）
- [ ] 型チェック（`pnpm typecheck`）が通過する
- [ ] Lint（`pnpm lint`）が通過する
- [ ] テスト支援コードが整備されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 共有型定義の実装
2. CLIプロセス管理の実装
3. スキル実行機能の実装
4. セッション管理の実装
5. IPC通信の実装
6. Preload APIの実装
7. テスト通過確認（Green）
8. 型チェック・Lint通過確認
9. 成果物の配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 全実装ファイルが作成されている
- [ ] 全テストがGreen状態
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 5

# テスト実行（Green確認）
pnpm --filter @repo/desktop test -- --run

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

## 次のPhase

Phase 6: テスト拡充
