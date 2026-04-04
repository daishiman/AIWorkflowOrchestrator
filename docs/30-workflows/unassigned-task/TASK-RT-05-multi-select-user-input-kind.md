# UserInputKind に multi_select を追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1885
```

## メタ情報

| 項目         | 値                                                        |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-RT-05                                                |
| タスク名     | UserInputKind に multi_select を追加                      |
| 分類         | 新機能（Runtime系・型拡張）                               |
| 対象機能     | Skill Creator Agent SDK Lane - 会話型インタビュー入力種別 |
| 優先度       | 中                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | P0是正パック（ギャップ分析）                              |
| 発見日       | 2026-04-04                                                |
| Step         | 09（並列実行可能）                                        |
| 依存タスク   | なし                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1-1. 現状の問題

Skill Creator の会話型インタビューで使用できる入力種別（`UserInputKind`）が不足している。

現在 `packages/shared/src/types/skillCreatorSession.ts` にて定義されている `UserInputType` は以下の4種：

| 種別            | 説明                             | 対応状況   |
| --------------- | -------------------------------- | ---------- |
| `single_select` | 単一選択（ラジオボタン相当）     | 対応済み   |
| `free_text`     | 自由入力（テキストフィールド）   | 対応済み   |
| `confirm`       | 確認（はい/いいえ）              | 対応済み   |
| `secret`        | パスワード入力（マスク表示）     | 対応済み   |
| `multi_select`  | 複数選択（チェックボックス相当） | **未対応** |

`multi_select` がないと、「使いたい機能を複数選んでください」のような質問ができず、ユーザーが一つずつ確認しながら進む必要が生じる。これはインタビューの流れを阻害し、UXを大幅に低下させる。

### 1-2. TASK-SDK-SC-02 での後回し経緯

TASK-SDK-SC-02（Conversation UI 質問受信・回答送信UIコンポーネント）実装時に、`multi_select` の「その他（自由入力）」フローの複雑性を理由として実装を後回しにした。具体的には：

- `selectedOptionIds`（選択肢IDの配列）と `selectedValues`（自由入力テキストの配列）の **2つの経路で状態が分散**しやすい
- mixed（選択肢+自由入力）を1つの配列に混ぜると型安全性が失われる
- `ChoiceButton` コンポーネント（単一選択用）をベースにマルチ選択へ拡張する場合、選択状態のトグル管理が必要になる
- `single_select` は選択即確定だが、`multi_select` には「確定」ボタンが必要

### 1-3. 影響範囲の概念図

```
[SDKエージェント質問]
    type: "multi_select"
         |
         v
[Session Bridge層]
  UserInputType（skillCreatorSession.ts）
         |
         | mapQuestionToRequest()
         v
[WorkflowEngine / UI層]
  SkillCreatorUserInputKind（skillCreator.ts）
  → QuestionCard.tsx の case "multi_select":
         |
         | MultiChoiceButton / FreeTextInput の組み合わせUI
         v
[ユーザー操作]
  selectedOptionIds[] / selectedValues[]
         |
         | mapAnswerToUserInputAnswer()
         v
[Session Bridge層]
  UserInputAnswer { value: string[] | boolean }
