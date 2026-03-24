# Agent Execution UI コンポーネント / core specification

> 親仕様書: [ui-ux-agent-execution.md](ui-ux-agent-execution.md)
> 役割: core specification

## 概要

エージェント実行画面のUI/UXコンポーネント仕様。チャットインターフェース、ストリーミング出力、権限確認ダイアログを提供する。

---

## コンポーネント階層

| レベル | コンポーネント         | 種別                  | 親コンポーネント       | 子コンポーネント                                                                        |
| ------ | ---------------------- | --------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| 1      | AgentExecutionView     | views                 | -                      | Header, AgentChatInterface, AgentExecutionControls, AgentMessageInput, TerminalHandoffCard, PermissionDialog |
| 2      | Header                 | -                     | AgentExecutionView     | BackButton, SkillInfo                                                                   |
| 3      | BackButton             | -                     | Header                 | -                                                                                       |
| 3      | SkillInfo              | -                     | Header                 | -                                                                                       |
| 2      | AgentChatInterface     | organisms             | AgentExecutionView     | MessageList, AgentOutputStream                                                          |
| 3      | MessageList            | -                     | AgentChatInterface     | MessageItem（複数）                                                                     |
| 4      | MessageItem            | -                     | MessageList            | -                                                                                       |
| 3      | AgentOutputStream      | molecules             | AgentChatInterface     | StreamingText                                                                           |
| 4      | StreamingText          | -                     | AgentOutputStream      | -                                                                                       |
| 2      | AgentExecutionControls | molecules             | AgentExecutionView     | CancelButton, ClearButton                                                               |
| 3      | CancelButton           | -                     | AgentExecutionControls | -                                                                                       |
| 3      | ClearButton            | -                     | AgentExecutionControls | -                                                                                       |
| 2      | AgentMessageInput      | molecules             | AgentExecutionView     | TextInput, SendButton                                                                   |
| 3      | TextInput              | -                     | AgentMessageInput      | -                                                                                       |
| 3      | SendButton             | -                     | AgentMessageInput      | -                                                                                       |
| 2      | TerminalHandoffCard    | organisms             | AgentExecutionView     | CommandPreview, CopyButton, DismissButton                                               |
| 3      | CommandPreview         | -                     | TerminalHandoffCard    | -                                                                                       |
| 3      | CopyButton             | -                     | TerminalHandoffCard    | -                                                                                       |
| 3      | DismissButton          | -                     | TerminalHandoffCard    | -                                                                                       |
| 2      | PermissionDialog       | organisms（モーダル） | AgentExecutionView     | DialogHeader, PermissionDetails, RememberCheckbox, ActionButtons                        |
| 3      | DialogHeader           | -                     | PermissionDialog       | -                                                                                       |
| 3      | PermissionDetails      | -                     | PermissionDialog       | -                                                                                       |
| 3      | RememberCheckbox       | -                     | PermissionDialog       | -                                                                                       |
| 3      | ActionButtons          | -                     | PermissionDialog       | Allow, Deny                                                                             |

---

## コンポーネント仕様

### AgentExecutionView

| 項目     | 仕様                                                  |
| -------- | ----------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/views/AgentExecutionView/` |
| 責務     | メインビュー、ルーティング、レイアウト、状態接続      |
| Props    | `skillId: string` (オプション)                        |
| 状態管理 | Zustand agentSlice使用                                |

**レイアウト構造**

| 領域                     | 配置               | 内容                               | 備考                                 |
| ------------------------ | ------------------ | ---------------------------------- | ------------------------------------ |
| ヘッダー                 | 上部               | 戻るボタン、スキル情報             | 画面上端に固定配置                   |
| チャットインターフェース | 中央（メイン領域） | メッセージ履歴、ストリーミング出力 | スクロール可能な主要コンテンツエリア |
| handoff ガイダンス       | 入力欄の上          | TerminalHandoffCard                | handoff 時のみ表示                    |
| 実行コントロール         | 下部（入力欄上）   | キャンセルボタン、クリアボタン     | 横並び配置                           |
| メッセージ入力           | 最下部             | テキスト入力フィールド、送信ボタン | 画面下端に固定配置                   |

### AgentChatInterface

| 項目     | 仕様                                                                 |
| -------- | -------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/` |
| 責務     | メッセージ履歴表示、自動スクロール、ストリーミング統合               |
| Props    | `messages: AgentMessage[]`, `streamingContent: string`               |

