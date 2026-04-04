# Phase 5: 実装記録 (Implementation Record)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 5                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. 新規作成ファイル

### 1.1 SkillCreatorPermissionPolicy.ts

- **パス**: `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`
- **責務**: Phase 別 tool policy 定義と canUseTool 判定
- **主要エクスポート**:
  - `getPolicy(phase)` -- 指定 phase の `SkillCreatorSdkPolicy` を返す
  - `canUseTool(toolName, phase, context?)` -- tool 利用可否を判定し `SkillCreatorToolDecision` を返す
  - `getAllPolicies()` -- 全 phase の policy テーブルを返す（UI/テスト向け）
- **設計ポイント**:
  - `POLICY_TABLE` を `Object.freeze` で保護し、実行時改変を防止
  - `READ_TOOLS`, `WRITE_TOOLS`, `IMPROVE_TOOLS`, `TEST_TOOLS`, `DESTRUCTIVE_TOOLS` の定数配列で policy を構成
  - `evaluateContextPolicy()` で execute/improve phase のパス制約チェックを実装
  - `bypassPermissions` は policy テーブルに含めず、使用不可を構造的に保証

### 1.2 SkillCreatorHooksFactory.ts

- **パス**: `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`
- **責務**: Phase 別 Hooks handler の生成
- **主要エクスポート**:
  - `createHooks(phase, auditSink, provenance?)` -- 4 つの hook handler を持つ `SkillCreatorHooks` オブジェクトを返す
  - `SkillCreatorHooks` interface -- onSessionStart / onPreToolUse / onPostToolUse / onSessionEnd
- **設計ポイント**:
  - hooks は監査専用であり、主処理（plan/execute/verify/improve）のロジックを固定化しない
  - `onPreToolUse` は `canUseTool()` を呼び出して policy 判定を行い、結果を audit に記録
  - session 固有の provenance がファクトリ provenance を上書き可能
  - `.claude/skills/skill-creator/` の動的読込に一切介入しない

### 1.3 SkillCreatorAuditSink.ts

- **パス**: `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`
- **責務**: Governance 監査イベントの一元収集・保持
- **主要エクスポート**:
  - `SkillCreatorAuditSink` class
    - `record(event)` -- 生イベントを記録
    - `recordEvent(params)` -- 構造化パラメータから timestamp 自動生成して記録
    - `getEvents()` -- 全イベントの read-only コピーを返す
    - `getRecentEvents(count)` -- 直近 N 件を返す
    - `getEventsBySession(sessionId)` -- session フィルタ
    - `getDenialEvents()` -- denied イベントのみ
    - `clear()` -- 全クリア
    - `size` getter -- 現在のイベント数
- **設計ポイント**:
  - `maxEvents` (デフォルト 500) でメモリ上限を保護。超過時は古いイベントから切り捨て
  - main プロセスで singleton として管理し、renderer は IPC 経由で read-only 参照
  - インメモリ配列による初回実装。永続化は将来スコープ

### 1.4 index.ts

- **パス**: `apps/desktop/src/main/services/runtime/governance/index.ts`
- **責務**: Governance モジュールのバレルエクスポート
- **エクスポート内容**:
  - `getPolicy`, `canUseTool`, `getAllPolicies` (from PermissionPolicy)
  - `SkillCreatorAuditSink` (from AuditSink)
  - `createHooks`, `SkillCreatorHooks` type (from HooksFactory)

---

## 2. 変更ファイル

### 2.1 packages/shared/src/types/skillCreator.ts

- **変更内容**: 6 つの governance 関連型を追加
- **追加された型**:
  1. `SkillCreatorGovernancePhase` -- `"plan" | "execute" | "verify" | "improve"`
  2. `SkillCreatorSdkPolicy` -- phase / permissionMode / allowedTools / disallowedTools
  3. `SkillCreatorToolDecision` -- allowed / reason / phase / toolName
  4. `SkillCreatorHookEventType` -- `"session_start" | "pre_tool_use" | "post_tool_use" | "session_end"`
  5. `SkillCreatorGovernanceAuditEvent` -- eventType / timestamp / sessionId / phase / toolName / decision / provenance / metadata
  6. `SkillCreatorGovernanceState` -- phase / activePolicy / recentAuditEvents / recentDenials

### 2.2 packages/shared/src/types/index.ts

- **変更内容**: 新規 governance 型のエクスポートを追加
- **追加されたエクスポート**:
  - `SkillCreatorGovernancePhase`
  - `SkillCreatorGovernanceAuditEvent`
  - `SkillCreatorGovernanceState`

