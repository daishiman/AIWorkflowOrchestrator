# 状態管理パターン（LLMConfigProvider・SkillCreator） / skill-creator specification
> 親ファイル: [arch-state-management-core.md](arch-state-management-core.md)

## LLMConfigProvider 状態管理変更（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001）

> 完了日: 2026-03-17

### GAP-03: DEFAULT_CONFIG fallback 廃止

**変更前の挙動**（廃止）:

```typescript
// ❌ 廃止前: 未選択時に暗黙的なデフォルトへ fallback していた
export async function getSelectedLLMConfig(): Promise<SelectedLLMConfig> {
  return currentConfig ?? DEFAULT_CONFIG; // DEFAULT_CONFIG = { providerId: "openai", modelId: "gpt-4o" }
}
```

**変更後の挙動**:

```typescript
// ✅ 現在: null を返す。呼び出し元が明示的にハンドリングする責務を持つ
export async function getSelectedLLMConfig(): Promise<SelectedLLMConfig | null> {
  return currentConfig; // 未設定時は null
}
```

### 状態管理への影響

| 項目 | 内容 |
| ---- | ---- |
| `currentConfig` | `SelectedLLMConfig \| null`（変更なし） |
| `getSelectedLLMConfig()` 戻り値 | `Promise<SelectedLLMConfig \| null>`（`null` が返る） |
| `aiHandlers.ts` の null チェック | `if (!llmConfig)` で LLM未選択エラーを返す（既存実装） |
| 暗黙 fallback | **廃止**。`setSelectedLLMConfig` 経由で明示的に設定が必要 |

### 設計判断の根拠

- 呼び出し元（`aiHandlers.ts`）に既に null チェックが存在していたため、`getSelectedLLMConfig()` 側の DEFAULT_CONFIG fallback は二重管理になっていた
- LLM 未選択時はエラーを返してユーザーに選択を促す UX が正しい（`api-ipc-system-core.md` の「未選択時の挙動」に準拠）
- DEFAULT_CONFIG の暗黙 fallback は設定画面での選択がスキップされる原因になっていた
---
## ChatPanel Real AI Chat 配線 状態管理拡張（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created）

> 完了日: 2026-03-18（設計タスク、spec_created）

### 概要

ChatPanel を placeholder から real AI chat 経路へ接続するため、既存 `chatSlice` を拡張し ChatPanelStatus（8状態）、AccessCapability（4値）、ストリーミング関連ステート/アクションを追加する設計を確定した。新規 Slice は追加しない（P31/P48 対策として個別セレクタパターンを適用）。

### chatSlice 拡張フィールド

| State フィールド | 型 | 配置先 | 備考 |
| --- | --- | --- | --- |
| `chatPanelStatus` | `ChatPanelStatus` | chatSlice | 8状態の状態機械 |
| `chatMessages` | `ChatMessage[]` | chatSlice | メッセージ一覧 |
| `chatError` | `string \| null` | chatSlice | Main Chat の non-streaming error banner 用。canonical error code または Main 由来の raw message string を保持 |
| `currentConversationId` | `string \| null` | chatSlice | 現在の会話ID |
| `streamingContent` | `string` | chatSlice | 既存維持 |
| `isStreaming` | `boolean` | chatSlice | 既存維持 |
| `streamingError` | `StreamingErrorState \| null` | `useWorkspaceChatController` | Workspace Chat の structured error state。`StreamingErrorDisplay` へ渡す |

### 型定義

```typescript
type ChatPanelStatus =
  | "idle"
  | "ready"
  | "streaming"
  | "cancelled"
  | "completed"
  | "error"
  | "blocked"
  | "handoff";

type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  conversationId: string;
}
```

### 個別セレクタ定義（P31/P48 対策）

`chatError` は `useChatError()` / `useClearChatError()` の個別セレクタで参照し、`ChatView` が alert surface と auto clear timer を担当する。`streamingError` と selector を共有しないことで、non-streaming failure と streaming failure の責務を分離する。

| セレクタ名 | 戻り値型 | 用途 |
| --- | --- | --- |
| `useChatError` | `string \| null` | chatError エラーコード取得 |
| `useClearChatError` | `() => void` | chatError クリアアクション |
| `useChatPanelStatus` | `ChatPanelStatus` | ChatPanel の現在の状態 |
| `useResolvedCapability` | `AccessCapability` | runtime capability の解決結果 |
| `useChatMessages` | `ChatMessage[]`（useShallow 適用 — P48） | メッセージ一覧 |
| `useChatInput` | `string` | 入力テキスト |
| `useSetChatInput` | `(input: string) => void` | 入力テキスト更新 |
| `useSelectedProviderId` | `string \| null` | 選択中プロバイダID |
| `useSelectedModelId` | `string \| null` | 選択中モデルID |
| `useProviders` | `Provider[]`（useShallow 適用 — P48） | プロバイダ一覧 |
| `useHandoffGuidance` | `HandoffGuidance \| null` | terminal handoff ガイダンス |
| `useIsStreaming` | `boolean` | ストリーミング中フラグ |
| `useSetChatPanelStatus` | `(status: ChatPanelStatus) => void` | 状態更新アクション |
| `useResetChat` | `() => void` | チャットリセットアクション |

