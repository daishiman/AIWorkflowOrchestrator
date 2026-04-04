# Phase 7: テストカバレッジ確認 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-RT-04                |
| Phase      | 7 - テストカバレッジ確認  |
| 前提Phase  | Phase 6（テスト拡充）完了 |
| 関連Issue  | #1881                     |
| ステータス | pending                   |

## 目的

AC-1〜AC-6 の全項目に対するテストカバレッジを確認し、不足があれば補完する。

## 実行タスク

- AC-1〜AC-6 とテストケースの対応表を作成する
- coverage report を確認する
- 不足ケースを Phase 6 へ戻す

## 参照資料

| 資料名             | パス                                                     | 説明       |
| ------------------ | -------------------------------------------------------- | ---------- |
| Phase 6 テスト拡充 | [phase-06-test-expansion.md](phase-06-test-expansion.md) | 追加ケース |
| Phase 5 実装       | [phase-05-implementation.md](phase-05-implementation.md) | 実装対象   |

## 統合テスト連携

- coverage の不足があれば Phase 6 の regression guard を補う
- Main / Preload / Renderer の 3 層整合を維持する

## 成果物

| 成果物             | パス                               |
| ------------------ | ---------------------------------- |
| カバレッジレポート | outputs/phase-7/coverage-report.md |

## 完了条件

- [ ] AC-1〜AC-6 の全項目がテストでカバーされている
- [ ] カバレッジが十分である
- [ ] 本Phase内の全タスクを100%実行完了