### 2.3 apps/desktop/src/preload/channels.ts

- **変更内容**: `SKILL_CREATOR_GET_GOVERNANCE_STATE` IPC channel を追加
- **channel 値**: `"skill-creator:get-governance-state"`
- **ALLOWED_INVOKE_CHANNELS への登録**: 追加済み

### 2.4 apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

- **変更内容**: Governance hooks を plan/execute/improve に統合
- **主な変更箇所**:
  - governance モジュールからの import 追加 (`getPolicy`, `canUseTool`, `createHooks`, `SkillCreatorAuditSink` 等)
  - `SkillCreatorGovernancePhase`, `SkillCreatorGovernanceState` 型の import
  - `currentGovernancePhase` プロパティ追加
  - `getGovernanceState()` メソッド追加 -- 現在の governance 状態を返す
  - `createGovernanceHooks(phase)` プライベートメソッド追加
  - `plan()` メソッド: `createGovernanceHooks("plan")` で hooks 生成、onSessionStart/onSessionEnd 呼び出し
  - `execute()` メソッド: `createGovernanceHooks("execute")` で hooks 生成、onSessionStart/onSessionEnd 呼び出し
  - `improve()` メソッド: `createGovernanceHooks("improve")` で hooks 生成、onSessionStart/onSessionEnd 呼び出し
- **既存ロジックへの影響**: なし。hooks は wrap として追加されるのみ

### 2.5 apps/desktop/src/main/ipc/creatorHandlers.ts

- **変更内容**: Governance state IPC handler を追加
- **追加された handler**:
  - `IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE` -- Facade の `getGovernanceState()` を呼び出し、結果を返す
- **cleanup への登録**: `ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE)` 追加済み

### 2.6 apps/desktop/src/preload/skill-creator-api.ts

- **変更内容**: `getGovernanceState()` API メソッドを追加
- **メソッドシグネチャ**: `getGovernanceState: () => Promise<IpcResult<SkillCreatorGovernanceState>>`
- **動作**: `ipcRenderer.invoke(IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE)` を呼び出し

### 2.7 apps/desktop/src/main/ipc/**tests**/creatorHandlers.test.ts

- **変更内容**: handler 登録数の期待値を 9 → 10 に更新（governance state handler の追加分）

### 2.8 apps/desktop/src/preload/**tests**/skill-creator-api.governance.test.ts

- **変更内容**: Governance テストケース更新
- **追加テスト**: `SKILL_CREATOR_GET_GOVERNANCE_STATE` が `ALLOWED_INVOKE_CHANNELS` に含まれることの検証

---

## 3. 既存テスト回帰確認

- governance 新規ファイルと型追加は既存のテストに干渉しない
- `RuntimeSkillCreatorFacade` の既存メソッド（plan/execute/improve）のロジック本体は変更なし
- Facade の governance hooks は optional wrap であり、hooks が null の場合は既存動作を維持
- `creatorHandlers.ts` の handler 数テストのみ 9 → 10 に更新

---

## 4. baseline 確認結果

| 確認項目           | 結果                                                       |
| ------------------ | ---------------------------------------------------------- |
| 新規ファイル数     | 4 (governance/ 配下)                                       |
| 変更ファイル数     | 8                                                          |
| 型追加数           | 6 (shared/types/skillCreator.ts)                           |
| IPC channel 追加数 | 1 (SKILL_CREATOR_GET_GOVERNANCE_STATE)                     |
| 既存テスト回帰     | なし                                                       |
| 動的 skill-creator | 維持（AC-6 準拠）                                          |
| bypassPermissions  | 未使用（policy テーブルに "default" / "acceptEdits" のみ） |

---

## 5. 完了チェック

- [x] policy module が実装されている (SkillCreatorPermissionPolicy.ts)
- [x] hooks factory が実装されている (SkillCreatorHooksFactory.ts)
- [x] audit sink が実装されている (SkillCreatorAuditSink.ts)
- [x] governance module exports が整備されている (index.ts)
- [x] 共有型が定義されている (skillCreator.ts に 6 型追加)
- [x] IPC channel が追加されている (SKILL_CREATOR_GET_GOVERNANCE_STATE)
- [x] Facade に governance hooks が統合されている
- [x] Preload API に getGovernanceState() が追加されている
- [x] 既存テストの回帰がないことを確認済み
