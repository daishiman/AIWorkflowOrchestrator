# ChatPanel 実 AI チャット配線 - 実装ガイド

> タスクID: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001
> 作成日: 2026-03-18

---

## Part 1: 概念説明（中学生レベル）

### ChatPanel って何をしているの？

ChatPanel は「AI と会話できるチャット画面」を作る部品です。LINE や ChatGPT のような画面を想像してください。メッセージを打って送信すると、AI が返事を返してくれます。

ただし、この ChatPanel は「ただのチャット画面」ではありません。**AI にちゃんとつながっているかどうか**を常にチェックしながら動きます。

### 8つの状態 --- お店の営業状態に例えると

ChatPanel には8つの「状態」があります。これは、お店の営業状態に似ています。

| 状態          | お店に例えると                                   | ChatPanel では                                                                   |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| **idle**      | 開店準備中。まだお客さんは来ていない             | 画面を開いたばかりで、まだ何もしていない                                         |
| **ready**     | 営業中。注文を受け付けています                   | AI とつながっていて、メッセージを送れる状態                                      |
| **streaming** | 料理を作っている最中                             | AI が返事を書いている最中。文字が1つずつ表示される                               |
| **completed** | 料理が出来上がってテーブルに届いた               | AI の返事が全部表示された                                                        |
| **cancelled** | お客さんが「やっぱりキャンセルで」と言った       | ユーザーが途中で「停止」ボタンを押した                                           |
| **error**     | 厨房で問題が発生した                             | AI との通信でエラーが起きた                                                      |
| **blocked**   | 食材がなくて料理が作れない                       | APIキーが設定されていない、またはモデルが選ばれていない                          |
| **handoff**   | 「この料理はお隣の店でしか作れません」と案内する | 統合ランタイムでは対応できないので、ターミナル（別のツール）を使うように案内する |

状態は一方通行ではなく、こんな順番で移り変わります:

```
idle --> ready --> streaming --> completed
                      |              |
                      +--> cancelled |
                      |              |
                      +--> error ----+---> ready（再送信可能）

blocked（設定不足で stuck）
handoff（別の場所へ案内）
```

### ストリーミング --- 手紙が1文字ずつ届くイメージ

普通のチャットアプリでは、AI の返事が全部できてから「ドン！」と表示されます。でもストリーミングでは、**AI が考えながら1文字ずつ送ってくる**のをリアルタイムで表示します。

たとえるなら:

- **普通の方式**: 友達が手紙を全部書き終えてから郵便で送ってくる。届くまで何もわからない
- **ストリーミング方式**: 友達がビデオ通話で手紙を書いている様子をリアルタイムで見せてくれる。途中で「もういいよ」と言えば止められる

この仕組みのおかげで:

- ユーザーは「AI がちゃんと動いている」とすぐわかる
- 長い回答でも待ち時間が短く感じる
- 途中で的外れな回答だと気付いたら、すぐ止められる

### 4つのアクセス能力 --- どの道具が使えるか

ChatPanel は AI とやり取りする「道具」を4種類持っています:

| 能力                  | 意味                                       | 例え                                           |
| --------------------- | ------------------------------------------ | ---------------------------------------------- |
| **integratedRuntime** | アプリ内蔵のAI機能が使える                 | 自宅のキッチンで料理できる                     |
| **terminalSurface**   | ターミナル（コマンドライン）経由だけ使える | 近所のレストランに電話注文だけできる           |
| **both**              | 両方使える                                 | 自宅でも外食でもOK                             |
| **none**              | どちらも使えない                           | キッチンも壊れてるし、レストランも閉まっている |

### 画面の3つのエリア

ChatPanel は縦に3つのエリアに分かれています:

```
+-------------------------------------------+
| [ヘッダー] RuntimeBanner + モデル選択      |  <-- 上：今の状態と設定
+-------------------------------------------+
|                                            |
| [メッセージエリア]                         |  <-- 中：会話の履歴
|   あなた: こんにちは                       |
|   AI: こんにちは！何でも聞いてね          |
|   あなた: TypeScriptって何？              |
|   AI: TypeScriptは...[入力中...]          |
|                                            |
+-------------------------------------------+
| [入力エリア] テキスト入力 + 送信ボタン     |  <-- 下：メッセージ入力
+-------------------------------------------+
```

