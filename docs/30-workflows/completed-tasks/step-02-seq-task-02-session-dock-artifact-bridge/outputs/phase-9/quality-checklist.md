# Quality Checklist - Session Dock Artifact Bridge

## 1. State 一貫性

| チェック項目                               | 結果 | 詳細                                               |
| ------------------------------------------ | ---- | -------------------------------------------------- |
| 8 state 全てに entry/exit 条件がある       | PASS | session-state-contract.md で定義                   |
| 全 state から collapsed への遷移パスがある | PASS | running のみ中止経由だが設計意図が明記済み (MN-01) |
| 既存 state との統合マッピングに矛盾がない  | PASS | design-summary.md で定義                           |
| computed selector が P31 準拠              | PASS | 個別セレクタパターンで設計 (MN-02)                 |
| 配列セレクタが P48 準拠 (useShallow)       | PASS | implementation-plan.md で明記                      |

## 2. Share 監査可能性

| チェック項目                                    | 結果 | 詳細                                      |
| ----------------------------------------------- | ---- | ----------------------------------------- |
| MB-1 (auto-send 禁止) が設計で担保              | PASS | 全操作が user click トリガー              |
| MB-2 (hidden injection 禁止) が設計で担保       | PASS | payload は可視テキストのみ                |
| MB-3 (headless execution 禁止) が設計で担保     | PASS | dock UI 経由のみ                          |
| MB-4 (credential passthrough 禁止) が設計で担保 | PASS | sanitizeForShare ロジック設計済み (MN-04) |
| Provenance Chip で出典追跡可能                  | PASS | source/sharedAt/inspect 3 フィールド      |
| Share 操作が audit trail に記録される           | PASS | shareHistory に ShareRecord を記録        |

## 3. Restore 安定性

| チェック項目                                   | 結果 | 詳細                             |
| ---------------------------------------------- | ---- | -------------------------------- |
| restore 失敗時のフォールバック                 | PASS | ready state + エラー通知         |
| 壊れたデータの restore 対策                    | PASS | EDGE-PER-01 テストケース定義済み |
| 存在しない session の restore 対策             | PASS | EDGE-PER-02 テストケース定義済み |
| restore と新規 guidance のレースコンディション | PASS | EDGE-PER-03 テストケース定義済み |
| running session の cleanup 除外                | PASS | MN-05 で明記済み                 |

## 4. Artifact Priority

| チェック項目                         | 結果 | 詳細                                      |
| ------------------------------------ | ---- | ----------------------------------------- |
| primary surface が Artifact Summary  | PASS | 表示順序 [1]                              |
| transcript が折りたたみ配置          | PASS | 表示順序 [3] (折りたたみ)                 |
| empty artifact の表示                | PASS | 「成果物はありません」+ transcript リンク |
| error summary が done/aborted で表示 | PASS | session-state-contract.md で定義          |
| 4 グループ分類で表示ロジック簡素化   | PASS | refactor-boundaries.md で定義             |