```

---

## 2. 何を達成するか（What）

### 2-1. 完了時の状態

- `UserInputType`（Session Bridge型）と `SkillCreatorUserInputKind`（Workflow型）の両方に `multi_select` が定義されており、型として完全にサポートされている
- `QuestionCard.tsx` の `case "multi_select":` ブロックが実装済みで、チェックボックス相当のトグルUIと「確定」ボタンが機能する
- 「その他（自由入力）」選択時に `FreeTextInput` が表示され、`selectedValues` 経路で値が送信できる
- `mapAnswerToUserInputAnswer()` が `selectedOptionIds` / `selectedValues` の両経路を正しく `UserInputAnswer.value: string[]` にマッピングする
- `InterviewUserAnswer` の `selectedOptionIds` / `selectedValues` フィールドが型定義として整合している
- Session Bridge の `SkillCreatorUserInputSubmission` が `selectedOptionIds` / `selectedValues` の両フィールドを持つ

### 2-2. スコープ境界

| 含むもの                                                                 | 含まないもの                                          |
| ------------------------------------------------------------------------ | ----------------------------------------------------- |
| `UserInputType`（Session Bridge型）への `multi_select` 確認・補完        | 会話型インタビューUI全体の統合（P0-06 の責務）        |
| `SkillCreatorUserInputKind`（Workflow型）への `multi_select` 確認・補完  | verify engine（P0-01 の責務）                         |
| `MultiChoiceButton` コンポーネントの新規作成（またはChoiceButtonの拡張） | SkillCreator全体のE2Eテスト（別タスクの責務）         |
| `FreeTextInput` との組み合わせUI（「その他」選択時）                     | `sdkMessageNormalizer.ts` の変更（TASK-RT-06 の責務） |
| `InterviewUserAnswer` の `multi_select` 対応確認・補完                   |                                                       |
| Session Bridge型とWorkflow型のマッピング関数の更新                       |                                                       |
| `QuestionCard.tsx` の `case "multi_select":` の完全実装                  |                                                       |
| ユニットテスト（`QuestionCard`、`ChoiceButton` 拡張部分）                |                                                       |

---

## 3. どのように実行するか（How）

### 3-1. 前提条件

- 作業ディレクトリ:
  ```
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260404-095836-wt-6
  ```
- 以下のコマンドが実行可能であること:
  ```bash
  pnpm --filter @repo/desktop test
  pnpm typecheck
  pnpm lint
  ```
- Node.js / pnpm が利用可能であること

### 3-2. 依存タスク（なし）

本タスクは Step 09 として並列実行可能。他タスクとの依存関係はない。

ただし以下の点に注意：

- **TASK-RT-06**（SDK Message 正規化）と作業ファイルが重複しない（`sdkMessageNormalizer.ts` は変更しない）
- **P0-06**（会話型インタビューUI統合）が本タスクの成果物（`multi_select` UI）を使用するため、P0-06担当者に進捗を共有すること

### 3-3. 必要な知識（二重型体系の理解が必須）

本タスクを実装するには、以下の **二重型体系** の理解が必須。

#### 二重型体系とは

Skill Creator の入力種別には **2つの独立した型体系** が存在する：

**Session Bridge型**（SDK層）:

```typescript
// packages/shared/src/types/skillCreatorSession.ts
export type UserInputType =
  | "single_select"
  | "multi_select" // ← Session Bridge 側の定義
  | "free_text"
  | "secret"
  | "confirm";

export interface UserInputQuestion {
  toolCallId: string;
  type: UserInputType; // ← SDKから来る種別
  question: string;
  options?: UserInputOption[];
  placeholder?: string;
}

export interface UserInputAnswer {
  toolCallId: string;
  value: string | string[] | boolean; // ← multi_select は string[]
}
```

**Workflow型**（UI・WorkflowEngine層）:

```typescript
// packages/shared/src/types/skillCreator.ts
export type SkillCreatorUserInputKind =
  | "single_select"
  | "multi_select" // ← Workflow 側の定義
  | "free_text"
  | "secret"
  | "confirm";

export interface SkillCreatorUserInputRequest {
  requestId: string;
  kind: SkillCreatorUserInputKind; // ← UIが使う種別
  options?: SkillCreatorUserInputOption[];
  // ...
}

export interface InterviewUserAnswer {
  kind: SkillCreatorUserInputKind;
  selectedOptionIds?: string[]; // ← 選択肢IDの配列経路
  selectedValues?: string[]; // ← 自由入力の配列経路（独立した経路）
  textValue?: string;
  // ...
}
```

#### マッピング関数（Session Bridge）

```typescript
// apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx

// Session Bridge型 → Workflow型
function mapQuestionToRequest(
  q: UserInputQuestion,
): SkillCreatorUserInputRequest {
  return {
    kind: q.type as SkillCreatorUserInputKind, // ← 型キャストで変換
    options: q.options?.map((o) => ({
      id: o.value,
      label: o.label,
      description: o.description,
    })),
    // ...
  };
}

