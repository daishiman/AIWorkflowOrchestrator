# Phase 8 タスク1: 重複コード一覧

## 比較対象

- `SkillLifecyclePanel.tsx`
- `SkillCreateWizard.tsx`

## 重複・類似コード比較

### 1. getSkillCreatorApi 関数

| 観点      | SkillLifecyclePanel               | SkillCreateWizard                              |
| --------- | --------------------------------- | ---------------------------------------------- |
| 返却型    | `SkillCreatorRuntimeApi \| null`  | `SkillCreatorRuntimeApi` (空オブジェクト返却)  |
| null 判定 | 呼び出し側で `if (!api)` チェック | api の各メソッドを `!api.planSkill` でチェック |

**判定**: 意図的な差異のため共通化しない。返却型の違いは使用パターンの違いによるもの。

### 2. SkillCreatorRuntimeApi 型

| 観点                  | SkillLifecyclePanel (L127) | SkillCreateWizard     |
| --------------------- | -------------------------- | --------------------- |
| executePlan skillSpec | `optional`                 | `required (C-1 回避)` |

**判定**: `executePlan の skillSpec` が SkillCreateWizard では必須（C-1 回避）のため、型を共通化すると C-1 違反のリスクがある。共通化しない。

### 3. エラーハンドリングパターン

両コンポーネントで `try/catch/finally` の構造は類似しているが、コンポーネントの責務が異なるため共通化不要。

## 結論

**共通化不実施**（意図的な差異）

全ての差異はコンポーネント固有の設計上の意図を持つ。無理な共通化は C-1 等の回避策を壊すリスクがあるため見送り。
