# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 6                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

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

## stub-elimination テスト作成後の拡充方針（2026-04-04 追記）

`stub-elimination.test.ts`（Phase 5 T-02）が作成・PASS した後、本 Phase で以下を追加する。

### stub-elimination.test.ts のテストケース（Phase 5 T-02 定義）

| TC    | 条件                                       | 期待結果                                  | ファイル                 |
| ----- | ------------------------------------------ | ----------------------------------------- | ------------------------ |
| TC-10 | `llmAdapter` 未注入時に `execute()` を呼ぶ | `success: false` を返す                   | stub-elimination.test.ts |
| TC-11 | `llmAdapter` 注入済みで `execute()` を呼ぶ | 正常処理される（回帰テスト）              | stub-elimination.test.ts |
| TC-12 | `plan()` で `llmAdapter` 未注入            | `success: false` を返す（既存実装の回帰） | stub-elimination.test.ts |
| TC-13 | `plan()` で `resourceLoader` 未注入        | `success: false` を返す（既存実装の回帰） | stub-elimination.test.ts |

## 実行手順

### 追加テストケース（stub-elimination PASS 後に拡充）

| TC    | 条件                                          | 期待結果                               | 対象ファイル              |
| ----- | --------------------------------------------- | -------------------------------------- | ------------------------- |
| TC-10 | `llmAdapter` と `resourceLoader` の両方が不足 | `llm_adapter_unavailable` を優先       | stub-elimination.test.ts  |
| TC-11 | unknown reason code                           | fallback message を表示                | stub-elimination.test.ts  |
| TC-12 | wizard で plan logical error                  | lifecycle と同文言を表示               | SkillCreateWizard.test.ts |
| TC-13 | transport failure                             | outer `success:false` を優先表示       | ipc.test.ts               |
| TC-14 | terminal handoff が正常に動作すること         | execute 抑止の対象にならず正常遷移する | stub-elimination.test.ts  |

### TC-14 edge case 詳細（terminal_handoff が execute 抑止対象にならないこと）

- **背景**: `plan()` が `terminal_handoff` フラグ付きで成功を返す場合は、`isRuntimePlanErrorResponse()` が `false` を返す必要がある
- **確認方法**: `plan()` のモックで `terminal_handoff: true` かつ `success: true` を返し、execute ボタンが有効であることを確認する
- **期待結果**: `isRuntimePlanErrorResponse(result)` が `false` を返し、execute 抑止が発動しないこと

## 統合テスト連携

- Phase 7 で concern と TC の coverage を照合する

## 成果物

| 成果物         | パス                                     | 説明             |
| -------------- | ---------------------------------------- | ---------------- |
| 拡張テスト仕様 | `outputs/phase-6/extended-test-cases.md` | edge case 追加分 |

## 完了条件

- [x] stub-elimination.test.ts（T-02）が作成・PASS している（Phase 5 T-02 完了が前提）
- [x] TC-10〜TC-14 の edge case が追加されている
- [x] TC-14: terminal handoff が execute 抑止対象にならないことが確認されている
- [x] wizard / lifecycle parity が確認できる
- [x] transport と logical error の優先順が固定されている
- [x] **本Phase内の全タスクを100%実行完了**