// Workflow型（InterviewUserAnswer）→ Session Bridge型（UserInputAnswer）
function mapAnswerToUserInputAnswer(
  answer: InterviewUserAnswer,
  toolCallId: string,
): UserInputAnswer {
  let value: string | string[] | boolean;

  if (answer.confirmed !== undefined) {
    value = answer.confirmed;
  } else if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
    value = answer.selectedOptionIds; // ← selectedOptionIds 経路
  } else if (answer.selectedValues && answer.selectedValues.length > 0) {
    value = answer.selectedValues; // ← selectedValues 経路（独立）
  } else if (answer.selectedOptionId) {
    value = answer.selectedOptionId;
  } else if (answer.secretValue) {
    value = answer.secretValue;
  } else {
    value = answer.textValue ?? "";
  }
  return { toolCallId, value };
}
```

#### selectedValues の独立経路とは

`multi_select` の「その他（自由入力）」選択時、値は `selectedOptionIds` ではなく `selectedValues` に格納される。この2経路の分離がキモ：

- **`selectedOptionIds`**: 通常の選択肢（IDベース）を選んだ場合
- **`selectedValues`**: 「その他（自由入力）」で文字列入力した場合

`mapAnswerToUserInputAnswer()` はこの優先順位（`selectedOptionIds` → `selectedValues`）に従って `UserInputAnswer.value` に正規化する。これにより Session Bridge（SDK）側は `string[]` として受け取るだけでよい。

### 3-4. 推奨アプローチ

1. **まず型定義の現状確認から始める**: `skillCreator.ts` と `skillCreatorSession.ts` を読んで、`multi_select` がすでに定義されているか確認する（確認済みの情報では既に定義あり）
2. **`QuestionCard.tsx` の既存実装を確認する**: `case "multi_select":` がすでにスケルトン実装されているか確認する（確認済みでは部分実装あり）
3. **実装ギャップを特定してから着手**: 全体像を把握した後、不足部分のみを実装する

---

## 4. 実行手順

### Phase 1: 型定義の現状確認と補完（所要: 30分）

**目的**: `multi_select` に関連する型定義の現状を把握し、不足があれば補完する。

1. 以下のファイルを読み、`multi_select` の定義状況を確認する:

   ```bash
   # Session Bridge型の確認
   # packages/shared/src/types/skillCreatorSession.ts
   # → UserInputType に "multi_select" があるか
   # → UserInputAnswer.value が string[] を許容しているか

   # Workflow型の確認
   # packages/shared/src/types/skillCreator.ts
   # → SkillCreatorUserInputKind に "multi_select" があるか
   # → InterviewUserAnswer に selectedOptionIds / selectedValues があるか
   # → SkillCreatorUserInputSubmission に selectedOptionIds / selectedValues があるか
   ```

2. 確認結果に基づき、不足している型定義を追加する:

   **`UserInputType`（Session Bridge型）に `multi_select` がない場合**:

   ```typescript
   // packages/shared/src/types/skillCreatorSession.ts
   export type UserInputType =
     | "single_select"
     | "multi_select" // ← 追加
     | "free_text"
     | "secret"
     | "confirm";
   ```

   **`UserInputAnswer.value` が `string[]` を許容していない場合**:

   ```typescript
   export interface UserInputAnswer {
     toolCallId: string;
     value: string | string[] | boolean; // string[] が必要
   }
   ```

   **`SkillCreatorUserInputKind` に `multi_select` がない場合**:

   ```typescript
   // packages/shared/src/types/skillCreator.ts
   export type SkillCreatorUserInputKind =
     | "single_select"
     | "multi_select" // ← 追加
     | "free_text"
     | "secret"
     | "confirm";
   ```

   **`InterviewUserAnswer` に `selectedOptionIds` / `selectedValues` がない場合**:

   ```typescript
   export interface InterviewUserAnswer {
     kind: SkillCreatorUserInputKind;
     selectedOptionId?: string;
     selectedOptionIds?: string[]; // ← 追加（multi_select 選択肢ID群）
     selectedValues?: string[]; // ← 追加（自由入力テキスト群）
     textValue?: string;
     secretValue?: string;
     confirmed?: boolean;
   }
   ```

   **`SkillCreatorUserInputSubmission` に `selectedOptionIds` / `selectedValues` がない場合**:

   ```typescript
   export interface SkillCreatorUserInputSubmission {
     planId: string;
     requestId: string;
     selectedOptionId?: string;
     selectedOptionIds?: string[]; // ← 確認・追加
     selectedValues?: string[]; // ← 確認・追加
     textValue?: string;
     secretValue?: string;
     confirmed?: boolean;
   }
   ```

3. 型チェックを実行して型定義の整合を確認する:
   ```bash
   pnpm --filter @repo/shared typecheck
   # または
   pnpm typecheck
   ```

**Phase 1 完了条件**: `multi_select` に必要な全型定義が揃い、`pnpm typecheck` がパスする。

---

### Phase 2: UIコンポーネントの確認と実装（所要: 60分）

**目的**: `QuestionCard.tsx` の `case "multi_select":` を完全実装する。

1. 現在の `QuestionCard.tsx` の `case "multi_select":` ブロックを確認する:
   - ファイルパス: `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`
   - チェックボックス相当のトグル動作（`handleMultiSelectClick`）が実装されているか
   - 「その他（自由入力）」ボタンで `FreeTextInput` が表示されるか
   - 「確定」ボタンが実装されているか

2. 不足している実装を追加する。完全な `case "multi_select":` の参考実装:

   ```tsx
   case "multi_select":
     return (
       <div className={cardClass}>
         {renderHeader()}
         <div className="flex flex-col gap-2">
           {optionsWithFreeText.map((option) => (
             <ChoiceButton
               key={option.id}
               label={option.label}
               isSelected={selectedOptionIds.includes(option.id)}
               isFreeText={option.id === FREE_TEXT_ID}
               onClick={() => handleMultiSelectClick(option.id)}
               disabled={isSubmitting}
             />
           ))}
         </div>
         <FreeTextInput
           onSubmit={(text) =>
             onAnswer({ kind: "multi_select", selectedValues: [text] })
           }
           isVisible={isFreeTextVisible}
           placeholder={request.placeholder}
           disabled={isSubmitting}
         />
         <button
           type="button"
           className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
           onClick={() =>
             onAnswer({
               kind: "multi_select",
               selectedOptionIds: selectedOptionIds,
               selectedValues: selectedOptionIds,
             })
           }
           disabled={isSubmitting || selectedOptionIds.length === 0}
         >
           送信
         </button>
       </div>
     );
   ```

   重要な実装ポイント:
   - `handleMultiSelectClick` でトグル動作（選択済みなら解除、未選択なら追加）を実装する
   - 「その他（自由入力）」ボタン（`FREE_TEXT_ID`）は `selectedOptionIds` をリセットし `isFreeTextVisible = true` にする
   - 「確定」ボタンは `selectedOptionIds.length === 0` かつ `isFreeTextVisible === false` のとき `disabled`
   - `FreeTextInput` の `onSubmit` は `selectedValues: [text]` 経路で送信する（`selectedOptionIds` とは独立）

3. 必要であれば `ChoiceButton.tsx` に `aria-checked` を追加して a11y を強化する:

   ```tsx
   // ChoiceButton.tsx
   // multi_select では aria-pressed ではなく aria-checked が適切
   // ただしボタン要素に aria-checked は使えないため、ラッパーに role="checkbox" を付与するか
   // または aria-pressed を維持してドキュメントコメントで意図を明示する
   ```

**Phase 2 完了条件**: `QuestionCard.tsx` が `multi_select` ケースを完全に処理でき、手動確認で動作する。

---

### Phase 3: 状態管理の確認と補完（所要: 30分）

**目的**: `selectedOptionIds` と `selectedValues` の2経路が正しく管理されることを確認する。

1. `QuestionCard.tsx` の state 定義を確認する:

   ```typescript
   const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
   const [isFreeTextVisible, setIsFreeTextVisible] = useState(false);
   ```

   - `selectedOptionIds` は選択肢IDのトグル管理に使用する
   - `isFreeTextVisible` は「その他（自由入力）」選択時のFreeTextInput表示制御に使用する

2. `handleMultiSelectClick` の実装を確認・修正する:

   ```typescript
   const handleMultiSelectClick = (optionId: string) => {
     if (optionId === FREE_TEXT_ID) {
       setSelectedOptionIds([]); // ← 通常選択肢をリセット
       setIsFreeTextVisible(true); // ← 自由入力欄を表示
       return;
     }
     setIsFreeTextVisible(false); // ← 通常選択肢を選んだら自由入力欄を非表示
     setSelectedOptionIds(
       (prev) =>
         prev.includes(optionId)
           ? prev.filter((id) => id !== optionId) // ← トグル解除
           : [...prev, optionId], // ← トグル追加
     );
   };
   ```

3. 「その他（自由入力）」と通常選択肢の状態が排他的に管理されることを確認する:
   - 通常選択肢を選んだとき → `isFreeTextVisible = false`
   - 「その他」を選んだとき → `selectedOptionIds = []`, `isFreeTextVisible = true`

**Phase 3 完了条件**: 状態遷移が排他的に管理され、`selectedOptionIds` と `selectedValues` の2経路が混在しない。

---

### Phase 4: Session Bridge対応（所要: 30分）

**目的**: `mapAnswerToUserInputAnswer()` が `multi_select` の両経路を正しく `UserInputAnswer` に変換することを確認する。

1. `SkillCreatorConversationPanel.tsx` の `mapAnswerToUserInputAnswer()` を確認する:

   ```typescript
   function mapAnswerToUserInputAnswer(
     answer: InterviewUserAnswer,
     toolCallId: string,
   ): UserInputAnswer {
     let value: string | string[] | boolean;

     if (answer.confirmed !== undefined) {
       value = answer.confirmed;
     } else if (
       answer.selectedOptionIds &&
       answer.selectedOptionIds.length > 0
     ) {
       value = answer.selectedOptionIds; // ← selectedOptionIds 経路
     } else if (answer.selectedValues && answer.selectedValues.length > 0) {
       value = answer.selectedValues; // ← selectedValues 経路（独立）
     } else if (answer.selectedOptionId) {
       value = answer.selectedOptionId;
     } else if (answer.secretValue) {
       value = answer.secretValue;
     } else {
       value = answer.textValue ?? "";
     }
     return { toolCallId, value };
   }
   ```

   確認ポイント:
   - `selectedOptionIds` が先に評価され、次に `selectedValues` が評価される（優先順位が正しい）
   - `UserInputAnswer.value` の型が `string | string[] | boolean` になっており `string[]` を受け入れる

2. 変更が必要な場合は修正する。特に `UserInputAnswer.value` の型が `string | boolean` のみの場合は `string[]` を追加する。

3. `mapQuestionToRequest()` が `type: "multi_select"` を `kind: "multi_select"` に正しくキャストすることを確認する:
   ```typescript
   function mapQuestionToRequest(
     q: UserInputQuestion,
   ): SkillCreatorUserInputRequest {
     return {
       kind: q.type as SkillCreatorUserInputKind, // "multi_select" がキャスト可能
       // ...
     };
   }
   ```

**Phase 4 完了条件**: `mapAnswerToUserInputAnswer()` が `multi_select` の `selectedOptionIds` / `selectedValues` 両経路を `string[]` として正しく `UserInputAnswer.value` にマッピングする。

---

### Phase 5: テスト（所要: 60分）

**目的**: 実装が正しく動作することをユニットテストで検証する。

1. 既存テストを実行して既存動作が壊れていないことを確認する:

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern="ChoiceButton"
   pnpm --filter @repo/desktop test -- --testPathPattern="QuestionCard"
   pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorConversationPanel"
   ```

