# Phase 2: テストヘルパー設計

## 設計日: 2026-02-02

## 既存ヘルパーパターン

### SkillExecutor テスト内

- `createMockBrowserWindow()`: BrowserWindowモック生成
- `createMockSkillMetadata(overrides?)`: SkillMetadataモック生成
- `createMockExecutionRequest(overrides?)`: SkillExecutionRequestモック生成

### skillSlice テスト内

- `mockSkillAPI`: window.electronAPI.skillのモックオブジェクト
- `createStore()`: Zustandストア生成ヘルパー

### PermissionResolver テスト内

- 直接インスタンス生成（ヘルパー不要）

## 追加ヘルパー設計

### SE-07, SE-08 用ヘルパー

補強テストでは既存のファクトリ関数を再利用するため、新規ヘルパーは不要。

```typescript
// SE-07: 既存の createMockBrowserWindow() と executionId を使用
const executor = new SkillExecutor(createMockBrowserWindow());
const hooks = executor.createHooks("test-execution-id");

// SE-08: 既存の executor インスタンスを使用
executor.handlePermissionResponse("request-id", true, true);
```

### PR-03 用ヘルパー

SkillPermissionResponseオブジェクトの生成は1回のみ使用のため、インラインで定義:

```typescript
const response: SkillPermissionResponse = {
  requestId: "test-request-id",
  approved: true,
  rememberChoice: true,
};
```

## 方針

- **新規ヘルパーファイルは作成しない**: 各テストファイル内に定義する方針を維持
- **過度な抽象化を避ける**: 2回以下の使用はインライン定義
- **既存パターンの踏襲**: 既存テストで確立されたファクトリ関数パターンを継続使用
- **統合テスト共有**: 現時点では不要（ギャップ4件の補強のみのため）
