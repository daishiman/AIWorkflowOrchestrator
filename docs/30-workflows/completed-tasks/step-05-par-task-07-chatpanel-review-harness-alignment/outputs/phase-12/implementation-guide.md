# Phase 12 ドキュメント: 実装ガイド

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 12 - ドキュメント

---

## Part 1: 概念説明（中学生でもわかるアナロジー）

### レストランの注文票で理解する「review harness」

#### mainline = カウンターの本物の注文票

お店の厨房には「カウンターの注文票」があります。
お客さんが「ラーメン一丁！」と頼むと、店員さんがその注文票に書いて厨房に渡します。
厨房のシェフはその注文票を見て、実際にラーメンを作り始めます。

この「注文票」が **mainline**（ChatView）です。
ユーザーがメッセージを送ると、AI が実際に反応して回答を返してきます。
本物の注文が動いて、本物の料理が届きます。

#### review harness = 練習用の注文票

新しい注文票のデザインを考えている時、いきなり本物の厨房で試すのは怖いですよね。
もし注文票の書き方が変だったら、お客さんの料理が出てこなくなってしまいます。

そこで「**練習用の注文票**」を作ります。
本物とまったく同じ形をしているけど、厨房には渡さない注文票です。
デザイナーが「ここの文字はもっと大きくした方がいい」とか
「このボタンは分かりにくい」とか、外見だけをチェックするための道具です。

この「練習用の注文票」が **review harness**（ChatPanel）です。
ユーザーが操作できる画面はできているけど、まだ AI には繋がっていません。

#### no-op = 注文ボタンを押しても何も起きない壊れた端末

お店にタブレット端末があるとします。
注文ボタンを押したら注文が厨房に飛ぶはずなのに、
ボタンを押しても何の反応もない状態です。

画面は表示されているけど、ボタンが壊れて動かない状態 — これが **no-op** です。

今の ChatPanel には 4 つの「壊れたボタン」があります：

- 「ターミナルに切り替え」ボタン（押してもターミナル画面に移動しない）
- 「プロバイダー選択」ボタン（押しても AI サービスが選択されない）
- 「モデル選択」ボタン（押しても AI モデルが選択されない）
- 「ターミナルを開く」ボタン（押してもターミナルが起動しない）

このタスクでは、練習用の注文票（review harness）として正式に認識しながら、
将来これらのボタンを本物の厨房（mainline）と繋げるための準備をします。

#### まとめ

| 言葉           | 日常の例え           | 技術での意味                         |
| -------------- | -------------------- | ------------------------------------ |
| mainline       | 本物の注文票         | ChatView（本番の AI チャット）       |
| review harness | 練習用の注文票       | ChatPanel（UI 確認用コンポーネント） |
| no-op          | 壊れた注文ボタン     | `() => {}` 空のコールバック          |
| IPC            | 厨房への連絡口       | Main Process と Renderer の通信      |
| Store action   | 注文内容を変える指示 | Zustand Store への状態更新           |

---

## Part 2: 開発者向け実装詳細

### 背景・前提

ChatPanel は現状、4 箇所の no-op コールバック（GAP-01〜04）を持つ review harness である。
本タスクは設計タスクであり、**後続実装タスクでの配線手順を定義する**。

### no-op 排除の具体的コード変更（before/after）

#### Step 1: JSDoc アノテーションの追加

**ChatPanel.tsx のコンポーネント宣言部を更新する**

```typescript
// BEFORE: アノテーションなし
export const ChatPanel: React.FC<ChatPanelProps> = ({ chatId }) => {

// AFTER: @role review-harness を追加
/**
 * ChatPanel - チャットパネルのメインコンテナコンポーネント
 *
 * @role review-harness
 * @description
 * Review Harness として機能するコンポーネント。
 * mainline（ChatView）との契約整合性を維持しながら、
 * UI レビューおよびビジュアル検証を目的として設計されている。
 *
 * GAP-01〜04 の no-op は後続実装タスクで解消される。
 * @see TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ chatId }) => {
```

#### Step 2: chatState セレクタの個別化（P31 対策）

```typescript
// BEFORE: 合成 Hook（P31 無限ループリスク）
// const { chatState, messages } = useChatStore();

// AFTER: 個別セレクタ（P31 対策）
const chatState = useChatStore((state) => state.chatState);
const messages = useChatStore(useShallow((state) => state.messages));
```

#### Step 3: handler 変数への抽出（GAP-01〜04 解消）

> GAP 定義（Phase 1 正本）:
> GAP-01=onTerminalSwitch、GAP-02=onSelectProvider、GAP-03=onSelectModel、GAP-04=onOpenTerminal

