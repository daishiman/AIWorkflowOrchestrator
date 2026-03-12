# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 9 |
| Phase名 | 品質保証 |
| ステータス | completed |
| 前提Phase | Phase 5 |
| 後続Phase | Phase 10 |

## 目的

UX 言語、IPC 境界、failure behavior、accessibility、responsive の品質を横断確認する。

## 実行タスク

- タスク1: UX 言語と copy を確認する
- タスク2: preload / store / theme surface の利用範囲を確認する
- タスク3: skip、complete、rerun、import failure の品質基準を確認する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 8 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-8/` | refactor 結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| UX language | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | やさしい日本語 |
| IPC security | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | preload 境界 |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質 gate |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| copy quality | Phase 11 の目視確認項目へ渡す |
| IPC quality | store / theme 利用範囲を Phase 10 review に渡す |
| failure behavior | import failure と rerun path を Phase 11 に渡す |

## 成果物

| 成果物 | パス |
| --- | --- |
| qa-checklist | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-9/qa-checklist.md` |
| risk-review | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-9/risk-review.md` |

## 完了条件

- [x] UX 言語の確認結果が残っている
- [x] preload / store / theme 利用範囲が確認されている
- [x] failure behavior の品質基準が整理されている

## 次Phase

Phase 10: 最終レビュー
