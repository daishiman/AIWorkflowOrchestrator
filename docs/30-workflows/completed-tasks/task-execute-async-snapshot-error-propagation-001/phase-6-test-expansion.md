# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 6                                                 |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

Phase 5 で最小修正が発生した場合だけ、追加テストを補う。

## 実行タスク

- Task 6-1: 追加テスト要否判定
- Task 6-2: 必要時のみテスト追加
- Task 6-3: no-op 理由の記録

## 参照資料

| 資料名         | パス                                                                                              | 説明           |
| -------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| Phase 5 成果物 | `outputs/phase-5/implementation-notes.md`                                                         | 修正有無の確認 |
| runtime テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 追加対象       |

## 追加候補

| テストID | 条件                                           | 優先度 |
| -------- | ---------------------------------------------- | ------ |
| T-EA-06  | relay まわりに追加修正が入った場合             | MEDIUM |
| T-EA-07  | 型変更が public/shared contract へ波及した場合 | MEDIUM |

## 成果物

| 成果物         | 配置先                              |
| -------------- | ----------------------------------- |
| テスト拡充メモ | `outputs/phase-6/test-expansion.md` |

## 完了条件

- [ ] 追加テストの必要有無を明記した
- [ ] 不要なら no-op 理由を残した

## 次Phase

→ [Phase 7: カバレッジ確認](phase-7-coverage-check.md)