```typescript
// BEFORE: インライン no-op
<RuntimeBanner
  onTerminalSwitch={() => {}}
/>
<LLMSelectorPanel
  onSelectProvider={() => {}}
  onSelectModel={() => {}}
/>
<HandoffBlock
  onOpenTerminal={() => {}}
/>

// AFTER Step 3a: 変数化（リファクタリング段階）
const handleTerminalSwitch = useCallback((): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): Store navigate 配線
}, []);

const handleSelectProvider = useCallback((_providerId: string): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): useSetSelectedProvider() 配線
}, []);

const handleSelectModel = useCallback((_modelId: string): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): useSetSelectedModel() 配線
}, []);

const handleOpenTerminal = useCallback((): void => {
  // TODO(TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001): IPC app:open-terminal 配線
  // NOTE(MINOR-A): 実装前に Main Process のハンドラ登録を確認すること
}, []);

// AFTER Step 3b: 実装段階（後続実装タスクで完成させる）
const setActiveView = useSetActiveView();                  // GAP-01 用
const setSelectedProvider = useSetSelectedProvider();      // GAP-02 用
const setSelectedModel = useSetSelectedModel();            // GAP-03 用

const handleTerminalSwitch = useCallback((): void => {
  setActiveView("agent"); // ViewType に "terminal" が存在しないため "agent" で代替（Phase 4-7 差分参照）
}, [setActiveView]);

const handleSelectProvider = useCallback((providerId: string): void => {
  if (typeof providerId !== 'string' || providerId.trim() === '') return; // P42 対策
  setSelectedProvider(providerId as LLMProviderId);
}, [setSelectedProvider]);

const handleSelectModel = useCallback((modelId: string): void => {
  if (typeof modelId !== 'string' || modelId.trim() === '') return; // P42 対策
  setSelectedModel(modelId);
}, [setSelectedModel]);

const handleOpenTerminal = useCallback((): void => {
  // RISK-1: app:open-terminal の存在を確認してから実装
  window.electronAPI.safeInvoke(IPC_CHANNELS.APP_OPEN_TERMINAL);
}, []);
```

### JSDoc `@role review-harness` の追加位置

`ChatPanel.tsx` のエクスポートされているコンポーネント関数の直前に配置する。
Arrow function component と function declaration component の両方に対応する。

```typescript
// Arrow function component の場合
/**
 * @role review-harness
 */
export const ChatPanel: React.FC<ChatPanelProps> = (props) => { ... };

// Named function component の場合
/**
 * @role review-harness
 */
export function ChatPanel(props: ChatPanelProps): React.ReactElement { ... }
```

### Store action / IPC call の配線手順

#### 配線手順 1: chatState セレクタの確認

```typescript
// chatSlice.ts の State 型を確認
type ChatState =
  | "idle"
  | "loading"
  | "streaming"
  | "blocked"
  | "handoff"
  | "error"
  | "empty"
  | "cancelled";
```

#### 配線手順 2: IPC_CHANNELS 定数の確認・追加

```typescript
// IPC_CHANNELS.ts に以下が存在するか確認
export const IPC_CHANNELS = {
  CHAT_CANCEL_STREAM: "chat:cancel-stream",
  APP_OPEN_TERMINAL: "app:open-terminal", // MINOR-A: 存在確認が必要
  // ...
} as const;
```

#### 配線手順 3: Main Process ハンドラの確認

```bash
# Main Process にハンドラが存在するか確認
grep -rn "chat:cancel-stream\|app:open-terminal" apps/desktop/src/main/

# Preload allowlist の確認
grep -rn "chat:cancel-stream\|app:open-terminal" apps/desktop/src/preload/
```

#### 配線手順 4: Preload allowlist への追加（必要な場合）

```typescript
// preload/index.ts の allowedChannels に追加
const allowedChannels = [
  "chat:cancel-stream",
  "app:open-terminal", // 未存在の場合に追加
  // ...
];
```

#### 配線手順 5: 型チェックとテスト実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# 関連テスト実行
pnpm --filter @repo/desktop test -- --grep "ChatPanel"
```

### 実装チェックリスト（後続実装タスク担当者向け）

- [ ] JSDoc `@role review-harness` を ChatPanel 宣言部に追加した
- [ ] chatState が個別セレクタで取得されている（P31 対策）
- [ ] handler 4 個（handleTerminalSwitch/handleSelectProvider/handleSelectModel/handleOpenTerminal）を `useCallback` で実装した
- [ ] P42 対策（3段バリデーション）が handleSelectProvider / handleSelectModel に含まれている
- [ ] MINOR-A: `app:open-terminal` IPC channel の存在を確認した
- [ ] IPC channel 名が IPC_CHANNELS 定数経由で参照されている（P65 対策）
- [ ] `pnpm typecheck` が通ることを確認した
- [ ] `pnpm lint` が通ることを確認した
- [ ] MT-01〜MT-05 を実施し、期待結果を充足することを確認した
