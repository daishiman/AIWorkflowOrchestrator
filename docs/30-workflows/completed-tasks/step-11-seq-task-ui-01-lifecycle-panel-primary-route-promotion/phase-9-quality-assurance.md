# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| Phase名    | 品質保証                                |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 8: リファクタリング               |
| 次Phase    | Phase 10: 最終レビュー                  |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

lint、typecheck、全テストの pass を確認し、コードベース全体の品質基準を満たしていることを検証する。

## 実行タスク

### Task 1: ESLint 実行

- `pnpm lint` を実行し、lint エラーがゼロであることを確認
- 変更対象ファイルに warning がないことを確認
- lint 結果を記録

### Task 2: TypeScript 型チェック

- `pnpm typecheck` を実行し、型エラーがゼロであることを確認
- 変更対象ファイルの型安全性を確認
- any 型の使用がないことを確認

### Task 3: 全テスト実行

- `pnpm --filter @repo/desktop test` を実行し、全テストが pass することを確認
- テスト実行時間を記録
- フレーキーテストがないことを確認

### Task 4: ビルド確認

- `pnpm --filter @repo/desktop build` が成功することを確認
- ビルド成果物に異常がないことを確認

### Task 5: QA レポート作成

- 上記 Task 1-4 の結果を `outputs/phase-9/qa-report.md` にまとめる

## 参照資料

| 資料名                   | パス                                 | 説明                   |
| ------------------------ | ------------------------------------ | ---------------------- |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-log.md` | 品質確認対象の変更内容 |
| ESLint 設定              | `.eslintrc.*` / `eslint.config.*`    | lint ルール            |
| TypeScript 設定          | `tsconfig.json`                      | 型チェック設定         |

## 成果物

| 成果物      | パス                           | 説明                                 |
| ----------- | ------------------------------ | ------------------------------------ |
| QA レポート | `outputs/phase-9/qa-report.md` | lint / typecheck / test / build 結果 |

## 完了条件

- [ ] ESLint エラーがゼロである
- [ ] TypeScript 型エラーがゼロである
- [ ] 全テストが pass する
- [ ] ビルドが成功する
- [ ] QA レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
