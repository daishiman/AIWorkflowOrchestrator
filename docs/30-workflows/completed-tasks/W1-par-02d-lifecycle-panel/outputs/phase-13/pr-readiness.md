# Phase 13: PR 準備（blocked）

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR準備（blocked）          |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d |
| ステータス | blocked                    |
| 作成日     | 2026-04-08                 |

## ブロック理由

- ユーザー承認がないため、commit / push / PR は実行しない
- この Phase は readiness 記録のみを残す
- 実際の PR 作成は別 wave で行う

## 変更要約

- `SkillLifecyclePanel` の古い入力導線を削除し、ウィザード起動導線に一本化
- `PlanResult.skillSpec` を store と wizard をまたいで保持するように修正
- `SkillCreateWizard` と `SkillLifecyclePanel` の execute 経路を canonical skillSpec に寄せた
- Phase 11〜12 のドキュメントと manifest を同期

## 変更ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `docs/30-workflows/W1-par-02d-lifecycle-panel/outputs/phase-11/*`
- `docs/30-workflows/W1-par-02d-lifecycle-panel/outputs/phase-12/*`
- `docs/30-workflows/W1-par-02d-lifecycle-panel/artifacts.json`
- `docs/30-workflows/W1-par-02d-lifecycle-panel/outputs/artifacts.json`

## PR 本文の骨子

### Summary

- UT-SKILL-WIZARD-W1-par-02d: `SkillLifecyclePanel` をテキストエリア廃止・ウィザード遷移化
- `PlanResult.skillSpec` を保持して execute 経路の canonical payload を固定
- Phase 11〜13 の証跡を canonical path で同期

### Changed files

- `SkillLifecyclePanel.tsx`
- `SkillCreateWizard.tsx`
- `agentSlice.ts`
- 関連テスト
- Phase 11〜13 の docs / manifest

### Test plan

- `skill-lifecycle-open-wizard-button` が data-testid で取得できる
- ボタンクリックで `onOpenSkillWizard` が呼ばれる
- `skill-lifecycle-request-input` / `skill-lifecycle-create-button` / `skill-lifecycle-prepare-button` が存在しない
- `executePlan` へ canonical `skillSpec` が渡る
- targeted vitest と typecheck が pass

## ローカルチェック

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx`
- `pnpm --filter @repo/desktop typecheck`

## 次の動き

- ユーザー承認が来るまでこの状態を維持する
- 承認後に commit / push / PR を別 wave で実行する
- `pr-readiness.md` はこの wave の最終成果物として保持する