2. `QuestionCard.tsx` の `multi_select` ケースに対して以下のテストを追加・確認する:
   - テストファイル: `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`（存在する場合）または新規作成

   ```typescript
   describe("QuestionCard - multi_select", () => {
     const multiSelectRequest: SkillCreatorUserInputRequest = {
       requestId: "req-1",
       reason: "plan_review",
       title: "使いたい機能を選んでください",
       prompt: "",
       kind: "multi_select",
       options: [
         { id: "opt-a", label: "機能A" },
         { id: "opt-b", label: "機能B" },
         { id: "opt-c", label: "機能C" },
       ],
       requestedAt: new Date().toISOString(),
     };

     it("選択肢が複数表示される", () => {
       // 3つの選択肢ボタンが表示されること
     });

     it("選択肢をクリックするとトグルされる", () => {
       // 1回クリックで選択済み、2回クリックで未選択
     });

     it("複数の選択肢を同時に選択できる", () => {
       // 機能A と 機能B を両方選択した状態になること
     });

     it("確定ボタンが選択なしのとき disabled になる", () => {
       // 選択肢が0件のとき確定ボタンが disabled であること
     });

     it("確定ボタンをクリックすると selectedOptionIds が送信される", () => {
       // onAnswer に { kind: "multi_select", selectedOptionIds: [...] } が渡ること
     });

     it("「その他」を選択すると FreeTextInput が表示される", () => {
       // isFreeTextVisible が true になり FreeTextInput が表示されること
     });

     it("FreeTextInput で送信すると selectedValues 経路で回答が送信される", () => {
       // onAnswer に { kind: "multi_select", selectedValues: ["入力テキスト"] } が渡ること
     });

     it("「その他」選択後に通常選択肢を選ぶと FreeTextInput が非表示になる", () => {
       // isFreeTextVisible が false に戻ること
     });
   });
   ```

