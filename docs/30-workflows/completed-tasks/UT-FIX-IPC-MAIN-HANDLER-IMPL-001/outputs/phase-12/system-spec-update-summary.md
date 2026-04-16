# 仕様同期サマリー — UT-FIX-IPC-MAIN-HANDLER-IMPL-001

## 変更されたシステム仕様

| 項目                          | 変更前 | 変更後  |
| ----------------------------- | ------ | ------- |
| Rule-2 違反チャネル数         | 8      | 0       |
| `authHandlers.ts` ハンドラ数  | 5      | 7 (+2)  |
| `storeHandlers.ts` ハンドラ数 | 4      | 6 (+2)  |
| `agentHandlers.ts` ハンドラ数 | 9      | 13 (+4) |

## 追加された8チャネルの仕様

| チャネル                   | 方向          | 引数型                        | 戻り値型                                        | 制約                                                           |
| -------------------------- | ------------- | ----------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `auth:start-oauth-flow`    | Renderer→Main | `{ provider: OAuthProvider }` | `IPCResponse<void>`                             | authFlowOrchestrator 必須                                      |
| `auth:test-callback`       | Renderer→Main | `{ callbackUrl: string }`     | `IPCResponse<void>`                             | production / 未設定環境では FORBIDDEN                          |
| `settings:get`             | Renderer→Main | なし                          | `{ success: boolean; data?: UserSettings }`     | IPC Sender Validation 必須                                     |
| `settings:update`          | Renderer→Main | `Partial<UserSettings>`       | `{ success: boolean; settings?: UserSettings }` | IPC Sender Validation 必須 + object validation + shallow merge |
| `agent:get-skills`         | Renderer→Main | なし                          | `{ success: boolean; data?: unknown[] }`        | SkillService 未初期化時は空配列                                |
| `agent:get-skill-detail`   | Renderer→Main | `{ skillId: string }`         | `{ success: boolean; data?: unknown }`          | skillId 必須バリデーション                                     |
| `agent:execute`            | Renderer→Main | `AgentExecutionRequest`       | `{ success: boolean; executionId?: string }`    | prompt 必須バリデーション                                      |
| `agent:permission-respond` | Renderer→Main | `PermissionResponse`          | `{ success: boolean }`                          | requestId・approved 必須                                       |

## 新規型定義

`storeHandlers.ts` に追加:

```typescript
type UserSettings = Record<string, unknown>;
```

## registerAgentExecutionHandlers シグネチャ変更

```typescript
// 変更前
export function registerAgentExecutionHandlers(
  mainWindow: BrowserWindow,
  approvalGate: IApprovalGate,
  customRules?: PermissionRules,
  runtimePolicyResolver?: IRuntimePolicyResolver,
  authModeService?: IAuthModeService,
): void;

// 変更後（skillService 追加）
export function registerAgentExecutionHandlers(
  mainWindow: BrowserWindow,
  approvalGate: IApprovalGate,
  customRules?: PermissionRules,
  runtimePolicyResolver?: IRuntimePolicyResolver,
  authModeService?: IAuthModeService,
  skillService?: SkillService, // 追加
): void;
```
