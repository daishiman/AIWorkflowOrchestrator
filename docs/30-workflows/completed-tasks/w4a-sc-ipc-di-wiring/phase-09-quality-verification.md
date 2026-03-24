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
- `skillFileManager` が L702 で宣言済みであり、関数スコープ内から参照可能であること

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

## 統合テスト連携

品質検証フェーズで実行する全テストコマンド:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

カバレッジ基準: Line 80%+, Branch 60%+, Function 80%+

## 多角的チェック観点（AIが判断）

| 観点           | 参照先                                                 |
| -------------- | ------------------------------------------------------ |
| IPC通信        | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| セキュリティ   | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ | `aiworkflow-requirements: architecture-*.md`           |
| コード品質     | `.claude/rules/02-code-quality.md`                     |

## サブタスク管理

- [ ] Task 1: ESLint 検証（`apps/desktop/src/main/ipc/index.ts` エラーなし確認）
- [ ] Task 2: TypeScript 型チェック（import・型互換性・スコープ参照確認）
- [ ] Task 3: 全テスト実行（RuntimeSkillCreatorFacade + skillCreator 系全件PASS）
- [ ] Task 4: Prettier フォーマット確認（index.ts フォーマット整合確認）

## タスク100%実行確認【必須】

- [ ] 上記サブタスク全てを実行したか
- [ ] 実行スキップしたタスクがある場合、理由を記録したか
- [ ] 各コマンドの実行結果を成果物として記録したか

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
