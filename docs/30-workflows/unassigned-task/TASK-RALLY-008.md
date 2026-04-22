# TASK-RALLY-008: processWorkflowOutcome fire-and-forget修正

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・エラーハンドリングギャップ分析
- 優先度: Medium
- GitHub Issue: #2393
- Wave: 3（RALLY-006完了後）
- 前提タスク: RALLY-006（useEffect依存配列修正）
- 衝突ドメイン: SkillLifecyclePanel
- 実装種別: NON_VISUAL（UI変化なし）
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

## 目的

`processWorkflowOutcome` の呼び出しを fire-and-forget（`void processWorkflowOutcome(...)`）から `await + try/catch` パターンに統一し、非同期エラーが握りつぶされる問題を修正する。

## 背景

現状 `processWorkflowOutcome` は fire-and-forget で呼び出されており、Promise rejection が握りつぶされている。RALLY-006 で useEffect の依存配列を修正した後、このエラーハンドリング欠如を修正する。エラーを適切に catch することでラリーループのエラー回復（RALLY-012）の前提を整える。

## 実行タスク

- [ ] `processWorkflowOutcome` の全呼び出し箇所を `rg` で特定する
- [ ] fire-and-forget を `await + try/catch` に書き換える
- [ ] catch ブロックでエラーをログ出力またはエラー状態に反映する
- [ ] 非同期エラーのテストケースを追加する

## 完了条件

- [ ] `processWorkflowOutcome` の呼び出しが全て `await + try/catch` になっていること
- [ ] エラー時に unhandled rejection が発生しないことを確認済みであること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所             | 問題                                                                        | 解決策                                                  |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| useEffect内のasync   | useEffect コールバックは async にできない                                   | 内部に async IIFE を定義するか、外部関数を await で呼ぶ |
| エラー後の状態整合性 | try/catch後にコンポーネントがアンマウントされていると setState が警告を出す | アンマウントフラグ（isMounted ref）でガード             |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave3-seq-RALLY-008/`
- 前提: TASK-RALLY-006（useEffect依存配列修正）
- 後続: TASK-RALLY-012（エラー回復導線の前提）
