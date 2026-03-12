# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 7 |
| Phase名 | テストカバレッジ確認 |
| ステータス | completed |
| 前提Phase | Phase 5, Phase 6 |
| 後続Phase | Phase 8 |

## 目的

wizard local state、overlay shell、store persistence、theme action、skill import handoff のカバレッジを確認する。

## 実行タスク

- タスク1: component / hook / integration の coverage 目標を確認する
- タスク2: 未到達分岐を洗い出す
- タスク3: Phase 8 に回す refactor 前提を整理する

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-5/` | 実装差分 |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-6/` | regression 増分 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage gate |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | workflow evidence 管理 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| coverage to refactor | 未到達分岐を Phase 8 の抽出判断に渡す |
| coverage to manual | code coverage で拾えない animation / overlay を Phase 11 に渡す |
| coverage to docs | gate 結果を Phase 12 の changelog 前提へ渡す |

## 成果物

| 成果物 | パス |
| --- | --- |
| coverage-target-report | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-7/coverage-target-report.md` |
| coverage-gate-result | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-7/coverage-gate-result.md` |

## 完了条件

- [x] coverage 対象と目標が整理されている
- [x] 未到達分岐が列挙されている
- [x] Phase 8 へ渡す refactor 前提が整理されている

## 次Phase

Phase 8: リファクタリング
