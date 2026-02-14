# Phase 4: テスト作成 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 4                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

console → electron-log 移行を検証するテストを作成する。TDD の Red フェーズとして、まだ移行前のコードに対して electron-log の呼び出しを期待するテストを書き、失敗を確認する。

## 実行タスク

### Task 1: 既存テストの console スパイ更新設計

既存テストで `console.error/warn/log` のスパイを使用している箇所を electron-log モックに変更する。

#### 1.1 テストファイル別の修正計画

##### SkillExecutor.test.ts

- L829: `vi.spyOn(console, "error")` → `import log from "electron-log"` + `expect(log.error).toHaveBeenCalled()`

##### SkillExecutor.permission.test.ts

- L1459, L1569: `vi.spyOn(console, "info")` → `expect(log.info).toHaveBeenCalled()`

##### SkillExecutor.auth.test.ts

- L366: `vi.spyOn(console, "log")` → `expect(log.debug).toHaveBeenCalled()`
- L367: `vi.spyOn(console, "error")` → `expect(log.error).toHaveBeenCalled()`

##### SkillImportManager.error.test.ts

- L323, L346, L376, L396: `vi.spyOn(console, "log")` → `expect(log.debug).toHaveBeenCalled()` または `expect(log.error).toHaveBeenCalled()`

### Task 2: 移行確認テストの設計

各対象ファイルで `console.` が使用されていないことを確認するための静的検証テストを追加する。

```typescript
// 検証方法: grep -rn "console\." --include="*.ts" --exclude="*.test.ts" apps/desktop/src/main/services/skill/
// 結果が0件であることを受入基準 AC-1 で確認
```

### Task 3: electron-log モック統一

各テストファイルの先頭に以下の統一モックを追加する:

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

## 参照資料

| 資料                 | パス                                            |
| -------------------- | ----------------------------------------------- |
| Phase 2 設計         | phase-2-design.md                               |
| Phase 3 レビュー結果 | phase-3-design-review.md                        |
| 既存テストファイル   | apps/desktop/src/main/services/skill/**tests**/ |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物                 | パス                                                      | 種別         |
| ---------------------- | --------------------------------------------------------- | ------------ |
| テスト修正計画書       | outputs/phase-4/test-modification-plan.md                 | ドキュメント |
| 修正済みテストファイル | apps/desktop/src/main/services/skill/**tests**/\*.test.ts | コード       |

## 完了条件

- [ ] 全テストファイルの console スパイ箇所が特定されている
- [ ] electron-log モックパターンが各テストに追加されている
- [ ] テストが実行され、移行前のため失敗することを確認（Red）
- [ ] テスト修正計画書が作成されている

## 次Phase

→ Phase 5: 実装
