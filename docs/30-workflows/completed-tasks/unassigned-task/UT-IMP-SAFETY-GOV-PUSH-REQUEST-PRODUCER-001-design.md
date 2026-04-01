# 設計書: UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Issue      | #1803                                              |
| ブランチ   | `feat/UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001` |
| 作成日     | 2026-04-01                                         |
| ステータス | 完了                                               |
| 完了日     | 2026-04-01                                         |
| 関連タスク | UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001       |

---

## Phase 1: 要件整理

### 1.1 実装対象の明確化

変更前は、`pushApprovalRequest()` の IPC 輸送経路 (Main → Preload → Renderer) は実装済みだが、
production ランタイムでこの関数を呼び出す **producer** が存在しなかった。

現状:

- `pushApprovalRequest()`: `apps/desktop/src/main/ipc/approvalHandlers.ts` に実装済み
- IPC チャンネル: `APPROVAL_REQUEST = "approval:request"`（`ALLOWED_ON_CHANNELS` 登録済み）
- `DefaultApprovalGate`: `apps/desktop/src/main/ipc/index.ts` で生成済み（Agent/Approval handlers で共有）
- `registerApprovalHandlers()`: `apps/desktop/src/main/ipc/index.ts` で登録済み

変更前に欠けていたもの:

- 危険コマンドや外部送信を検出した時点で `pushApprovalRequest()` を呼ぶ呼び出し元

### 1.2 影響範囲

| ファイル                                                                       | 変更種別             | 理由                                                       |
| ------------------------------------------------------------------------------ | -------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/main/services/agent/HooksFactory.ts`                         | 修正（主要）         | `createPreToolUseHook` 内で producer を接続する            |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`                        | 修正                 | `approvalGate` と `sessionId` を `HooksFactory` に伝搬     |
| `apps/desktop/src/main/services/agent/ExecutionManager.ts`                     | 修正                 | `approvalGate` を `AgentExecutor` に伝搬                   |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                                   | 修正                 | `registerAgentExecutionHandlers` に `approvalGate` を注入  |
| `apps/desktop/src/main/ipc/index.ts`                                           | 修正                 | `DefaultApprovalGate` を 1 回生成し Agent/Approval で共有  |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` | 新規テストファイル   | `HooksFactory` の producer 単体テスト                      |
| `apps/desktop/src/main/services/agent/__tests__/HooksFactory.test.ts`          | 修正                 | `HooksFactory` コンストラクタ引数の追従                    |
| `apps/desktop/src/main/services/agent/__tests__/AgentExecutor.test.ts`         | 修正                 | `approvalGate` 注入の追従                                  |
| `apps/desktop/src/main/services/agent/__tests__/ExecutionManager.test.ts`      | 修正                 | `approvalGate` 引数追加の追従                              |
| `apps/desktop/src/main/services/agent/__tests__/integration.test.ts`           | 修正                 | DI チェーン変更の回帰確認                                  |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                    | 修正                 | `approvalGate` 注入の追従                                  |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`            | 修正                 | `approvalGate` 注入の追従                                  |
| `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts`            | 既存回帰（回帰のみ） | `pushApprovalRequest` / channel 契約の既存カバレッジを継続 |
| `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`                | 既存回帰（回帰のみ） | IPC 初期化と DI 連携の回帰チェックを継続                   |

**変更しないファイル:**

- `approvalHandlers.ts` — `pushApprovalRequest()` はすでに正しく実装されている
- `SkillCreatorHooksFactory.ts` — 監査専用; producer 責務は持たせない（後述）

---

## Phase 2: 技術設計

### 2.1 producer 接続ポイントの決定と根拠

#### 選択肢の比較

| Option | 接続先                                       | 評価                                                                                                               |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **A**  | `HooksFactory.createPreToolUseHook()` 内     | **採用** — 危険コマンド検出ロジックが集約されており、`mainWindow` を注入するだけで機能する。単一責務を維持できる。 |
| B      | `SkillCreatorHooksFactory.onPreToolUse()` 内 | 不採用 — 監査専用 Hooks であり、`BrowserWindow` 参照を持たない。IPC 送信責務を混入すると SRP 違反になる。          |
| C      | `ClaudeCliManager` / IPC Handler 層          | 不採用 — 現在の `ClaudeCliManager` は `Bash` ツール実行の前段フックを持たず、ここでの接続は大規模な改修を要する。  |

#### 採用理由: Option A

1. **危険コマンド検出の単一箇所** — `DANGEROUS_PATTERNS.BASH_COMMANDS` チェックは既に `HooksFactory.createPreToolUseHook()` 内の `for...of` ループで行われている。検出と通知を同一ループ内に置くことで検出漏れを防ぐ。

