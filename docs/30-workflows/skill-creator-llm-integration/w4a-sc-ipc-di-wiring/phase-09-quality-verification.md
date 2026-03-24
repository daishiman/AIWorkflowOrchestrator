# Phase 9: 品質検証

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 9                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

Lint、型チェック、全テスト実行による品質検証を行う。

## 実行タスク

### Task 1: ESLint 検証

```bash
cd apps/desktop && pnpm lint
```

修正対象ファイル `apps/desktop/src/main/ipc/index.ts` に ESLint エラーがないことを確認する。

### Task 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

以下を確認する:

- 追加した import が型として正しいこと
- `ILLMAdapter | undefined` の型互換性に問題がないこと
- `skillFileManager` が L701 のスコープから参照可能であること

### Task 3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreator
```

既存テスト全件が PASS することを確認する。

### Task 4: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm prettier --check src/main/ipc/index.ts
```

## 参照資料

- `.claude/rules/02-code-quality.md`
- `.claude/rules/07-git-and-tooling.md`（コミット前チェックリスト）

## 成果物

- 品質検証結果（各コマンドの実行結果を記録）

## 完了条件

- [ ] ESLint がエラーなしで完了した
- [ ] TypeScript 型チェックがエラーなしで完了した
- [ ] RuntimeSkillCreatorFacade 関連テストが全て PASS した
- [ ] SkillCreatorHandlers 関連テストが全て PASS した
- [ ] Prettier フォーマットチェックが PASS した

## 次のPhase

Phase 10: 最終レビュー
