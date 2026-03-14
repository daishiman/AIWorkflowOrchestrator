# 未タスク検出レポート: TASK-SKILL-LIFECYCLE-04 Phase 12

## メタ情報

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-04                   |
| Phase    | 12 (Task 12-4)                            |
| 検出日   | 2026-03-14                                |
| 検出総数 | 2件                                       |
| 発見元   | Phase 10 最終レビュー（PASS + MINOR 2件） |

---

## 検出タスク一覧

| #   | タスクID                         | 内容                                             | 優先度 | ステータス | 指示書パス                                                                                                                              |
| --- | -------------------------------- | ------------------------------------------------ | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TASK-FIX-EVAL-STORE-DISPATCH-001 | handleEvaluatePrompt Store経由化リファクタリング | low    | unassigned | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` |
| 2   | TASK-FIX-SCORE-DELTA-DEDUP-001   | ScoreDelta direction 判定ロジックの重複解消      | low    | unassigned | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md`   |

---

## 各タスクの詳細

### TASK-FIX-EVAL-STORE-DISPATCH-001

- **内容**: `useSkillAnalysis.ts` の `handleEvaluatePrompt` が `window.electronAPI` を直接呼び出している。Store action を経由させるリファクタリングが必要
- **発見元**: Phase 10 最終レビュー FINAL-M-01（「Store dispatch 省略」指摘）
- **優先度**: low（仕様・機能への影響なし。アーキテクチャ原則準拠の改善）
- **対処方針**: `agentSlice.ts` に `evaluatePromptSkill` アクションを追加し、`useSkillAnalysis.ts` を Store action 経由に修正
- **受入基準**: `useSkillAnalysis.ts` が `window.electronAPI` を直接参照しない

### TASK-FIX-SCORE-DELTA-DEDUP-001

- **内容**: `calculateScoreDelta` 関数が `ScoreDisplay.tsx`（ローカル）と `packages/shared/src/types/skill-improver.ts` に二重定義されている
- **発見元**: Phase 10 最終レビュー FINAL-M-02（「direction 判定ロジック二重定義」指摘）
- **優先度**: low（仕様・機能への影響なし。コード重複の解消）
- **対処方針**: `ScoreDisplay.tsx` のローカル定義を削除し、`@repo/shared` の `calculateScoreDelta` を import して使用
- **受入基準**: `ScoreDisplay.tsx` が `@repo/shared` の `calculateScoreDelta` を使用している

---

## P3準拠チェック: 3ステップ全完了確認

| ステップ  | 内容                                                         | 状態 |
| --------- | ------------------------------------------------------------ | ---- |
| ステップ1 | `unassigned-task/` 配下に指示書作成（2ファイル）             | 完了 |
| ステップ2 | `task-workflow-backlog.md` 残課題テーブルへの登録（2件追加） | 完了 |
| ステップ3 | 関連仕様書（`phase-12-documentation.md`）への参照リンク追加  | 完了 |

**P3準拠: 全ステップ完了**

---

## 指定ディレクトリ配置チェック結果

| チェック項目       | 結果                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 今回差分の配置可否 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/` 配下に2件を移管済み                            |
| 今回差分の品質可否 | `--target-file task-fix-eval-store-dispatch-001.md` と `--target-file task-fix-score-delta-dedup-001.md` の個別監査で `currentViolations.total = 0` |
| 参照リンク整合     | `verify-unassigned-links` で missing=0                                                                                                              |

---

## 補足

- 両タスクとも「仕様・機能への影響なし」の実装改善候補
- Phase 11 手動テスト結果（manual-test-result.md）からも新規未タスク検出なし
- 既存 63/63 テスト PASS 状態は維持されている
- GitHub Issue 作成は別途 `auto-create-issue.sh` Hook または手動で実施すること
