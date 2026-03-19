# Phase 2 設計: ChatPanel UX 実現仕様（Task 2-5）

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| Phase      | 2                                   |
| Task       | 2-5 UX設計                          |
| 作成日     | 2026-03-18                          |
| ステータス | completed                           |
| 担当Agent  | UX Agent                            |
| 参照Phase  | Phase 1 requirements-definition.md  |

---

## 1. 画面構成図（ASCII）

```
+------------------------------------------------------------------+
| Runtime Banner                              [Terminal]           |
| [badge: API利用中 | Terminal経由 | 利用不可]  role="status"      |
+------------------------------------------------------------------+
| Message List                                                     |
|   role="log" aria-live="polite"                                  |
|                                                                  |
|   [Empty State: capability 別 4 パターン]                        |
|   [user bubble]                                                  |
|   [assistant bubble]                                             |
|   [StreamingMessage + pulse cursor]  aria-busy={isStreaming}     |
|   [ErrorGuidance]  role="alert"                                  |
|   [HandoffBlock]  (capability=terminalSurface 時のみ)            |
+------------------------------------------------------------------+
| Composer Area                                                    |
|   [AttachmentChip...]  [input field]  [CancelBtn] [SendBtn]      |
|   [Terminal handoff secondary CTA]                               |
+------------------------------------------------------------------+
| Terminal Dock (bottom sheet / side dock, collapsed by default)  |
| Share Actions: 選択範囲を送る / 直近出力を添付                   |
+------------------------------------------------------------------+
```

---

## 2. 状態別 UI 表示テーブル

以下の 8 状態それぞれについて、RuntimeBanner / MessageList / ComposerArea の表示を定義する。

| 状態        | RuntimeBanner                                                  | MessageList                                                            | ComposerArea                                                           |
| ----------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `idle`      | capability 解決待ちスピナー（控えめ）                          | Empty State（capability 解決中のため非表示 or スケルトン）             | 入力フィールド disabled、送信ボタン disabled                           |
| `ready`     | capability に応じたバッジ表示（後述）                          | Empty State（capability 別 4 パターン） / 既存メッセージ履歴           | 入力フィールド有効、送信ボタン有効（入力ありの場合）                   |
| `streaming` | バッジ変化なし（ストリーミング中を示すパルスはカーソルで表現） | StreamingMessage 末尾にパルスカーソル表示、`aria-busy=true`            | 入力フィールド disabled、送信ボタン非表示、キャンセルボタン表示        |
| `cancelled` | バッジ変化なし                                                 | 累積済みコンテンツを保持（末尾に「応答がキャンセルされました」ラベル） | 入力フィールド有効、送信ボタン有効                                     |
| `completed` | バッジ変化なし                                                 | assistant バブル確定表示（パルスカーソル消滅）                         | 入力フィールド有効、送信ボタン有効                                     |
| `error`     | バッジ変化なし                                                 | ErrorGuidance（`role="alert"`）をメッセージリスト末尾に表示            | 入力フィールド有効（retryable の場合）、再試行ボタン表示               |
| `blocked`   | `[設定が必要です]` バッジ（systemOrange / `#FF9500`）          | Empty State: `none` パターン（設定誘導 CTA）                           | 入力フィールド disabled、送信ボタン disabled、「設定を開く」ボタン表示 |
| `handoff`   | `[Terminal経由]` バッジ（systemBlue / `#007AFF`）              | HandoffBlock 表示（terminalCommand / contextSummary / reason）         | 入力フィールド disabled、「Terminalで続ける」ボタン表示                |

### RuntimeBanner バッジ定義（capability 別）

| capability          | バッジラベル           | カラー                            | role   |
| ------------------- | ---------------------- | --------------------------------- | ------ |
| `integratedRuntime` | `API利用中`            | systemGreen（#34C759 / #30D158）  | status |
| `both`              | `API利用中 + Terminal` | systemGreen（#34C759 / #30D158）  | status |
| `terminalSurface`   | `Terminal経由`         | systemBlue（#007AFF / #0A84FF）   | status |
| `none`              | `設定が必要です`       | systemOrange（#FF9500 / #FF9F0A） | status |

---

## 3. Empty State 表示（capability 別 4 パターン）

| capability          | 見出し                                     | 説明文                                                         | CTA                                              |
| ------------------- | ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------ |
| `integratedRuntime` | `AIチャットが利用可能です`                 | 質問を入力してください。AIが直接回答します。                   | なし（Composer にフォーカスを移すだけ）          |
| `terminalSurface`   | `Terminal経由でAIを利用できます`           | この画面では自動実行せず、Terminal で手動実行します。          | `[Terminalを開く]`（PersistentTerminalLauncher） |
| `both`              | `AIチャットとTerminalの両方が利用可能です` | 直接チャットするか、Terminal で手動実行するかを選べます。      | `[Terminalを開く]`（secondary）                  |
| `none`              | `AI機能を利用するには設定が必要です`       | API キーを設定すると、このパネルで直接 AI とチャットできます。 | `[設定を開く]`（systemBlue、primary CTA）        |

