# TASK-7D ChatPanel Agent 統合 - 実装ガイド

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| タスクID | TASK-7D                                |
| Phase    | 12 - ドキュメント更新                  |
| 作成日   | 2026-01-31                             |
| 対象     | ChatPanel 統合・SkillStreamingView実装 |

---

## Part 1: 概念的な説明（中学生でもわかる版）

### そもそも何を作ったの？

想像してみてください。あなたは自分の部屋で勉強しています。教科書を広げて、ノートを用意して、辞書もそばに置いて、鉛筆を持っている。これらの道具がバラバラだったら、とても使いづらいですよね。

**ChatPanel（チャットパネル）** は、まさにこの「勉強机」のようなものです。AIと会話するための画面（チャット）に、必要な道具をすべて集めて、ひとつの作業スペースにまとめました。

今回の作業を一言でいうと：

> **「仕事の相棒（ChatPanel）」に新しい能力を追加して、もっと賢く、もっと便利にした**

---

### なぜこれが必要だったの？

以前のChatPanelは、単純にAIとテキストをやりとりするだけの「メモ帳」のような存在でした。でも、AIはテキストを返すだけでなく、ファイルを読んだり、コマンドを実行したり、たくさんの「仕事」をこなせるようになりました。

そこで、ChatPanelを「ただのメモ帳」から「仕事の相棒」にパワーアップさせる必要がありました。具体的には、以下の4つの新しい機能を統合しました。

---

### 1. SkillSelector（スキルセレクター）- 「道具箱」

#### なぜ必要？

あなたが料理をするとき、最初にすることは何ですか？ そう、「何を作るか」を決めて、必要な道具を選ぶことです。

AIにも同じことが言えます。AIにはいろんな「スキル（得意技）」があります。プレゼンを作るスキル、コードを書くスキル、ドキュメントを整理するスキルなどです。

**SkillSelector** は、この「道具箱」です。チャット画面のヘッダー（一番上の部分）にあり、「今回はどのスキルを使う？」と選べるようになっています。

#### どう動く？

1. あなたがSkillSelectorを開く（道具箱のフタを開ける）
2. 使いたいスキルを選ぶ（包丁を取り出す）
3. 選んだスキルがAIの「モード」になる（料理モードに切り替わる）

---

### 2. ストリーミング表示 - 「手紙が1文字ずつ届く仕組み」

#### なぜ必要？

友達とLINEでやりとりしているとき、相手が「入力中...」と表示されるのを見たことがありますよね。あれがなかったら、メッセージが届くまで「本当に返事をくれるの？」と不安になります。

AIが長い作業をしているときも同じです。「今、何をしているの？」が分からないと、とても不安です。

**ストリーミング表示（SkillStreamingView）** は、AIの作業を「リアルタイムで見せる窓」です。AIが文章を書いているとき、手紙が1文字ずつ届くように、書いている内容が画面にどんどん表示されます。

#### どう動く？

- AIが文章を考えると、考えた部分からすぐに画面に表示される（点滅するカーソル `▌` が「今ここを書いているよ」と教えてくれる）
- AIがツール（道具）を使うと、「今、このツールを使っているよ」と教えてくれる
- 作業が終わると「完了しました」と教えてくれる
- もしエラー（失敗）が起きたら、「ここでうまくいかなかったよ」と教えてくれる

---

### 3. PermissionDialog（パーミッションダイアログ）- 「確認のドア」

#### なぜ必要？

あなたの家に友達が来たとします。友達が「冷蔵庫のジュースもらっていい？」と聞いてきたとき、「いいよ」とか「ダメ」と答えますよね。勝手に冷蔵庫を開けられたら困りますよね。

AIも同じです。AIがファイルを書き換えたり、コマンドを実行したりするとき、あなたに「これをやっていいですか？」と確認を取るのが **PermissionDialog** です。これは「確認のドア」で、AIがドアをノックして、あなたが「入っていいよ（許可）」か「入らないで（拒否）」かを決めます。

#### どう動く？

