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

## 更新方針

- この Phase は docs-only とし、実装コードは変更しない。
- 仕様や型の current facts は Phase 5 / Phase 8 / Phase 10 の結果に合わせて記述する。
- 参照する IPC チャネルは `SKILL_CREATOR_SESSION_CHANNELS` を正本として扱う。

## 型マッピング

- Session Bridge 型: `UserInputQuestion` / `UserInputAnswer`
- Workflow / UI 型: `SkillCreatorUserInputRequest` / `InterviewUserAnswer`
- `SkillCreatorConversationPanel` は Session Bridge 型を受け、UI 型へ写像するブリッジ層として扱う

## 実行手順

1. Phase 10 までの current facts を参照し、型名と IPC チャネル名を固定する。
2. 各コンポーネントの Props API と使用例を current model に合わせて記述する。
3. 最後に compliance check を実施し、正本との差分がないことを確認する。

## 統合テスト連携

- Phase 11 の手動テストで観測した見た目・操作性を、仕様書の使用例に反映する。
- Phase 13 の完了確認で参照するため、仕様書は current facts のまま保つ。
- Phase 5 / Phase 8 / Phase 9 の変更と矛盾しないことを確認する。

## 多角的チェック観点（AIが判断）

- 論理分析系: Props API と使用例の整合
- 構造分解系: Atom / Molecule / Organism の責務分離
- システム系: shared types と IPC チャネル定義との一致
- 問題解決系: 利用者が迷わない最小説明量

## サブタスク管理

- `ChoiceButton` / `FreeTextInput` / `ConversationProgress` は独立に記述できる。
- `QuestionCard` と `SkillCreatorConversationPanel` は current facts の整合が必要なので後半でまとめる。
- compliance check は全項目を書き終えた最後に 1 回だけ行う。

## タスク100%実行確認【必須】

- [ ] 5 コンポーネントの仕様書を current model で記述した
- [ ] `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `UserInputQuestion` / `UserInputAnswer` を参照した
- [ ] `SKILL_CREATOR_SESSION_CHANNELS` の current channel を明記した
- [ ] compliance check を追加した

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

`SkillCreatorUserInputRequest.kind` に応じた入力UIを提供する Molecule コンポーネント。`single_select` / `multi_select` では選択肢の末尾に「その他（自由入力）」を常に表示する。  
`multi_select` の「その他（自由入力）」は `selectedValues` を使う自由入力経路として扱い、Renderer 側のブリッジが `UserInputAnswer` に正規化する。

#### Props API

| Prop名         | 型                                      | 必須 | デフォルト | 説明                               |
| -------------- | --------------------------------------- | ---- | ---------- | ---------------------------------- |
| `request`      | `SkillCreatorUserInputRequest`          | 必須 | -          | AIが送信した質問リクエスト         |
| `onAnswer`     | `(answer: InterviewUserAnswer) => void` | 必須 | -          | 回答時のコールバック               |
| `isSubmitting` | `boolean`                               | 任意 | `false`    | 送信処理中フラグ（UI全体を無効化） |

#### タイプ別の動作

| `request.kind`  | 内部 UI 構成                                                | `onAnswer` の引数                      |
| --------------- | ----------------------------------------------------------- | -------------------------------------- |
| `single_select` | ChoiceButton リスト + 末尾「その他」+ FreeTextInput         | `selectedOptionId`                     |
| `multi_select`  | ChoiceButton リスト（複数選択）+ 末尾「その他」+ 送信ボタン | `selectedOptionIds` / `selectedValues` |
| `free_text`     | FreeTextInput のみ（isSecret=false）                        | `textValue`                            |
| `secret`        | FreeTextInput のみ（isSecret=true）                         | `secretValue`                          |
| `confirm`       | 「はい」「いいえ」ChoiceButton                              | `confirmed`                            |

#### 内部定数

```typescript
const FREE_TEXT_LABEL = "その他（自由入力）";
```

#### 使用例

```tsx
// single_select
<QuestionCard
  request={{
    requestId: "request-1",
    reason: "plan_review",
    title: "使用言語を選択してください",
    prompt: "スキルのメイン実装言語を選んでください",
    kind: "single_select",
    options: [
      { id: "typescript", label: "TypeScript" },
      { id: "javascript", label: "JavaScript" },
      { id: "python", label: "Python" },
    ],
    requestedAt: "2026-04-02T00:00:00Z",
  }}
  onAnswer={(answer) => sendAnswer(answer)}
