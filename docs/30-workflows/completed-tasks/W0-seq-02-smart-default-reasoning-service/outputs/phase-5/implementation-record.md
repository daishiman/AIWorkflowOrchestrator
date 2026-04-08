# Phase 5: 実装記録 (Implementation Record)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| 機能名   | claude-sdk-permission-hooks-governance |
| Phase    | 5                                      |
| 作成日   | 2026-03-31                             |

---

## 1. 新規モジュール

### 1.1 SkillCreatorGovernancePolicy.ts

**パス**: `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts`

**責務**: Phase 別ポリシー定数の定義と `canUseTool` コールバックの生成

**エクスポート**:

| シンボル                     | 種別 | 説明                                                                                       |
| ---------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| `PHASE_POLICIES`             | 定数 | `Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy>` 4 phase 分の immutable policy |
| `getPolicyForPhase()`        | 関数 | phase を受け取り対応する `SkillCreatorSdkPolicy` を返す                                    |
| `createCanUseToolCallback()` | 関数 | phase と `skillTargetDir`（オプション）を受け取り、SDK `canUseTool` コールバックを返す     |

**ポリシー定義**:

| Phase   | permissionMode | allowedTools                        | disallowedTools |
| ------- | -------------- | ----------------------------------- | --------------- |
| plan    | `plan`         | Read, Glob, Grep, Bash              | Edit, Write     |
| execute | `acceptEdits`  | Read, Edit, Write, Glob, Grep, Bash | （なし）        |
| verify  | `plan`         | Read, Glob, Grep, Bash              | Edit, Write     |
| improve | `acceptEdits`  | Read, Edit, Glob, Grep              | Write           |

**canUseTool 判定フロー**:

1. `disallowedTools` に含まれるか確認 → 含まれていれば deny
2. `allowedTools` に含まれるか確認 → 含まれていなければ deny
3. execute/improve phase で Write/Edit の場合、`skillTargetDir` によるパス制限を適用
4. `file_path` または `path` プロパティの `startsWith` でパス判定
5. `file_path` 未指定時はパス制限を適用しない（fail-open）

### 1.2 GovernanceAuditSink.ts

**パス**: `apps/desktop/src/main/services/runtime/GovernanceAuditSink.ts`

**責務**: 監査イベントの蓄積、セッションサマリーの生成、UI 向けペイロードの構築

**エクスポート**:

| シンボル              | 種別   | 説明                                                         |
| --------------------- | ------ | ------------------------------------------------------------ |
| `GovernanceAuditSink` | クラス | イベント記録・クエリ・サマリー生成を担うインメモリ監査シンク |
| `createAuditEvent()`  | 関数   | `GovernanceAuditEvent` を生成するヘルパー関数                |

**GovernanceAuditSink メソッド**:

| メソッド                | 引数                             | 戻り値                            | 説明                                           |
| ----------------------- | -------------------------------- | --------------------------------- | ---------------------------------------------- |
| `record()`              | `GovernanceAuditEvent`           | `void`                            | イベントを蓄積。session_start 時にタイマー開始 |
| `getEvents()`           | なし                             | `readonly GovernanceAuditEvent[]` | 蓄積済み全イベントを返す                       |
| `getRecentDenials()`    | `limit?: number`                 | `GovernanceAuditEvent[]`          | tool_denied イベントの直近 N 件を返す          |
| `buildSessionSummary()` | `phase, sessionId?, provenance?` | `GovernanceSessionSummary`        | セッション統計サマリーを生成                   |
| `buildUiPayload()`      | `phase, sessionId?, provenance?` | `GovernanceUiPayload`             | UI 向けペイロードを生成                        |
| `clear()`               | なし                             | `void`                            | 全イベントをクリア（テスト用）                 |

### 1.3 GovernanceHooksFactory.ts

**パス**: `apps/desktop/src/main/services/runtime/GovernanceHooksFactory.ts`

**責務**: Phase 別の SDK Hooks セット（SessionStart / PreToolUse / PostToolUse / SessionEnd）の生成

**エクスポート**:

| シンボル                        | 種別             | 説明                                                                                |
| ------------------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| `GovernanceHooks`               | インターフェース | SDK hooks の型定義（4 hook メソッド）                                               |
| `GovernanceHooksFactoryOptions` | インターフェース | hooks 生成時のオプション（phase, sessionId, skillTargetDir, provenance, auditSink） |
| `createGovernanceHooks()`       | 関数             | options を受け取り `{ hooks, auditSink }` を返す factory                            |

