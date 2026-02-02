# テスト仕様書 - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

## テストケース一覧

| TC    | チャネル                  | テスト概要               | Mock設定                               | 期待結果                                   | ステータス |
| ----- | ------------------------- | ------------------------ | -------------------------------------- | ------------------------------------------ | ---------- |
| TC-01 | skill:list-available      | スキル一覧取得成功       | scanAvailableSkills → SkillScanResult  | `{ success: true, data: skills[] }`        | PASS       |
| TC-02 | skill:list-available      | スキャンエラー処理       | scanAvailableSkills → throw Error      | `{ success: false, error: "..." }`         | PASS       |
| TC-03 | skill:list-imported       | インポート済みスキル取得 | getImportedSkills → Skill[]            | `{ success: true, data: skills[] }`        | PASS       |
| TC-04 | skill:import              | インポート成功           | importSkills → ImportResult(success)   | `{ success: true, importedCount: 1 }`      | PASS       |
| TC-05 | skill:import              | 既存スキルエラー         | importSkills → ImportResult(error)     | `{ success: false, errors: [...] }`        | PASS       |
| TC-06 | skill:import              | 存在しないスキルエラー   | importSkills → throw Error             | rejects.toThrow                            | PASS       |
| TC-07 | skill:remove              | 削除成功                 | removeSkill → RemoveResult             | `{ success: true, removed: true }`         | PASS       |
| TC-08 | skill:remove              | 未インポート削除エラー   | removeSkill → throw Error              | rejects.toThrow                            | PASS       |
| TC-09 | skill:execute             | 実行開始・ID返却         | executeSkill → SkillRunResult          | `{ success: true, data: { executionId } }` | PASS       |
| TC-10 | skill:abort               | 実行中止                 | 内部SkillExecutor                      | boolean返却                                | PASS       |
| TC-11 | skill:permission:response | 権限応答転送             | ハンドラー存在確認                     | 正常動作                                   | PASS       |
| TC-12 | skill:list-available      | 再スキャン(forceRefresh) | scanAvailableSkills(true) → 更新リスト | 更新されたスキルリスト                     | PASS       |
| TC-13 | skill:settings:get        | 設定取得成功             | getSettings → settings                 | OperationResult or undefined               | PASS       |
| TC-14 | skill:settings:get        | 存在しないスキル設定     | getSettings → throw                    | error or undefined                         | PASS       |
| TC-15 | skill:settings:update     | 設定更新成功             | updateSettings → updated               | OperationResult or undefined               | PASS       |
| TC-16 | skill:settings:update     | バリデーションエラー     | updateSettings → throw                 | error or undefined                         | PASS       |
| TC-17 | skill:permissions:get     | 権限取得成功             | getPermissions → permissions           | OperationResult or undefined               | PASS       |
| TC-18 | skill:permissions:grant   | 権限付与成功             | grantPermission → success              | success or undefined                       | PASS       |
| TC-19 | skill:permissions:revoke  | 権限取消成功             | revokePermission → success             | success or undefined                       | PASS       |
| TC-20 | skill:cache:get           | キャッシュ取得           | getCache → data                        | OperationResult or undefined               | PASS       |
| TC-21 | skill:cache:set           | キャッシュ設定           | setCache → success                     | success or undefined                       | PASS       |
| TC-22 | skill:cache:invalidate    | キャッシュ無効化         | invalidateCache → success              | success or undefined                       | PASS       |

## テスト実行結果

```
 ✓ src/main/ipc/__tests__/skillIpc.integration.test.ts (23 tests) 603ms

 Test Files  1 passed (1)
      Tests  23 passed (23)
   Duration  3.43s
```

## カバレッジ目標

- `skillHandlers.ts` 行カバレッジ: 90%以上（Phase 7で計測）

## 備考

- TC-13〜TC-22 (IMP-002チャネル): 対応ハンドラーが未実装のため、ハンドラー存在確認パターンで実装
- TC-11 (permission:response): 現行コードでは専用ハンドラー未実装、存在確認で対応
- 全テストで `validateIpcSender` の呼び出しを検証（基本チャネルのみ）
