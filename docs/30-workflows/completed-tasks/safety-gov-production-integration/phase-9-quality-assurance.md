# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 9                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

typecheck・lint・全テスト・Phase 3 MINOR 解決確認を一括実行し、品質ゲートを通過する。

## 実行タスク

- typecheck / lint / test / coverage を順番に実行し、失敗時の原因を分離する
- Phase 3 の MINOR 指摘と AC-1〜AC-5 の中間状態を current facts に更新する
- warning と blocker を切り分け、Phase 10 へ持ち込まない
- 実行コマンドと結果を品質レポートへ転記する

### 1. 品質チェック一括実行

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# Lint チェック
pnpm --filter @repo/desktop lint

# 全テスト実行
pnpm --filter @repo/desktop test

# カバレッジ確認
pnpm --filter @repo/desktop test -- --coverage
```

### 2. 品質チェック結果テーブル

| チェック項目      | 期待値               | 実行結果 |
| ----------------- | -------------------- | -------- |
| typecheck         | エラー 0件           | -        |
| lint              | エラー 0件、警告 0件 | -        |
| 全テスト PASS     | 全 pass              | -        |
| Line Coverage     | 80%+                 | -        |
| Branch Coverage   | 60%+                 | -        |
| Function Coverage | 80%+                 | -        |

### 3. Phase 3 MINOR 指摘の解決確認

Phase 3 で記録された MINOR 指摘が解決されているかを確認する:

| MINOR ID                                    | 指摘内容 | 解決状況 |
| ------------------------------------------- | -------- | -------- |
| （Phase 3 で記録された MINOR があれば記録） | -        | -        |

### 4. 受入条件の中間確認

| AC   | 条件                           | 状態 |
| ---- | ------------------------------ | ---- |
| AC-1 | 3ハンドラが登録されている      | -    |
| AC-2 | ApprovalGate が DI 注入        | -    |
| AC-3 | execution API が公開されている | -    |
| AC-4 | Push 通知が動作                | -    |
| AC-5 | revokeAll() が呼ばれる         | -    |
| AC-6 | 全テスト PASS                  | -    |

## 参照資料

| 参照資料                     | パス                                 |
| ---------------------------- | ------------------------------------ |
| Phase 7 カバレッジレポート   | `outputs/phase-7/coverage-report.md` |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md` |

## 統合テスト連携【必須】

| 判定項目             | 基準       | 結果（実行時に記録） |
| -------------------- | ---------- | -------------------- |
| typecheck PASS       | エラー 0件 | -                    |
| lint PASS            | エラー 0件 | -                    |
| 全テスト PASS        | 100%       | -                    |
| カバレッジ全目標達成 | 3指標全て  | -                    |

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全チェック結果 |

## 完了条件

- [ ] typecheck がエラー 0件
- [ ] lint がエラー 0件
- [ ] 全テストが PASS
- [ ] カバレッジが全目標値を達成
- [ ] Phase 3 MINOR 指摘が全て解決されている
- [ ] AC-1〜AC-5 の中間確認が完了している
- [ ] `outputs/phase-9/quality-report.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
