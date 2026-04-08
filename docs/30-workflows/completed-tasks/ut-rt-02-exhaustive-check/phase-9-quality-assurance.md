# Phase 9: 品質保証

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 9                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

定義された品質基準をすべて満たすことを確認する。lint・typecheck・テスト・カバレッジの全品質ゲートをクリアする。

## 実行タスク

- 全品質ゲート実行: lint / typecheck / テスト / カバレッジの一括確認
- IPC契約ドリフト確認: IPC変更がないことを確認（本タスクはIPC変更なしのため確認のみ）
- 品質レポート作成: 全ゲートの結果を記録

## 参照資料

| 資料名             | パス                                    | 説明             |
| ------------------ | --------------------------------------- | ---------------- |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`    | カバレッジ基準値 |
| Phase 8 リファクタ | `outputs/phase-8/refactoring-record.md` | 変更内容確認     |

## 実行手順

### ステップ1: 品質ゲート一括確認

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. ESLint
pnpm --filter @repo/desktop lint

# 3. テスト実行（フォーカス）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts

# 4. カバレッジ確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/main/services/runtime/RuntimeSkillCreatorFacade.ts" \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

### ステップ2: 品質ゲート判定

| 品質項目              | 確認内容                                              | 結果     |
| --------------------- | ----------------------------------------------------- | -------- |
| TypeScript 型チェック | エラー 0 件                                           | （記録） |
| ESLint                | エラー 0 件                                           | （記録） |
| ユニットテスト        | T-01〜T-06 + TC-07〜TC-12 全 PASS                     | （記録） |
| Line Coverage         | 80%+（executeAsync() / classifyExecuteResult() 対象） | （記録） |
| Branch Coverage       | 60%+（helper + switch 文全 case 対象）                | （記録） |
| Function Coverage     | 80%+                                                  | （記録） |
| IPC 契約ドリフト      | IPC変更なし（本タスクはMain内部変更のみ）             | N/A      |

### ステップ3: IPC契約ドリフト確認

本タスクは `RuntimeSkillCreatorFacade.ts` の内部実装変更のみで IPC チャンネルの追加・変更はない。

```bash
# IPC変更がないことを確認（変更ファイル確認）
git diff --name-only | grep -v "RuntimeSkillCreatorFacade\|assertNever\|executeAsync.test"
# → 上記以外のファイルが出力されないことを確認
```

### ステップ4: 品質レポート作成

`outputs/phase-9/quality-report.md` に全ゲートの実測値を記録する。

## 成果物

| 成果物       | パス                                | 説明             |
| ------------ | ----------------------------------- | ---------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質ゲート結果 |

## 完了条件

- [ ] TypeScript 型チェックエラー 0 件
- [ ] ESLint エラー 0 件
- [ ] 全テスト（T-01〜T-06 + TC-07〜TC-12）が PASS
- [ ] Line Coverage が基準（80%+）を達成
- [ ] Branch Coverage が基準（60%+）を達成（switch の全 case 網羅推奨）
- [ ] IPC 変更がないことが確認されている
- [ ] 品質レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

本タスクは Main Process 内部リファクタリングのみで IPC/API 変更なし。統合テスト連携は自動テスト（Vitest）の全 PASS を確認することで代替する。

```bash
# 品質ゲート一括確認
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

| テスト種別  | 件数                      | 確認内容                      |
| ----------- | ------------------------- | ----------------------------- |
| Vitest 自動 | T-01〜T-06 + TC-07〜TC-12 | 全 PASS で IPC 影響なしを担保 |
| 型チェック  | -                         | TypeScript エラー 0 件        |
| Lint        | -                         | ESLint エラー 0 件            |

## 次のPhase

Phase 10: 最終レビューゲート

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 9
```
