# Phase 9: 品質保証

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 9                                           |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 8                                           |
| 次Phase | 10                                          |
| 作成日  | 2026-04-19                                  |

## 目的

- 全品質チェックを系統的に実施し、本番投入前の品質水準を担保する
- 機能・コード品質・テスト網羅性・セキュリティの各観点で問題がないことを確認する

## 品質チェックリスト

### 機能検証

- [ ] 全ユニットテストが成功している（グリーン）
- [ ] `update` モードで `runUpdateWorkflow` が正しく呼ばれることがテストで確認されている
- [ ] `improve-prompt` モードで `runImprovePromptWorkflow` が正しく呼ばれることがテストで確認されている
- [ ] `create` モードの既存動作が変わっていない（回帰なし）

### コード品質

- [ ] Lint エラーが 0 件である
- [ ] TypeScript 型エラーが 0 件である
- [ ] 不要な `console.log` や TODO コメントが残っていない

### テスト網羅性

- [ ] `update` / `improve-prompt` / `create` の各モードにテストケースが存在する
- [ ] 正常系・異常系のカバレッジが確認されている
- [ ] エッジケース（空文字・undefined 等）のテストが含まれている

### セキュリティ

- [ ] パストラバーサル防止の既存テストが引き続き通過している
- [ ] 外部入力のサニタイズ処理に変更がないことを確認した

## 実行タスク

### T-9-1: 全件テスト実行

```bash
pnpm --filter @repo/desktop test
```

- 結果をスクリーンショットまたはログとして `outputs/phase-9/test-result.txt` に記録する

### T-9-2: TypeScript 型チェック実行

```bash
pnpm --filter @repo/desktop typecheck
```

- エラー 0 件であることを確認し、結果を `outputs/phase-9/typecheck-result.txt` に記録する

### T-9-3: Lint 実行

```bash
pnpm --filter @repo/desktop lint
```

- エラー 0 件であることを確認し、結果を `outputs/phase-9/lint-result.txt` に記録する

### T-9-4: 品質レポート作成

- `outputs/phase-9/quality-report.md` を作成し、T-9-1 〜 T-9-3 の結果をまとめる
- 発見された問題点と対応状況を記載する

## リスク確認テーブル

| リスク           | 内容                                                           | 対処方針                             |
| ---------------- | -------------------------------------------------------------- | ------------------------------------ |
| 既存動作への回帰 | `create` モードが `update`/`improve-prompt` の変更影響を受ける | 回帰テストで確認済みであることを担保 |
| 型安全性の低下   | 新実装で `any` 型が混入する                                    | typecheck で 0 エラーを確認          |
| Lint 規約違反    | 新コードがプロジェクトルールに反する                           | lint で 0 エラーを確認               |
| パストラバーサル | 既存セキュリティテストが壊れる                                 | セキュリティテスト全件通過で確認     |

## 参照資料

| 資料名             | パス                                                                                   | 用途                     |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------ |
| 対象サービス       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                          | 実装と品質リスクの確認   |
| 対象テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`           | 品質保証対象の確認       |
| Phase 8 仕様書     | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-8-refactoring.md` | リファクタ結果の引き継ぎ |

## 成果物

| 成果物           | パス                                          | 内容                                           |
| ---------------- | --------------------------------------------- | ---------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | test / typecheck / lint とリスク評価の統合記録 |

## 完了条件

- [ ] T-9-1: 全ユニットテストがグリーンである
- [ ] T-9-2: TypeScript 型エラーが 0 件である
- [ ] T-9-3: Lint エラーが 0 件である
- [ ] T-9-4: `outputs/phase-9/quality-assurance-report.md` が作成されている
- [ ] 品質チェックリストの全項目にチェックが入っている
