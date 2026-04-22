# TASK-RALLY-002: restoredPendingRequest合成ルール明確化

## メタ情報

- 検出元: TASK-RALLY-001 (SkillLifecyclePanel dead code削除) Phase 12 レビュー
- 優先度: Medium
- GitHub Issue: #2387
- Wave: 0（RALLY-001, RALLY-004 と並列実行可）
- 後続タスク: RALLY-010（ラリー完了状態UI表示）
- 衝突ドメイン: ConversationalInterview
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 目的

`restoredPendingRequest` の合成時、複数フィールド（選択肢・自由記述等）の優先ルールを明文化し、セッション復元後に意図しない値が上書きされるバグを排除する。

## 背景

ラリー機能のセッション復元フロー（`restoredPendingRequest`）では、中断前のユーザー入力と新たな IPC push イベントが合成される。どのフィールドが優先されるかのルールが暗黙的であり、テストも存在しない。RALLY-001 で dead code を削除した結果、合成ロジックの責務がより明確になったが、合成ルール自体は未定義のまま。

## 実行タスク

- [ ] `restoredPendingRequest` 合成ロジックの現状コードを調査する
- [ ] フィールド優先ルールを設計・コメントで明示する
- [ ] ユニットテストを追加する（セッション復元シナリオ）
- [ ] ConversationalInterview.tsx の当該箇所をリファクタリングする

## 完了条件

- [ ] 合成ルールがコードコメントまたは JSDoc で明示されていること
- [ ] 優先ルールをカバーするユニットテストが全 PASS すること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                      | 問題                                                    | 解決策                                       |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| dead code判定の確実性         | 削除対象が本当に未使用か二重確認が必要                  | `rg` で全参照を検索してから削除              |
| IPC invoke vs push の権限競合 | 戻り値とpushイベントの両方が同一stateを更新しようとする | RALLY-005でseqNo/timestamp排他制御を確立予定 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/`
- 依存元: TASK-RALLY-001（dead code削除により責務境界が明確化）
- 後続: TASK-RALLY-010（ラリー完了状態UI表示）