2. **`mainWindow` 参照がすでに存在** — `HooksFactory` クラスは `constructor` で `mainWindow: BrowserWindow` を受け取っており、`pushApprovalRequest()` の呼び出しに必要な依存が揃っている。

3. **`approvalGate` の注入が最小限の変更で済む** — `ipc/index.ts` で `DefaultApprovalGate` を 1 回生成し、`registerAgentExecutionHandlers()` と `registerApprovalHandlers()` の両方に同じインスタンスを渡すだけでよい。

4. **既存テスト資産との整合** — `approvalHandlers.push.test.ts` は `pushApprovalRequest()` と IPC チャンネル契約を回帰として保持できる。一方で、本タスクの新規要件（producer 発火）は `HooksFactory.producer.test.ts` に切り出して検証するのが自然。

### 2.2 実装パターン（コード設計）

#### 2.2.1 `HooksFactory` コンストラクタの拡張

```typescript
// apps/desktop/src/main/services/agent/HooksFactory.ts

import { pushApprovalRequest } from "../../ipc/approvalHandlers";
import type { IApprovalGate } from "../runtime/ApprovalGate";
import { v4 as uuidv4 } from "uuid";

export class HooksFactory {
  private mainWindow: BrowserWindow;
  private executionId: string;
  private permissionResolver: PermissionResolver;
  private approvalGate: IApprovalGate; // 追加（現時点では producer では未使用。将来の enforcement 用に DI だけ通す）
  private sessionId: string; // 追加（相関ID用）

  constructor(
    mainWindow: BrowserWindow,
    executionId: string,
    permissionResolver: PermissionResolver,
    approvalGate: IApprovalGate, // 追加
    sessionId: string, // 追加
  ) {
    this.mainWindow = mainWindow;
    this.executionId = executionId;
    this.permissionResolver = permissionResolver;
    this.approvalGate = approvalGate;
    this.sessionId = sessionId;
  }
  // ...
}
```

#### 2.2.2 `createPreToolUseHook` の producer 接続

```typescript
private createPreToolUseHook(): SDKHooks["PreToolUse"] {
  return async (
    input: HookToolInput,
    _toolUseId: string,
    _context: HookContext,
  ): Promise<HookResult> => {
    if (input.toolName === "Bash") {
      const command = (input.args.command as string) || "";

      for (const pattern of DANGEROUS_PATTERNS.BASH_COMMANDS) {
        if (command.includes(pattern)) {
          // --- 追加: Renderer へ承認リクエストをプッシュ ---
          const operationId = uuidv4();
          pushApprovalRequest(this.mainWindow, {
            sessionId: this.sessionId,
            operationId,
            operationType: "dangerous_bash_command",
            description: `Dangerous command blocked: ${pattern}`,
          });
          // ------------------------------------------------

          return {
            proceed: false,
            message: `Dangerous command blocked: ${pattern}`,
          };
        }
      }
    }

    return { proceed: true };
  };
}
```

#### 2.2.3 `ipc/index.ts` の配線変更

`DefaultApprovalGate` は `apps/desktop/src/main/ipc/index.ts` で 1 回だけ生成し、次の 2 系統で共有する。

- Approval 側: `registerApprovalHandlers(mainWindow, approvalGate)`
- Agent 側: `registerAgentExecutionHandlers(mainWindow, approvalGate, ...)`

Agent 側の DI チェーン（current facts）:

- `agentHandlers.ts`: `executionManager.startExecution(request, mainWindow, approvalGate, customRules)`
- `ExecutionManager.ts`: `new AgentExecutor(requestWithId, mainWindow, approvalGate, customRules)`
- `AgentExecutor.ts`: `new HooksFactory(mainWindow, executionId, permissionResolver, approvalGate, sessionId)`
  - 現時点の `sessionId` は `executionId` を流用する（相関 ID を増やさない）

### 2.3 セッション/オペレーション相関IDの設計

#### sessionId

- `HooksFactory` コンストラクタの引数 `sessionId: string` として受け取る
- `executionId` と同一 or 関連する ID とするかは呼び出し側の設計に従う
- current: `executionId` を `sessionId` として流用する（相関 ID の追加を避ける）

#### operationId

- 危険コマンド検出のたびに `uuidv4()` で新規生成する
- `ApprovalGate.grantApproval(sessionId, operationId)` のキーとして使用されるため、
  各操作で一意である必要がある
- Renderer 側の `ApprovalRespondRequest` と対応する
- 1 セッション中に複数回の危険操作が起きても衝突しないよう、操作単位で生成する

#### ペイロードの型

`approvalHandlers.ts` の `pushApprovalRequest` 引数型に準拠:

```typescript
{
  sessionId: string;      // セッション相関ID
  operationId: string;    // 操作固有ID (uuid)
  operationType: string;  // "dangerous_bash_command" | "external_send" など
  description: string;    // ユーザー向け説明文
  destination?: string;   // 外部送信先URL（該当時のみ）
}
```

