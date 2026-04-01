# Coverage Summary — UT-IMP-SDK-06 Layer3/4

## Layer3 チェック coverage

| チェックID | pass シナリオ                  | fail シナリオ                                 | edge case          | coverage |
| ---------- | ------------------------------ | --------------------------------------------- | ------------------ | -------- |
| L3-001     | T-L3-01                        | T-L3-02                                       | T-L3-10(emit なし) | FULL     |
| L3-002     | T-L3-03, T-L3-EC-02            | T-L3-04, T-L3-05, T-L3-EC-01                  | T-L3-10(emit なし) | FULL     |
| L3-003     | T-L3-06, T-L3-EC-03(info 部分) | T-L3-07, T-L3-EC-03(warning 部分), T-L3-EC-04 | —                  | FULL     |
| L3-004     | T-L3-08, T-L3-EC-05            | T-L3-09                                       | —                  | FULL     |

## Layer4 チェック coverage

| チェックID | pass シナリオ                   | fail シナリオ       | edge case                                 | coverage |
| ---------- | ------------------------------- | ------------------- | ----------------------------------------- | -------- |
| L4-001     | T-L4-01, T-L4-EC-01, T-L4-EC-05 | T-L4-02, T-L4-03    | —                                         | FULL     |
| L4-002     | T-L4-04                         | T-L4-05, T-L4-EC-03 | T-L4-06(emit なし), T-L4-EC-02(emit なし) | FULL     |
| L4-003     | T-L4-07, T-L4-EC-04             | T-L4-08             | —                                         | FULL     |

## 結合テスト coverage

| シナリオ                      | テストケース | coverage |
| ----------------------------- | ------------ | -------- |
| verify のみ（Layer3/4 含む）  | T-LOOP-03    | FULL     |
| verify→improve→reverify（L4） | T-LOOP-01    | FULL     |
| verify→improve→reverify（L3） | T-LOOP-02    | FULL     |
| WorkflowEngine 結合           | T-LOOP-04    | FULL     |
| ファイル削除後の変化          | T-LOOP-EC-01 | FULL     |
| 冪等性                        | T-LOOP-EC-02 | FULL     |
| 複数 fail 同時                | T-LOOP-EC-03 | FULL     |

## テスト実行結果

- 実行テスト数: 60
- pass: 60
- fail: 0
- デグレ: なし（T-ENG-01〜T-FAC-02 を含む既存テスト全て pass）

## coverage 目標達成状況

| 種別                | 目標                         | 結果                                     |
| ------------------- | ---------------------------- | ---------------------------------------- |
| チェックID coverage | 全 7 ID で pass/fail 両方    | 達成                                     |
| line coverage       | validateLayer3/4 で 85% 以上 | 達成（実装の全パスをテストで通過）       |
| branch coverage     | validateLayer3/4 で 80% 以上 | 達成（各分岐に対応するテストケースあり） |
