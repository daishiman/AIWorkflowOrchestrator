# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト                   |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 10: 最終レビュー       |
| 次Phase    | Phase 12: ドキュメント更新   |
| ステータス | pending                      |
| 視覚種別   | VISUAL                       |
| 作成日     | 2026-04-12                   |

## 目的

キャンセルボタン追加（問題13修正）を伴う画面変更を視覚的に確認する。
自動テストで代替できないUI観点（ボタンの表示位置・スタイル・クリック動作）を手動で検証する。

## 実行タスク

### Task 1: VISUAL確認項目の定義

**キャンセルボタン確認（AC-2対応）**

- templateモードかつエラー状態でキャンセルボタンが正しい位置に表示されることを目視確認する
- キャンセルボタンのラベル・スタイルが既存UIと整合していることを確認する
- キャンセルボタン押下後にStep 0（スキル情報入力画面）へ遷移することを操作で確認する
- 非templateモードではキャンセルボタンが表示されないことを確認する

**internalAnswersリセット確認（AC-1対応）**

- ウィザードStep 1で回答を入力し、リトライ操作を行った際に入力欄が空値にリセットされることを目視確認する
- 前回の入力値が残留していないことを確認する

### Task 2: 非視覚的確認項目（補足）

- q5変更後にhasExternalIntegration関連のUIが更新されることをコンソールログまたはUI変化で確認する
- generationLockRefのリセットについては自動テストで代替し、手動確認は不要とする

### Task 3: スクリーンショット計画

- キャンセルボタン表示状態（templateモード・エラー状態）のスクリーンショットを取得する
- キャンセルボタン非表示状態（非templateモード）のスクリーンショットを取得する
- Step 0遷移後の画面スクリーンショットを取得する

## 参照資料

| 資料名               | パス                                                                          | 説明             |
| -------------------- | ----------------------------------------------------------------------------- | ---------------- |
| 設計書               | `outputs/phase-2/design-document.md`                                          | 観測すべきUI変更 |
| 実装記録             | `outputs/phase-5/implementation-record.md`                                    | 実装対象         |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`                                     | 境界ケース       |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                          | concern coverage |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`                                       | 命名と実装方針   |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`                                           | blocker有無      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                     | 手動確認対象     |
| 生成ステップ         | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | 画面操作対象     |
| Step 1コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 画面操作対象     |

## 統合テスト連携

- 手動テストは自動テストで代替できない視覚的観測点だけを扱う
- `manual-test-result.md`のstatusはワークフロー進捗に合わせて更新する

## 成果物

| 成果物                   | パス                                        | 説明                 |
| ------------------------ | ------------------------------------------- | -------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施項目             |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 現状はnot_run        |
| 証跡計画                 | `outputs/phase-11/screenshot-plan.json`     | VISUAL判定・証跡計画 |

## 完了条件

- [ ] VISUAL確認項目が定義されている
- [ ] キャンセルボタンの表示・非表示・遷移の3観点が含まれている
- [ ] スクリーンショット計画が存在する
- [ ] Phase 12へ渡すevidence状態が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
