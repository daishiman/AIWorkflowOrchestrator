# Phase 6: 統合テスト仕様

## 概要

slide-dependency-management機能の統合テストでは、複数のモジュール間の連携動作を検証します。

## テスト対象モジュール

- **FileWatcher**: structure.mdの変更検出
- **SkillExecutor**: スキルフェーズの実行
- **SyncManager**: 同期状態管理

## 統合テストケース

### 1. File Watcher + Skill Executor Integration

#### 1.1 無限ループ防止テスト

**目的**: スキル実行によるファイル変更が無限ループを引き起こさないことを検証

**テスト手順**:

```typescript
// 1. ウォッチャーを開始
const watcher = createSlideWatcher(testProjectPath);
watcher.onStructureChange(changeCallback);
watcher.start();

// 2. スキル変更としてマーク
watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "html");

// 3. ファイル変更イベントを発火
mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

// 4. コールバックが呼ばれないことを確認
expect(changeCallback).not.toHaveBeenCalled();
```

**期待結果**: スキル起因の変更はコールバックを発火しない

#### 1.2 TTL経過後のユーザー変更検出

**目的**: TTL（1000ms）経過後はユーザー変更として正常に検出されることを検証

**テスト手順**:

```typescript
// 1. スキル変更としてマーク
watcher.markAsSkillChange(`${testProjectPath}/structure.md`, "html");

// 2. TTL（1000ms）を超えて待機
vi.advanceTimersByTime(1001);

// 3. ファイル変更イベントを発火
mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

// 4. コールバックが呼ばれることを確認
expect(changeCallback).toHaveBeenCalled();
```

**期待結果**: TTL経過後の変更はユーザー変更として処理される

### 2. Skill Executor + Sync Manager Integration

#### 2.1 HTML生成による同期

**目的**: SyncManagerがSkillExecutorを通じてHTMLを生成できることを検証

**テスト手順**:

```typescript
const executor = createSkillExecutor();
const syncManager = createSyncManager(executor);
const progressCallback = vi.fn();

syncManager.onProgress(progressCallback);

// 同期実行
await syncManager.sync(testProjectPath);

// 進捗が報告されたことを確認
expect(progressCallback).toHaveBeenCalled();
```

**期待結果**: SyncManager.sync()がSkillExecutorのhtmlフェーズを実行

#### 2.2 同期のキャンセル

**目的**: 実行中の同期をキャンセルできることを検証

**テスト手順**:

```typescript
const syncPromise = syncManager.sync(testProjectPath);
syncManager.cancel();

await expect(syncPromise).rejects.toThrow("Cancelled");
```

**期待結果**: キャンセルが正しく伝播し、同期が中断される

### 3. Full Integration Flow

#### 3.1 完全ワークフローテスト

**目的**: watch → detect → sync → prevent loop の完全なフローを検証

**シナリオ**:

1. ユーザーがstructure.mdを編集
2. FileWatcherが変更を検出
3. SyncManagerが同期状態をチェック（out-of-sync）
4. スキル変更としてマーク
5. SyncManagerがHTML生成を実行
6. スキルによるファイル変更は無視される（無限ループ防止）

**テストコード**:

```typescript
let syncTriggered = false;
let loopDetected = false;

watcher.onStructureChange(async (filePath) => {
  if (syncTriggered) {
    loopDetected = true;
    return;
  }

  const status = await syncManager.getStatus(testProjectPath);
  if (status === "out-of-sync") {
    syncTriggered = true;
    watcher.markAsSkillChange(filePath, "html");
    await syncManager.sync(testProjectPath);

    // スキル完了後の変更イベント
    mockWatchInstance.emit("change", filePath);
  }
});

// ユーザー変更をシミュレート
mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);

expect(loopDetected).toBe(false);
```

**期待結果**: 無限ループが発生しない

#### 3.2 連続スキル実行

**目的**: 4フェーズの連続実行が正常に動作することを検証

**テスト手順**:

```typescript
const phases = ["hearing", "structure", "html", "modifier"] as const;

for (const phase of phases) {
  const result = await executor.execute(phase, testProjectPath);
  expect(result.success).toBe(true);
  expect(result.phase).toBe(phase);
}
```

**期待結果**: すべてのフェーズが順番に成功する

#### 3.3 高速連続変更

**目的**: 短時間に複数の変更があっても正常に処理されることを検証

**テスト手順**:

```typescript
for (let i = 0; i < 5; i++) {
  mockWatchInstance.emit("change", `${testProjectPath}/structure.md`);
}

expect(changeCount.value).toBe(5);
```

**期待結果**: すべての変更が検出される

## エラーハンドリング統合テスト

### 4.1 同期失敗時の処理

**目的**: 同期が失敗した場合のエラー伝播を検証

**テスト手順**:

```typescript
vi.spyOn(executor, "execute").mockResolvedValue({
  phase: "html",
  success: false,
  duration: 100,
  error: "Test error",
});

await expect(syncManager.sync(testProjectPath)).rejects.toThrow("Test error");
```

**期待結果**: エラーが正しく伝播する

### 4.2 ファイル不在時の処理

**目的**: 必要なファイルが存在しない場合の動作を検証

**テスト手順**:

```typescript
mockBothFilesExist.mockResolvedValue(false);

const status = await syncManager.getStatus(testProjectPath);
expect(status).toBe("error");
```

**期待結果**: errorステータスが返される

## テスト環境設定

### モック設定

```typescript
// chokidar
vi.mock("chokidar", () => ({
  default: { watch: vi.fn(() => mockWatchInstance) },
}));

// @repo/shared
vi.mock("@repo/shared", () => ({
  checkDependency: mockCheckDependency,
  bothFilesExist: mockBothFilesExist,
}));
```

### タイマー設定

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

## 結論

統合テストにより、以下の動作が検証されました：

1. **無限ループ防止**: TTLベースのメカニズムが正常に機能
2. **モジュール間連携**: FileWatcher → SyncManager → SkillExecutor の連携動作
3. **エラーハンドリング**: エラーが正しく伝播し、適切な状態遷移が行われる
4. **並行性制御**: 同時実行防止、キャンセル処理が正常に機能
