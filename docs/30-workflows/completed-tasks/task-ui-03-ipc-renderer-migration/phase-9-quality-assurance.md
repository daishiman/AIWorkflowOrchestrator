# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 9                                 |
| Phase名    | 品質保証                          |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 8: リファクタリング         |
| 次Phase    | Phase 10: 最終レビュー            |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

型チェック・lint・全テスト通過を確認し、PR 作成の準備を整える。

## 実行タスク

- typecheck を実行する
- lint を実行する
- 全テストを実行する
- 旧経路参照ゼロを最終確認する

## 参照資料

| 資料名  | パス                        | 説明       |
| ------- | --------------------------- | ---------- |
| Phase 8 | `phase-8-refactoring.md`    | リファクタ |
| Phase 7 | `phase-7-coverage-check.md` | カバレッジ |

## 実行手順

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# 全テスト
pnpm --filter @repo/desktop test -- --run

# 旧経路参照ゼロ確認（最終確認）
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"
```

## 品質ゲート

| 確認項目       | 基準       | 結果       |
| -------------- | ---------- | ---------- |
| typecheck      | エラー 0件 | {{RESULT}} |
| lint           | エラー 0件 | {{RESULT}} |
| ユニットテスト | 全 PASS    | {{RESULT}} |
| 旧経路参照     | 0件        | {{RESULT}} |
| Line Coverage  | 80%+       | {{RESULT}} |

## 統合テスト連携

品質保証で統合テスト結果を確認:

| 品質項目   | 確認内容             | 結果       |
| ---------- | -------------------- | ---------- |
| 機能検証   | 全自動テスト成功     | {{RESULT}} |
| 型安全性   | typecheck エラーなし | {{RESULT}} |
| コード品質 | lint エラーなし      | {{RESULT}} |

### IPC契約ドリフト検証【Phase 9 品質ゲート】

- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が exit 0 で完了する（スクリプトが存在する場合）

## 成果物

| 成果物     | パス                           | 説明         |
| ---------- | ------------------------------ | ------------ |
| QAレポート | `outputs/phase-9/qa-report.md` | 品質確認結果 |

## 完了条件

- [ ] typecheck エラーなし
- [ ] lint エラーなし
- [ ] 全テスト PASS
- [ ] 旧経路参照ゼロ（grep確認）
- [ ] カバレッジ基準達成（Line 80%+、Branch 60%+）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