**Hook 動作**:

| Hook           | 引数                                   | 戻り値               | 動作                                                                             |
| -------------- | -------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| onSessionStart | `{ sessionId? }`                       | `void`               | session_start イベント記録。metadata に policy 情報を含む                        |
| onPreToolUse   | `{ toolName, toolInput }`              | `{ allow, reason? }` | canUseTool で判定。allow → pre_tool_use 記録、deny → tool_denied 記録            |
| onPostToolUse  | `{ toolName, toolResult, durationMs }` | `void`               | post_tool_use イベント記録（durationMs 付き）                                    |
| onSessionEnd   | `{ sessionId? }`                       | `void`               | buildSessionSummary() でサマリー生成、session_end イベントに metadata として格納 |

---

## 2. 変更済みモジュール

### 2.1 skillCreator.ts（shared types）

**パス**: `packages/shared/src/types/skillCreator.ts`

**追加された型（9 型）**:

| 型名                                   | 種別       | 説明                                                                                                                 |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `SkillCreatorGovernancePhase`          | type alias | `"plan" \| "execute" \| "verify" \| "improve"`                                                                       |
| `SdkPermissionMode`                    | type alias | `"default" \| "acceptEdits" \| "bypassPermissions" \| "plan"`                                                        |
| `SkillCreatorSdkPolicy`                | interface  | phase 別ポリシー定義（phase, permissionMode, allowedTools, disallowedTools）                                         |
| `CanUseToolResult`                     | interface  | canUseTool 判定結果（allowed, reason?）                                                                              |
| `GovernanceAuditEventKind`             | type alias | `"session_start" \| "pre_tool_use" \| "post_tool_use" \| "tool_denied" \| "session_end"`                             |
| `GovernanceAuditEvent`                 | interface  | 監査ログ単位（timestamp, sessionId, phase, eventKind, toolName, decision, reason, durationMs, provenance, metadata） |
| `GovernanceSessionSummary`             | interface  | セッション統計サマリー（totalToolCalls, deniedToolCalls, allowedToolNames, deniedToolNames, durationMs）             |
| `GovernanceUiPayload`                  | interface  | UI 向け状態表示（phase, permissionMode, activePolicyToolCount, recentDenials, sessionSummary）                       |
| `SkillCreatorWorkflowSourceProvenance` | interface  | セッション provenance（既存型、governance 用途でも参照）                                                             |

### 2.2 index.ts（shared exports）

**パス**: `packages/shared/src/types/index.ts`

**変更内容**: 上記 9 型のうち、新規追加の 8 型をエクスポートに追加（`SkillCreatorWorkflowSourceProvenance` は既存エクスポート済み）。

### 2.3 RuntimeSkillCreatorFacade.ts

**パス**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**変更内容**:

| 変更箇所                         | 詳細                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| import 追加                      | `getPolicyForPhase`, `createGovernanceHooks`, `GovernanceAuditSink`, shared types           |
| `governanceAuditSink` プロパティ | `private readonly governanceAuditSink = new GovernanceAuditSink()` をクラスフィールドに追加 |
| `execute()` メソッド             | governance hooks 生成 → `onSessionStart` → SDK 実行 → `onSessionEnd`（成功/失敗両方）       |
| `getGovernanceUiPayload()`       | 新規メソッド。phase を受け取り `auditSink.buildUiPayload()` の結果を返す                    |
| `getGovernanceAuditEvents()`     | 新規メソッド。`auditSink.getEvents()` の結果を返す                                          |
| `resolveSkillTargetDir()`        | 新規 private メソッド。`$HOME/.claude/skills/<skillName>` パスを生成                        |

### 2.4 creatorHandlers.ts

**パス**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

