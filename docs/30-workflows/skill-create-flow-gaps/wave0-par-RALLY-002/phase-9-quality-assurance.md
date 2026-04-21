# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |

## 目的

実装全体の品質を確認し、Phase 10（最終レビューゲート）に進める状態かを判断する。

## 品質チェックリスト

### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する（exhaustive-deps 含む）
- [ ] `pendingRequest` 合成式の直上にコメントが存在する
- [ ] `workflowSnapshot?.awaitingUserInput` が非 null のとき `restoredPendingRequest` がクリアされる useEffect が存在する

### テスト品質

- [ ] シナリオテスト（正常系・異常系・境界値）が全通過している
- [ ] 全既存テストが通過している
- [ ] useEffect クリアロジックのカバレッジが100%である

### 設計整合性

- [ ] コメントが実際の動作と一致している
- [ ] 後続タスク（RALLY-010〜013）の前提条件が満たされている
- [ ] ConversationalInterview.tsx が Wave 1 の次の変更を受け入れられる状態になっている

## リスク台帳

| リスク               | 発生確率 | 影響度 | 対処状況                        |
| -------------------- | -------- | ------ | ------------------------------- |
| useEffect の循環     | 低       | 高     | Phase 3 レビューで確認済み      |
| クリア条件の早期発動 | 低       | 中     | Phase 6 境界値テストで確認済み  |
| exhaustive-deps 警告 | 低       | 低     | Phase 5 lint チェックで確認済み |

## 参照資料

| 資料名             | パス                                        | 用途           |
| ------------------ | ------------------------------------------- | -------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 回帰テスト結果     | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| カバレッジ確認結果 | `outputs/phase-7/coverage-check-result.md`  | Phase 7 成果物 |

## 成果物

| 成果物         | パス                                   | 説明                              |
| -------------- | -------------------------------------- | --------------------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質チェック結果のサマリー        |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク評価と対処状況              |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | useEffect追加による連鎖影響の確認 |

## 完了条件

- [ ] 品質チェックリストを全項目確認した
- [ ] リスク台帳を更新した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 10: 最終レビューゲート
