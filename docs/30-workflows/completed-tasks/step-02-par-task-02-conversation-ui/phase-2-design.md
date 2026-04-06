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
  /** AIが送信した質問リクエスト */
  request: SkillCreatorUserInputRequest;
  /** ユーザーが回答したときのコールバック */
  onAnswer: (answer: InterviewUserAnswer) => void;
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
  /** インタビュー完了時のコールバック */
  onComplete?: () => void;
  /** インタビューエラー時のコールバック */
  onError?: (message: string) => void;
}
```

### Task 2-2: コンポーネントツリー構造

```
SkillCreatorConversationPanel (Organism)
├── ConversationProgress (Atom)
│     - current: number
│     - estimatedTotal: number
└── QuestionCard (Molecule)
      - request: SkillCreatorUserInputRequest
      - onAnswer: (answer: InterviewUserAnswer) => void
      - isSubmitting: boolean
      ├── <kind: single_select>
      │     ├── ChoiceButton[] (Atom)  ← request.options の各要素
      │     ├── ChoiceButton (Atom)    ← 「その他（自由入力）」（常に最後）
      │     └── FreeTextInput (Atom)  ← 「その他」選択時のみ展開
      ├── <kind: multi_select>
      │     ├── ChoiceButton[] (Atom)  ← request.options の各要素（複数選択）
      │     ├── ChoiceButton (Atom)    ← 「その他（自由入力）」（常に最後）
      │     ├── FreeTextInput (Atom)  ← 「その他」選択時のみ展開
      │     └── <送信ボタン>          ← 選択確定送信
      ├── <kind: free_text>
      │     └── FreeTextInput (Atom)  ← isSecret=false、常に表示
      ├── <kind: secret>
      │     └── FreeTextInput (Atom)  ← isSecret=true、常に表示
      └── <kind: confirm>
            ├── ChoiceButton (Atom)   ← 「はい」
            └── ChoiceButton (Atom)   ← 「いいえ」
```

### Task 2-3: IPC通信フロー設計

```
[Main プロセス]                              [Renderer プロセス]
      |                                             |
      |--- IPC: skill-creator:question-received ──>|
      |    UserInputQuestion                        |
      |                                             | → SkillCreatorConversationPanel
      |                                             |   - UserInputQuestion を SkillCreatorUserInputRequest に変換
      |                                             |   - currentRequest 状態を更新
      |                                             |   - questionIndex をインクリメント
      |                                             |   - QuestionCard を再レンダリング
      |                                             |
      |                              ユーザー操作   |
      |                           (選択 or 自由入力)|
      |                                             |
      |<--- IPC: skill-creator:answer ─────────────|
      |    UserInputAnswer                           |
      |                                             |
      |--- IPC: skill-creator:question-received ──>|
      |    （次の質問または完了シグナル）            |
      |--- IPC: skill-creator:session-complete ────>|
      |    （完了通知）                              |
      |--- IPC: skill-creator:session-error ────────>|
      |    （エラー通知）                             |
```

#### IPCチャネル定数の参照

```typescript
// packages/shared/src/ipc/channels.ts からインポート
import { SKILL_CREATOR_SESSION_CHANNELS } from "@repo/shared/src/ipc/channels";
```

### Task 2-4: 状態管理設計（SkillCreatorConversationPanel）

```typescript
// useReducer による状態管理
type ConversationState = {
  currentRequest: SkillCreatorUserInputRequest | null;
  questionIndex: number;
  estimatedTotal: number;
  isSubmitting: boolean;
  terminalState: "idle" | "complete" | "error";
  errorMessage: string | null;
};

type ConversationAction =
  | { type: "QUESTION_RECEIVED"; payload: SkillCreatorUserInputRequest }
  | { type: "ANSWER_SUBMITTING" }
  | { type: "ANSWER_SUBMITTED" }
  | { type: "SESSION_COMPLETE" }
  | { type: "SESSION_ERROR"; message: string };
```

#### QuestionCard 内部状態

```typescript
// QuestionCard 内部の useState による状態管理
const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
const [isFreeTextVisible, setIsFreeTextVisible] = useState<boolean>(false);
const [freeTextValue, setFreeTextValue] = useState<string>("");
```

- `SkillCreatorConversationPanel` は `QuestionCard` に `key={questionIndex}` を付与し、新しい質問ごとに内部状態を再初期化する
- `FREE_TEXT_LABEL` を選択した場合は通常選択をクリアし、自由入力を単独の回答経路として扱う
- `multi_select` で自由入力が選ばれた場合は `selectedValues` を使って回答を保持し、ブリッジ層で `UserInputAnswer` に正規化する
- `allowSkip` は request のメタデータとして保持し、false の場合は skip UI を表示しない
- `SkillCreatorConversationPanel` は `UserInputQuestion` を `SkillCreatorUserInputRequest` に、`InterviewUserAnswer` を `UserInputAnswer` に写像するブリッジ層として振る舞う

### Task 2-5: 「その他（自由入力）」の実装パターン

```typescript
const FREE_TEXT_LABEL = "その他（自由入力）";

