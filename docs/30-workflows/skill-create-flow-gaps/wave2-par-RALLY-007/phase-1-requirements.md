# Phase 1: 要件定義

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| 機能名     | TASK-RALLY-007                  |
| タスク名   | addAssistantMessage依存配列修正 |
| 前提Phase  | -                               |
| 後続Phase  | Phase 2                         |
| 作成日     | 2026-04-21                      |
| ステータス | pending                         |

## SubAgentチーム編成

| SubAgent   | 担当                                                                | 実行形態          |
| ---------- | ------------------------------------------------------------------- | ----------------- |
| SubAgent-A | useInterviewState.tsのコード調査（依存配列・stale closure箇所特定） | 並列              |
| SubAgent-B | 受け入れ基準の整理・ESLintルール確認                                | 並列              |
| SubAgent-C | A/B結果統合・要件定義書策定                                         | 直列（A,B完了後） |

## 目的

`useInterviewState.ts` の `addAssistantMessage` useCallbackが`currentStepIndex`に依存しており、
stale closureによって古い値を参照するリスクを排除する要件を確定する。

## 背景

`addAssistantMessage`の`useCallback`依存配列に`currentStepIndex`が含まれているため、
`steps`配列更新後・`currentStepIndex`更新前の短い時間窓でメッセージ追加が呼ばれると、
古い`stepIndex`でメッセージが追加されるstale closure問題が発生しうる。
また`setTotalSteps(currentStepIndex + 1)`が`currentStepIndex`をクロージャで直接参照しており、
同様のstale closure問題を抱えている。

## 実行タスク

- SubAgent-A: `useInterviewState.ts`の`addAssistantMessage`・`currentStepIndex`・`setTotalSteps`・`useCallback`・`useRef`の全使用箇所をコード調査する
- SubAgent-A: ESLint `react-hooks/exhaustive-deps`の現状警告を確認する
- SubAgent-B: 受け入れ基準AC-1〜AC-7を策定する
- SubAgent-C: A/B結果を統合し要件定義書を完成させる

## 参照資料

| 資料名           | パス                                                                    | 用途                  |
| ---------------- | ----------------------------------------------------------------------- | --------------------- |
| 対象ファイル     | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts` | コード調査対象        |
| 設計ドキュメント | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md`  | RALLY-007設計方針参照 |
| 既存index.md     | `docs/30-workflows/skill-create-flow-gaps/p07-par-RALLY-007/index.md`   | タスク概要参照        |

## 成果物

| 成果物         | パス                                         | 説明                   |
| -------------- | -------------------------------------------- | ---------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件   |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-7一覧         |
| コード調査結果 | `outputs/phase-1/code-investigation.md`      | 対象ファイルの現状分析 |

## 完了条件

- [ ] `addAssistantMessage`の依存配列に`currentStepIndex`が含まれていることを確認
- [ ] `setTotalSteps`の呼び出しパターンを特定
- [ ] 受け入れ基準AC-1〜AC-7が策定されていること
- [ ] 要件定義書が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