**振る舞い**

| シナリオ         | 動作                                 |
| ---------------- | ------------------------------------ |
| 新規メッセージ   | 自動スクロールで最新メッセージを表示 |
| ストリーミング中 | リアルタイムで差分テキストを追記表示 |
| 長いメッセージ   | 折り返し表示、Markdownレンダリング   |

### AgentMessageInput

| 項目     | 仕様                                                                |
| -------- | ------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/molecules/AgentMessageInput/` |
| 責務     | テキスト入力、送信トリガー                                          |
| Props    | `onSubmit: (message: string) => void`, `disabled: boolean`          |

**キーボード操作**

| キー        | 動作                                 |
| ----------- | ------------------------------------ |
| Enter       | メッセージ送信（テキストがある場合） |
| Shift+Enter | 改行挿入                             |
| Escape      | 入力クリア                           |

**状態制御**

| 状態                | 送信ボタン | テキスト入力 |
| ------------------- | ---------- | ------------ |
| idle                | 有効       | 有効         |
| executing           | 無効       | 無効         |
| streaming           | 無効       | 無効         |
| awaiting_permission | 無効       | 無効         |

### AgentExecutionControls

| 項目     | 仕様                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/`      |
| 責務     | 実行制御（キャンセル・クリア）                                                |
| Props    | `onCancel: () => void`, `onClear: () => void`, `status: AgentExecutionStatus` |

**ボタン状態**

| ボタン     | idle               | executing/streaming | awaiting_permission | completed/error |
| ---------- | ------------------ | ------------------- | ------------------- | --------------- |
| キャンセル | 無効               | 有効                | 有効                | 無効            |
| クリア     | 有効（履歴あり時） | 無効                | 無効                | 有効            |

### TerminalHandoffCard（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001）

| 項目 | 仕様 |
| --- | --- |
| ファイル | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/TerminalHandoffCard.tsx` |
| 責務 | integrated 実行不可時に CLI handoff ガイダンスを表示する |
| 表示条件 | `handoffGuidance != null` |
| 主操作 | copy（terminal command 複製） / dismiss（カード非表示） |

**表示内容**

| フィールド | 内容 |
| --- | --- |
| `terminalCommand` | CLI へ引き継ぐ実行コマンド |
| `contextSummary` | handoff 理由と実行コンテキスト要約 |
| `reason` | integrated 経路で実行できなかった理由 |

**インタラクション**

| 操作 | 動作 |
| --- | --- |
| Copy | クリップボードへ `terminalCommand` をコピーし、完了フィードバックを表示 |
| Dismiss | `agentSlice.clearHandoffGuidance()` を呼び出し、カードを閉じる |

### HandoffGuidance canonical 定義（TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001）

`HandoffGuidance` は Terminal Handoff Surface の唯一の Props 型（canonical DTO）。

**禁止操作（Manual Boundary）**:

| ID | ルール |
|-----|------|
| MB-1 | auto-send（コマンドの自動送信）禁止 |
| MB-2 | hidden injection（不可視コンテンツの注入）禁止 |
| MB-3 | headless execution（ユーザー不在での実行）禁止 |
| MB-4 | credential passthrough（認証情報の直接受け渡し）禁止 |

**Consumer → DTO マッピング**:

| Consumer | 入力型 | surfaceType |
|----------|--------|-------------|
| Chat Edit | TerminalHandoffBundle | "chat-edit" |
| Runtime | TerminalHandoffBundle | "runtime" |
| Skill Docs | SkillDocsCapabilityResult | "skill-docs" |
| Agent Execution | TerminalHandoffBundle | "chat-edit" |
| Manual Launcher | direct construction | "manual" |

#### 完了タスク

| タスクID | Phase | 完了日 | 種別 |
|----------|-------|--------|------|
| TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 | Phase 1-13 | 2026-03-22 | 設計完了 |

#### 関連未タスク

- ~~UT-EXECUTION-ENV-TERMINAL-001: ExecutionEnvironment Terminal 常設パネル実装~~ **（完了 2026-03-23）**
  - UT-EXECUTION-ENV-TERMINAL-RENDERER-ERROR-UI-001: Renderer 側 Provider/Model 未選択エラー表示 UI
  - UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001: assertNoSilentFallback の既存 LLM エントリポイント結線
- UT-TERMINAL-DOCK-ABORTED-STATE-001: Terminal Dock の aborted state 定義
- UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001: GuidanceBlock vs TerminalHandoffCard 使い分けルール

### PermissionDialog（TASK-7C実装済）

| 項目     | 仕様                                                              |
| -------- | ----------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` |
| 責務     | ツール使用権限確認、フォーカストラップ、「常に許可」機能          |
| パターン | Store-direct（useAppStore()直接使用、Propsなし）                  |
| テスト   | 57テスト、Line 100%、Branch 94.44%、Function 100%                 |
| 実装状況 | **TASK-7C 完了**（2026-01-30）、**toolIcons追加**（2026-01-30）   |

