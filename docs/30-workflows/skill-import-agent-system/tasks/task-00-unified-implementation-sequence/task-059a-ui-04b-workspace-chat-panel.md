# TASK-UI-04B-WORKSPACE-CHAT: ワークスペースChatPanel

## 1. メタ情報

| 項目             | 値                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-UI-04B-WORKSPACE-CHAT                                                                                                                                                             |
| 元タスクID       | TASK-UI-04-WORKSPACE-VIEW（分割元）                                                                                                                                                    |
| ステータス       | 未着手                                                                                                                                                                                 |
| 優先度           | high                                                                                                                                                                                   |
| 複雑度           | medium                                                                                                                                                                                 |
| 推定ファイル数   | ~10                                                                                                                                                                                    |
| 依存タスク       | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-04A（レイアウト基盤）                                                                                                |
| ブロック対象     | なし（04C と並列実行可能）                                                                                                                                                             |
| 対象ビュー       | WorkspaceView 内 ChatPanel ペイン                                                                                                                                                      |
| 関連スライス     | `chatSlice`（パターン参照）, `workspaceChatSlice`（将来検討）                                                                                                                          |
| 関連 IPC         | `llm:*`, `conversation:*`                                                                                                                                                              |
| 設計哲学         | **タップ＆ディスカバー** — 大きなサジェスチョンバブルで「次の一歩」を提示し、タップするだけで対話が始まる。入力欄が常に主役                                                            |
| 関連ドキュメント | [04A-workspace-layout-filebrowser.md](./task-058b-ui-04a-workspace-layout-filebrowser.md), [04C-workspace-preview-quicksearch.md](./task-059b-ui-04c-workspace-preview-quicksearch.md) |

## 2. 目的

ワークスペース画面内の ChatPanel ペインを実装する。選択中ファイルの内容を自動的に背景情報に含め、AI との対話で「このコードを説明して」「バグを見つけて」といったファイル付きチャットワークフローを実現する。

**設計哲学「タップ＆ディスカバー」**: チャット未開始のゼロステートに3つの大きなサジェスチョンバブルを配置し、ユーザーが「何を聞けばいいか」を迷わない導線を構築する。バブルをタップすると入力欄にテキストがフェードインで瞬時に表示され、即座に送信可能な状態になる。入力欄はChatPanelの「主役」として常に視覚的に強調される。

**体験レベル設計:**

- **Level 1**: 入力欄（主役）+ SuggestionBubble 3つが目に入る
- **Level 2**: バブルタップでテキスト入力、メッセージのやり取りが始まる
- **全操作にフィードバック**: ホバー、タップ、送信、応答開始の全てにマイクロインタラクション

レイアウト基盤（3ペイン構造、リサイズ機構）は [04A](./task-058b-ui-04a-workspace-layout-filebrowser.md) で提供される。本ドキュメントでは ChatPanel の内部設計に集中する。

## 3. ChatPanel ペイン設計

### 3.1 概要

ワークスペースの背景情報付きチャットパネル。選択中ファイルの内容を自動的に背景情報に含め、AI との対話で「このコードを説明して」といったワークフローを実現する。入力欄を視覚的な「主役」として強調し、ゼロステートではサジェスチョンバブルで対話の入り口を提供する。

### 3.2 チャット機能仕様

| 機能             | 実装方針                                                       |
| ---------------- | -------------------------------------------------------------- |
| メッセージ送受信 | 既存 `AgentChatInterface` のパターンを参考にした新規実装       |
| ファイル背景情報 | 選択中ファイルの内容を自動的にシステムプロンプトに含める       |
| 逐次表示         | `window.electronAPI.llm.streamChat` + `onStreamChunk` パターン |
| 会話永続化       | `conversationAPI.create` / `conversationAPI.addMessage` で保存 |
| ファイル参照     | `@mention` でファイル参照（入力中に `@` でオートコンプリート） |

### 3.3 チャット入力エリア（主役UI）

入力欄はChatPanelの「主役」として視覚的に強調する。アクセントボーダー、広い余白、大きめの送信ボタンで「ここに入力してください」というメッセージを視覚的に伝える。

#### 3.3.1 入力欄スタイル

```css
.workspace-chat-input-container {
  /* アクセントボーダーで主役を強調 */
  border: 2px solid var(--accent);
  border-radius: 12px;
  background: var(--bg-elevated);
  min-height: 56px;
  padding: 16px;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.workspace-chat-input-container:focus-within {
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
}
```

