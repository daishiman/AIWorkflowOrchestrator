# Phase 11: 手動テストチェックリスト

## タスクID

TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## 判定

NON_VISUAL

## チェック項目

| ID   | 確認内容                                                    | 期待結果                                                   | 結果 |
| ---- | ----------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| SC-A | `apps/desktop/src/__tests__/utils/cronConverter` を実行する | 既存テストと空曜日ケースが全件 PASS                        | PASS |
| SC-B | `cronConverter.ts` のガード処理を確認する                   | `weekdays.length === 0` で空文字に退避する                 | PASS |
| SC-C | 正常ケースを確認する                                        | `weekdays` に値がある weekly / daily ケースが変わらず PASS | PASS |
| SC-D | エッジケース単体を確認する                                  | `cronConverter.edge.test.ts` の空曜日ケースが PASS         | PASS |
| SC-E | 視覚確認の要否を判定する                                    | UI 変更なしのためスクリーンショット不要                    | PASS |

## 補足

- 証跡は CLI 出力と既存成果物で足りる
- 目視確認は不要
