# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| 機能名     | TASK-RALLY-008                                    |
| タスク名   | processWorkflowOutcomeのfire-and-forget不整合修正 |
| 前提Phase  | Phase 3                                           |
| 後続Phase  | Phase 5                                           |
| 作成日     | 2026-04-21                                        |
| ステータス | pending                                           |

## 目的

fire-and-forget修正に対するテスト仕様を作成し、Red状態（実装前にテストが失敗する状態）を確認する。

## 実行タスク

- TC-1〜TC-5のテスト仕様を作成する
- Vitestでテストファイルを作成する（Red状態確認）
- 統合テスト計画を策定する

## テストケース一覧

| テストケース | 内容                                                              | 期待結果                            |
| ------------ | ----------------------------------------------------------------- | ----------------------------------- |
| TC-1         | handleExecutePlan経由でprocessWorkflowOutcomeが正常完了する       | エラーstateが更新されない           |
| TC-2         | handleExecutePlan経由でprocessWorkflowOutcomeがrejectする         | setError/setWorkflowErrorが呼ばれる |
| TC-3         | useEffect内でprocessWorkflowOutcomeが正常完了する                 | エラーstateが更新されない           |
| TC-4         | useEffect内でprocessWorkflowOutcomeがrejectする                   | setWorkflowErrorが呼ばれる          |
| TC-5         | 全呼び出し箇所でvoid processWorkflowOutcomeの形式が使われていない | コードレビューまたはgrepで確認      |

## 参照資料

| 資料名             | パス                                     | 用途          |
| ------------------ | ---------------------------------------- | ------------- |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md` | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`         | Phase 2成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`       | Phase 3成果物 |

## 成果物

| 成果物         | パス                                       | 説明                 |
| -------------- | ------------------------------------------ | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | TC-1〜TC-5の詳細仕様 |
| Red結果        | `outputs/phase-4/red-test-result.md`       | 実装前テスト失敗記録 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テスト方針       |

## 完了条件

- [ ] TC-1〜TC-5のテスト仕様が作成されていること
- [ ] テストがRed状態（実装前に失敗）であることが確認されていること
- [ ] 統合テスト計画が策定されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