**モーダル構成**

| 領域       | 要素                               | 内容例                     | 備考                                                  |
| ---------- | ---------------------------------- | -------------------------- | ----------------------------------------------------- |
| ヘッダー   | アイコン + タイトル + ツールバッジ | 「権限の確認」+ 💻Bashバッジ | 警告アイコン⚠️ + タイトル、閉じるボタン（✕）右端配置 |
| 本文       | メッセージ                         | 「Bash」を実行しますか？   | ツール名を動的表示                                    |
| 本文       | 人間可読説明文                     | 「ls -la」コマンドを実行します | `permissionDescriptions.ts`の`getDescription()`で生成 |
| 本文       | 詳細展開ボタン                     | 詳細を隠す ▲ / 詳細を表示 ▼ | `aria-expanded`, `aria-controls`属性付き              |
| 本文       | 引数詳細（formatArgs）             | command: `ls -la`          | 折りたたみ可能（デフォルト展開）、command/pathは直接表示、他はJSON |
| 本文       | 理由（任意）                       | 「ディレクトリ内容を確認するため」 | reason存在時のみ表示                            |
| オプション | チェックボックス                   | 次回から自動的に許可する   | 未チェック状態がデフォルト、「許可」ボタンのみに影響  |
| フッター   | 3ボタン                            | 拒否 / 1回許可 / 許可      | 左から: 拒否（赤）、1回許可（グレー）、許可（青）    |

**ツールアイコンバッジ（TASK-IMP-permission-tool-icons実装）**

ヘッダーのツールバッジにEmoji アイコンを表示。`TOOL_ICONS`定数で10ツール＋デフォルト（🔧）をマッピング。

| 要素       | スタイリング                                    | 備考                                 |
| ---------- | ----------------------------------------------- | ------------------------------------ |
| バッジ全体 | `inline-flex items-center gap-1`                | アイコンとツール名を水平配置         |
| バッジ背景 | `px-2 py-0.5 bg-gray-200 rounded text-sm`      | コンパクトなピル型                   |
| アイコン   | `<span aria-hidden="true">`                     | 装飾目的、スクリーンリーダー非読上げ |
| テキスト   | `font-mono font-medium`                         | ツール名（主要な情報伝達手段）       |

詳細マッピングは `interfaces-agent-sdk-ui.md` の「PermissionDialog ツールアイコンマッピング」セクション参照。

**3ボタン応答パターン（TASK-7C実装）**

| ボタン  | 呼び出し                                         | 動作                             |
| ------- | ------------------------------------------------ | -------------------------------- |
| 拒否    | `respondToSkillPermission(false, false)`         | 操作を拒否、ダイアログ閉じる     |
| 1回許可 | `respondToSkillPermission(true, false)`          | 今回のみ許可、チェック状態無視   |
| 許可    | `respondToSkillPermission(true, rememberChoice)` | 許可、チェックON時は以降自動許可 |

