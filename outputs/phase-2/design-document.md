# Phase 2: 設計書 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## concern 分類

| concern    | 対象                                                    | 変更種別   |
| ---------- | ------------------------------------------------------- | ---------- |
| UI 変更    | `skill-lifecycle-execution-input` textarea → 削除       | 削除       |
| state 整理 | `executionPrompt` / `setExecutionPrompt` / 関連ハンドラ | 削除・置換 |

## 削除する UI 要素

| data-testid                       | 要素タイプ | 関連 state        |
| --------------------------------- | ---------- | ----------------- |
| `skill-lifecycle-execution-input` | textarea   | `executionPrompt` |

## 削除する state・ハンドラ（確定）

| 名称                 | 種別   | 依存先                                                             | 削除方針                            |
| -------------------- | ------ | ------------------------------------------------------------------ | ----------------------------------- |
| `executionPrompt`    | state  | textarea / canExecuteSkill / handleExecute / handlePlanImprovement | `defaultExecutionPrompt` 定数で代替 |
| `setExecutionPrompt` | setter | textarea onChange                                                  | `executionPrompt` と同時削除        |

## `approvedSkillSpec` state の扱い

`approvedSkillSpec` state は本コンポーネントに存在しないことを確認（PR #2036 以前に削除済み）。

## ウィザードボタン設計（既存確認）

`data-testid="skill-lifecycle-open-wizard-button"` は PR #2036 で追加済み。

```tsx
<button
  type="button"
  className={lifecycleButtonStyles.primary}
  onClick={onOpenSkillWizard}
  data-testid="skill-lifecycle-open-wizard-button"
>
  スキル作成ウィザードを開く →
</button>
```

**props 設計:**

| prop 名             | 型           | 必須       | 説明                           |
| ------------------- | ------------ | ---------- | ------------------------------ |
| `onOpenSkillWizard` | `() => void` | オプション | ウィザードを開くコールバック   |
| `onOpenSettings`    | `() => void` | オプション | API キー設定を開くコールバック |

## state 依存先の置換設計

| 依存箇所                | 変更前                                                             | 変更後                              |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| `canExecuteSkill`       | `executionPrompt.trim().length > 0` を含む複合条件                 | `executionPrompt` チェックを削除    |
| `handleExecute`         | `const trimmedPrompt = executionPrompt.trim()` → 空チェック → 使用 | `defaultExecutionPrompt` を直接使用 |
| `handlePlanImprovement` | `executionPrompt.trim() \|\| defaultExecutionPrompt`               | `defaultExecutionPrompt` 直接使用   |

## テスト更新方針

| テストファイル                 | 更新内容                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `SkillLifecyclePanel.test.tsx` | `skill-lifecycle-execution-input` 非存在テスト追加（削除要素確認・回帰テスト） |
| その他5本                      | 影響なし（変更対象 testid の参照なし）                                         |

## settings / wizard 導線の境界

- `onOpenSkillWizard` は作成ウィザードの表示制御
- `onOpenSettings` は API キー設定の表示制御
- どちらも current facts で接続済みであり、本タスクは UI 配置と文言の整合確認に集中する