---

## Part 2: 開発者向け実装詳細

### 2.1 状態機械の遷移定義

ChatPanel は `ChatPanelStatus` 型で8状態を管理する。遷移は chatSlice のアクション呼び出しで発生する。

```
                    +-------+
                    | idle  |
                    +---+---+
                        |  (provider/model 選択完了)
                        v
+----------+       +-------+       +-----------+
| blocked  | <---- | ready | ----> | streaming |
+----------+       +---+---+       +-----+-----+
  (設定不足)         ^   |             |   |   |
                     |   |             |   |   +---> completed
+-----------+        |   |             |   +-------> cancelled
| handoff   | <------+   |             +-----------> error
+-----------+             |                            |
  (terminal only)         +----------------------------+
                              (再送信 or 復帰)
```

**型定義** (`chatSlice.ts`):

```typescript
export type ChatPanelStatus =
  | "idle"
  | "ready"
  | "streaming"
  | "cancelled"
  | "completed"
  | "error"
  | "blocked"
  | "handoff";

export type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";
```

### 2.2 コンポーネント階層（Atomic Design）

```
ChatPanel (organism)
  +-- RuntimeBanner (molecule)          ... capability 4値の表示
  +-- LLMSelectorPanel (molecule)       ... プロバイダー/モデル選択
  +-- SkillSelector (molecule)          ... スキル選択（既存）
  +-- ChatMessageList (molecule)        ... メッセージ一覧 (role="log")
  |     +-- [message items]             ... 個別メッセージ
  +-- ErrorGuidance (molecule)          ... エラー時のガイダンス (role="alert")
  +-- HandoffBlock (molecule)           ... terminal handoff 案内
  +-- ComposerArea (molecule)           ... 入力エリア
  |     +-- textarea (atom)             ... テキスト入力
  |     +-- SendButton (atom)           ... 送信ボタン
  |     +-- CancelButton (atom)         ... ストリーミング停止ボタン
  +-- SkillStreamingView (molecule)     ... スキル実行表示（既存）
  +-- SkillManagementPanel (organism)   ... スキル管理（既存）
  +-- SkillImportDialog (molecule)      ... インポートダイアログ（既存）
  +-- PermissionDialog (molecule)       ... 権限ダイアログ（既存）
```

### 2.3 Zustand ストア設計（P31/P48 対策）

#### chatSlice の追加フィールド

| フィールド              | 型                       | 初期値   | 説明                           |
| ----------------------- | ------------------------ | -------- | ------------------------------ |
| `chatPanelStatus`       | `ChatPanelStatus`        | `"idle"` | 画面の状態                     |
| `resolvedCapability`    | `AccessCapability`       | `"none"` | アクセス能力                   |
| `currentConversationId` | `string \| null`         | `null`   | 会話ID                         |
| `isStreaming`           | `boolean`                | `false`  | ストリーミング中フラグ         |
| `streamingContent`      | `string`                 | `""`     | ストリーミング中の文字列蓄積   |
| `currentStreamId`       | `string \| null`         | `null`   | ストリームリクエストID         |
| `streamingMessageId`    | `string \| null`         | `null`   | ストリーミング対象メッセージID |
| `streamingError`        | `StreamingError \| null` | `null`   | ストリーミングエラー情報       |
| `systemPrompt`          | `string`                 | `""`     | システムプロンプト             |

#### 個別セレクタ一覧（store/index.ts）

P31 対策として、合成 Store Hook ではなく個別セレクタを使用する。P48 対策として、配列を返す派生セレクタには `useShallow` を適用する。

```typescript
// 状態セレクタ
export const useChatPanelStatus = () => useAppStore((s) => s.chatPanelStatus);
export const useResolvedCapability = () =>
  useAppStore((s) => s.resolvedCapability);
export const useCurrentConversationId = () =>
  useAppStore((s) => s.currentConversationId);

// P48対策: 配列には useShallow
export const useChatMessagesShallow = () =>
  useAppStore(useShallow((s) => s.chatMessages));

// アクションセレクタ
export const useSetChatPanelStatus = () =>
  useAppStore((s) => s.setChatPanelStatus);
export const useSetResolvedCapability = () =>
  useAppStore((s) => s.setResolvedCapability);
export const useSetCurrentConversationId = () =>
  useAppStore((s) => s.setCurrentConversationId);
export const useAddChatMessage = () => useAppStore((s) => s.addMessage);
export const useResetChat = () => useAppStore((s) => s.resetChat);
```

