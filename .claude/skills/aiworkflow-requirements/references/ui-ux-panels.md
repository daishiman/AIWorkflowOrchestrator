# パネル・セレクター UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントは、パネル系UIコンポーネントとセレクターの設計ガイドラインを定義する。

## ドキュメント構成

| ドキュメント | ファイル | 説明 |
|-------------|----------|------|
| 検索・置換パネル | [ui-ux-search-panel.md](./ui-ux-search-panel.md) | UnifiedSearchPanelの3モード設計 |
| ファイルセレクター | [ui-ux-file-selector.md](./ui-ux-file-selector.md) | external/workspaceモードの設計 |

---

## アイコンとイラスト

### アイコンライブラリの選定

| 候補             | 特徴                                  | 推奨用途             |
| ---------------- | ------------------------------------- | -------------------- |
| Lucide Icons     | シンプル、一貫性、React対応、OSS      | 標準UIアイコン       |
| Heroicons        | Tailwind公式、シンプル                | Tailwindプロジェクト |
| Phosphor Icons   | 豊富なバリエーション、6種類のウェイト | 表現力が必要な場合   |
| カスタムアイコン | プロダクト固有                        | ブランドアイコン     |

**推奨**: **Lucide Icons** を標準採用する

### サイズ規則

| 用途                       | サイズ    | 対応するテキストサイズ   |
| -------------------------- | --------- | ------------------------ |
| インラインアイコン（小）   | 16px      | text-sm（14px）          |
| インラインアイコン（標準） | 20px      | text-base（16px）        |
| ボタン内アイコン           | 20px      | ボタンテキストと同等     |
| ナビゲーションアイコン     | 24px      | text-lg（18px）          |
| 大きなアイコン             | 32px-48px | 見出し、強調表示         |
| イラスト的使用             | 64px以上  | 空状態、オンボーディング |

### 使用ガイドライン

| ルール           | 説明                                              |
| ---------------- | ------------------------------------------------- |
| 一貫したウェイト | 同一プロジェクト内でアウトライン/塗りつぶしを統一 |
| 意味の一貫性     | 同じ概念には同じアイコンを使用                    |
| テキストとの併用 | 重要な操作にはアイコン+テキストラベル             |
| アクセシビリティ | 意味を持つアイコンには`aria-label`を設定          |
| 色の適用         | `currentColor`で親要素の色を継承                  |
| ストローク幅     | 1.5px-2pxで視認性を確保                           |

---

## パネル共通ガイドライン

### レイアウト原則

| 原則 | 説明 |
|------|------|
| 一貫性 | 同種のパネルは同じレイアウトパターンを採用 |
| 階層構造 | ヘッダー → コンテンツ → フッターの順序 |
| フォーカス管理 | パネル表示時に適切な要素にフォーカス |
| キーボード対応 | Escapeで閉じる、Tab循環 |

### アクセシビリティ共通要件

| 要件 | 実装方針 |
|------|----------|
| role属性 | パネル種別に応じた適切なrole |
| aria-label | 操作ボタンに明確なラベル |
| フォーカストラップ | モーダル時はパネル内にフォーカスを閉じ込め |
| キーボードナビゲーション | 全操作がキーボードで実行可能 |

---

## ChatPanel 実AIチャット配線設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001）

TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 で確立された ChatPanel の実チャット配線設計。placeholder 3箇所（model-selector-slot, message-list-slot, chat-input-slot）を実コンポーネントに置換する際の設計指針。

### 設計完了記録（2026-03-18）

| 項目 | 内容 |
|------|------|
| 完了日 | 2026-03-18 |
| Phase | Phase 1-12 完了（設計タスク） |
| 状態機械 | 8状態 × 4 AccessCapability |
| コンポーネント | 12コンポーネント（LLMSelectorPanel, ChatMessageList, ComposerArea（ComposerInput + SendButton）, StreamingMessage 等） |
| IPCチャンネル | 10チャンネル（chat:send, chat:stream, chat:abort 等） |
| テスト | 185テスト ALL PASS |
| MINOR未タスク | MINOR-1（handleSendMessage ストリーミング中ガード）、MINOR-2（chatSlice streaming テスト不足） |

### chatSlice 拡張設計

| 状態 | 型 | 説明 |
|------|-----|------|
| chatPanelStatus | 8状態ユニオン | idle / loading / streaming / error / complete 等 |
| chatMessages | ChatMessage[] | メッセージ一覧 |
| streamingContent | string | ストリーミング中テキスト |
| streamingError | Error \| null | ストリーミングエラー |
| chatInput | string | 入力中テキスト |
| setChatInput | action | 入力値更新アクション |

