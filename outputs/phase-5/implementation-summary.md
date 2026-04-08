# Phase 5: 実装概要 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## 実装の概要

`SkillLifecyclePanel.tsx` から `skill-lifecycle-execution-input` textarea と `executionPrompt` state を削除した。
実行プロンプトは `defaultExecutionPrompt` 定数（固定値）を使用するよう変更した。

## 変更内容

### 1. `executionPrompt` state の削除

```diff
- const [executionPrompt, setExecutionPrompt] = useState(
-   defaultExecutionPrompt,
- );
```

### 2. `canExecuteSkill` の更新

```diff
  const canExecuteSkill =
    Boolean(createdSkillName) &&
    !isExecuting &&
-   executionPrompt.trim().length > 0 &&
    skillExecutionStatus !== "review" &&
    skillExecutionStatus !== "reuse_ready";
```

### 3. `handleExecute` の更新

```diff
  const handleExecute = async () => {
-   const trimmedPrompt = executionPrompt.trim();
    if (!createdSkillName) {
      setLocalError("先にスキルを生成してください。");
      return;
    }
-   if (!trimmedPrompt) {
-     setLocalError("実行内容を入力してください。");
-     return;
-   }
    // ...
    appendSessionEntry(setSessionEntries, {
      role: "user",
      title: "実行依頼",
-     detail: trimmedPrompt,
+     detail: defaultExecutionPrompt,
    });
    // ...
    if (skillExecutionStatus === "improve_ready") {
-     await reExecuteAfterImprovement(trimmedPrompt);
+     await reExecuteAfterImprovement(defaultExecutionPrompt);
    } else {
-     await executeSkill(trimmedPrompt);
+     await executeSkill(defaultExecutionPrompt);
    }
  };
```

### 4. `handlePlanImprovement` の更新

```diff
- const runtimeFeedback = executionPrompt.trim() || defaultExecutionPrompt;
+ const runtimeFeedback = defaultExecutionPrompt;
```

### 5. textarea JSX の削除

```diff
- <textarea
-   value={executionPrompt}
-   onChange={(event) => setExecutionPrompt(event.target.value)}
-   rows={3}
-   placeholder="このスキルに何をさせるかを書いてください"
-   className="mt-4 w-full ..."
-   data-testid="skill-lifecycle-execution-input"
- />
```

## テスト結果（Green）

```
✓ SkillLifecyclePanel.test.tsx (39 tests) 936ms
✓ SkillLifecyclePanel.llm-generation.test.tsx (35 tests | 13 skipped)
✓ SkillLifecyclePanel.auth-regression.test.tsx (9 tests | 5 skipped)
✓ SkillLifecyclePanel.error-persistence.test.tsx (9 tests)
✓ SkillLifecyclePanel.approval.test.tsx (9 tests)
✓ SkillLifecyclePanel.adapter-status.test.tsx (2 tests)

Test Files  6 passed (6)
Tests       85 passed | 18 skipped (103)
```
