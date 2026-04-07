# UIフィーチャーコンポーネント（テーマ・ChatPanel配線） / theme-chat specification
> 親ファイル: [ui-ux-feature-components-details.md](ui-ux-feature-components-details.md)

## Light Theme Contrast Regression Guard（TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001）

> **詳細仕様**: [workflow-light-theme-contrast-regression-guard.md](./workflow-light-theme-contrast-regression-guard.md)

light theme remediation を直接行わず、representative screen と hardcoded color audit で回帰を検出する guard workflow。current build static serve と selector-based capture を正本手順に固定する。

### 実装内容（要点）

| 項目 | 内容 |
| --- | --- |
| audit | `ThemeSelector` / `AuthView` / `WorkspaceSearchPanel` を baseline、`SettingsView` / `DashboardView` を current として監査 |
| harness | `phase11-light-theme-contrast-guard.html` と `phase11-light-theme-contrast-guard.tsx` を build output に含める |
| readiness | `ThemeSelector` / `AuthView` に minimal な `data-testid` を追加 |
| capture | Settings / Dashboard / Auth / WorkspaceSearch + Dashboard dark baseline の 5 ケースを取得 |

### 実測結果

| 項目 | 値 |
| --- | --- |
| currentViolations | 0 |
| baselineViolations | 64 |
| screenshot | 5 png + metadata 1件 |
| targeted tests | 46 PASS |

### Apple UI/UX 視覚レビュー

| 画面 | 判定 | 所見 |
| --- | --- | --- |
| Settings light | PASS with baseline note | settings shell は読めるが ThemeSelector の淡い chip が弱い |
| Dashboard light | PASS | hierarchy / spacing / materiality が安定 |
| Auth light | PASS with baseline note | helper text が light panel 上で沈む |
| WorkspaceSearch light | PASS with baseline note | light 指定でも dark slate surface が残るため remediation 対象が明確 |

### baseline backlog routing

| backlog | 参照 |
| --- | --- |
| ThemeSelector / Auth / WorkspaceSearch の actual remediation | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |
| current build capture preflight bundle | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` |
| guard workflow の維持 | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` |

### 再利用ルール

1. guard workflow は remediation task と分離する。
2. current build screenshot は build artifact を static serve して取得する。
3. selector-based capture を優先し、route 全景は fallback に留める。
4. `current=0` でも baseline backlog と routing を必ず残す。

---

## ChatPanel 実チャット配線設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001）

TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 で設計された ChatPanel の実チャット配線仕様。placeholder 3箇所（model-selector-slot, message-list-slot, chat-input-slot）を実コンポーネントに置換する設計。

### コンポーネント階層

| コンポーネント | 種類 | 親 | 役割 |
| --- | --- | --- | --- |
| `ChatPanel` | organism | view | 全体制御、8状態管理、IPC結線 |
| `RuntimeBanner` | molecule | `ChatPanel` | AccessCapability（integratedRuntime/terminalSurface/both/none）を視覚表示 |
| `ChatMessageList` | organism | `ChatPanel` | 会話履歴の一覧表示、role="log" aria-live="polite" |
| `ChatMessage` | molecule | `ChatMessageList` | user/assistant メッセージ表示 |
| `StreamingMessage` | molecule | `ChatMessageList` | ストリーミング中のリアルタイム表示（既存活用） |
| `ErrorGuidance` | molecule | `ChatPanel` | retryable エラー時の再試行導線表示 |
| `HandoffBlock` | molecule | `ChatPanel` | handoff 状態時のターミナル起動促進表示 |
| `PersistentTerminalLauncher` | molecule | `HandoffBlock` | ターミナルコマンド表示とコピー/起動ボタン |
| `ComposerArea` | molecule | `ChatPanel` | ComposerInput + SendButton の統合エリア |
| `ComposerInput` | atom | `ComposerArea` | テキスト入力フィールド（P42 3段バリデーション対応） |
| `SendButton` | atom | `ComposerArea` | 送信ボタン（streaming中は disabled） |
| `LLMSelectorPanel` | organism | `ChatPanel` | プロバイダー/モデル選択（既存活用） |

### 8状態 UI 表示テーブル

