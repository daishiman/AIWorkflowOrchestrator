# 未タスク検出レポート

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| タスクID | TASK-UI-03-AGENT-VIEW-ENHANCEMENT |
| Phase    | 12                                |
| 作成日   | 2026-03-07                        |

---

## 検出結果サマリー

| ソース            | 検出数                |
| ----------------- | --------------------- |
| Phase 10 レビュー | 4件                   |
| Phase 11 発見課題 | 1件                   |
| アクセシビリティ  | 0件（Phase 10に含む） |
| コードベース      | 0件                   |
| **合計**          | **5件**               |

---

## 検出タスク一覧

### 1. UT-UI-03-A11Y-RADIOGROUP-001

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 未タスクID | UT-UI-03-A11Y-RADIOGROUP-001                                                                       |
| ソース     | Phase 10 最終レビュー MINOR #1                                                                     |
| 重要度     | MINOR                                                                                              |
| 指摘内容   | SkillChip群コンテナに `role="radiogroup"` + `aria-label` が未設定                                  |
| 対応方針   | AgentView index.tsx でSkillChipを囲むdivに `role="radiogroup"` と `aria-label="ツール選択"` を追加 |
| 影響範囲   | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                              |
| 指示書     | `docs/30-workflows/unassigned-task/task-ut-ui-03-a11y-radiogroup-001.md`                           |

### 2. UT-UI-03-A11Y-DIALOG-001

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 未タスクID | UT-UI-03-A11Y-DIALOG-001                                                                 |
| ソース     | Phase 10 最終レビュー MINOR #2                                                           |
| 重要度     | MINOR                                                                                    |
| 指摘内容   | AdvancedSettingsPanel に `role="dialog"` + `aria-modal="true"` が未設定                  |
| 対応方針   | パネルルートdivに `role="dialog"` + `aria-modal="true"` + `aria-label="詳細設定"` を追加 |
| 影響範囲   | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`     |
| 指示書     | `docs/30-workflows/unassigned-task/task-ut-ui-03-a11y-dialog-001.md`                     |

### 3. UT-UI-03-A11Y-LABEL-001

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 未タスクID | UT-UI-03-A11Y-LABEL-001                                                             |
| ソース     | Phase 10 最終レビュー MINOR #3                                                      |
| 重要度     | MINOR                                                                               |
| 指摘内容   | FloatingExecutionBar の停止ボタン `aria-label` が「停止」（仕様は「実行を停止」）   |
| 対応方針   | `aria-label="停止"` を `aria-label="実行を停止"` に修正                             |
| 影響範囲   | `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx` |
| 指示書     | `docs/30-workflows/unassigned-task/task-ut-ui-03-a11y-label-001.md`                 |

### 4. UT-UI-03-TYPE-ASSERTION-001

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 未タスクID | UT-UI-03-TYPE-ASSERTION-001                                                                                             |
| ソース     | Phase 10 最終レビュー MINOR #4                                                                                          |
| 重要度     | MINOR                                                                                                                   |
| 指摘内容   | `as unknown as Skill[]` 型アサーション2箇所（P24派生）                                                                  |
| 対応方針   | `importedSkills` と `availableSkillsMetadata` の型定義統一後に解消。`@repo/shared` と `preload/types.ts` の型統合が前提 |
| 影響範囲   | `apps/desktop/src/renderer/views/AgentView/index.tsx` L197, L200                                                        |
| 指示書     | `docs/30-workflows/unassigned-task/task-ut-ui-03-type-assertion-001.md`                                                 |

---

### 5. UT-UI-03-PHASE11-SCREENSHOT-COVERAGE-001

| 項目       | 内容                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| 未タスクID | UT-UI-03-PHASE11-SCREENSHOT-COVERAGE-001                                                                     |
| ソース     | Phase 11 画面証跡カバレッジ検証（2026-03-07 再検証）                                                         |
| 重要度     | 中                                                                                                           |
| 指摘内容   | `validate-phase11-screenshot-coverage` で TC-02/03/04/05/07/10 の証跡行不足を検出                            |
| 対応方針   | `manual-test-result.md` に対象TC行を追補し、視覚証跡または `NON_VISUAL:` 形式で根拠を明記して再検証する      |
| 影響範囲   | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/manual-test-result.md` |
| 指示書     | `docs/30-workflows/unassigned-task/task-ut-ui-03-phase11-screenshot-coverage-001.md`                         |

## 3ステップ完了確認

| ステップ | 内容                                              | 完了     |
| -------- | ------------------------------------------------- | -------- |
| 1        | `docs/30-workflows/unassigned-task/` に指示書作成 | 実施済み |
| 2        | `task-workflow.md` 残課題テーブルに登録           | 実施済み |
| 3        | 関連仕様書に参照リンク追加                        | 実施済み |
