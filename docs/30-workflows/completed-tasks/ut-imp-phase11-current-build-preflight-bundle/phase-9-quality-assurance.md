# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 9                                                 |
| Phase名    | 品質保証                                          |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 5, Phase 8                                  |
| 後続Phase  | Phase 10                                          |

## 目的

shared preflight core と thin CLI wrapper が test、build、message、scope の観点で品質基準を満たしているかを確認し、Phase 10 の最終レビューへ渡す。

## 実行タスク

- タスク1: test と build の結果を確認する
- タスク2: failure guidance と metadata を確認する
- タスク3: scope 境界と package script を確認する

### タスク1: test と build 結果確認

**目的**: script と current build artifact の整合を確認する

**確認項目**:

| 項目               | 合格条件                                    |
| ------------------ | ------------------------------------------- |
| targeted vitest    | preflight test が pass                      |
| build              | `pnpm --filter @repo/desktop build` が pass |
| preflight 単体実行 | JSON 出力が生成される                       |

### タスク2: guidance と metadata 確認

**目的**: failure bucket の説明が再利用可能な形になっているかを確認する

**確認項目**:

| 項目           | 合格条件                                        |
| -------------- | ----------------------------------------------- |
| guidance       | bucket ごとに次アクションが含まれる             |
| metadata       | summary、checks、guidance、timestamp が存在する |
| blocked bucket | 上流 fail 時に blocked 扱いが示される           |

### タスク3: scope 境界と package script 確認

**目的**: guard task が scope を越えていないかを確認する

**確認項目**:

| 項目           | 合格条件                                                       |
| -------------- | -------------------------------------------------------------- |
| package script | preflight 名と screenshot 名がそろう                           |
| no-remediation | UI 色修正ファイルへ変更が入っていない                          |
| docs readiness | Phase 11 と Phase 12 が同じ bundle 名を参照できる              |
| no-duplication | capture script に preflight orchestration の重複が残っていない |

## 参照資料

| 参照資料                 | パス                        | 説明                       |
| ------------------------ | --------------------------- | -------------------------- |
| Phase 5 実装             | `phase-5-implementation.md` | 実装対象の一覧             |
| Phase 8 リファクタリング | `phase-8-refactoring.md`    | helper 境界と message 統一 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | 品質ゲートの基準                       |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | guidance と failure 表現               |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | screenshot workflow への接続           |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core を唯一の判定正本に保つ基準 |

## 実行手順

### ステップ1: test と build の成立を確認する

shared core と CLI wrapper の test、build、preflight 単体実行が揃っていることを確認する。

### ステップ2: guidance と metadata の一貫性を確認する

bucket 名、guidance、blocked、report key が manual test と docs へそのまま流せるかを確認する。

### ステップ3: scope と重複排除を確認する

no-remediation と no-duplication の両方が維持されているかを確認する。

## 統合テスト連携

- Phase 7 の coverage report と verification log を入力に品質ゲートを判定する。
- Phase 10 ではこの品質レポートを使って AC と scope drift を最終確認する。
- Phase 11 では quality report をもとに success path と representative failure path を再確認する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                 | 主要仕様                                  |
| ------------------ | ------------------------------------------------------- | ----------------------------------------- |
| アーキテクチャ     | shared core を唯一の判定正本に保てているかを見る        | `architecture-implementation-patterns.md` |
| エラーハンドリング | guidance と metadata の文面が再利用可能かを見る         | `error-handling.md`                       |
| 品質               | test・build・manual test 前提が全部そろっているかを見る | `quality-requirements.md`                 |

## 成果物

| 成果物       | パス                                | 内容                                   |
| ------------ | ----------------------------------- | -------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | test、build、message、scope の確認結果 |

## 完了条件

- [ ] targeted vitest、build、preflight 実行の結果が記録されている
- [ ] guidance と metadata の確認結果が記録されている
- [ ] package script と bundle 名の一致が記録されている
- [ ] no-duplication の確認結果が記録されている
- [ ] remediation task を scope 外に保っている
- [ ] Phase 10 が参照できる品質レポートが作られている

## 次Phase

Phase 10: 最終レビューへ進む。
