# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 3                                               |
| Phase名    | 設計レビュー                                    |
| ステータス | not_started                                     |
| 前提Phase  | Phase 1, Phase 2                                |
| 後続Phase  | Phase 4                                         |

## 目的

shared color migration の対象、順序、責務分離が妥当かをレビューする。

## 実行タスク

- タスク1: token foundation task 依存の妥当性確認
- タスク2: batch 分割の安全性確認
- タスク3: ゲート判定

### レビュー観点

| 観点         | 判定基準                                           |
| ------------ | -------------------------------------------------- |
| 依存関係     | Task 1 の token 契約前提が守られている             |
| 対象妥当性   | P1/P2 ファイル選定が調査結果と一致する             |
| バッチ分割   | 大きすぎる batch がなく review 可能粒度である      |
| 抽出完全性   | batch ごとの `aiworkflow-requirements` 抽出が揃う  |
| 方針反映     | SubAgent、並列条件、commit/PR 禁止が明記されている |
| backlog 整理 | 既存未タスクとの重複を避ける説明がある             |
| system spec  | global remediation の concern 分離が守られている   |
| verification | verification-only 対象が主改修 batch に混ざらない  |
| 証跡方針     | current build capture を前提に Phase 11 へ渡せる   |

### 判定

| 判定  | 条件                       | 次アクション   |
| ----- | -------------------------- | -------------- |
| PASS  | 全観点 OK                  | Phase 4 へ進む |
| MINOR | 文言・batch 微修正のみ     | 修正後 Phase 4 |
| MAJOR | token 依存や対象範囲が曖昧 | Phase 2 へ戻る |

## 参照資料

| 参照資料                | パス                                                                                                                         | 説明               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/`                                      | 要件               |
| Phase 1 抽出表          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/aiworkflow-requirements-extraction.md` | 抽出完全性確認     |
| Phase 2 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`                                      | 設計               |
| Token foundation review | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-3-design-review.md`                                    | 依存元レビュー結果 |
| Global workflow         | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`                               | concern 分離基準   |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                             |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| ui-ux-design-system        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | baseline 契約                    |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | settings/auth surface 契約       |
| ui-ux-forms                | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                | `AuthView` readable text         |
| architecture-auth-security | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | auth/account 境界                |
| api-ipc-auth               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | auth state → UI                  |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | settings auth key / api key 契約 |
| review-gate-criteria       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`    | PASS/MINOR/MAJOR 判定正本        |
| quality requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準                         |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | screenshot / evidence 運用       |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | light theme review 再利用        |

## 実行手順

1. Phase 1/2 の要求・設計が token foundation と global remediation の concern 分離を守っているか確認する。
2. batch 粒度、verification-only separation、system spec extraction completeness、既存 backlog 分離、current build capture 方針をレビューする。
3. `PASS` / `MINOR` / `MAJOR` を判定し、要件問題なら Phase 1、設計問題なら Phase 2 へ戻す条件を記録する。

## 統合テスト連携

| 観点            | 連携内容                                                                   |
| --------------- | -------------------------------------------------------------------------- |
| Gate to test    | PASS/MINOR になった batch 設計だけを Phase 4 へ渡す                        |
| Dependency gate | token foundation 依存が未確定なら Phase 4 を開始しない                     |
| Evidence        | `design-review-result.md` に representative file 群と batch 単位を固定する |

## 成果物

| 成果物               | パス                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| design-review-result | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-3/design-review-result.md` |

## 完了条件

- [ ] 依存関係と batch 分割がレビュー済みである
- [ ] PASS または MINOR 判定が記録されている
- [ ] `aiworkflow-requirements` 抽出完全性がレビュー済みである
- [ ] system spec の concern 分離と current build capture 条件がレビュー済みである
- [ ] Phase 4 以降へ進む条件が明文化されている

## 次Phase

Phase 4: テスト作成
