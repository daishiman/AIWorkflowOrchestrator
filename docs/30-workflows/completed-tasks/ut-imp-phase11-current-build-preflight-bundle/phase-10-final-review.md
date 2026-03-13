# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 10                                                |
| Phase名    | 最終レビュー                                      |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 9                |
| 後続Phase  | Phase 11                                          |

## 目的

要件、設計、実装、品質保証が同じ preflight bundle 契約でつながっているかを最終確認し、手動テストへ進むかを判定する。

## 実行タスク

- タスク1: AC-1 から AC-6 の達成見込みをレビューする
- タスク2: scope drift と issue 制約をレビューする
- タスク3: ゲート判定を行う

### タスク1: AC レビュー

**目的**: 要件と実装のズレを確認する

**確認項目**:

| AC   | 確認内容                                                                        |
| ---- | ------------------------------------------------------------------------------- |
| AC-1 | bundle 名、shared core、CLI wrapper の入口が 1 つの contract に固定されているか |
| AC-2 | 4 bucket の機械判定が定義されているか                                           |
| AC-3 | capture script が shared preflight 結果を使う設計か                             |
| AC-4 | test case が success と 4 failure case を含むか                                 |
| AC-5 | workflow 文書と system spec の更新先が固定されているか                          |
| AC-6 | current と baseline の分離記録が Phase 12 に入っているか                        |

### タスク2: scope drift と issue 制約レビュー

**目的**: 余計な変更が混ざっていないかを確認する

**確認項目**:

| 項目                | 合格条件                                                  |
| ------------------- | --------------------------------------------------------- |
| remediation scope   | UI 色修正が task scope へ入っていない                     |
| issue handling      | closed Issue #1167 を Phase 10 時点で変更しない           |
| dependency handling | native dependency 修復は親 guard task へ委譲している      |
| no-duplication      | preflight 判定ロジックが shared core 以外へ分散していない |

### タスク3: ゲート判定

| 判定  | 条件                                     | 次アクション                         |
| ----- | ---------------------------------------- | ------------------------------------ |
| PASS  | AC と scope がすべて合格                 | Phase 11 へ進む                      |
| MINOR | 文言補強だけで解決する                   | 修正後に Phase 11 へ進む             |
| MAJOR | AC 欠落、scope drift、issue 誤操作がある | Phase 1、2、5、9 の該当 Phase へ戻る |

## 参照資料

| 参照資料         | パス                           | 説明                  |
| ---------------- | ------------------------------ | --------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`      | AC の定義             |
| Phase 2 設計     | `phase-2-design.md`            | contract と sync plan |
| Phase 5 実装     | `phase-5-implementation.md`    | 実装対象の一覧        |
| Phase 9 品質保証 | `phase-9-quality-assurance.md` | 品質レポートの入力    |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容                             |
| ------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | レビューゲート基準               |
| task 台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | backlog と completed routing     |
| 教訓集       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | current と baseline 分離         |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | shared core 正本の維持確認       |
| エラー処理   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | guidance / bucket 語彙の最終整合 |

## 実行手順

### ステップ1: AC を shared contract に照らしてレビューする

bundle 名だけでなく、shared core、CLI wrapper、capture consumer が同じ contract を使っているかを確認する。

### ステップ2: scope drift と duplication drift をレビューする

remediation 混入、issue 誤操作、判定ロジック分散の有無を確認する。

### ステップ3: Phase 11 へ進めるかを判定する

manual test が shared contract の再確認として成立するかを基準に PASS / MINOR / MAJOR を決める。

## 統合テスト連携

- Phase 10 のレビュー結果は Phase 11 の手動テスト対象を絞る入力にする。
- MINOR の補強は Phase 12 の documentation changelog に実施結果を残す。
- MAJOR の場合は該当 Phase へ戻し、再度 Phase 7 以降の検証を回す。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                          | 主要仕様                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ     | shared core 以外への判定分散が起きていないかを見る               | `architecture-implementation-patterns.md`                                                                                                    |
| エラーハンドリング | AC と quality report が同じ guidance / bucket 語彙を使うかを見る | `error-handling.md`                                                                                                                          |
| 品質               | Phase 11 へ進める検証値が揃っているかを見る                      | `quality-requirements.md`                                                                                                                    |
| 文書同期           | Phase 12 が current/baseline と正本更新先を拾えるかを見る        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物           | パス                                      | 内容                      |
| ---------------- | ----------------------------------------- | ------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS、MINOR、MAJOR の判定 |

## 完了条件

- [ ] AC-1 から AC-6 のレビュー結果が記録されている
- [ ] scope drift の有無が記録されている
- [ ] no-duplication の有無が記録されている
- [ ] closed Issue #1167 を変更しない制約が記録されている
- [ ] ゲート判定が PASS または MINOR で記録されている
- [ ] Phase 11 が参照できるレビュー結果が作られている

## 次Phase

Phase 11: 手動テストへ進む。
