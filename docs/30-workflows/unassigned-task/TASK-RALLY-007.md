# TASK-RALLY-007: addAssistantMessage依存配列修正

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・stale closure分析
- 優先度: Medium
- GitHub Issue: #2392
- Wave: 2（独立タスク、並列実行可）
- 前提タスク: なし（独立）
- 衝突ドメイン: useInterviewState
- 実装種別: NON_VISUAL（UI変化なし）
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`

## 目的

`useInterviewState.ts` の `addAssistantMessage` useCallback の依存配列から `currentStepIndex` を除去し、stale closure を排除する。`setState(prev => ...)` パターンと useRef を組み合わせて最新値を参照する。

## 背景

`addAssistantMessage` は `useCallback` でメモ化されているが、依存配列に `currentStepIndex` が含まれているため、ステップが変わるたびに関数が再生成される。これにより呼び出し元コンポーネントの再レンダリングが連鎖する。また、stale closure の問題で古い `currentStepIndex` を参照するリスクもある。Wave 2 の他タスク（RALLY-006, RALLY-009）と独立しているため並列実行可。

## 実行タスク

- [ ] `addAssistantMessage` の依存配列と stale closure リスクを分析する
- [ ] `setState(prev => ...)` パターンで `currentStepIndex` の直接参照を削除する
- [ ] 必要に応じて useRef で最新値をキャプチャする
- [ ] 変更後の動作をテストで検証する

## 完了条件

- [ ] `addAssistantMessage` の依存配列から `currentStepIndex` が除去されていること
- [ ] stale closure が発生しないことをテストで確認済みであること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                  | 問題                                            | 解決策                                            |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| stale closure の再現      | テストでstale closureを意図的に起こすのが難しい | vi.useFakeTimers と非同期更新の組み合わせで再現   |
| setState(prev=>) の型推論 | prev の型が any になりやすい                    | 明示的な型アノテーションで prev: StateType を指定 |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave2-par-RALLY-007/`
- 依存なし（Wave 2 内で並列実行可）
