# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 7                                                        |
| Phase名    | カバレッジ確認                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 機能名     | chat-platform-unification                                |
| 前提Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| 後続Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)       |
| ステータス | completed                                                |
| 作成日     | 2026-03-11                                               |

## 目的

Task02 の共通ロジックと mode adapter の両方が十分に検証されているか確認する。

## 確認項目

- セッション生成
- ストリーム購読
- 文脈 adapter
- mode 切替
- Task03 public contract

## 実行タスク

- coverage 集計: 共通ロジックと mode adapter を別観点で集計する
- traceability 作成: AC とテストを対応付ける
- uncovered cases 整理: 未検証箇所を Phase 8 へ引き継ぐ

## 参照資料

| 参照資料                   | パス                                          | 内容            |
| -------------------------- | --------------------------------------------- | --------------- |
| 境界ケーステストマトリクス | `outputs/phase-6/edge-case-test-matrix.md`    | edge case 一覧  |
| 回帰ケース一覧             | `outputs/phase-6/regression-case-matrix.md`   | 回帰ケース      |
| Task03 failure 契約一覧    | `outputs/phase-6/task03-failure-contracts.md` | downstream 契約 |
| 実装ログ                   | `outputs/phase-5/implementation-log.md`       | 検証対象コード  |
| 変更ファイルマトリクス     | `outputs/phase-5/change-file-matrix.md`       | coverage 範囲   |

## 実行手順

1. 共通ロジックと mode adapter を別観点で coverage 集計する。
2. requirement traceability を作成し、AC とテストをひも付ける。
3. 未検証箇所があれば uncovered cases として記録し、Phase 8 へ引き継ぐ。

## 統合テスト連携

| 観点            | 連携内容                                                             |
| --------------- | -------------------------------------------------------------------- |
| line / branch   | `chatSlice` / `useStreamingChat` / handoff UI の粒度で検証密度を確認 |
| traceability    | AC と targeted tests の対応を final review へ引き継ぐ                |
| uncovered cases | 未検証箇所を Phase 8 の refactor 対象として固定する                  |

## 成果物

| 成果物               | パス                                          | 説明                |
| -------------------- | --------------------------------------------- | ------------------- |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`          | coverage 要約       |
| 要件トレーサビリティ | `outputs/phase-7/requirement-traceability.md` | AC とテストの対応表 |
| 未検証ケース一覧     | `outputs/phase-7/uncovered-cases.md`          | coverage gap        |

## 完了条件

- [x] 共通ロジック偏重や adapter 未検証がない
- [x] AC とテストの対応が確認できる
- [x] 未検証箇所が Phase 8 に引き継げる
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- 後続: [phase-8-refactoring.md](./phase-8-refactoring.md)

## サブタスク管理

- [x] coverage 集計
- [x] traceability 作成
- [x] uncovered cases 整理

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 共通基盤と adapter の両方が coverage レポートに現れている
- [x] Task03 public contract の検証状況が確認できる

## 次のPhase

Phase 8: [phase-8-refactoring.md](./phase-8-refactoring.md)