### Empty State 表示条件

- メッセージ履歴が 0 件の場合のみ表示する。
- 既存の `conversationId` があり `conversation:get` でメッセージ復元済みの場合は表示しない。

---

## 4. ErrorGuidance 分岐（LLMErrorCode 10 値）

| エラーコード              | retryable | ガイダンスメッセージ                                                               | CTA                                        |
| ------------------------- | --------- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `API_KEY_MISSING`         | false     | 「API キーが設定されていません。設定画面で登録してください。」                     | `[設定を開く]`（systemBlue）               |
| `API_KEY_INVALID`         | false     | 「API キーが無効です。設定画面で正しいキーを登録してください。」                   | `[設定を開く]`（systemBlue）               |
| `NETWORK_ERROR`           | true      | 「ネットワークエラーが発生しました。接続を確認して再試行してください。」           | `[再試行]`（systemBlue）                   |
| `TIMEOUT`                 | true      | 「応答がタイムアウトしました。再試行してください。」                               | `[再試行]`（systemBlue）                   |
| `RATE_LIMIT`              | true      | 「リクエスト制限に達しました。しばらく待ってから再試行してください。」             | `[再試行]`（systemBlue、delay 表示付き）   |
| `SERVICE_UNAVAILABLE`     | true      | 「サービスが一時的に利用できません。しばらく待ってから再試行してください。」       | `[再試行]`（systemBlue）                   |
| `CONTENT_FILTER`          | false     | 「コンテンツポリシーにより処理できませんでした。メッセージを修正してください。」   | `[メッセージを修正する]`（テキストリンク） |
| `CONTEXT_LENGTH_EXCEEDED` | false     | 「メッセージが長すぎます。会話をリセットするか、短いメッセージを送ってください。」 | `[会話をリセット]`（systemOrange）         |
| `MODEL_NOT_FOUND`         | false     | 「選択中のモデルが見つかりません。別のモデルを選択してください。」                 | `[モデルを選択]`（systemBlue）             |
| `UNKNOWN`                 | true      | 「予期しないエラーが発生しました。再試行してください。」                           | `[再試行]`（systemBlue）                   |

### ErrorGuidance 共通仕様

- 表示領域は `role="alert"` を持つ。
- エラー発生時も累積済みコンテンツは破棄しない。
- retryable エラーの再試行ボタン押下時は、前回と同じ request を再送信する。
- `API_KEY_MISSING` / `API_KEY_INVALID` の「設定を開く」は AuthGuard バイパスで設定画面に遷移する。

---

## 5. Primary / Secondary CTA 定義

| CTA              | ラベル             | 種別      | 表示条件                                                     | アクション                                          |
| ---------------- | ------------------ | --------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Primary Send     | `送信する`         | Primary   | `ready` 状態かつ入力フィールドに trim 後空文字でない入力あり | `llm:stream-chat` invoke（または `AI_CHAT`）        |
| Cancel           | `応答をキャンセル` | Danger    | `streaming` 状態中のみ                                       | `llm.cancelStream()` → AbortController.abort()      |
| Terminal Open    | `Terminalを開く`   | Secondary | `terminalSurface` / `both` capability 時                     | Terminal Dock を開く（PersistentTerminalLauncher）  |
| Terminal Handoff | `Terminalで続ける` | Secondary | `handoff` 状態時                                             | Terminal Dock を開き HandoffBlock の command を表示 |
| Settings Open    | `設定を開く`       | Secondary | `blocked` 状態時 / `none` capability 時                      | 設定画面へ遷移（AuthGuard バイパス）                |
| Retry            | `再試行`           | Secondary | retryable エラー発生時                                       | 前回リクエストを再送信                              |
| Reset Conv.      | `会話をリセット`   | Secondary | `CONTEXT_LENGTH_EXCEEDED` エラー時                           | conversationId をクリア、messages をリセット        |

### CTA の優先度と排他ルール

- `streaming` 中は Primary Send ボタンを非表示にし、Cancel ボタンのみを表示する。
- `blocked` / `handoff` 状態では Primary Send ボタンを disabled にする（非表示ではなく disabled）。
- Secondary CTA は同時に複数表示してよいが、最大 2 つまでとする。

---

## 6. コンポーネント階層（Atomic Design 準拠）

