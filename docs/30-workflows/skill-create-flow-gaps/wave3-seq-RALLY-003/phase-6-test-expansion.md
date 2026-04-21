# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 5                  |
| 後続Phase  | Phase 7                  |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

実装後のテスト状況を確認し、異常系・境界値・E2E シナリオを追加する。

## テスト拡充方針

### 追加テストシナリオ

| 追加シナリオ                                       | 期待結果                                                | 優先度 |
| -------------------------------------------------- | ------------------------------------------------------- | ------ |
| Undo を連続で複数回呼ぶ                            | 各 Undo ごとにサーバー状態が巻き戻される                | 高     |
| rollbackLastInput が部分的に失敗した場合の UI 状態 | エラー表示・ローカル Undo は適用済み                    | 高     |
| planId が変更された後の Undo                       | 新 planId で undoUserInput が呼ばれる                   | 中     |
| 最初のステップで Undo した場合                     | rollbackLastInput がエラーをスロー、UI は適切に処理する | 中     |

### 回帰テスト確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose
pnpm --filter @repo/shared test -- --reporter=verbose
```

## 参照資料

| 資料名       | パス                                        | 用途           |
| ------------ | ------------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                     |
| ---------------- | ------------------------------------------- | ------------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加したテストケース一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全テスト実行結果         |
| 異常系結果       | `outputs/phase-6/edge-case-result.md`       | 境界値・異常系テスト結果 |

## 完了条件

- [ ] 異常系・境界値テストを追加した
- [ ] 全テストが通過していることを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 7: テストカバレッジ確認
