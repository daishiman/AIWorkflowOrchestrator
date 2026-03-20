# AI Chat / LLM Integration Fix 仕様抽出マトリクス

## 対象

以下 4 タスクを同時に監査・設計・実装するときの最小仕様読書セット。

- `TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE`
- `TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE`
- `TASK-FIX-LLM-CONFIG-PERSISTENCE`
- `TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR`

## 現行実装アンカー

| 関心 | 実装ファイル |
| --- | --- |
| ChatView 送信失敗 | `apps/desktop/src/renderer/store/slices/chatSlice.ts` |
| ChatView UI | `apps/desktop/src/renderer/views/ChatView/index.tsx` |
| LLM 選択状態 | `apps/desktop/src/renderer/store/slices/llmSlice.ts` |
| persist 設定 | `apps/desktop/src/renderer/store/index.ts` |
| Main 側選択同期 | `apps/desktop/src/main/ipc/llmConfigProvider.ts` |
| Workspace Chat controller | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` |
| Workspace Chat UI | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` |
| Workspace shell / navigation | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` |

## current canonical set

| concern | canonical artifact |
| --- | --- |
| parent workflow | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` |
| Task 01 current workflow | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` |
| Task 02 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/` |
| Task 03 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/` |
| Task 04 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/` |
| artifact inventory | `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| legacy compatibility | `references/legacy-ordinal-family-register.md` |

## 実装・監査ステータス

| タスクID | 状態 | 現在の要点 |
| --- | --- | --- |
| `TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE` | 実装 + Phase 11/12 再監査済み | `chatSlice.chatError` / `clearChatError` / `ChatView` alert banner / screenshot 5件 / follow-up 2件 |
| `TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE` | workflow spec あり | inline guidance の主 surface |
| `TASK-FIX-LLM-CONFIG-PERSISTENCE` | workflow spec あり | persist 境界の主 concern |
| `TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR` | workflow spec あり | Workspace stream error UX の主 concern |

### Task 01 で今回固定した契約

- `callLLMAPI()` は `{ success, message?, error? }` を返し、Renderer 内で canonical error code または raw message string を扱う
- `chatSlice.sendMessage()` は送信開始時に `chatError` をクリアし、失敗時に code または raw message を保持する
- `ChatView` は `role="alert"` のバナーで error code を日本語文言へ変換し、非 code 文字列は raw message fallback として表示する。手動 close と 5 秒 auto clear を持つ
- Phase 11 evidence は `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshots/TC-11-01..05` を正本とする
- follow-up は `task-ut-chatview-error-banner-i18n-001.md` と `task-ut-ai-chat-error-code-inventory-001.md` へ formalize し、GitHub Issue `#1398` / `#1397` を作成した

### 今回の苦戦箇所と標準ルール

| 苦戦箇所 | 再発条件 | 解決策 | 今後の標準ルール |
| --- | --- | --- | --- |
| `AIChatResponse.error` を code only と誤読しやすい | Main 側が user-facing raw message を返す実装と system spec がずれる | `llm-ipc-types.md` と `error-handling-core.md` に code or raw message transport を明記した | error code と raw message fallback を別責務で記述し、片方だけを仕様化しない |
| workflow root の canonical path が親配下 `tasks/01-*` と root 直下で揺れる | family workflow と個別 workflow を別タイミングで更新する | root 直下 `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` を canonical に固定した | parent doc、workflow spec、legacy register を同一 wave で更新する |
| formalize 済み未タスクが見出し不足で audit に落ちる | required heading 名を満たさず内容だけ埋める | 9 セクションに再構成し、target-file audit を完了条件へ戻した | unassigned は `verify-unassigned-links` と `audit --target-file` をセットで閉じる |

## artifact inventory / parent docs / legacy

| concern | file |
| --- | --- |
| artifact inventory | `references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md` |
| parent docs | `docs/30-workflows/ai-chat-llm-integration-fix/index.md` |
| legacy path register | `references/legacy-ordinal-family-register.md` |
| quick entry | `indexes/quick-reference.md` |
| current canonical set navigation | `indexes/resource-map.md`, `indexes/topic-map.md` |

## タスク別の最小読書セット