**formatArgsヘルパー**

| 引数タイプ | 表示形式       | 例                 |
| ---------- | -------------- | ------------------ |
| command    | 直接表示       | `ls -la /tmp`      |
| path       | 直接表示       | `/path/to/file.ts` |
| その他     | JSON.stringify | `{"key": "value"}` |

**アクセシビリティ**

| 要件               | 実装                                                    |
| ------------------ | ------------------------------------------------------- |
| フォーカストラップ | モーダル内でTabキーがループ                             |
| Escapeで閉じる     | 拒否として処理                                          |
| 初期フォーカス     | 「許可」ボタンにフォーカス                              |
| aria属性           | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| WCAG 2.1 AA        | コントラスト比4.5:1以上、キーボード完全操作可能         |

**キーボード操作**

| キー      | 動作                                                                     |
| --------- | ------------------------------------------------------------------------ |
| Tab       | 次の要素へ移動（チェックボックス→拒否→1回許可→許可→チェックボックス...） |
| Shift+Tab | 前の要素へ移動                                                           |
| Enter     | フォーカス中のボタン実行                                                 |
| Escape    | 拒否として閉じる                                                         |
| Space     | チェックボックストグル                                                   |

### permissionDescriptions モジュール（task-imp-permission-readable-ui-001実装済）

PermissionDialogで表示するツール操作の自然言語説明を生成するモジュール。ツール名と引数から日本語の説明文を組み立て、ユーザーが技術的知識なしで操作内容を理解できるようにする。

| 項目     | 仕様                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`        |
| 責務     | ツール別人間可読説明テンプレートの生成                                        |
| 公開API  | `getDescription(toolName: string, args: Record<string, unknown>): string`     |
| テスト   | 34テスト、Line 100%、Branch 100%、Function 100%                               |
| 実装状況 | **task-imp-permission-readable-ui-001 完了**（2026-01-30）                     |

**getDescription API**

| 引数       | 型                           | 説明                                    |
| ---------- | ---------------------------- | --------------------------------------- |
| toolName   | 文字列                       | ツール識別子（例: "Bash", "Read"）      |
| args       | キー・バリューオブジェクト   | ツール引数                              |
| 戻り値     | 文字列                       | 人間可読な日本語説明文                  |
| フォールバック | 文字列                   | 未定義ツール: 「{toolName}ツールの操作を実行します」 |

**ツール別説明テンプレート（12種）**

| ツール名     | 参照引数      | 生成例                                       |
| ------------ | ------------- | -------------------------------------------- |
| Bash         | command       | 「ls -la」コマンドを実行します               |
| Read         | file_path     | 「src/index.ts」ファイルを読み取ります       |
| Write        | file_path     | 「src/index.ts」ファイルに書き込みます       |
| Edit         | file_path     | 「src/index.ts」ファイルを編集します         |
| Glob         | pattern       | 「**/*.ts」パターンでファイルを検索します    |
| Grep         | pattern       | 「TODO」を含むファイルを検索します           |
| WebSearch    | query         | 「React hooks」で検索します                  |
| Task         | description   | タスクを実行します：探索タスク               |
| NotebookEdit | notebook_path | ノートブックを編集します：analysis.ipynb     |
| WebFetch     | url           | 「https://...」からデータを取得します        |
| Skill        | skill         | 「commit」スキルを実行します                 |
| AskUser      | （なし）      | ユーザーに確認します                         |

**セキュリティ対策（safeStringヘルパー）**

XSSおよびインジェクション対策として、全引数値は表示前に `safeString` で安全化される。

| 対策               | 処理内容                                    |
| ------------------ | ------------------------------------------- |
| null/undefined     | 空文字列に変換                              |
| 非文字列型         | String()で文字列化                          |
| 長文截断           | 100文字超過時、先頭100文字 + "..." に切り詰め |
| XSS防御            | React JSXの自動エスケープに依存             |
| 例外処理           | getDescription内でtry-catchし、デフォルト説明にフォールバック |

**PermissionDialogとの統合**

PermissionDialogのモーダル本文で `getDescription()` を呼び出し、ツールバッジの直下に人間可読説明文を表示する。ユーザーは「詳細を表示」ボタンで技術的なJSON引数も確認可能。Progressive Disclosureの原則に従い、初見ユーザーは自然言語説明のみで判断でき、上級ユーザーは詳細展開で完全な引数情報にアクセスできる。

### AgentOutputStream

| 項目     | 仕様                                                                |
| -------- | ------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/molecules/AgentOutputStream/` |
| 責務     | ストリーミングテキストのリアルタイム表示                            |
| Props    | `content: string`, `isStreaming: boolean`                           |