---

## Phase 3: テスト計画

### 3.1 追加するテストケース一覧

#### ファイル 1: `apps/desktop/src/main/services/agent/__tests__/HooksFactory.producer.test.ts` (新規)

| #   | テストケース名                                                                | 検証内容                                                                 |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | 危険コマンド検出時に `pushApprovalRequest` が呼ばれること                     | `DANGEROUS_PATTERNS.BASH_COMMANDS` の任意パターンでモックが呼ばれる      |
| 2   | 危険コマンド検出時のペイロードに `sessionId` が含まれること                   | コンストラクタで注入した `sessionId` がペイロードに反映される            |
| 3   | 危険コマンド検出時のペイロードに新規 `operationId` (uuid) が含まれること      | `operationId` が非空文字列で一意であること                               |
| 4   | 危険コマンド検出時の `operationType` が `"dangerous_bash_command"` であること | ペイロードの `operationType` フィールド検証                              |
| 5   | 安全なコマンドでは `pushApprovalRequest` が呼ばれないこと                     | `ls -la` 等では IPC 送信なし                                             |
| 6   | `mainWindow` が破棄済みでも例外にならないこと                                 | ガード責務は `pushApprovalRequest` 側。producer 経路が落ちないことを確認 |
| 7   | 複数の危険パターンを含むコマンドで1回だけ発火すること（最初のマッチ）         | ループが最初のマッチで `return` するため二重送信なし                     |

#### 既存回帰（regression-only）

- `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts`: `pushApprovalRequest` / `APPROVAL_REQUEST` チャンネル契約の回帰
- `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`: IPC 初期化と DI 連携の回帰
- `apps/desktop/src/main/ipc/__tests__/agentHandlers.*.test.ts`: `approvalGate` 注入シグネチャ変更の回帰

### 3.2 テストの実装方針

#### モック構成

```typescript
// HooksFactory.producer.test.ts の基本構成

vi.mock("../../ipc/approvalHandlers", () => ({
  pushApprovalRequest: vi.fn(),
}));

vi.mock("electron", () => ({
  BrowserWindow: vi.fn(),
}));

// mainWindow モック
const mockMainWindow = {
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: {
    isDestroyed: vi.fn().mockReturnValue(false),
    send: vi.fn(),
  },
} as unknown as BrowserWindow;
```

#### 重点事項

1. **`pushApprovalRequest` をモック化して呼び出し有無を検証** — 単体テストでは IPC 送信の副作用を切り離す
2. **`AbortSignal` の処理** — `context.signal` は `new AbortController().signal` を渡す
3. **DI 追従テストの最小化** — `approvalGate` 追加によるシグネチャ変更は最小限の修正で既存テストを追従させ、回帰だけを担保する

#### テスト実行確認コマンド

```bash
# 新規テストファイル
pnpm --filter @repo/desktop vitest run src/main/services/agent/__tests__/HooksFactory.producer.test.ts

# 既存テストへの回帰確認
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/approvalHandlers.push.test.ts
```

---

## 補足: 設計判断の根拠まとめ

### Option B (SkillCreatorHooksFactory) を選ばない理由

`SkillCreatorHooksFactory.ts` の `onPreToolUse()` は `SkillCreatorToolDecision` を返すだけの
監査専用 hooks であり、`BrowserWindow` 参照を受け取らない構造になっている。
IPC 送信責務を混入すると：

- 単一責務原則 (SRP) に違反する
- `createHooks()` の引数シグネチャが変わり、全呼び出し箇所に影響する
- SkillCreator ガバナンスが approval ゲートに依存する形になり、テスト複雑度が上がる

### Option A (HooksFactory) を選ぶ理由（追記）

`HooksFactory` は「SDK hooks を生成する」という責務を持ち、
その内部で既に IPC 送信 (`PostToolUse` での `AGENT_EXECUTION_STATUS` 送信、
`PermissionRequest` での `AGENT_EXECUTION_PERMISSION` 送信) を行っている。
approval request の producer 接続はこのパターンと完全に一致している。

---

## 実装同期（current facts）

- producer は `HooksFactory.createPreToolUseHook()` に接続済み
  - 危険パターン一致時に `pushApprovalRequest(mainWindow, payload)` を呼ぶ
  - `operationType` は `"dangerous_bash_command"` に統一
  - `description` は `Dangerous command blocked: ${pattern}` に統一
- `sessionId` は `executionId` を流用（相関 ID を増やさない）
- `operationId` は `uuidv4()` で操作単位に採番する
- 回帰テスト（regression-only）として `approvalHandlers.push.test.ts` / `index.integration.test.ts` を維持する
