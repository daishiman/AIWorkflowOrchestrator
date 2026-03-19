# ChatPanel Real Chat Wiring - System Spec Research Report

> Researcher: spec-researcher
> Date: 2026-03-17
> Sources: `.claude/skills/aiworkflow-requirements/references/`

---

## 1. ChatPanel 関連 型定義・インターフェース

### 1.1 LLM Chat Request/Response (llm-ipc-types.md)

#### AIChatRequest

| Field          | Type          | Required | Description                                |
| -------------- | ------------- | -------- | ------------------------------------------ |
| message        | string        | Yes      | User message                               |
| systemPrompt   | string        | No       | System prompt                              |
| ragEnabled     | boolean       | Yes      | RAG enabled flag                           |
| conversationId | string        | No       | Existing conversation ID                   |
| providerId     | LLMProviderId | No       | Explicit provider (must pair with modelId) |
| modelId        | string        | No       | Explicit model (must pair with providerId) |

**Validation rules**:

- `providerId` and `modelId` must be set together (partial is error)
- Empty / trim-empty strings are rejected (P42 3-step validation)
- Allowed `providerId`: `"openai" | "anthropic" | "google" | "xai"`

#### AIChatResponse

| Field               | Type     | Description                        |
| ------------------- | -------- | ---------------------------------- |
| success             | boolean  | Success flag                       |
| data.message        | string   | AI response                        |
| data.conversationId | string   | Conversation ID                    |
| data.ragSources     | string[] | RAG source paths (optional)        |
| error               | string   | Error message (when success=false) |

#### Provider/Model 解決順 (AI_CHAT)

| Priority | Condition                                           | Resolution                                              |
| -------- | --------------------------------------------------- | ------------------------------------------------------- |
| 1        | `AIChatRequest.providerId` + `modelId` both present | Use request values                                      |
| 2        | Request has no provider/model                       | Use Main-side selected config (`setSelectedLLMConfig`)  |
| 3        | Neither set                                         | Return error (LLM not selected) -- NO implicit fallback |

### 1.2 Streaming Types (llm-streaming.md)

#### StreamChunk

| Field   | Type                             | Required | Description                 |
| ------- | -------------------------------- | -------- | --------------------------- |
| type    | `"content" \| "error" \| "done"` | Yes      | Chunk type                  |
| content | string                           | No       | Text content (type=content) |
| error   | LLMError                         | No       | Error info (type=error)     |

#### StreamingState

| Field              | Type            | Description           |
| ------------------ | --------------- | --------------------- |
| isStreaming        | boolean         | Streaming in progress |
| streamId           | string          | Stream ID             |
| accumulatedContent | string          | Accumulated content   |
| abortController    | AbortController | Cancel controller     |

#### ChatMessage

| Field       | Type                    | Description               |
| ----------- | ----------------------- | ------------------------- |
| id          | string                  | Message ID                |
| role        | `"user" \| "assistant"` | Sender                    |
| content     | string                  | Message content           |
| timestamp   | Date                    | Send time                 |
| isStreaming | boolean                 | Streaming flag (optional) |

### 1.3 LLM Error Types (llm-ipc-types.md)

#### LLMErrorCode (10 values)

`API_KEY_MISSING`, `API_KEY_INVALID`, `NETWORK_ERROR`, `TIMEOUT`, `RATE_LIMIT`, `CONTEXT_LENGTH_EXCEEDED`, `CONTENT_FILTER`, `MODEL_NOT_FOUND`, `SERVICE_UNAVAILABLE`, `UNKNOWN`

#### LLMError

| Field        | Type         | Required | Description          |
| ------------ | ------------ | -------- | -------------------- |
| code         | LLMErrorCode | Yes      | Error code           |
| message      | string       | Yes      | Error message        |
| details      | Record       | No       | Additional details   |
| retryable    | boolean      | Yes      | Is retryable         |
| retryAfterMs | number       | No       | Retry wait time (ms) |

### 1.4 Conversation Types (api-ipc-system-core.md)

#### ConversationSummary / Conversation / Message

Used by `conversation:*` IPC channels. Key fields:

- `conversation:create`: `{ userId, title }` -> `Conversation`
- `conversation:addMessage`: `{ sessionId, message: { role, content } }` -> `Message`