1. AIが何か重要な操作（ファイルを書き換えるなど）をしようとする
2. 画面の中央にポップアップ（確認のドア）が表示される
3. 「何をしようとしているか」が分かりやすく表示される
4. あなたは3つの選択肢から選べる：
   - **「拒否」** - やめてもらう
   - **「1回許可」** - 今回だけOK
   - **「許可」** - 今回と同じ種類の操作は今後もOK

---

### 4. StatusBadge（ステータスバッジ）- 「信号機」

#### なぜ必要？

道路の信号機を想像してください。青は「進め」、黄色は「注意」、赤は「止まれ」。一目見ただけで、今の状態がわかります。

**StatusBadge** は、AIの作業状態を色で教えてくれる「信号機」です。

#### 色と意味

| 色     | 表示           | 意味                                       |
| ------ | -------------- | ------------------------------------------ |
| 青     | 「実行中...」  | AIが今がんばって作業しています（信号の青） |
| 黄色   | 「権限確認」   | あなたの許可を待っています（信号の黄色）   |
| 緑     | 「完了」       | 作業が終わりました（ゴール！）             |
| グレー | 「キャンセル」 | あなたが途中で止めました                   |
| 赤     | 「エラー」     | 何か問題が起きました（信号の赤）           |

---

### 全体のイメージ

```
┌─────────────────────────────────────────────┐
│ [勉強机 = ChatPanel]                         │
│                                              │
│ ┌──────────────────────────────────┐         │
│ │ 道具箱（SkillSelector）          │  ← ヘッダー │
│ └──────────────────────────────────┘         │
│                                              │
│ ┌──────────────────────────────────┐         │
│ │ 会話エリア                       │         │
│ │   あなた: 「プレゼンを作って」    │         │
│ │   AI: 「はい、作ります...」       │         │
│ │                                  │         │
│ │ ┌────────────────────────────┐   │         │
│ │ │ ストリーミング表示          │   │         │
│ │ │  スキル名  [実行中... 🔵]  │   │ ← 信号機  │
│ │ │  AIの作業内容が              │   │         │
│ │ │  リアルタイムで表示▌        │   │ ← 1文字ずつ │
│ │ └────────────────────────────┘   │         │
│ └──────────────────────────────────┘         │
│                                              │
│ ┌──────────────────────────────────┐         │
│ │ メッセージ入力欄                 │  ← 入力エリア │
│ └──────────────────────────────────┘         │
│                                              │
│  [確認のドア（PermissionDialog）] ← 必要なときだけ表示 │
└─────────────────────────────────────────────┘
```

---

### まとめ

| 機能名             | たとえると        | ひとことで言うと                 |
| ------------------ | ----------------- | -------------------------------- |
| ChatPanel          | 勉強机            | すべてをまとめる作業スペース     |
| SkillSelector      | 道具箱            | AIのスキルを選ぶセレクター       |
| ストリーミング表示 | 1文字ずつ届く手紙 | AIの作業をリアルタイムで見る窓   |
| PermissionDialog   | 確認のドア        | AIに許可を出す仕組み             |
| StatusBadge        | 信号機            | 今の状態が色で一目でわかるしるし |

---

---

## Part 2: 技術的な詳細

### 2.1 コンポーネント階層と統合アーキテクチャ

#### コンポーネントツリー

```
ChatPanel (forwardRef<ChatPanelHandle>)              [136行]
├── Header (role="toolbar", aria-label="チャット設定")
│   ├── ModelSelector (既存スロット)
│   └── SkillSelector (TASK-7A)
├── MessageArea (flex-1, overflow-y-auto)
│   ├── MessageList (既存スロット)
│   └── SkillStreamingView (条件付きレンダリング)   [252行, React.memo]
│       ├── StatusBadge (role="status")
│       ├── StreamMessageItem
│       │   ├── AssistantMessage (whitespace-pre-wrap)
│       │   │   └── PartialCursor (animate-pulse, isPartial時)
│       │   ├── ToolUseMessage (bg-blue-50)
│       │   ├── ToolResultMessage (bg-green-50 / bg-red-50)
│       │   └── ErrorMessage (bg-red-50, text-red-600)
│       ├── AbortButton (status==="running" 時のみ)
│       └── ToolExecutionHistory (<details>/<summary>)
├── InputArea
│   └── ChatInput (既存スロット)
└── Dialogs
    ├── SkillImportDialog (TASK-7B, importDialogSkill時)
    └── PermissionDialog (TASK-7C, Store-direct, 常時マウント)
```

