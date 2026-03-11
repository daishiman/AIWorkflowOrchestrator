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
| 方針反映     | SubAgent、並列条件、commit/PR 禁止が明記されている |
| backlog 整理 | 既存未タスクとの重複を避ける説明がある             |

### 判定

| 判定  | 条件                       | 次アクション   |
| ----- | -------------------------- | -------------- |
| PASS  | 全観点 OK                  | Phase 4 へ進む |
| MINOR | 文言・batch 微修正のみ     | 修正後 Phase 4 |
| MAJOR | token 依存や対象範囲が曖昧 | Phase 2 へ戻る |

## 参照資料

| 参照資料                | パス                                                                                      | 説明               |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物          | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/`                   | 要件               |
| Phase 2 成果物          | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-2/`                   | 設計               |
| Token foundation review | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-3-design-review.md` | 依存元レビュー結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                      |
| -------------------- | --------------------------------------------------------------------------- | ------------------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準                  |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | light theme review 再利用 |

## 統合テスト連携

| 観点            | 連携内容                                                                   |
| --------------- | -------------------------------------------------------------------------- |
| Gate to test    | PASS/MINOR になった batch 設計だけを Phase 4 へ渡す                        |
| Dependency gate | token foundation 依存が未確定なら Phase 4 を開始しない                     |
| Evidence        | `design-review-result.md` に representative file 群と batch 単位を固定する |

## 成果物

| 成果物               | パス                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| design-review-result | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-3/design-review-result.md` |

## 完了条件

- [ ] 依存関係と batch 分割がレビュー済みである
- [ ] PASS または MINOR 判定が記録されている
- [ ] Phase 4 以降へ進む条件が明文化されている

## 次Phase

Phase 4: テスト作成