**重要な注意（P31）**: `useEffect` の依存配列にアクション関数を入れる場合は、必ず個別セレクタ経由で取得すること。合成 Hook（`useLLMStore()` 等）は毎回新しいオブジェクトを返すため、無限ループの原因になる。

### 2.4 useStreamingChat フックの設計

`useStreamingChat` は LLM ストリーミングチャットの IPC 通信とストア状態管理を抽象化するカスタムフック。

**使用箇所**: `ChatPanel.tsx`

```typescript
const { state: streamingState, actions: streamingActions } = useStreamingChat();
```

**返却値**:

| プロパティ             | 型                                            | 説明                           |
| ---------------------- | --------------------------------------------- | ------------------------------ |
| `state.isStreaming`    | `boolean`                                     | ストリーミング中か             |
| `state.content`        | `string`                                      | 蓄積されたストリーミング文字列 |
| `state.error`          | `StreamingError \| null`                      | エラー情報                     |
| `actions.startStream`  | `(req: LLMChatRequestInput) => Promise<void>` | ストリーム開始                 |
| `actions.cancelStream` | `() => Promise<void>`                         | ストリームキャンセル           |

**内部フロー**:

1. `startStream` 呼び出し時に `LLMChatRequestSchema.parse()` でバリデーション
2. `window.electronAPI.llm.streamChat()` で IPC 経由で Main Process に送信
3. Main Process がストリーミング開始、チャンク / 完了 / エラーイベントを送出
4. `onStreamChunk` → `appendStreamChunk` でストアに蓄積
5. `onStreamEnd` → `endStreaming` でストリーミング完了
6. `onStreamError` → `setStreamingError` でエラー状態に遷移

**IPC チャンネル**: `llm:stream-chat`（`AI_CHAT` は使用しない）

### 2.5 ChatPanel の条件レンダリングロジック

ChatPanel は `chatPanelStatus` と `resolvedCapability` に基づいて表示を切り替える:

```typescript
// blocked 判定: provider/model 未選択
const isBlocked = chatPanelStatus === "blocked";
// handoff 判定: terminal のみ利用可能
const isHandoff = chatPanelStatus === "handoff";
// 送信可否: blocked/handoff/streaming でなく、provider/model 選択済み
const canSubmit =
  !isBlocked &&
  !isHandoff &&
  !isStreaming &&
  Boolean(selectedProviderId) &&
  Boolean(selectedModelId);
// 入力欄表示: blocked/handoff でない
const showComposer = !isBlocked && !isHandoff;
```

**P62 準拠**: Provider/Model が未選択の場合は `DEFAULT_CONFIG` への暗黙 fallback を行わず、`ErrorGuidance` でユーザーに明示的な設定を促す。

### 2.6 キーボード操作

| キー        | 動作                                             | 実装箇所                      |
| ----------- | ------------------------------------------------ | ----------------------------- |
| Enter       | メッセージ送信（`canSubmit` が true の場合）     | `ComposerArea`                |
| Shift+Enter | 改行挿入                                         | `ComposerArea`                |
| Escape      | ストリーミングキャンセル（ストリーミング中のみ） | `ChatPanel` (document レベル) |

Escape キーは `document.addEventListener("keydown")` でキャプチャし、`useRef` で最新の `isStreaming` / `cancelStream` を参照する（クロージャの stale 値問題を回避）。

### 2.7 アクセシビリティ属性

| コンポーネント        | role      | aria 属性                                               | 説明                         |
| --------------------- | --------- | ------------------------------------------------------- | ---------------------------- |
| ChatPanel ヘッダー    | `toolbar` | `aria-label="チャット設定"`                             | 設定ツールバー               |
| RuntimeBanner         | `status`  | `aria-live="polite"`                                    | 状態変化の通知               |
| ChatMessageList       | `log`     | `aria-live="polite"`, `aria-label="チャットメッセージ"` | メッセージ履歴               |
| ストリーミング表示    | `status`  | `aria-busy="true"`                                      | AI 応答中の表示              |
| ErrorGuidance         | `alert`   | `aria-live="assertive"`                                 | エラー通知（即座に読み上げ） |
| ComposerArea textarea | -         | `aria-label="メッセージを入力"`                         | 入力フィールド               |
| 送信ボタン            | -         | `aria-label="メッセージを送信"`, `aria-disabled`        | 送信操作                     |
| キャンセルボタン      | -         | `aria-label="Cancel response"`                          | ストリーミング停止           |

