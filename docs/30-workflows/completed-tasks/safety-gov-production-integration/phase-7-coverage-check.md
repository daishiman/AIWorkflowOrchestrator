# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 7                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

統合後の全テストが PASS し、カバレッジ目標が達成されていることを確認する。
既存 85 テスト + 新規テスト = 全テスト PASS を検証する。

## 実行タスク

- unit / integration をまとめて再実行し、current 実装の coverage を採取する
- handler 登録、preload 公開、push 通知、revokeAll の concern 別に未達箇所を判定する
- 未達があれば追加テストまたはスコープ調整に差し戻す
- 既存 85 テストとの合算で回帰がないことを確認する

### 1. 全テスト実行

```bash
# 全テスト実行（既存 + 新規）
pnpm --filter @repo/desktop test

# カバレッジ付きで実行
pnpm --filter @repo/desktop test -- --coverage
```

### 2. カバレッジ評価テーブル

| ファイル                                | Line | Branch | Function | 目標達成 |
| --------------------------------------- | ---- | ------ | -------- | -------- |
| `main/ipc/index.ts`（追加部分）         | -    | -      | -        | -        |
| `preload/index.ts`（execution追加部分） | -    | -      | -        | -        |
| `preload/types.ts`                      | -    | -      | -        | -        |
| `renderer/hooks/useApprovalFlow.ts`     | -    | -      | -        | -        |
| `renderer/hooks/useAdvancedConsole.ts`  | -    | -      | -        | -        |

### 3. カバレッジ未達の場合

カバレッジ未達の場合は Phase 6 へ戻りテストを追加する:

| カバレッジ状況 | 対応           |
| -------------- | -------------- |
| Line < 80%     | Phase 6 へ戻る |
| Branch < 60%   | Phase 6 へ戻る |
| Function < 80% | Phase 6 へ戻る |

### 4. テスト総数確認

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose 2>&1 | tail -5
```

期待: 元の 85 テスト + 新規追加分のテストが全 pass

## 参照資料

| 参照資料               | パス                                |
| ---------------------- | ----------------------------------- |
| Phase 6 テスト拡充記録 | `outputs/phase-6/test-expansion.md` |

## 統合テスト連携【必須】

| 判定項目                  | 基準 | 結果（実行時に記録） |
| ------------------------- | ---- | -------------------- |
| 全テスト PASS             | 100% | -                    |
| Line Coverage（新規）     | 80%+ | -                    |
| Branch Coverage（新規）   | 60%+ | -                    |
| Function Coverage（新規） | 80%+ | -                    |

## 成果物

| 成果物             | パス                                 | 説明                 |
| ------------------ | ------------------------------------ | -------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ数値・判定 |

## 完了条件

- [ ] 全テスト（既存 85 + 新規）が PASS
- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成
- [ ] `outputs/phase-7/coverage-report.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
