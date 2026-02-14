# TASK-FIX-14-1-CONSOLE-LOG-MIGRATION テスト修正設計書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| Phase      | Phase 2 - 設計                      |
| 作成日     | 2026-02-14                          |
| ステータス | 完了                                |

## electron-log モックパターン

### 標準モック定義

全てのテストファイルで以下の共通モックパターンを使用する:

```typescript
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

### モックのインポートと参照

```typescript
import log from "electron-log";

// テスト内での検証
expect(log.error).toHaveBeenCalledWith(expect.stringContaining("[ClassName]"));
```

### モックのリセット

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

## テストファイル別修正設計

### 1. SkillExecutor.auth.test.ts

**修正対象箇所**:

| 行番号（概算） | 変更前                       | 変更後                                       |
| -------------- | ---------------------------- | -------------------------------------------- |
| L366           | `vi.spyOn(console, "log")`   | `vi.mock("electron-log")` + `log.debug` 検証 |
| L367           | `vi.spyOn(console, "error")` | `log.error` 検証                             |

**修正内容**:

```typescript
// 変更前
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
// ... テスト実行 ...
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("..."));
expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("..."));

// 変更後
// ファイル先頭で vi.mock("electron-log") を宣言
// ... テスト実行 ...
expect(log.debug).toHaveBeenCalledWith(
  expect.stringContaining("[SkillExecutor]"),
);
expect(log.error).toHaveBeenCalledWith(
  expect.stringContaining("[SkillExecutor]"),
);
```

### 2. SkillExecutor.permission.test.ts

**修正対象箇所**:

| 行番号（概算） | 変更前                      | 変更後          |
| -------------- | --------------------------- | --------------- |
| L1459          | `vi.spyOn(console, "info")` | `log.info` 検証 |
| L1569          | `vi.spyOn(console, "info")` | `log.info` 検証 |

**修正内容**:

```typescript
// 変更前
const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
// ... テスト実行 ...
expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("..."));

// 変更後
// ファイル先頭で vi.mock("electron-log") を宣言
// ... テスト実行 ...
expect(log.info).toHaveBeenCalledWith(
  expect.stringContaining("[PermissionStore]"),
);
```

### 3. SkillImportManager.error.test.ts

**修正対象箇所**:

| 行番号（概算） | 変更前                     | 変更後                               |
| -------------- | -------------------------- | ------------------------------------ |
| L323           | `vi.spyOn(console, "log")` | `log.debug` 検証                     |
| L346           | `vi.spyOn(console, "log")` | `log.debug` 検証                     |
| L376           | `vi.spyOn(console, "log")` | `log.debug` 検証                     |
| L396           | `vi.spyOn(console, "log")` | `log.error` 検証（エラーログの場合） |

**修正内容**:

```typescript
// 変更前
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
// ... テスト実行 ...
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("..."));

// 変更後
// ファイル先頭で vi.mock("electron-log") を宣言
// ... テスト実行 ...
expect(log.debug).toHaveBeenCalledWith(
  expect.stringContaining("[SkillImportManager]"),
);
```

## debug フラグの扱い

### 現状のテストパターン

```typescript
// SkillImportManager のコンストラクタで debug: true を指定
const manager = new SkillImportManager({ debug: true });
// debug フラグが true の場合のみ console.log が呼ばれることを検証
```

### 移行後のテストパターン

```typescript
// debug フラグは不要（electron-log のレベル制御に委譲）
const manager = new SkillImportManager();
// log.debug が呼ばれることを検証（フラグに関係なく常に呼ばれる）
expect(log.debug).toHaveBeenCalledWith(
  expect.stringContaining("[SkillImportManager]"),
);
```

### 注意事項

- `debug` プロパティがコンストラクタの引数に含まれている場合、後方互換性のために引数は残しつつ、内部の分岐ロジックのみ削除する
- テストで `debug: true` を指定していた箇所は、そのオプション自体を削除する
- `debug` プロパティの完全削除（インターフェース変更）は、影響範囲を確認した上で Phase 5 で判断する

## 検証戦略

### テスト実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
```

### 検証項目

1. 全テストが PASS すること
2. `vi.spyOn(console, ...)` の使用がゼロ件であること
3. `vi.mock("electron-log")` が正しく宣言されていること
4. `log.*` の呼び出し検証が正しいログレベルで行われていること