### 2.8 スタブコンポーネント一覧

現時点でスタブ（最小限の実装）として作成されたコンポーネント:

| コンポーネント     | ファイルパス                                                     | 状態                                               |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------- |
| `RuntimeBanner`    | `apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx`    | スタブ（capability 4値の文字列表示のみ）           |
| `ChatMessageList`  | `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`  | スタブ（メッセージ表示 + ストリーミング + エラー） |
| `ErrorGuidance`    | `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`    | スタブ（コード/メッセージ表示 + 設定遷移ボタン）   |
| `HandoffBlock`     | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`     | スタブ（コマンド表示 + ターミナル起動ボタン）      |
| `ComposerArea`     | `apps/desktop/src/renderer/components/chat/ComposerArea.tsx`     | スタブ（textarea + 送信/キャンセルボタン）         |
| `LLMSelectorPanel` | `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx` | スタブ（選択中 provider/model 表示のみ）           |

### 2.9 変更対象ファイル一覧

| ファイル                                                         | 変更種別 | 変更内容                                                                                          |
| ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`            | 変更     | ChatPanelStatus/AccessCapability 型追加、ストリーミング状態/アクション追加、systemPrompt 状態追加 |
| `apps/desktop/src/renderer/store/index.ts`                       | 変更     | 個別セレクタ12個追加（P31/P48準拠）                                                               |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`        | 全面書換 | placeholder 3箇所を実コンポーネントに置換、useStreamingChat 接続、8状態の条件レンダリング         |
| `apps/desktop/src/renderer/hooks/useStreamingChat.ts`            | 変更     | IPC イベントリスナー設定、startStream/cancelStream 実装                                           |
| `apps/desktop/src/renderer/components/chat/RuntimeBanner.tsx`    | 新規     | capability 表示バナー                                                                             |
| `apps/desktop/src/renderer/components/chat/ChatMessageList.tsx`  | 新規     | メッセージ一覧                                                                                    |
| `apps/desktop/src/renderer/components/chat/ErrorGuidance.tsx`    | 新規     | エラーガイダンス                                                                                  |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`     | 新規     | terminal handoff ブロック                                                                         |
| `apps/desktop/src/renderer/components/chat/ComposerArea.tsx`     | 新規     | 入力エリア                                                                                        |
| `apps/desktop/src/renderer/components/chat/LLMSelectorPanel.tsx` | 新規     | LLM選択パネル                                                                                     |

### 2.10 テスト実行方法

```bash
# ChatPanel 関連テスト（chat ディレクトリ内）
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# chatSlice テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/chatSlice.test.ts

# useStreamingChat テスト
cd apps/desktop && pnpm vitest run src/renderer/hooks/

# ChatPanel 特定のテストスイート
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.chat-wiring.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.settings-sync.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.edge-cases.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.accessibility.test.tsx
```

**重要（P40）**: テストは必ず `apps/desktop` ディレクトリから実行すること。プロジェクトルートから実行すると `vitest.config.ts` の `environment: "happy-dom"` 設定が適用されず、`document is not defined` エラーが発生する。

### 2.11 既知の落とし穴と対策

| Pitfall                               | 対策                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------- |
| P31: 合成 Hook の無限ループ           | 個別セレクタ（`useChatPanelStatus()` 等）を使用。合成 Hook は `@deprecated` |
| P48: 派生セレクタの無限ループ         | `useChatMessagesShallow()` に `useShallow` を適用                           |
| P39: happy-dom での userEvent 非互換  | テストでは `fireEvent` を使用。`userEvent.setup()` は使用禁止               |
| P40: テスト実行ディレクトリ依存       | `cd apps/desktop` から実行                                                  |
| P62: DEFAULT_CONFIG への暗黙 fallback | Provider/Model 未選択時はエラー表示。fallback は一切行わない                |
| P5: リスナー二重登録                  | `useStreamingChat` 内で `useEffect` のクリーンアップ関数でリスナー解除      |
