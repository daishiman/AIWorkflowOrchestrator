# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 11                                        |
| 機能名 | claude-sdk-message-contract-normalization |
| 作成日 | 2026-03-29                                |

## 目的

UI 非変更タスクとして、視覚差分は N/A 判定にしつつ runtime 導線の非回帰を手動確認する。

## 実行タスク

- plan error 導線確認
- execute success 導線確認
- terminal handoff 導線確認
- execute failure review 戻し確認

## 成果物

| 成果物                | パス                                        |
| --------------------- | ------------------------------------------- |
| manual test result    | `outputs/phase-11/manual-test-result.md`    |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     |

## 完了条件

- [x] 手動確認が完了している
- [x] 本Phase内の全タスクを100%実行完了
