# Phase 2 成果物: 設計サマリー

## 設計概要

Phase 1 で特定した6つの GAP（GAP-1 〜 GAP-6）を解消するため、以下5つの設計を確定する。

## 1. RuntimeResolver 共通化設計

### 配置先

```
apps/desktop/src/main/services/runtime/RuntimeResolver.ts
```

chat-edit ドメイン（`services/chat-edit/RuntimeResolver.ts`）から共通サービスに移動する。

### 型定義の変更

既存の `RuntimeResolution` 型から `LLMAdapter` 依存を除去する。Skill/Agent パスでは LLM Adapter のインスタンスは不要（既存の execute パスが独自に API key を取得して呼び出す）であるため、共通 resolver は「integrated or handoff」の判定のみを行う。

```typescript
// 変更前（chat-edit 専用）
export type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };

// 変更後（共通サービス）
export type RuntimeResolution =
  | { type: "integrated" }
  | { type: "handoff"; reason: string };
```

### 判断根拠

- `LLMAdapter` は chat-edit ドメイン固有のインターフェース（`ChatEditService.ts` で定義）
- SkillExecutor は `authKeyService.getKey()` で直接 API key を取得して `query()` を呼ぶため、adapter の注入は不要
- AgentExecutor も同様に `query()` を直接呼び出す
- chat-edit ドメインの既存 `RuntimeResolver` は `adapter` 付きの型を引き続き使用可能（共通 resolver を拡張して chat-edit 専用のサブクラスまたはラッパーで対応）

### DI 設計

```typescript
// apps/desktop/src/main/services/runtime/RuntimeResolver.ts
import type { IAuthKeyService, IAuthModeService } from "../auth/types";

export class RuntimeResolver {
  constructor(
    private readonly authKeyService: IAuthKeyService,
    private readonly authModeService: IAuthModeService,
  ) {}

  async resolve(): Promise<RuntimeResolution> {
    const authMode = this.authModeService.getMode();

    if (authMode === "subscription") {
      return {
        type: "handoff",
        reason: "subscription mode: use Claude Code CLI",
      };
    }

    const hasKey = await this.authKeyService.hasKey();
    if (!hasKey) {
      return { type: "handoff", reason: "API key not configured" };
    }

    const apiKey = await this.authKeyService.getKey();
    if (!apiKey) {
      return { type: "handoff", reason: "API key unavailable" };
    }

    return { type: "integrated" };
  }
}
```

### chat-edit ドメインの移行方針

chat-edit ドメインの既存 `RuntimeResolver` は、共通 `RuntimeResolver` を内部で使用するように改修する:

```typescript
// apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts（改修後）
import { RuntimeResolver as CommonRuntimeResolver } from "../runtime/RuntimeResolver";
import type { LLMAdapter } from "./ChatEditService";
import { AnthropicLLMAdapter } from "./AnthropicLLMAdapter";

export type ChatEditRuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };

export class ChatEditRuntimeResolver {
  constructor(
    private readonly commonResolver: CommonRuntimeResolver,
    private readonly authKeyService: IAuthKeyService,
  ) {}

  async resolve(): Promise<ChatEditRuntimeResolution> {
    const result = await this.commonResolver.resolve();
    if (result.type === "handoff") return result;

    const apiKey = await this.authKeyService.getKey();
    return { type: "integrated", adapter: new AnthropicLLMAdapter(apiKey!) };
  }
}
```

### 既存 import パスの影響

| ファイル                  | 変更内容                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `ipc/chatEditHandlers.ts` | import パスを `services/chat-edit/RuntimeResolver` → `ChatEditRuntimeResolver` に変更 |
| `ipc/index.ts`            | 共通 `RuntimeResolver` を生成し、chatEdit / skill / agent ハンドラに注入              |

## 2. IPC ハンドラ DI 拡張設計

### composition root の変更

`registerAllIpcHandlers()` 内で共通 `RuntimeResolver` を1回だけ生成し、各ハンドラに注入する（P5 準拠）。

```typescript
// ipc/index.ts の変更箇所

// --- 8. Auth Key service + Skill 系ハンドラ ---
const authKeyStorage = createAuthKeyStorage();
const authKeyService = new AuthKeyService(authKeyStorage);
const authModeService = createAuthModeService(authKeyService);

// 共通 RuntimeResolver（1回だけ生成 — P5 準拠）
const runtimeResolver = new RuntimeResolver(authKeyService, authModeService);

// skillHandlers に注入
track("registerSkillHandlers", () =>
  registerSkillHandlers(
    mainWindow,
    skillService,
    authKeyService,
    runtimeResolver,
  ),
);

// agentHandlers に注入
track("registerAgentExecutionHandlers", () =>
  registerAgentExecutionHandlers(mainWindow, undefined, runtimeResolver),
);

// chatEditHandlers に注入（既存の chat-edit 専用 resolver を共通 resolver で置換）
track("registerChatEditHandlers", () => {
  const chatEditResolver = new ChatEditRuntimeResolver(
    runtimeResolver,
    authKeyService,
  );
  registerChatEditHandlers(
    mainWindow,
    contextBuilder,
    fileService,
    chatEditResolver,
  );
});
```