### 状態遷移

```
[*] --> idle
idle --> ready: capability ok (API key configured)
idle --> blocked: no capability (API key missing)
ready --> streaming: user sends message
streaming --> completed: done signal
streaming --> error: error signal
streaming --> cancelled: user cancels
completed --> ready: reset for next message
cancelled --> ready: reset for next message
error --> ready: user dismisses / retry
blocked --> ready: API key configured
ready --> handoff: terminal-handoff button clicked
handoff --> ready: return from terminal
```

### 設計判断

- 新規 Slice: **不要**。既存 `chatSlice` を拡張する方針とする
- Store 統一: `useStreamingChat` 内の `useStore()` を `useAppStore()` に統一する
- P62 対策: Provider/Model 未選択時は `blocked` 状態に遷移し、暗黙 fallback を行わない
- silent fallback 禁止: capability 不足時は `HandoffBlock` + `ErrorGuidance` で明示的にユーザーに通知する

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | ChatPanel の実 AI チャット配線（設計） | **spec_created**（2026-03-18） |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 | Main Chat/Settings AI runtime 同期 | **完了**（2026-03-17） |
---
## 公開・配布状態管理設計（TASK-SKILL-LIFECYCLE-08 / spec_created）

TASK-SKILL-LIFECYCLE-08 では publish/distribution 領域の store 責務を設計済み（実装未着手）。

### publishingSlice 境界

| 状態 | 所有者 | 補足 |
| --- | --- | --- |
| `visibilityFilter` | `publishingSlice` | `"all" | SkillVisibility` で一覧フィルタを制御 |
| `publishReadiness` | `publishingSlice` | `auto-approved` 等の公開判定結果を保持 |
| `compatibilityResult` | `publishingSlice` | version 更新時の互換性評価結果を保持 |
| `publishDialogState` | `publishingSlice` | register/check/confirm の3ステップ進行状態 |

### state 不変条件

- `visibilityFilter` の初期値は `"all"`。
- `publishReadiness.status === "blocked"` のとき confirm アクションを禁止する。
- `compatibilityResult.level === "breaking"` かつ major バンプなしは confirm 不可。

### 実装移行の未タスク
- `UT-SKILL-LIFECYCLE-08-TYPE-IMPL`
- `UT-SKILL-LIFECYCLE-08-UI-IMPL`

---

## SkillExecutionStatus 拡張状態の配置ルール（UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001）

UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 で、SkillExecutionStatus 型へ `review` / `improve_ready` / `reuse_ready` を実装済み状態として同期した。

### 新規追加状態

| 状態            | 配置先             | 理由                                         |
| --------------- | ------------------ | -------------------------------------------- |
| `review`        | Zustand agentSlice | executionStatus フィールドの値として管理      |
| `improve_ready` | Zustand agentSlice | executionStatus フィールドの値として管理      |
| `reuse_ready`   | Zustand agentSlice | executionStatus フィールドの値として管理      |

### 配置根拠

- 既存の `executionStatus: SkillExecutionStatus | null` フィールド（agentSlice）の値域拡張
- 新規 Slice は不要（同一フィールドの値追加のため）
- 既存セレクタ `useSkillExecutionStatus()` がそのまま使用可能

### セレクタ設計

- P48 対策: 派生セレクタで `.filter()` を使う場合は `useShallow` を適用
- P31 対策: 合成 Hook ではなく個別セレクタを使用

> **実装照合済み（2026-03-20）**: `packages/shared/src/types/skill.ts` と `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` で同じ値域が使われていることを確認済み。

---

## Slide Modifier / Manual Fallback 状態管理設計（TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 / spec_created）

> 設計完了日: 2026-03-23（spec_created、プロダクションコード実装は未着手）

### 概要

Slide 機能における Modifier 操作と Manual Fallback の整合設計を確定した。`SlideUIStatus`（4値）・`SlideLane`（2値）・`SlideCapabilityDTO` の型契約を定義し、禁止遷移4件を明文化する。新規 Slice は追加しない（既存 `agentSlice` / `chatSlice` の拡張で対応）。

### 型定義

