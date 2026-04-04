# Phase 12: ドキュメント — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase番号 | 12                     |
| 機能名    | conversation-ui        |
| タスクID  | TASK-SDK-SC-02         |
| 作成日    | 2026-04-02             |
| 依存Phase | Phase 11（手動テスト） |

## 目的

実装した全5コンポーネントのコンポーネント仕様書と使用例（Storybook 相当）を記録する。  
将来の開発者が各コンポーネントを安全に使用・拡張できるよう、API と動作を明文化する。

## 実行タスク

### Task 12-1: ChoiceButton コンポーネント仕様書

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`

#### 概要

選択肢の単一ボタン。選択/未選択状態・「その他（自由入力）」区別・無効化をサポートする Atom コンポーネント。

#### Props API

| Prop名       | 型           | 必須 | デフォルト | 説明                                                      |
| ------------ | ------------ | ---- | ---------- | --------------------------------------------------------- |
| `label`      | `string`     | 必須 | -          | ボタンに表示するラベルテキスト                            |
| `isSelected` | `boolean`    | 必須 | -          | 選択済み状態のとき `true`                                 |
| `isFreeText` | `boolean`    | 任意 | `false`    | 「その他（自由入力）」ボタンのとき `true`（破線ボーダー） |
| `onClick`    | `() => void` | 必須 | -          | クリック時のコールバック                                  |
| `disabled`   | `boolean`    | 任意 | `false`    | `true` のとき無効化（クリック不可・opacity低下）          |

#### 使用例

```tsx
// 基本的な選択肢ボタン
<ChoiceButton
  label="TypeScript"
  isSelected={false}
  onClick={() => handleSelect("TypeScript")}
/>

// 選択済み状態
<ChoiceButton
  label="TypeScript"
  isSelected={true}
  onClick={() => handleSelect("TypeScript")}
/>

// 「その他（自由入力）」ボタン（破線ボーダー）
<ChoiceButton
  label="その他（自由入力）"
  isSelected={false}
  isFreeText={true}
  onClick={() => setFreeTextVisible(true)}
/>

// 無効化（送信処理中）
<ChoiceButton
  label="TypeScript"
  isSelected={false}
  onClick={() => {}}
  disabled={true}
/>
```

---

### Task 12-2: FreeTextInput コンポーネント仕様書

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`

#### 概要

テキスト自由入力フィールド。`isVisible` による表示制御、`isSecret` によるパスワードマスク、Enter キー送信をサポートする Atom コンポーネント。

#### Props API

| Prop名        | 型                       | 必須 | デフォルト                    | 説明                                           |
| ------------- | ------------------------ | ---- | ----------------------------- | ---------------------------------------------- |
| `onSubmit`    | `(text: string) => void` | 必須 | -                             | Enter キー押下時のコールバック（空文字は無視） |
| `isVisible`   | `boolean`                | 必須 | -                             | `false` のときアンマウント（非表示）           |
| `placeholder` | `string`                 | 任意 | `"自由に入力してください..."` | プレースホルダーテキスト                       |
| `isSecret`    | `boolean`                | 任意 | `false`                       | `true` のとき `type="password"` で表示         |
| `disabled`    | `boolean`                | 任意 | `false`                       | `true` のとき入力無効化                        |

#### キーボード操作

| キー操作      | 動作                                         |
| ------------- | -------------------------------------------- |
| Enter         | トリミング後の文字列で `onSubmit` を呼び出す |
| Shift + Enter | 改行を挿入する（free_text タイプのみ有効）   |
| その他        | 通常のテキスト入力                           |

#### 使用例

```tsx
// 通常の自由入力（「その他」選択時に展開）
<FreeTextInput
  onSubmit={(text) => handleAnswer(text)}
  isVisible={isFreeTextVisible}
  placeholder="詳細を入力してください..."
/>

// シークレット入力（secret タイプ）
<FreeTextInput
  onSubmit={(text) => handleAnswer(text)}
  isVisible={true}
  isSecret={true}
  placeholder="APIキーを入力してください..."
/>

// 送信処理中に無効化
<FreeTextInput
  onSubmit={(text) => handleAnswer(text)}
  isVisible={true}
  disabled={isSubmitting}
/>
```

---

### Task 12-3: ConversationProgress コンポーネント仕様書

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`

#### 概要

インタビューの進捗を「質問 N / 推定合計」形式とプログレスバーで表示する Atom コンポーネント。

#### Props API

| Prop名           | 型       | 必須 | デフォルト | 説明                      |
| ---------------- | -------- | ---- | ---------- | ------------------------- |
| `current`        | `number` | 必須 | -          | 現在の質問番号（1始まり） |
| `estimatedTotal` | `number` | 必須 | -          | 推定合計質問数（通常 10） |

#### アクセシビリティ

- `role="progressbar"` を付与
- `aria-valuenow={current}` / `aria-valuemin={0}` / `aria-valuemax={estimatedTotal}` を設定

#### 使用例

```tsx
// 10問中3問目
<ConversationProgress current={3} estimatedTotal={10} />
// 表示: 「質問 3 / 10」 + 30% 幅のプログレスバー