3. `mapAnswerToUserInputAnswer()` のテストを確認・追加する:

   ```typescript
   describe("mapAnswerToUserInputAnswer - multi_select", () => {
     it("selectedOptionIds が value として渡される", () => {
       const answer: InterviewUserAnswer = {
         kind: "multi_select",
         selectedOptionIds: ["opt-a", "opt-b"],
       };
       const result = mapAnswerToUserInputAnswer(answer, "tool-1");
       expect(result.value).toEqual(["opt-a", "opt-b"]);
     });

     it("selectedValues が value として渡される（selectedOptionIds がない場合）", () => {
       const answer: InterviewUserAnswer = {
         kind: "multi_select",
         selectedValues: ["自由入力テキスト"],
       };
       const result = mapAnswerToUserInputAnswer(answer, "tool-1");
       expect(result.value).toEqual(["自由入力テキスト"]);
     });
   });
   ```

4. 型チェックとLintを実行する:
   ```bash
   pnpm typecheck
   pnpm lint
   ```

**Phase 5 完了条件**: 全テストがパスし、型エラー・Lintエラーが0件。

---

### Phase 6: 完了（所要: 15分）

**目的**: 実装内容を確認し、後続タスクへの影響を確認する。

1. 変更したファイルの一覧を確認し、スコープ外のファイルを誤って変更していないことを確認する:
   - `packages/shared/src/types/skillCreatorSession.ts`（型定義補完のみ）
   - `packages/shared/src/types/skillCreator.ts`（型定義補完のみ）
   - `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`（`multi_select` 実装）
   - `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`（マッピング関数確認・補完）
   - テストファイル（追加のみ）

2. P0-06（会話型インタビューUI統合）の担当者に「TASK-RT-05の `multi_select` 実装が完了した」ことを周知する（Issueコメントで通知）。

3. 完了条件チェックリストを確認する（セクション5参照）。

**Phase 6 完了条件**: 完了条件チェックリストが全件チェックされ、PRがマージ可能な状態。

---

## 5. 完了条件チェックリスト

### 必須条件

- [ ] `UserInputType`（`skillCreatorSession.ts`）に `"multi_select"` が含まれている
- [ ] `UserInputAnswer.value` が `string | string[] | boolean` を受け入れる型定義になっている
- [ ] `SkillCreatorUserInputKind`（`skillCreator.ts`）に `"multi_select"` が含まれている
- [ ] `InterviewUserAnswer` に `selectedOptionIds?: string[]` と `selectedValues?: string[]` フィールドがある
- [ ] `SkillCreatorUserInputSubmission` に `selectedOptionIds?: string[]` と `selectedValues?: string[]` フィールドがある
- [ ] `QuestionCard.tsx` の `case "multi_select":` が完全実装されている
- [ ] 複数の選択肢をトグルで選択・解除できる（チェックボックス相当）
- [ ] 「その他（自由入力）」ボタン選択時に `FreeTextInput` が表示される
- [ ] `FreeTextInput` からの送信が `selectedValues` 経路で `onAnswer` に渡る
- [ ] 「確定」ボタンが実装されており、選択肢が0件のとき `disabled` になる
- [ ] `mapAnswerToUserInputAnswer()` が `selectedOptionIds` 経路を `string[]` にマッピングする
- [ ] `mapAnswerToUserInputAnswer()` が `selectedValues` 経路を `string[]` にマッピングする
- [ ] `pnpm typecheck` が PASS すること（0 errors）
- [ ] `pnpm lint` が PASS すること（0 errors）
- [ ] 既存テストが全件 PASS すること

### 推奨条件

- [ ] `QuestionCard.test.tsx` に `multi_select` の全ケースのテストが追加されている
- [ ] `mapAnswerToUserInputAnswer()` の `selectedOptionIds` / `selectedValues` 両経路のテストが追加されている
- [ ] P0-06担当者への完了周知が完了している

