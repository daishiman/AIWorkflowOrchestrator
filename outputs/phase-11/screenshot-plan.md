# Phase 11: スクリーンショット計画 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001
- 対象: `SkillLifecyclePanel` のテキストエリア削除・ウィザードボタン化
- 撮影日時: 2026-04-08
- 方式: Playwright + Vite harness

## 撮影対象

| TC       | テーマ | 期待状態                                                               | 出力ファイル                                                                                                     |
| -------- | ------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| TC-11-01 | light  | `skill-lifecycle-open-wizard-button` が表示され、textarea が存在しない | `outputs/phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-light.png` |
| TC-11-02 | dark   | `skill-lifecycle-open-wizard-button` が表示され、textarea が存在しない | `outputs/phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-dark.png`  |

## 撮影条件

- ハーネス: `apps/desktop/src/renderer/phase11-task-skill-lifecycle-severity-filter.html`
- ターゲット: `SkillLifecyclePanel`
- ビューポート: `1440 x 1100`
- 確認観点: ボタン表示、textarea 非存在、light / dark の見え方

## 補足

- current task の visual evidence は、task 専用フォルダ `UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/` に保存する
- 画面全体の安定性を見たいので full page capture を採用する