```typescript
type SlideUIStatus =
  | "synced"    // AI と手動の状態が一致している
  | "running"   // Modifier による変換処理中
  | "degraded"  // Modifier 失敗 / agent-client 到達不可
  | "guidance"; // Manual Fallback ガイダンス表示中

type SlideLane =
  | "integrated" // Integrated Runtime 経由（AI Modifier 使用可）
  | "manual";    // Manual Lane（ユーザー手動操作のみ）

interface SlideCapabilityDTO {
  laneType: SlideLane;
  modifier: SlideModifierRef | null;       // integrated 時のみ非 null
  agentClient: AgentClientRef | null;      // integrated 時のみ非 null
  fallbackReason: string | null;           // degraded / guidance 時のみ非 null
  guidance: HandoffGuidance | null;        // guidance 状態時のみ非 null
}
```

### 禁止遷移（4件）

| ID | 禁止遷移 | 理由 |
| --- | --- | --- |
| FT-1 | `integrated` → `manual` の自動格下げ | ユーザーの明示的操作なしに lane を変更すると暗黙 fallback（P62 再発）になる |
| FT-2 | `guidance` 状態中の `modifier` 呼び出し | guidance 表示中は AI 操作を受け付けない（Manual Boundary MB-1 準拠） |
| FT-3 | `degraded` 状態中の `agentClient` 呼び出し | agent-client が到達不可のまま呼び出すと silent failure になる |
| FT-4 | `synced` 状態時の `fallbackReason` 設定 | synced = 正常状態であり fallback 理由が共存してはならない |

### 状態遷移

```
[*] --> synced
synced --> running: Modifier 実行開始
running --> synced: Modifier 完了（AI と手動が再一致）
running --> degraded: Modifier 失敗 / agent-client 到達不可
degraded --> guidance: ユーザーが Manual Fallback を選択
degraded --> running: 再試行（明示的ユーザー操作）
guidance --> synced: Manual 操作完了後に AI 同期
guidance --> degraded: Manual 操作キャンセル
```

### IPC チャネル設計（slide:sync:* / 暫定）

| チャネル | 方向 | 用途 |
| --- | --- | --- |
| `slide:sync:status` | Main → Renderer | SlideUIStatus の push 通知 |
| `slide:sync:capability` | Renderer → Main | SlideCapabilityDTO の取得 |
| `slide:sync:fallback` | Renderer → Main | Manual Fallback への明示的遷移要求 |

> **注意**: `slide:sync:*` は暫定 namespace。`slide:*` への canonical 統一は UT-SLIDE-TASK09-IPC-NAMESPACE-001 で対応予定。

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 | 本設計タスク | **spec_created**（2026-03-23） |
| UT-SLIDE-IMPL-001 | Modifier / agent-client 実装 | 未着手（HIGH） |
| UT-SLIDE-UI-001 | SlideWorkspace UI 4領域実装 | 未着手（HIGH） |
| UT-SLIDE-P31-001 | P31/P48 無限ループ対策実装 | 未着手（MEDIUM） |
| UT-SLIDE-HANDOFF-DUP-001 | terminal handoff 重複解消 | 未着手（MEDIUM） |
| UT-SLIDE-TASK09-IPC-NAMESPACE-001 | slide:sync:* legacy IPC channel の namespace 統一 | 未着手（MEDIUM） |

---

## LLM Generation State 配置ルール（TASK-SC-06-UI-RUNTIME-CONNECTION / TASK-SC-07 current facts）

> 完了日: 2026-04-09

### 概要

SkillLifecyclePanel と SkillCreateWizard の両方が `agentSlice` の LLM Generation 状態を共有する。  
新規 Slice は追加せず、既存 `agentSlice` を拡張する判断を継続する。  
TASK-SC-07 では、`SkillCreateWizard` 側で `generationMode` / `llmDescription` / `localPlanResult` を追加し、`planSkill` → `executePlan(planId, skillSpec)` → `getWorkflowState(planId)` の current facts を運用する。

### 追加状態フィールド（agentSlice）

| フィールド | 型 | 初期値 | 用途 |
| --- | --- | --- | --- |
| `isGenerating` | `boolean` | `false` | LLM 生成中フラグ（二重実行ガード） |
| `generationProgress` | `string \| null` | `null` | 進捗メッセージ表示用 |
| `generationError` | `string \| null` | `null` | 生成エラー表示用 |
| `currentPlanId` | `string \| null` | `null` | 実行中プランの ID |
| `currentPlanResult` | `PlanResult \| null` | `null` | プラン結果（Store 側、Hybrid State Pattern の片翼） |

### PlanResult 型

```typescript
interface PlanResult {
  type: "integrated_api" | "terminal_handoff";
  planId?: string;
  estimatedSteps?: number;
  skillSpec?: string;
  guidance?: { reason: string; terminalCommand: string };
}
```

### アクション（6件）

