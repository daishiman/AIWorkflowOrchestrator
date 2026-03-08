# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 9                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Lint、型チェック、全テスト実行により、コード品質がプロジェクト基準を満たしていることを検証する。

## 実行タスク

- Lint 実行: ESLint でコードスタイルを検証する
- 型チェック: TypeScript の型チェック（strict モード）を実行する
- 全テスト実行: 変更に関連する全テストを実行する

## 参照資料

| 資料名               | パス                                       | 説明                 |
| -------------------- | ------------------------------------------ | -------------------- |
| 品質基準             | `.claude/rules/02-code-quality.md`         | Lint・型チェック基準 |
| Git ルール           | `.claude/rules/07-git-and-tooling.md`      | コミット前チェック   |
| 実装レポート         | `outputs/phase-5/implementation-report.md` | Phase 5 成果物       |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`       | Phase 8 成果物       |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: ESLint 実行

```bash
cd apps/desktop && pnpm lint
```

修正が必要な場合は修正してから再実行する。

### ステップ2: TypeScript 型チェック

```bash
pnpm typecheck
```

`strict: true` で全てのエラーが解消されていることを確認する。

特に以下を確認:

- `safeRegister` の `error: unknown` 型ハンドリング
- `IpcHandlerRegistrationResult` の export が正しいか
- 既存呼び出し元が戻り値未使用のまま後方互換で動作するか

### ステップ3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

変更したファイル（`index.ts`）に依存する既存テストが影響を受けていないことを確認する。

### ステップ4: 品質チェックリスト

| チェック項目                                       | 判定 |
| -------------------------------------------------- | ---- |
| ESLint エラー 0件                                  | -    |
| TypeScript エラー 0件                              | -    |
| 全テスト PASS                                      | -    |
| `any` 型を使用していない                           | -    |
| `@ts-ignore` / `@ts-expect-error` を使用していない | -    |
| 未使用の import がない                             | -    |

## 統合テスト連携

- `pnpm vitest run` で全テストスイートを実行し、既存テストへの影響がないことを確認する
- 特に `ipcMain.handle` / `ipcMain.removeHandler` をモックしている既存テストとの競合を確認する

## 成果物

| 成果物       | パス                                | 説明     |
| ------------ | ----------------------------------- | -------- |
| 品質検証結果 | `outputs/phase-9/quality-report.md` | 検証結果 |

## 完了条件

- [ ] ESLint エラーが 0件
- [ ] TypeScript 型チェックエラーが 0件
- [ ] 全テストが PASS
- [ ] `any` 型・`@ts-ignore` を使用していない
- [ ] 未使用の import がない
- [ ] 既存テストにリグレッションが発生していない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー
