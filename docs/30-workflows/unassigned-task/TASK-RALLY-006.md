# TASK-RALLY-006: L675-708 useEffect依存配列修正

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・React hooks循環リスク分析
- 優先度: Medium
- GitHub Issue: #2391
- Wave: 2（RALLY-005完了後）
- 前提タスク: RALLY-005（workflowSnapshot更新権限設計確立）
- 後続タスク: RALLY-008（processWorkflowOutcome fire-and-forget修正）
- 衝突ドメイン: SkillLifecyclePanel
- 実装種別: NON_VISUAL（UI変化なし）
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` (L675-708)

## 目的

SkillLifecyclePanel の L675-708 useEffect の依存配列から `workflowSnapshot?.planId` を除去し、useRef パターンで循環リスクを排除する。RALLY-005 で確立した更新権限設計を受けて、副作用フックの不要な再実行を防止する。

## 背景

L675-708 の useEffect は `workflowSnapshot?.planId` を依存配列に含んでいるが、この値が更新されるたびにエフェクトが再実行され、スナップショット更新 → エフェクト再実行 → スナップショット更新という循環リスクが潜在する。RALLY-005 で seqNo 制御が導入された後、このエフェクトの依存配列を最小化する必要がある。

## 実行タスク

- [ ] L675-708 の useEffect 依存配列を調査・分析する
- [ ] `workflowSnapshot?.planId` を useRef でキャプチャするパターンに書き換える
- [ ] 変更後に循環リスクが消滅していることを確認する
- [ ] 既存テストが PASS することを検証する

## 完了条件

- [ ] L675-708 useEffect の依存配列から `workflowSnapshot?.planId` が除去されていること
- [ ] useRef パターンが正しく実装されていること
- [ ] 循環再実行が発生しないことをテストで検証済みであること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                         | 問題                                                           | 解決策                                                         |
| -------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| useRef vs useState の選択        | 参照のみ必要な値に useState を使うと不要な再レンダリングが発生 | 再レンダリングを引き起こさない値は useRef でキャプチャ         |
| eslint-plugin-react-hooks の警告 | 依存配列からの削除で exhaustive-deps 警告が出る可能性          | useRef に移した後、eslint-disable コメント不要になることを確認 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave2-seq-RALLY-006/`
- 前提: TASK-RALLY-005（IPC権限設計確立）
- 後続: TASK-RALLY-008（fire-and-forget修正）