### 1.5 HealthCheck Types (llm-ipc-types.md)

#### HealthCheckResult

| Field        | Type                                       | Required | Description       |
| ------------ | ------------------------------------------ | -------- | ----------------- |
| providerId   | LLMProviderId                              | Yes      | Provider ID       |
| status       | `"connected" \| "disconnected" \| "error"` | Yes      | Connection status |
| latency      | number                                     | No       | Latency (ms)      |
| checkedAt    | Date                                       | Yes      | Check time        |
| errorMessage | string                                     | No       | Error message     |

### 1.6 Workspace Chat Panel Types (ui-ux-feature-components-details.md)

#### WorkspaceChatPanel component hierarchy

| Component                  | Type     | Role                                             |
| -------------------------- | -------- | ------------------------------------------------ |
| WorkspaceChatPanel         | organism | Zero state / log / chips / input integration     |
| WorkspaceChatMessageList   | molecule | user/assistant/streaming display                 |
| WorkspaceFileContextChips  | molecule | Attached context display/removal                 |
| WorkspaceChatInput         | molecule | Send / mention / cancel / error display          |
| WorkspaceMentionDropdown   | molecule | `@mention` candidate list                        |
| WorkspaceSuggestionBubbles | molecule | Initial suggestion bubbles                       |
| useWorkspaceChatController | hook     | stream / conversation / mention / attach control |

### 1.7 RuntimeResolution Types (llm-workspace-chat-edit.md)

```
type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };
```

#### Resolution Table

| authMode     | hasApiKey | Result     | reason                         |
| ------------ | --------- | ---------- | ------------------------------ |
| subscription | any       | handoff    | subscription mode              |
| api-key      | true      | integrated | (AnthropicLLMAdapter returned) |
| api-key      | false     | handoff    | API key not configured         |

### 1.8 HandoffGuidance (interfaces-llm.md)

