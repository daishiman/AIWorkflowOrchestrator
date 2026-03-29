# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 6                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

edge case と UI parity を追加し、再発しやすい契約ドリフトを塞ぐ。

## 実行タスク

- 両依存欠如時の優先 reason code を固定する
- unknown reason code fallback を追加する
- wizard / lifecycle parity テストを追加する
- handoff / transport failure 境界テストを追加する

## 参照資料

| 資料名         | パス                                        | 説明           |
| -------------- | ------------------------------------------- | -------------- |
| Phase 4 テスト | `phase-4-test-creation.md`                  | 基本マトリクス |
| shared types   | `packages/shared/src/types/skillCreator.ts` | union shape    |

## 実行手順

### 追加テストケース

| TC    | 条件                                          | 期待結果                         |
| ----- | --------------------------------------------- | -------------------------------- |
| TC-10 | `llmAdapter` と `resourceLoader` の両方が不足 | `llm_adapter_unavailable` を優先 |
| TC-11 | unknown reason code                           | fallback message を表示          |
| TC-12 | wizard で plan logical error                  | lifecycle と同文言を表示         |
| TC-13 | transport failure                             | outer `success:false` を優先表示 |
| TC-14 | terminal handoff                              | execute 抑止対象にしない         |

## 統合テスト連携

- Phase 7 で concern と TC の coverage を照合する

## 成果物

| 成果物         | パス                                     | 説明             |
| -------------- | ---------------------------------------- | ---------------- |
| 拡張テスト仕様 | `outputs/phase-6/extended-test-cases.md` | edge case 追加分 |

## 完了条件

- [ ] edge case が追加されている
- [ ] wizard / lifecycle parity が確認できる
- [ ] transport と logical error の優先順が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**