---

## 6. 検証方法

### 手動動作確認手順

1. **デスクトップアプリを起動し、Skill Creator を操作する**:

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. **`multi_select` 質問の動作確認**:
   - Skill Creator のインタビュー画面で `multi_select` 種別の質問が表示されることを確認する
   - 複数の選択肢をクリックしてトグル（選択・解除）できることを確認する
   - 「その他（自由入力）」を選択したとき `FreeTextInput` が表示されることを確認する
   - 「確定」ボタンをクリックしたとき選択済みの選択肢IDが `onAnswer` に渡ることを確認する
   - 「確定」ボタンが選択肢0件のとき `disabled` であることを確認する

3. **エラーケースの確認**:
   - `selectedOptionIds` が空配列のとき「確定」ボタンが押せないこと
   - `FreeTextInput` に何も入力せずに Enter を押しても送信されないこと

### ユニットテスト確認

```bash
# QuestionCard のテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="QuestionCard"

# ChoiceButton のテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="ChoiceButton"

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

---

## 7. リスクと対策

| リスク                                                                               | 発生確率 | 影響度 | 対策                                                                                                                        |
| ------------------------------------------------------------------------------------ | -------- | ------ | --------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------ |
| `selectedOptionIds` と `selectedValues` の2経路が混在し型安全性が失われる            | 高       | 高     | 「その他」選択時は `setSelectedOptionIds([])` で選択肢をリセットし、`selectedValues` のみを送信する。状態を排他的に管理する |
| `mapAnswerToUserInputAnswer()` の優先順位が誤っており、`selectedValues` が使われない | 中       | 高     | `selectedOptionIds` を先に評価し、次に `selectedValues` を評価する順序を維持する。テストで両経路を個別に検証する            |
| 「確定」ボタンが `selectedOptionIds` と `isFreeTextVisible` の状態を正しく判断しない | 中       | 中     | `disabled={isSubmitting                                                                                                     |     | selectedOptionIds.length === 0}`の条件を`FreeTextInput` 表示中は除外するよう考慮する |
| `ChoiceButton` の `aria-pressed` が `multi_select` のチェックボックスUIとして不適切  | 低       | 低     | `multi_select` のケースでは `aria-pressed` を維持しつつ、コメントで意図を明示する。a11y完全対応は TASK-A11Y の責務          |
| 型定義が既に部分的に実装されており、二重定義が発生する                               | 中       | 中     | Phase 1 で型定義を読んでから補完する。既存定義がある場合は上書きせずに確認のみとする                                        |

---

## 8. 参照情報（苦戦箇所の記録）

### 苦戦箇所1: 二重型体系（Session Bridge型とWorkflow型）

**TASK-SDK-SC-02（Conversation UI）実装時の実体験に基づく記録。**

| 項目   | 内容                                                                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | SDKが返す質問の型（`UserInputType` / `UserInputQuestion`）とWorkflowEngineが扱う型（`SkillCreatorUserInputKind` / `SkillCreatorUserInputRequest`）が**2つの独立した型体系**として並立している。どちらを変更すべきか最初は不明確だった |
| 解決策 | `SkillCreatorConversationPanel.tsx` 内の `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` が変換境界として機能している。この境界を意識して、Session Bridge型とWorkflow型を**それぞれ独立して正しく定義**する                 |
| 教訓   | `UserInputType`（Session Bridge）と `SkillCreatorUserInputKind`（Workflow）は別々の型として並立しており、両方に `multi_select` を追加する必要がある。一方だけ変更すると型キャスト時にエラーが発生する                                 |

**型体系の対応関係**:

```
Session Bridge層                     Workflow層
-----------------                    ----------
UserInputType                    →   SkillCreatorUserInputKind
  "multi_select"                       "multi_select"