```
interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

### 1.9 SendWithContextRequest/Response (llm-workspace-chat-edit.md)

| Field                                   | Type            | Change              |
| --------------------------------------- | --------------- | ------------------- |
| `SendWithContextRequest.workspacePath?` | string          | Added (optional)    |
| `SendWithContextRequest.message`        | string?         | Changed to optional |
| `SendWithContextResponse.handoff?`      | boolean         | Added (optional)    |
| `SendWithContextResponse.guidance?`     | HandoffGuidance | Added (optional)    |

---

## 2. IPC Channel 契約

### 2.1 AI Chat Channels (api-ipc-system-core.md)

| Channel               | Direction        | Request        | Response                  | Implementation                          |
| --------------------- | ---------------- | -------------- | ------------------------- | --------------------------------------- |
| `AI_CHAT`             | Renderer -> Main | AIChatRequest  | AIChatResponse            | aiHandlers.ts:21-182                    |
| `AI_CHECK_CONNECTION` | Renderer -> Main | none           | AICheckConnectionResponse | **Legacy (retained for compatibility)** |
| `AI_INDEX`            | Renderer -> Main | AIIndexRequest | AIIndexResponse           | aiHandlers.ts:208-235                   |

### 2.2 LLM Channels (llm-ipc-types.md)

| Channel                   | Method  | Input                     | Output                                 | Description                         |
| ------------------------- | ------- | ------------------------- | -------------------------------------- | ----------------------------------- |
| `llm:get-providers`       | invoke  | none                      | LLMProvider[]                          | Provider list                       |
| `llm:set-selected-config` | invoke  | `{ providerId, modelId }` | `{ success: boolean, error?: string }` | Sync Renderer selection to Main     |
| `llm:check-health`        | invoke  | `{ providerId }`          | HealthCheckResult                      | Health check (PRIMARY for new code) |
| `llm:send-chat`           | invoke  | LLMChatRequest            | LLMChatResponse                        | Chat send                           |
| `llm:stream-chat`         | send/on | LLMChatRequest            | LLMStreamChunk (continuous)            | Streaming chat                      |

### 2.3 Streaming Channels (llm-streaming.md)

| Step    | Event               | Description                      |
| ------- | ------------------- | -------------------------------- |
| Request | `llm:stream-chat`   | Start streaming request          |
| Chunk   | `llm:stream-chunk`  | Each chunk forwarded to Renderer |
| Cancel  | `llm:cancel-stream` | Cancel via AbortController       |
| Done    | `llm:stream-done`   | Stream completion signal         |

**SSE Flow**: Renderer -> Main -> Provider API -> Main (chunk) -> Renderer (chunk) -> ... -> done

### 2.4 Conversation Channels (api-ipc-system-core.md)

| Channel                   | Request                                     | Response                               |
| ------------------------- | ------------------------------------------- | -------------------------------------- |
| `conversation:list`       | `{ userId, limit?, offset? }`               | `PaginatedResult<ConversationSummary>` |
| `conversation:get`        | `{ id }`                                    | `Conversation \| null`                 |
| `conversation:create`     | `{ userId, title }`                         | `Conversation`                         |
| `conversation:update`     | `{ id, title?, isFavorite?, isPinned? }`    | `Conversation`                         |
| `conversation:delete`     | `{ id }`                                    | void                                   |
| `conversation:addMessage` | `{ sessionId, message: { role, content } }` | `Message`                              |
| `conversation:search`     | `{ userId, query }`                         | `ConversationSummary[]`                |

**Graceful Degradation**: DB init failure -> `registerConversationFallbackHandlers()` returns `DB_NOT_AVAILABLE` for all 7 channels (S30 pattern).

### 2.5 LLM Selected Config Sync (api-ipc-system-core.md)

| Channel                   | Method | Args                      | Return                                 | Scope    |
| ------------------------- | ------ | ------------------------- | -------------------------------------- | -------- |
| `llm:set-selected-config` | invoke | `{ providerId, modelId }` | `{ success: boolean, error?: string }` | Renderer |

**Store**: Zustand `llmSlice` (`selectedProviderId` / `selectedModelId`) + `chatSlice`

**Unselected behavior**: Main-side returns error when config is unset. **NO implicit default fallback** (GAP-03 fixed).

### 2.6 API Key Channels (api-ipc-system-core.md)

| Channel           | Method | Args                   | Return                            |
| ----------------- | ------ | ---------------------- | --------------------------------- |
| `apiKey:save`     | invoke | `{ provider, apiKey }` | `IPCResponse<void>`               |
| `apiKey:delete`   | invoke | `{ provider }`         | `IPCResponse<void>`               |
| `apiKey:validate` | invoke | `{ provider, apiKey }` | `IPCResponse<ValidationResult>`   |
| `apiKey:list`     | invoke | none                   | `IPCResponse<ProviderListResult>` |

**Security**: `apiKey:get` is Main-only (never exposed to Renderer).

### 2.7 Auth Key Channels (api-ipc-system-core.md)

| Channel             | Method | Args      | Return                                                                 |
| ------------------- | ------ | --------- | ---------------------------------------------------------------------- |
| `auth-key:set`      | invoke | `{ key }` | AuthKeySetResponse                                                     |
| `auth-key:exists`   | invoke | none      | `{ exists: boolean, source?: "saved" \| "env-fallback" \| "not-set" }` |
| `auth-key:validate` | invoke | `{ key }` | AuthKeyValidateResponse                                                |
| `auth-key:delete`   | invoke | none      | AuthKeyDeleteResponse                                                  |

### 2.8 Workspace Chat Edit Channel (llm-workspace-chat-edit.md)

| Channel                       | Direction        | Request                | Response                                                    |
| ----------------------------- | ---------------- | ---------------------- | ----------------------------------------------------------- |
| `chat-edit:send-with-context` | Renderer -> Main | SendWithContextRequest | SendWithContextResponse (includes `handoff?` / `guidance?`) |

---

## 3. UI 状態定義

### 3.1 Workspace Chat Panel UI States (ui-ux-feature-components-details.md)

| State        | Condition                | Display                                                     |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| zero state   | No conversation started  | Suggestion bubbles shown, input guide visible               |
| streaming    | chunk/end/error/cancel   | Reflected in UI state (`isStreaming`, accumulated content)  |
| error        | Stream error / API error | `role="alert"` error display                                |
| file context | File selected            | Up to 3 file context chips shown                            |
| mention      | `@` typed                | File candidate dropdown with keyboard nav (Arrow/Enter/Tab) |
| persistence  | user/assistant messages  | Saved via `conversationAPI.addMessage`                      |

### 3.2 Agent Execution Status (interfaces-agent-sdk-ui.md)

| Status                | Description                 |
| --------------------- | --------------------------- |
| `idle`                | Waiting (initial)           |
| `executing`           | Processing query            |
| `streaming`           | Receiving response          |
| `awaiting_permission` | Waiting for user permission |
| `completed`           | Normal completion           |
| `cancelled`           | User cancelled              |
| `error`               | Abnormal termination        |

### 3.3 Streaming Error States (llm-streaming.md)

| Error Code          | Streaming Behavior                            | Retryable |
| ------------------- | --------------------------------------------- | --------- |
| NETWORK_ERROR       | Connection cut, accumulated content preserved | Yes       |
| TIMEOUT             | Timeout display                               | Yes       |
| RATE_LIMIT          | Wait time shown, auto retry                   | Yes       |
| API_KEY_INVALID     | Error shown, settings redirect                | No        |
| CONTENT_FILTER      | Filter notification                           | No        |
| SERVICE_UNAVAILABLE | Service status check guide                    | Yes       |

### 3.4 Health Check Status (llm-ipc-types.md)

| Status         | Meaning                                                   |
| -------------- | --------------------------------------------------------- |
| `connected`    | Provider reachable and authenticated                      |
| `disconnected` | Network unreachable (catch block returns this per GAP-02) |
| `error`        | Adapter internal error (e.g., auth failure)               |

### 3.5 ChatPanel Integration Pattern (ui-ux-panels.md)

| Pattern                   | Description                                     | Example                         |
| ------------------------- | ----------------------------------------------- | ------------------------------- |
| Conditional Render        | Switch child components based on Store state    | ChatPanel -> SkillStreamingView |
| Header/Content Separation | StatusBadge in header, StreamMessage in content | SkillStreamingView internal     |
| Collapsible History       | ToolExecutionHistory expand/collapse            | Tool execution results          |

**Condition**: `isExecuting && selectedSkillName` for SkillStreamingView integration.

---

## 4. Access Capability 条件・制約

### 4.1 Capability Foundation (workflow-ai-runtime-authmode-unification.md)

| Capability          | Description                                 |
| ------------------- | ------------------------------------------- |
| `integratedRuntime` | API key available, direct LLM call possible |
| `terminalSurface`   | Terminal handoff available                  |
| `both`              | Both integrated and terminal available      |
| `none`              | No AI capability available                  |

### 4.2 Settings Display Vocabulary

| State         | UI Label    | Condition                                  |
| ------------- | ----------- | ------------------------------------------ |
| `ready`       | Ready       | API key configured and valid               |
| `blocked`     | Blocked     | API key missing or invalid                 |
| `unavailable` | Unavailable | Feature not available in current auth mode |

### 4.3 Terminal Boundary Rules

| Rule                               | Description                          |
| ---------------------------------- | ------------------------------------ |
| auto send PROHIBITED               | Terminal must not auto-send commands |
| hidden prompt injection PROHIBITED | No hidden prompts allowed            |
| silent fallback PROHIBITED         | No silent fallback to terminal       |

### 4.4 Auth Key Preflight (ui-ux-feature-components-details.md)

Skill execution performs preflight via `auth-key:exists`:

- `exists=false` -> Block execute, show "Please register API key in settings"
- Error code: `AUTHENTICATION_ERROR`

### 4.5 Settings AuthGuard Bypass (ui-ux-settings-core.md)

Settings is always accessible regardless of auth state:

- `PUBLIC_UNAUTHENTICATED_VIEWS = ["settings"]`
- Shell bypass: `App.tsx` renders `SettingsView` outside AuthGuard when `currentView === "settings"`
- Reset exclusion: `settings` excluded from unauthenticated view reset

### 4.6 AuthKeySection Display Contract (ui-ux-settings-core.md)

| Condition                | Action              |
| ------------------------ | ------------------- |
| `authMode === "api-key"` | Show AuthKeySection |
| `authMode !== "api-key"` | Hide AuthKeySection |

| `auth-key:exists` Response                 | UI State       | Display Intent                |
| ------------------------------------------ | -------------- | ----------------------------- |
| `{ exists: false, source: "not-set" }`     | `not-set`      | API key not configured        |
| `{ exists: true, source: "saved" }`        | `saved`        | Saved key prioritized         |
| `{ exists: true, source: "env-fallback" }` | `env-fallback` | Environment variable fallback |

---

## 5. Selected Config 同期契約

### 5.1 Sync Flow

1. **Renderer**: User selects provider/model in `LLMSelectorPanel`
2. **Store**: `llmSlice` updates `selectedProviderId` / `selectedModelId`
3. **IPC**: `llm:set-selected-config` sends `{ providerId, modelId }` to Main
4. **Main**: `setSelectedLLMConfig()` stores the selection
5. **AI_CHAT**: When `AIChatRequest` has no explicit provider/model, Main uses stored selection

### 5.2 Validation (api-ipc-system-core.md)

| Rule                                            | Enforcement                                            |
| ----------------------------------------------- | ------------------------------------------------------ |
| `providerId` / `modelId` partial set prohibited | Both must be present or both absent                    |
| Empty / trim-empty strings prohibited           | P42 3-step validation                                  |
| `providerId` whitelist                          | `"openai" \| "anthropic" \| "google" \| "xai"` only    |
| Unselected state                                | Error returned (no DEFAULT_CONFIG fallback per GAP-03) |

### 5.3 Post-Save Side Effects (api-ipc-system-core.md)

| Event           | Side Effect                                 |
| --------------- | ------------------------------------------- |
| `apiKey:save`   | `LLMAdapterFactory.clearInstance(provider)` |
| `apiKey:delete` | `LLMAdapterFactory.clearInstance(provider)` |

---

## 6. Security Requirements

### 6.1 IPC Security (api-ipc-system-core.md)

| Requirement         | Implementation                                             |
| ------------------- | ---------------------------------------------------------- |
| contextIsolation    | Preload-only communication API                             |
| Channel whitelist   | Only whitelisted channels allowed                          |
| Sender verification | `withValidation()` / `validateIpcSender()` on all handlers |
| Type safety         | TypeScript type definitions on all channels                |

### 6.2 API Key Protection

| Aspect             | Measure                                                        |
| ------------------ | -------------------------------------------------------------- |
| Encryption         | `safeStorage.encryptString()`                                  |
| Renderer isolation | `apiKey:get` / `auth-key:getKey` are Main-only (never exposed) |
| IPC verification   | `withValidation()` wrapper for sender verification             |
| Format validation  | `sk-ant-api` prefix pattern check                              |
| Log output         | Key values NEVER logged                                        |

### 6.3 Secret Masking in Handoff

- `handoff command` must NOT contain secrets
- `workspacePath` validated by `isAllowedPath()` for context files
- Terminal boundary: no auto-send, no hidden prompt injection, no silent fallback

### 6.4 Renderer Response Shape Fallback (api-ipc-system-core.md)

3-stage defense pattern for IPC responses in Renderer:

| Stage               | Defense                            | Code Example                                                                       |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| 1. API existence    | `window.electronAPI?.namespace`    | `const api = window.electronAPI?.apiKey;`                                          |
| 2. Method existence | `api?.method` + warn + fallback    | `if (!api?.list) { console.warn(...); return; }`                                   |
| 3. Response shape   | `Array.isArray(result.data.items)` | `const items = Array.isArray(result.data.providers) ? result.data.providers : [];` |

### 6.5 Streaming Security

| Aspect           | Implementation                                                               |
| ---------------- | ---------------------------------------------------------------------------- |
| XSS prevention   | React auto-escape + IPC string-only transmission                             |
| Prompt injection | Local app, limited impact                                                    |
| Rate limit       | Provider-side rate limit errors notified to user                             |
| Cancel mechanism | AbortController integration (button, Escape, component unmount, new message) |

---

## 7. Accessibility Requirements (Cross-cutting)

### 7.1 Streaming Message (llm-streaming.md)

| Attribute         | Value             | Purpose                      |
| ----------------- | ----------------- | ---------------------------- |
| role              | "status"          | Dynamic content notification |
| aria-live         | "polite"          | Screen reader support        |
| aria-busy         | {isStreaming}     | Processing state indication  |
| cursor aria-label | "Typing"          | Cursor meaning               |
| button aria-label | "Cancel response" | Cancel button description    |

### 7.2 Workspace Chat Panel (ui-ux-feature-components-details.md)

| Element          | Requirement                         |
| ---------------- | ----------------------------------- |
| Message list     | `role="log"` + `aria-live="polite"` |
| Error display    | `role="alert"`                      |
| Mention dropdown | Keyboard nav (Arrow/Enter/Tab)      |

### 7.3 ChatPanel Integration (ui-ux-panels.md)

| Requirement            | Pattern                                     |
| ---------------------- | ------------------------------------------- |
| Streaming notification | `aria-live="polite"` for message additions  |
| Status change          | StatusBadge with `role="status"`            |
| Focus management       | Focus to content head on panel switch       |
| Keyboard operation     | ToolExecutionHistory expand via Enter/Space |

---

## 8. Implementation File References

### 8.1 Main Process

| File                                                              | Role                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                         | AI_CHAT handler (P42 validation added)                       |
| `apps/desktop/src/main/handlers/llm.ts`                           | llm:\* handlers (check-health, set-selected-config)          |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts`                  | Selected config storage (GAP-03: no DEFAULT_CONFIG fallback) |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`                   | chat-edit:send-with-context handler                          |
| `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`     | Runtime resolution (integrated/handoff)                      |
| `apps/desktop/src/main/services/chat-edit/AnthropicLLMAdapter.ts` | Anthropic API direct call (`net.fetch`)                      |
| `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`     | LLM facade service                                           |
| `apps/desktop/src/main/services/auth/AuthKeyService.ts`           | Auth key management                                          |
| `apps/desktop/src/main/ipc/authKeyHandlers.ts`                    | auth-key:\* handlers                                         |
| `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                     | apiKey:\* handlers                                           |

