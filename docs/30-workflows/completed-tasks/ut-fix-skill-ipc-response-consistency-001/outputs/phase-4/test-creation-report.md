# Phase 4: テスト作成レポート

## 担当

- SubAgent-A（先行テスト設計）

## 先行テスト設計（Red想定）

| テストID         | 対象                         | 期待                                                           |
| ---------------- | ---------------------------- | -------------------------------------------------------------- |
| TC-EXE-UNWRAP-01 | preload `skillAPI.execute`   | `SkillExecutionResponse` を直接返し `executionId` が取得できる |
| TC-EXE-UNWRAP-02 | renderer `useSkillExecution` | `response.success === true` 時に `executionId` が空でない      |
| TC-RM-RET-01     | preload `skillAPI.remove`    | `RemoveResult` 型の `success/removed` を返す                   |
| TC-RM-RET-02     | main-preload 契約            | remove の Main/Preload 型が一致する                            |

## 現状実装での失敗見込み

- `TC-EXE-UNWRAP-01/02`: Main の wrapper を Preload が unwrap していないため失敗見込み。
- `TC-RM-RET-01/02`: Preload 型定義 `Promise<void>` が Main `RemoveResult` と不一致のため失敗見込み。

## 実装入口（Phase 5 へ）

- 変更最小単位: `skill-api.ts` の `execute/remove` と関連型同期。
- 既存テスト基盤: `src/preload/__tests__/skill-api*.test.ts`, `src/main/ipc/__tests__/skillHandlers*.test.ts`。
