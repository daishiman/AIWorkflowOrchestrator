# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 9                        |
| タスクID   | TASK-RALLY-003           |
| 機能名     | undo-server-rollback-api |
| 前提Phase  | Phase 8                  |
| 後続Phase  | Phase 10                 |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

実装全体の品質を確認し、Phase 10（最終レビューゲート）に進める状態かを判断する。

## 品質チェックリスト

### コード品質

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] IPC 4層（定数・ホワイトリスト・ハンドラ・Preload API）がすべて追加されている
- [ ] `validateSender` が IPC ハンドラに正しく組み込まれている

### テスト品質

- [ ] IPC ハンドラ / Facade / Renderer の全テストが通過している
- [ ] 全既存テストが通過している
- [ ] 主要な追加コードのカバレッジが90%以上である

### 設計整合性

- [ ] RALLY-005 の「invoke を正規ソース」方針と rollback 後の snapshot 返却が整合している
- [ ] ConversationalInterview.tsx の後続変更（RALLY-013）への前提条件が満たされている
- [ ] chain 完了条件（RALLY-UNDO-CHAIN-001）が満たされている

## リスク台帳

| リスク                                   | 発生確率 | 影響度 | 対処状況                   |
| ---------------------------------------- | -------- | ------ | -------------------------- |
| rollbackLastInput のエンジン仕様との競合 | 中       | 高     | Phase 3 レビューで確認済み |
| handleUndo async 化による UI 応答性低下  | 低       | 中     | isSubmitting フラグで管理  |
| RALLY-005 未完了での着手                 | 低       | 高     | Phase 1 で確認済み         |

## 参照資料

| 資料名             | パス                                        | 用途           |
| ------------------ | ------------------------------------------- | -------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 回帰テスト結果     | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| カバレッジ確認結果 | `outputs/phase-7/coverage-check-result.md`  | Phase 7 成果物 |

## 成果物

| 成果物         | パス                                   | 説明                                 |
| -------------- | -------------------------------------- | ------------------------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質チェック結果のサマリー           |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク評価と対処状況                 |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | rollback API追加による連鎖影響の確認 |

## 完了条件

- [ ] 品質チェックリストを全項目確認した
- [ ] リスク台帳を更新した
- [ ] chain 完了条件（RALLY-UNDO-CHAIN-001）の充足を確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 10: 最終レビューゲート
