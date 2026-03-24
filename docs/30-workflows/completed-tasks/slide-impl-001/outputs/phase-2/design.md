# Phase 2: 設計

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 2              |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

Phase 1 で定義した FR-1〜FR-4 / NFR-1〜NFR-5 に基づき、型設計・IPC 契約・Agent SDK adapter 移行の詳細設計を行う。

## 実行タスク

### Task 1: 型設計

#### 1-1. ModifierResponse 拡張

```typescript
// packages/shared/src/slide/types.ts

// 既存（変更なし）
export interface ModifierResponse {
  success: boolean;
  changes?: StructureChange[];
  error?: string;
  // 新規追加（optional - 後方互換）
  fallback_reason?: string;
  suggested_action?: string;
}
```

設計判断:

- `fallback_reason` は modifier-skill.ts の `parseModifierResponse()` で LLM レスポンスからパースされる
- `suggested_action` は `buildHandoffGuidance()` の出力と意味的に近いが、ModifierResponse レベルで保持することで UI 側が直接参照可能になる
- integrated lane では両フィールドは `undefined`（値が入るのは manual lane への fallback 時のみ）

#### 1-2. SlideCapabilityDTO 新規定義

```typescript
// packages/shared/src/slide/types.ts

export type SlideLane = "integrated" | "manual";
export type ApiKeySource = "safeStorage" | "env" | "none";
export type SlideUIStatus = "synced" | "running" | "degraded" | "guidance";

export interface SlideCapabilityDTO {
  lane: SlideLane;
  apiKeySource: ApiKeySource;
  uiStatus: SlideUIStatus;
  blockedReason?: string;
}
```

状態遷移契約（Task08 設計サマリーより）:

| 遷移元   | 遷移先   | 許可     |
| -------- | -------- | -------- |
| synced   | running  | 許可     |
| running  | synced   | 許可     |
| running  | degraded | 許可     |
| running  | guidance | 許可     |
| degraded | guidance | 許可     |
| degraded | synced   | 許可     |
| guidance | synced   | 許可     |
| synced   | degraded | **禁止** |
| synced   | guidance | **禁止** |
| guidance | degraded | **禁止** |
| degraded | running  | **禁止** |

### Task 2: IPC 契約設計

#### 2-1. channel 名の確定

```typescript
// apps/desktop/src/preload/channels.ts に追加

// Slide capability
SLIDE_CAPABILITY_GET: "slide:capability:get",
```

既存 `slide:*` namespace との整合確認:

- `slide:executePhase` / `slide:watch-start` / `slide:sync-status` 等と同一 namespace
- `slide:capability:get` は read-only 操作のため `handle` パターン（invoke/handle）を使用

#### 2-2. IPC handler 設計

```typescript
// apps/desktop/src/main/slide/ipc-handlers.ts に追加

ipc.handle(
  IPC_CHANNELS.SLIDE_CAPABILITY_GET,
  async (_event, args: { sessionId: string }) => {
    // P42 準拠 3 段バリデーション
    if (typeof args?.sessionId !== "string") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "sessionId must be a string",
        },
      };
    }
    if (args.sessionId === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "sessionId must not be empty",
        },
      };
    }
    if (args.sessionId.trim() === "") {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "sessionId must not be whitespace only",
        },
      };
    }

    // capability 算出
    const capability = await resolveSlideCapability(args.sessionId.trim());
    return { success: true, data: capability };
  },
);
```

#### 2-3. Preload API 設計

```typescript
// apps/desktop/src/preload/index.ts - slideApi に追加

getCapability: (sessionId: string) =>
  safeInvoke(IPC_CHANNELS.SLIDE_CAPABILITY_GET, { sessionId }),
```

```typescript
// apps/desktop/src/preload/types.ts に追加

export interface SlideCapabilityResponse {
  success: boolean;
  data?: SlideCapabilityDTO;
  error?: { code: string; message: string };
}
```

#### 2-4. allowlist 登録

```typescript
// apps/desktop/src/preload/channels.ts

// ALLOWED_INVOKE_CHANNELS に追加
IPC_CHANNELS.SLIDE_CAPABILITY_GET,
```

### Task 3: Agent SDK adapter 設計

#### 3-1. 現在のアーキテクチャ

```
agent-client.ts
  ├── import Anthropic from "@anthropic-ai/sdk"
  ├── safeStorage.decryptString() で API key 取得
  ├── new Anthropic({ apiKey }) で直接クライアント生成
  └── client.messages.create() で LLM 呼び出し
```

#### 3-2. 移行後のアーキテクチャ

```
agent-client.ts
  ├── AgentSDKAdapter（DI 注入）
  │   ├── IAuthKeyService で API key 取得（P62 対策）
  │   ├── RuntimePolicyResolver で lane 判定
  │   └── Agent SDK query() API でLLM 呼び出し
  └── ModifierAgentAPI インターフェースは維持（後方互換）
```

#### 3-3. DI 設計