**振る舞い**

| 状態               | 表示                                  |
| ------------------ | ------------------------------------- |
| ストリーミング中   | テキスト + カーソル点滅アニメーション |
| ストリーミング完了 | テキストのみ                          |

---

## インタラクション設計

### メッセージ送信フロー

| ステップ | アクション                         | 詳細                                     |
| -------- | ---------------------------------- | ---------------------------------------- |
| 1        | ユーザーがテキスト入力             | AgentMessageInputにテキストを入力        |
| 2        | Enterキーまたは送信ボタン押下      | 送信トリガーの実行                       |
| 3        | ユーザーメッセージをチャットに追加 | MessageListに新規メッセージを表示        |
| 4        | 入力欄をクリア & 無効化            | テキストフィールドを空にし、入力を無効化 |
| 5        | `agent:start` IPC送信              | Main Processへエージェント実行を要求     |
| 6        | runtime 判定                       | integrated なら streaming、handoff なら TerminalHandoffCard 表示 |
| 7        | 結果表示                           | integrated: AgentOutputStream、handoff: guidance card |
| 8        | 次アクション可能化                 | 入力欄を再有効化し、再実行/CLI継続を可能にする |

### 権限確認フロー

| ステップ | アクション                             | 詳細                                     |
| -------- | -------------------------------------- | ---------------------------------------- |
| 1        | Main Processから権限確認要求を受信     | agent:permission:req IPCイベントを受信   |
| 2        | PermissionDialogをモーダル表示         | オーバーレイ付きで画面中央に表示         |
| 3        | フォーカスを「許可」ボタンに移動       | アクセシビリティ対応の初期フォーカス設定 |
| 4        | ユーザーが選択（許可/拒否）            | ボタンクリックまたはキーボード操作で選択 |
| 5        | 「記憶する」チェック時はローカル保存   | PermissionStoreに選択を永続化            |
| 6        | agent:permission:res IPC送信           | Main Processへ許可/拒否結果を返却        |
| 7        | ダイアログを閉じ、フォーカスを元に戻す | 元のフォーカス位置に復帰                 |

---

## 視覚デザイン

### メッセージバブル

| ロール    | 背景色         | 配置   |
| --------- | -------------- | ------ |
| user      | プライマリ薄色 | 右寄せ |
| assistant | セカンダリ薄色 | 左寄せ |
| system    | グレー         | 中央   |

### ステータスインジケータ

| 状態                | 視覚表現                     |
| ------------------- | ---------------------------- |
| idle                | なし                         |
| executing           | ローディングスピナー         |
| streaming           | カーソル点滅                 |
| awaiting_permission | モーダル表示                 |
| completed           | 成功アイコン（緑チェック）   |
| error               | エラーアイコン（赤×）        |
| cancelled           | キャンセルアイコン（グレー） |

---


## 改善 CTA バナー（TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 / 2026-03-20）

| 項目 | 仕様 |
| --- | --- |
| 表示条件 | `selectedSkillName.trim() !== "" && skillExecutionStatus === "completed" && !isExecuting` |
| 配置 | AgentView チャットインターフェースの下、実行コントロールの上 |
| aria | `aria-label="スキル改善提案"` region |
| CTA ボタン | 「分析する」ボタン。click で `currentSkillName` を設定し `skillAnalysis` へ遷移 |
| 非表示ケース | スキル未選択、実行中、実行未完了 |

**SkillAnalysisView round-trip props（Agent 起点限定）**

