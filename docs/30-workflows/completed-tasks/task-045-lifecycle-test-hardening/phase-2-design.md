# Phase 2: 設計 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-10A-G                |
| Phase    | 2 - 設計                  |
| 前Phase  | `phase-1-requirements.md` |
| 次Phase  | Phase 3（設計レビュー）   |

## 目的

RT-01〜RT-07 を **既存ファイルへ配線する設計** を確定する。新規ファイル前提ではなく、どの suite を拡張するかを明示する。

## SubAgent 設計

| SubAgent | 役割                           | 対象ファイル                                                                                   |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| G1       | create/list/view 往復          | `SkillCreateWizard.test.tsx`, `SkillManagementPanel.integration.test.tsx`                      |
| G2       | analyze/improve/store 状態遷移 | `SkillAnalysisView.test.tsx`, `useSkillAnalysis.test.ts`, `agentSlice.skill-lifecycle.test.ts` |
| G3       | ChatPanel 回帰 / gate 統合     | `ChatPanel.skill-management.test.tsx`, Phase 7-13 文書                                         |

## 回帰観点マッピング

| RT-ID | 内容                                 | 主対象                                      | 補助対象                                                                    |
| ----- | ------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------- |
| RT-01 | 作成後一覧同期                       | `SkillCreateWizard.test.tsx`                | `SkillManagementPanel.integration.test.tsx`                                 |
| RT-02 | 改善後再分析                         | `SkillAnalysisView.test.tsx`                | `useSkillAnalysis.test.ts`, `agentSlice.skill-lifecycle.test.ts`            |
| RT-03 | 全自動改善後再分析                   | `SkillAnalysisView.test.tsx`                | `useSkillAnalysis.test.ts`, `agentSlice.skill-lifecycle.test.ts`            |
| RT-04 | エラー回復                           | `SkillAnalysisView.test.tsx`                | `agentSlice.skill-lifecycle.test.ts`                                        |
| RT-05 | ビュー再開時状態初期化               | `SkillManagementPanel.integration.test.tsx` | `ChatPanel.skill-management.test.tsx`                                       |
| RT-06 | analyze → improve → reanalyze フロー | `useSkillAnalysis.test.ts`                  | `SkillAnalysisView.test.tsx`, `agentSlice.skill-lifecycle.test.ts`          |
| RT-07 | 並行操作防止                         | `SkillAnalysisView.test.tsx`                | `agentSlice.skill-lifecycle.test.ts`, `ChatPanel.skill-management.test.tsx` |

## ファイル別設計

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

| ファイル                              | 方針                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `ChatPanel.skill-management.test.tsx` | top-level toggle と `isExecuting` 連動だけを守る                          |
| Phase 7-13 成果物                     | `vitest` preflight、環境 blocker 分離、Phase 12 5成果物、no-PR 方針を固定 |

## 設計ルール

- P50: 既存 suite を `rg --files` で確認してから成果物を固定する。
- P31: 合成 Hook の新設ではなく既存個別セレクタを優先する。
- P39: happy-dom では `fireEvent` を使う。
- P43: G1 / G2 を並列に進めても、G3 は G1/G2 の結果を受けてから統合する。
- user 指示により、Phase 13 は PR 作成ではなく完了確認のみを書く。

## 実行順

1. G1 / G2 を並列で設計・実装する。
2. G3 で ChatPanel 回帰と品質ゲートを統合する。
3. Phase 7 以降は G3 主導で結果を集約する。

## 完了条件

- [x] RT-01〜RT-07 の割当先が既存ファイルへ明記されている
- [x] 新規ファイル前提が除去されている
- [x] `SkillEditor` backlog が別タスクとして分離されている
- [x] Phase 9 / 11 / 13 に環境 preflight と no-PR が反映されている

## テンプレート準拠追補

## 実行タスク

- T1: RT-01〜RT-07 を既存 suite へ割り当てる
- T2: G1 / G2 / G3 の関心ごと分離と並列順を固定する
- T3: Phase 7-13 へ品質ゲート前提を引き渡す

## 参照資料

| 参照資料           | パス                                                                                        | 用途                               |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| 依存Phase 1        | `phase-1-requirements.md`                                                                   | 要件と受入基準の整合確認           |
| 状態管理仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | RT-01〜RT-07 の根拠                |
| UI仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Skill 管理 UI の境界確認           |
| Skill実行I/F仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | analyze/improve/execute の境界確認 |
| IPC契約仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC戻り値/エラー契約確認           |
| Agent実行UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                | 実行中 disabled 契約確認           |
| SkillStream UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`           | stream表示契約確認                 |
| テストパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | 既存 suite 追記方針                |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P31 / P39 / P50 の再発防止         |

## 実行手順

1. Phase 1 の REQ と handoff を読み直す
2. RT-ID ごとに主対象 / 補助対象の suite を決める
3. 並列可能範囲を G1 / G2 に限定し、G3 を後置する

## 統合テスト連携

| 連携面     | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| G1 ↔ G2    | create 後の analysis 導線が別 suite で矛盾しないよう割当てる     |
| G2 ↔ G3    | `isExecuting` / toggle / disabled 契約をつなぐ                   |
| Phase 7-11 | 同じ suite 一覧を coverage / quality / manual smoke の基準に使う |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                   |
| ------------------ | ---- | ------------------------------------------ |
| アーキテクチャ     | ✅   | Main IPC と Renderer test の責務分離       |
| UI/UX              | ✅   | view 往復・toggle・disabled 契約の設計     |
| エラーハンドリング | ✅   | env blocker と product failure の分離      |
| パフォーマンス     | △    | 既存 fixture / targeted suite を再利用する |

## 成果物

| 成果物     | パス                | 説明                                 |
| ---------- | ------------------- | ------------------------------------ |
| 設計仕様書 | `phase-2-design.md` | RT マッピング、SubAgent 境界、並列順 |
| タスク概要 | `index.md`          | 全 Phase の依存と成果物一覧          |

## サブタスク管理

1. Phase 1 の要件読み直し
2. RT-ID の suite 割当
3. G1 / G2 / G3 の責務分離確認
4. Phase 7-13 の品質ゲート条件反映

## タスク100%実行確認

- [x] RT-01〜RT-07 を既存 suite へ割当済み
- [x] 並列実行境界と依存順を明記済み
- [x] preflight / no-PR / backlog 分離を設計へ反映済み

## 次のPhase

Phase 3（設計レビュー）
