# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 6                                         |
| 機能名 | claude-sdk-message-contract-normalization |
| 作成日 | 2026-03-29                                |

## 目的

中断、permission denial、resume 時の再開などの edge case を追加検証する。

## 実行タスク

- cancellation / timeout ケースを追加する
- permission denial ケースを追加する
- resumed session ケースを追加する

## 参照資料

| 資料名  | パス                       | 説明       |
| ------- | -------------------------- | ---------- |
| Phase 4 | `phase-4-test-creation.md` | 基本テスト |

## 成果物

| 成果物               | パス                                      | 説明       |
| -------------------- | ----------------------------------------- | ---------- |
| extended test record | `outputs/phase-6/extended-test-record.md` | 拡張テスト |

## 完了条件

- [ ] edge case が追加されている
- [ ] **本Phase内の全タスクを100%実行完了**