UserInputQuestion.type           →   SkillCreatorUserInputRequest.kind
UserInputAnswer.value: string[]  ←   InterviewUserAnswer.selectedOptionIds / selectedValues
```

### 苦戦箇所2: selectedValues の独立経路

**最も混乱しやすい設計上のポイント。**

| 項目   | 内容                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | `multi_select` の「その他（自由入力）」でユーザーが入力したテキストをどのフィールドで送信するかが曖昧だった。`selectedOptionIds` に混ぜると選択肢IDと自由入力テキストが区別できなくなる           |
| 解決策 | `selectedValues` を **`selectedOptionIds` とは完全に独立した経路**として扱い、`mapAnswerToUserInputAnswer()` で優先順位をつけて正規化する。Session Bridge側は `string[]` として受け取るだけでよい |
| 教訓   | 「その他」選択時は `selectedOptionIds = []`（リセット）し、`selectedValues = [textInput]` のみを送信する。この排他的管理が状態の混乱を防ぐ鍵                                                      |

**具体的な状態遷移**:

```
通常選択肢「機能A」をクリック:
  → selectedOptionIds: ["opt-a"]
  → isFreeTextVisible: false
  → 確定ボタンクリック時: onAnswer({ selectedOptionIds: ["opt-a"] })

「その他（自由入力）」をクリック:
  → selectedOptionIds: []  ← リセット
  → isFreeTextVisible: true
  → FreeTextInput で "カスタム機能" と入力して送信:
    → onAnswer({ selectedValues: ["カスタム機能"] })
```

### 苦戦箇所3: 「確定」ボタンの disabled 条件

| 項目   | 内容                                                                                                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | `single_select` は選択肢をクリックした瞬間に `onAnswer` が呼ばれるが、`multi_select` は「確定」ボタンが必要。このボタンの `disabled` 条件が複雑になりやすい             |
| 解決策 | `disabled={isSubmitting                                                                                                                                                 |     | selectedOptionIds.length === 0}` とし、`FreeTextInput` が表示中（`isFreeTextVisible === true`）の場合はFreeTextInput自身の送信に任せる |
| 教訓   | `isFreeTextVisible === true` かつ `selectedOptionIds.length === 0` の場合、確定ボタンは `disabled` にしたままにし、FreeTextInput の送信フローに任せる設計が最もシンプル |

### 関連タスクとの連携

- **TASK-SDK-SC-02**（完了済み）: `QuestionCard.tsx` の基本実装はこのタスクで行われた。`multi_select` のスケルトン実装が存在する可能性がある
- **P0-06**（未着手）: 会話型インタビューUI全体の統合。本タスクの成果物を使用する
- **TASK-RT-06**（並列進行）: SDK Message 正規化。本タスクとは別ファイルを扱うため競合しない

---

## 9. 備考

### 作業ディレクトリ

```
/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260404-095836-wt-6
```

### 主要関連ファイル

| ファイルパス                                                                           | 役割                                                                 |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreatorSession.ts`                                     | Session Bridge型（`UserInputType` / `UserInputAnswer`）              |
| `packages/shared/src/types/skillCreator.ts`                                            | Workflow型（`SkillCreatorUserInputKind` / `InterviewUserAnswer`）    |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | `multi_select` UIの主実装場所                                        |
| `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | 選択肢ボタンコンポーネント（拡張または流用）                         |
| `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | 「その他（自由入力）」時のテキスト入力コンポーネント                 |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` の実装場所 |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`   | ChoiceButton の既存テスト                                            |

### コマンドリファレンス

```bash
# 型チェック
pnpm typecheck
# または特定パッケージのみ
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# Lint
pnpm lint
# または
pnpm --filter @repo/desktop lint

# テスト（特定ファイル）
pnpm --filter @repo/desktop test -- --testPathPattern="QuestionCard"
pnpm --filter @repo/desktop test -- --testPathPattern="ChoiceButton"
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorConversationPanel"

# multi_select の型定義箇所を確認
# packages/shared/src/types/skillCreatorSession.ts の UserInputType
# packages/shared/src/types/skillCreator.ts の SkillCreatorUserInputKind
```

### Step 09 並列実行について

本タスクはStep 09として他のP0是正タスクと**並列実行可能**。ただし以下の点に注意：

- **TASK-RT-06**（Step 08）は `sdkMessageNormalizer.ts` を変更するが、本タスクは変更しない。ファイル競合なし
- **P0-06**（会話型インタビューUI統合）が本タスクの成果物を使用する。本タスクの完了をP0-06担当者に周知すること
- 型定義ファイル（`skillCreator.ts`、`skillCreatorSession.ts`）を変更する場合、他の並列タスクとの競合がないかを事前に確認すること
