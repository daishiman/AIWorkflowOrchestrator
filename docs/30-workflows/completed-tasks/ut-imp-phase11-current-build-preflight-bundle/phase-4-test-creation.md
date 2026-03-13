# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 4                                                 |
| Phase名    | テスト作成                                        |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 3                         |
| 後続Phase  | Phase 5                                           |

## 目的

preflight bundle の contract を実装前に固定するため、bucket 判定、JSON 出力、guidance、capture integration のテストを先に定義する。

## 実行タスク

- タスク1: preflight unit test を設計する
- タスク2: failure scenario matrix を設計する
- タスク3: capture integration の検証項目を設計する

### タスク1: preflight unit test 設計

**目的**: script の判定順序と出力形式を固定する

**テスト対象**:

| テスト                   | 期待結果                                                             |
| ------------------------ | -------------------------------------------------------------------- |
| shared core success path | 4 bucket が pass、report が返り、`bundleName` が一致する             |
| native mismatch          | native fail、build 以降の bucket が blocked 扱いになる               |
| build missing            | build fail、guidance に build command が入る                         |
| harness missing          | harness fail、`phase11-light-theme-contrast-guard.html` の欠落を示す |
| baseUrl unreachable      | baseUrl fail、localhost fallback 可否が含まれる                      |
| CLI smoke                | shared core の結果が exit code と JSON 出力へ正しく変換される        |

### タスク2: failure scenario matrix 設計

**目的**: failure bucket ごとの入力条件と期待メッセージを固定する

**行列項目**:

| Bucket  | 入力条件                        | 期待 guidance                           |
| ------- | ------------------------------- | --------------------------------------- |
| native  | worktree native binary mismatch | 修復手順と親 guard task 参照            |
| build   | `out/renderer` 未生成           | build command の再実行                  |
| harness | harness HTML 不在               | `electron.vite.config.ts` の input 確認 |
| baseUrl | URL へ HEAD 失敗                | localhost fallback または URL 修正      |

### タスク3: capture integration 検証項目

**目的**: Phase 5 で capture script へ差し込む前提を固定する

**検証項目**:

| 項目           | 検証内容                                                |
| -------------- | ------------------------------------------------------- |
| metadata       | shared core の preflight 結果が capture metadata へ入る |
| package script | preflight と screenshot の命名がそろう                  |
| stdout         | fail 時に次アクションが表示される                       |
| no-remediation | UI 色修正を trigger しない                              |

## 参照資料

| 参照資料                | パス                                                               | 説明                           |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------ |
| Phase 1 要件定義        | `phase-1-requirements.md`                                          | FR、NFR、AC                    |
| Phase 2 設計            | `phase-2-design.md`                                                | contract と test architecture  |
| Phase 3 設計レビュー    | `phase-3-design-review.md`                                         | gate 判定と指摘                |
| 現行 static server test | `../../../apps/desktop/scripts/phase11-static-server.test.ts`      | localhost fallback の既存 test |
| 現行 guard test         | `../../../apps/desktop/scripts/light-theme-contrast-guard.test.ts` | script test の文体と構造       |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | test と build の合格条件                |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | screenshot 導線の前提                   |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | build 先行と bucket 分離                |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core と CLI の test 境界         |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | guidance と blocked の期待値            |
| E2E品質          | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                            | manual test 接続を見据えた capture 品質 |

## 実行手順

### ステップ1: shared core の contract test を定義する

4 bucket、blocked、guidance、report 形式を unit test へ落とす。

### ステップ2: thin CLI wrapper の smoke test を定義する

exit code、`--json`、`--write`、stdout が shared core と矛盾しないことを確認する。

### ステップ3: capture integration の検証点を固定する

metadata、命名規則、停止条件が shared core と同じ contract を使うことを確認する。

## 統合テスト連携

- Phase 5 ではこの Phase の test case を満たす実装だけを追加する。
- Phase 6 で CLI オプションと metadata 検証を拡張し、Phase 7 で command log と突き合わせる。
- Phase 11 の手動テストでは、この Phase で定義した success と failure representative case を再利用する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                               | 主要仕様                                            |
| ------------------ | --------------------------------------------------------------------- | --------------------------------------------------- |
| アーキテクチャ     | core と CLI の test を分けて責務境界を固定する                        | `architecture-implementation-patterns.md`           |
| エラーハンドリング | bucket ごとの guidance と blocked を期待値へ落とす                    | `error-handling.md`                                 |
| 品質               | build 前提、manual test 前提、package script 命名を test 観点へ含める | `quality-requirements.md`, `quality-e2e-testing.md` |

## 成果物

| 成果物                   | パス                                                                | 内容                                      |
| ------------------------ | ------------------------------------------------------------------- | ----------------------------------------- |
| preflight core unit test | `apps/desktop/scripts/phase11-current-build-preflight-core.test.ts` | success と 4 failure case を固定する test |
| preflight CLI smoke test | `apps/desktop/scripts/phase11-current-build-preflight.test.ts`      | CLI wrapper の入出力を固定する test       |
| テスト仕様               | `outputs/phase-4/test-specification.md`                             | test case 一覧                            |
| failure 行列             | `outputs/phase-4/failure-scenario-matrix.md`                        | bucket ごとの入力と期待値                 |

## 完了条件

- [ ] success と 4 failure case の test case が定義されている
- [ ] shared core と CLI wrapper の test 境界が定義されている
- [ ] JSON 出力と exit code の期待値が定義されている
- [ ] capture integration の検証項目が定義されている
- [ ] remediation task を scope 外として維持している
- [ ] Phase 5 が test 先行で開始できる状態になっている

## 次Phase

Phase 5: 実装へ進む。