#### ファイル構成

| ファイル                                               | 行数  | 役割                     |
| ------------------------------------------------------ | ----- | ------------------------ |
| `src/renderer/components/chat/ChatPanel.tsx`           | 136行 | 統合ホストコンポーネント |
| `src/renderer/components/skill/SkillStreamingView.tsx` | 252行 | ストリーミング表示       |
| `src/renderer/components/skill/PermissionDialog.tsx`   | 271行 | 権限確認ダイアログ       |
| `src/renderer/components/skill/index.ts`               | 7行   | エクスポートバレル       |

---

### 2.2 TypeScript インターフェース

#### ChatPanel

```typescript
// Props
export interface ChatPanelProps {
  onImportRequest?: (skill: SkillMetadata) => void;
}

// 公開ハンドル（ref経由）
export interface ChatPanelHandle {
  handleImportRequest: (skill: SkillMetadata) => void;
}
```

#### SkillStreamingView

```typescript
export interface SkillStreamingViewProps {
  /** 実行中のスキル名 */
  skillName: string;
  /** ストリーミングメッセージ一覧 */
  messages: SkillStreamMessage[];
  /** 実行ステータス */
  status: SkillExecutionStatus | null;
}
```

#### SkillExecutionStatus（@repo/shared）

```typescript
export type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";
```

#### SkillStreamMessage（@repo/shared, Discriminated Union）

```typescript
export type SkillStreamMessageType =
  | "assistant"
  | "tool_use"
  | "tool_result"
  | "status"
  | "error";

export type SkillStreamMessage =
  | {
      executionId: string;
      type: "assistant";
      content: AssistantMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: ToolResultMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: StatusMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: ErrorMessageContent;
      timestamp: number;
    };
```

#### Content型詳細

```typescript
export interface AssistantMessageContent {
  text: string;
  isPartial?: boolean;
}

export interface ToolUseMessageContent {
  toolName: string;
  args: Record<string, unknown>;
  toolUseId: string;
}

export interface ToolResultMessageContent {
  toolUseId: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface StatusMessageContent {
  status: "started" | "tool_executing" | "tool_completed" | "completed";
  detail?: string;
}

export interface ErrorMessageContent {
  code: "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown";
  message: string;
  retryable: boolean;
}
```

---

### 2.3 サブコンポーネント API仕様

#### StatusBadge

| プロパティ | 型                             | 説明                 |
| ---------- | ------------------------------ | -------------------- |
| `status`   | `SkillExecutionStatus \| null` | 現在の実行ステータス |

**表示ロジック**:

- `null` または `"idle"` の場合 → `null`を返す（非表示）
- それ以外 → `STATUS_CONFIG`マップから色・ラベルを取得して表示

```typescript
type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">;

const STATUS_CONFIG: Record<
  DisplayableStatus,
  { color: string; label: string }
> = {
  running: { color: "bg-blue-500", label: "実行中..." },
  permission_pending: { color: "bg-yellow-500", label: "権限確認" },
  completed: { color: "bg-green-500", label: "完了" },
  cancelled: { color: "bg-gray-500", label: "キャンセル" },
  error: { color: "bg-red-500", label: "エラー" },
};
```

**アクセシビリティ**: `role="status"` により、スクリーンリーダーがステータス変更を通知する。

---

#### StreamMessageItem

| プロパティ | 型                   | 説明               |
| ---------- | -------------------- | ------------------ |
| `message`  | `SkillStreamMessage` | 表示するメッセージ |

**レンダリングルール（switch/case）**:

| `message.type` | 表示内容                               | data-testid                                 | スタイル                    |
| -------------- | -------------------------------------- | ------------------------------------------- | --------------------------- |
| `assistant`    | テキスト + カーソル（isPartial時）     | `assistant-message`                         | `whitespace-pre-wrap`       |
| `tool_use`     | `ツール使用: {toolName}`               | `tool-use-message`                          | `bg-blue-50`                |
| `tool_result`  | 成功: `完了` / 失敗: `エラー: {error}` | `tool-result-success` / `tool-result-error` | `bg-green-50` / `bg-red-50` |
| `error`        | エラーメッセージ                       | `error-message`                             | `bg-red-50 text-red-600`    |
| `status`       | `null`（非表示）                       | -                                           | -                           |
| `default`      | `null`（安全なフォールバック）         | -                                           | -                           |

