# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| Phase名    | 手動テスト                      |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 10: 最終レビュー          |
| 次Phase    | Phase 12: ドキュメント更新      |
| ステータス | pending                         |
| 視覚種別   | 機能中心（UI大幅変更なし）      |
| 作成日     | 2026-04-14                      |

## 目的

`runCreateWorkflow` の実装変更に伴う動作を実アプリで確認し、Phase 12 に渡す手動検証エビデンスを作成する。
UIの大幅な見た目変更はないが、`create` モードの実フロー確認は手動テスト対象とする。

## 実施前提と判定基準

- 前提1: Phase 10 の gate 判定が `PASS` または `MINOR` であること
- 前提2: タスクA（`TASK-SC-FIX-GENERATE-SKILL-MD-001`）の `--plan / --output` 接続が利用可能であること
- 前提3: `pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck && pnpm --filter @repo/desktop test` が通過していること
- 判定: 本Phaseの結果は `PASS` / `FAIL` / `BLOCKED` のいずれかで記録し、`N/A` は使用しない

## 手動テスト手順

### Task 1: アプリ起動とcreateモードのスキル作成

- アプリを起動し、Skill Centerからスキル新規作成を選択する
- `mode:"create"` でスキル作成フローを実行する
- `resourceLoader.loadAgent` が呼ばれたことをアプリのログで確認する

### Task 2: descriptionの反映確認

- スキル作成フォームに任意の `description` を入力する
- 作成完了後、生成された `SKILL.md` を開く
- `description` フィールドに入力内容が正しく反映されていることを目視確認する

### Task 3: エラー時フォールバックの確認

- `loadAgent` が失敗する環境（agentファイル未配置など）でスキル作成を実行する
- エラーが発生してもスキル作成フロー自体は完了することを確認する
- フォールバック時の最小JSONが使用されたことをログで確認する

### Task 4: collaborativeモードへの影響なし確認

- `mode:"collaborative"` でスキル作成フローを実行する
- `runCreateWorkflow` が呼ばれないことをログで確認する
- 既存の collaborative フローが正常に動作することを確認する

## 参照資料

| 資料名               | パス                                      | 説明             |
| -------------------- | ----------------------------------------- | ---------------- |
| 設計書               | `outputs/phase-2/design.md`               | 観測すべき動作   |
| 実装計画             | `outputs/phase-5/implementation-plan.md`  | 実装対象         |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md` | 境界ケース       |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`      | concern coverage |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`   | 命名と実装方針   |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`       | blocker有無      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md` | 手動確認対象     |

## 統合テスト連携

- 手動テストは自動テストで代替できない最終確認（実フロー・ログ観測）を担当する
- `manual-test-result.md` は `PASS` / `FAIL` / `BLOCKED` のいずれかで記録する
- `BLOCKED` の場合は blocker（例: タスクA未完了、環境不足）を明記して Phase 12 へ引き継ぐ

## 成果物

| 成果物                   | パス                                        | 説明                               |
| ------------------------ | ------------------------------------------- | ---------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施項目と判定観点                 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | PASS / FAIL / BLOCKED の結果と証跡 |

## 完了条件

- [ ] 実施前提（gate・依存・コマンド結果）が明記されている
- [ ] createモード・descriptionの反映・フォールバック・collaborativeモードの4観点が検証されている
- [ ] `manual-test-result.md` に PASS / FAIL / BLOCKED のいずれかが記録されている
- [ ] BLOCKEDの場合に原因と解消条件が明記されている
- [ ] Phase 12へ渡すevidence状態が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