| 状態 | RuntimeBanner | ChatMessageList | ComposerArea | ErrorGuidance | HandoffBlock |
| --- | --- | --- | --- | --- | --- |
| `idle` | - | - | disabled | - | - |
| `ready` | capability表示 | 履歴表示 | enabled | - | - |
| `streaming` | capability表示 | +StreamingMessage | cancel可（送信disabled） | - | - |
| `cancelled` | capability表示 | 履歴+中断メッセージ | enabled | - | - |
| `completed` | capability表示 | 履歴+完了メッセージ | enabled | - | - |
| `error` | capability表示 | 履歴+エラー表示 | enabled | retryableのみ表示 | - |
| `blocked` | capability表示 | - | 非表示 | 表示 | - |
| `handoff` | capability表示 | - | 非表示 | - | 表示 |

### UI 契約

| 項目 | 契約 |
| --- | --- |
| blocked 導線 | Provider/Model 未設定時は `ErrorGuidance` を表示し、設定画面への導線を提供する（P62 準拠） |
| stream cancel | streaming 中は ComposerArea の SendButton を cancel ボタンへ切り替え、`llm:cancel-stream` を呼び出す |
| 入力バリデーション | ComposerInput は `typeof` → `=== ""` → `.trim() === ""` の P42 準拠 3段バリデーションで空送信を防止 |
| 状態フック | `useStreamingChat()` が `{ state: { isStreaming, content, error }, actions: { startStream, cancelStream } }` を提供 |
| セレクタ | P31/P48 準拠で個別セレクタ + `useShallow` を使用し、派生セレクタの無限ループを防止 |
| a11y | `ChatMessageList` は `role="log"` + `aria-live="polite"`、`ErrorGuidance` は `role="alert"` を維持する |

### 関連タスク

| タスクID | 内容 | ステータス |
| --- | --- | --- |
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 | ChatPanel placeholder → 実コンポーネント置換、8状態管理、IPC配線 | 設計完了（2026-03-18） |

### 関連未タスク（Phase 7/8/10 検出）

| タスクID | 内容 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| UT-CHATPANEL-GUARD-001 | handleSendMessage ストリーミング中ガード追加 | LOW | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-chatpanel-streaming-guard.md` |
| UT-CHATPANEL-COV-001 | ChatPanel handleNavigateToSettings テスト追加 | LOW | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-chatpanel-function-coverage-handlenavigatetosettings.md` |
| UT-CHATPANEL-COV-002 | chatSlice streaming系アクション直接テスト追加 | MEDIUM | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-chatslice-streaming-actions-test.md` |
| UT-CHATPANEL-COV-003 | useStreamingChat 専用テストファイル作成 | HIGH | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-usestreamingchat-test-creation.md` |
| UT-CHATPANEL-STUB-001 | ChatPanel スタブコンポーネント本格実装 | LOW | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-chatpanel-stub-components-implementation.md` |
| UT-CHATPANEL-REFACTOR-001 | パルスカーソル表示ロジック共通化 | LOW | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-streaming-pulse-cursor-commonization.md` |

---

## SkillStreamDisplay コンポーネント（TASK-3-2）

> **詳細仕様**: [ui-ux-feature-skill-stream.md](./ui-ux-feature-skill-stream.md)

スキル実行結果をリアルタイムでストリーミング表示するUIコンポーネント群。TASK-3-2シリーズで段階的に機能拡張。

### コンポーネント概要

| コンポーネント     | 責務                             | 主要機能                       |
| ------------------ | -------------------------------- | ------------------------------ |
| SkillStreamDisplay | スキル実行ストリームの表示・制御 | 実行開始/中断/リセット         |
| useSkillExecution  | 状態管理・IPC通信                | メッセージ管理、ステータス追跡 |
| MessageTimestamp   | 相対時刻表示                     | 自動更新、i18n対応             |
| CopyButton         | クリップボードコピー             | フィードバック表示             |

### タスク履歴

| タスクID   | 機能名                 | 完了日     | 主要追加機能                                     |
| ---------- | ---------------------- | ---------- | ------------------------------------------------ |
| TASK-3-2   | 基盤実装               | 2026-01-25 | SkillStreamDisplay、useSkillExecution            |
| TASK-3-2-A | UX改善                 | 2026-01-27 | LoadingSpinner、MessageTimestamp、CopyButton     |
| TASK-3-2-B | i18n対応               | 2026-01-28 | formatRelativeTime locale対応、日英2言語         |
| TASK-3-2-C | タイムスタンプ自動更新 | 2026-01-28 | TimestampContext、useInterval、usePageVisibility |

