# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| Phase名    | 手動テスト                                    |
| 対象機能   | TASK-P0-04-manifest-loader-default-activation |
| 前提Phase  | Phase 10: 最終レビュー                        |
| 次Phase    | Phase 12: ドキュメント更新                    |
| ステータス | pending                                       |
| 作成日     | 2026-03-29                                    |

## 目的

実環境ログまたは targeted test の証跡で、manifest 発見 → dynamic pipeline 試行 → fallback / degraded error の一連フローが仕様どおり動作することを確認する。

## 実行タスク

### Task 1: pipeline activation 手動確認

- Electron アプリまたは targeted test のログで、Facade 初期化時の3コンポーネント自動インスタンス化を確認する
- `plan()` / `improve()` が常に dynamic pipeline を試行することをログまたはテスト証跡で確認する
- manifest が自動発見されていることをログで確認する

### Task 2: fallback 手動確認

- manifest ファイルを一時的に削除し、static loader fallback が動作することを確認する
- fallback 発生がログに出力されることを確認する
- manifest を戻した後に dynamic pipeline が復帰することを確認する

### Task 3: 非視覚証跡方針の定義

- 現時点は `NON_VISUAL` として PNG 証跡を要求しないことを記録する
- ログベースの evidence を primary とする
- 実装完了後に再実施すべき手順を残す

### Task 4: 発見事項の記録

- 手動テストで見つかった発見事項を `outputs/phase-11/discovered-issues.md` に記録する
- 発見事項が 0件でも、その旨を明記して空報告にしない
- Phase 12 では `discovered-issues.md` を未タスク検出の一次入力として参照する

## 参照資料

| 資料名           | パス                                                                  | 説明                 |
| ---------------- | --------------------------------------------------------------------- | -------------------- |
| 設計書           | `outputs/phase-2/design-document.md`                                  | 観測すべき活性化条件 |
| 実装記録         | `outputs/phase-5/implementation-record.md`                            | 実装対象             |
| 品質保証         | `outputs/phase-9/quality-report.md`                                   | blocker 有無         |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                             | 手動確認対象         |
| Facade           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 観測対象             |

## 統合テスト連携

- 手動テストは自動テストで代替しない観測点だけを扱う
- `manual-test-result.md` の status は workflow 進捗に合わせて更新する
- 発見事項は `discovered-issues.md` に残し、Phase 12 Task 12-4 の入力に引き継ぐ

## 成果物

| 成果物                   | パス                                        | 説明                |
| ------------------------ | ------------------------------------------- | ------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施項目            |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | NON_VISUAL evidence |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 0件でも出力         |
| 証跡計画                 | `outputs/phase-11/screenshot-plan.json`     | NON_VISUAL 判定     |

## 完了条件

- [ ] 手動観測項目が定義されている
- [ ] 非視覚証跡計画が存在する
- [ ] 実施可否と理由が記録されている
- [ ] Phase 12 へ渡す evidence 状態が明記されている
- [ ] 発見事項が 0件でも `outputs/phase-11/discovered-issues.md` に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
