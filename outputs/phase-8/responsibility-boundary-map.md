# Phase 8: 責務境界マップ — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## 変更前後のデータフロー

### 変更前（executionPrompt state あり）

```
ユーザー入力
  └── textarea（data-testid="skill-lifecycle-execution-input"）
        └── onChange → setExecutionPrompt(event.target.value)
              └── executionPrompt state
                    ├── canExecuteSkill（プロンプト長チェック）
                    ├── handleExecute → appendSessionEntry(detail: trimmedPrompt)
                    ├── handleExecute → executeSkill(trimmedPrompt)
                    ├── handleExecute → reExecuteAfterImprovement(trimmedPrompt)
                    └── handlePlanImprovement → runtimeFeedback = trimmedPrompt || default
```

### 変更後（defaultExecutionPrompt 定数のみ）

```
定数
  └── defaultExecutionPrompt（コンパイル時定数）
        ├── canExecuteSkill（プロンプト長チェック削除）
        ├── handleExecute → appendSessionEntry(detail: defaultExecutionPrompt)
        ├── handleExecute → executeSkill(defaultExecutionPrompt)
        ├── handleExecute → reExecuteAfterImprovement(defaultExecutionPrompt)
        └── handlePlanImprovement → runtimeFeedback = defaultExecutionPrompt
```

## 責務境界の確認

| 責務区分                 | 変更前                           | 変更後                          | 境界違反 |
| ------------------------ | -------------------------------- | ------------------------------- | -------- |
| 実行プロンプトの供給     | ユーザー入力 textarea            | `defaultExecutionPrompt` 定数   | なし     |
| 実行プロンプトの状態管理 | `executionPrompt` state          | 不要（定数に変更）              | なし     |
| 実行可否判定             | スキル名 + 実行中 + プロンプト長 | スキル名 + 実行中のみ           | なし     |
| 実行ハンドラ             | trimmedPrompt を各関数に渡す     | `defaultExecutionPrompt` を渡す | なし     |

## Wizard 遷移ボタンとの関係

`skill-lifecycle-open-wizard-button`（PR#2036 で追加）は `onOpenSkillWizard` prop を呼び出す。
`SkillCreateWizard` への実配線（W2-seq-03a）は本タスクスコープ外。

```
SkillLifecyclePanel（本タスク完了後の状態）
  ├── skill-lifecycle-open-wizard-button → onOpenSkillWizard?() [呼び出し先は未接続]
  └── skill-lifecycle-execution-area → execute ボタン（defaultExecutionPrompt 使用）
```

## 結論

責務境界は適切に整理されており、漏れや循環依存なし。
