# Phase 2: 設計

## メタ情報

| 項目                | 内容                                 |
| ------------------- | ------------------------------------ |
| Phase               | 2                                    |
| タスクID            | TASK-SW-TODO-001                     |
| 機能名              | conversation-round-step-todo-cleanup |
| taskType            | NON_VISUAL                           |
| implementation_mode | verify_existing                      |
| 前提Phase           | Phase 1                              |
| 後続Phase           | Phase 3                              |
| 作成日              | 2026-04-20                           |
| ステータス          | completed                            |

## 目的

既存コードと git 履歴を起点に、Phase 4-12 を false work なく閉じる設計へ読み替える。

## 実行タスク

1. Phase 4 を targeted verification に再定義する
2. Phase 5 を diff check / current fact 記録に再定義する
3. Phase 11 を NON_VISUAL evidence ベースに固定する
4. Phase 12 の canonical 6成果物と parity を設計する

## 設計方針

| 論点       | 採用方針                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 実装モード | `verify_existing` に固定する                                                                                   |
| Phase 4    | `rg` / `git log` / code read を中心に既存完了を検証する                                                        |
| Phase 5    | 新規コード変更ではなく diff check と current fact 記録を行う                                                   |
| Phase 11   | `manual-test-checklist.md` / `manual-test-result.md` / `TASK-SW-TODO-001-manual-test-report.md` を主証跡とする |
| Phase 12   | 6成果物 + `artifacts.json` parity + global spec sync 実施結果を明記する                                        |

## 検証マトリクス

| concern          | コマンド / 根拠                                                    | 期待結果 |
| ---------------- | ------------------------------------------------------------------ | -------- |
| cleanup 完了     | `rg` で TODO / badge symbol が 0 件                                | PASS     |
| current contract | `SkillCreateWizard.tsx` の `resolveExternalIntegration(toolNames)` | PASS     |
| 完了履歴         | `git log` に PR #2199 相当 commit がある                           | PASS     |
| path 整合        | `p05-opt-TODO-001/` に artifacts と phase 群が揃う                 | PASS     |
| Phase 12         | 6成果物が揃い future wording がない                                | PASS     |

## 参照資料

| 資料           | パス                                                                          | 用途                  |
| -------------- | ----------------------------------------------------------------------------- | --------------------- |
| Phase 1 成果物 | `outputs/phase-1/requirements-definition.md`                                  | current fact 再確認   |
| 対象実装       | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | cleanup 完了確認      |
| 関連実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | current contract 確認 |

## 統合テスト連携

| 判定項目                 | 基準 | 結果      |
| ------------------------ | ---- | --------- |
| verify_existing 設計     | 完了 | completed |
| NON_VISUAL evidence 設計 | 完了 | completed |
| Phase 12 parity 設計     | 完了 | completed |

## 成果物

| 成果物 | パス                        | 説明                 |
| ------ | --------------------------- | -------------------- |
| 設計書 | `outputs/phase-2/design.md` | verify_existing 設計 |

## 完了条件

- [x] verify_existing 方針を固定した
- [x] Phase 4-5 の役割を再定義した
- [x] Phase 11-12 の evidence 方針を定義した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
