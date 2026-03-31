# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 10                                               |
| Phase名    | 最終レビュー                                     |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 9: 品質保証                                |
| 次Phase    | Phase 11: 手動テスト                             |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

AC-1〜AC-6 の総合判定を行い、閉ループ修復が完全に機能することを最終確認して手動テストへ進める。

## 実行タスク

### Task 1: AC マトリクス最終照合

- AC-1〜AC-6 が test / code / doc の 3 面で閉じているか確認する:

| AC   | テスト | コード | ドキュメント | 判定 |
| ---- | ------ | ------ | ------------ | ---- |
| AC-1 | -      | -      | -            | -    |
| AC-2 | -      | -      | -            | -    |
| AC-3 | -      | -      | -            | -    |
| AC-4 | -      | -      | -            | -    |
| AC-5 | -      | -      | -            | -    |
| AC-6 | -      | -      | -            | -    |

### Task 2: 閉ループ完全性最終確認

- execute→verify(fail)→improve→verify(pass) の完全サイクルが end-to-end で動作することを最終確認する
- improve→verify と improve→execute の両経路が共存可能であることを確認する
- state machine の不変条件が維持されていることを再確認する

### Task 3: P0-01 統合リスク評価

- TASK-P0-01 が未完了の場合の P0-02 の動作に問題がないことを確認する
- verification engine のフォールバック動作が定義されていることを確認する

### Task 4: gate 判定

- PASS: 手動テストへ進む
- MINOR: 手動テストしながら観測する
- MAJOR: Phase 8 へ戻す

## 参照資料

| 資料名           | パス                                       | 説明             |
| ---------------- | ------------------------------------------ | ---------------- |
| 設計成果物       | `outputs/phase-2/design-document.md`       | 遷移テーブル設計 |
| 実装記録         | `outputs/phase-5/implementation-record.md` | 実装修正の要約   |
| カバレッジ       | `outputs/phase-7/coverage-report.md`       | AC 対応表        |
| 品質保証         | `phase-9-quality-assurance.md`             | gate 入力        |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`  | 判定出力         |

## AC 対応表

| AC   | 条件                                                  | 対応Phase/テスト            | 判定 |
| ---- | ----------------------------------------------------- | --------------------------- | ---- |
| AC-1 | recordVerifyPass() が WorkflowEngine に実装されている | Phase 5 Task 1 / UT         | TBD  |
| AC-2 | verify→improve 遷移が正しく動作する                   | Phase 4 Task 2 / UT         | TBD  |
| AC-3 | improve→verify (re-verify) 遷移が動作する             | Phase 4 Task 2 / UT         | TBD  |
| AC-4 | 完全サイクルがテスト可能                              | Phase 4 Task 2 / 統合テスト | TBD  |
| AC-5 | UI snapshot が verify 状態を反映する                  | Phase 11 / 手動テスト       | TBD  |
| AC-6 | requestReverify() が engine 結果と統合される          | Phase 4 Task 3 / UT         | TBD  |

## システム仕様（aiworkflow-requirements）

本タスクに関連する正本仕様への確認事項:

### IPC 契約チェックリスト

- [ ] `creatorHandlers.ts` の IPC チャネル定義が `packages/shared/src/ipc/channels.ts` と整合している
- [ ] verify/improve 関連の IPC メッセージ型が `packages/shared/src/types/skill-*.ts` に定義されている
- [ ] `preload/skill-api.ts` に verify/improve 操作のブリッジが公開されている
- [ ] safeInvoke のタイムアウト設定が正本仕様と一致している

### Skill Creator Service 仕様

- [ ] `interfaces-agent-sdk-skill-reference.md` の verify/improve 遷移仕様を確認した
- [ ] WorkflowEngine の phase transition spec が正本仕様と一致している
- [ ] `task-workflow-phases.md` のフェーズ遷移テーブルとの整合性を確認した

## 統合テスト連携

- AC とテスト対応表をレビュー結果へ持ち込む
- 閉ループの完全性判定を documentation へ引き継ぐ

## 成果物

| 成果物           | パス                                      | 説明                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC マトリクス、gate 判定 |

## 完了条件

- [ ] AC-1〜AC-6 の総合判定がある
- [ ] 閉ループ完全性が最終確認されている
- [ ] P0-01 統合リスクが評価されている
- [ ] 手動テストへの entry 条件が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)
