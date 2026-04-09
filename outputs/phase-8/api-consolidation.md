# Phase 8 タスク3: API 共通化記録

## 方針: 共通化しない

### 理由

`getSkillCreatorApi()` 関数は両コンポーネントで返却型が異なる:

- SkillLifecyclePanel: `SkillCreatorRuntimeApi | null` を返す
- SkillCreateWizard: `SkillCreatorRuntimeApi`（`{}` フォールバック）を返す

SkillLifecyclePanel は `skillCreatorAPI` を `null` で返すパターンを活用してコンポーネント全体でのガード処理を簡潔にしている。SkillCreateWizard は個別メソッドのチェック（`!api.planSkill`）で F-2/F-3 テストのフォールバック動作を検証している。

共通化すると片方のパターンに合わせる必要があり、既存テストが壊れる可能性がある。

## 記録

両コンポーネントで独立した `getSkillCreatorApi` 関数を維持。