### 8.2 Preload

| File                                     | Role                 |
| ---------------------------------------- | -------------------- |
| `apps/desktop/src/preload/channels.ts`   | Channel definitions  |
| `apps/desktop/src/preload/types.ts`      | IPC type definitions |
| `apps/desktop/src/preload/authKeyApi.ts` | Auth key Preload API |

### 8.3 Renderer

| File                                                                     | Role                       |
| ------------------------------------------------------------------------ | -------------------------- |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                     | LLM state management       |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`                    | Chat state management      |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`          | Unified LLM selector panel |
| `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`         | Streaming message display  |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                 | Settings view              |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | Auth key section           |

### 8.4 Shared

| File                                     | Role                          |
| ---------------------------------------- | ----------------------------- |
| `packages/shared/src/types/llm/schemas/` | Zod schemas for LLM types     |
| `packages/shared/src/agent/types.ts`     | Shared agent type definitions |

---

## 9. Key Constraints for ChatPanel Real Chat Wiring

### 9.1 Must-Follow Contracts

1. **No implicit fallback**: When provider/model is unselected, return error (GAP-03)
2. **P42 3-step validation**: All string IPC args must pass `typeof -> === "" -> .trim() === ""`
3. **RuntimeResolver**: Use `resolve()` to determine integrated vs handoff before any AI call
4. **Conversation persistence**: Save user/assistant messages via `conversation:addMessage`
5. **Secret masking**: API keys must never leak to Renderer or handoff commands

### 9.2 UI State Machine

```
[idle] -> user sends message -> [streaming]
[streaming] -> chunk received -> [streaming] (accumulate)
[streaming] -> done signal -> [idle] (show complete message, persist)
[streaming] -> error signal -> [error] (show error, preserve accumulated)
[streaming] -> user cancels -> [idle] (preserve accumulated)
[idle] -> no provider selected -> [blocked] (show selection guide)
```

### 9.3 Cancel Triggers

| Trigger           | Action                         |
| ----------------- | ------------------------------ |
| Cancel button     | `onCancel()` -> `abort()`      |
| Escape key        | key event -> `abort()`         |
| Component unmount | useEffect cleanup -> `abort()` |
| New message send  | Auto-cancel previous stream    |

---

## 10. Source File Access Note

`workflow-apikey-chat-tool-integration-alignment.md` was denied by security hooks. Related information was reconstructed from:

- `api-ipc-system-core.md` (apiKey:save/delete side effects, LLMAdapterFactory.clearInstance)
- `ui-ux-settings-core.md` (AuthKeySection display contract)
- `workflow-ai-runtime-authmode-unification.md` (capability foundation, settings review)
- `llm-ipc-types.md` (AI_CHAT provider/model resolution, llm:set-selected-config)