### skillHandlers の変更

```typescript
// 関数シグネチャの変更
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
  authKeyService?: IAuthKeyService,
  runtimeResolver?: RuntimeResolver,  // 新規追加
): void {
```

skill:execute ハンドラ内で RuntimeResolver を呼び出し:

```typescript
// skill:execute ハンドラ内（L94 付近）
ipcMain.handle(IPC_CHANNELS.SKILL_EXECUTE, async (event, request) => {
  // 既存のバリデーション...

  // Runtime routing 分岐（新規追加）
  if (runtimeResolver) {
    const resolution = await runtimeResolver.resolve();
    if (resolution.type === "handoff") {
      return {
        success: false,
        handoff: true,
        guidance: {
          terminalCommand: `claude "${request.prompt}"`,
          contextSummary: `skill=${request.skillName}`,
          reason: resolution.reason,
        },
      };
    }
  }

  // 既存の execute フロー（integrated の場合）...
});
```

### agentHandlers の変更

```typescript
// 関数シグネチャの変更
export function registerAgentExecutionHandlers(
  mainWindow: BrowserWindow,
  customRules?: PermissionRules,
  runtimeResolver?: RuntimeResolver,  // 新規追加
): void {
```

agent:start ハンドラ内で RuntimeResolver を呼び出し:

```typescript
// agent:start ハンドラ内
ipcMain.handle(IPC_CHANNELS.AGENT_EXECUTION_START, async (event, request) => {
  // 既存のバリデーション...

  // Runtime routing 分岐（新規追加）
  if (runtimeResolver) {
    const resolution = await runtimeResolver.resolve();
    if (resolution.type === "handoff") {
      return {
        success: false,
        handoff: true,
        guidance: {
          terminalCommand: `claude "${request.prompt}"`,
          contextSummary: `agent execution`,
          reason: resolution.reason,
        },
      };
    }
  }

  // 既存の execute フロー...
});
```

### 契約維持の設計保証

| 既存契約   | 維持方法                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| preflight  | RuntimeResolver.resolve() は既存の preflight チェックの**後に**呼び出す。preflight 失敗時は routing に進まず早期リターン |
| permission | RuntimeResolver は permission 処理に影響しない。integrated の場合は既存フローがそのまま実行される                        |
| streaming  | handoff の場合は単一応答を返し streaming は発生しない。integrated の場合は既存の streaming フローが維持される            |

## 3. TerminalHandoffCard コンポーネント設計

### ファイル構成

```
apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/
  TerminalHandoffCard.tsx   # コンポーネント実装
  index.ts                  # barrel export
```

### Props 定義

```typescript
interface TerminalHandoffCardProps {
  guidance: HandoffGuidance;
  onCopyCommand: () => void;
  onDismiss: () => void;
}
```

### レイアウト設計

```
+-----------------------------------------------+
| [icon] Terminal Handoff Required        [x]    |
|-----------------------------------------------|
| Reason:                                       |
| subscription mode: use Claude Code CLI        |
|-----------------------------------------------|
| Context:                                      |
| skill=my-skill workspace=my-project           |
|-----------------------------------------------|
| Command:                                      |
| +-------------------------------------------+ |
| | claude "Please analyze the code"          | |
| +-------------------------------------------+ |
|                               [Copy Command]  |
+-----------------------------------------------+
```

### UI 仕様

| 項目         | 仕様                                                              |
| ------------ | ----------------------------------------------------------------- |
| 角丸         | `rounded-xl`（12px）                                              |
| シャドウ     | `shadow-sm`（`0 1px 3px rgba(0,0,0,0.04)`）                       |
| パディング   | `p-4`（16px — 8px グリッド x2）                                   |
| 背景         | ライト: `#F2F2F7`（secondarySystemBackground）/ ダーク: `#1C1C1E` |
| ボーダー     | ライト: `#C6C6C8`（opaqueSeparator）/ ダーク: `#38383A`           |
| コマンド表示 | monospace フォント、`bg-[var(--bg-tertiary)]` 背景                |
| コピーボタン | Apple systemBlue（`#007AFF` / `#0A84FF`）                         |
| 閉じるボタン | 右上 `x` アイコン                                                 |

### アクセシビリティ（WCAG 2.1 AA）

| 項目           | 仕様                                                     |
| -------------- | -------------------------------------------------------- |
| コントラスト比 | 通常テキスト 4.5:1 以上、大テキスト 3:1 以上             |
| ARIA           | `role="alert"`, `aria-label="Terminal handoff guidance"` |
| キーボード     | `Tab` でフォーカス移動、`Enter`/`Space` でボタン操作     |
| フォーカス表示 | `ring-2 ring-[var(--accent)]`                            |

## 4. Renderer Hook 分岐設計

### useSkillExecution の変更

