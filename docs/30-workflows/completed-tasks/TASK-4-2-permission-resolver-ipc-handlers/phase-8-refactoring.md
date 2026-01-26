# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 8                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

動作を変えずにコード品質を改善する。重複排除、命名改善、構造整理を行う。

## 実行タスク

### Task 8-1: コードスメル検出

**チェック項目:**

| #   | コードスメル           | 対象ファイル           | 検出 | 対応 |
| --- | ---------------------- | ---------------------- | ---- | ---- |
| 1   | 重複コード             | 全実装ファイル         | -    | -    |
| 2   | 長すぎる関数           | permission-handlers.ts | -    | -    |
| 3   | 不明確な命名           | 全実装ファイル         | -    | -    |
| 4   | マジックナンバー       | 全実装ファイル         | -    | -    |
| 5   | 深いネスト             | usePermissionDialog.ts | -    | -    |
| 6   | 未使用変数/インポート  | 全実装ファイル         | -    | -    |
| 7   | 型の不整合             | 全実装ファイル         | -    | -    |
| 8   | エラーハンドリング不足 | 全実装ファイル         | -    | -    |

### Task 8-2: リファクタリング実施

**IPC Handler:**

```typescript
// Before
ipcMain.handle("skill:permission-response", async (event, response) => {
  validateIpcSender(event, mainWindow);
  permissionResolver.resolveRequest(response);
  return { success: true };
});

// After: エラーハンドリング追加
ipcMain.handle("skill:permission-response", async (event, response) => {
  try {
    validateIpcSender(event, mainWindow);
    permissionResolver.resolveRequest(response);
    return { success: true };
  } catch (error) {
    logger.error("Failed to handle permission response", { error, response });
    return { success: false, error: "Failed to process response" };
  }
});
```

**React Hook:**

```typescript
// Before: インライン定義
useEffect(() => {
  const unsubscribe = window.skillPermissionAPI.onPermissionRequest(
    (request) => {
      setPendingRequest(request);
      setIsOpen(true);
    },
  );
  return unsubscribe;
}, []);

// After: コールバック分離
const handlePermissionRequest = useCallback(
  (request: SkillPermissionRequest) => {
    setPendingRequest(request);
    setIsOpen(true);
  },
  [],
);

useEffect(() => {
  const unsubscribe = window.skillPermissionAPI.onPermissionRequest(
    handlePermissionRequest,
  );
  return unsubscribe;
}, [handlePermissionRequest]);
```

**UIコンポーネント:**

```typescript
// Before: インラインスタイル
<button className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors">

// After: 定数化
const BUTTON_STYLES = {
  base: 'px-4 py-2 rounded transition-colors',
  secondary: 'border border-border hover:bg-muted',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
} as const;
```

### Task 8-3: SOLID原則適用

**Single Responsibility Principle:**

- IPC Handler: 通信処理のみ
- Preload API: IPC橋渡しのみ
- Hook: 状態管理のみ
- Component: 表示のみ

**Open/Closed Principle:**

- 新しい権限タイプは型拡張で対応
- 新しいボタンは props で拡張可能

**Interface Segregation Principle:**

- SkillPermissionAPIインターフェースは最小限
- UsePermissionDialogReturnは必要なものだけ

### Task 8-4: テスト継続成功確認

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] 全テストが成功することを確認
# - [ ] カバレッジが維持されていることを確認
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
```

## 参照資料

| 資料名             | パス                                  | 説明          |
| ------------------ | ------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | Phase 7成果物 |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | Phase 7成果物 |

## 成果物

| 成果物               | パス                                 | 説明           |
| -------------------- | ------------------------------------ | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 変更内容の記録 |

## 完了条件

- [ ] コードスメルが検出・対応されている
- [ ] 重複コードが排除されている
- [ ] 命名が改善されている
- [ ] SOLID原則が適用されている
- [ ] テストが継続成功している
- [ ] カバレッジが維持されている
- [ ] 統合テストが継続成功している
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