| 項目             | 仕様                                          |
| ---------------- | --------------------------------------------- |
| ボーダー         | `2px solid var(--accent)`（アクセントカラー） |
| 角丸             | `12px`                                        |
| 最低高さ         | 56px（リッチな印象）                          |
| 内余白           | `16px`（広めの余白で呼吸感を確保）            |
| 背景             | `--bg-elevated`                               |
| フォーカス時     | `--accent` の薄い外側グロー（3px、15%透過度） |
| プレースホルダー | 「何でも聞いてみよう...」                     |
| テキストサイズ   | `--text-base`                                 |

#### 3.3.2 送信ボタン

```typescript
interface SendButtonProps {
  /** 送信可能状態（入力テキストが空でない場合 true） */
  isEnabled: boolean;
  /** 送信中（応答待ち） */
  isSending: boolean;
  /** クリックハンドラ */
  onClick: () => void;
}
```

| 項目           | 仕様                                                   |
| -------------- | ------------------------------------------------------ |
| 形状           | 丸型（`border-radius: 50%`）                           |
| サイズ         | **44 x 44px**（大きめ、タッチターゲット準拠）          |
| 背景色         | `var(--accent)`（アクセントカラー）                    |
| アイコン       | `ArrowUp`（lucide-react）、`--text-inverse` カラー     |
| 無効時         | `opacity: 0.4`、`cursor: not-allowed`                  |
| ホバー         | **`scale(1.02)`**、`--duration-fast` `--ease-out`      |
| タップ         | **`scale(0.97)`**                                      |
| 送信後         | アイコンが `ArrowUp` → `Check` にモーフィング（300ms） |
| モーフィング後 | 1秒後に `Check` → `ArrowUp` に戻る                     |

```css
.send-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.send-button:hover:not(:disabled) {
  transform: scale(1.02);
}

.send-button:active:not(:disabled) {
  transform: scale(0.97);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

#### 3.3.3 ファイル背景情報の表示（入力欄上部）

選択中のファイル背景情報は入力欄の**上部にチップ形式**で簡素に表示する。

```
┌─ ファイル背景情報チップ ───────────────────────────┐
│  📎 index.tsx ×  │  📎 utils.ts ×                  │
│  ファイルの背景情報をAIに伝えています               │
├────────────────────────────────────────────────────┤
│  何でも聞いてみよう...                      [送信] │
└────────────────────────────────────────────────────┘
```

```typescript
interface FileContextChipProps {
  /** ファイル名 */
  fileName: string;
  /** 除去ハンドラ */
  onRemove: () => void;
}
```

| 項目         | 仕様                                                     |
| ------------ | -------------------------------------------------------- |
| チップ外観   | `--bg-tertiary` 背景、角丸 `6px`、`--text-xs` フォント   |
| アイコン     | `Paperclip`（lucide-react）14px、`--text-secondary`      |
| 除去ボタン   | `X` アイコン 12px、ホバー時 `--status-error` カラー      |
| 補助テキスト | 「ファイルの背景情報をAIに伝えています」、`--text-muted` |
| 表示条件     | ファイル背景情報が1つ以上ある場合のみ表示                |
| 最大表示数   | チップ3つまで表示、超過時は「+N件」バッジ                |

### 3.4 ファイル背景情報連携

```typescript
// ファイル背景情報構築ロジック
interface FileContext {
  filePath: string;
  fileName: string;
  content: string;
  language: string; // TypeScript, Markdown 等
  lineCount: number;
}

// システムプロンプトへの背景情報埋め込み
function buildSystemPromptWithContext(
  basePrompt: string,
  fileContext: FileContext | null,
): string {
  if (!fileContext) return basePrompt;

  return `${basePrompt}

--- 現在選択中のファイル ---
ファイル: ${fileContext.filePath}
言語: ${fileContext.language}
行数: ${fileContext.lineCount}
内容:
\`\`\`${fileContext.language}
${fileContext.content}
\`\`\`
--- ファイル背景情報終了 ---`;
}
```

### 3.5 @mention ファイル参照

- トリガー: 入力中に `@` を入力
- オートコンプリート: ワークスペース内のファイル名をファジー検索
- 選択: Arrow Up/Down で移動、Enter/Tab で確定
- 確定後の表示: `@filename.ts` がインラインバッジとして表示
- バッジクリック: 該当ファイルをプレビューパネルに表示
- IPC: `file:read` でファイル内容を取得して背景情報に追加

#### 3.5.1 @mentionオートコンプリートのマイクロインタラクション

| 操作               | エフェクト                                             |
| ------------------ | ------------------------------------------------------ |
| `@` 入力           | ドロップダウンが `slideDown` + `fadeIn`（200ms）       |
| 候補ホバー         | 背景色 `--bg-hover` にフェード（100ms）                |
| Enter/Tab 確定     | 選択項目が `scale(0.97)` → `scale(1)` でフィードバック |
| ドロップダウン消失 | `slideUp` + `fadeOut`（150ms）                         |

```css
@keyframes slide-down-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mention-dropdown-enter {
  animation: slide-down-fade-in 200ms var(--ease-out) forwards;
}