```typescript
// agent-client.ts の依存注入

export interface AgentClientDependencies {
  authKeyService: IAuthKeyService;
  runtimeResolver: RuntimePolicyResolver;
  agentSDKAdapter?: AgentSDKAdapter; // optional: テスト時にモック注入
}

export function createModifierAgentAPI(
  deps: AgentClientDependencies,
): ModifierAgentAPI {
  // ...
}
```

- P34（遅延初期化 DI）パターン: `agentSDKAdapter` は API key 取得後に初期化
- P62 対策: `authKeyService.getKey()` が `none` を返す場合は即座にエラー（fallback しない）
- P61 準拠: 引数型は具象クラスではなくインターフェース

### Task 4: modifier-skill.ts パース拡張設計

```typescript
// parseModifierResponse() の拡張

function parseModifierResponse(content: string): ModifierResponse {
  const json = extractJsonBlock(content);
  return {
    success: json.success ?? false,
    changes: validateChanges(json.changes),
    error: json.error,
    // 新規: optional フィールドのパース
    fallback_reason:
      typeof json.fallback_reason === "string"
        ? json.fallback_reason
        : undefined,
    suggested_action:
      typeof json.suggested_action === "string"
        ? json.suggested_action
        : undefined,
  };
}
```

- P49 準拠: `as` キャスト不使用。`typeof` + `in` 演算子で実行時検証
- P48 準拠: non-null assertion 不使用。optional chaining で安全にアクセス

### Task 5: resolveSlideCapability ロジック設計

`slide:capability:get` ハンドラ内で呼び出される `resolveSlideCapability` 関数のロジック:

```typescript
function resolveSlideCapability(sessionId: string): SlideCapabilityDTO {
  // 1. API key 状態を確認
  const apiKeySource = authKeyService.getKeySource("anthropic");

  // 2. Agent SDK adapter 状態を確認
  const adapterStatus = agentSDKAdapter.getStatus();

  // 3. 状態遷移ルールに基づき uiStatus を決定
  if (apiKeySource === "none") {
    return {
      lane: "manual",
      apiKeySource: "none",
      uiStatus: "guidance",
      blockedReason: "API key not configured",
    };
  }
  if (adapterStatus === "error") {
    return {
      lane: "manual",
      apiKeySource,
      uiStatus: "degraded",
      blockedReason: adapterStatus.message,
    };
  }
  if (adapterStatus === "running") {
    return { lane: "integrated", apiKeySource, uiStatus: "running" };
  }
  return { lane: "integrated", apiKeySource, uiStatus: "synced" };
}
```

**状態遷移根拠テーブル**:

| apiKeySource | adapterStatus | 決定される uiStatus | 根拠                                |
| ------------ | ------------- | ------------------- | ----------------------------------- |
| `"none"`     | any           | `"guidance"`        | API key 未設定では LLM 呼び出し不可 |
| any          | `"error"`     | `"degraded"`        | adapter エラーで機能制限            |
| any          | `"running"`   | `"running"`         | LLM 処理実行中                      |
| valid        | `"idle"`      | `"synced"`          | 正常状態                            |

## 参照資料

| 資料名                | パス                                                                                                                                | 内容                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1 要件定義      | `phase-1-requirements.md`                                                                                                           | FR/NFR/AC 定義      |
| Task08 設計サマリー   | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/design-summary.md`  | 状態遷移・型設計    |
| Task08 契約マトリクス | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md` | UI 4 領域表示ルール |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                          | 内容                           |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | IPC handler 登録手順           |
| セキュリティ原則       | `.claude/rules/04-electron-security.md`                                       | sender 検証、allowlist 管理    |
| Agent SDK パターン     | `.claude/skills/claude-agent-sdk/SKILL.md`                                    | query() API、Hooks、Permission |

## 統合テスト連携

- Phase 2 では統合テスト設計のみ。実行は Phase 4 以降。
- IPC 統合テスト: `slide:capability:get` の Renderer → Preload → Main → 応答フロー
- Agent SDK adapter テスト: mock adapter 注入による LLM 呼び出し検証

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                |
| ------------------ | ---- | ----------------------------------------------------------- |
| セキュリティ       | 適用 | P42 バリデーション、IPC sender 検証、パストラバーサル防御   |
| アーキテクチャ     | 適用 | DI パターン（P34/P61）、Agent SDK adapter 移行              |
| API 設計           | 適用 | IPC channel 命名（namespace 一貫性）、レスポンス形式（P60） |
| エラーハンドリング | 適用 | P62 対策（暗黙 fallback 禁止）、validation error 形式       |

## 成果物

| 成果物 | パス                        | 説明       |
| ------ | --------------------------- | ---------- |
| 設計書 | `outputs/phase-2/design.md` | 本ファイル |

## 完了条件

- [x] ModifierResponse 拡張の型設計が後方互換を保って定義されている
- [x] SlideCapabilityDTO の型と状態遷移契約が定義されている
- [x] IPC channel 名 `slide:capability:get` の契約（引数・応答・バリデーション）が定義されている
- [x] Agent SDK adapter のDI設計がP34/P61/P62準拠で定義されている
- [x] modifier-skill.ts のパース拡張がP48/P49準拠で設計されている
- [x] resolveSlideCapability の擬似コードと状態遷移根拠テーブルが定義されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 3: 設計レビュー