### IPC API概要

| メソッド  | 用途                     |
| --------- | ------------------------ |
| execute   | スキル実行開始           |
| onStream  | ストリームメッセージ購読 |
| abort     | 実行中断                 |
| getStatus | ステータス照会           |

### 認証 preflight UX ガード（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

`useSkillExecution` / `AgentView` / `agentSlice.executeSkill` は、実行前に `auth-key:exists` を使った preflight を実施する。`exists=false` の場合は execute を中断し、設定導線メッセージを優先表示する。

| 観点 | 仕様 |
| --- | --- |
| 実行前判定 | `preflightSkillExecutionAuth()` が `ok=false` を返したら `skill:execute` を呼ばない |
| ユーザー導線 | 「設定画面でAPIキーを登録してください。」を表示 |
| エラーコード | `AUTHENTICATION_ERROR` を UI 層で保持し、後続分岐に利用 |
| 回帰観測点 | execute 呼び出し抑止、二重状態遷移なし、トースト/エラー表示の整合 |

**画面証跡（Phase 11）**:
- `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-11/screenshots/TC-01-agent-view-before-execute-2026-03-04.png`
- `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-11/screenshots/TC-02-agent-view-auth-preflight-error-2026-03-04.png`
- `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-11/screenshots/TC-03-agent-view-before-execute-recheck-2026-03-04.png`

---

## i18n対応（TASK-3-2-B）

SkillStreamDisplayコンポーネントの多言語対応機能。

### 対応言語

| 言語   | ロケールコード | フォールバック |
| ------ | -------------- | -------------- |
| 日本語 | ja             | -（デフォルト）|
| 英語   | en             | ja             |

### 使用ライブラリ

| ライブラリ                       | バージョン | 用途                 |
| -------------------------------- | ---------- | -------------------- |
| i18next                          | ^23.x      | 国際化フレームワーク |
| react-i18next                    | ^14.x      | React統合            |
| i18next-browser-languagedetector | ^7.x       | 言語自動検出         |

### 翻訳対象

| カテゴリ | 対象テキスト                       |
| -------- | ---------------------------------- |
| status   | 待機中, 実行中, 完了, エラー, 中断 |
| time     | たった今, X秒前, X分前, X時間前, X日前 |
| button   | 中断, リセット                     |
| aria     | 実行中, メッセージをコピー, etc.   |
| feedback | コピーしました                     |

### i18n設定

| 項目        | パス                                         |
| ----------- | -------------------------------------------- |
| 設定ファイル | `apps/desktop/src/renderer/i18n/config.ts`   |
| 型定義      | `apps/desktop/src/renderer/i18n/types.d.ts`  |
| 日本語翻訳  | `apps/desktop/src/renderer/i18n/locales/ja/skill-stream.json` |
| 英語翻訳    | `apps/desktop/src/renderer/i18n/locales/en/skill-stream.json` |

### テスト品質（TASK-3-2-B）

| ファイル                         | テスト数 | カバレッジ |
| -------------------------------- | -------- | ---------- |
| config.test.ts                   | 20       | 100%       |
| formatTime.i18n.test.ts          | 30       | 100%       |
| SkillStreamDisplay.i18n.test.tsx | 24       | 100%       |
| 合計                             | 74       | -          |

---

## 完了タスク

### TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001（2026-03-18 完了）

WorkspaceChatPanel の AI Runtime 整合。P62 三層防御（UI canSend / Controller guard / Main validation）を導入し、DEFAULT_CONFIG fallback を排除。

| 項目           | 内容                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| タスクID       | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                            |
| ステータス     | **完了**                                                                |
| テスト数       | 77（自動）+ 8（手動）                                                  |
| 5領域構成      | header / file context chips / message log / composer / guidance block  |
| 状態遷移       | idle → sending → streaming → completed / cancelled / error / blocked   |
| 実装ガイド     | `docs/30-workflows/.../outputs/phase-12/implementation-guide.md`        |
| 未タスク       | 3件（controller hook 抽出 / CompactLayout 統合 / AccessCapability 統合）|