| アクション | 引数 | 用途 |
| --- | --- | --- |
| `setIsGenerating` | `boolean` | 生成開始/終了の切替 |
| `setGenerationProgress` | `string \| null` | 進捗メッセージ更新 |
| `setGenerationError` | `string \| null` | エラー設定/クリア |
| `setCurrentPlanId` | `string \| null` | プラン ID 設定 |
| `setCurrentPlanResult` | `PlanResult \| null` | プラン結果設定 |
| `clearGenerationState` | なし | 全5フィールドを初期値にリセット |

### 個別セレクタ（11件）

| セレクタ | 返却型 |
| --- | --- |
| `useIsSkillGenerating` | `boolean` |
| `useGenerationProgress` | `string \| null` |
| `useGenerationError` | `string \| null` |
| `useCurrentPlanId` | `string \| null` |
| `useCurrentPlanResult` | `PlanResult \| null` |
| `useSetIsSkillGenerating` | `(v: boolean) => void` |
| `useSetGenerationProgress` | `(v: string \| null) => void` |
| `useSetGenerationError` | `(v: string \| null) => void` |
| `useSetCurrentPlanId` | `(v: string \| null) => void` |
| `useSetCurrentPlanResult` | `(v: PlanResult \| null) => void` |
| `useClearGenerationState` | `() => void` |

### Hybrid State Pattern

SkillLifecyclePanel / SkillCreateWizard では `useState`（ローカル）と Zustand Store を併用する:

```typescript
const activePlanResult = localPlanResult ?? storePlanResult;
```

- **ローカル（useState）**: 即時 UI 反映用
- **Store（Zustand）**: クロスコンポーネント共有用
- **優先順位**: ローカル > Store（nullish coalescing）

### 配置判断の根拠

| 選択肢 | 判断 | 理由 |
| --- | --- | --- |
| agentSlice 拡張 | **採用** | スキル作成ドメインの凝集性を維持 |
| generationSlice 新設 | 却下（後続検討） | 現時点では state 量が分割規模に達しない |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-SC-06-UI-RUNTIME-CONNECTION | SkillLifecyclePanel → RuntimeSkillCreatorFacade plan/execute フロー接続 | **完了**（2026-03-24） |
| TASK-SC-07 | SkillCreateWizard LLM / template 併用フロー接続 | **完了**（2026-04-09） |
| TASK-SC-10 | agentSlice LLM Generation state を generationSlice に分割 | 未着手（LOW） |
| TASK-SC-12 | Hybrid State Pattern ガイドドキュメント化 | 未着手（LOW） |

#### TASK-SC-07 SkillCreateWizard current facts

| 項目 | current facts |
| --- | --- |
| Step 0 正本 | `SkillInfoStep` |
| deprecated file | `DescribeStep.tsx` は互換維持用 |
| モード state | `generationMode: "template" \| "llm"` |
| LLM 入力 | `llmDescription` |
| 計画結果の保持 | `localPlanResult` + `currentPlanResult` |
| 実行時の正本 | `PlanResult.skillSpec` |
| 成功時の確認 | `getWorkflowState(planId)` の snapshot 再読込 |
| キャンセル時 | `setLocalPlanResult(null)` + `clearGenerationState()` |


## Workflow Snapshot State 配置ルール（TASK-SDK-04）

> 実装同期: 2026-03-27

### 概要

Task04 では plan result に加えて runtime workflow snapshot を Renderer が参照する必要が生じたが、新規 slice は作らず `agentSlice` に近接状態として保持する。owner は Main runtime にあり、Store は cache と error surface のみを持つ。

### 追加状態

| フィールド | 型 | 役割 |
| --- | --- | --- |
| `workflowSnapshot` | `SkillCreatorWorkflowUiSnapshot \| null` | Main owner から受け取った current snapshot cache |
| `workflowError` | `string \| null` | snapshot 取得/購読失敗時の UI surface |

### 境界ルール

| 項目 | 契約 |
| --- | --- |
| source of truth | `SkillCreatorWorkflowEngine` が phase / awaitingUserInput / verifyResult の owner |
| Store 役割 | cache と error 表示に限定し、phase を再計算しない |
| Renderer local state | textarea draft や選択中 option など一時 UI 入力だけを保持する |
| push event | `skill-creator:workflow-state-changed` を受けたら cache を置換する |

### known gap

| ID | 内容 |
| --- | --- |
| `TASK-SDK-04-U1` | `submitUserInput()` 後の phase semantics が engine owner に実装されていない |

### completed remediation

| ID | 完了日 | 内容 |
| --- | --- | --- |
| `TASK-SDK-04-U2` | 2026-03-28 | Renderer local state を textarea draft と approved snapshot に分離し、execute は `approvedSkillSpec` のみを参照するよう是正 |
