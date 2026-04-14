# Phase 5: 実装記録

## タスク: TASK-SW-FIX-STATE-DETAIL-001

## 修正ファイル一覧

| ファイル                                                                      | 変更内容                                                                   | 対象問題   |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | `useRef` import 追加、`isInternalChangeRef` パターン追加、useEffect 分割   | 問題12     |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | `mode?: GenerationMode` props 追加、テンプレートモードキャンセルボタン追加 | 問題13     |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | `q5SeriRef` + useEffect 追加、finally ブロック修正                         | 問題18・19 |

---

## 問題12: ConversationRoundStep — answers prop 変化時に internalAnswers がリセットされない

### 修正内容 (`ConversationRoundStep.tsx`)

**変更点 1: `useRef` import 追加**

```tsx
// Before
import React, { useEffect, useState } from "react";

// After
import React, { useEffect, useRef, useState } from "react";
```

**変更点 2: `isInternalChangeRef` フラグ導入 + useEffect 分割**

```tsx
// 内部操作による親→子エコーを識別するフラグ（問題12: 無限ループ防止）
const isInternalChangeRef = useRef(false);

// Effect 1: 内部状態変化を親に通知
useEffect(() => {
  isInternalChangeRef.current = true;
  onAnswersChange(internalAnswers);
}, [internalAnswers, onAnswersChange]);

// Effect 2: answers prop 変化時に internalAnswers をリセット（問題12修正）
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

**設計根拠:**

- `isInternalChangeRef` = 内部変更か外部変更かを識別するための ref フラグ
- Effect 1 が `onAnswersChange` を呼ぶ → 親が `answers` prop を更新 → Effect 2 がトリガー
- Effect 2 では `isInternalChangeRef.current` が `true` の場合（内部発火）は `false` に戻してスキップ
- 外部（リトライ）による prop 変化時のみ `setInternalAnswers` を実行

---

## 問題13: GenerateStep — templateモードのエラー時にキャンセルボタンがない

### 修正内容 (`GenerateStep.tsx`)

**変更点: `mode` prop 追加 + テンプレートモードキャンセルボタン**

```tsx
// Props に追加
export interface GenerateStepProps {
  // ... 既存 props
  mode?: GenerationMode;
}

// コンポーネント内に追加
const showTemplateCancelButton =
  mode === "template" && Boolean(error) && !isActive && Boolean(onCancel);

// JSX: 既存のキャンセルボタンの後に追加
{
  showTemplateCancelButton && (
    <button
      type="button"
      onClick={onCancel}
      className="self-center px-4 py-2 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
    >
      最初からやり直す
    </button>
  );
}
```

---

## 問題18: SkillCreateWizard — q5 変更時に resolveExternalIntegration が再計算されない

### 修正内容 (`SkillCreateWizard.tsx`)

**変更点: `q5SeriRef` + q5 監視 useEffect 追加**

```tsx
// q5 内容変化検出用 ref（JSON.stringify 比較）
const q5SeriRef = useRef("");

// q5 変化時のみ resolveExternalIntegration を再計算
useEffect(() => {
  const q5Ser = JSON.stringify(answers.q5);
  if (q5Ser === q5SeriRef.current) return;
  q5SeriRef.current = q5Ser;
  const defaults = smartDefaults ?? DEFAULT_SMART_DEFAULTS;
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
}, [answers, smartDefaults]);
```

**設計根拠:**

- `answers.q5` は immutable update により常に新しい参照になるため `===` 比較では検出できない
- `JSON.stringify` でコンテンツ変化のみを検出し、不要な再計算を防ぐ

---

## 問題19: SkillCreateWizard — generationLockRef がキャンセルパスで解放されない

### 修正内容 (`SkillCreateWizard.tsx`)

**変更点: `finally` ブロックのロック解放順序修正**

```tsx
// Before
} finally {
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
    generationLockRef.current = false;  // requestId 条件の内側: キャンセル時に未解放
  }
}

// After
} finally {
  generationLockRef.current = false;  // 常に解放（全パス対称）
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
  }
}
```

**設計根拠:**

- `generationLockRef` は「生成中かどうか」を示すグローバルガード
- キャンセル時は `requestId !== generationRequestIdRef.current` になるため、旧コードでは `false` に戻らなかった
- `finally` ブロックで無条件に解放し、成功・エラー・キャンセルの全パスで対称性を確保

---

## テスト修正内容

### `vitest.config.ts`

- `resolve.alias` に `@repo/shared/types/skillWizard` を追加
  - 原因: `vite-tsconfig-paths` v6 は tsconfig の `exclude` 対象ファイルのパスを解決しない

### `ConversationRoundStep.test.tsx`

- `describe("問題12修正...")` 内に `let mock` 宣言 + `beforeEach` を追加
  - 原因: 既存の mock 変数は別の `describe` スコープに属していた

---

## テスト結果サマリー

| テストファイル                   | テスト数 | 結果                                                |
| -------------------------------- | -------- | --------------------------------------------------- |
| `GenerateStep.test.tsx`          | 40       | 全Pass (TC-03, TC-04, TC-05 含む)                   |
| `ConversationRoundStep.test.tsx` | 86       | 全Pass (TC-01, TC-02 含む)                          |
| `SkillCreateWizard.test.tsx`     | 40       | 全Pass (TC-06, TC-07, TC-06b, TC-08/09, TC-10 含む) |
| **合計**                         | **166**  | **全Pass**                                          |
