# Phase 9: 品質保証 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 9                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

Lint・型チェック・全テストを実行し、移行後のコード品質を保証する。

## 実行タスク

### Task 1: ESLint 実行

```bash
pnpm --filter @repo/desktop lint
```

確認ポイント:

- `console.` 使用に関する ESLint ルール違反がないこと
- 未使用 import がないこと
- その他の ESLint エラー・警告がないこと

### Task 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

確認ポイント:

- `electron-log` の型が正しく解決されること
- `log.error/warn/info/debug` の引数型が正しいこと
- import 文の型解決に問題がないこと

### Task 3: 全テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/
```

確認ポイント:

- 全テストが PASS
- テスト実行時に console 出力が汚染されていないこと

### Task 4: console 使用残留チェック

```bash
grep -rn "console\." --include="*.ts" --exclude="*.test.ts" --exclude="*.spec.ts" apps/desktop/src/main/services/skill/
```

**期待結果**: 0件（テストファイル除外）

### Task 5: 静的解析サマリー

| チェック項目 | コマンド                                                               | 期待結果  |
| ------------ | ---------------------------------------------------------------------- | --------- |
| ESLint       | `pnpm --filter @repo/desktop lint`                                     | エラー0件 |
| TypeScript   | `pnpm --filter @repo/desktop typecheck`                                | エラー0件 |
| テスト       | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/` | 全PASS    |
| console残留  | `grep -rn "console\."`                                                 | 0件       |

## 参照資料

| 資料                     | パス                   |
| ------------------------ | ---------------------- |
| Phase 8 リファクタリング | phase-8-refactoring.md |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物           | パス                              |
| ---------------- | --------------------------------- |
| 品質検証レポート | outputs/phase-9/quality-report.md |

## 完了条件

- [ ] ESLint エラー0件
- [ ] TypeScript 型チェックエラー0件
- [ ] 全テスト PASS
- [ ] console 使用残留0件（テストファイル除外）
- [ ] 品質検証レポートを作成した

## 次Phase

→ Phase 10: 最終レビューゲート
