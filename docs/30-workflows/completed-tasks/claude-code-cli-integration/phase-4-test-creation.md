# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 4                           |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

TDDのRedフェーズとして、実装前にテストを作成する。テストが失敗する状態を確認する。

## 実行タスク

### タスク1: CLIプロセス管理テスト作成

**目的**: CLIプロセスのライフサイクル管理をテストする

**手順**:

1. テストファイル作成: `apps/desktop/src/main/claude-cli/__tests__/cli-process-manager.test.ts`
2. 以下のテストケースを作成:
   - CLI存在確認（`claude --version`）
   - プロセス起動（spawn）
   - プロセス停止（kill）
   - タイムアウト処理
   - 異常終了ハンドリング

**テストケース一覧**:

```typescript
describe("CliProcessManager", () => {
  describe("checkCliAvailability", () => {
    it("should return true when claude CLI is installed");
    it("should return false when claude CLI is not found");
    it("should return CLI version info when available");
  });

  describe("spawn", () => {
    it("should spawn a new CLI process");
    it("should return session ID for tracking");
    it("should emit process started event");
    it("should handle spawn errors gracefully");
  });

  describe("kill", () => {
    it("should terminate process by session ID");
    it("should emit process terminated event");
    it("should handle already terminated process");
    it("should force kill after grace period");
  });

  describe("timeout", () => {
    it("should terminate process after timeout");
    it("should emit timeout event");
    it("should clean up resources on timeout");
  });
});
```

**期待される成果物**:

- CLIプロセス管理テストファイル

### タスク2: IPC通信テスト作成

**目的**: Main-Renderer間IPC通信をテストする

**手順**:

1. テストファイル作成: `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`
2. 以下のテストケースを作成:
   - チャンネル登録
   - リクエスト/レスポンス型検証
   - エラーハンドリング
   - ストリーミング通信

**テストケース一覧**:

```typescript
describe("ClaudeCliIpcHandler", () => {
  describe("claude-cli:check", () => {
    it("should return CLI availability status");
    it("should include version info when available");
  });

  describe("claude-cli:list-skills", () => {
    it("should return list of available skills");
    it("should filter skills based on criteria");
    it("should handle empty skill directory");
  });

  describe("claude-cli:execute", () => {
    it("should validate request schema");
    it("should reject invalid skill paths");
    it("should return session ID on success");
    it("should handle execution errors");
  });

  describe("claude-cli:abort", () => {
    it("should abort running session");
    it("should handle non-existent session");
    it("should clean up resources");
  });

  describe("claude-cli:stream", () => {
    it("should emit stdout messages");
    it("should emit stderr messages");
    it("should emit progress updates");
    it("should handle stream errors");
  });
});
```

**期待される成果物**:

- IPC通信テストファイル

### タスク3: スキル実行テスト作成

**目的**: スキル実行機能をテストする

**手順**:

1. テストファイル作成: `apps/desktop/src/main/claude-cli/__tests__/skill-executor.test.ts`
2. 以下のテストケースを作成:
   - スキルパス解決
   - コマンド構築
   - 出力パース
   - エラーハンドリング

**テストケース一覧**:

```typescript
describe("SkillExecutor", () => {
  describe("resolveSkillPath", () => {
    it("should resolve valid skill path");
    it("should reject path traversal attempts");
    it("should validate skill exists");
    it("should handle relative paths");
  });

  describe("buildCommand", () => {
    it("should build correct CLI command");
    it("should include skill path argument");
    it("should include prompt argument");
    it("should include optional arguments");
  });

  describe("parseOutput", () => {
    it("should parse JSON output");
    it("should handle plain text output");
    it("should extract progress information");
    it("should handle malformed output");
  });

  describe("execute", () => {
    it("should execute skill and return result");
    it("should stream output during execution");
    it("should handle execution timeout");
    it("should handle skill errors");
  });
});
```

**期待される成果物**:

- スキル実行テストファイル

### タスク4: セッション管理テスト作成