**Partial Cursor**: `isPartial === true` の場合、`animate-pulse`アニメーション付きの `▌` カーソルを表示する。`aria-label="入力中"` を設定。

---

#### ToolExecutionHistory

| プロパティ | 型                     | 説明             |
| ---------- | ---------------------- | ---------------- |
| `messages` | `SkillStreamMessage[]` | 全メッセージ配列 |

**ロジック**:

1. `tool_use` と `tool_result` のみフィルタリング
2. ツール数 = `toolMessages.length / 2`（use+resultペア）
3. 0件の場合は `null`を返す
4. `<details>`/`<summary>` で折りたたみUI

```html
<details data-testid="tool-execution-history">
  <summary>ツール実行履歴（{N}件）</summary>
  <!-- ツール使用/結果リスト -->
</details>
```

---

### 2.4 Store接続パターン

#### ChatPanelのセレクター

```typescript
// 個別セレクターでshallow比較を実現
const selectedSkillName = useAppStore((s) => s.selectedSkillName); // string | null
const streamingMessages = useAppStore((s) => s.streamingMessages); // SkillStreamMessage[]
const isExecuting = useAppStore((s) => s.isExecuting); // boolean
const skillExecutionStatus = useAppStore((s) => s.skillExecutionStatus); // SkillExecutionStatus | null
const fetchSkills = useAppStore((s) => s.fetchSkills); // () => Promise<void>
```

#### SkillStreamingViewのセレクター

```typescript
// abortExecution アクションのみ取得
const abortExecution = useAppStore((s) => s.abortExecution);
```

#### PermissionDialogのStore-directパターン

```typescript
// 複数の状態+アクションをまとめて取得
const { pendingPermission, respondToSkillPermission } = useAppStore();
```

#### 子コンポーネント別Store使用パターン

| コンポーネント     | Store Hook         | 取得パターン     | 備考                   |
| ------------------ | ------------------ | ---------------- | ---------------------- |
| ChatPanel          | `useAppStore(s=>)` | 個別セレクター   | 5つの状態/アクション   |
| SkillSelector      | `useSkillStore()`  | セレクターフック | 専用フック（変更不要） |
| SkillImportDialog  | `useAppStore()`    | 直接参照         | ChatPanelからProps受渡 |
| PermissionDialog   | `useAppStore()`    | Store-direct     | 分割代入で取得         |
| SkillStreamingView | `useAppStore(s=>)` | 個別セレクター   | abortExecutionのみ     |

---

### 2.5 データフロー

```
skillSlice (Zustand Store)
    │
    ├── selectedSkillName ──────→ ChatPanel ──→ skillName prop ──→ SkillStreamingView
    ├── streamingMessages ──────→ ChatPanel ──→ messages prop ──→ SkillStreamingView
    ├── skillExecutionStatus ───→ ChatPanel ──→ status prop ────→ SkillStreamingView
    ├── isExecuting ────────────→ ChatPanel ──→ 条件付きレンダリング制御
    ├── fetchSkills ────────────→ ChatPanel ──→ useEffect初期化（マウント時）
    │
    ├── pendingPermission ──────→ PermissionDialog (Store-direct)
    └── respondToSkillPermission → PermissionDialog (Store-direct)

SkillSelector
    └── onImportRequest ────────→ ChatPanel.handleImportRequest
                                     │
                                     └── setImportDialogSkill(skill)
                                              │
                                              └── SkillImportDialog (条件付き表示)
```

#### 条件付きレンダリング

```typescript
// SkillStreamingViewの表示条件
// isExecuting === true かつ selectedSkillName !== null の場合のみ表示
{isExecuting && selectedSkillName && (
  <SkillStreamingView
    skillName={selectedSkillName}
    messages={streamingMessages}
    status={skillExecutionStatus}
  />
)}
```

#### PermissionDialogの常時マウント

