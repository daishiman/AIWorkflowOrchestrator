# 実装ガイド — TASK-SW-FIX-STATE-DETAIL-001

## Part 1: 初学者向け解説（中学生レベル）

### 例え話でわかる今回の修正

スキルウィザードは「宿題を先生に正しく渡す提出箱」のようなものです。

たとえば、前回書いたメモが箱の中に残ったままだと、次の宿題に前回の答えが混ざってしまいます。今回の修正では、4つの問題を解決しました：

1. **問題12: 前回の回答が残る問題**
   前回の宿題の答えが箱に残っていたのを、「やり直しボタン」を押したときに箱をきれいにするようにしました。

2. **問題13: 失敗したときに逃げ道がない問題**
   テンプレートモード（決まった型を使うモード）で失敗したとき、出口がなくて困っていました。「キャンセル」ボタンという非常口を追加しました。

3. **問題18: 情報が更新されない問題**
   質問5（外部ツール連携）の答えを変えても、関連する情報が自動更新されていませんでした。質問5が変わったら自動で再計算するようにしました。

4. **問題19: 扉が閉まったままになる問題**
   生成処理を途中でキャンセルしたとき、「扉のカギ（generationLockRef）」が閉まったままになり、次の生成ができなくなっていました。必ずカギを開けるようにしました。

### なぜ必要か

内部状態が残ったままだと、前回の生成結果が次の試行に混ざります。カギが閉まったままだと次の生成も止まったままになります。UI の表示と実際の状態をそろえることが、使いやすさと安全性の両方に必要です。

---

## Part 2: 開発者向け解説

### 修正概要

| 問題番号 | ファイル                    | 修正内容                                          |
| -------- | --------------------------- | ------------------------------------------------- |
| 問題12   | `ConversationRoundStep.tsx` | `useEffect([answers])` + `allEmpty` チェック追加  |
| 問題13   | `GenerateStep.tsx`          | `isTemplateMode` prop 追加 + キャンセルボタン JSX |
| 問題18   | `SkillCreateWizard.tsx`     | `useEffect([answers.q5])` + 再計算ロジック追加    |
| 問題19   | `SkillCreateWizard.tsx`     | `finally` ブロックでの無条件ロック解放            |

### 型定義 / API シグネチャ

#### 問題13: GenerateStepProps 変更

```typescript
// apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx

export interface GenerateStepProps {
  stage: "idle" | "running" | "error" | "done";
  percent: number;
  onCancel?: () => void;
  onRetry?: () => void;
  error?: { code: string; message: string };
  isTemplateMode?: boolean; // 追加: templateモード時にキャンセルボタンを表示
}
```

#### 問題12: useEffect 追加（ConversationRoundStep）

```typescript
// apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

useEffect(() => {
  // answers prop が空値（リトライによるリセット）に変化した場合に internalAnswers をリセット
  const allEmpty = QUESTION_KEYS.every(
    (k) =>
      (answers[k].selectedOptions ?? []).length === 0 &&
      !(answers[k].freeText ?? "").trim() &&
      answers[k].scheduleConfig === undefined,
  );
  if (allEmpty) {
    setInternalAnswers(createEmptyAnswers());
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [answers]);
```

#### 問題18: useEffect 追加（SkillCreateWizard）

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

useEffect(() => {
  // q5 変更後に hasExternalIntegration / externalToolName を再計算する
  const defaults = smartDefaults ?? inferSmartDefaults(formData);
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [answers.q5]);
```

#### 問題19: finally ブロック修正（SkillCreateWizard）

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

// 変更前
} finally {
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
    generationLockRef.current = false;
  }
}

// 変更後
} finally {
  // 問題19修正: 正常完了・エラー・キャンセルの全経路でロックを必ず解放する
  generationLockRef.current = false;
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
  }
}
```

### エラーハンドリング

| シナリオ                         | 挙動                                                                     |
| -------------------------------- | ------------------------------------------------------------------------ |
| `createSkill` が reject          | `catch` → `finally` でロック解放 → `setIsGenerating(false)` → エラー表示 |
| キャンセル（requestId mismatch） | `return` → `finally` でロック解放 → `setIsGenerating` は更新しない       |
| `smartDefaults` が null          | `inferSmartDefaults(formData)` でフォールバック（問題18 useEffect 内）   |

### エッジケース

| エッジケース                                         | 対処                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| 問題12: `allEmpty=true` が繰り返し発火する           | `setInternalAnswers(createEmptyAnswers())` は同一構造のため React が bail-out |
| 問題18: q1〜q4 変更で q5 effect が誤発火する         | `handleOptionSelect` の spread パターンにより q5 参照は安定                   |
| 問題19: 古い requestId の finally が新規生成を止める | `setIsGenerating(false)` のみ requestId ガードで保護                          |

### 設定可能パラメータ / 定数

| 系統                | 定数 / 変数                    | 説明                                              |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| `answers`           | `ConversationAnswers` 型       | ウィザード全体で共有される回答 state              |
| `internalAnswers`   | `useState(createEmptyAnswers)` | ConversationRoundStep 内部の一時 state            |
| `q5`                | `answers.q5`                   | 外部ツール連携の選択値（useEffect の dependency） |
| `generationLockRef` | `useRef<boolean>(false)`       | 重複生成防止のための同期フラグ                    |

### wire-up 反映状況（確認済み）

`SkillCreateWizardShell` が `templateMode=1` を判定し、`SkillCreateWizard` から `GenerateStep` へ `isTemplateMode` を渡している。これにより、templateMode + error 時のみキャンセルボタンが表示される。

| 経路        | 状態                                                                             | 参照                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ルート判定  | `URLSearchParams(location.search)` で `templateMode=1` を判定                    | `apps/desktop/src/renderer/App.tsx`                                                                                                        |
| prop 伝播   | `SkillCreateWizard` → `GenerateStep` に `isTemplateMode={isTemplateMode}` を渡す | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                         |
| VISUAL 確認 | templateMode + error でキャンセルボタン表示 / 非表示 / 遷移を確認                | `outputs/phase-11/screenshots/MTC-01-template-error-cancel.png` / `MTC-02-template-cancel-step0.png` / `MTC-03-normal-error-no-cancel.png` |
| 回帰確認    | Step 1 リセットと q5 再計算も PASS                                               | `outputs/phase-11/screenshots/MTC-04-retry-reset-step1.png` / `MTC-05-q5-external-checklist.png`                                           |
