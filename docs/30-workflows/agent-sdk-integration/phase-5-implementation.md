# Phase 5: 実装

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase番号  | 5                              |
| Phase名    | 実装                           |
| 目的       | TDD: Green（テストを通す実装） |
| 前提Phase  | Phase 4（テスト作成）          |
| 後続Phase  | Phase 6（テスト拡充）          |
| ステータス | 未実施                         |

---

## 目的

Phase 4で作成したテストを通す最小限の実装を行う（TDD Green状態）。

---

## 使用スキル

| スキル名                    | パス                                                  | 選定理由                                            |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| clean-code-practices        | `.claude/skills/clean-code-practices/SKILL.md`        | クリーンコード原則（Trigger: 実装、コーディング）   |
| electron-ipc-patterns       | `.claude/skills/electron-ipc-patterns/SKILL.md`       | IPC通信実装（Trigger: IPC通信）                     |
| electron-security-hardening | `.claude/skills/electron-security-hardening/SKILL.md` | セキュリティ強化（Trigger: Electron、セキュリティ） |
| type-safety-patterns        | `.claude/skills/type-safety-patterns/SKILL.md`        | 型安全なコード（Trigger: TypeScript、型安全）       |
| claude-agent-sdk            | `.claude/skills/claude-agent-sdk/SKILL.md`            | Agent SDK統合パターン（Phase 0で作成）              |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物                | 説明                   | 配置先                              |
| --------------------- | ---------------------- | ----------------------------------- |
| Agent SDKクライアント | SDK統合モジュール      | `packages/shared/src/agent/`        |
| IPCハンドラー         | Electron IPCハンドラー | `apps/desktop/src/main/agent/`      |
| プリロードAPI         | RendererプロセスAPI    | `apps/desktop/src/preload/`         |
| 実装レポート          | 実装詳細・決定事項     | `outputs/phase-5/implementation.md` |

---

## 実行手順

### Step 1: Agent SDKクライアント実装

claude-agent-sdkスキルを参照し、Agent SDKクライアントを実装する。

**実装ファイル**: `packages/shared/src/agent/agent-client.ts`

```typescript
import { ClaudeSDKClient, query } from "@anthropic-ai/claude-agent-sdk";

export interface QueryOptions {
  sessionId?: string;
  timeout?: number;
}

export interface QueryResult {
  content: string;
  sessionId: string;
}

export class AgentClient {
  private client: ClaudeSDKClient | null = null;

  async initialize(apiKey: string): Promise<void> {
    this.client = new ClaudeSDKClient({ apiKey });
  }

  async query(prompt: string, options?: QueryOptions): Promise<QueryResult> {
    if (!this.client) {
      throw new Error("AgentClient not initialized");
    }

    const result = await query(prompt, {
      client: this.client,
      sessionId: options?.sessionId,
    });

    return {
      content: result.content,
      sessionId: result.sessionId,
    };
  }
}
```

### Step 2: セッションマネージャー実装

**実装ファイル**: `packages/shared/src/agent/session-manager.ts`

```typescript
export interface SessionInfo {
  id: string;
  createdAt: Date;
  lastAccessedAt: Date;
}

export class SessionManager {
  private sessions: Map<string, SessionInfo> = new Map();

  createSession(): SessionInfo {
    const session: SessionInfo = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  resumeSession(sessionId: string): SessionInfo | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = new Date();
    }
    return session ?? null;
  }
}
```

### Step 3: IPCハンドラー実装

electron-ipc-patternsスキルを参照し、IPCハンドラーを実装する。

**実装ファイル**: `apps/desktop/src/main/agent/agent-handler.ts`

```typescript
import { ipcMain } from "electron";
import { AgentClient, QueryOptions } from "@repo/shared/agent";

export function registerAgentHandlers(agentClient: AgentClient): void {
  ipcMain.handle(
    "agent:query",
    async (event, prompt: string, options?: QueryOptions) => {
      return agentClient.query(prompt, options);
    },
  );

  ipcMain.handle(
    "agent:session",
    async (event, action: "create" | "resume", sessionId?: string) => {
      // セッション管理ロジック
    },
  );
}
```

### Step 4: プリロードAPI実装

electron-security-hardeningスキルを参照し、セキュアなプリロードAPIを実装する。

**実装ファイル**: `apps/desktop/src/preload/agent-api.ts`

```typescript
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("agentAPI", {
  query: (prompt: string, options?: { sessionId?: string; timeout?: number }) =>
    ipcRenderer.invoke("agent:query", prompt, options),
  session: (action: "create" | "resume", sessionId?: string) =>
    ipcRenderer.invoke("agent:session", action, sessionId),
});
```

### Step 5: 型定義の整備

type-safety-patternsスキルを参照し、型定義を整備する。

**実装ファイル**: `packages/shared/src/agent/types.ts`

```typescript
export interface AgentAPI {
  query: (prompt: string, options?: QueryOptions) => Promise<QueryResult>;
  session: (
    action: "create" | "resume",
    sessionId?: string,
  ) => Promise<SessionInfo>;
}

declare global {
  interface Window {
    agentAPI: AgentAPI;
  }
}
```

---

## 完了条件

- [ ] Phase 4で作成した全テストがパス（Green状態）
- [ ] Agent SDKクライアントが実装されている
- [ ] IPCハンドラーが実装されている
- [ ] プリロードAPIが実装されている
- [ ] 型定義が完備されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

フロント/バック接続の実装とテスト支援コード整備:

- [ ] Agent SDKクライアントの初期化処理
- [ ] IPC通信の接続確認
- [ ] エラーハンドリングの実装
- [ ] テストモック・スタブの整備

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                           | 内容                    |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| interfaces-llm          | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | LLMインターフェース仕様 |
| security-implementation | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ実装仕様    |

---

## スキルフィードバック記録

| スキル                      | 結果    | 備考              |
| --------------------------- | ------- | ----------------- |
| clean-code-practices        | pending | Phase完了後に記録 |
| electron-ipc-patterns       | pending | Phase完了後に記録 |
| electron-security-hardening | pending | Phase完了後に記録 |
| type-safety-patterns        | pending | Phase完了後に記録 |
| claude-agent-sdk            | pending | Phase完了後に記録 |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
# - [ ] すべてのテストケースがパス
# - [ ] 実装が最小限に抑えられている
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. clean-code-practicesスキルの実行
3. electron-ipc-patternsスキルの実行
4. electron-security-hardeningスキルの実行
5. type-safety-patternsスキルの実行
6. claude-agent-sdkスキルの実行
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. TDD検証の実施（Green状態確認）
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 5
```

---

## 次のPhase

Phase 6: テスト拡充

---

## 備考

- 最小限の実装でテストを通すことを優先（YAGNI原則）
- API Keyはelectron-storeで安全に管理する
- セキュリティ脆弱性（API Key露出）に注意する
