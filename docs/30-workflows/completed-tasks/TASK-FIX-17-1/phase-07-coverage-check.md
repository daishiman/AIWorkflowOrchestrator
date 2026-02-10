# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                 |
| --------- | ---------------------------------- |
| Phase     | 7                                  |
| タスクID  | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名  | skill:scan IPCハンドラーの新規追加 |
| 作成日    | 2026-02-08                         |
| 前提Phase | Phase 6（テスト拡充）              |

## 目的

テストカバレッジが基準を満たしていることを確認する。未達の場合は Phase 6 に戻りテストを追加する。

---

## 実行タスク

### Task 1: カバレッジ計測

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**確認コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# または特定ファイルのカバレッジ確認
pnpm --filter @repo/desktop test:coverage -- --grep "skillHandlers"
```

### Task 2: カバレッジ基準確認

**カバレッジ基準（プロジェクト標準）**:

| 指標              | 最低基準 | 推奨基準 | 判定             |
| ----------------- | -------- | -------- | ---------------- |
| Line Coverage     | 80%      | 90%      | 最低基準達成必須 |
| Branch Coverage   | 60%      | 70%      | 最低基準達成必須 |
| Function Coverage | 80%      | 90%      | 最低基準達成必須 |

### Task 3: skill:scan ハンドラーのカバレッジ確認

**対象コード行**:

```typescript
// skill:scan - スキルの強制再スキャン (約15行)
ipcMain.handle(IPC_CHANNELS.SKILL_SCAN, async (event: IpcMainInvokeEvent) => {
  const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_SCAN, {
    // Line 1
    getAllowedWindows: () => [mainWindow], // Line 2
  });
  if (!validation.valid) {
    // Branch 1
    throw toIPCValidationError(validation); // Line 3
  }
  try {
    // Line 4
    const result = await skillService.scanAvailableSkills(true); // Line 5
    return { success: true, data: result.skills }; // Line 6
  } catch (error) {
    // Branch 2
    return {
      // Line 7
      success: false,
      error: error instanceof Error ? error.message : "スキャンに失敗しました", // Branch 3-4
    };
  }
});
```

**テストによるカバレッジ対応**:

| コード箇所            | カバーするテスト                       |
| --------------------- | -------------------------------------- |
| Line 1-2 (validation) | SH-SC-05, SH-SC-08, SH-SC-11, SH-SC-12 |
| Branch 1 (invalid)    | SH-SC-08, SH-SC-11, SH-SC-12           |
| Line 3 (throw)        | SH-SC-08, SH-SC-11, SH-SC-12           |
| Line 4-6 (success)    | SH-SC-02, SH-SC-03, SH-SC-06, SH-SC-07 |
| Branch 2 (catch)      | SH-SC-04, SH-SC-09                     |
| Line 7 (error return) | SH-SC-04, SH-SC-09                     |
| Branch 3 (Error)      | SH-SC-04                               |
| Branch 4 (non-Error)  | SH-SC-09                               |

### Task 4: unregister のカバレッジ確認

**対象コード行**:

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCAN); // Line 1
```

**テストによるカバレッジ対応**:

| コード箇所             | カバーするテスト |
| ---------------------- | ---------------- |
| removeHandler 呼び出し | SH-SC-10         |

---

## カバレッジレポート出力

### 期待されるレポート形式

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
skillHandlers.ts      |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
  skill:scan handler  |   100.0 |    100.0 |   100.0 |   100.0 |
----------------------|---------|----------|---------|---------|
```

### 確認ポイント

| No  | 確認項目                             | 判定基準    |
| --- | ------------------------------------ | ----------- |
| 1   | Line Coverage が 80% 以上            | PASS / FAIL |
| 2   | Branch Coverage が 60% 以上          | PASS / FAIL |
| 3   | Function Coverage が 80% 以上        | PASS / FAIL |
| 4   | skill:scan 関連の未カバー行がない    | PASS / FAIL |
| 5   | 新規追加コードのカバレッジ低下がない | PASS / FAIL |

---

## 参照資料

| 資料名           | パス                                                       | 説明           |
| ---------------- | ---------------------------------------------------------- | -------------- |
| Phase 6成果物    | `phase-outputs/TASK-FIX-17-1/phase-06-test-enhancement.md` | テスト拡充仕様 |
| コード品質ルール | `.claude/rules/02-code-quality.md`                         | カバレッジ基準 |

---

## ゲート判定

### カバレッジ基準達成の場合

**判定**: PASS → Phase 8（リファクタリング）へ進む

### カバレッジ基準未達の場合

**判定**: FAIL → Phase 6（テスト拡充）に戻る

**未達時の対応**:

1. 未カバーの行・分岐を特定
2. 追加テストケースを設計
3. Phase 6 でテストを追加
4. Phase 7 で再度カバレッジ確認

---

## 成果物

| 成果物             | パス                                                     | 説明                       |
| ------------------ | -------------------------------------------------------- | -------------------------- |
| カバレッジレポート | `coverage/lcov-report/index.html`                        | HTMLレポート               |
| カバレッジサマリー | `phase-outputs/TASK-FIX-17-1/phase-07-coverage-check.md` | 本ドキュメント（結果追記） |

---

## 完了条件

- [ ] カバレッジ計測コマンドが実行されている
- [ ] Line Coverage が 80% 以上を達成
- [ ] Branch Coverage が 60% 以上を達成
- [ ] Function Coverage が 80% 以上を達成
- [ ] skill:scan ハンドラーの全行がカバーされている
- [ ] 未カバー行がある場合、Phase 6 に戻り対応済み

---

## 確認コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのカバレッジ詳細確認
pnpm --filter @repo/desktop test:coverage -- --reporter=verbose

# HTMLレポート確認（ブラウザで開く）
open apps/desktop/coverage/lcov-report/index.html
```

---

## 次のPhase

- **カバレッジ基準達成**: Phase 8: リファクタリング
- **カバレッジ基準未達**: Phase 6: テスト拡充（再実施）
