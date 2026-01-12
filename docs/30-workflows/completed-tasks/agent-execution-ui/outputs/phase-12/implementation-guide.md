# Agent Execution UI - 実装ガイド

## メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| 機能名   | agent-execution-ui     |
| 作成日   | 2026-01-12             |
| 対象読者 | 開発者・技術者・学習者 |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. Agent Execution UIって何？

### 1.1 身近な例で考えてみよう

LINEやチャットアプリを想像してください。

```
あなた: 「今日の天気を教えて」
       ↓
  AI: 「今日は晴れです」
```

これと同じように、AIに指示を出して、AIからの回答を見る画面です。

ただし、このAIは普通のチャットAIより賢くて、パソコンの操作もできます。
だから「この操作をしてもいい？」と聞いてくることがあります。

### 1.2 なぜ必要なの？

AIにお仕事を手伝ってもらう時、次のことが大切です：

- **会話が見える**: AIが何をしているかわかる
- **許可を出せる**: AIが危険な操作をする前に確認できる
- **止められる**: 間違った時にストップできる

### 1.3 今回作ったもの

| 日本語         | 英語名                 | 役割                     |
| -------------- | ---------------------- | ------------------------ |
| 入力欄         | AgentMessageInput      | メッセージを打つ場所     |
| チャット画面   | AgentChatInterface     | 会話が表示される場所     |
| 操作ボタン     | AgentExecutionControls | キャンセルやクリアボタン |
| 確認ダイアログ | PermissionDialog       | 「許可しますか？」の画面 |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
1. メッセージを入力
       ↓
2. 送信ボタンを押す
       ↓
3. AIが考え始める
       ↓
4. 文字が少しずつ表示される（ストリーミング）
       ↓
5. 完了！（または許可が必要な場合はダイアログが出る）
```

### 2.2 許可が必要な時

```
AIがファイルを編集しようとした時:
       ↓
  「Editツールを実行してもいいですか？」
       ↓
   [許可] [拒否]
       ↓
   許可すると続行、拒否すると別の方法を考える
```

---

## 3. 作ったものの全体像

```
┌─────────────────────────────────────┐
│          ヘッダー（戻るボタン）       │
├─────────────────────────────────────┤
│                                     │
│    チャットインターフェース          │
│    （メッセージが並ぶ場所）          │
│                                     │
├─────────────────────────────────────┤
│   [キャンセル] [クリア]             │←── 操作ボタン
├─────────────────────────────────────┤
│   メッセージを入力...  [送信]       │←── 入力欄
└─────────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
apps/desktop/src/renderer/
├── views/AgentExecutionView/
│   ├── AgentExecutionView.tsx      # メインビュー
│   ├── hooks/
│   │   └── useAgentExecution.ts    # カスタムフック
│   └── __tests__/                  # テストファイル群
├── components/
│   ├── molecules/
│   │   ├── AgentMessageInput/      # メッセージ入力
│   │   ├── AgentOutputStream/      # ストリーミング出力
│   │   └── AgentExecutionControls/ # 実行制御
│   └── organisms/
│       ├── AgentChatInterface/     # チャットUI
│       └── PermissionDialog/       # 権限確認ダイアログ
├── store/slices/
│   └── agentSlice.ts               # Zustand状態管理
└── utils/
    └── agentApi.ts                 # IPCヘルパー関数
```

### 1.2 データモデル

```
AgentExecutionState
├── status: AgentExecutionStatus - 実行状態
├── currentSkill: Skill | null - 現在のスキル
├── messages: AgentMessage[] - メッセージ履歴
├── currentStreamingContent: string - ストリーミング中のテキスト
├── error: string | null - エラーメッセージ
├── pendingPermission: PermissionRequest | null - 待機中の権限要求
└── rememberedChoices: Record<string, boolean> - 記憶された選択
```

---

## 2. 型定義詳細

### 2.1 AgentExecutionStatus

```typescript
/**
 * エージェント実行のステータス
 * なぜ7状態: 実行ライフサイクルの全段階を網羅するため
 */
export type AgentExecutionStatus =
  | "idle" // 待機中 - 何も実行していない
  | "executing" // 実行中 - クエリ処理中
  | "streaming" // ストリーミング中 - 応答受信中
  | "awaiting_permission" // 権限待ち - ユーザー確認待ち
  | "completed" // 完了 - 正常終了
  | "cancelled" // キャンセル済 - ユーザーによる中断
  | "error"; // エラー - 異常終了
```

### 2.2 AgentMessage

```typescript
/**
 * エージェントメッセージ
 * なぜこの構造: チャットUI表示に必要な最小限の情報
 */
export interface AgentMessage {
  /** メッセージの一意識別子 - なぜUUID: 重複防止 */
  id: string;
  /** 送信者ロール - なぜ3種類: user/assistant/systemで十分 */
  role: "user" | "assistant" | "system";
  /** メッセージ内容 */
  content: string;
  /** 送信日時 - なぜDate: 時系列ソート・表示用 */
  timestamp: Date;
  /** ストリーミング中フラグ - なぜ任意: 完了後は不要 */
  isStreaming?: boolean;
  /** メッセージタイプ - なぜ任意: エラー表示等の区別 */
  type?: "text" | "error" | "tool_use";
}
```

### 2.3 PermissionRequest

```typescript
/**
 * 権限リクエスト
 * なぜこの構造: Claude Agent SDKのPreToolUseフックと互換
 */