**変更内容**: `skill-creator:get-governance` IPC ハンドラの追加。

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE,
  async (
    event,
    args: { phase: string },
  ): Promise<IpcResult<GovernanceUiPayload>> => {
    // validateSender → getGovernanceUiPayload() → IpcResult でラップ
  },
);
```

cleanup 関数に `ipcMain.removeHandler()` も追加済み。

### 2.5 skill-creator-api.ts

**パス**: `apps/desktop/src/preload/skill-creator-api.ts`

**変更内容**: `getGovernancePayload()` メソッドの追加。

```typescript
getGovernancePayload: (
  phase: SkillCreatorGovernancePhase,
) => Promise<IpcResult<GovernanceUiPayload>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE, { phase }),
```

### 2.6 channels.ts

**パス**: `apps/desktop/src/preload/channels.ts`

**変更内容**:

| 変更箇所                                | 詳細                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| `SKILL_CREATOR_GET_GOVERNANCE` チャネル | `"skill-creator:get-governance"` を `IPC_CHANNELS` に追加 |
| ホワイトリスト追加                      | `ALLOWED_INVOKE_CHANNELS` にチャネルを追加                |

---

## 3. テストファイル

### 3.1 SkillCreatorGovernancePolicy.test.ts

**パス**: `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorGovernancePolicy.test.ts`

| describe                           | テスト数 | 内容                                                              |
| ---------------------------------- | -------- | ----------------------------------------------------------------- |
| PHASE_POLICIES                     | 4        | plan/execute/verify/improve 各 phase のポリシー定数検証           |
| getPolicyForPhase                  | 4        | `it.each` で 4 phase の取得を検証                                 |
| createCanUseToolCallback (plan)    | 4        | Read 許可、Edit 拒否、Write 拒否、未知ツール拒否                  |
| createCanUseToolCallback (execute) | 2        | パス制限なし Write、パス制限あり Write（dir 内/外）               |
| createCanUseToolCallback (improve) | 5        | Edit 許可、Write 拒否、dir 内 Edit、dir 外 Edit、file_path 未指定 |
| createCanUseToolCallback (verify)  | 3        | Read 許可、Bash 許可、Edit 拒否                                   |

### 3.2 GovernanceAuditSink.test.ts

**パス**: `apps/desktop/src/main/services/runtime/__tests__/GovernanceAuditSink.test.ts`

| describe            | テスト数 | 内容                                  |
| ------------------- | -------- | ------------------------------------- |
| record / getEvents  | 2        | 単一イベント記録、複数イベント順序    |
| getRecentDenials    | 2        | denial フィルタ、limit による切り捨て |
| buildSessionSummary | 2        | 統計集計、空の場合のゼロ値            |
| buildUiPayload      | 1        | phase 対応ペイロード生成              |
| clear               | 1        | 全クリア                              |
| createAuditEvent    | 2        | 必須フィールド生成、オプション省略    |

### 3.3 GovernanceHooksFactory.test.ts

**パス**: `apps/desktop/src/main/services/runtime/__tests__/GovernanceHooksFactory.test.ts`

| describe               | テスト数 | 内容                                           |
| ---------------------- | -------- | ---------------------------------------------- |
| hooks 生成             | 2        | 4 hook 関数の存在、auditSink 自動生成          |
| onSessionStart         | 2        | session_start 記録、metadata に policy 情報    |
| onPreToolUse           | 4        | allow/deny 判定、pre_tool_use/tool_denied 記録 |
| onPostToolUse          | 1        | post_tool_use 記録（durationMs）               |
| onSessionEnd           | 1        | session_end にサマリー含む                     |
| hook 呼び出し順序      | 1        | Start → PreToolUse → PostToolUse → End 順検証  |
| execute phase パス制限 | 2        | dir 内許可、dir 外拒否                         |

---

## 4. 設計判断の記録

| 判断項目                               | 決定                                               | 理由                                                                   |
| -------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| canUseTool の file_path 未指定時の挙動 | 許可（fail-open）                                  | パス情報がない場合に拒否すると Read 等の正当な操作も拒否してしまうため |
| GovernanceAuditSink のインスタンス管理 | Facade のクラスフィールドとして保持                | セッション跨ぎで監査イベントを蓄積するため                             |
| IPC チャネルの追加                     | 既存の skill-creator チャネル群と同じパターン      | チャネル命名規約の一貫性を維持                                         |
| path プロパティの fallback             | `file_path` → `path` の順で参照                    | ツールによって異なるプロパティ名を使う可能性への対応                   |
| hooks の auditSink 未指定時            | 内部で新しい GovernanceAuditSink を自動生成        | 外部から inject できるが、デフォルトでも動作する設計                   |
| shared types への配置                  | `packages/shared/src/types/skillCreator.ts` に追記 | 既存の skill-creator 型定義と同一ファイルに集約                        |