PermissionDialogはChatPanel内で常時マウントされる。内部で `pendingPermission` をStore-directで監視し、値が `null` でない場合にダイアログUIを表示する。

```typescript
// ChatPanel内
<PermissionDialog />

// PermissionDialog内部
if (!pendingPermission) return null;
// pendingPermissionが存在する場合のみUI表示
```

---

### 2.6 アクセシビリティ実装

#### ChatPanel

| 要素   | 属性             | 値               |
| ------ | ---------------- | ---------------- |
| Header | `role="toolbar"` | -                |
| Header | `aria-label`     | `"チャット設定"` |

#### SkillStreamingView

| 要素           | 属性            | 値                       | 目的                                   |
| -------------- | --------------- | ------------------------ | -------------------------------------- |
| メッセージ領域 | `role="log"`    | -                        | 動的コンテンツ領域を示す               |
| メッセージ領域 | `aria-live`     | `"polite"`               | 新メッセージをスクリーンリーダーに通知 |
| メッセージ領域 | `aria-label`    | `"スキル実行結果"`       | 領域の説明                             |
| StatusBadge    | `role="status"` | -                        | ステータス変更を通知                   |
| 中止ボタン     | `aria-label`    | `"スキル実行を中止する"` | ボタンの目的を説明                     |
| PartialCursor  | `aria-label`    | `"入力中"`               | カーソルの意味を説明                   |

#### PermissionDialog

| 要素         | 属性               | 値                         | 目的               |
| ------------ | ------------------ | -------------------------- | ------------------ |
| ダイアログ   | `role="dialog"`    | -                          | ダイアログの意味   |
| ダイアログ   | `aria-modal`       | `"true"`                   | モーダルであること |
| ダイアログ   | `aria-labelledby`  | `"{uniqueId}-title"`       | タイトルと関連付け |
| ダイアログ   | `aria-describedby` | `"{uniqueId}-description"` | 説明文と関連付け   |
| 閉じるボタン | `aria-label`       | `"閉じる"`                 | ボタン目的         |
| 詳細トグル   | `aria-expanded`    | `true`/`false`             | 展開状態           |
| 詳細トグル   | `aria-controls`    | `"{uniqueId}-detail"`      | 制御対象           |

**フォーカス管理**:

- ダイアログ表示時に「許可」ボタンへ自動フォーカス
- Tabキーによるフォーカストラップ（ダイアログ内に閉じ込め）
- Escapeキーで拒否（ダイアログ閉じ）

---

### 2.7 テスト戦略と主要テストケース

#### テスト概要

| ファイル                    | テスト数 | カバレッジ(Line)  | カバレッジ(Branch) | 判定 |
| --------------------------- | -------- | ----------------- | ------------------ | ---- |
| ChatPanel.test.tsx          | 15       | 100%              | 100%               | PASS |
| SkillStreamingView.test.tsx | 33       | 99.31%            | 93.75%             | PASS |
| **合計**                    | **48**   | **100% / 99.31%** | **100% / 93.75%**  | PASS |

#### ChatPanel テストケース（15件）

**基本レンダリング（3件）**:

- SkillSelectorがヘッダー内にレンダリングされること
- PermissionDialogがレンダリングされること
- チャットパネル構造（header, message-area, input-area）がレンダリングされること

**SkillStreamingView表示制御（3件）**:

- `isExecuting=true` かつ `selectedSkillName` が設定されている場合に表示されること
- `isExecuting=false` の場合に非表示であること
- `selectedSkillName=null` の場合に非表示であること

**fetchSkills初期化（1件）**:

- マウント時に `fetchSkills` が1回呼ばれること

**エッジケース（2件）**:

- 初期状態でクラッシュしないこと
- `fetchSkills` がエラーを返しても安全に動作すること

**アクセシビリティ（2件）**:

- ヘッダーに `role="toolbar"` があること
- ヘッダーに `aria-label="チャット設定"` があること

**SkillImportDialog統合（4件）**:

- ref経由の `handleImportRequest` でインポートダイアログが表示されること
- `onImportRequest` コールバックが呼ばれること
- `onClose` でダイアログが閉じること
- 初期状態ではインポートダイアログが非表示であること

