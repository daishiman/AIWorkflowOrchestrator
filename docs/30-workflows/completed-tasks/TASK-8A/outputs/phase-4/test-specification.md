# Phase 4: テスト仕様書

## 作成日: 2026-02-02

## 概要

Phase 1ギャップ分析で特定された4件の不足テストケース（SE-02, SE-07, SE-08, PR-03）のテストスタブを既存テストファイルに追加した。全44テストケース中、40件は既存テストで完全カバー済みのため、4件の補強スタブのみを追加。

## 追加テストケース数（モジュール別）

| モジュール         | 既存カバー | 追加スタブ | 合計   |
| ------------------ | ---------- | ---------- | ------ |
| SkillScanner       | 10/10      | 0          | 10     |
| SkillImportManager | 8/8        | 0          | 8      |
| SkillExecutor      | 5/8        | 4          | 8      |
| PermissionResolver | 5/6        | 1          | 6      |
| skillSlice         | 12/12      | 0          | 12     |
| **合計**           | **40/44**  | **5**      | **44** |

注: SE-08は2つのアサーション（resolveRequest呼び出し + allowTool呼び出し）を別テストに分離したため、テスト数は5件（テストケースとしては4件）。

## 追加テストスタブ一覧

### SkillExecutor.test.ts

| テストID | テスト名                                                                | describe                 | 行番号 |
| -------- | ----------------------------------------------------------------------- | ------------------------ | ------ |
| SE-02    | should return error when skill metadata is invalid                      | execute                  | 236    |
| SE-07    | should return object with PreToolUse and PostToolUse hooks              | createHooks              | 506    |
| SE-08-a  | should call permissionResolver.resolveRequest with correct response     | handlePermissionResponse | 514    |
| SE-08-b  | should call permissionStore.allowTool when approved with rememberChoice | handlePermissionResponse | 519    |

### PermissionResolver.test.ts

| テストID | テスト名                                           | describe        | 行番号 |
| -------- | -------------------------------------------------- | --------------- | ------ |
| PR-03    | should include rememberChoice in resolved response | waitForResponse | 172    |

## Red状態確認結果

```
Test Files  2 failed (2)
     Tests  5 failed | 90 passed (95)
```

### 失敗テスト（正しくRed）

1. `SkillExecutor > execute > should return error when skill metadata is invalid` - Error: TODO: Phase 5で実装
2. `SkillExecutor > createHooks > should return object with PreToolUse and PostToolUse hooks` - Error: TODO: Phase 5で実装
3. `SkillExecutor > handlePermissionResponse > should call permissionResolver.resolveRequest with correct response` - Error: TODO: Phase 5で実装
4. `SkillExecutor > handlePermissionResponse > should call permissionStore.allowTool when approved with rememberChoice` - Error: TODO: Phase 5で実装
5. `PermissionResolver > waitForResponse > should include rememberChoice in resolved response` - Error: TODO: Phase 5で実装

### 既存テスト

90件すべて通過（PASS） - 既存テストへの影響なし。

## 完了条件チェック

- [x] Phase 1ギャップ分析で特定された全ての不足テストケースのスタブが作成されている
- [x] 追加テストスタブを含む状態でテスト実行し、追加テストが正しく失敗（Red）することを確認
- [x] 既存テストが1件も失敗していないことを確認
- [x] 各テストスタブに対応するテストケースID（SE-02等）がコメントで記載されている
- [x] テスト仕様書が `outputs/phase-4/` に生成されている
