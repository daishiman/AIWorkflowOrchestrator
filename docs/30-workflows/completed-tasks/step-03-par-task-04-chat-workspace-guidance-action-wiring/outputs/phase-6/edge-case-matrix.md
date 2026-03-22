# Phase 6: 境界ケース一覧

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 6                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 未検証境界ケース

| EC-ID | 境界ケース                                        | 期待動作                                            | 優先度 |
| ----- | ------------------------------------------------- | --------------------------------------------------- | ------ |
| EC-01 | blockedReason が undefined（型外の値）            | TypeScript 型エラーで防止                           | 低     |
| EC-02 | GuidanceBlock に actionLabel あり / onAction なし | ボタン非表示（AND ガード）                          | 必須   |
| EC-03 | GuidanceBlock に actionLabel なし / onAction あり | ボタン非表示（AND ガード）                          | 必須   |
| EC-04 | clipboard API が利用不可能な環境                  | copyCommand が graceful に失敗                      | 推奨   |
| EC-05 | Settings 遷移後に即座に Chat に戻った場合         | GuidanceBlock が再表示（reason 未解消のため）       | 必須   |
| EC-06 | 2つの surface が同時に異なる reason を持つ場合    | 各 surface が自身の reason に対応する guidance 表示 | 推奨   |
| EC-07 | reason が高速に切り替わった場合（race condition） | 最後の reason に対応する guidance が表示            | 推奨   |
