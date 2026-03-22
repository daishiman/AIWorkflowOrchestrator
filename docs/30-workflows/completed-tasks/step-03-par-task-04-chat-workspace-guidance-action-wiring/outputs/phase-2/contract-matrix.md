# Phase 2: 契約マトリクス - Contract Matrix

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 2                                                  |
| 作成日   | 2026-03-22                                         |

## 1. State Ownership

| state / data       | owner                        | consumer                                | 更新トリガー          |
| ------------------ | ---------------------------- | --------------------------------------- | --------------------- |
| blockedReason      | RuntimePolicyResolver (Main) | ChatView, WorkspaceChatPanel (Renderer) | policy 再評価時       |
| selectedProviderId | LLMSlice (Store)             | useBlockedGuidance, LLMGuidanceBanner   | ユーザー選択          |
| selectedModelId    | LLMSlice (Store)             | useBlockedGuidance, sendMessage guard   | ユーザー選択          |
| GuidanceConfig     | BLOCKED_GUIDANCE_MAP (const) | useBlockedGuidance Hook                 | コンパイル時（定数）  |
| HandoffGuidance    | RuntimePolicyResolver (Main) | WorkspaceChatPanel (handoff variant)    | policy handoff 判定時 |
| currentView        | Navigation state (App)       | setCurrentView callback                 | CTA クリック          |
| terminalDockState  | Terminal Surface (future)    | openTerminal handler                    | CTA クリック          |
| clipboard          | Browser API                  | copyCommand handler                     | CTA クリック          |

## 2. Action Ownership

| action            | trigger source          | handler owner         | side effect                        |
| ----------------- | ----------------------- | --------------------- | ---------------------------------- |
| navigate-settings | GuidanceBlock CTA click | App navigation        | setCurrentView("settings")         |
| open-terminal     | GuidanceBlock CTA click | Terminal launcher     | terminal dock を開く (Task06)      |
| copy-command      | GuidanceBlock CTA click | Browser clipboard API | navigator.clipboard.writeText(cmd) |
| retry-connection  | GuidanceBlock CTA click | Health check service  | IPC: health:check (future)         |

## 3. Surface 間の responsibility boundary

| responsibility       | ChatView               | WorkspaceChatPanel     | GuidanceBlock     |
| -------------------- | ---------------------- | ---------------------- | ----------------- |
| blocked reason 判定  | policy DTO 消費        | policy DTO 消費        | props 受取のみ    |
| guidance config 取得 | useBlockedGuidance     | useBlockedGuidance     | props 受取のみ    |
| CTA dispatch         | createGuidanceAction.. | createGuidanceAction.. | onAction callback |
| メッセージテキスト   | BLOCKED_GUIDANCE_MAP   | BLOCKED_GUIDANCE_MAP   | props.message     |
| variant 決定         | GuidanceConfig.variant | GuidanceConfig.variant | props.variant     |
| local runtime 判定   | 禁止（AC-2）           | 禁止（AC-2）           | 対象外            |

## 4. DTO shape 契約

### 4.1 policy DTO (Main -> Renderer)

```typescript
// RuntimePolicy の resolve 結果（Task02 で定義済み）
type RuntimePolicyResult =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string; guidance: HandoffGuidance }
  | { type: "blocked"; reason: BlockedReason };
```

### 4.2 HandoffGuidance (Main -> Renderer)

```typescript
interface HandoffGuidance {
  reason: string; // "subscription-active" | "api-key-missing" など
  terminalCommand: string; // `claude --workspace ~/path`
  contextSummary: string; // workspace context 要約
}
```

### 4.3 GuidanceConfig (Renderer 内部)

```typescript
interface GuidanceConfig {
  message: string;
  variant: "blocked" | "error" | "handoff";
  primaryAction: { type: GuidanceActionType; label: string };
  secondaryAction: { type: GuidanceActionType; label: string };
}
```

## 5. 禁止事項一覧

| ID   | 禁止事項                                          | 関連 AC | 関連 Pitfall |
| ---- | ------------------------------------------------- | ------- | ------------ |
| D-01 | surface 内での local runtime 判定                 | AC-2    | -            |
| D-02 | BLOCKED_GUIDANCE_MAP 外でのメッセージ定義         | AC-1    | G-02, G-10   |
| D-03 | DEFAULT_CONFIG への silent fallback               | AC-4    | P62          |
| D-04 | no-op onAction ハンドラ                           | AC-4    | -            |
| D-05 | blocked/guidance-only 時の retry primary CTA      | AC-4    | -            |
| D-06 | useEffect 依存配列への合成 Hook 戻り値            | -       | P31          |
| D-07 | .filter()/.map() 派生セレクタの useShallow 未適用 | -       | P48          |
