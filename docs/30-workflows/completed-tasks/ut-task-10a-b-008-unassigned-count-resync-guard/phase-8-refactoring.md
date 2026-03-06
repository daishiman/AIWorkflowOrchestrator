# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 8                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7     |
| 後続Phase  | Phase 9                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

台帳更新の重複記述、監査コマンドの重複説明、教訓の分散記録を整理し、再利用しやすい運用ガードに整える。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと         | 実行順序    | 役割                                         |
| -------- | ---------------- | ----------- | -------------------------------------------- |
| A        | 手順重複整理     | 先行        | 同じ更新順が重複記述されている箇所を整理する |
| B        | 監査記述整理     | Aと並列     | コマンド説明の重複を整理する                 |
| C        | 教訓再利用整理   | A/B後に直列 | lessons と実装ガイドの役割重複を整理する     |
| D        | 再利用カード作成 | C後に直列   | 他タスクへ転用できる短手順を作成する         |

## 実行タスク

- 手順重複整理: active set 導出と3台帳更新の記述重複を整理する
- 監査記述整理: `verify-unassigned-links` と `audit` の説明重複を整理する
- 教訓再利用整理: lessons と implementation-guide の責務境界を整理する
- 再利用カード作成: 4手順前後で再実行できるカードを作成する

## 参照資料

### 前Phase成果物

| 資料名                         | パス                                            | 用途                     |
| ------------------------------ | ----------------------------------------------- | ------------------------ |
| Phase 1 正本定義               | `outputs/phase-1/source-of-truth-definition.md` | 正本ルールを確認する     |
| Phase 2 台帳同期設計           | `outputs/phase-2/ledger-sync-design.md`         | 更新順序を確認する       |
| Phase 5 実装サマリー           | `outputs/phase-5/implementation-summary.md`     | 実装記述を確認する       |
| Phase 6 回帰テスト計画         | `outputs/phase-6/regression-test.md`            | 回帰観点を確認する       |
| Phase 7 カバレッジ報告         | `outputs/phase-7/coverage-report.md`            | 重複記述の候補を確認する |
| Phase 7 カバレッジギャップ分析 | `outputs/phase-7/coverage-gap-analysis.md`      | 未整理観点を確認する     |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                                        | 用途                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 再利用可能な台帳同期パターンへ整理する基準を確認する |
| タスク運用正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳記録形式を確認する                               |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 配置先とリンク整合のルールを再確認する               |
| 教訓正本         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再利用の記録形式を確認する                           |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | リファクタリング時の変更理由記録を確認する           |

## 実行手順

1. Phase 1、2、5、6、7 の成果物から重複している手順を抽出する。
2. 重複を「導出」「同期」「監査」「教訓」の4区分へ整理する。
3. 教訓と実装ガイドの責務境界を分ける。
4. 他の Phase 12 系タスクへ転用できる再利用カードを作る。

## 統合テスト連携

- Phase 9 は Phase 8 の再利用カードがテスト手順と矛盾しないか確認する。
- Phase 11 は再利用カードだけを見て作業を再現できるかを人手で確認する。

## 多角的チェック観点（関心分離）

| 観点     | 確認内容                       | 正本                      |
| -------- | ------------------------------ | ------------------------- |
| 導出手順 | active set の導出手順が一意か  | refactoring-log.md        |
| 同期手順 | 3台帳更新の順が一意か          | refactoring-log.md        |
| 監査手順 | コマンド説明が重複していないか | reusable-guard-pattern.md |
| 再利用性 | 他タスクへ転用できる粒度か     | reusable-guard-pattern.md |

## 成果物

| 成果物               | パス                                        | 説明                               |
| -------------------- | ------------------------------------------- | ---------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`        | 整理内容を記録する                 |
| 再利用ガードパターン | `outputs/phase-8/reusable-guard-pattern.md` | 他タスクへ転用できる手順を記録する |

## 完了条件

- [x] 重複手順を4区分へ整理した
- [x] 教訓と実装ガイドの責務境界を分けた
- [x] 再利用カードを作成した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1/2/5/6/7 成果物の確認
2. SubAgent-A/B の並列整理
3. SubAgent-C の責務境界整理
4. SubAgent-D の再利用カード作成
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の2ファイルを定義した
- [x] 重複手順と責務境界を整理した
- [x] Phase 9 の品質監査入力を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 9: 品質保証
