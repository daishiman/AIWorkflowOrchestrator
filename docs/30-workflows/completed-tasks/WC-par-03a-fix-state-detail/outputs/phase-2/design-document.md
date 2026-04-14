# 設計書 — TASK-SW-FIX-STATE-DETAIL-001

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| タスクID   | TASK-SW-FIX-STATE-DETAIL-001 |
| 作成日     | 2026-04-14                   |
| ステータス | 完了                         |

---

## Task 1: 問題12設計 — internalAnswers リセット

### 修正方針

`ConversationRoundStep` に `isInternalChangeRef` を追加し、親からの `answers` prop 変化と内部操作による echo を区別する。

### 詳細設計

```tsx
// 追加: 内部変化フラグ (内部操作による echo を識別)
const isInternalChangeRef = useRef(false);

// 修正: 既存 useEffect に isInternalChangeRef フラグ設定を追加
useEffect(() => {
  isInternalChangeRef.current = true;
  onAnswersChange(internalAnswers);
}, [internalAnswers, onAnswersChange]);

// 追加: answers prop 変化時の internalAnswers リセット（問題12修正）
useEffect(() => {
  if (isInternalChangeRef.current) {
    // 内部操作による親 → 子の echo: リセット不要
    isInternalChangeRef.current = false;
    return;
  }
  // 親からの direct 変更（リトライ等）: リセット実行
  setInternalAnswers(
    applySmartDefaults(answers ?? createEmptyAnswers(), smartDefaults),
  );
}, [answers, smartDefaults]);
```

### 無限ループ防止の仕組み

| イベント                                                                               | isInternalChangeRef     | 動作                    |
| -------------------------------------------------------------------------------------- | ----------------------- | ----------------------- |
| ユーザー操作 → internalAnswers変化 → onAnswersChange → 親setAnswers → answers prop変化 | Effect A が true に設定 | Effect B は skip        |
| 親が直接 setAnswers（リトライ等）                                                      | false のまま            | Effect B はリセット実行 |

### リスク評価

- 無限ループ: `isInternalChangeRef` フラグにより防止 ✓
- 初回マウント時: `answers` が変化しないため Effect B は発火するが既存 useState 初期化と同値 → 無害
- smartDefaults 変化: Step 1 がマウントされている間は変化しないため実質的に問題なし

---

## Task 2: 問題13設計 — templateモード キャンセルボタン

### 修正方針

`GenerateStep` に `mode?: GenerationMode` prop を追加し、`mode === "template"` かつ `error` 状態の場合にキャンセルボタンを表示する。

### 詳細設計

```tsx
export interface GenerateStepProps {
  // ... 既存 props ...
  mode?: GenerationMode; // 新規追加（省略時は "llm" 相当）
}

// showCancelButton の下に追加
const showTemplateCancelButton =
  props.mode === "template" && Boolean(error) && !isActive && Boolean(onCancel);

// JSX: Error Display の後、Cancel Button の前に追加
{
  showTemplateCancelButton && (
    <button
      type="button"
      onClick={onCancel}
      aria-label="最初からやり直す"
      className="self-center px-4 py-2 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
    >
      最初からやり直す
    </button>
  );
}
```

### 分岐条件

| 条件                                           | キャンセルボタン表示               |
| ---------------------------------------------- | ---------------------------------- |
| `mode === "template"` && `error` && `onCancel` | ✓ 表示                             |
| `mode !== "template"` && `error`               | ✗ 非表示（回帰）                   |
| `isActive` && `onCancel`                       | 通常キャンセルボタンが表示（既存） |

---

## Task 3: 問題18設計 — resolveExternalIntegration 再計算

### 修正方針

`SkillCreateWizard` に useEffect を追加し、`answers.q5` の内容が変化したときのみ `resolveExternalIntegration` を再呼び出しする。

### 詳細設計

q5 の内容変化を JSON.stringify で検知し、他の質問の変化では再計算しない。

```tsx
// 追加: q5変化検知用 ref（不要な再計算を防止）
const q5SeriRef = useRef("");

// 追加: q5変化時に resolveExternalIntegration を再計算（問題18修正）
useEffect(() => {
  const q5Ser = JSON.stringify(answers.q5);
  if (q5Ser === q5SeriRef.current) return; // q5が変化していない場合はスキップ
  q5SeriRef.current = q5Ser;
  const defaults = smartDefaults ?? DEFAULT_SMART_DEFAULTS;
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
}, [answers, smartDefaults]);
```

### q5 変化のみ反応する理由

- `answers` オブジェクトはユーザーが q1〜q6 を変更するたびに新しい参照が生成される
- `answers.q5` も同様に新参照が生成されるが、`q5Ser` 比較により内容変化時のみ再計算
- q1〜q4, q6 の変更では `JSON.stringify(answers.q5)` が同じ文字列を返すため early return

---

## Task 4: 問題19設計 — generationLockRef finally節修正

### 修正方針

`handleGenerate` の `finally` 節で `generationLockRef.current = false` を条件外に移動し、全3経路（正常完了・エラー・キャンセル）でロックが解放されることを保証する。

### 現在のコード（問題）

```tsx
} finally {
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
    generationLockRef.current = false;  // キャンセル時はスキップされる
  }
}
```

### 修正後

```tsx
} finally {
  // 全3経路でロック解放を保証（問題19修正）
  generationLockRef.current = false;
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
  }
}
```

### 経路別動作

| 経路                         | generationLockRef.current | setIsGenerating                            |
| ---------------------------- | ------------------------- | ------------------------------------------ |
| 正常完了 (requestId一致)     | false ✓                   | false ✓                                    |
| エラー (requestId一致)       | false ✓                   | false ✓                                    |
| キャンセル (requestId不一致) | false ✓ (防御的修正)      | スキップ（resetGeneratedState で実施済み） |

### 注意事項

- `resetGeneratedState` も同期的にロックを解放するため、通常のキャンセルフローでは二重解放となるが無害
- 別の生成 B が開始している場合（A キャンセル後に B 開始 → A の finally）: UI フローの制約上、B が開始するのは resetGeneratedState 後に Step 0 → Step 1 遷移が必要なため、A の createSkill が reject される前に B が開始する確率は極めて低い

---

## 変更ファイル一覧

| ファイル                                                                      | 変更内容                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | isInternalChangeRef 追加、useEffect 2本に分割                            |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | mode prop 追加、templateモードキャンセルボタン追加                       |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | q5SeriRef 追加、resolveExternalIntegration useEffect 追加、finally節修正 |