### 個別セレクタ（P31対策）

| セレクタ | 用途 |
|----------|------|
| useChatPanelStatus | チャットパネル状態取得 |
| useChatMessages | メッセージ一覧取得 |
| useStreamingContent | ストリーミングコンテンツ取得 |
| useChatInput | 入力値取得 |
| useSetChatInput | 入力値更新アクション取得 |

### 関連仕様

- TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 Phase 1-12 仕様書: `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring/`
- 後続未タスク: `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` (MINOR-1, MINOR-2)

---

## ChatPanel統合パターン（TASK-7D）

TASK-7D ChatPanel Agent統合で確立されたパネル統合パターン。既存パネルに子コンポーネントを条件レンダーで統合する際の設計指針。

### 統合パターン概要

| 項目 | 内容 |
|------|------|
| 対象 | ChatPanel（既存Organism） + SkillStreamingView（新規Organism） |
| 統合方式 | 条件レンダー（`isExecuting && selectedSkillName`） |
| 状態管理 | Zustand Store個別セレクタ（再レンダー最適化） |
| 外部API公開 | forwardRef + useImperativeHandle |

### レイアウトパターン

| パターン | 説明 | 適用例 |
|----------|------|--------|
| 条件レンダー統合 | Store状態に基づき子コンポーネントを切替表示 | ChatPanel → SkillStreamingView |
| ヘッダー・コンテンツ分離 | StatusBadgeをヘッダー、StreamMessageをコンテンツに配置 | SkillStreamingView内部 |
| 折りたたみ履歴 | ToolExecutionHistoryを展開・折りたたみで表示 | ツール実行結果 |

### アクセシビリティ統合パターン

| 要件 | 実装パターン |
|------|-------------|
| ストリーミング通知 | `aria-live="polite"` でメッセージ追加を通知 |
| ステータス変更通知 | StatusBadgeに `role="status"` |
| フォーカス管理 | パネル切替時にコンテンツ先頭へフォーカス移動 |
| キーボード操作 | ToolExecutionHistoryの展開をEnter/Spaceで操作 |

### 関連仕様

- [ChatPanel統合仕様](./interfaces-agent-sdk-ui.md) - TASK-7D完了タスクセクション
- [ChatPanel統合UIフロー](./ui-ux-agent-execution.md) - Agent Execution UI全体フロー
- [SkillStreamingView詳細](./ui-ux-feature-components.md) - コンポーネント仕様

---

## ChatPanel Review Harness（TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001）

ChatPanel は review harness として機能し、mainline（ChatView）との契約整合性を維持しながら UI レビュー・ビジュアル検証を行う。JSDoc `@role review-harness` で役割を明示。

### Lane 設計

| Lane | コンポーネント | 役割 |
|------|---------------|------|
| Mainline | ChatView | 本番 AI チャット |
| Review Harness | ChatPanel | UI 確認・ビジュアル検証 |

### GAP-01〜04 no-op 排除

| GAP | コールバック | handler | 配線先 |
|-----|------------|---------|--------|
| GAP-01 | onTerminalSwitch | handleTerminalSwitch | `setCurrentView("agent")` |
| GAP-02 | onSelectProvider | handleSelectProvider | `selectProvider(id)` |
| GAP-03 | onSelectModel | handleSelectModel | `selectModel(id)` |
| GAP-04 | onOpenTerminal | handleOpenTerminal | `setCurrentView("agent")` |

GAP-01/04 は ViewType "terminal" 未追加のため "agent" で代替。後続: UT-VIEWTYPE-TERMINAL-ADDITION。

### 設計完了記録（2026-03-23）

- Phase 1-13 完了（設計タスク）、テスト 24件 ALL PASS
- 未タスク 3件: UT-CHATPANEL-OPEN-TERMINAL-IPC-HANDLER / UT-CHATPANEL-PROPS-ROLE-TYPE / UT-VIEWTYPE-TERMINAL-ADDITION
- 仕様書: `docs/30-workflows/step-05-par-task-07-chatpanel-review-harness-alignment/`

---

## 関連ドキュメント

- [基本UI/UXガイドライン](./ui-ux-basics.md)
- [アクセシビリティガイドライン](./accessibility.md)
- [色・スペーシングガイドライン](./ui-ux-design-tokens.md)
