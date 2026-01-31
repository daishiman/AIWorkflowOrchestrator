# Agent Execution UI コンポーネント

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [ui-ux-components.md](./ui-ux-components.md)
>
> **タスクID**: AGENT-004

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                            |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------- |
| v1.0.0     | 初版       | 初期作成                                                                                            |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換                                          |
| v1.3.0     | 2026-01-31 | TASK-IMP-permission-tool-icons完了: ツールアイコンバッジ視覚仕様追加、完了タスク・関連ドキュメント拡充 |
| v1.2.0     | 2026-01-30 | TASK-7C完了: PermissionDialog 3ボタンパターン実装、Store-directパターン、skill/PermissionDialog.tsx |

---

## 概要

エージェント実行画面のUI/UXコンポーネント仕様。チャットインターフェース、ストリーミング出力、権限確認ダイアログを提供する。

---

## コンポーネント階層

| レベル | コンポーネント         | 種別                  | 親コンポーネント       | 子コンポーネント                                                                        |
| ------ | ---------------------- | --------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| 1      | AgentExecutionView     | views                 | -                      | Header, AgentChatInterface, AgentExecutionControls, AgentMessageInput, PermissionDialog |
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
| 本文       | 引数詳細（formatArgs）             | command: `ls -la`          | command/pathは直接表示、他はJSON                       |
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
| 5        | agent:start IPC送信                | Main Processへエージェント実行を要求     |
| 6        | ストリーミング応答を受信・表示     | AgentOutputStreamでリアルタイム表示      |
| 7        | 完了後、入力欄を有効化             | 次のメッセージ入力を許可                 |

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

## アクセシビリティ（WCAG 2.1 AA）

| 要件                     | 実装方法                                        |
| ------------------------ | ----------------------------------------------- |
| キーボードナビゲーション | Tab順序の論理的配置                             |
| スクリーンリーダー       | `aria-live="polite"` でストリーミング更新を通知 |
| フォーカス管理           | PermissionDialog開閉時の適切なフォーカス移動    |
| 色コントラスト           | 4.5:1以上のコントラスト比確保                   |
| エラー状態               | アイコン + テキストで色以外でも伝達             |

---

## 完了タスク

| タスクID | 完了日 | 主要成果物 |
| -------- | ------ | ---------- |
| TASK-7C  | 2026-01-30 | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`, `PermissionDialog.test.tsx`（40テスト） |
| task-imp-permission-tool-icons-001 | 2026-01-30 | `PermissionDialog.tsx`（TOOL_ICONS/getToolIcon/formatArgs追加）、`PermissionDialog.test.tsx`（57テスト） |

## 関連ドキュメント

| ドキュメント                       | パス                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Agent SDK仕様                      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                   |
| Agent SDK UI型仕様                 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                |
| Agent Execution UI実装ガイド       | `docs/30-workflows/agent-execution-ui/outputs/phase-12/implementation-guide.md`               |
| コンポーネント設計書               | `docs/30-workflows/agent-execution-ui/outputs/phase-2/component-design.md`                    |
| PermissionDialog実装ガイド         | `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md`        |
| ツールアイコン実装ガイド           | `docs/30-workflows/completed-tasks/TASK-IMP-permission-tool-icons/outputs/phase-12/implementation-guide.md`   |
| UI/UXコンポーネント概要            | `./ui-ux-components.md`                                                                       |
| デザイン原則                       | `./ui-ux-design-principles.md`                                                                |
| 機能別UIコンポーネント             | `./ui-ux-feature-components.md`                                                               |
