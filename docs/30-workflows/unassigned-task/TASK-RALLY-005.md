# TASK-RALLY-005: workflowSnapshot更新権限設計確立

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・IPC競合ギャップ分析
- 優先度: High
- GitHub Issue: #2390
- Wave: 1（RALLY-001完了後に直列実行）
- 前提タスク: RALLY-001（dead code削除完了 ✅）
- 後続タスク: RALLY-006（useEffect依存配列修正）, RALLY-003（Undo Rollback API）
- chain_id: RALLY-IPC-UNIFY-CHAIN-001 (1/2)
- 衝突ドメイン: SkillLifecyclePanel / RuntimeFacade
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

## 目的

IPC invoke 戻り値を正規ソース（primary source of truth）、IPC push イベントを補完（补完）とする設計を確立する。seqNo / timestamp による排他制御を導入し、ラリーループの冪等性を保証する。Wave 2〜4 の全タスクがこの設計に依存する最重要タスク。

## 背景

RALLY-001 で dead code を削除した結果、`workflowSnapshot` の更新権を IPC invoke 戻り値と IPC push イベントの両方が持つ設計矛盾が露わになった。この設計欠陥がラリーループ全体の冪等性を損なっており、RALLY-006〜013 の修正の前提となる根本設計の確立が必要。

## 実行タスク

- [ ] IPC invoke 戻り値と push イベントの競合パターンを網羅的に分析する
- [ ] seqNo（単調増加カウンター）による更新権排他制御を設計する
- [ ] SkillLifecyclePanel の `workflowSnapshot` 更新ロジックに seqNo チェックを追加する
- [ ] RuntimeFacade 側で seqNo を付与する変更を実装する
- [ ] 設計ドキュメント（ADR相当）を `outputs/` に出力する

## 完了条件

- [ ] invoke 戻り値が push イベントより常に優先されること（seqNo で制御）
- [ ] 競合時に push イベントが無視される動作をテストで検証済みであること
- [ ] 設計ドキュメントが生成されていること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所             | 問題                                                                                  | 解決策                                               |
| -------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| IPC通信の非対称性    | invoke（同期的に戻り値を返す）とpush（非同期で任意タイミングに届く）が同一stateを更新 | seqNo + timestamp の二重チェックで後発イベントを棄却 |
| 冪等性テストの難しさ | 競合条件をテストで再現しにくい                                                        | fake timer + Promise.race で競合シナリオを制御       |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave1-seq-RALLY-005/`
- 前提: TASK-RALLY-001（完了 ✅）
- 後続: TASK-RALLY-006（useEffect循環リスク排除）, TASK-RALLY-003（Rollback API）
