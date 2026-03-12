# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| Phase | 3 |
| Phase名 | 設計レビュー |
| ステータス | completed |
| 前提Phase | Phase 1, Phase 2 |
| 後続Phase | Phase 4 |

## 目的

Phase 1-2 の設計が現行 shell、store、IPC、Dashboard、Settings、Skill import 契約と矛盾しないかをレビューする。

## 実行タスク

- タスク1: shell / navigation / settings rerun 設計をレビューする
- タスク2: state / persistence / display name fallback 設計をレビューする
- タスク3: gate 判定を記録する

### レビュー観点

| 観点 | 判定基準 |
| --- | --- |
| shell integration | `dashboard` の internal ID を変えていない |
| persistence | `electronAPI.store` と `theme` の既存 surface だけを使っている |
| display name | auth profile 不在でも personalization が成立する |
| skill import | UI copy と `skillName` identifier が分離されている |
| micro interaction | bounce / fade / confetti / transition が設計内に明示されている |
| accessibility | Tab/Focus トラップ、`Esc` / `Enter` の挙動が明確 |
| user policy | Phase 1-3 completed 前に Phase 4 以降へ進まない方針が残っている |

### 判定

| 判定 | 条件 | 次アクション |
| --- | --- | --- |
| PASS | 全観点が満たされている | Phase 4-13 は planned のまま保持し、実装依頼時に着手する |
| MINOR | 文言修正だけで閉じる | Phase 2 に戻って文書修正後に再判定する |
| MAJOR | shell / store / IPC 契約に矛盾がある | Phase 2 に戻る |

## 参照資料

| 参照資料 | パス | 説明 |
| --- | --- | --- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-1/` | 要件、スコープ、AC |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-2/` | 設計一式 |
| foundation audit note | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | `task-061` の Task 5B 適用境界 |
| App shell | `apps/desktop/src/renderer/App.tsx` | shell 実装アンカー |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス | 内容 |
| --- | --- | --- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | `spec_created` 運用 |
| lessons learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | P31 と UI 再監査の再利用ルール |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Gate 判定の基準 |

## 統合テスト連携

| 観点 | 連携内容 |
| --- | --- |
| test gate | PASS 判定の設計だけを Phase 4 testcase に渡す |
| manual test gate | overlay 表示、skip、complete、rerun を Phase 11 へ渡す |
| documentation gate | Phase 12 で `task-workflow` と UI spec を同期する計画を保持する |

## 成果物

| 成果物 | パス |
| --- | --- |
| design-review-result | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-3/design-review-result.md` |
| review-findings | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-3/review-findings.md` |

## 完了条件

- [x] shell / store / IPC 契約の矛盾が解消されている
- [x] PASS 判定が記録されている
- [x] minor finding の扱いが文書で解決済みである
- [x] Phase 4 以降が planned のまま維持されている

## 次Phase

Phase 4: テスト作成
