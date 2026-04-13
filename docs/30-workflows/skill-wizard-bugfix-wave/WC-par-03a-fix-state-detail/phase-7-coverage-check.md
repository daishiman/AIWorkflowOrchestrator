# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 7                            |
| Phase名    | カバレッジ確認               |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 6: テスト拡充          |
| 次Phase    | Phase 8: リファクタリング    |
| ステータス | pending                      |
| 作成日     | 2026-04-12                   |

## 目的

AC-1〜AC-5とconcern coverageを照合し、
4件のバグ再発ポイントのカバレッジ抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ照合

- AC-1（internalAnswersリセット）のテスト対応表を作成する
- AC-2（キャンセルボタン表示・遷移）のテスト対応表を作成する
- AC-3（resolveExternalIntegration再計算）のテスト対応表を作成する
- AC-4（generationLockRefリセット）のテスト対応表を作成する
- AC-5（回帰なし）のテスト対応表を作成する

### Task 2: concern coverageの確認

- `ConversationRoundStep`のuseEffect・internalAnswers・answers propの3観点を個別concernとして確認する
- `GenerateStep`のtemplateモード分岐・エラー状態・キャンセルハンドラーの3観点を確認する
- `SkillCreateWizard`のresolveExternalIntegration再計算・generationLockRef finally節の2観点を確認する

### Task 3: カバレッジ抜けの解消

- カバレッジ抜けが発見された場合はPhase 6の拡充対象として記録する
- 行数カバレッジよりconcern coverageを優先して判定する

## 参照資料

| 資料名         | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| テスト拡充記録 | `phase-6-test-expansion.md`                | coverage対象   |
| 実装記録       | `outputs/phase-5/implementation-record.md` | coverageの根拠 |

## 統合テスト連携

- AC-1〜AC-5のすべてに対応するテストが存在することを確認する
- リトライ→リセット→再入力の一連フローがcoverageの中核ケースとして計上されていることを確認する

## 成果物

| 成果物             | パス                                 | 説明                |
| ------------------ | ------------------------------------ | ------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ACとconcernの対応表 |

## 完了条件

- [ ] AC-1〜AC-5の対応表がある
- [ ] concern coverageの抜けがない
- [ ] 3ファイルの変更箇所がすべてcoverageに含まれている
- [ ] Phase 8に渡す重複削減候補が整理されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
