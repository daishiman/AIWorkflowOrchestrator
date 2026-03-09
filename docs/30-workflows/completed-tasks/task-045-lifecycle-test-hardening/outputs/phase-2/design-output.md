# Phase 2: 設計 - 実行結果

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-G |
| Phase    | 2 - 設計   |
| 実行日   | 2026-03-09 |

## SubAgent 設計確定

| SubAgent | 役割                           | 対象ファイル                                                                                   | 実行順    |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------- | --------- |
| G1       | create/list/view 往復          | `SkillCreateWizard.test.tsx`, `SkillManagementPanel.integration.test.tsx`                      | G2 と並列 |
| G2       | analyze/improve/store 状態遷移 | `SkillAnalysisView.test.tsx`, `useSkillAnalysis.test.ts`, `agentSlice.skill-lifecycle.test.ts` | G1 と並列 |
| G3       | ChatPanel 回帰 / gate 統合     | `ChatPanel.skill-management.test.tsx`, Phase 7-13 成果物                                       | G1/G2 後  |

## 回帰観点マッピング確定

| RT-ID | 内容                                   | 主対象                                      | 補助対象                                                                    | SubAgent |
| ----- | -------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| RT-01 | 作成後一覧同期                         | `SkillCreateWizard.test.tsx`                | `SkillManagementPanel.integration.test.tsx`                                 | G1       |
| RT-02 | 改善後再分析                           | `SkillAnalysisView.test.tsx`                | `useSkillAnalysis.test.ts`, `agentSlice.skill-lifecycle.test.ts`            | G2       |
| RT-03 | 全自動改善後再分析                     | `SkillAnalysisView.test.tsx`                | `useSkillAnalysis.test.ts`, `agentSlice.skill-lifecycle.test.ts`            | G2       |
| RT-04 | エラー回復                             | `SkillAnalysisView.test.tsx`                | `agentSlice.skill-lifecycle.test.ts`                                        | G2       |
| RT-05 | ビュー再開時状態初期化                 | `SkillManagementPanel.integration.test.tsx` | `ChatPanel.skill-management.test.tsx`                                       | G1+G3    |
| RT-06 | analyze -> improve -> reanalyze フロー | `useSkillAnalysis.test.ts`                  | `SkillAnalysisView.test.tsx`, `agentSlice.skill-lifecycle.test.ts`          | G2       |
| RT-07 | 並行操作防止                           | `SkillAnalysisView.test.tsx`                | `agentSlice.skill-lifecycle.test.ts`, `ChatPanel.skill-management.test.tsx` | G2+G3    |

## ファイル別設計確定

### G1

| ファイル                                    | 方針                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| `SkillCreateWizard.test.tsx`                | create action 引数、成功完了、失敗時メッセージの回帰を固定 |
| `SkillManagementPanel.integration.test.tsx` | create / analysis view 往復、一覧維持、検索状態維持を固定  |

### G2

| ファイル                             | 方針                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| `SkillAnalysisView.test.tsx`         | mount 時 analyze、retry、apply / autoImprove、disabled 状態を固定 |
| `useSkillAnalysis.test.ts`           | hook の選択状態、confirm 分岐、改善アクション委譲を固定           |
| `agentSlice.skill-lifecycle.test.ts` | state/action の成功・失敗・再試行を slice 単位で固定              |

### G3

| ファイル                              | 方針                                             |
| ------------------------------------- | ------------------------------------------------ |
| `ChatPanel.skill-management.test.tsx` | top-level toggle と `isExecuting` 連動だけを守る |

## 設計ルール確定

- P50: 既存 suite を確認してから成果物を固定する
- P31: 合成 Hook の新設ではなく既存個別セレクタを優先する
- P39: happy-dom では `fireEvent` を使う（`userEvent` 禁止）
- P42: 文字列引数に `.trim()` バリデーション
- P43: G1 / G2 を並列に進めても、G3 は G1/G2 の結果を受けてから統合する
- no-PR: Phase 13 は PR 作成ではなく完了確認のみ

## 実行順確定

1. G1 / G2 を並列で設計・実装する
2. G3 で ChatPanel 回帰と品質ゲートを統合する
3. Phase 7 以降は G3 主導で結果を集約する

## 完了条件チェック

- [x] RT-01〜RT-07 の割当先が既存ファイルへ明記されている
- [x] 新規ファイル前提が除去されている
- [x] `SkillEditor` backlog が別タスクとして分離されている
- [x] Phase 9 / 11 / 13 に環境 preflight と no-PR が反映されている
