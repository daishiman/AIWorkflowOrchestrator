# Phase 6: エッジケース拡充計画

## タスクID: TASK-SW-CANCEL-004

## 追加エッジケーステスト（TC-EDGE-01〜04）

既存 `useCancelGeneration.test.ts` に追加済み：

| TC         | 観点                                                     | 期待結果                                     | 追加ファイル                           |
| ---------- | -------------------------------------------------------- | -------------------------------------------- | -------------------------------------- |
| TC-EDGE-01 | `cancelGeneration()` の二重呼び出し                      | 2 回目は副作用なく完了                       | `useCancelGeneration.test.ts`          |
| TC-EDGE-02 | `window.skillCreatorAPI` が undefined                    | 例外 throw なし                              | 既存 TC-UT-04 / TC-E2E-04 でカバー済み |
| TC-EDGE-03 | `startGeneration()` なしで `cancelGeneration()`          | 例外 throw なし（AbortController null 安全） | 既存 TC-UT-04 でカバー済み             |
| TC-EDGE-04 | `cancelGeneration()` 後に `startGeneration()` 再呼び出し | 新しい AbortController が生成される          | `useCancelGeneration.test.ts`          |

## 回帰テスト（Pattern B 適用分）

Pattern B（startGeneration 追加）に対応する回帰テスト：

- TC-CH-01: `channels.ts` に `SKILL_CREATOR_CANCEL` が含まれること → コード確認済み（PASS）
- TC-E2E-02: `startGeneration()` → `cancelGeneration()` で signal.aborted が true → E2E テストでカバー済み

## 追加テスト実装

`useCancelGeneration.test.ts` に TC-EDGE-01 と TC-EDGE-04 を追加。
