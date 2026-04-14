# Phase 12: 実装ガイド

## タスク情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-SW-FIX-STATE-DETAIL-001 |
| Phase    | 12                           |
| 作成日   | 2026-04-14                   |

---

## Part 1: 中学生向け説明

### なぜ必要か

スキル作成ウィザードは、1回の作業の途中で前のメモが残ったままだと、次の作業に前回の答えが混ざってしまいます。
たとえば、宿題の答案を消さずに次の問題を書き始めると、どこからが新しい答えか分からなくなります。
今回の修正は、その「前回の答えが残る」「途中でやめる道がない」「古い連携情報が残る」「キャンセル後に戻れない」という4つの混乱をなくすためのものです。

### 何をするか

- Step 1 の答えを、リトライ時にきれいに戻す
- エラーになったときに、template モードなら「最初からやり直す」ボタンを出す
- Q5 の答えが変わったら、外部ツールの情報を最新にし直す
- キャンセルしたあとも、次の生成をまた始められるようにする

### 今回作ったもの

- `ConversationRoundStep.tsx` の answers 再同期
- `GenerateStep.tsx` の template error 回復導線
- `SkillCreateWizard.tsx` の `generationLockRef` 解放
- Phase 11 の 3 枚のスクリーンショット証跡

---

## Part 2: 技術者向け説明

### 変更対象ファイル

| ファイル                                                                      | 変更内容                                                              |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | `answers` prop 変更時に `internalAnswers` を再初期化する              |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | `mode === "template"` の error 画面で `最初からやり直す` ボタンを出す |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | q5 再計算、`generationLockRef` 解放、GenerateStep への `mode` 伝播    |

### TypeScript 型と契約

```ts
export type GenerationMode = "llm" | "template";

export interface GenerateStepProps {
  stage: GenerationStage;
  percent: number;
  message: string;
  error?: GenerationError | null;
  onCancel?: () => void;
  onRetry?: () => void;
  mode?: GenerationMode;
}
```

`SkillCreateWizard` では `generationMethod` に応じて `mode` を決める。

```ts
mode={generationMethod === "skip" ? "template" : "llm"}
```

`ConversationRoundStep` は `answers` と `smartDefaults` を見て `internalAnswers` を再構成する。

```ts
useEffect(() => {
  if (isInternalChangeRef.current) {
    isInternalChangeRef.current = false;
    return;
  }
  setInternalAnswers(
    applySmartDefaults(answers ?? createEmptyAnswers(), smartDefaults),
  );
}, [answers, smartDefaults]);
```

### APIシグネチャ

```ts
resolveExternalIntegration(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null | undefined,
): ExternalIntegrationState
```

### 使用例

```tsx
<GenerateStep
  mode={generationMethod === "skip" ? "template" : "llm"}
  stage={stage}
  percent={percent}
  message={message}
  previewContent={previewContent}
  error={error}
  isGenerating={isGenerating}
  onCancel={onCancel}
  onRetry={onRetry}
  generationProgress={generationProgress}
/>
```

### 設定項目と定数一覧

| 項目                | 役割                   | 今回の扱い                                       |
| ------------------- | ---------------------- | ------------------------------------------------ |
| `answers`           | Step 1 の親 state      | `answers` 変更時に child state を再構成          |
| `internalAnswers`   | Step 1 の local state  | リトライ時に空値へ戻す                           |
| `q5`                | 外部ツール連携の主キー | 変更時のみ `resolveExternalIntegration` を再計算 |
| `generationLockRef` | 二重生成防止フラグ     | `finally` で必ず `false` に戻す                  |

### エラーハンドリング

- `skill.create` が失敗しても、`requestId` が古ければ state を汚さない。
- `finally` でロックを解除し、キャンセル・失敗・成功のいずれでも再実行可能にする。
- template モードの error 画面では、`onCancel` を `Step 0` の復帰に接続する。

### エッジケース

| ケース                       | 挙動                                                  |
| ---------------------------- | ----------------------------------------------------- |
| `answers` が親から更新される | `internalAnswers` を再初期化する                      |
| `q5` 以外が変わる            | `resolveExternalIntegration` を再計算しない           |
| template error               | `最初からやり直す` ボタンを表示する                   |
| normal error                 | template 用ボタンは表示しない                         |
| キャンセル後の再実行         | `generationLockRef.current` が `false` のため再開可能 |

### テスト構成

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
- `apps/desktop/scripts/capture-task-sw-fix-state-detail-phase11.mjs`

### Phase 11 画面証跡

| TC    | 証跡                                                                                   | 意味                                        |
| ----- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| TC-03 | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png`  | template error で回復ボタンが見える         |
| TC-04 | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png`   | cancel 後に Step 0 へ戻る                   |
| TC-05 | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png` | normal error では template 用ボタンが出ない |

補助ファイル:

- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshot-coverage.md`
