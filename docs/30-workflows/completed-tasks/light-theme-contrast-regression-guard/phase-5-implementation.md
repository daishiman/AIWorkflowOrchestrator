# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 5                                                    |
| Phase名    | 実装                                                 |
| ステータス | completed                                            |
| 前提Phase  | Phase 4                                              |
| 後続Phase  | Phase 6                                              |

## 目的

Codex 実装 lane が guard script、checklist template、evidence helper を最小差分で実装できるようにする。

## 実行タスク

- タスク1: screenshot matrix / coverage validator の補助機能を実装する
- タスク2: hardcoded color audit helper と baseline policy を実装する
- タスク3: Phase 11 / 12 向けの docs template / helper を実装する

## 参照資料

| 参照資料                | パス                                                                                                         | 説明                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Phase 4 テスト仕様      | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/phase-4-test-creation.md`           | 守るべき Red 条件                   |
| Phase 2 evidence policy | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/evidence-policy.md` | baseline/current ルール             |
| Phase 11/12 guide       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                  | screenshot / Phase 12 task contract |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                     |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| development-guidelines     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 実装境界の一般原則                       |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | representative screen の state ownership |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | helper / validator 実装時の test pattern |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | Settings shell checklist の入力          |
| ui-ux-forms                | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                | Auth checklist の入力                    |
| ui-ux-search-panel         | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`         | WorkspaceSearch checklist の入力         |

## 実行手順

### ステップ1: validator / helper を実装する

1. screenshot matrix と coverage validator を支える helper を追加する
2. grep / audit / exclusion / baseline policy の helper を追加する
3. current build source pinning に必要な metadata 入力点を設計どおりに実装する

### ステップ2: docs bridge を実装する

1. Phase 11 の screenshot-plan / manual-test-result 連携を実装する
2. Phase 12 の spec-update-summary / unassigned-task-detection 連携を実装する
3. future execution の outputs へ summary を残せるようにする

### ステップ3: boundary を維持する

1. token 値修正や component 色置換は本 task に含めない
2. Settings/Auth/Search の UI 修正 task と guard task を混ぜない
3. 実装差分を `implementation-summary.md` に集約する

## Atent Team / Codex 指示

- validator と docs template を別 concern として実装する
- token / UI 実装修正と混ぜない
- future execution では Lane B/C の出力を参照して Codex が実装する

## 統合テスト連携

| 観点                       | 連携内容                                                                  |
| -------------------------- | ------------------------------------------------------------------------- |
| Test-driven implementation | Phase 4 の testcase を満たす最小差分で実装する                            |
| Docs bridge                | manual-test / documentation のテンプレート更新を同時に記録する            |
| Evidence                   | 実装差分と非スコープ差分を `implementation-summary.md` に分離して記録する |

## 多角的チェック観点

| 観点           | 適用内容                                         | 仕様参照先                                                                  |
| -------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| UI/UX          | guard が UI修正 task を飲み込んでいないか        | dependency workflows                                                        |
| アーキテクチャ | helper / template / checklist の責務分離         | `development-guidelines.md`                                                 |
| テスト戦略     | Red 条件に対する最小実装になっているか           | `testing-component-patterns.md`                                             |
| 証跡運用       | Phase 11 / 12 の出力に必要な metadata を持てるか | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` |

## 成果物

| 成果物                 | パス                                                                                                                | 説明                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| implementation-summary | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md` | changed files / helper / boundary の記録 |

## 完了条件

- [x] guard 実装が UI修正 task と混線していない
- [x] validator / audit / checklist helper の境界が明確である
- [x] Phase 6 が false positive / false negative を追加検証できる
- [x] implementation-summary に非スコープ差分が明記される

## サブタスク管理

1. Phase 4 test-spec を確認する
2. validator / helper を実装する
3. docs bridge を実装する
4. scope boundary を再確認する
5. implementation-summary を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 5 登録を更新
- [x] token / migration task と混線していない

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 5
```

## 次Phase

Phase 6: テスト拡充