/>

// confirm
<QuestionCard
  request={{
    requestId: "request-2",
    reason: "plan_review",
    title: "外部APIを使用しますか？",
    prompt: "",
    kind: "confirm",
    options: [],
    requestedAt: "2026-04-02T00:00:00Z",
  }}
  onAnswer={(answer) => sendAnswer(answer)}
/>
```

---

### Task 12-5: SkillCreatorConversationPanel コンポーネント仕様書

**ファイル**: `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`

#### 概要

IPC リスナー登録・状態管理・全コンポーネント統合を担う Organism コンポーネント。  
マウント時に `window.skillCreatorSessionAPI.onQuestion()` / `onComplete()` / `onError()` を購読し、アンマウント時に自動解除する。

#### Props API

| Prop名       | 型                          | 必須 | デフォルト | 説明                             |
| ------------ | --------------------------- | ---- | ---------- | -------------------------------- |
| `onComplete` | `() => void`                | 任意 | -          | インタビュー完了時のコールバック |
| `onError`    | `(message: string) => void` | 任意 | -          | エラー発生時のコールバック       |

#### IPC チャネル

| チャネル定数                                       | 方向            | 用途                       |
| -------------------------------------------------- | --------------- | -------------------------- |
| `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED` | Main → Renderer | 質問を受信して UI を更新   |
| `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`            | Renderer → Main | 回答を送信する             |
| `SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE`  | Main → Renderer | セッション完了を通知する   |
| `SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR`     | Main → Renderer | セッションエラーを通知する |

#### 使用例

```tsx
// 基本的な使用
<SkillCreatorConversationPanel
  onComplete={() => navigateToSkillPreview()}
  onError={(message) => setErrorMessage(message)}
/>
```

#### 注意事項

- `window.skillCreatorSessionAPI.onQuestion` / `onComplete` / `onError` の戻り値（unsubscribe 関数）を `useEffect` の cleanup で必ず呼び出すこと
- `isSubmitting` 中は重複送信が防止される
- `QuestionCard` は `key={questionIndex}` で再マウントし、前の質問の内部状態を持ち越さない
- 推定合計質問数 `ESTIMATED_TOTAL = 10` は定数として管理する

---

### Task 12-6: 仕様準拠チェック

**ファイル**: `docs/30-workflows/step-02-par-task-02-conversation-ui/phase-12-documentation.md`

#### 概要

`packages/shared/src/types/skillCreator.ts` と `packages/shared/src/ipc/channels.ts` を正本として、仕様書全体が current facts と一致していることを確認する。

#### チェック項目

| 確認対象 | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| 型定義   | `SkillCreatorUserInputRequest` / `InterviewUserAnswer` / `UserInputQuestion` / `UserInputAnswer` と整合している |
| IPC      | `SKILL_CREATOR_SESSION_CHANNELS` の current channel 名と一致している                                            |
| 用語     | `SkillCreatorUserInputRequest.kind` / `UserInputAnswer` / `allowSkip` と一致している                            |
| 参照     | Phase 1 / Phase 2 / Phase 5 / Phase 8 / Phase 9 / Phase 10 / Phase 11 と矛盾していない                          |

## 参照資料

| 資料名                                                                                      | パス                                                                        |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Phase 2 設計                                                                                | `phase-2-design.md`                                                         |
| Phase 11 手動テスト                                                                         | `phase-11-manual-testing.md`                                                |
| Phase 11 手動テストレポート                                                                 | `outputs/phase-11/manual-test-report.md`                                    |
| Phase 11 スクリーンショット証跡                                                             | `outputs/phase-11/task-sdk-sc-02/screenshots/`                              |
| Phase 12 実装ガイド                                                                         | `outputs/phase-12/implementation-guide.md`                                  |
| UserInputQuestion / UserInputAnswer / SkillCreatorUserInputRequest / InterviewUserAnswer 型 | `packages/shared/src/types/index.ts`                                        |
| UI/UX 親仕様                                                                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     |
| IPC 正本                                                                                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`       |
| 品質・テスト正本                                                                            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

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
- [ ] 仕様準拠チェックを追加した

## 次の Phase: Phase 13 (phase-13-completion.md)
