# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 9                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

lint、typecheck、テスト全パスの一括確認を行い、Phase 5〜8 で追加・変更したコードの品質を担保する。

## 実行タスク

### T-9-1: lint 実行・修正

- `pnpm lint` を実行し、ESLint エラー・警告を確認する
- エラーがある場合は修正する
- 対象: `SkillCreatorWorkflowEngine.ts` および関連テストファイル

### T-9-2: typecheck 実行・修正

- `pnpm typecheck` を実行し、TypeScript コンパイルエラーを確認する
- 型エラーがある場合は修正する
- 特に `phase_transition` artifact 型（TECH-M-01 関連）の型安全性を確認する

### T-9-3: テスト全パス確認

- `pnpm exec vitest run` を実行し、関連テスト全件パスを確認する
- AC-1〜AC-7 に対応するテストケースが全てパスすることを確認する
- 既存テスト（awaitingUserInput クリア、stale requestId rejection）も含めて確認する

### T-9-4: MINOR TECH-M-01 解決確認

- Phase 8 で検討した TECH-M-01 の解決状況を確認する
- 未解決の場合、残存リスクを記録する
- 解決済みの場合、型チェックでエラーが出ないことを確認する

## 検証コマンドリスト

```bash
# T-9-1: lint
pnpm lint

# T-9-2: typecheck
pnpm typecheck

# T-9-3: テスト全パス
pnpm exec vitest run

# T-9-3: AC 個別テスト確認
pnpm exec vitest run --grep "plan_review ready_to_execute"
pnpm exec vitest run --grep "plan_review needs_changes"
pnpm exec vitest run --grep "verification_review approve"
pnpm exec vitest run --grep "verification_review improve"
pnpm exec vitest run --grep "verification_review reject"
pnpm exec vitest run --grep "facade snapshot"
pnpm exec vitest run --grep "state-changed event"
```

## 参照資料

### コードベース

| 資料名      | パス                                                                                  | 説明           |
| ----------- | ------------------------------------------------------------------------------------- | -------------- |
| Engine 実装 | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | 検証対象       |
| Engine Test | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | テスト実行対象 |
| ESLint 設定 | `.eslintrc.*` / `eslint.config.*`                                                     | lint ルール    |
| TS 設定     | `tsconfig.json`                                                                       | 型チェック設定 |

## 成果物

| 成果物               | パス                                   | 説明                       |
| -------------------- | -------------------------------------- | -------------------------- |
| 品質保証結果記録     | `outputs/phase-9/quality-assurance.md` | 本ドキュメントに結果を追記 |
| 修正済みソースコード | Engine 実装ファイル                    | lint/type エラー修正済み   |

## 完了条件

- [ ] T-9-1: `pnpm lint` がエラー 0 件で完了している
- [ ] T-9-2: `pnpm typecheck` がエラー 0 件で完了している
- [ ] T-9-3: `pnpm exec vitest run` が全件パスしている
- [ ] T-9-4: MINOR TECH-M-01 の解決状況が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10: 最終レビュー
