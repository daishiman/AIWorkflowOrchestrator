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

---

# Phase 8: 責務境界マップ — UT-SKILL-WIZARD-W2-seq-03a（inferSmartDefaults 分離後）

## コンポーネント責務境界（Phase 8 完了後）

| コンポーネント/ファイル              | 責務                                                                              | 変更     |
| ------------------------------------ | --------------------------------------------------------------------------------- | -------- |
| `SkillCreateWizard.tsx`              | state管理・ハンドラ定義・Step間オーケストレーション（skillPath / onRetry を含む） | 変更     |
| `wizard/utils/inferSmartDefaults.ts` | スマートデフォルト推論ロジック（**Phase 8 で SkillCreateWizard.tsx から移動**）   | 新設     |
| `hooks/useSkillGeneration.ts`        | LLM生成の非同期処理・エラーハンドリング（オプション）                             | 未実施   |
| `wizard/SkillInfoStep.tsx`           | Step 0 UI                                                                         | 変更なし |
| `wizard/ConversationRoundStep.tsx`   | Step 1 UI                                                                         | 変更なし |
| `wizard/GenerateStep.tsx`            | Step 2 UI（生成中専用）                                                           | 変更なし |
| `wizard/CompleteStep.tsx`            | Step 3 UI                                                                         | 変更なし |

## inferSmartDefaults 移動の詳細

### 変更前

```
SkillCreateWizard.tsx
  └── export function inferSmartDefaults(data: SkillInfoFormData): SmartDefaultResult
       （コンポーネントファイル内にインライン定義）
```

### 変更後

```
wizard/utils/inferSmartDefaults.ts  ← 移動先（新設）
  └── export function inferSmartDefaults(data: SkillInfoFormData): SmartDefaultResult

SkillCreateWizard.tsx
  ├── import { inferSmartDefaults } from "./wizard/utils/inferSmartDefaults"
  └── export { inferSmartDefaults } from "./wizard/utils/inferSmartDefaults"
       （後方互換 re-export: テストが SkillCreateWizard.tsx から import しているため維持）
```

## 責務境界の確認

| 確認項目                      | 結果   |
| ----------------------------- | ------ |
| inferSmartDefaults の単一責務 | 満足   |
| 循環依存                      | なし   |
| テスト後方互換性              | 維持   |
| 全テスト Green                | 確認済 |

## 実施日

2026-04-11
