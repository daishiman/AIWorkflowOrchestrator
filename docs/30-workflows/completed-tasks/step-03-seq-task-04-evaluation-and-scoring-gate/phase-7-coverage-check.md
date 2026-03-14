# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 7                       |
| Phase名    | カバレッジ確認          |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 5, 6              |
| 後続Phase  | Phase 8                 |

## 目的

評価計算、ゲート判定、導線分岐、再評価ループのテスト網羅を可視化する。

## 実行タスク

- タスク1: concern×test のカバレッジマトリクスを作成する。
- タスク2: 欠落観点を抽出し追加テスト候補を作成する。
- タスク3: Task03/05 連携観点の網羅率を確認する。
- タスク4: aiworkflow 参照仕様との検証観点整合を確認する。

## 参照資料

| 参照資料        | パス                                                                         | 目的                     |
| --------------- | ---------------------------------------------------------------------------- | ------------------------ |
| カバレッジ基準  | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 目標値確認               |
| テスト戦略      | `./phase-4-test-creation.md`                                                 | 計画観点確認             |
| テスト拡充      | `./phase-6-test-expansion.md`                                                | 拡充観点確認             |
| 仕様抽出マップ  | `./aiworkflow-requirements-extraction.md`                                    | 仕様観点照合             |
| 依存Phase成果物 | phase-5-implementation.md（Phase 5）, phase-6-test-expansion.md（Phase 6）   | Phase 5/6 の成果物を参照 |

## 実行手順

1. 評価・ゲート・導線・再評価の4軸でテスト観点を並べる。
2. 各観点に対してテストIDと実行結果をひも付ける。
3. 欠落観点を列挙し、追加先フェーズを決める。
4. カバレッジ結果を Phase 8 へ引き渡す。

## 統合テスト連携

- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run --coverage`
- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`
- 出力: concern×test×result の coverage matrix。

## 多角的チェック観点（AIが判断）

- 要件IDごとにテストIDが存在するか。
- 導線分岐に未検証経路が残っていないか。
- エラー経路の検証が足りているか。

## サブタスク管理

| SubAgent   | 責務           | 実行方式 | 出力                      |
| ---------- | -------------- | -------- | ------------------------- |
| SubAgent-A | テスト実行集計 | 並列     | test-execution-summary.md |
| SubAgent-B | coverage解析   | 並列     | coverage-matrix.md        |
| SubAgent-C | 欠落観点抽出   | 並列     | coverage-gap-list.md      |

## 成果物

| 成果物         | パス                                 | 内容             |
| -------------- | ------------------------------------ | ---------------- |
| カバレッジ仕様 | `./phase-7-coverage-check.md`        | 監査手順         |
| カバレッジ報告 | `outputs/phase-7/coverage-report.md` | 網羅率と欠落観点 |

## 完了条件

- [x] concern×test マトリクスが作成されている
- [x] 欠落観点が列挙されている
- [x] 追加先フェーズが決まっている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 8（リファクタリング）で重複と責務混線を解消する。