export interface PermissionRequest {
  /** 実行ID - なぜ必要: リクエストの関連付け */
  executionId: string;
  /** リクエストID - なぜ必要: 応答とのマッチング */
  requestId: string;
  /** ツール名 - なぜ必要: ユーザーへの表示 */
  toolName: string;
  /** ツール引数 - なぜRecord: 任意のJSON構造に対応 */
  args: Record<string, unknown>;
  /** 理由 - なぜ任意: SDKから提供される場合のみ */
  reason?: string;
}
```

---

## 3. IPC通信設計

### 3.1 チャンネル定義

| チャンネル             | 方向            | 用途           |
| ---------------------- | --------------- | -------------- |
| `agent:start`          | Renderer → Main | 実行開始       |
| `agent:stop`           | Renderer → Main | 実行停止       |
| `agent:stream`         | Main → Renderer | ストリーミング |
| `agent:permission`     | Main → Renderer | 権限確認要求   |
| `agent:permission:res` | Renderer → Main | 権限確認応答   |

### 3.2 なぜこの設計か

| 設計判断         | 選択肢                | 採用理由                           |
| ---------------- | --------------------- | ---------------------------------- |
| IPC方式          | invoke/handle vs send | 双方向通信とリターン値が必要       |
| ストリーミング   | WebSocket vs IPC      | Electron環境ではIPCがシンプル      |
| 状態管理         | Redux vs Zustand      | ボイラープレート削減、学習コスト低 |
| Permission永続化 | localStorage vs state | セッション内のみで十分             |

---

## 4. コンポーネント設計

### 4.1 AgentExecutionView

```typescript
/**
 * AgentExecutionView
 * @description エージェント実行のメインビューコンポーネント
 *
 * なぜこの分離:
 * - ビュー: 全体レイアウトとルーティング
 * - organisms: 複合コンポーネント（チャット、ダイアログ）
 * - molecules: 単機能コンポーネント（入力、ボタン群）
 */
```

### 4.2 Atomic Design準拠

| レベル    | コンポーネント         | 責務                       |
| --------- | ---------------------- | -------------------------- |
| views     | AgentExecutionView     | ルーティング、レイアウト   |
| organisms | AgentChatInterface     | メッセージ表示・スクロール |
| organisms | PermissionDialog       | モーダル・フォーカス管理   |
| molecules | AgentMessageInput      | テキスト入力・送信         |
| molecules | AgentExecutionControls | キャンセル・クリアボタン   |

---

## 5. アクセシビリティ設計

### 5.1 WCAG 2.1 AA準拠

| 要件               | 実装                           |
| ------------------ | ------------------------------ |
| キーボードナビ     | Tab/Shift+Tab/Enter/Escape     |
| スクリーンリーダー | aria-label, aria-live, role    |
| フォーカス管理     | ダイアログのフォーカストラップ |
| 色コントラスト     | 4.5:1以上                      |

### 5.2 PermissionDialogのフォーカストラップ

```typescript
// なぜフォーカストラップ: モーダル外に操作が漏れないため
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
};
```

---

## 6. テスト構成

| テストファイル                         | テスト数 | カバー範囲       |
| -------------------------------------- | -------- | ---------------- |
| AgentExecutionView.ipc.test.tsx        | 15+      | IPC連携          |
| AgentExecutionView.permission.test.tsx | 10+      | 権限ダイアログ   |
| AgentExecutionView.error.test.tsx      | 8+       | エラー処理       |
| AgentExecutionView.a11y.test.tsx       | 17       | アクセシビリティ |
| useAgentExecution.test.ts              | 10+      | カスタムフック   |

---

## 7. 使用上の注意

### 7.1 IPCリスナーのクリーンアップ

```typescript
// ⭕ 正しい使い方: useEffectのcleanupでリスナー解除
useEffect(() => {
  const unsubscribe = window.agentAPI?.onStream(handleStream);
  return () => unsubscribe?.();
}, []);

// ❌ 使用禁止: クリーンアップなしはメモリリークの原因
useEffect(() => {
  window.agentAPI?.onStream(handleStream); // リークする
}, []);
```

### 7.2 状態更新の最適化

```typescript
// ⭕ 正しい使い方: 部分更新
appendStreamingContent: (content) =>
  set((state) => ({
    executionState: {
      ...state.executionState,
      currentStreamingContent:
        state.executionState.currentStreamingContent + content,
    },
  }));

// ❌ 使用禁止: 全状態置換は再レンダリングを誘発
set({ executionState: newFullState });
```

---

## 8. 次のステップ

| タスクID  | タスク名               | 状態 |
| --------- | ---------------------- | ---- |
| AGENT-005 | Claude Code統合        | 並行 |
| -         | 仮想スクロール導入     | 将来 |
| -         | メッセージ履歴上限設定 | 将来 |

---

## 9. 用語集

| 用語               | 読み方                 | 説明                                        |
| ------------------ | ---------------------- | ------------------------------------------- |
| IPC                | アイピーシー           | Inter-Process Communication。プロセス間通信 |
| Zustand            | ズースタント           | 軽量状態管理ライブラリ。Reduxより簡潔       |
| Electron           | エレクトロン           | デスクトップアプリ開発フレームワーク        |
| contextBridge      | コンテキストブリッジ   | Electron Preloadでの安全なAPI公開           |
| Atomic Design      | アトミックデザイン     | コンポーネント設計パターン                  |
| WCAG               | ダブリューシーエージー | Webコンテンツアクセシビリティガイドライン   |
| フォーカストラップ | -                      | モーダル内にフォーカスを閉じ込める技法      |
| ストリーミング     | -                      | データを少しずつ受信しながら表示する方式    |
