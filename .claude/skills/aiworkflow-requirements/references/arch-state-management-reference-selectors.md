# 状態管理パターン（Desktop Renderer） / 実装ログ・セレクタ参照

> 正本: [arch-state-management-core.md](arch-state-management-core.md)
> 役割: 実装済みタスクの詳細ログ・個別セレクタ一覧・handoff 契約参照

---
## Notification/HistorySearch 実装同期（TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN）

### 追加したSlice

| Slice | 実装ファイル | 役割 |
| --- | --- | --- |
| `notificationSlice` | `apps/desktop/src/renderer/store/slices/notificationSlice.ts` | 通知履歴・未読管理・フィルタ管理 |
| `historySearchSlice` | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | 検索条件・結果・統計・ページング管理 |

### Notification 契約

| 項目 | 内容 |
| --- | --- |
| 上限 | `MAX_NOTIFICATION_HISTORY = 100` |
| 削除戦略 | 上限超過時は既読最古を優先削除。既読が無い場合は未読最古を削除 |
| 既読管理 | `readAt: string | null` |
| 永続化 | `persist.partialize` で `notifications` を保持 |

### Notification 058e 追補（TASK-UI-08-NOTIFICATION-CENTER）

| 項目 | 内容 |
| --- | --- |
| 履歴同期 | `setNotificationHistory()` は ID 単位で dedupe し、timestamp 降順へ正規化する |
| push 取り込み | `ingestNotification()` は既存 ID を置換して二重表示を防ぐ |
| 個別削除 | `deleteNotification()` は対象通知を除去し、展開中だった場合は `expandedNotificationId = null` に戻す |
| UI state | `isPopoverOpen` と `expandedNotificationId` を局所 state と切り分けず slice で保持する |
| 互換 API | `clearAllNotifications()` は Store/互換用途に残すが、058e UI では `すべて削除` を表示しない |

### HistorySearch 契約

| 項目 | 内容 |
| --- | --- |
| フィルタ | type/date/includeArchived |
| 結果管理 | `results`, `stats`, `pagination` |
| 検索前処理 | `query.trim()` を必須化 |
| エラー管理 | `historySearchError` に明示保持 |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest`（対象5ファイル） | PASS（37 tests） |
| `typecheck` | PASS |
| coverage（task scope） | Line 87.45 / Branch 65.11 / Function 80.39 |
---
## HistorySearch timeline 再設計（TASK-UI-06-HISTORY-SEARCH-VIEW）

### 更新した Slice / state

| Slice | 追加/変更 | 目的 |
| --- | --- | --- |
| `historySearchSlice` | `hasFetchedHistory` | 初回 loading と初期 empty を分離する |
| `historySearchSlice` | `isHistoryLoadingMore` | 初回検索と append 読込を分離する |
| `historySearchSlice` | `expandedItemId` | accordion を単一展開に保つ |
| `editorSlice` | `pendingOpenFilePath` | history file card から editor への deep-open を橋渡しする |

### Action 契約

| Action | 契約 |
| --- | --- |
| `searchHistory(query, offset, filter)` | `query.trim()` を正本にする。`offset === 0` は置換、`offset > 0` は append |
| `loadMoreHistory()` | `hasMore=false` / `isHistorySearching=true` / `isHistoryLoadingMore=true` の場合は no-op |
| `mergeHistoryItems()` | `id` 重複を除外して append する |
| `requestOpenFile(filePath)` | `pendingOpenFilePath` をセットし、呼び出し元が `setCurrentView("editor")` を行う |
| `clearPendingOpenFile()` | `EditorView` 側で消費後に必ず null へ戻す |

### UI状態の分離

| UI mode | 判定 | 表示 |
| --- | --- | --- |
| loading | `!hasFetchedHistory && isHistorySearching` | skeleton |
| results | `historySearchResults.length > 0` | timeline + sentinel |
| search-empty | `query.trim() !== "" && results.length === 0` | clear CTA |
| empty | 初回取得後に結果0件 | chat 導線 |
| error | `historySearchError !== null` | retry CTA |

### 実装時の苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| 検索中と追加読込中を同一フラグで持つと empty/loading 判定が崩れる | `isHistorySearching` だけで全状態を表す | `hasFetchedHistory` / `isHistoryLoadingMore` を分離した | timeline UI は initial / append / empty を別フラグで表現する |
| file card から editor を直接開けず、View 遷移だけ先に進む | deep-open 対象 path を global state に残さない | `pendingOpenFilePath` を `editorSlice` に追加した | cross-view 導線は「遷移」と「消費する payload」を分けて保持する |
| mobile sticky header が card と視覚干渉しやすい | sticky offset が画面全体 header を前提に固定される | `top-0` + gradient + blur に寄せた | timeline の group header は local scroll container 基準で sticky を設計する |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest`（対象5ファイル） | PASS（26 tests） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| coverage（task scope） | Lines 88.42 / Branches 80.00 / Functions 90.00 |
---
## ViewType/ナビ導線 実装同期（TASK-UI-01-D-VIEWTYPE-ROUTING-NAV）

### 変更点（状態管理観点）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| ViewType導線 | `workspace` / `skillCenter` / `historySearch` の導線を `renderView()` で網羅 | `apps/desktop/src/renderer/App.tsx` |
| 契約一元化 | AppDock ナビ項目を `navContract.ts` へ集約し、重複定義を除去 | `apps/desktop/src/renderer/navigation/navContract.ts` |
| ショートカット | `Cmd` / `Ctrl` 両対応。`alt` / `shift` 併用時・編集要素上は無効化 | `apps/desktop/src/renderer/navigation/navContract.ts`, `apps/desktop/src/renderer/App.tsx` |
| AppDock連携 | `APP_DOCK_NAV_ITEMS` を参照し、表示順と ViewType 契約を固定 | `apps/desktop/src/renderer/components/organisms/AppDock/index.tsx` |

### TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001（2026-03-17）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| ViewType 拡張 | `skillAnalysis` / `skillCreate` を `ViewType` に追加 | `apps/desktop/src/renderer/store/types.ts` |
| renderView 導線 | `skillAnalysis` は `SkillAnalysisView`、`skillCreate` は `SkillCreateWizard` を返す | `apps/desktop/src/renderer/App.tsx` |
| close 時の状態復帰 | `SkillAnalysisView` close で `setCurrentView("skillCenter")` + `setCurrentSkillName(null)` | `apps/desktop/src/renderer/App.tsx` |
| lifecycle 型境界 | `SkillLifecycleJobGuide` に `onAction?: () => void` を追加（既存 job guide 互換を維持） | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| alias 正規化 | `skill-center` は `normalizeSkillLifecycleView()` で canonical `skillCenter` へ集約 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |

### TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001（2026-03-19）

| 観点 | 内容 | 実装ファイル |
| --- | --- | --- |
| handoff payload | destination view が読む `currentSkillName` を detail panel click 前に設定する | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| view transition | `handleEditSkill` は `skill-editor`、`handleAnalyzeSkill` は `skillAnalysis` へ遷移する | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| local UI state | destination 遷移後に `handleCloseDetail()` を実行し、detail panel 開閉 state を shell 遷移へ持ち越さない | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| store 境界 | 新規 slice は追加せず、既存 `useAppStore` の `setCurrentView` / `setCurrentSkillName` を再利用する | `apps/desktop/src/renderer/store` |
| 回帰検証 | `useSkillCenter.test.ts` が `setCurrentSkillName -> setCurrentView -> panel close` の順序を確認する | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts` |

### 検証証跡

| 検証 | 結果 |
| --- | --- |
| `vitest run src/renderer/navigation/navContract.test.ts src/renderer/components/organisms/AppDock/AppDock.test.tsx src/renderer/__tests__/integration/navigation.integration.test.ts` | PASS（49 tests） |
| `vitest run src/renderer/__tests__/App.renderView.viewtype.test.tsx src/renderer/navigation/skillLifecycleJourney.test.ts src/renderer/store/types.test.ts` | PASS（34 tests: TC-VT-01~04, TC-RV-01~08, TC-SL-01~11） |
| `pnpm --filter @repo/desktop typecheck` | PASS |
| `validate-phase11-screenshot-coverage --workflow docs/30-workflows/task-056d-viewtype-routing-nav` | PASS（expected=5 / covered=5） |

### TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 苦戦箇所（2026-03-17）

| 苦戦箇所 | 再発条件 | 解決策 | 標準化ルール |
| --- | --- | --- | --- |
| P40 再発: dynamic import の Vite alias 解決失敗 | モノレポルートから `await import("@/renderer/App")` を含むテストを実行する | `cd apps/desktop` が必須 | `pnpm --filter @repo/desktop exec vitest run` を標準とする |
| コンテキスト圧縮リカバリ | エージェント作業中にコンテキストウィンドウが圧縮される | `git diff --stat HEAD` + `Glob` で完了判定 | 中断復帰時は差分から未完了成果物を特定する |
| ViewType union 拡張パターン | `Record<ViewType, Config>` を使用すると全 case 強制で拡張時の影響が大きい | カテゴリコメント付き union 整理 + `renderView()` default fallback | union 拡張は `types.ts` + `renderView()` を同一ターンで更新する |

### 実装時の苦戦箇所（TASK-UI-01-D 追補）

| 苦戦箇所 | 再発条件 | 対処 | 標準化ルール |
| --- | --- | --- | --- |
| ナビ契約が二重管理になりドリフト | `AppDock` と `App.tsx` が別定義で更新される | `navContract.ts` へ契約集約し、UIは参照のみへ変更 | ViewType導線は単一契約ファイルを正本とする |
| 編集中にショートカット誤発火 | global `keydown` でターゲット種別を判定しない | `isEditableEventTarget` を導入し、入力要素上を無効化 | グローバル導線は「修飾キー条件 + 編集要素除外」を必須化 |
| 再撮影時の保存先/ポート運用が不安定 | workflow固定出力先 + strictPort競合時の分岐未記録 | 運用ガードを未タスク化し、preflight結果を成果物に記録 | `Port 5177` preflight と分岐ログを Step 2 記録に含める |

### 同種課題の簡潔解決手順（5ステップ）

1. ViewType導線契約を `navContract.ts` に集約し、Store/UI境界を固定する。
2. `keydown` 導線へ編集要素除外を適用し、誤発火を単体テストで固定する。
3. AppDock表示順と `NAV_SHORTCUT_TO_VIEW` の整合を同一PR単位で更新する。
4. Phase 11 証跡（`TC-xx` + `.png`）を workflow 配下へ保存し、coverage validator を実行する。
5. `lsof -nP -iTCP:5177 -sTCP:LISTEN` で preflight を実施し、分岐結果と未タスク化要否を `task-workflow`/`lessons` に同時記録する。
---
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
| `currentConversationId` | `string \| null` | chatSlice | 現在の会話ID |
| `streamingContent` | `string` | chatSlice | 既存維持 |
| `isStreaming` | `boolean` | chatSlice | 既存維持 |
| `streamingError` | `{ code: string; message: string; retryable: boolean } \| null` | chatSlice | 既存維持 |

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

| セレクタ名 | 戻り値型 | 用途 |
| --- | --- | --- |
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