@keyframes slide-up-fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

.mention-dropdown-exit {
  animation: slide-up-fade-out 150ms ease-in forwards;
}
```

### 3.6 メッセージ表示

```typescript
interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO 8601
  fileContexts: FileContext[]; // 添付されたファイル背景情報
}
```

- ユーザーメッセージ: 右寄せ、背景 `var(--bg-elevated)`
- AI メッセージ: 左寄せ、背景 `var(--bg-secondary)`
- ファイル背景情報バッジ: メッセージ上部に添付ファイル名を表示
- Markdown レンダリング: AI 応答を Markdown として表示
- コードブロック: シンタックスハイライト付き

#### 3.6.1 メッセージバブル出現アニメーション

全てのメッセージバブル（ユーザー・AI 両方）は出現時に以下のアニメーションで表示される。

```css
@keyframes message-appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble-enter {
  animation: message-appear 200ms var(--ease-out) forwards;
}
```

| 項目       | 仕様                             |
| ---------- | -------------------------------- |
| 初期状態   | `opacity: 0` + `translateY(8px)` |
| 最終状態   | `opacity: 1` + `translateY(0)`   |
| 所要時間   | 200ms                            |
| イージング | `var(--ease-out)`                |

#### 3.6.2 メッセージ送信アニメーション

ユーザーが送信ボタンをタップした際、入力欄のテキストが「上に飛んでいく」ようにユーザーメッセージバブルへ変化する。

```css
@keyframes send-fly-up {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  40% {
    opacity: 0.8;
    transform: translateY(-12px) scale(0.98);
  }
  100% {
    opacity: 0;
    transform: translateY(-24px) scale(0.95);
  }
}

.input-text-sending {
  animation: send-fly-up 250ms var(--ease-out) forwards;
}
```

**フロー:**

1. 送信ボタンタップ → 入力欄テキストに `send-fly-up` アニメーション適用
2. 250ms後 → 入力欄テキストがクリアされる
3. 同時に → ユーザーメッセージバブルが `message-appear` で上部に出現

#### 3.6.3 AI応答開始インジケーター（タイピングインジケーター）

AI応答の待機中は3つのドットがバウンスアニメーションで表示される。

```css
@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

.typing-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  display: inline-block;
  margin: 0 2px;
}

.typing-indicator-dot:nth-child(1) {
  animation: typing-bounce 1.2s ease-in-out infinite;
  animation-delay: 0ms;
}

.typing-indicator-dot:nth-child(2) {
  animation: typing-bounce 1.2s ease-in-out infinite;
  animation-delay: 200ms;
}

.typing-indicator-dot:nth-child(3) {
  animation: typing-bounce 1.2s ease-in-out infinite;
  animation-delay: 400ms;
}
```

| 項目           | 仕様                                             |
| -------------- | ------------------------------------------------ |
| ドット数       | 3つ                                              |
| ドットサイズ   | 8px（直径）                                      |
| ドット色       | `--text-muted`                                   |
| バウンス高さ   | 6px                                              |
| アニメ周期     | 1.2s（各ドット200msずつ遅延）                    |
| 表示タイミング | メッセージ送信後〜AI応答の最初のチャンク到着まで |
| 消失           | 最初のチャンク到着時に即座に非表示               |

### 3.7 チャット未開始時のゼロステート

#### 3.7.1 レイアウト

```
┌──────────────────────────────────────┐
│                                      │
│      EmptyState mood="welcoming"     │
│                                      │
│         💬 （MessageCircle）         │
│                                      │
│        何でも聞いてみよう            │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  💬 このコードを説明して     │    │  ← SuggestionBubble size="lg"
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  📝 バグを見つけて           │    │  ← SuggestionBubble size="lg"
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  🔧 リファクタリングの提案   │    │  ← SuggestionBubble size="lg"
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  何でも聞いてみよう...       [送信] │  ← アクセントボーダー入力欄
└──────────────────────────────────────┘
```

#### 3.7.2 EmptyState + SuggestionBubble 構成

ゼロステートは `EmptyState`（00で定義）コンポーネントを `compact` モード + **`mood="welcoming"`** で使用し、サジェスチョンバブルを `suggestions` プロパティで渡す。

```typescript
// ゼロステート構成
<EmptyState
  icon="MessageCircle"
  heading="何でも聞いてみよう"
  description=""
  compact={true}
  mood="welcoming"
  suggestions={[
    {
      label: "このコードを説明して",
      emoji: "💬",
      onClick: () => handleSuggestionClick("このコードを説明して"),
    },
    {
      label: "バグを見つけて",
      emoji: "📝",
      onClick: () => handleSuggestionClick("バグを見つけて"),
    },
    {
      label: "リファクタリングの提案",
      emoji: "🔧",
      onClick: () => handleSuggestionClick("リファクタリングの提案"),
    },
  ]}