// single_select / multi_select の選択肢リストを組み立てる
// allowSkip の有無に関わらず、常に末尾に追加する
const optionsWithFreeText = [...(request.options ?? []), FREE_TEXT_LABEL];
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
  const unsubscribeQuestion = window.skillCreatorSessionAPI.onQuestion(
    (question: UserInputQuestion) => {
      const request = mapQuestionToRequest(question);
      dispatch({ type: "QUESTION_RECEIVED", payload: request });
    },
  );
  const unsubscribeComplete = window.skillCreatorSessionAPI.onComplete(() => {
    dispatch({ type: "SESSION_COMPLETE" });
    onComplete?.();
  });
  const unsubscribeError = window.skillCreatorSessionAPI.onError(
    (event: { error: string }) => {
      dispatch({ type: "SESSION_ERROR", message: event.error });
      onError?.(event.error);
    },
  );
  // cleanup: アンマウント時にリスナーを解除する
  return () => {
    unsubscribeQuestion?.();
    unsubscribeComplete?.();
    unsubscribeError?.();
  };
}, [onComplete, onError]);
```

## 参照資料

| 資料名                                                                                      | パス                                                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Phase 1 要件定義                                                                            | `phase-1-requirements.md`                                                    |
| UserInputQuestion / UserInputAnswer / SkillCreatorUserInputRequest / InterviewUserAnswer 型 | `packages/shared/src/types/index.ts`                                         |
| WorkflowUiSnapshot 型                                                                       | `packages/shared/src/types/skillCreator.ts`                                  |
| IPC チャネル定数                                                                            | `packages/shared/src/ipc/channels.ts`                                        |
| UI/UX 親仕様                                                                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      |
| IPC 正本                                                                                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| セキュリティ正本                                                                            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| 品質・テスト正本                                                                            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## 実行手順

1. Props・状態・IPC 参照を設計する
2. Atomic Design のツリーと責務を確定する
3. `QuestionCard` の再マウント方針を含めて state 連携を固定する
4. Phase 3 のレビュー観点へ接続する

## 統合テスト連携

- Phase 4 のテストファイル構成をこの設計に合わせる
- Phase 7 で coverage を確認する
- Phase 10 で設計漏れを再点検する

## 多角的チェック観点（AIが判断）

| 観点           | 適用理由             | 主な確認点                            |
| -------------- | -------------------- | ------------------------------------- |
| UI/UX          | React UI の分岐設計  | Choice / FreeText / Progress の整合   |
| IPC            | Main/Renderer 連携   | `SKILL_CREATOR_SESSION_CHANNELS` 参照 |
| アーキテクチャ | 状態所有権の明確化   | Panel / Card / Input の責務境界       |
| 保守性         | 重複と持ち越しの削減 | 共通ヘッダ、`key` 再マウント          |

## サブタスク管理

- 2-1〜2-3 は並列に検討可
- 2-4〜2-7 は設計の依存順で接続する
- 5 つのコンポーネントのうち atoms 3件は並列優先

## 成果物

| 成果物               | パス                | 形式     |
| -------------------- | ------------------- | -------- |
| 設計書（本ファイル） | `phase-2-design.md` | Markdown |

## 完了条件

- [ ] 全5コンポーネントの Propsインターフェースを設計した
- [ ] コンポーネントツリー構造を設計した
- [ ] IPC通信フロー（question-received受信 → QuestionCard更新 → answer送信 → session終端）を設計した
- [ ] 状態管理の設計（useReducer パターン）を記述した
- [ ] 「その他（自由入力）」の実装パターンを定義した
- [ ] Tailwind CSS スタイル方針を定義した
- [ ] IPCリスナー登録・クリーンアップパターンを設計した

## タスク100%実行確認【必須】

- [ ] Props・State・IPC・ツリー構造が定義された
- [ ] 再マウント方針が明示された
- [ ] Phase 4 のテストに流用できる粒度になった

## 次の Phase: Phase 3 (phase-3-design-review.md)
