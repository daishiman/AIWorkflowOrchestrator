# Phase 12: スキルフィードバック — TASK-SDK-SC-02

## 学び

1. Session Bridge 型（`UserInputQuestion`/`UserInputAnswer`）と Workflow 型（`SkillCreatorUserInputRequest`/`InterviewUserAnswer`）の 2 系統が存在する場合、ブリッジ層のマッピング関数は Organism コンポーネント内に閉じ込めるのが安全。型変換の責務が分散すると IPC 境界でのデバッグが困難になる。
2. `multi_select` の「その他（自由入力）」は `selectedValues` 経路として扱い、`selectedOptionIds` とは別系統にすることで、ブリッジでの正規化が明確になる。mixed（選択肢 + 自由入力）を 1 つの配列に混ぜると型安全性が崩れる。
3. `key={questionIndex}` による React コンポーネント再マウントパターンは、前の質問の内部状態を持ち越さない簡潔な手法。ただし、アニメーション付きの場合は `key` 変更のタイミングに注意が必要。
4. `useReducer` の Action 型を discriminated union にすると、不正な状態遷移がコンパイル時に検出できる。`ANSWER_SUBMITTED` のような中間状態が不要な場合は早期に削除して状態機械をシンプルに保つべき。
5. Atom / Molecule / Organism の責務分離により、`ChoiceButton` / `FreeTextInput` は QuestionCard の kind に依存せず独立テスト可能。テストカバレッジの向上にも直結する。

## next action

- Session Bridge 型と Workflow 型のブリッジパターンを他の IPC 通信箇所にも適用する
- `multi_select` の「その他」フロー（selectedValues 経路）をインテグレーションテストで E2E 検証する
- Atom コンポーネントの Storybook 登録（将来の Phase で対応）
