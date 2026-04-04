# Phase 2: 設計 — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                  |
| --------- | ------------------- |
| Phase番号 | 2                   |
| 機能名    | conversation-ui     |
| タスクID  | TASK-SDK-SC-02      |
| 作成日    | 2026-04-02          |
| 依存Phase | Phase 1（要件定義） |

## 目的

Phase 1 で定義した要件を元に、各コンポーネントの Propsインターフェース・コンポーネントツリー構造・IPC通信フローを設計する。

## 実行タスク

### Task 2-1: Propsインターフェース設計

#### ChoiceButtonProps

```typescript
interface ChoiceButtonProps {
  /** 選択肢のラベル文字列 */
  label: string;
  /** 選択済み状態かどうか */
  isSelected: boolean;
  /** 「その他（自由入力）」ボタンかどうか（破線ボーダースタイルを適用） */
  isFreeText?: boolean;
  /** クリック時のコールバック */
  onClick: () => void;
  /** ボタンを無効化するか（送信処理中など） */
  disabled?: boolean;
}
```

#### FreeTextInputProps

```typescript
interface FreeTextInputProps {
  /** テキストエリアのプレースホルダー */
  placeholder?: string;
  /** Enter キー押下時（または送信ボタン押下時）のコールバック */
  onSubmit: (text: string) => void;
  /** コンポーネントの表示/非表示を制御 */
  isVisible: boolean;
  /** パスワードマスク表示（secret タイプ用） */
  isSecret?: boolean;
  /** 入力を無効化するか（送信処理中など） */
  disabled?: boolean;
}
```

#### QuestionCardProps

```typescript
interface QuestionCardProps {
  /** AIが送信した質問ペイロード */
  question: QuestionPayload;
  /** ユーザーが回答したときのコールバック */
  onAnswer: (answer: string | string[]) => void;
  /** 送信処理中フラグ（UI無効化用） */
  isSubmitting?: boolean;
}
```

#### ConversationProgressProps

```typescript
interface ConversationProgressProps {
  /** 現在の質問番号（1始まり） */
  current: number;
  /** 推定合計質問数 */
  estimatedTotal: number;
}
```

#### SkillCreatorConversationPanelProps

```typescript
interface SkillCreatorConversationPanelProps {
  /** パネルを閉じるときのコールバック */
  onClose?: () => void;
  /** インタビュー完了時のコールバック */
  onComplete?: () => void;
}
```

### Task 2-2: コンポーネントツリー構造

```
SkillCreatorConversationPanel (Organism)
├── ConversationProgress (Atom)
│     - current: number
│     - estimatedTotal: number
└── QuestionCard (Molecule)
      - question: QuestionPayload
      - onAnswer: (answer) => void
      - isSubmitting: boolean
      ├── <タイプ: single_select>
      │     ├── ChoiceButton[] (Atom)  ← payload.choices の各要素
      │     ├── ChoiceButton (Atom)    ← 「その他（自由入力）」（常に最後）
      │     └── FreeTextInput (Atom)  ← 「その他」選択時のみ展開
      ├── <タイプ: multi_select>
      │     ├── ChoiceButton[] (Atom)  ← payload.choices の各要素（複数選択）
      │     ├── ChoiceButton (Atom)    ← 「その他（自由入力）」（常に最後）
      │     ├── FreeTextInput (Atom)  ← 「その他」選択時のみ展開
      │     └── <送信ボタン>          ← 選択確定送信
      ├── <タイプ: free_text>
      │     └── FreeTextInput (Atom)  ← isSecret=false、常に表示
      ├── <タイプ: secret>
      │     └── FreeTextInput (Atom)  ← isSecret=true、常に表示
      └── <タイプ: confirm>
            ├── ChoiceButton (Atom)   ← 「はい」
            └── ChoiceButton (Atom)   ← 「いいえ」
```

### Task 2-3: IPC通信フロー設計

