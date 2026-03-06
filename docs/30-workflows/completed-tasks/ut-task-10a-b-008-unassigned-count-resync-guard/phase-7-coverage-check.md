# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 7                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 5, Phase 6                                |
| 後続Phase  | Phase 8                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

active set 導出、3台帳同期、監査判定の3領域が回帰束で網羅されているかを確認し、未カバー領域を列挙する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと              | 実行順序    | 役割                                 |
| -------- | --------------------- | ----------- | ------------------------------------ |
| A        | active set カバレッジ | 先行        | 導出ケースの網羅率を確認する         |
| B        | 台帳同期カバレッジ    | Aと並列     | 3台帳の一致ケース網羅率を確認する    |
| C        | 監査カバレッジ        | A/B後に直列 | link 検証と audit の網羅率を確認する |
| D        | ギャップ分析          | C後に直列   | 未カバー領域と追加対応を列挙する     |

## 実行タスク

- active set カバレッジ算出: 完了除外、追加反映、件数一致のケース網羅率を算出する
- 台帳同期カバレッジ算出: detection、workflow、UI仕様の3台帳を対象に網羅率を算出する
- 監査カバレッジ算出: `verify-unassigned-links` と `audit` の期待値分岐網羅率を算出する
- ギャップ整理: 未カバー観点を追加課題として整理する

## 参照資料

### 前Phase成果物

| 資料名                 | パス                                        | 用途                 |
| ---------------------- | ------------------------------------------- | -------------------- |
| Phase 5 実装サマリー   | `outputs/phase-5/implementation-summary.md` | 変更観点を確認する   |
| Phase 6 テスト拡充結果 | `outputs/phase-6/test-expansion-result.md`  | 追加ケースを確認する |
| Phase 6 回帰テスト計画 | `outputs/phase-6/regression-test.md`        | 回帰束を確認する     |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                          | 用途                                  |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| タスク運用正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | 3台帳の期待行数と更新対象を確認する   |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`    | coverage 判定に使う配置規則を確認する |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | カバレッジ報告の粒度を確認する        |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | カバレッジ差分の記録方法を確認する    |
| 教訓正本         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 既知の見落としを確認する              |

## 実行手順

1. Phase 5 の変更観点と Phase 6 の回帰ケースを対応付ける。
2. active set、3台帳、監査の3領域ごとにカバレッジ表を作る。
3. 未カバー領域は原因と追加手段をセットで書く。
4. Phase 8 が参照できるギャップ一覧を出力する。

## 統合テスト連携

- Phase 8 は Phase 7 のギャップ一覧を使って重複記述と検証漏れを削る。
- Phase 11 はギャップゼロか、残ギャップが意図的保留かを確認する。

## 多角的チェック観点（関心分離）

| 観点     | 確認内容                                       | 正本                     |
| -------- | ---------------------------------------------- | ------------------------ |
| 導出網羅 | active set の主要分岐をカバーしているか        | coverage-report.md       |
| 同期網羅 | 3台帳の更新分岐をカバーしているか              | coverage-report.md       |
| 監査網羅 | link 検証と audit の主要分岐をカバーしているか | coverage-gap-analysis.md |
| ギャップ | 未カバー観点が放置されていないか               | coverage-gap-analysis.md |

## 成果物

| 成果物                 | パス                                       | 説明                   |
| ---------------------- | ------------------------------------------ | ---------------------- |
| カバレッジ報告         | `outputs/phase-7/coverage-report.md`       | カバレッジを記録する   |
| カバレッジギャップ分析 | `outputs/phase-7/coverage-gap-analysis.md` | 未カバー領域を記録する |

## 完了条件

- [x] active set、3台帳、監査の3領域を採点した
- [x] 未カバー領域を列挙した
- [x] Phase 8 が参照できるギャップ一覧を出力した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 5/6 成果物の確認
2. SubAgent-A/B の並列算出
3. SubAgent-C の監査算出
4. SubAgent-D のギャップ分析
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の2ファイルを定義した
- [x] 3領域のカバレッジを算出した
- [x] ギャップを Phase 8 へ引き継いだ

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 8: リファクタリング