```
ChatPanel [organism]
  RuntimeBanner [molecule]
    CapabilityBadge [atom]
    PersistentTerminalLauncher [atom]  (右上 [Terminal] ボタン)
  ChatMessageList [molecule]
    ChatMessageBubble [atom]  × n  (role=user / role=assistant)
    StreamingMessage [atom]         (memo + forwardRef)
    ErrorGuidance [atom]            (role="alert")
    HandoffBlock [molecule]         (capability=terminalSurface 時)
      HandoffCommandBlock [atom]    (コピー可能コードブロック)
      PersistentTerminalLauncher [atom]
    EmptyState [molecule]           (messages.length === 0 時)
      SuggestionBubbles [atom]      (integratedRuntime / both のみ)
  ComposerArea [molecule]
    ComposerAttachmentChip [atom]   × n
    ComposerInput [atom]            (textarea)
    SendButton [atom]               (disabled / enabled)
    CancelButton [atom]             (streaming 中のみ表示)
    TerminalHandoffButton [atom]    (secondary CTA)
  TerminalDock [organism]           (bottom sheet / side dock)
    TranscriptPanel [molecule]
    TranscriptShareActions [molecule]
```

---

## 7. Apple HIG 準拠ビジュアルスタイル

### カラーパレット

| 用途                   | ライトモード           | ダークモード            |
| ---------------------- | ---------------------- | ----------------------- |
| 背景（ChatPanel）      | `#FFFFFF`              | `#000000`               |
| メッセージ背景（user） | `#007AFF` (systemBlue) | `#0A84FF`               |
| メッセージ背景（AI）   | `#F2F2F7`              | `#1C1C1E`               |
| プライマリテキスト     | `#000000`              | `#FFFFFF`               |
| セカンダリテキスト     | `rgba(60,60,67,0.6)`   | `rgba(235,235,245,0.6)` |
| Primary CTA（送信）    | `#007AFF`              | `#0A84FF`               |
| Cancel / Danger CTA    | `#FF3B30`              | `#FF453A`               |
| エラー表示             | `#FF3B30`              | `#FF453A`               |
| 成功 / ready バッジ    | `#34C759`              | `#30D158`               |
| 警告 / none バッジ     | `#FF9500`              | `#FF9F0A`               |
| ボーダー               | `#C6C6C8`              | `#38383A`               |

### スペーシング・形状

| 項目           | 値                           |
| -------------- | ---------------------------- |
| グリッド       | 8px ベース                   |
| メッセージ間隔 | 8px                          |
| バブル内余白   | 12px 16px                    |
| バブル角丸     | 12px（自分側は右下 4px）     |
| Composer 角丸  | 12px                         |
| カード影       | `0 1px 3px rgba(0,0,0,0.04)` |
| ボタン角丸     | 8px                          |

### アニメーション

| 項目                           | 値                       |
| ------------------------------ | ------------------------ |
| 送信ボタン有効化トランジション | 200ms ease-out           |
| StreamingMessage 追記          | なし（即時反映）         |
| パルスカーソル                 | 600ms ease-in-out ループ |
| ErrorGuidance 出現             | 200ms fade-in            |
| HandoffBlock 出現              | 300ms slide-in-up        |
| TerminalDock 開閉              | 250ms ease-in-out        |

### アクセシビリティ（WCAG 2.1 AA）

| 要件               | 実装                                                               |
| ------------------ | ------------------------------------------------------------------ |
| コントラスト比     | 4.5:1 以上（通常テキスト）、3:1 以上（大テキスト / UI 部品）       |
| キーボード操作     | Tab で全 CTA に到達可能、Escape でキャンセル                       |
| メッセージリスト   | `role="log"` + `aria-live="polite"`                                |
| ストリーミング領域 | `role="status"` + `aria-live="polite"` + `aria-busy={isStreaming}` |
| エラー表示         | `role="alert"`                                                     |
| キャンセルボタン   | `aria-label="応答をキャンセル"`                                    |
| RuntimeBanner      | `role="status"`                                                    |
| フォーカス管理     | ErrorGuidance / HandoffBlock 出現時に heading へフォーカス移動     |

---

## 8. 状態遷移まとめ

```
[*] --> idle
idle --> ready         : capability 解決（integratedRuntime | both）
idle --> handoff       : capability 解決（terminalSurface）
idle --> blocked       : capability 解決（none）
ready --> streaming    : ユーザーがメッセージを送信
streaming --> completed: llm:stream-done 受信
streaming --> cancelled: cancel ボタン押下 / Escape キー
streaming --> error    : llm:stream-error 受信
completed --> ready    : 次のメッセージ入力待ち
cancelled --> ready    : 次のメッセージ入力待ち
error --> ready        : retryable エラーで再試行 / メッセージ修正
blocked --> ready      : 設定画面で API キー登録後（IPC capability 再解決）
handoff --> ready      : 設定画面で API キー登録後（IPC capability 再解決）
```

---

## 変更履歴

| バージョン | 日付       | 変更内容                    |
| ---------- | ---------- | --------------------------- |
| v1.0.0     | 2026-03-18 | 初版作成（Task 2-5 UX設計） |
