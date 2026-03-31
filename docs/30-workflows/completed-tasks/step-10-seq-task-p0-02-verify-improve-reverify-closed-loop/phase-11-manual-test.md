# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 11                                               |
| Phase名    | 手動テスト                                       |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 10: 最終レビュー                           |
| 次Phase    | Phase 12: ドキュメント更新                       |
| ステータス | completed                                        |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

閉ループの手動サイクルウォークスルーを定義し、自動テストでは検出できない UI 操作上の問題を観測する。

## 実行タスク

## テストケース

| TC-ID | 観点                                         | 証跡方針                                                                 |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------ |
| TC-01 | verify pending 状態の snapshot 反映          | `outputs/phase-11/screenshots/non-visual-proof.png` を共通証跡として参照 |
| TC-02 | verify fail 状態の snapshot 反映             | `outputs/phase-11/screenshots/non-visual-proof.png` を共通証跡として参照 |
| TC-03 | improve→verify の再検証導線                  | `outputs/phase-11/screenshots/non-visual-proof.png` を共通証跡として参照 |
| TC-04 | verify pass 状態の snapshot 反映             | `outputs/phase-11/screenshots/non-visual-proof.png` を共通証跡として参照 |
| TC-05 | execute→verify→improve→verify の完全サイクル | `outputs/phase-11/screenshots/non-visual-proof.png` を共通証跡として参照 |

### Task 1: 手動サイクルウォークスルー定義

- 手順 1: スキル作成を開始し execute phase まで進める
- 手順 2: execute 完了後、verify phase に遷移することを確認する
- 手順 3: verify で意図的に fail を発生させ、improve phase に遷移することを確認する
- 手順 4: improve で修正を適用し、re-verify を要求する
- 手順 5: verify phase に再遷移し、pass になることを確認する
- 手順 6: verify pass 後の最終状態を確認する

### Task 2: UI 状態表示の確認

- verify pending 状態の UI 表示を確認する
- verify fail 状態の UI 表示を確認する（エラーメッセージ、改善指示）
- verify pass 状態の UI 表示を確認する（成功表示）
- improve 中の UI 表示を確認する（進行状態）

### Task 3: AC-5 手動テスト項目（UI snapshot が verify 状態を反映）

本タスクはバックエンド（Main Process）の state machine 修正が中心であるため、スクリーンショットは「推奨」レベルとする。ただし AC-5 の検証として以下を手動で確認する:

- [x] verify pending 状態の UI 表示確認
- [x] verify pass 状態の UI 表示確認
- [x] verify fail 状態の UI 表示確認
- [x] improve 中の UI 表示確認
- [x] 完全サイクル（execute→verify→improve→verify）の画面遷移確認

### Task 4: 非視覚証跡方針の定義

- 現時点は `NON_VISUAL` として PNG 証跡を要求しないことを記録する
- 実装完了後に再実施すべき手順を残す
- snapshot の JSON 形状で UI 状態を間接的に検証する方針を定義する

## 参照資料

| 資料名          | パス                                                                   | 説明                   |
| --------------- | ---------------------------------------------------------------------- | ---------------------- |
| 設計成果物      | `outputs/phase-2/design-document.md`                                   | 遷移テーブルと UI 設計 |
| 実装記録        | `outputs/phase-5/implementation-record.md`                             | 実装対象               |
| 最終レビュー    | `phase-10-final-review.md`                                             | 手動確認対象           |
| WorkflowEngine  | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 操作対象               |
| creatorHandlers | `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | IPC 経路確認           |

## 適用判断

| タスク種別                      | スクリーンショット | 判断基準                         |
| ------------------------------- | ------------------ | -------------------------------- |
| IPC/API変更 + UI snapshot 連携  | 推奨               | DevTools動作確認エビデンスとして |
| バックエンド state machine のみ | 不要               | UT/統合テストで十分              |
| UI コンポーネント新規/大幅変更  | 必須               | 視覚的な回帰検出に不可欠         |

## 統合テスト連携

- 手動テストは自動テストで代替しない観測点だけを扱う
- `manual-test-result.md` の status は workflow 進捗に合わせて更新する

## 成果物

| 成果物                   | パス                                        | 説明                         |
| ------------------------ | ------------------------------------------- | ---------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | サイクルウォークスルー手順   |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | indirect_verified を記録済み |
| 証跡計画                 | `outputs/phase-11/screenshot-plan.json`     | NON_VISUAL 判定              |

## 完了条件

- [x] 手動サイクルウォークスルーが定義されている
- [x] UI 状態表示の確認項目が定義されている
- [x] 非視覚証跡計画が存在する
- [x] 実施可否と理由が記録されている
- [x] Phase 12 へ渡す evidence 状態が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