```typescript
// apps/desktop/src/renderer/hooks/useSkillExecution.ts
import { useAuthMode } from "../store"; // P31 準拠: 個別セレクタ

export function useSkillExecution(skillId: string): UseSkillExecutionReturn {
  const authMode = useAuthMode();
  const setHandoffGuidance = useSetHandoffGuidance(); // agentSlice の個別セレクタ

  const execute = useCallback(
    async (prompt: string) => {
      // authMode === "subscription" の場合
      if (authMode === "subscription") {
        // IPC 経由で handoff guidance を要求
        const result = await window.electronAPI.skill.execute({
          prompt,
          skillName: skillId,
        });
        if (result?.handoff && result?.guidance) {
          setHandoffGuidance(result.guidance);
          return;
        }
      }

      // authMode === "api-key" の場合（既存フロー）
      const preflightResult = await preflightSkillExecutionAuth();
      if (!preflightResult.success) {
        /* 既存エラー処理 */
      }

      const response = await window.electronAPI.skill.execute({
        prompt,
        skillName: skillId,
      });
      // 既存の response 処理...
    },
    [authMode, skillId, setHandoffGuidance],
  );

  // ...
}
```

### useAgent の変更

```typescript
// apps/desktop/src/renderer/hooks/useAgent.ts
import { useAuthMode } from "../store"; // P31 準拠: 個別セレクタ

export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const authMode = useAuthMode();
  const setHandoffGuidance = useSetHandoffGuidance();

  const query = useCallback(
    async (prompt: string, queryOptions?: QueryOptions) => {
      // authMode === "subscription" の場合
      if (authMode === "subscription") {
        const result = await agentAPI.query(prompt, { ...finalOptions });
        if (result?.handoff && result?.guidance) {
          setHandoffGuidance(result.guidance);
          return;
        }
      }

      // authMode === "api-key" の場合（既存フロー）
      await agentAPI.query(prompt, finalOptions);
    },
    [authMode, defaultTimeout, sessionId, setHandoffGuidance],
  );

  // ...
}
```

### 設計上の判断

- **IPC 呼び出しは共通**: authMode に関わらず IPC 経由で Main Process に実行を依頼する。Main Process 側の RuntimeResolver が handoff/integrated を判定する
- **Renderer は応答で分岐**: IPC 応答に `handoff: true` と `guidance` が含まれる場合は HandoffGuidance を Store に設定し、TerminalHandoffCard を表示する
- **preflight は api-key モードのみ**: subscription モードでは API Key preflight をスキップする（subscription では API key を使わないため）

## 5. 状態管理設計（Zustand agentSlice 拡張）

### 追加する状態

```typescript
// AgentState に追加
export interface AgentState {
  // ...既存の状態...

  /** handoff 案内（null = handoff なし） */
  handoffGuidance: HandoffGuidance | null;
}
```

### 追加するアクション

```typescript
export interface AgentActions {
  // ...既存のアクション...

  /** handoff 案内を設定 */
  setHandoffGuidance: (guidance: HandoffGuidance | null) => void;
  /** handoff 案内をクリア */
  clearHandoffGuidance: () => void;
}
```

### 個別セレクタ（P31 準拠）

```typescript
// store/index.ts に追加
export const useHandoffGuidance = () =>
  useAppStore((state) => state.handoffGuidance);
export const useSetHandoffGuidance = () =>
  useAppStore((state) => state.setHandoffGuidance);
export const useClearHandoffGuidance = () =>
  useAppStore((state) => state.clearHandoffGuidance);
```

### P48 対策

`handoffGuidance` は単一オブジェクト（`HandoffGuidance | null`）であるため、`.filter()` / `.map()` による派生セレクタは不要。`useShallow` の適用は不要。

### HandoffGuidance 型の配置

現在 `HandoffGuidance` 型は `workspace-chat-edit/types/index.ts` に定義されている。共通化のため `packages/shared` への移動を検討したが、以下の理由で現在の配置を維持する:

- SkillExecutor / AgentExecutor のハンドラは `HandoffGuidance` を直接インラインで構築する（型 import 不要）
- Renderer 側は既存の import パスで参照可能
- 将来的に `packages/shared` への移動が必要になった場合は別タスクで対応する

## system spec 整合確認

| 仕様書                        | 整合状況 | 確認内容                                                                                                                       |
| ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| arch-electron-services        | 整合     | RuntimeResolver の composition root 生成パターンが既存の DI パターンと一致                                                     |
| arch-state-management         | 整合     | agentSlice 拡張が Slice パターンに準拠、個別セレクタ追加で P31 対策済み                                                        |
| ui-ux-agent-execution         | 整合     | TerminalHandoffCard は organisms レベルに配置、AgentExecutionView のレイアウト構造に追加可能                                   |
| interfaces-agent-sdk-executor | 整合     | execute 契約の error code に AUTHENTICATION_ERROR が存在、handoff 応答は新規フィールドとして追加（既存フィールドは変更しない） |
| security-skill-execution      | 整合     | API Key が HandoffGuidance.terminalCommand に含まれない設計                                                                    |
| ipc-contract-checklist        | 整合     | 既存チャンネルの拡張（新規チャンネル不要）、引数形式は変更なし                                                                 |