/>
```

**サジェスチョンバブル仕様（3つ固定）:**

| #   | ラベル                 | アイコン | サイズ |
| --- | ---------------------- | -------- | ------ |
| 1   | このコードを説明して   | 💬       | `lg`   |
| 2   | バグを見つけて         | 📝       | `lg`   |
| 3   | リファクタリングの提案 | 🔧       | `lg`   |

- サイズ `lg`: 高さ 56px（00 SuggestionBubble 仕様準拠）
- アイコン: テキスト左に配置、20px
- テキスト: `--text-base`、`--text-primary`

#### 3.7.3 バブルタップ → フェードイン表示

サジェスチョンバブルをタップすると、入力欄にテキストが**フェードインで瞬時に表示**される。1文字ずつのタイピングではなく、テキスト全体が一度にフェードインする。

```typescript
// フェードイン表示 Hook
function useSuggestionInsert() {
  const [isInserting, setIsInserting] = useState(false);

  const insertText = useCallback(
    (text: string, onInsert: (text: string) => void) => {
      setIsInserting(true);
      // テキスト全体を一度にセット
      onInsert(text);
      // フェードインアニメーション完了後にフラグを戻す
      setTimeout(() => {
        setIsInserting(false);
      }, 200); // フェードイン所要時間
    },
    [],
  );

  return { isInserting, insertText };
}
```

```css
@keyframes text-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.input-text-inserting {
  animation: text-fade-in 200ms var(--ease-out) forwards;
}
```

| 項目     | 仕様                                   |
| -------- | -------------------------------------- |
| 表示方式 | テキスト全体がフェードインで瞬時に表示 |
| 所要時間 | 200ms（フェードイン）                  |
| 挿入中   | 送信ボタン有効（すぐに送信可能）       |
| 完了後   | ユーザーは編集も送信も可能             |

#### 3.7.4 サジェスチョンバブルのマイクロインタラクション

| 操作       | エフェクト                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| ホバー     | **`scale(1.02)`** + `shadow-sm` → `shadow-md`                              |
| アクティブ | **`scale(0.97)`**                                                          |
| タップ後   | `success-bounce` アニメーション（5C.4 `@keyframes success-bounce` 準拠）   |
| 消失       | テキスト挿入開始と同時にバブル群が `opacity: 1→0` + `scale(1→0.95)` で退出 |

```css
.suggestion-bubble {
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.suggestion-bubble:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.suggestion-bubble:active {
  transform: scale(0.97);
}

.suggestion-bubble-enter {
  animation: fade-in-up 200ms var(--ease-out) forwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-bubbles-exit {
  animation: fade-out-scale 150ms ease-in forwards;
}

@keyframes fade-out-scale {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

#### 3.7.5 ゼロステートの全体フロー

```
1. ChatPanel表示 → ゼロステート（EmptyState mood="welcoming" + 3つのSuggestionBubble）
2. ユーザーがバブルをタップ
3. バブルで success-bounce アニメーション再生
4. バブル群が fade-out-scale で退出
5. 入力欄にテキストがフェードインで瞬時に表示（200ms）
6. ユーザーはすぐに送信可能（テキスト編集も可能）
7. ユーザーが送信ボタンをタップ
   → 入力欄テキストに send-fly-up アニメーション適用
   → ユーザーメッセージバブルが message-appear で出現
8. AI応答待ち → タイピングインジケーター（3ドットバウンス）表示
9. AI応答チャンク到着 → インジケーター消失、応答テキスト逐次表示
10. 最初のメッセージ送信 → ゼロステート完全消失、通常チャットUIに遷移
```

## 4. コンポーネント階層

### 4.1 ChatPanel コンポーネントツリー

```
WorkspaceView/components/
└── WorkspaceChatPanel/
    ├── WorkspaceChatPanel.tsx       # チャット UI 本体（organisms）
    ├── WorkspaceChatInput.tsx       # 入力エリア（アクセントボーダー + 送信ボタン）（molecules）
    ├── WorkspaceChatMessage.tsx     # メッセージバブル（molecules）
    ├── WorkspaceChatZeroState.tsx   # ゼロステート（EmptyState + SuggestionBubble）（molecules）
    ├── TypingIndicator.tsx          # AI応答待ちインジケーター（atoms）
    ├── FileContextChip.tsx          # ファイル背景情報チップ（atoms）
    └── FileMentionAutocomplete.tsx  # @mention オートコンプリート（molecules）
```

### 4.2 Hooks

```
WorkspaceView/hooks/
├── useWorkspaceChat.ts              # チャット送受信ロジック
└── useSuggestionInsert.ts           # サジェスチョンフェードイン挿入
```

### 4.3 Atomic Design 分類

| レベル    | コンポーネント                                                                            |
| --------- | ----------------------------------------------------------------------------------------- |
| atoms     | FileContextChip, TypingIndicator                                                          |
| molecules | WorkspaceChatInput, WorkspaceChatMessage, WorkspaceChatZeroState, FileMentionAutocomplete |
| organisms | WorkspaceChatPanel                                                                        |

### 4.4 共通コンポーネントへの依存（00で定義済み）

| コンポーネント     | 用途                                            | 提供元     |
| ------------------ | ----------------------------------------------- | ---------- |
| `SuggestionBubble` | ゼロステートのサジェスチョンバブル（size="lg"） | TASK-UI-00 |
| `EmptyState`       | ゼロステート全体レイアウト（mood="welcoming"）  | TASK-UI-00 |

## 5. 状態管理

### 5.1 workspaceChatSlice について

チャット履歴の永続化が必要な場合に限り `workspaceChatSlice` を新規作成する。MVP では `useState` + `conversationAPI` 経由で永続化する方針を推奨する。永続化要件が確定した時点で検討する。

```typescript
// MVP では useState + conversationAPI で十分な可能性あり
// 永続化要件確定後に検討
```

### 5.2 既存スライスからの参照

ChatPanel は以下の既存スライスを参照する（詳細は [04A セクション 7.1](./task-058b-ui-04a-workspace-layout-filebrowser.md) 参照）:

| スライス         | 利用する状態/アクション                                  |
| ---------------- | -------------------------------------------------------- |
| `workspaceSlice` | `folderFileTrees`（@mention 候補のファイルリスト取得用） |
| `chatSlice`      | チャットメッセージのパターン参照（直接利用はしない）     |

### 5.3 ゼロステート状態管理

```typescript
// WorkspaceChatPanel 内のローカル状態
const [hasMessages, setHasMessages] = useState(false);
const [isZeroStateExiting, setIsZeroStateExiting] = useState(false);

// ゼロステートの表示/非表示
// hasMessages === false && !isZeroStateExiting → ゼロステート表示
// isZeroStateExiting === true → 退出アニメーション中
// hasMessages === true → 通常チャットUI
```

## 6. IPC 連携

### 6.1 既存 IPC チャネルの活用（llm:_ / conversation:_）

| チャネル名                | 方向   | 用途                      | ハンドラ位置              |
| ------------------------- | ------ | ------------------------- | ------------------------- |
| `llm:stream-chat`         | invoke | LLM チャット開始          | `llmHandlers.ts`          |
| `llm:stream-chunk`        | on     | 応答チャンク受信          | `llmHandlers.ts`          |
| `llm:stream-end`          | on     | 応答完了通知              | `llmHandlers.ts`          |
| `llm:stream-error`        | on     | 応答エラー通知            | `llmHandlers.ts`          |
| `conversation:create`     | invoke | 会話セッション作成        | `conversationHandlers.ts` |
| `conversation:addMessage` | invoke | メッセージ追加            | `conversationHandlers.ts` |
| `file:read`               | invoke | @mention ファイル内容取得 | `fileHandlers.ts`         |

> **注**: `workspace:*`, `file:*`（ツリー・監視）チャネルは [04A](./task-058b-ui-04a-workspace-layout-filebrowser.md) を参照。

## 7. マイクロインタラクション一覧

全ての操作にフィードバックを提供する。以下は本ドキュメントで定義する全マイクロインタラクションの一覧。

| 対象                     | 操作               | エフェクト                                | 所要時間 |
| ------------------------ | ------------------ | ----------------------------------------- | -------- |
| SuggestionBubble         | ホバー             | `scale(1.02)` + `shadow-sm` → `shadow-md` | fast     |
| SuggestionBubble         | タップ             | `scale(0.97)` → `success-bounce`          | 300ms    |
| SuggestionBubble群       | 退出               | `opacity: 1→0` + `scale(1→0.95)`          | 150ms    |
| 入力欄テキスト           | サジェスチョン挿入 | `opacity: 0→1`（フェードイン）            | 200ms    |
| 送信ボタン               | ホバー             | `scale(1.02)`                             | fast     |
| 送信ボタン               | タップ             | `scale(0.97)`                             | fast     |
| 送信ボタンアイコン       | 送信後             | `ArrowUp` → `Check` モーフィング          | 300ms    |
| 入力欄テキスト           | 送信時             | `send-fly-up`（上に飛んでいく）           | 250ms    |
| メッセージバブル         | 出現               | `opacity: 0→1` + `translateY(8px→0)`      | 200ms    |
| タイピングインジケーター | 表示中             | 3ドットバウンス                           | 1.2s周期 |
| @mentionドロップダウン   | 出現               | `slideDown` + `fadeIn`                    | 200ms    |
| @mentionドロップダウン   | 消失               | `slideUp` + `fadeOut`                     | 150ms    |
| @mention候補             | ホバー             | 背景色 `--bg-hover`                       | 100ms    |
| @mention候補             | 確定               | `scale(0.97)` → `scale(1)`                | fast     |
| ファイルチップ除去ボタン | ホバー             | カラー `--status-error`                   | fast     |

## 8. テスト計画

### 8.1 コンポーネントテスト

| テストファイル                    | テスト対象             | テスト項目                                                                  |
| --------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `WorkspaceChatPanel.test.tsx`     | WorkspaceChatPanel     | メッセージ送信、応答チャンク受信、ファイル背景情報添付                      |
| `WorkspaceChatZeroState.test.tsx` | WorkspaceChatZeroState | サジェスチョンバブル3つ表示、タップ時コールバック、退出アニメーションクラス |
| `WorkspaceChatInput.test.tsx`     | WorkspaceChatInput     | アクセントボーダー適用、送信ボタン有効/無効、プレースホルダー表示           |
| `TypingIndicator.test.tsx`        | TypingIndicator        | 3ドット表示、バウンスアニメーションクラス適用                               |

### 8.2 Hook テスト

| テストファイル                | テスト対象          | テスト項目                                                   |
| ----------------------------- | ------------------- | ------------------------------------------------------------ |
| `useWorkspaceChat.test.ts`    | useWorkspaceChat    | メッセージ送信、応答チャンク受信、背景情報構築               |
| `useSuggestionInsert.test.ts` | useSuggestionInsert | テキスト全体の即時挿入、isInserting状態遷移、200ms後リセット |

### 8.3 フェードイン挿入テスト詳細

```typescript
describe("useSuggestionInsert", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("テキスト全体が一度にコールバックで渡される", () => {
    const { result } = renderHook(() => useSuggestionInsert());
    const onInsert = vi.fn();

    act(() => {
      result.current.insertText("このコードを説明して", onInsert);
    });

    // テキスト全体が即座に渡される
    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(onInsert).toHaveBeenCalledWith("このコードを説明して");
  });

  it("挿入中は isInserting が true、200ms後に false", async () => {
    const { result } = renderHook(() => useSuggestionInsert());
    const onInsert = vi.fn();

    act(() => {
      result.current.insertText("テスト", onInsert);
    });

    expect(result.current.isInserting).toBe(true);

    // 200ms後（フェードイン完了）
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.isInserting).toBe(false);
  });
});
```

### 8.4 タイピングインジケーターテスト詳細

```typescript
describe("TypingIndicator", () => {
  it("3つのドット要素が表示される", () => {
    render(<TypingIndicator />);

    const dots = screen.getAllByTestId("typing-dot");
    expect(dots).toHaveLength(3);
  });

  it("各ドットに typing-indicator-dot クラスが適用されている", () => {
    render(<TypingIndicator />);

    const dots = screen.getAllByTestId("typing-dot");
    dots.forEach((dot) => {
      expect(dot).toHaveClass("typing-indicator-dot");
    });
  });
});
```

### 8.5 P31/P39/P40 対策

- **P31**: 全テストで個別セレクタ（`useStore((s) => s.xxx)`）を使用。合成 Hook をモックしない
- **P39**: happy-dom 環境では `fireEvent` を使用。`userEvent.setup()` は使わない
- **P40**: テスト実行は `cd apps/desktop && pnpm vitest run` で実行
- **P13**: `useSuggestionInsert` のタイマーテストでは `advanceTimersByTime` で1ステップずつ進める（`runAllTimers` は無限ループの危険）

## 9. 成果物一覧

### 9.1 プロダクションコード

```
apps/desktop/src/renderer/
└── views/WorkspaceView/
    ├── components/
    │   └── WorkspaceChatPanel/
    │       ├── WorkspaceChatPanel.tsx       # チャットパネル
    │       ├── WorkspaceChatInput.tsx       # 入力エリア（アクセントボーダー + 送信ボタン）
    │       ├── WorkspaceChatMessage.tsx     # メッセージバブル
    │       ├── WorkspaceChatZeroState.tsx   # ゼロステート（EmptyState + SuggestionBubble）
    │       ├── TypingIndicator.tsx          # AI応答待ちインジケーター
    │       ├── FileContextChip.tsx          # ファイル背景情報チップ
    │       └── FileMentionAutocomplete.tsx  # @mention オートコンプリート
    └── hooks/
        ├── useWorkspaceChat.ts             # チャットロジック
        └── useSuggestionInsert.ts          # サジェスチョンフェードイン挿入
```

### 9.2 テストコード

```
apps/desktop/src/renderer/
├── views/WorkspaceView/__tests__/
│   ├── WorkspaceChatPanel.test.tsx
│   ├── WorkspaceChatZeroState.test.tsx
│   ├── WorkspaceChatInput.test.tsx
│   └── TypingIndicator.test.tsx
└── views/WorkspaceView/hooks/__tests__/
    ├── useWorkspaceChat.test.ts
    └── useSuggestionInsert.test.ts
```

### 9.3 推定ファイル数

- プロダクションコード: ~9 ファイル（うち hooks 2）
- テストコード: ~6 ファイル
- 合計: ~15 ファイル

> **注**: WorkspaceView の `index.tsx`（レイアウトコンテナ）は 04A の成果物。ChatPanel は 04A が提供するスロットに配置される。

## 10. 完了条件

### 10.1 ChatPanel

- [ ] メッセージ送受信が動作する
- [ ] 応答が逐次表示される（チャンク受信ごとにテキスト追加）
- [ ] 選択ファイルの背景情報が自動的に含まれる
- [ ] `@mention` でファイル参照オートコンプリートが表示される

### 10.2 入力欄（主役UI）

- [ ] 入力欄に `var(--accent)` の 2px アクセントボーダーが適用されている
- [ ] 入力欄の角丸が `12px` である
- [ ] 入力欄の内余白が `16px` である
- [ ] 入力欄の最低高さが 56px である
- [ ] 送信ボタンが丸型 **44x44px**、`var(--accent)` 背景である
- [ ] 送信ボタンのホバーで `scale(1.02)` が適用される
- [ ] 送信ボタンのタップで `scale(0.97)` が適用される
- [ ] プレースホルダーが「何でも聞いてみよう...」である
- [ ] ファイル背景情報が入力欄上部にチップ形式で表示される
- [ ] チップの `×` ボタンでファイル背景情報を除去できる

### 10.3 ゼロステート（サジェスチョン強化）

- [ ] チャット未開始時に `EmptyState`（**mood="welcoming"**）が表示される
- [ ] 3つの `SuggestionBubble`（size="lg"）が表示される
- [ ] 各バブルにアイコン付き（💬 📝 🔧）
- [ ] バブルタップで入力欄にテキストが**フェードインで瞬時に表示**される
- [ ] タップ後にバブル群が fade-out-scale で退出する
- [ ] 最初のメッセージ送信後にゼロステートが完全に消失する

### 10.4 マイクロインタラクション

- [ ] サジェスチョンバブルのホバーで `scale(1.02)` + shadow-sm→shadow-md が適用される
- [ ] サジェスチョンバブルのタップで `scale(0.97)` が適用される
- [ ] サジェスチョンバブルのタップ後に `success-bounce` が再生される
- [ ] 送信ボタン送信後にアイコンが `ArrowUp` → `Check` にモーフィングする
- [ ] メッセージ送信時に入力欄テキストが `send-fly-up` で上に飛んでいく
- [ ] メッセージバブル出現時に `opacity: 0→1` + `translateY(8px→0)` 200ms が適用される
- [ ] AI応答待ち中に3ドットのバウンスアニメーション（タイピングインジケーター）が表示される
- [ ] @mentionオートコンプリートが `slideDown` + `fadeIn` で出現する

### 10.5 テスト・品質

- [ ] 全コンポーネントテストが PASS する
- [ ] `useSuggestionInsert` テストが `advanceTimersByTime` で動作する（P13 対策）
- [ ] 個別セレクタパターンを使用していること（P31 対策）
- [ ] happy-dom 環境で `fireEvent` を使用していること（P39 対策）
- [ ] テスト実行が `cd apps/desktop` から行われること（P40 対策）

## 11. 既知の落とし穴・教訓

| Pitfall | 該当箇所                 | 対策                                                                                                         |
| ------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **P5**  | IPC リスナー             | `onStreamChunk` / `onStreamEnd` / `onStreamError` の二重登録防止。モジュールスコープフラグを使用             |
| **P13** | タイマーテスト           | `setTimeout` + Promise パターンでは `runAllTimers` で無限ループ。`advanceTimersByTime` で1ステップずつ進める |
| **P31** | Store Hook 依存配列      | 個別セレクタ使用。合成 Hook を useEffect 依存配列に含めない                                                  |
| **P39** | happy-dom 環境 userEvent | `fireEvent` を使用。`userEvent.setup()` は使わない                                                           |
| **P40** | テスト実行ディレクトリ   | `cd apps/desktop && pnpm vitest run` で実行                                                                  |

## 12. 関連ドキュメント

### 04 シリーズ分割ドキュメント

| ファイル                                                                                    | 責務                                                                                                     |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [04A-workspace-layout-filebrowser.md](./task-058b-ui-04a-workspace-layout-filebrowser.md)   | 3ペインレイアウト + FileBrowserPanel + StatusBar + リサイズ + ファイル監視                               |
| **本ドキュメント（04B）**                                                                   | ChatPanel + ゼロステート強化 + フェードイン挿入 + ファイル背景情報 + @mention + メッセージアニメーション |
| [04C-workspace-preview-quicksearch.md](./task-059b-ui-04c-workspace-preview-quicksearch.md) | PreviewPanel + Source/Preview切替 + QuickFileSearch(Cmd+P) + CSP                                         |

### 参照資料

| 資料                          | パス / タスク ID                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| デザイン基盤                  | TASK-UI-00 `00-ui-design-foundation.md`                                                   |
| UI アーキテクチャ             | TASK-UI-01 `01-store-ipc-architecture.md`                                                 |
| レイアウト基盤（04A）         | [04A-workspace-layout-filebrowser.md](./task-058b-ui-04a-workspace-layout-filebrowser.md) |
| 既存 AgentChatInterface       | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/`                      |
| IPC チャネル定義              | `apps/desktop/src/preload/channels.ts`                                                    |
| SuggestionBubble定義          | TASK-UI-00 Task 2.1 Atoms                                                                 |
| EmptyState定義                | TASK-UI-00 Task 2.1 Atoms                                                                 |
| マイクロインタラクション      | TASK-UI-00 Task 5C                                                                        |
| UX言語ガイドライン            | TASK-UI-00 Task 5D                                                                        |
| P5: リスナー二重登録          | `.claude/rules/06-known-pitfalls.md#P5`                                                   |
| P13: タイマーテスト無限ループ | `.claude/rules/06-known-pitfalls.md#P13`                                                  |
| P31: Store Hook 無限ループ    | `.claude/rules/06-known-pitfalls.md#P31`                                                  |
| P39: happy-dom userEvent      | `.claude/rules/06-known-pitfalls.md#P39`                                                  |

## 13. 次の Phase

- 04A（レイアウト基盤）完了後に実装開始
- [04C](./task-059b-ui-04c-workspace-preview-quicksearch.md)（PreviewPanel + QuickSearch）と **並列実装可能**
- TASK-UI-05（スキルセンター）、TASK-UI-06（履歴・統合検索）とも **並列実行可能**