**目的**: 複数セッションの並列管理をテストする

**手順**:

1. テストファイル作成: `apps/desktop/src/main/claude-cli/__tests__/session-manager.test.ts`
2. 以下のテストケースを作成:
   - セッション作成/破棄
   - 並列セッション管理
   - リソースクリーンアップ
   - セッションタイムアウト

**テストケース一覧**:

```typescript
describe("SessionManager", () => {
  describe("createSession", () => {
    it("should create new session with unique ID");
    it("should track session metadata");
    it("should emit session created event");
  });

  describe("getSession", () => {
    it("should return existing session");
    it("should return undefined for non-existent session");
  });

  describe("listSessions", () => {
    it("should return all active sessions");
    it("should filter by status");
  });

  describe("destroySession", () => {
    it("should terminate and clean up session");
    it("should emit session destroyed event");
    it("should handle already destroyed session");
  });

  describe("parallel sessions", () => {
    it("should manage multiple concurrent sessions");
    it("should isolate session state");
    it("should handle session limit");
  });

  describe("cleanup", () => {
    it("should clean up orphaned sessions");
    it("should clean up on application exit");
    it("should handle cleanup errors");
  });
});
```

**期待される成果物**:

- セッション管理テストファイル

## 参照資料

| 資料名             | パス                                       | 説明          |
| ------------------ | ------------------------------------------ | ------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`   | Phase 2成果物 |
| IPC API仕様        | `outputs/phase-2/ipc-api-specification.md` | Phase 2成果物 |
| 型定義設計         | `outputs/phase-2/type-definitions.md`      | Phase 2成果物 |

### システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照してください。

| 参照資料   | パス                                                                        | 内容                 |
| ---------- | --------------------------------------------------------------------------- | -------------------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テストカバレッジ基準 |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`     | テスト方針           |

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで作成:

| カテゴリ           | テストシナリオ                                |
| ------------------ | --------------------------------------------- |
| CLI接続            | CLI存在確認→バージョン取得→エラーハンドリング |
| IPC通信            | Renderer→Main→CLI→Main→Renderer の往復        |
| プロセス管理       | spawn→monitor→kill のライフサイクル           |
| ストリーミング     | stdout/stderrのリアルタイムキャプチャ         |
| セッション管理     | 作成→並列実行→クリーンアップ                  |
| エラーハンドリング | 各層でのエラー伝播と回復                      |

## 成果物

| 成果物                | パス                                                                     | 説明                 |
| --------------------- | ------------------------------------------------------------------------ | -------------------- |
| CLIプロセス管理テスト | `apps/desktop/src/main/claude-cli/__tests__/cli-process-manager.test.ts` | プロセス管理テスト   |
| IPC通信テスト         | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`         | IPC APIテスト        |
| スキル実行テスト      | `apps/desktop/src/main/claude-cli/__tests__/skill-executor.test.ts`      | スキル実行テスト     |
| セッション管理テスト  | `apps/desktop/src/main/claude-cli/__tests__/session-manager.test.ts`     | セッション管理テスト |
| 統合テストシナリオ    | `outputs/phase-4/integration-test-scenarios.md`                          | 統合テスト定義       |

## 完了条件

- [ ] CLIプロセス管理テストが作成されている
- [ ] IPC通信テストが作成されている
- [ ] スキル実行テストが作成されている
- [ ] セッション管理テストが作成されている
- [ ] 全テストが失敗する状態（Red）であることを確認
- [ ] 統合テストシナリオが全カテゴリで作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. CLIプロセス管理テストファイル作成
2. IPC通信テストファイル作成
3. スキル実行テストファイル作成
4. セッション管理テストファイル作成
5. 統合テストシナリオ作成
6. 全テストがRed状態であることを確認
7. 成果物の配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 全テストファイルが作成されている
- [ ] テスト実行でRed状態を確認
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 4

# テスト実行（Red確認）
pnpm --filter @repo/desktop test -- --run
```

## 次のPhase

Phase 5: 実装（TDD: Green）
