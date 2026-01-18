# Phase 1: 修正スコープ定義

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | SKILL-IPC-001 |
| Phase      | 1             |
| 実行日     | 2026-01-16    |
| ステータス | 完了          |

---

## 修正対象ファイル

| ファイルパス                         | 修正内容                            |
| ------------------------------------ | ----------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | registerSkillHandlersの呼び出し追加 |

---

## 追加が必要なインポート

```typescript
// apps/desktop/src/main/ipc/index.ts に追加
import { registerSkillHandlers } from "./skillHandlers";
```

---

## 追加が必要な依存関係

### SkillService の生成

`registerSkillHandlers`は以下の引数を必要とする:

```typescript
registerSkillHandlers(mainWindow: BrowserWindow, skillService: SkillService)
```

### SkillService の依存関係

`SkillService`は以下の3つの依存を必要とする:

```typescript
new SkillService(
  scanner: SkillScanner,
  parser: SkillParser,
  importManager: SkillImportManager
)
```

### 依存関係のインスタンス生成

| クラス               | インスタンス生成方法                                  |
| -------------------- | ----------------------------------------------------- |
| `SkillScanner`       | `new SkillScanner(basePath)` - スキルディレクトリパス |
| `SkillParser`        | `new SkillParser()`                                   |
| `SkillImportManager` | `new SkillImportManager()` - electron-store使用       |

---

## 修正しないファイル（確認済み）

| ファイルパス                                           | 状態        |
| ------------------------------------------------------ | ----------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | ✅ 変更不要 |
| `apps/desktop/src/main/services/skill/SkillService.ts` | ✅ 変更不要 |
| `apps/desktop/src/preload/channels.ts`                 | ✅ 変更不要 |

---

## 修正範囲サマリー

- **修正ファイル数**: 1ファイル
- **追加行数（推定）**: 約15-20行
- **影響範囲**: IPCハンドラー登録のみ（既存機能への影響なし）

---

## 完了条件チェックリスト

- [x] エラーメッセージとスタックトレースを記録した
- [x] 根本原因（registerSkillHandlers未呼び出し）を確認した
- [x] 修正対象ファイル（index.ts）を特定した
- [x] 必要な依存関係（SkillService, SkillScanner, SkillParser, SkillImportManager）を特定した