| Props | 型 | 条件 |
| --- | --- | --- |
| `onNavigateBack` | `() => void` | `viewHistory[length - 2] === "agent"` のとき `App.tsx` から注入 |
| `onNavigateToAgent` | `() => void` | 同上 |

- `onNavigateBack`: ヘッダー左に「戻る」リンクを表示。click で `agent` view へ戻る
- `onNavigateToAgent`: フッター右端に「エージェントで再実行」ボタンを表示。click で `agent` view へ遷移

---

## Session Dock 設計仕様（TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001, 2026-03-24 設計確定）

### DockState 8 状態

| 状態          | 意味                         | 表示グループ |
| ------------- | ---------------------------- | ------------ |
| collapsed     | パネル閉                     | Inactive     |
| ready         | 準備完了                     | Pending      |
| handoff       | CLI 引き渡し中               | Pending      |
| running       | CLI 実行中                   | Active       |
| done          | 正常完了                     | Complete     |
| aborted       | 中止 / エラー                | Complete     |
| unavailable   | CLI 利用不可                 | Inactive     |
| guidance-only | 読み取り専用ガイダンス表示   | Inactive     |

型定義: `packages/shared/src/types/dock-state.ts`

### 主要遷移（T1-T10）

| ID | From → To                       | トリガー              | ガード                                  |
| -- | -------------------------------- | --------------------- | --------------------------------------- |
| T1 | collapsed → ready               | GUIDANCE_RECEIVED     | handoffGuidance != null && cliAvailable |
| T4 | handoff → running               | CLI_SESSION_START     | sessionId != null                       |
| T5 | running → done                  | CLI_SESSION_COMPLETE  | exitCode === 0                          |
| T6 | running → aborted               | CLI_SESSION_ABORT     | exitCode !== 0 OR userAbort             |

設計判断 MN-01: `running → collapsed` 直接遷移は**禁止**（実行中プロセスの見失い防止）。

### SessionDockState（agentSlice 拡張）

```typescript
interface SessionDockState {
  dockState: DockState;
  sessionId: string | null;
  isDockOpen: boolean;
  transcriptEntries: TranscriptEntry[];
  artifactSummary: ArtifactSummaryData | null;
  errorSummary: ErrorSummaryData | null;
  shareHistory: ShareRecord[];
}
```

セレクタ: P31 準拠の個別セレクタ + P48 準拠の `useShallow` 適用（配列セレクタ）。

### Artifact-First 表示順序

| 優先度 | コンポーネント    | 表示条件                            |
| ------ | ----------------- | ----------------------------------- |
| 1      | ArtifactSummary   | done/aborted (primary surface)      |
| 2      | ExecutionSummary  | done/aborted (secondary)            |
| 3      | TranscriptDetail  | done/aborted (折りたたみ, tertiary) |
| 4      | ShareRail         | done/aborted (footer)               |

### Manual Share（手動3操作 + Provenance）

| 操作            | SharePayload.type | 説明                    |
| --------------- | ----------------- | ----------------------- |
| Selection Share | `"selection"`     | テキスト選択 → 送信     |
| Latest Attach   | `"latest"`        | 最新エントリを添付      |
| Session Paste   | `"session"`       | セッション要約を貼り付け |

全共有に `ProvenanceChip`（出典表示）を付与。CREDENTIAL_PATTERNS でサニタイズ後に送信。

### Session Persistence

- Session ID: `session-{crypto.randomUUID()}`
- 保持: 最大10件 / 24時間 / FIFO cleanup
- Running session は cleanup から除外
- Reopen: `claudeCliAPI.getSession(sessionId)` → 失敗時は `ready` にフォールバック

---

## アクセシビリティ（WCAG 2.1 AA）

| 要件                     | 実装方法                                        |
| ------------------------ | ----------------------------------------------- |
| キーボードナビゲーション | Tab順序の論理的配置                             |
| スクリーンリーダー       | `aria-live="polite"` でストリーミング更新を通知 |
| フォーカス管理           | PermissionDialog開閉時の適切なフォーカス移動    |
| 色コントラスト           | 4.5:1以上のコントラスト比確保                   |
| エラー状態               | アイコン + テキストで色以外でも伝達             |

---
