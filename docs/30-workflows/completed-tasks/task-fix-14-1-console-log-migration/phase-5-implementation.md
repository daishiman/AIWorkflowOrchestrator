# Phase 5: 実装 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 5                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを通過させるために、console出力をelectron-logに移行する。

## 実行タスク

### Task 1: SkillScanner.ts の移行（7箇所）

#### 手順

1. ファイル先頭に `import log from "electron-log";` を追加
2. 以下の変更を実施:

| 行番号   | 変更前                                   | 変更後                             |
| -------- | ---------------------------------------- | ---------------------------------- |
| L155-158 | `console.error(...)`                     | `log.error("[SkillScanner]", ...)` |
| L183-185 | `console.warn(...)`                      | `log.warn("[SkillScanner]", ...)`  |
| L203-205 | `console.warn(...)`                      | `log.warn("[SkillScanner]", ...)`  |
| L298     | `logWarning` メソッド内の `console.warn` | `log.warn`                         |
| L454-461 | `console.log`, `console.error`           | `log.info`, `log.warn`             |

3. テスト実行: `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillScanner`

### Task 2: PermissionStore.ts の移行（7箇所）

#### 手順

1. ファイル先頭に `import log from "electron-log";` を追加
2. 以下の変更を実施:

| 行番号   | 変更前               | 変更後                                |
| -------- | -------------------- | ------------------------------------- |
| L97      | `console.info(...)`  | `log.info("[PermissionStore]", ...)`  |
| L115     | `console.info(...)`  | `log.info("[PermissionStore]", ...)`  |
| L144     | `console.warn(...)`  | `log.warn("[PermissionStore]", ...)`  |
| L156     | `console.warn(...)`  | `log.warn("[PermissionStore]", ...)`  |
| L167-169 | `console.info(...)`  | `log.info("[PermissionStore]", ...)`  |
| L171-174 | `console.warn(...)`  | `log.warn("[PermissionStore]", ...)`  |
| L191     | `console.error(...)` | `log.error("[PermissionStore]", ...)` |

3. テスト実行: `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/PermissionStore`

### Task 3: SkillImportManager.ts の移行（12箇所）

#### 手順

1. ファイル先頭に `import log from "electron-log";` を追加
2. debugフラグ付きの `console.log` を `log.debug` に統一（debugプロパティの条件分岐を削除）
3. 以下の変更を実施:

| 行番号   | 変更前                             | 変更後                                   |
| -------- | ---------------------------------- | ---------------------------------------- |
| L38-41   | `console.warn(...)`                | `log.warn("[SkillImportManager]", ...)`  |
| L50-53   | `console.warn(...)`                | `log.warn("[SkillImportManager]", ...)`  |
| L72      | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L81-85   | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L90      | `console.error(...)`               | `log.error("[SkillImportManager]", ...)` |
| L100     | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L118-122 | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L137     | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L148     | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L179     | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L185     | `if (this.debug) console.log(...)` | `log.debug("[SkillImportManager]", ...)` |
| L188     | `console.error(...)`               | `log.error("[SkillImportManager]", ...)` |

4. `debug` プロパティの削除を検討（`log.debug` のレベル制御で代替可能）
5. テスト実行: `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillImportManager`

### Task 4: SkillAnalyzer.ts の移行（1箇所）

#### 手順

1. ファイル先頭に `import log from "electron-log";` を追加
2. 変更:

| 行番号 | 変更前               | 変更後                              |
| ------ | -------------------- | ----------------------------------- |
| L213   | `console.error(...)` | `log.error("[SkillAnalyzer]", ...)` |

3. テスト実行: `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillAnalyzer`

### Task 5: テストファイルの更新

Phase 4 で設計した修正を適用し、全テストが PASS することを確認する。

#### 5.1 各テストファイルに electron-log モックを追加

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

#### 5.2 console スパイを electron-log モック検証に置換

各テストファイルの `vi.spyOn(console, "xxx")` を `log.xxx` のモック検証に変更する。

### Task 6: 全テスト PASS 確認

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/
```

## 参照資料

| 資料               | パス                     |
| ------------------ | ------------------------ |
| Phase 2 設計       | phase-2-design.md        |
| Phase 4 テスト計画 | phase-4-test-creation.md |

## 既知の落とし穴への対処

| Pitfall                                 | 対策                                          |
| --------------------------------------- | --------------------------------------------- |
| P11: PostToolUse フックによる Edit 失敗 | 大量編集後に `git diff --stat` で変更数を検証 |
| P20: テスト環境でのログ出力汚染         | electron-log モックで出力を抑制               |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物                         | パス                                                       | 種別   |
| ------------------------------ | ---------------------------------------------------------- | ------ |
| 移行済み SkillScanner.ts       | apps/desktop/src/main/services/skill/SkillScanner.ts       | コード |
| 移行済み PermissionStore.ts    | apps/desktop/src/main/services/skill/PermissionStore.ts    | コード |
| 移行済み SkillImportManager.ts | apps/desktop/src/main/services/skill/SkillImportManager.ts | コード |
| 移行済み SkillAnalyzer.ts      | apps/desktop/src/main/services/skill/SkillAnalyzer.ts      | コード |
| 修正済みテストファイル         | apps/desktop/src/main/services/skill/**tests**/\*.test.ts  | コード |

## 完了条件

- [ ] SkillScanner.ts の 7箇所を移行完了
- [ ] PermissionStore.ts の 7箇所を移行完了
- [ ] SkillImportManager.ts の 12箇所を移行完了
- [ ] SkillAnalyzer.ts の 1箇所を移行完了
- [ ] テストファイル4つの console スパイを electron-log モックに更新完了
- [ ] 全テストが PASS
- [ ] `grep -rn "console\." --include="*.ts" --exclude="*.test.ts" apps/desktop/src/main/services/skill/` で該当なし

## 次Phase

→ Phase 6: テスト拡充
