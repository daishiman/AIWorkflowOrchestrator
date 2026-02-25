# Phase 11 手動テスト結果

## 実行シナリオ

| シナリオ                    | 期待                          | 結果 |
| --------------------------- | ----------------------------- | ---- |
| 対象監査（`--target-file`） | current違反0で exit 0         | PASS |
| 全体監査（scope未指定）     | baseline含む全体違反で exit 1 | PASS |
| 異常入力（無効target）      | exit 2                        | PASS |

## 運用判定

- 「対象→全体」の順序で、今回変更分合否と既存負債監視を分離して運用可能。

## 証跡

- `outputs/phase-11/command-transcript.log`
