# Phase 7: テストカバレッジ確認 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                                |
| ------- | ------------------------------------------------- |
| Phase   | 7 - テストカバレッジ確認                          |
| 機能名  | task-rt-01-llm-adapter-error-propagation          |
| 作成日  | 2026-04-04                                        |
| 前Phase | [Phase 6: テスト拡充](phase-06-test-expansion.md) |

## 目的

Phase 5 実装コードのテストカバレッジを測定し、品質目標（80%以上）を達成していることを確認する。
未達の場合は Phase 6 へ戻り追加テストを実施する。

## 参照資料

| 資料名         | パス                 | 用途     |
| -------------- | -------------------- | -------- |
| Phase 2 設計書 | `phase-02-design.md` | 設計確認 |
| Phase 5 成果物 | `outputs/phase-5/`   | 実装参照 |

## 実行タスク

- **カバレッジ測定**: 本タスクの実装ファイルに対してカバレッジを取得する
- **目標達成確認**: 各ファイルのカバレッジが 80% 以上であることを確認する
- **未達時の対応**: 未達ファイルを特定し Phase 6 で追加テストを実施する

## カバレッジ測定対象ファイル

| ファイル                                                                  | カバレッジ目標 |
| ------------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`    | 90% 以上       |
| `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts` | 85% 以上       |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`（追加部分）                | 80% 以上       |

## カバレッジ測定コマンド

```bash
# desktop パッケージのカバレッジ取得（v8 プロバイダ）
pnpm --filter @repo/desktop vitest run --coverage \
  src/renderer/components/skill/LLMAdapterErrorBanner.tsx \
  src/renderer/components/skill/hooks/useLLMAdapterStatus.ts

# creatorHandlers のカバレッジ（既存ファイルなので全体測定）
pnpm --filter @repo/desktop vitest run --coverage \
  src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
```

## カバレッジチェックリスト

### `LLMAdapterErrorBanner.tsx`

| ブランチ                             | テストケース       | カバー済み |
| ------------------------------------ | ------------------ | ---------- |
| `status !== "failed"` → return null  | T-BAN-02, T-BAN-03 | ✅ 要確認  |
| `status === "failed"` → バナー表示   | T-BAN-01           | ✅ 要確認  |
| `failureReason?.includes("API key")` | T-BAN-04, T-BAN-10 | ✅ 要確認  |
| `failureReason ?? "不明なエラー"`    | T-BAN-06           | ✅ 要確認  |
| `onOpenSettings` が存在する場合      | T-BAN-07           | ✅ 要確認  |
| `onOpenSettings` が存在しない場合    | T-BAN-08           | ✅ 要確認  |

### `useLLMAdapterStatus.ts`

| ブランチ                                  | テストケース | カバー済み |
| ----------------------------------------- | ------------ | ---------- |
| `api` が undefined → return               | T-HK-06      | ✅ 要確認  |
| pull 成功 + `result.success === true`     | T-HK-02      | ✅ 要確認  |
| pull 失敗 + `result.success === false`    | T-HK-07      | ✅ 要確認  |
| `cancelled` フラグによる破棄              | T-HK-05      | ✅ 要確認  |
| push 受信による状態更新                   | T-HK-03      | ✅ 要確認  |
| アンマウント時の `unsubscribe()` 呼び出し | T-HK-04      | ✅ 要確認  |

### `creatorHandlers.ts`（追加部分）

| ブランチ                                   | テストケース       | カバー済み |
| ------------------------------------------ | ------------------ | ---------- |
| pull ハンドラ: service が null             | T-IPC-04           | ✅ 要確認  |
| pull ハンドラ: 正常レスポンス              | T-IPC-02, T-IPC-03 | ✅ 要確認  |
| push: `mainWindow.isDestroyed() === true`  | T-IPC-08           | ✅ 要確認  |
| push: `mainWindow.isDestroyed() === false` | T-IPC-07           | ✅ 要確認  |

## カバレッジ結果テーブル（実行後に記入）

| ファイル                         | Lines | Branches | Functions | Statements | 目標 | 判定 |
| -------------------------------- | ----- | -------- | --------- | ---------- | ---- | ---- |
| `LLMAdapterErrorBanner.tsx`      | —     | —        | —         | —          | 90%  | —    |
| `useLLMAdapterStatus.ts`         | —     | —        | —         | —          | 85%  | —    |
| `creatorHandlers.ts`（追加部分） | —     | —        | —         | —          | 80%  | —    |

## 未達時の対応フロー

```
カバレッジ目標未達
  ↓
未カバーブランチを特定（vitest --coverage レポート参照）
  ↓
Phase 6 で追加テストを実施
  ↓
Phase 7 を再実行してカバレッジ再測定
```

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                                                |
| ------------------ | ----------------------------------------------------------------------- |
| ブランチカバレッジ | if/else、三項演算子、optional chaining の全ブランチがカバーされているか |
| 非同期処理         | Promise の resolve/reject パスがテストされているか                      |
| クリーンアップ     | useEffect の cleanup 関数がテストされているか                           |

## サブタスク管理

| ID     | 内容                         | ステータス |
| ------ | ---------------------------- | ---------- |
| ST-7-1 | カバレッジ測定コマンド実行   | 未実施     |
| ST-7-2 | ブランチカバレッジチェック   | 未実施     |
| ST-7-3 | 結果テーブル記入             | 未実施     |
| ST-7-4 | 未達ファイルの追加テスト計画 | 未実施     |

## 成果物

| 成果物                 | パス                                   |
| ---------------------- | -------------------------------------- |
| カバレッジレポート     | `outputs/phase-7/coverage-report.md`   |
| 未達対応計画（あれば） | `outputs/phase-7/coverage-gap-plan.md` |

## 完了条件

- [ ] 全測定対象ファイルのカバレッジが目標値以上である
- [ ] カバレッジ結果テーブルが埋まっている
- [ ] 未達ファイルがある場合は Phase 6 の追加テストで対応済み

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-7/` に配置した
- [ ] `artifacts.json` の Phase 7 を `completed` に更新した

## 統合テスト連携

本 Phase のテスト成果物は後続 Phase の品質確認・ゲート判定に使用される。

| Phase   | 連携内容                                  |
| ------- | ----------------------------------------- |
| Phase 5 | テスト GREEN を確認してから実装完了とする |
| Phase 9 | 品質保証フェーズで最終確認する            |

## 次Phase

Phase 7 完了後 → [Phase 8: リファクタリング](phase-08-refactoring.md) へ進む