#### SkillStreamingView テストケース（33件）

**ヘッダー表示（8件）**:

- スキル名の表示
- StatusBadge: running/permission_pending/completed/cancelled/error の各ステータス表示
- idle/null で StatusBadge が非表示

**中止ボタン（3件）**:

- running 時に表示
- running 以外で非表示
- クリックで `abortExecution` が呼ばれる

**メッセージ表示（7件）**:

- assistant メッセージのテキスト表示
- isPartial 時のカーソル表示
- 完了メッセージでカーソル非表示
- tool_use 通知表示
- tool_result 成功/失敗表示
- error メッセージ表示

**ツール実行履歴（3件）**:

- ツールメッセージ存在時に履歴表示
- ツールメッセージ非存在時に非表示
- 正確なツール件数の表示

**エッジケース（7件）**:

- 空メッセージ配列
- 大量メッセージ（100件）
- 空テキストのassistantメッセージ
- 空エラーメッセージのtool_result
- running → completed ステータス遷移
- running → error ステータス遷移
- status タイプメッセージは何もレンダリングしない

**アクセシビリティ（5件）**:

- `role="log"` の存在
- `aria-live="polite"` の存在
- 中止ボタンの `aria-label`
- StatusBadge の `role="status"`
- メッセージ領域の `aria-label`

#### テストのモック戦略

```typescript
// Store Mock: セレクター関数パターン
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(mockStoreState)),
}));

// コンポーネントMock: data-testidで識別
vi.mock("../../skill/SkillSelector", () => ({
  SkillSelector: () => <div data-testid="mock-skill-selector">SkillSelector</div>,
}));
```

#### 未到達行分析

- `SkillStreamingView.tsx` L135（displayName設定行）: `React.memo` の静的プロパティ設定であり、テスト実行パスでは到達しない。機能的影響なし。

---

### 2.8 主要な実装詳細

#### ChatPanel.tsx（136行）

- **forwardRef + useImperativeHandle**: 親コンポーネントから `ref.current.handleImportRequest(skill)` 経由でインポートダイアログを制御可能にする
- **useEffect初期化**: マウント時に `fetchSkills()` を1回呼び出し、スキル一覧をロードする
- **ローカルState**: `importDialogSkill` のみ（`SkillMetadata | null`）。ダイアログの表示/非表示制御に使用
- **条件付きレンダリング**: `isExecuting && selectedSkillName` の両方が truthy の場合のみ SkillStreamingView を表示

#### SkillStreamingView.tsx（252行, React.memo最適化）

- **React.memo**: Props の浅い比較により、不要な再レンダリングを抑制
- **Discriminated Union の switch/case**: `message.type` で型安全なパターンマッチングを実現
- **STATUS_CONFIG定数マップ**: ステータスと色・ラベルのマッピングを定数化し、レンダリングロジックを簡潔に保つ
- **DisplayableStatus型**: `Exclude<SkillExecutionStatus, "idle">` で idle を除外し、表示対象のみ型安全に扱う

#### PermissionDialogのStore-directパターン

- ChatPanelからPropsを受け取らず、`useAppStore()` から直接 `pendingPermission` と `respondToSkillPermission` を取得
- ChatPanelとの結合度を最小化し、独立してテスト可能
- 常時マウントされ、`pendingPermission` が `null` の場合は `null` を返す

#### パフォーマンス考慮

| 最適化               | 適用箇所           | 効果                                  |
| -------------------- | ------------------ | ------------------------------------- |
| `React.memo`         | SkillStreamingView | Props未変更時の再レンダリングスキップ |
| 個別セレクター       | ChatPanel          | 関連状態変更時のみ再レンダリング      |
| 条件付きレンダリング | SkillStreamingView | 非実行時にDOMツリーから除外           |
| `useCallback`        | PermissionDialog   | ハンドラーの参照安定化                |

---

### 2.9 関連ドキュメント

| ドキュメント         | パス                                         |
| -------------------- | -------------------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`     |
| コンポーネント設計書 | `outputs/phase-2/component-design.md`        |
| 状態管理設計書       | `outputs/phase-2/state-management-design.md` |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`         |
| 共有型定義           | `packages/shared/src/types/skill.ts`         |