// 10問中10問目（完了直前）
<ConversationProgress current={10} estimatedTotal={10} />
// 表示: 「質問 10 / 10」 + 100% 幅のプログレスバー
```

---

### Task 12-4: QuestionCard コンポーネント仕様書

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`

#### 概要

`QuestionPayload.type` に応じた入力UIを提供する Molecule コンポーネント。`single_select` / `multi_select` では選択肢の末尾に「その他（自由入力）」を常に表示する。

#### Props API

| Prop名         | 型                                     | 必須 | デフォルト | 説明                               |
| -------------- | -------------------------------------- | ---- | ---------- | ---------------------------------- |
| `question`     | `QuestionPayload`                      | 必須 | -          | AIが送信した質問ペイロード         |
| `onAnswer`     | `(answer: string \| string[]) => void` | 必須 | -          | 回答時のコールバック               |
| `isSubmitting` | `boolean`                              | 任意 | `false`    | 送信処理中フラグ（UI全体を無効化） |

#### タイプ別の動作

| `question.type` | 内部 UI 構成                                                | `onAnswer` の引数 |
| --------------- | ----------------------------------------------------------- | ----------------- |
| `single_select` | ChoiceButton リスト + 末尾「その他」+ FreeTextInput         | `string`          |
| `multi_select`  | ChoiceButton リスト（複数選択）+ 末尾「その他」+ 送信ボタン | `string[]`        |
| `free_text`     | FreeTextInput のみ（isSecret=false）                        | `string`          |
| `secret`        | FreeTextInput のみ（isSecret=true）                         | `string`          |
| `confirm`       | 「はい」「いいえ」ChoiceButton                              | `"yes"` / `"no"`  |

#### 内部定数

```typescript
const FREE_TEXT_LABEL = "その他（自由入力）";
```

#### 使用例

```tsx
// single_select
<QuestionCard
  question={{
    type: "single_select",
    question: "使用言語を選択してください",
    context: "スキルのメイン実装言語を選んでください",
    choices: ["TypeScript", "JavaScript", "Python"],
  }}
  onAnswer={(answer) => sendAnswer(answer)}
/>

// confirm
<QuestionCard
  question={{
    type: "confirm",
    question: "外部APIを使用しますか？",
    choices: [],
  }}
  onAnswer={(answer) => sendAnswer(answer)}
/>
```

---

### Task 12-5: SkillCreatorConversationPanel コンポーネント仕様書

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`

#### 概要

IPC リスナー登録・状態管理・全コンポーネント統合を担う Organism コンポーネント。  
マウント時に `skill-creator:question-received` を購読し、アンマウント時に自動解除する。

#### Props API

| Prop名       | 型           | 必須 | デフォルト | 説明                             |
| ------------ | ------------ | ---- | ---------- | -------------------------------- |
| `onClose`    | `() => void` | 任意 | -          | パネルを閉じるときのコールバック |
| `onComplete` | `() => void` | 任意 | -          | インタビュー完了時のコールバック |

#### IPC チャネル

| チャネル定数                      | 方向            | 用途                     |
| --------------------------------- | --------------- | ------------------------ |
| `SKILL_CREATOR_QUESTION_RECEIVED` | Main → Renderer | 質問を受信して UI を更新 |
| `SKILL_CREATOR_ANSWER`            | Renderer → Main | 回答を送信する           |

#### 使用例

```tsx
// 基本的な使用
<SkillCreatorConversationPanel
  onClose={() => setShowPanel(false)}
  onComplete={() => navigateToSkillPreview()}
/>
```

#### 注意事項

- `window.api.on` の戻り値（unsubscribe 関数）を `useEffect` の cleanup で必ず呼び出すこと
- `isSubmitting` 中は重複送信が防止される
- 推定合計質問数 `ESTIMATED_TOTAL = 10` は定数として管理する

## 参照資料

| 資料名              | パス                                        |
| ------------------- | ------------------------------------------- |
| Phase 2 設計        | `phase-2-design.md`                         |
| Phase 11 手動テスト | `phase-11-manual-testing.md`                |
| QuestionPayload 型  | `packages/shared/src/types/skillCreator.ts` |

## 成果物

| 成果物                             | パス                        | 形式     |
| ---------------------------------- | --------------------------- | -------- |
| コンポーネント仕様書（本ファイル） | `phase-12-documentation.md` | Markdown |

## 完了条件

- [ ] `ChoiceButton` の Props API と使用例を記録した
- [ ] `FreeTextInput` の Props API・キーボード操作・使用例を記録した
- [ ] `ConversationProgress` の Props API・アクセシビリティ・使用例を記録した
- [ ] `QuestionCard` の Props API・タイプ別動作・使用例を記録した
- [ ] `SkillCreatorConversationPanel` の Props API・IPCチャネル・注意事項を記録した

## 次の Phase: Phase 13 (phase-13-completion.md)
