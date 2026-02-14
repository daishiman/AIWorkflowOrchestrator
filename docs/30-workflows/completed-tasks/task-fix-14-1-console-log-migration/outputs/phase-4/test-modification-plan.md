# Phase 4: テスト修正計画

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| Phase      | 4（テスト作成）                     |
| 作成日     | 2026-02-14                          |
| ステータス | 完了                                |

## 目的

console.log/warn/error から electron-log への移行に伴い、既存テストファイルで必要な修正を特定し、修正計画を策定する。

## テスト修正対象の分析

### 修正が必要なテストファイル（1件）

| ファイル                           | 修正理由                                 | 修正内容                                                       |
| ---------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| `SkillImportManager.error.test.ts` | `console` スパイによるログ出力検証が存在 | `vi.spyOn(console, "log")` を `vi.mock("electron-log")` に置換 |

#### 修正詳細: SkillImportManager.error.test.ts

- **修正箇所**: 4つの console スパイブロック
- **修正パターン**: `vi.spyOn(console, "log")` → `vi.mock("electron-log")` によるモックアサーション
- **修正前**:
  ```typescript
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  // ... テスト実行 ...
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("..."));
  ```
- **修正後**:
  ```typescript
  vi.mock("electron-log");
  // ... テスト実行 ...
  expect(log.error).toHaveBeenCalledWith(expect.stringContaining("..."));
  ```

### electron-log モック追加が必要なテストファイル（9件）

テスト実行時の stdout 汚染を防止するため、以下の9ファイルに `vi.mock("electron-log")` を追加する。

| #   | ファイル                                 | 理由                                       |
| --- | ---------------------------------------- | ------------------------------------------ |
| 1   | `SkillImportManager.test.ts`             | SkillImportManager のログ出力抑制          |
| 2   | `SkillImportManager.persistence.test.ts` | 永続化テスト時のログ出力抑制               |
| 3   | `SkillImportManager.boundary.test.ts`    | 境界値テスト時のログ出力抑制               |
| 4   | `SkillImportManager.integration.test.ts` | 統合テスト時のログ出力抑制                 |
| 5   | `PermissionStore.test.ts`                | PermissionStore のログ出力抑制             |
| 6   | `PermissionStore.integration.test.ts`    | PermissionStore 統合テスト時のログ出力抑制 |
| 7   | `SkillScanner.test.ts`                   | SkillScanner のログ出力抑制                |
| 8   | `SkillAnalyzer.test.ts`                  | SkillAnalyzer のログ出力抑制               |
| 9   | `SkillAnalyzer.additional.test.ts`       | SkillAnalyzer 追加テスト時のログ出力抑制   |

### スコープ外（修正不要）

| ファイル                           | 理由                                 |
| ---------------------------------- | ------------------------------------ |
| `SkillExecutor.permission.test.ts` | SkillExecutor は本タスクのスコープ外 |
| `SkillExecutor.auth.test.ts`       | SkillExecutor は本タスクのスコープ外 |
| `SkillExecutor.test.ts`            | SkillExecutor は本タスクのスコープ外 |

## 修正パターン

### パターン A: console スパイ → electron-log モック置換

```typescript
// Before
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("message"));
consoleSpy.mockRestore();

// After
vi.mock("electron-log");
import log from "electron-log";
expect(log.error).toHaveBeenCalledWith(expect.stringContaining("message"));
```

### パターン B: electron-log モック追加（出力抑制のみ）

```typescript
// ファイル先頭に追加
vi.mock("electron-log");
```

## 完了条件

- [x] SkillImportManager.error.test.ts の4つの console スパイブロックを electron-log モックに置換
- [x] 9つのテストファイルに `vi.mock("electron-log")` を追加
- [x] 全920テストが PASS すること
