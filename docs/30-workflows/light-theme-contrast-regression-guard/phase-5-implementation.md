# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 5                                                  |
| Phase名    | 実装                                               |
| ステータス | not_started                                        |
| 前提Phase  | Phase 4                                            |
| 後続Phase  | Phase 6                                            |

## 目的

Codex 実装 lane が guard ツールと checklist を実装できるようにする。

## 実行タスク

- タスク1: screenshot matrix validator を実装する
- タスク2: grep/audit helper を実装する
- タスク3: Phase 11 checklist / docs template を更新する

## 参照資料

| 参照資料               | パス                                                                                         | 説明                    |
| ---------------------- | -------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 4 テスト仕様     | `docs/30-workflows/light-theme-contrast-regression-guard/phase-4-test-creation.md`           | 守るべきテスト観点      |
| Evidence policy        | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/evidence-policy.md` | current/baseline ルール |
| Development guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                | 実装境界の一般方針      |
| Testing patterns       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`            | テスト支援の正本        |

## Atent Team / Codex 指示

- validator と docs template は分けて実装する
- token / UI 実装修正と混ぜない

## 統合テスト連携

| 観点                       | 連携内容                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| Test-driven implementation | Phase 4 の testcase を満たす最小差分で validator / helper を実装する |
| Docs bridge                | manual-test / documentation のテンプレート更新を同時に記録する       |
| Evidence                   | 実装差分を `implementation-summary.md` に集約し、Phase 6 へ渡す      |

## 成果物

| 成果物                 | パス                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| implementation-summary | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-5/implementation-summary.md` |

## 完了条件

- [ ] guard 実装が UI 修正と混線していない
- [ ] validator と checklist 更新の境界が明確である

## 次Phase

Phase 6: テスト拡充