```
[Main プロセス]                              [Renderer プロセス]
      |                                             |
      |--- IPC: skill-creator:question-received ──>|
      |    { payload: QuestionPayload }             |
      |                                             | → SkillCreatorConversationPanel
      |                                             |   - currentQuestion 状態を更新
      |                                             |   - questionIndex をインクリメント
      |                                             |   - QuestionCard を再レンダリング
      |                                             |
      |                              ユーザー操作   |
      |                           (選択 or 自由入力)|
      |                                             |
      |<--- IPC: skill-creator:answer ─────────────|
      |    { answer: string | string[] }            |
      |                                             |
      |--- IPC: skill-creator:question-received ──>|
      |    （次の質問または完了シグナル）            |
```

#### IPCチャネル定数の参照

```typescript
// packages/shared/src/ipc/channels.ts からインポート
import {
  SKILL_CREATOR_QUESTION_RECEIVED,
  SKILL_CREATOR_ANSWER,
} from "@repo/shared/src/ipc/channels";
```

### Task 2-4: 状態管理設計（SkillCreatorConversationPanel）

```typescript
// useReducer による状態管理
type ConversationState = {
  currentQuestion: QuestionPayload | null;
  questionIndex: number;
  estimatedTotal: number;
  isSubmitting: boolean;
  isComplete: boolean;
};

type ConversationAction =
  | { type: "QUESTION_RECEIVED"; payload: QuestionPayload }
  | { type: "ANSWER_SUBMITTING" }
  | { type: "ANSWER_SUBMITTED" }
  | { type: "CONVERSATION_COMPLETE" };
```

#### QuestionCard 内部状態

```typescript
// QuestionCard 内部の useState による状態管理
const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
const [isFreeTextVisible, setIsFreeTextVisible] = useState<boolean>(false);
const [freeTextValue, setFreeTextValue] = useState<string>("");
```

### Task 2-5: 「その他（自由入力）」の実装パターン

```typescript
const FREE_TEXT_LABEL = "その他（自由入力）";

// single_select / multi_select の選択肢リストを組み立てる
// allowFreeText フラグに関わらず、常に末尾に追加する
const choicesWithFreeText = [...payload.choices, FREE_TEXT_LABEL];
```

### Task 2-6: スタイル方針

| コンポーネント             | スタイル方針                                                                    |
| -------------------------- | ------------------------------------------------------------------------------- |
| ChoiceButton（未選択）     | `bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400`         |
| ChoiceButton（選択済み）   | `bg-blue-500 text-white border-2 border-blue-600`                               |
| ChoiceButton（isFreeText） | `border-dashed border-gray-400`（未選択時）                                     |
| FreeTextInput              | `w-full p-3 border-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-400`   |
| FreeTextInput（secret）    | `type="password"` に加え同スタイル                                              |
| QuestionCard               | `rounded-lg shadow-md p-6 bg-white`                                             |
| ConversationProgress       | バー: `bg-blue-500`、トラック: `bg-gray-200`、テキスト: `text-sm text-gray-600` |

### Task 2-7: IPCリスナー登録パターン

```typescript
useEffect(() => {
  const unsubscribe = window.api.on(
    SKILL_CREATOR_QUESTION_RECEIVED,
    (payload: QuestionPayload) => {
      dispatch({ type: "QUESTION_RECEIVED", payload });
    },
  );
  // cleanup: アンマウント時にリスナーを解除する
  return () => {
    unsubscribe?.();
  };
}, []);
```

## 参照資料

| 資料名                 | パス                                        |
| ---------------------- | ------------------------------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`                   |
| QuestionPayload 型定義 | `packages/shared/src/types/skillCreator.ts` |
| IPC チャネル定数       | `packages/shared/src/ipc/channels.ts`       |

## 成果物

| 成果物               | パス                | 形式     |
| -------------------- | ------------------- | -------- |
| 設計書（本ファイル） | `phase-2-design.md` | Markdown |

## 完了条件

- [ ] 全5コンポーネントの Propsインターフェースを設計した
- [ ] コンポーネントツリー構造を設計した
- [ ] IPC通信フロー（question-received受信 → QuestionCard更新 → answer送信）を設計した
- [ ] 状態管理の設計（useReducer パターン）を記述した
- [ ] 「その他（自由入力）」の実装パターンを定義した
- [ ] Tailwind CSS スタイル方針を定義した
- [ ] IPCリスナー登録・クリーンアップパターンを設計した

## 次の Phase: Phase 3 (phase-3-design-review.md)