### 1. ChatView error silent failure

| 先に読む | 理由 |
| --- | --- |
| `error-handling.md` | UI に露出してよいエラー表現とエラー分類の入口 |
| `workflow-apikey-chat-tool-integration-alignment.md` | `ai.chat` の provider/model 解決順と Main 同期の実装前提をまとめて確認できる |
| `llm-ipc-types.md` | `AIChatResponse.error` と provider/model 解決順の正本 |
| `arch-state-management.md` | Chat/LLM state をどの slice で持つか判断する入口 |
| `architecture-implementation-patterns.md` | P31/P48 と型ガードの再発防止 |

### 2. LLM selector inline guidance

| 先に読む | 理由 |
| --- | --- |
| `ui-ux-llm-selector.md` | LLM選択機能の current surface と gap を最短で確認できる |
| `ui-ux-feature-components.md` | `ErrorGuidance` / blocked 導線の既存パターン確認 |
| `ui-ux-navigation.md` | ChatView / Settings / Workspace 間の導線責務確認 |
| `arch-state-management.md` | `selectedProviderId` / `selectedModelId` の ownership 確認 |
| `llm-ipc-types.md` | provider/model の組指定制約と Main 側同期契約確認 |

### 3. LLM config persistence

| 先に読む | 理由 |
| --- | --- |
| `arch-state-management-reference-persist-hardening-test-quality.md` | persist 破損入力ガードと復元品質ゲートの正本 |
| `arch-ipc-persistence.md` | Renderer persist と Main 同期の境界確認 |
| `api-ipc-system-core.md` | Main 側 `AI_CHAT` / `llm:set-selected-config` 契約の current anchor |
| `llm-ipc-types.md` | `llm:set-selected-config` 引数と同期契約の正本 |
| `security-electron-ipc.md` | persist 対象へ秘密情報を混ぜない境界確認 |

### 4. Workspace chat stream error UX

| 先に読む | 理由 |
| --- | --- |
| `ui-ux-feature-components-details.md` | Workspace Chat Panel の既存 surface 契約確認 |
| `error-handling-core.md` | retryable / non-retryable の扱い確認 |
| `llm-streaming.md` | `streamChat` / cancel / error surface の current runtime 契約確認 |
| `llm-ipc-types.md` | `LLMError` / `streamChat` 周辺の型とエラーコード確認 |
| `ui-ux-navigation.md` | Settings 誘導を追加するときの導線責務確認 |

## 読む順番

1. `indexes/resource-map.md` の「バグ修正（AI Chat / LLM integration fix）」を見る
2. 本ファイルで 4 タスクの concern ごとに primary file set を絞る
3. `workflow-apikey-chat-tool-integration-alignment.md` と `llm-ipc-types.md` で Renderer/Main 間の LLM 契約を固定する
4. UI タスクは `ui-ux-feature-components.md` / `ui-ux-navigation.md` を読む
5. persist タスクは `arch-state-management-reference-persist-hardening-test-quality.md` を追加で読む
6. 実装実体を上表のアンカーで突合する

## 検索キーワード

- `ChatView`
- `chatError`
- `AIChatResponse`
- `llm:set-selected-config`
- `selectedProviderId`
- `selectedModelId`
- `persist`
- `WorkspaceChatPanel`
- `onStreamError`
- `ErrorGuidance`
- `LLMSelectorPanel`
- `Settings を開く`
- `workspace-chat-error`
- `selectedModelId === null`

## 注意点

- `llm-workspace-chat-edit.md` は Workspace Chat "Edit" 用の Main Process 仕様であり、通常の Workspace Chat surface とは責務が異なる。
- `arch-state-management.md` は入口であり、persist 実装判断では `arch-state-management-reference-persist-hardening-test-quality.md` まで降りる。
- ChatView 側の silent failure と Workspace 側の stream error は類似だが、前者は store action、後者は hook local state が主体である。
- Task 01 の workflow root はユーザー指定に合わせて `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` を canonical とし、旧 `ai-chat-llm-integration-fix/tasks/01-*` 参照は drift として扱う。
- artifact inventory、legacy register、parent doc、index 群は same-wave 同期対象であり、Task 01 のみ更新して閉じない。
